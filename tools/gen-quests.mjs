// Genera config/ftbquests/quests/ (FTB Quests 2001.4.x, formato de datos 13) desde tools/quests/chapters/*.mjs
// Uso:  node tools/build-id-index.mjs   (una vez, o cuando cambien los mods)
//       node tools/gen-quests.mjs
//
// - Los IDs (16 hex) salen de un hash de la clave del capítulo/misión: regenerar NO cambia IDs ni pierde progreso.
// - Esta versión de FTB Quests (2001.4.22) guarda título, subtítulo y descripción DENTRO de cada capítulo/misión (no usa archivos lang).
// - Valida que objetos, entidades, logros, estructuras y biomas existan en el pack y que las dependencias existan.
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outRoot = join(here, "..", "config", "ftbquests", "quests");
const chaptersDir = join(here, "quests", "chapters");

// ---- validación ---------------------------------------------------------------------------------------------
const idsFile = join(here, ".ids.json");
if (!existsSync(idsFile)) { console.error("Falta tools/.ids.json: ejecuta node tools/build-id-index.mjs"); process.exit(1); }
const raw = JSON.parse(readFileSync(idsFile, "utf8"));
const known = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, new Set(v)]));
const problems = [];
const check = (kind, id, where) => { if (!known[kind].has(id)) problems.push(`${where}: ${kind.slice(0, -1)} desconocido "${id}"`); };

// ---- SNBT ---------------------------------------------------------------------------------------------------
const q = (s) => '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, " ") + '"';
const ser = (v, depth = 0) => {
  const pad = "\t".repeat(depth + 1), end = "\t".repeat(depth);
  if (v === null || v === undefined) return "null";
  if (typeof v === "string") return q(v);
  if (typeof v === "boolean") return String(v);
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(v) + "d";
  if (v.__long !== undefined) return `${v.__long}L`;
  if (v.__double !== undefined) return `${v.__double}d`;
  if (Array.isArray(v)) {
    if (v.length === 0) return "[ ]";
    if (v.every((x) => typeof x === "string")) return v.length > 1 && v.join("").length > 60 ? `[\n${v.map((x) => pad + q(x)).join("\n")}\n${end}]` : `[${v.map(q).join(", ")}]`;
    return `[\n${v.map((x) => pad + ser(x, depth + 1)).join("\n")}\n${end}]`;
  }
  const entries = Object.entries(v).filter(([k]) => !k.startsWith("_"));
  return `{\n${entries.map(([k, x]) => `${pad}${k}: ${ser(x, depth + 1)}`).join("\n")}\n${end}}`;
};
const hid = (key) => createHash("sha1").update(key).digest("hex").slice(0, 16).toUpperCase();

// ---- carga de capítulos -------------------------------------------------------------------------------------
const files = readdirSync(chaptersDir).filter((f) => f.endsWith(".mjs")).sort();
const chapters = [];
for (const f of files) chapters.push(...[].concat((await import(pathToFileURL(join(chaptersDir, f)).href)).default));
chapters.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const GROUPS = { campana: "Campaña", ramas: "Ramas", ascension: "Ascensión" };
const lang = {};
const chapterFiles = {};
const questIndex = {}; // "cap.key" -> id
for (const ch of chapters) for (const qu of ch.quests) {
  const ref = `${ch.key}.${qu.k}`;
  if (questIndex[ref]) problems.push(`${ref}: clave de misión repetida`);
  questIndex[ref] = hid(`quest:${ref}`);
}

// icono de la misión: explícito (ic) > primer objeto de una tarea > por tipo de tarea > icono del capítulo
const TYPE_ICON = { kill: "minecraft:iron_sword", stat: "minecraft:clock", structure: "minecraft:compass", biome: "minecraft:map",
  advancement: "minecraft:writable_book", dimension: "minecraft:ender_eye", stage: "minecraft:nether_star" };
const questIcon = (qu, ch) => {
  if (qu.ic) return qu.ic;
  const t = (qu.tasks || []);
  const item = t.find((x) => x._item);
  if (item) return item._item;
  const other = t.find((x) => TYPE_ICON[x.type]);
  if (other) return TYPE_ICON[other.type];
  return ch.icon;
};
// párrafos separados por una línea en blanco
const paragraphs = (d) => (d || []).flatMap((p, i) => (i ? ["", p] : [p]));

chapters.forEach((ch, ci) => {
  const chId = hid(`chapter:${ch.key}`);
  // maquetación automática: capa = camino más largo de dependencias; fila = orden de aparición en la capa
  const layer = {};
  const byKey = Object.fromEntries(ch.quests.map((x) => [x.k, x]));
  const depth = (k, seen = new Set()) => {
    if (layer[k] !== undefined) return layer[k];
    if (seen.has(k)) { problems.push(`${ch.key}.${k}: dependencias circulares`); return 0; }
    seen.add(k);
    const qu = byKey[k];
    const local = (qu.deps || []).filter((d) => !d.includes("."));
    layer[k] = local.length ? Math.max(...local.map((d) => (byKey[d] ? depth(d, seen) : 0))) + 1 : 0;
    return layer[k];
  };
  ch.quests.forEach((qu) => depth(qu.k));
  const rows = {};
  const quests = ch.quests.map((qu) => {
    const where = `${ch.key}.${qu.k}`;
    const id = questIndex[where];
    const lay = layer[qu.k];
    rows[lay] = rows[lay] ?? 0;
    const x = qu.at ? qu.at[0] : lay * 1.5 + 0.5;
    const y = qu.at ? qu.at[1] : rows[lay] * 1.5 + 0.5;
    rows[lay]++;
    check("items", questIcon(qu, ch), `${where} icono`);
    const tasks = (qu.tasks || []).map((t, i) => {
      if (t._item) check("items", t._item, `${where} tarea`);
      if (t._entity) check("entities", t._entity, `${where} tarea`);
      if (t._adv) check("advancements", t._adv, `${where} tarea`);
      if (t._structure) check("structures", t._structure, `${where} tarea`);
      if (t._biome) check("biomes", t._biome, `${where} tarea`);
      return { id: hid(`task:${where}:${i}`), ...t };
    });
    const rewards = (qu.rewards || []).flat().map((r, i) => {
      if (r._item) check("items", r._item, `${where} premio`);
      return { id: hid(`reward:${where}:${i}`), ...r };
    });
    const deps = (qu.deps || []).map((d) => {
      const ref = d.includes(".") ? d : `${ch.key}.${d}`;
      if (!questIndex[ref]) problems.push(`${where}: dependencia desconocida "${d}"`);
      return questIndex[ref];
    }).filter(Boolean);
    return {
      id, title: qu.t, ...(qu.sub ? { subtitle: qu.sub } : {}), ...(qu.d && qu.d.length ? { description: paragraphs(qu.d) } : {}),
      icon: questIcon(qu, ch), x: { __double: x }, y: { __double: y },
      ...(qu.shape ? { shape: qu.shape } : {}), ...(qu.size ? { size: { __double: qu.size } } : {}),
      ...(qu.opt ? { optional: true } : {}), ...(qu.any ? { dependency_requirement: "one_completed" } : {}),
      ...(deps.length ? { dependencies: deps } : {}),
      tasks, ...(rewards.length ? { rewards } : {}),
    };
  });
  chapterFiles[ch.key] = {
    default_hide_dependency_lines: false, default_quest_shape: "",
    filename: ch.key, group: hid(`group:${ch.group}`), title: ch.title, ...(ch.sub ? { subtitle: [ch.sub] } : {}),
    icon: ch.icon, id: chId, order_index: ci, quest_links: [], quests,
  };
  check("items", ch.icon, `capítulo ${ch.key} icono`);
});

if (problems.length) { console.error(problems.join("\n")); console.error(`\n${problems.length} problema(s): no se escribe nada.`); process.exit(1); }

// ---- escritura ----------------------------------------------------------------------------------------------
rmSync(outRoot, { recursive: true, force: true });
mkdirSync(join(outRoot, "chapters"), { recursive: true });
const w = (rel, text) => writeFileSync(join(outRoot, rel), text);
w("data.snbt", ser({
  default_autoclaim_rewards: "disabled", default_consume_items: false, default_quest_disable_jei: false, default_quest_shape: "circle",
  default_reward_team: false, detection_delay: 20, disable_gui: false, drop_loot_crates: false, emergency_items_cooldown: 300,
  fallback_locale: "en_us", grid_scale: { __double: 0.5 }, lock_message: "",
  loot_crate_no_drop: { boss: 0, monster: 600, passive: 4000 }, pause_game: false, progression_mode: "flexible", version: 13,
}) + "\n");
w("chapter_groups.snbt", ser({ chapter_groups: Object.entries(GROUPS).map(([g, title]) => ({ id: hid(`group:${g}`), title })) }) + "\n");
for (const [k, c] of Object.entries(chapterFiles)) w(`chapters/${k}.snbt`, ser(c) + "\n");

const total = chapters.reduce((s, c) => s + c.quests.length, 0);
console.log(`${chapters.length} capítulos, ${total} misiones -> ${outRoot}`);
for (const ch of chapters) console.log(`  ${String(ch.order ?? 0).padStart(2)}  ${ch.key.padEnd(20)} ${String(ch.quests.length).padStart(3)} misiones`);
