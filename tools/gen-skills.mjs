// Genera config/puffish_skills/ (Pufferfish's Skills 0.19.x, config version 3) a partir de las tablas de abajo.
// Uso:  node tools/gen-skills.mjs
//
// Decisión S1: nivel y puntos son POR CATEGORÍA en Pufferfish. Para combinar clases con un único pool de puntos
// y un nivel 1–100, todas las clases viven en UNA categoría ("habilidades"). Los oficios son categorías propias
// (su nivel sube con las tareas del oficio) y la Ascensión tiene una categoría por clase (puntos por misiones).
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "config", "puffish_skills");
rmSync(root, { recursive: true, force: true });
const out = (rel, data) => {
  const f = join(root, rel);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify(data, null, "\t") + "\n");
};

// ---- atributos: id, nombre en español y cómo se muestra ("flat" = +N, "pct" = +N%) ----------------------
const ATTR = {
  hp:    ["generic.max_health", "Vida máxima", "flat"],
  dmg:   ["generic.attack_damage", "Daño de ataque", "flat"],
  arm:   ["generic.armor", "Armadura", "flat"],
  tgh:   ["generic.armor_toughness", "Dureza de armadura", "flat"],
  aspd:  ["generic.attack_speed", "Velocidad de ataque", "flat"],
  move:  ["generic.movement_speed", "Velocidad de movimiento", "pct"],
  kbr:   ["generic.knockback_resistance", "Resistencia al empuje", "pct"],
  luck:  ["generic.luck", "Suerte", "flat"],
  crit:  ["attributeslib:crit_chance", "Probabilidad de crítico", "pct"],
  critd: ["attributeslib:crit_damage", "Daño crítico", "pct"],
  life:  ["attributeslib:life_steal", "Robo de vida", "pct"],
  dodge: ["attributeslib:dodge_chance", "Esquiva", "pct"],
  pierce:["attributeslib:armor_pierce", "Perforación de armadura", "flat"],
  chp:   ["attributeslib:current_hp_damage", "Daño según vida del objetivo", "pct"],
  admg:  ["attributeslib:arrow_damage", "Daño de flecha", "pct"],
  avel:  ["attributeslib:arrow_velocity", "Velocidad de flecha", "pct"],
  draw:  ["attributeslib:draw_speed", "Velocidad de tensado", "pct"],
  mine:  ["attributeslib:mining_speed", "Velocidad de minado", "pct"],
  xpg:   ["attributeslib:experience_gained", "Experiencia ganada", "pct"],
  heal:  ["attributeslib:healing_received", "Curación recibida", "pct"],
  over:  ["attributeslib:overheal", "Sobrecuración", "pct"],
  mana:  ["irons_spellbooks:max_mana", "Maná máximo", "flat"],
  mregen:["irons_spellbooks:mana_regen", "Regeneración de maná", "mul"],
  spower:["irons_spellbooks:spell_power", "Poder de hechizo", "mul"],
  cdr:   ["irons_spellbooks:cooldown_reduction", "Reducción de enfriamiento", "mul"],
  cast:  ["irons_spellbooks:cast_time_reduction", "Reducción de tiempo de lanzamiento", "mul"],
  sres:  ["irons_spellbooks:spell_resist", "Resistencia a hechizos", "mul"],
  fire:  ["irons_spellbooks:fire_spell_power", "Poder de fuego", "mul"],
  ice:   ["irons_spellbooks:ice_spell_power", "Poder de hielo", "mul"],
  holy:  ["irons_spellbooks:holy_spell_power", "Poder sagrado", "mul"],
  evoc:  ["irons_spellbooks:evocation_spell_power", "Poder de evocación", "mul"],
  ender: ["irons_spellbooks:ender_spell_power", "Poder del vacío", "mul"],
  blood: ["irons_spellbooks:blood_spell_power", "Poder de sangre", "mul"],
  eldr:  ["irons_spellbooks:eldritch_spell_power", "Poder ancestral", "mul"],
  swim:  ["forge:swim_speed", "Velocidad de nado", "pct"],
};
const num = (v) => String(Number(v.toFixed(3)));
// mode "asc" (Ascensión): las estadísticas planas de ASC_MUL pasan a bonos porcentuales (multiply_base)
const ASC_MUL = new Set(["hp", "dmg", "arm", "tgh", "aspd", "mana"]);
const isMul = (key, mode) => ATTR[key][2] === "mul" || (mode === "asc" && ASC_MUL.has(key));
const fmt = (key, v, mode) => {
  const [, name, kind] = ATTR[key];
  return kind === "flat" && !isMul(key, mode) ? `+${num(v)} ${name}` : `+${num(v * 100)}% ${name}`;
};
const reward = (key, v, mode) => {
  const [attribute] = ATTR[key];
  return { type: "puffish_skills:attribute", data: { attribute, value: Number(v.toFixed(3)), operation: isMul(key, mode) ? "multiply_base" : "addition" } };
};

// ---- clases -----------------------------------------------------------------------------------------
// stats: [clave, valor por nodo normal]. Los nodos "notables" (3, 6, 9) dan el doble del stat principal + un stat extra.
// cap: cima del camino (3 stats). icons: se reparten por los 10 nodos. spurs: nodos laterales pequeños.
const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const classes = [
  {
    id: "guerrero", name: "Guerrero", icon: "minecraft:iron_sword",
    trunk: { icons: ["minecraft:apple", "minecraft:iron_sword", "minecraft:iron_chestplate", "minecraft:golden_apple", "minecraft:shield", "minecraft:diamond_sword"],
             stats: [["hp", 2], ["dmg", 0.5], ["arm", 1]], notables: ["Temple de acero", "Voluntad de guerrero"] },
    lanes: [
      { id: "baluarte", name: "Baluarte", icons: ["minecraft:iron_chestplate", "minecraft:shield", "minecraft:iron_helmet", "minecraft:chainmail_chestplate", "minecraft:iron_leggings"],
        stats: [["arm", 1], ["hp", 2], ["tgh", 0.5]], notables: ["Muro de escudos", "Coloso", "Inquebrantable"],
        cap: { title: "Titán", icon: "minecraft:netherite_chestplate", stats: [["hp", 6], ["arm", 2], ["tgh", 1]], lore: "Cima del Baluarte: el muro que no cae." },
        spurs: [["kbr", 0.05], ["hp", 2], ["kbr", 0.05]] },
      { id: "berserker", name: "Berserker", icons: ["minecraft:iron_axe", "minecraft:redstone", "minecraft:blaze_powder", "minecraft:iron_sword", "minecraft:flint"],
        stats: [["dmg", 0.5], ["crit", 0.02], ["aspd", 0.05]], notables: ["Furia", "Frenesí", "Carnicero"],
        cap: { title: "Señor de la guerra", icon: "minecraft:netherite_axe", stats: [["dmg", 1.5], ["critd", 0.2], ["life", 0.03]], lore: "Cima del Berserker: cada golpe cuenta." },
        spurs: [["hp", 2], ["crit", 0.01], ["hp", 2]] },
      { id: "paladin", name: "Paladín", icons: ["minecraft:golden_apple", "minecraft:glistering_melon_slice", "minecraft:golden_chestplate", "minecraft:totem_of_undying", "minecraft:golden_sword"],
        stats: [["heal", 0.03], ["hp", 2], ["over", 0.02]], notables: ["Bendición", "Juramento", "Égida"],
        cap: { title: "Paladín eterno", icon: "minecraft:enchanted_golden_apple", stats: [["hp", 4], ["heal", 0.1], ["life", 0.03]], lore: "Cima del Paladín: la luz que sostiene al grupo." },
        spurs: [["arm", 1], ["hp", 2], ["arm", 1]] },
    ],
  },
  {
    id: "arquero", name: "Arquero", icon: "minecraft:bow",
    trunk: { icons: ["minecraft:arrow", "minecraft:leather_boots", "minecraft:bow", "minecraft:feather", "minecraft:crossbow", "minecraft:spyglass"],
             stats: [["admg", 0.02], ["move", 0.01], ["draw", 0.03]], notables: ["Pulso firme", "Ojo entrenado"] },
    lanes: [
      { id: "francotirador", name: "Francotirador", icons: ["minecraft:spectral_arrow", "minecraft:spyglass", "minecraft:tipped_arrow", "minecraft:target", "minecraft:arrow"],
        stats: [["admg", 0.03], ["crit", 0.02], ["avel", 0.05]], notables: ["Ojo de águila", "Disparo perforante", "Tiro mortal"],
        cap: { title: "Ojo del cazador", icon: "minecraft:target", stats: [["admg", 0.12], ["critd", 0.2], ["avel", 0.2]], lore: "Cima del Francotirador: un tiro, una baja." },
        spurs: [["hp", 2], ["crit", 0.01], ["hp", 2]] },
      { id: "explorador", name: "Explorador", icons: ["minecraft:leather_boots", "minecraft:compass", "minecraft:rabbit_foot", "minecraft:oak_sapling", "minecraft:map"],
        stats: [["move", 0.02], ["dodge", 0.015], ["luck", 0.3]], notables: ["Rastreador", "Pies de viento", "Sentido del bosque"],
        cap: { title: "Espíritu del bosque", icon: "minecraft:rabbit_foot", stats: [["move", 0.06], ["dodge", 0.05], ["luck", 1]], lore: "Cima del Explorador: nadie te alcanza." },
        spurs: [["hp", 2], ["arm", 1], ["hp", 2]] },
      { id: "tirador", name: "Tirador veloz", icons: ["minecraft:crossbow", "minecraft:bow", "minecraft:string", "minecraft:flint", "minecraft:arrow"],
        stats: [["draw", 0.04], ["avel", 0.05], ["hp", 1]], notables: ["Recarga rápida", "Cadencia", "Ráfaga"],
        cap: { title: "Lluvia de flechas", icon: "minecraft:tipped_arrow", stats: [["draw", 0.15], ["admg", 0.1], ["crit", 0.05]], lore: "Cima del Tirador veloz: el cielo se llena de flechas." },
        spurs: [["hp", 2], ["move", 0.01], ["hp", 2]] },
    ],
  },
  {
    id: "mago", name: "Mago", icon: "minecraft:enchanted_book",
    trunk: { icons: ["minecraft:lapis_lazuli", "minecraft:amethyst_shard", "minecraft:clock", "minecraft:lapis_block", "minecraft:book", "minecraft:enchanted_book"],
             stats: [["mana", 25], ["spower", 0.01], ["cdr", 0.01]], notables: ["Mente despierta", "Canal arcano"] },
    lanes: [
      { id: "piromancia", name: "Piromancia", icons: ["minecraft:blaze_powder", "minecraft:fire_charge", "minecraft:magma_cream", "minecraft:blaze_rod", "minecraft:lava_bucket"],
        stats: [["fire", 0.03], ["mana", 25], ["cast", 0.02]], notables: ["Llama viva", "Combustión", "Infierno"],
        cap: { title: "Archipiromante", icon: "minecraft:lava_bucket", stats: [["fire", 0.15], ["mana", 100], ["cdr", 0.05]], lore: "Cima de la Piromancia: el fuego te obedece." },
        spurs: [["mana", 25], ["hp", 2], ["mana", 25]] },
      { id: "criomancia", name: "Criomancia", icons: ["minecraft:snowball", "minecraft:packed_ice", "minecraft:blue_ice", "minecraft:powder_snow_bucket", "minecraft:prismarine_shard"],
        stats: [["ice", 0.03], ["mana", 25], ["sres", 0.02]], notables: ["Escarcha", "Ventisca", "Cero absoluto"],
        cap: { title: "Señor del hielo", icon: "minecraft:blue_ice", stats: [["ice", 0.15], ["mana", 100], ["sres", 0.05]], lore: "Cima de la Criomancia: el invierno eterno." },
        spurs: [["mana", 25], ["hp", 2], ["mana", 25]] },
      { id: "arcanismo", name: "Arcanismo", icons: ["minecraft:amethyst_cluster", "minecraft:nether_star", "minecraft:experience_bottle", "minecraft:glowstone_dust", "minecraft:end_crystal"],
        stats: [["evoc", 0.03], ["holy", 0.03], ["cdr", 0.02]], notables: ["Runa", "Sabiduría arcana", "Canalizar"],
        cap: { title: "Archimago", icon: "minecraft:end_crystal", stats: [["evoc", 0.1], ["holy", 0.1], ["mregen", 0.15]], lore: "Cima del Arcanismo: escudos, curación y magia pura." },
        spurs: [["mana", 25], ["mregen", 0.05], ["mana", 25]] },
      { id: "oscuridad", name: "Oscuridad", icons: ["minecraft:ender_pearl", "minecraft:fermented_spider_eye", "minecraft:echo_shard", "minecraft:ender_eye", "minecraft:sculk_catalyst"],
        stats: [["ender", 0.03], ["blood", 0.03], ["eldr", 0.03]], notables: ["Vacío", "Pacto de sangre", "Locura"],
        cap: { title: "Señor de las sombras", icon: "minecraft:dragon_egg", stats: [["ender", 0.1], ["blood", 0.1], ["eldr", 0.1]], lore: "Cima de la Oscuridad: poder a cualquier precio." },
        spurs: [["mana", 25], ["hp", 2], ["mana", 25]] },
    ],
  },
  {
    id: "ingeniero", name: "Ingeniero", icon: "minecraft:iron_pickaxe",
    trunk: { icons: ["minecraft:iron_pickaxe", "minecraft:apple", "minecraft:redstone", "minecraft:leather_helmet", "minecraft:piston", "minecraft:repeater"],
             stats: [["mine", 0.03], ["hp", 2], ["xpg", 0.02]], notables: ["Manos de obrero", "Cabeza fría"] },
    lanes: [
      { id: "minero", name: "Minero", icons: ["minecraft:iron_pickaxe", "minecraft:raw_iron", "minecraft:gold_ingot", "minecraft:diamond_pickaxe", "minecraft:tnt"],
        stats: [["mine", 0.04], ["luck", 0.3], ["hp", 1]], notables: ["Veta rica", "Manos de piedra", "Corazón de la montaña"],
        cap: { title: "Maestro minero", icon: "minecraft:netherite_pickaxe", stats: [["mine", 0.2], ["luck", 1.5], ["hp", 4]], lore: "Cima del Minero: la roca se aparta." },
        spurs: [["hp", 2], ["luck", 0.3], ["hp", 2]] },
      { id: "inventor", name: "Inventor", icons: ["minecraft:redstone", "minecraft:comparator", "minecraft:clock", "minecraft:experience_bottle", "minecraft:observer"],
        stats: [["xpg", 0.03], ["luck", 0.3], ["aspd", 0.03]], notables: ["Ojo de artesano", "Mente brillante", "Idea genial"],
        cap: { title: "Inventor", icon: "minecraft:enchanted_book", stats: [["xpg", 0.2], ["luck", 1], ["aspd", 0.1]], lore: "Cima del Inventor: todo problema tiene solución." },
        spurs: [["hp", 2], ["xpg", 0.02], ["hp", 2]] },
      { id: "zapador", name: "Zapador", icons: ["minecraft:iron_helmet", "minecraft:iron_boots", "minecraft:leather_leggings", "minecraft:lantern", "minecraft:shield"],
        stats: [["hp", 2], ["arm", 1], ["move", 0.02]], notables: ["Espeleólogo", "Pies firmes", "Casco de minero"],
        cap: { title: "Zapador", icon: "minecraft:netherite_helmet", stats: [["hp", 6], ["arm", 2], ["move", 0.05]], lore: "Cima del Zapador: bajo tierra eres inmune al miedo." },
        spurs: [["mine", 0.02], ["hp", 2], ["mine", 0.02]] },
    ],
  },
  {
    id: "asesino", name: "Asesino", icon: "minecraft:iron_axe",
    trunk: { icons: ["minecraft:iron_axe", "minecraft:sugar", "minecraft:leather_boots", "minecraft:flint", "minecraft:iron_sword", "minecraft:black_dye"],
             stats: [["dmg", 0.5], ["aspd", 0.03], ["move", 0.01]], notables: ["Filo afilado", "Instinto"] },
    lanes: [
      { id: "sombra", name: "Sombra", icons: ["minecraft:black_dye", "minecraft:ink_sac", "minecraft:phantom_membrane", "minecraft:leather_boots", "minecraft:rabbit_foot"],
        stats: [["dodge", 0.02], ["move", 0.02], ["crit", 0.02]], notables: ["Paso silencioso", "Velo", "Desvanecer"],
        cap: { title: "Fantasma", icon: "minecraft:phantom_membrane", stats: [["dodge", 0.08], ["move", 0.06], ["crit", 0.06]], lore: "Cima de la Sombra: no te ven, no te tocan." },
        spurs: [["hp", 2], ["dodge", 0.01], ["hp", 2]] },
      { id: "duelista", name: "Duelista", icons: ["minecraft:iron_sword", "minecraft:sugar", "minecraft:iron_nugget", "minecraft:diamond_sword", "minecraft:blaze_rod"],
        stats: [["aspd", 0.05], ["dmg", 0.5], ["pierce", 1]], notables: ["Estocada", "Contragolpe", "Danza de espadas"],
        cap: { title: "Maestro de esgrima", icon: "minecraft:netherite_sword", stats: [["aspd", 0.2], ["dmg", 1.5], ["pierce", 3]], lore: "Cima del Duelista: la espada más rápida." },
        spurs: [["hp", 2], ["arm", 1], ["hp", 2]] },
      { id: "verdugo", name: "Verdugo", icons: ["minecraft:netherite_axe", "minecraft:spider_eye", "minecraft:redstone", "minecraft:iron_axe", "minecraft:wither_skeleton_skull"],
        stats: [["critd", 0.08], ["life", 0.01], ["chp", 0.01]], notables: ["Golpe letal", "Sed", "Ejecución"],
        cap: { title: "Verdugo", icon: "minecraft:wither_skeleton_skull", stats: [["critd", 0.3], ["life", 0.04], ["chp", 0.05]], lore: "Cima del Verdugo: el final de todo enemigo." },
        spurs: [["hp", 2], ["life", 0.01], ["hp", 2]] },
    ],
  },
];


// ---- constructor de categorías -------------------------------------------------------------------------
const TRUNK_STEP = 44, LANE_STEP = 44, LANE_GAP = 120, BAND_GAP = 620, SPUR = 38;
const BG = (n) => `minecraft:textures/gui/advancements/backgrounds/${n}.png`;

const makeBuilder = (mode) => {
  const defs = {}, skills = {}, conns = [];
  return {
    defs, skills, conns,
    // tooltip = nombre del camino (dorado) + una línea verde por bonificación + texto extra (gris)
    node({ id, title, path, icon, frame, stats, lore, x, y, root = false, requiredSpent = 0, stage }) {
      const parts = [{ text: path + "\n", color: "gold" }];
      const lines = stats.map(([k, v]) => fmt(k, v, mode));
      const extra = [lore, stage && stage.text].filter(Boolean);
      lines.forEach((t, i) => parts.push({ text: t + (i < lines.length - 1 || extra.length ? "\n" : ""), color: "green" }));
      extra.forEach((t, i) => parts.push({ text: t + (i < extra.length - 1 ? "\n" : ""), color: "gray", italic: true }));
      const rewards = stats.map(([k, v]) => reward(k, v, mode));
      if (stage) rewards.push({ type: "puffish_skills:command", data: { unlock_command: `kubejs stages add @s ${stage.id}`, lock_command: `kubejs stages remove @s ${stage.id}` } });
      defs[id] = {
        title, description: parts, icon: { type: "item", data: { item: icon } }, frame, rewards,
        ...(requiredSpent ? { required_spent_points: requiredSpent } : {}),
      };
      skills[id] = { x: Math.round(x), y: Math.round(y), definition: id, ...(root ? { root: true } : {}) };
    },
    link: (a, b) => conns.push([a, b]),
  };
};

// Una "banda": tronco común (Fundamentos) que se bifurca en caminos. opts: { trunkN, laneN, capSpent, prefix }
function buildBand(b, y0, cls, opts) {
  const { trunkN, laneN, capSpent, prefix = "" } = opts;
  const stages = cls.stages || {};
  const spurAt = laneN >= 10 ? [2, 5, 8] : [2, 5, 7];
  let prev = null;
  for (let k = 1; k <= trunkN; k++) {
    const id = `${cls.id}_f${k}`;
    const notable = k % 3 === 0;
    const ts = cls.trunk.stats;
    const stats = notable ? [[ts[0][0], ts[0][1] * 2], ts[(k / 3) % ts.length]] : [ts[(k - 1) % ts.length]];
    b.node({
      id, x: (k - 1) * TRUNK_STEP, y: y0, root: k === 1, frame: notable ? "goal" : "task",
      title: notable ? cls.trunk.notables[k / 3 - 1] : `${cls.name} · Fundamentos ${roman[k - 1]}`,
      path: `${prefix}${cls.name} › Fundamentos`, icon: cls.trunk.icons[k - 1], stats, stage: stages[id],
    });
    if (prev) b.link(prev, id);
    prev = id;
    if (k === 2 || k === 5) {
      const sid = `${id}s`;
      b.node({ id: sid, x: (k - 1) * TRUNK_STEP, y: y0 + (k === 2 ? -SPUR : SPUR), frame: "task", title: `${cls.name} · Soporte`, path: `${prefix}${cls.name} › Fundamentos`, icon: cls.trunk.icons[k - 1], stats: [ts[(k + 1) % ts.length]] });
      b.link(id, sid);
    }
  }
  const fork = prev, laneX0 = (trunkN - 1) * TRUNK_STEP + 56;
  cls.lanes.forEach((lane, li) => {
    const ly = y0 + (li - (cls.lanes.length - 1) / 2) * LANE_GAP;
    const path = `${prefix}${cls.name} › ${lane.name}`;
    let p = fork;
    for (let k = 1; k <= laneN; k++) {
      const id = `${cls.id}_${lane.id}_${k}`, x = laneX0 + (k - 1) * LANE_STEP;
      const isCap = k === laneN, notable = !isCap && k % 3 === 0;
      const ls = lane.stats, icon = lane.icons[(k - 1) % lane.icons.length];
      if (isCap) b.node({ id, x, y: ly, frame: "challenge", title: lane.cap.title, path, icon: lane.cap.icon, stats: lane.cap.stats, lore: lane.cap.lore, requiredSpent: capSpent, stage: stages[id] });
      else if (notable) b.node({ id, x, y: ly, frame: "goal", title: lane.notables[k / 3 - 1], path, icon, stats: [[ls[0][0], ls[0][1] * 2], ls[(k / 3) % ls.length]] });
      else b.node({ id, x, y: ly, frame: "task", title: `${lane.name} ${roman[k - 1]}`, path, icon, stats: [ls[(k - 1) % ls.length]] });
      b.link(p, id);
      p = id;
      const si = spurAt.indexOf(k);
      if (si >= 0) {
        const sid = `${cls.id}_${lane.id}_s${si + 1}`;
        const sp = lane.spurs || ls;
        b.node({ id: sid, x, y: ly + (si % 2 === 0 ? -SPUR : SPUR), frame: "task", title: `${lane.name} · Apoyo`, path, icon: lane.icons[(k + 1) % lane.icons.length], stats: [sp[si % sp.length]] });
        b.link(id, sid);
      }
    }
  });
}

// ---- escritura de una categoría ------------------------------------------------------------------------
const categoryIds = [];
const writeCategory = (id, b, category, experience) => {
  categoryIds.push(id);
  const dir = `categories/${id}/`;
  out(dir + "category.json", category);
  out(dir + "definitions.json", b.defs);
  out(dir + "skills.json", b.skills);
  out(dir + "connections.json", { normal: { bidirectional: b.conns } });
  if (experience) out(dir + "experience.json", experience);
  console.log(`${id}: ${Object.keys(b.skills).length} nodos`);
};
const itemIcon = (item) => ({ type: "item", data: { item } });

// ============================================================================================================
// 1) HABILIDADES: nivel global 1–100, puntos compartidos, todas las clases
// ============================================================================================================
{
  const b = makeBuilder("normal");
  // Stages de clase (los usa kubejs/server_scripts/class_gating.js): I = raíz, II = Fundamentos VI, III = cimas de camino
  const classStages = (cls) => ({
    [`${cls.id}_f1`]: { id: `clase_${cls.id}`, text: `Equipo de ${cls.name}: Tier I` },
    [`${cls.id}_f6`]: { id: `maestria_${cls.id}_2`, text: `Equipo de ${cls.name}: Tier II` },
    ...Object.fromEntries(cls.lanes.map((l) => [`${cls.id}_${l.id}_10`, { id: `maestria_${cls.id}_3`, text: `Equipo de ${cls.name}: Tier III` }])),
  });
  classes.forEach((cls, ci) => buildBand(b, ci * BAND_GAP, { ...cls, stages: classStages(cls) }, { trunkN: 6, laneN: 10, capSpent: 30 }));
  writeCategory("habilidades", b, {
    title: "Habilidades",
    description: "Sube de nivel y reparte tus puntos entre las clases. Puedes llenar una a fondo o combinar varias.",
    icon: itemIcon("minecraft:nether_star"), background: BG("stone"), unlocked_by_default: true, exclusive_root: false,
  }, {
    // Curva de docs/03: XP del nivel n al n+1 = 60 + 12n + 0.9n^2 (a calibrar). Misiones/exploración dan XP por comando.
    level_limit: 100,
    experience_per_level: { type: "expression", data: { expression: "60 + 12 * level + 0.9 * level ^ 2" } },
    sources: [
      { type: "puffish_skills:kill_entity", data: {
        variables: {
          max_health: { operations: [{ type: "get_killed_living_entity" }, { type: "get_max_health" }] },
          dropped_xp: { operations: [{ type: "get_dropped_experience" }] },
        },
        experience: "max_health * 1.5 + dropped_xp",
        anti_farming_per_chunk: { limit_per_chunk: 15, reset_after_seconds: 300 },
      } },
      { type: "puffish_skills:mine_block", data: {
        variables: { hardness: { operations: [{ type: "get_mined_block_state" }, { type: "get_block" }, { type: "get_hardness" }] } },
        experience: "1 + hardness",
      } },
    ],
  });
}

// ============================================================================================================
// 2) OFICIOS: una categoría (pestaña) por oficio, con su propio nivel. La XP se gana HACIENDO las tareas
//    del oficio; 1 punto por nivel (nivel máx. 30). Los hitos dan un "stage" de KubeJS para recetas futuras.
// ============================================================================================================
const blockVar = (data) => ({ operations: [{ type: "get_mined_block_state" }, { type: "puffish_skills:test", data }] });
const itemVar = (getter, item) => ({ operations: [{ type: getter }, { type: "puffish_skills:test", data: { item } }] });
const cases = (arr) => arr.map(([condition, expression]) => ({ condition, expression }));
// Sin etiquetas de Forge (varían): objetos cocinados de vanilla, uno a uno
const COOKED = ["cooked_beef", "cooked_porkchop", "cooked_chicken", "cooked_mutton", "cooked_rabbit", "cooked_cod", "cooked_salmon", "baked_potato", "dried_kelp"];
const JOB_XP = { type: "expression", data: { expression: "40 + 10 * level + 0.6 * level ^ 2" } };
const milestones = (id, lanes) => ({
  [`${id}_f6`]: { id: `oficio_${id}_1`, text: "Hito de oficio I (los desbloqueos llegan con KubeJS)" },
  ...Object.fromEntries(lanes.map((l) => [`${id}_${l}_8`, { id: `oficio_${id}_2`, text: "Hito de oficio II" }])),
});

const jobs = [
  {
    id: "minero", name: "Minero", icon: "minecraft:iron_pickaxe", bg: "stone",
    about: "Sube picando minerales y roca.",
    trunk: { icons: ["minecraft:iron_pickaxe", "minecraft:raw_iron", "minecraft:coal", "minecraft:redstone", "minecraft:gold_ingot", "minecraft:diamond_pickaxe"],
             stats: [["mine", 0.03], ["hp", 1], ["luck", 0.2]], notables: ["Pico firme", "Ojo de minero"] },
    lanes: [
      { id: "excavador", name: "Excavador", icons: ["minecraft:iron_pickaxe", "minecraft:tnt", "minecraft:iron_shovel", "minecraft:cobblestone"],
        stats: [["mine", 0.04], ["hp", 1], ["arm", 0.5]], notables: ["Golpe seco", "Veta a la vista"],
        cap: { title: "Maestro excavador", icon: "minecraft:netherite_pickaxe", stats: [["mine", 0.15], ["hp", 4], ["arm", 2]], lore: "Cima del Excavador." } },
      { id: "gemas", name: "Buscador de gemas", icons: ["minecraft:emerald", "minecraft:diamond", "minecraft:lapis_lazuli", "minecraft:amethyst_shard"],
        stats: [["luck", 0.3], ["mine", 0.02], ["xpg", 0.02]], notables: ["Instinto de gema", "Fortuna"],
        cap: { title: "Rey de las gemas", icon: "minecraft:diamond_block", stats: [["luck", 1.5], ["xpg", 0.1], ["mine", 0.08]], lore: "Cima del Buscador de gemas." } },
    ],
    xp: [{ type: "puffish_skills:mine_block", data: {
      variables: { is_ore: blockVar({ block: "#forge:ores" }), is_stone: blockVar({ block: "#minecraft:base_stone_overworld" }) },
      experience: cases([["is_ore", "10"], ["is_stone", "1"]]) } }],
  },
  {
    id: "lenador", name: "Leñador", icon: "minecraft:iron_axe", bg: "adventure",
    about: "Sube talando árboles.",
    trunk: { icons: ["minecraft:iron_axe", "minecraft:oak_log", "minecraft:stripped_oak_log", "minecraft:spruce_log", "minecraft:diamond_axe", "minecraft:apple"],
             stats: [["dmg", 0.3], ["hp", 1], ["move", 0.01]], notables: ["Hacha firme", "Brazos de leñador"] },
    lanes: [
      { id: "robusto", name: "Leñador robusto", icons: ["minecraft:oak_log", "minecraft:iron_chestplate", "minecraft:leather_chestplate", "minecraft:bread"],
        stats: [["hp", 2], ["arm", 0.5], ["kbr", 0.02]], notables: ["Espalda ancha", "Piel de corteza"],
        cap: { title: "Gigante del bosque", icon: "minecraft:dark_oak_log", stats: [["hp", 6], ["arm", 2], ["kbr", 0.1]], lore: "Cima del Leñador robusto." } },
      { id: "talador", name: "Talador", icons: ["minecraft:iron_axe", "minecraft:stick", "minecraft:oak_planks", "minecraft:diamond_axe"],
        stats: [["mine", 0.04], ["dmg", 0.3], ["aspd", 0.03]], notables: ["Tala limpia", "Golpe de hacha"],
        cap: { title: "Maestro talador", icon: "minecraft:netherite_axe", stats: [["mine", 0.15], ["dmg", 1], ["aspd", 0.1]], lore: "Cima del Talador." } },
    ],
    xp: [{ type: "puffish_skills:mine_block", data: {
      variables: { is_log: blockVar({ block: "#minecraft:logs" }) },
      experience: cases([["is_log", "3"]]) } }],
  },
  {
    id: "granjero", name: "Granjero", icon: "minecraft:iron_hoe", bg: "husbandry",
    about: "Sube cosechando cultivos maduros.",
    trunk: { icons: ["minecraft:wheat_seeds", "minecraft:wheat", "minecraft:carrot", "minecraft:potato", "minecraft:hay_block", "minecraft:golden_carrot"],
             stats: [["hp", 1], ["heal", 0.02], ["luck", 0.2]], notables: ["Manos verdes", "Cosecha abundante"] },
    lanes: [
      { id: "cosechador", name: "Cosechador", icons: ["minecraft:wheat", "minecraft:bread", "minecraft:melon_slice", "minecraft:pumpkin"],
        stats: [["heal", 0.03], ["hp", 2], ["xpg", 0.02]], notables: ["Buena cosecha", "Despensa llena"],
        cap: { title: "Señor de la cosecha", icon: "minecraft:golden_apple", stats: [["heal", 0.12], ["hp", 4], ["xpg", 0.08]], lore: "Cima del Cosechador." } },
      { id: "agricultor", name: "Agricultor incansable", icons: ["minecraft:iron_hoe", "minecraft:sugar_cane", "minecraft:beetroot", "minecraft:carrot"],
        stats: [["move", 0.015], ["hp", 1], ["luck", 0.3]], notables: ["Pies en la tierra", "Jornada larga"],
        cap: { title: "Maestro agricultor", icon: "minecraft:netherite_hoe", stats: [["move", 0.05], ["hp", 4], ["luck", 1]], lore: "Cima del Agricultor." } },
    ],
    xp: [{ type: "puffish_skills:mine_block", data: {
      variables: {
        crop: blockVar({ block: "#minecraft:crops", state: { age: "7" } }),
        beet: blockVar({ block: "minecraft:beetroots", state: { age: "3" } }),
        wart: blockVar({ block: "minecraft:nether_wart", state: { age: "3" } }),
      },
      experience: cases([["crop", "5"], ["beet", "5"], ["wart", "6"]]) } }],
  },
  {
    id: "pescador", name: "Pescador", icon: "minecraft:fishing_rod", bg: "adventure",
    about: "Sube pescando.",
    trunk: { icons: ["minecraft:fishing_rod", "minecraft:cod", "minecraft:salmon", "minecraft:tropical_fish", "minecraft:nautilus_shell", "minecraft:heart_of_the_sea"],
             stats: [["luck", 0.3], ["swim", 0.03], ["move", 0.01]], notables: ["Buen anzuelo", "Paciencia"] },
    lanes: [
      { id: "fortuna", name: "Pescador de fortuna", icons: ["minecraft:pufferfish", "minecraft:name_tag", "minecraft:saddle", "minecraft:nautilus_shell"],
        stats: [["luck", 0.4], ["xpg", 0.02], ["dodge", 0.01]], notables: ["Captura rara", "Tesoro del fondo"],
        cap: { title: "Cazador de tesoros", icon: "minecraft:heart_of_the_sea", stats: [["luck", 2], ["xpg", 0.1], ["dodge", 0.04]], lore: "Cima del Pescador de fortuna." } },
      { id: "lobo", name: "Lobo de mar", icons: ["minecraft:kelp", "minecraft:sea_pickle", "minecraft:prismarine_shard", "minecraft:trident"],
        stats: [["swim", 0.05], ["hp", 1], ["move", 0.02]], notables: ["Brazada larga", "Piel salada"],
        cap: { title: "Señor de los mares", icon: "minecraft:trident", stats: [["swim", 0.2], ["hp", 4], ["move", 0.05]], lore: "Cima del Lobo de mar." } },
    ],
    xp: [{ type: "puffish_skills:fish_item", data: { experience: "6" } }],
  },
  {
    id: "herrero", name: "Herrero", icon: "minecraft:anvil", bg: "nether",
    about: "Sube fabricando herramientas, armas y armaduras, y fundiendo lingotes.",
    trunk: { icons: ["minecraft:anvil", "minecraft:iron_ingot", "minecraft:iron_sword", "minecraft:iron_chestplate", "minecraft:blast_furnace", "minecraft:netherite_ingot"],
             stats: [["arm", 0.5], ["dmg", 0.3], ["tgh", 0.2]], notables: ["Yunque firme", "Martillo certero"] },
    lanes: [
      { id: "armero", name: "Armero", icons: ["minecraft:iron_chestplate", "minecraft:iron_helmet", "minecraft:shield", "minecraft:diamond_chestplate"],
        stats: [["arm", 1], ["tgh", 0.3], ["kbr", 0.02]], notables: ["Malla fina", "Temple perfecto"],
        cap: { title: "Maestro armero", icon: "minecraft:netherite_chestplate", stats: [["arm", 3], ["tgh", 1], ["kbr", 0.08]], lore: "Cima del Armero." } },
      { id: "armas", name: "Forjador de armas", icons: ["minecraft:iron_sword", "minecraft:iron_axe", "minecraft:diamond_sword", "minecraft:blaze_powder"],
        stats: [["dmg", 0.4], ["aspd", 0.02], ["pierce", 0.5]], notables: ["Filo bien afilado", "Equilibrio"],
        cap: { title: "Maestro forjador", icon: "minecraft:netherite_sword", stats: [["dmg", 1.5], ["aspd", 0.08], ["pierce", 2]], lore: "Cima del Forjador de armas." } },
    ],
    xp: [
      { type: "puffish_skills:craft_item", data: {
        variables: {
          sword: itemVar("get_crafted_item_stack", "#minecraft:swords"), pick: itemVar("get_crafted_item_stack", "#minecraft:pickaxes"),
          axe: itemVar("get_crafted_item_stack", "#minecraft:axes"), shovel: itemVar("get_crafted_item_stack", "#minecraft:shovels"),
          hoe: itemVar("get_crafted_item_stack", "#minecraft:hoes"), armor: itemVar("get_crafted_item_stack", "#minecraft:trimmable_armor"),
        },
        experience: cases([["sword", "8"], ["pick", "6"], ["axe", "6"], ["shovel", "4"], ["hoe", "4"], ["armor", "10"]]) } },
      { type: "puffish_skills:smelt_item", data: {
        variables: { ingot: itemVar("get_smelted_item_stack", "#forge:ingots") },
        experience: cases([["ingot", "3"]]) } },
    ],
  },
  {
    id: "cocinero", name: "Cocinero", icon: "minecraft:smoker", bg: "husbandry",
    about: "Sube cocinando comida en hornos y ahumadores, y comiendo.",
    trunk: { icons: ["minecraft:furnace", "minecraft:cooked_beef", "minecraft:bread", "minecraft:cake", "minecraft:smoker", "minecraft:golden_apple"],
             stats: [["heal", 0.02], ["hp", 1], ["over", 0.01]], notables: ["Fuego lento", "Buena sazón"] },
    lanes: [
      { id: "chef", name: "Chef", icons: ["minecraft:cooked_porkchop", "minecraft:pumpkin_pie", "minecraft:cookie", "minecraft:golden_carrot"],
        stats: [["heal", 0.03], ["hp", 2], ["over", 0.02]], notables: ["Plato del día", "Receta secreta"],
        cap: { title: "Gran chef", icon: "minecraft:enchanted_golden_apple", stats: [["heal", 0.12], ["hp", 4], ["over", 0.08]], lore: "Cima del Chef." } },
      { id: "gourmet", name: "Gourmet", icons: ["minecraft:cooked_salmon", "minecraft:honey_bottle", "minecraft:sweet_berries", "minecraft:mushroom_stew"],
        stats: [["hp", 1], ["move", 0.01], ["xpg", 0.02]], notables: ["Buen paladar", "Menú degustación"],
        cap: { title: "Maestro gourmet", icon: "minecraft:cake", stats: [["hp", 4], ["move", 0.04], ["xpg", 0.08]], lore: "Cima del Gourmet." } },
    ],
    xp: [
      { type: "puffish_skills:smelt_item", data: {
        variables: Object.fromEntries(COOKED.map((id) => [id, itemVar("get_smelted_item_stack", "minecraft:" + id)])),
        experience: cases(COOKED.map((id) => [id, "4"])) } },
      { type: "puffish_skills:eat_food", data: { experience: "1" } },
    ],
  },
  {
    id: "encantador", name: "Encantador", icon: "minecraft:enchanting_table", bg: "end",
    about: "Sube encantando objetos (más nivel de encantamiento = más XP).",
    trunk: { icons: ["minecraft:enchanting_table", "minecraft:lapis_lazuli", "minecraft:book", "minecraft:experience_bottle", "minecraft:enchanted_book", "minecraft:end_crystal"],
             stats: [["xpg", 0.02], ["luck", 0.2], ["mana", 10]], notables: ["Primera runa", "Mente clara"] },
    lanes: [
      { id: "erudito", name: "Erudito", icons: ["minecraft:book", "minecraft:writable_book", "minecraft:experience_bottle", "minecraft:enchanted_book"],
        stats: [["xpg", 0.03], ["luck", 0.3], ["mana", 10]], notables: ["Estudio profundo", "Biblioteca propia"],
        cap: { title: "Gran erudito", icon: "minecraft:enchanted_book", stats: [["xpg", 0.15], ["luck", 1.5], ["mana", 50]], lore: "Cima del Erudito." } },
      { id: "arcanista", name: "Arcanista", icons: ["minecraft:amethyst_shard", "minecraft:glowstone_dust", "minecraft:ender_pearl", "minecraft:nether_star"],
        stats: [["spower", 0.01], ["mana", 20], ["cdr", 0.01]], notables: ["Canalizar", "Resonancia"],
        cap: { title: "Gran arcanista", icon: "minecraft:end_crystal", stats: [["spower", 0.06], ["mana", 100], ["cdr", 0.04]], lore: "Cima del Arcanista." } },
    ],
    xp: [{ type: "puffish_skills:enchant_item", data: {
      variables: { levels: { operations: [{ type: "get_levels" }] } },
      experience: "5 + levels * 4" } }],
  },
];

for (const job of jobs) {
  const b = makeBuilder("normal");
  buildBand(b, 0, { ...job, stages: milestones(job.id, job.lanes.map((l) => l.id)) }, { trunkN: 6, laneN: 8, capSpent: 12 });
  writeCategory(`oficio_${job.id}`, b, {
    title: job.name, description: job.about + " Cada nivel da 1 punto.",
    icon: itemIcon(job.icon), background: BG(job.bg), unlocked_by_default: true, exclusive_root: false,
  }, { level_limit: 30, experience_per_level: JOB_XP, sources: job.xp });
}

// ============================================================================================================
// 3) ASCENSIÓN: una categoría por clase, SIN XP. Los puntos se ganan completando las misiones de esa clase
//    (FTB Quests -> comando "puffish_skills points add @p ascension_<clase> 1"). Bloqueada hasta que la
//    misión "Elige tu Ascensión" la desbloquee ("puffish_skills category unlock @p ascension_<clase>").
//    Bonos pequeños y porcentuales (docs/03 §7). Tope 50 puntos.
// ============================================================================================================
const ASC_V = { hp: 0.01, dmg: 0.01, arm: 0.01, tgh: 0.01, aspd: 0.01, mana: 0.01, move: 0.005, luck: 0.25, crit: 0.005, critd: 0.02,
  life: 0.005, dodge: 0.005, pierce: 0.5, chp: 0.005, admg: 0.01, avel: 0.02, draw: 0.01, mine: 0.01, xpg: 0.01, heal: 0.01, over: 0.005,
  kbr: 0.01, mregen: 0.02, spower: 0.01, cdr: 0.005, cast: 0.01, sres: 0.01, fire: 0.01, ice: 0.01, holy: 0.01, evoc: 0.01,
  ender: 0.01, blood: 0.01, eldr: 0.01, swim: 0.02 };
const asc = (stats, m = 1) => stats.map(([k]) => [k, ASC_V[k] * m]);
const ASC_BG = { guerrero: "nether", arquero: "adventure", mago: "end", ingeniero: "stone", asesino: "nether" };

for (const cls of classes) {
  const spec = {
    id: cls.id, name: cls.name,
    trunk: { icons: cls.trunk.icons, notables: cls.trunk.notables, stats: asc(cls.trunk.stats) },
    lanes: cls.lanes.map((l) => ({
      ...l, stats: asc(l.stats),
      cap: { ...l.cap, stats: asc(l.cap.stats, 3), lore: "Ascensión: " + l.cap.lore },
      spurs: asc(l.spurs || l.stats),
    })),
  };
  const b = makeBuilder("asc");
  buildBand(b, 0, spec, { trunkN: 6, laneN: 8, capSpent: 20, prefix: "Ascensión › " });
  writeCategory(`ascension_${cls.id}`, b, {
    title: `Ascensión: ${cls.name}`,
    description: `Se desbloquea al elegir la Ascensión de ${cls.name}. Los puntos se ganan completando las misiones de esta clase.`,
    icon: itemIcon(cls.icon), background: BG(ASC_BG[cls.id]), unlocked_by_default: false, spent_points_limit: 50, exclusive_root: false,
  }, null);
}

// ---- índice de categorías (orden de pestañas) ------------------------------------------------------------
out("config.json", { version: 3, show_warnings: true, categories: categoryIds });
console.log(`categorías: ${categoryIds.length}`);
