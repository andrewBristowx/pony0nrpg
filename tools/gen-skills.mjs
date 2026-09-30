// Genera config/puffish_skills/ (Pufferfish's Skills 0.19.x, config version 3) a partir de las tablas de abajo.
// Uso:  node tools/gen-skills.mjs
//
// Decisión S1: los puntos y el nivel son POR CATEGORÍA en Pufferfish (no hay nivel global entre categorías,
// y "exchange" solo convierte niveles de vanilla). Para que el jugador combine clases con un único pool de
// puntos y un único nivel 1–100, todas las clases viven en UNA categoría ("habilidades").
// Cada clase es una banda horizontal: tronco común (Fundamentos) -> se bifurca en 3–4 caminos de 10 nodos.
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
};
const num = (v) => String(Number(v.toFixed(3)));
const fmt = (key, v) => {
  const [, name, kind] = ATTR[key];
  return kind === "flat" ? `+${num(v)} ${name}` : `+${num(v * 100)}% ${name}`;
};
const reward = (key, v) => {
  const [attribute, , kind] = ATTR[key];
  return { type: "puffish_skills:attribute", data: { attribute, value: Number(v.toFixed(3)), operation: kind === "mul" ? "multiply_base" : "addition" } };
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

// ---- construcción ------------------------------------------------------------------------------------
const definitions = {}, skills = {}, bidirectional = [];
const TRUNK_STEP = 44, LANE_STEP = 44, LANE_GAP = 120, BAND_GAP = 620, SPUR = 38, TRUNK_N = 6, LANE_N = 10, CAP_SPENT = 30;

// tooltip = componente de texto (nombre del camino en dorado + una línea verde por bonificación)
const description = (path, stats, lore) => {
  const parts = [{ text: path + "\n", color: "gold" }];
  stats.forEach(([k, v], i) => parts.push({ text: fmt(k, v) + (i < stats.length - 1 || lore ? "\n" : ""), color: "green" }));
  if (lore) parts.push({ text: lore, color: "gray", italic: true });
  return parts;
};

const addNode = ({ id, title, path, icon, frame, stats, lore, x, y, isRoot = false, requiredSpent = 0 }) => {
  definitions[id] = {
    title,
    description: description(path, stats, lore),
    icon: { type: "item", data: { item: icon } },
    frame,
    rewards: stats.map(([k, v]) => reward(k, v)),
    ...(requiredSpent ? { required_spent_points: requiredSpent } : {}),
  };
  skills[id] = { x: Math.round(x), y: Math.round(y), definition: id, ...(isRoot ? { root: true } : {}) };
};
const link = (a, b) => bidirectional.push([a, b]);

classes.forEach((cls, ci) => {
  const y0 = ci * BAND_GAP;
  const scale = (stats, m) => stats.map(([k, v]) => [k, v * m]);

  // Tronco común: Fundamentos I–VI (notables en 3 y 6)
  let prev = null;
  for (let k = 1; k <= TRUNK_N; k++) {
    const id = `${cls.id}_f${k}`;
    const notable = k % 3 === 0;
    const main = cls.trunk.stats[(k - 1) % cls.trunk.stats.length];
    const extra = cls.trunk.stats[k % cls.trunk.stats.length];
    const stats = notable ? [[cls.trunk.stats[0][0], cls.trunk.stats[0][1] * 2], cls.trunk.stats[(k / 3) % cls.trunk.stats.length]] : [main];
    addNode({
      id, x: (k - 1) * TRUNK_STEP, y: y0, isRoot: k === 1, frame: notable ? "goal" : "task",
      title: notable ? cls.trunk.notables[k / 3 - 1] : `${cls.name} · Fundamentos ${roman[k - 1]}`,
      path: `${cls.name} › Fundamentos`, icon: cls.trunk.icons[k - 1], stats,
    });
    if (prev) link(prev, id);
    prev = id;
    if (k === 2 || k === 5) { // nodo lateral del tronco
      const sid = `${cls.id}_f${k}s`;
      const sy = y0 + (k === 2 ? -SPUR : SPUR);
      addNode({ id: sid, x: (k - 1) * TRUNK_STEP, y: sy, frame: "task", title: `${cls.name} · Soporte`, path: `${cls.name} › Fundamentos`, icon: cls.trunk.icons[k - 1], stats: [cls.trunk.stats[(k + 1) % cls.trunk.stats.length]] });
      link(id, sid);
    }
  }
  const forkId = prev;
  const laneX0 = (TRUNK_N - 1) * TRUNK_STEP + 56;

  // Caminos: 10 nodos (notables en 3, 6, 9; cima en 10) + 3 nodos laterales
  cls.lanes.forEach((lane, li) => {
    const ly = y0 + (li - (cls.lanes.length - 1) / 2) * LANE_GAP;
    let p = forkId;
    for (let k = 1; k <= LANE_N; k++) {
      const id = `${cls.id}_${lane.id}_${k}`;
      const x = laneX0 + (k - 1) * LANE_STEP;
      const path = `${cls.name} › ${lane.name}`;
      const isCap = k === LANE_N, notable = !isCap && k % 3 === 0;
      const main = lane.stats[(k - 1) % lane.stats.length];
      const extra = lane.stats[k % lane.stats.length];
      if (isCap) {
        addNode({ id, x, y: ly, frame: "challenge", title: lane.cap.title, path, icon: lane.cap.icon, stats: lane.cap.stats, lore: lane.cap.lore, requiredSpent: CAP_SPENT });
      } else if (notable) {
        addNode({ id, x, y: ly, frame: "goal", title: lane.notables[k / 3 - 1], path, icon: lane.icons[(k - 1) % lane.icons.length], stats: [[lane.stats[0][0], lane.stats[0][1] * 2], lane.stats[(k / 3) % lane.stats.length]] });
      } else {
        addNode({ id, x, y: ly, frame: "task", title: `${lane.name} ${roman[k - 1]}`, path, icon: lane.icons[(k - 1) % lane.icons.length], stats: [main] });
      }
      link(p, id);
      p = id;
      const si = [2, 5, 8].indexOf(k);
      if (si >= 0) {
        const sid = `${cls.id}_${lane.id}_s${si + 1}`;
        addNode({ id: sid, x, y: ly + (si % 2 === 0 ? -SPUR : SPUR), frame: "task", title: `${lane.name} · Apoyo`, path, icon: lane.icons[(k + 1) % lane.icons.length], stats: [lane.spurs[si]] });
        link(id, sid);
      }
    }
  });
});

// ---- ficheros ----------------------------------------------------------------------------------------
out("config.json", { version: 3, show_warnings: true, categories: ["habilidades"] });
const dir = "categories/habilidades/";
out(dir + "category.json", {
  title: "Habilidades",
  description: "Sube de nivel y reparte tus puntos entre las clases. Puedes llenar una a fondo o combinar varias.",
  icon: { type: "item", data: { item: "minecraft:nether_star" } },
  background: "minecraft:textures/gui/advancements/backgrounds/stone.png",
  unlocked_by_default: true,
  exclusive_root: false,
});
out(dir + "definitions.json", definitions);
out(dir + "skills.json", skills);
out(dir + "connections.json", { normal: { bidirectional } });

// Curva de docs/03: XP para pasar del nivel n al n+1 = 60 + 12n + 0.9n^2 (punto de partida, a calibrar).
// Fuentes iniciales: mobs y minería. Misiones/exploración darán XP por comando desde FTB Quests
// (puffish_skills experience add @s habilidades N). Anti-granjas: límite por chunk.
out(dir + "experience.json", {
  level_limit: 100,
  experience_per_level: { type: "expression", data: { expression: "60 + 12 * level + 0.9 * level ^ 2" } },
  sources: [
    {
      type: "puffish_skills:kill_entity",
      data: {
        variables: {
          max_health: { operations: [{ type: "get_killed_living_entity" }, { type: "get_max_health" }] },
          dropped_xp: { operations: [{ type: "get_dropped_experience" }] },
        },
        experience: "max_health * 1.5 + dropped_xp",
        anti_farming_per_chunk: { limit_per_chunk: 15, reset_after_seconds: 300 },
      },
    },
    {
      type: "puffish_skills:mine_block",
      data: {
        variables: {
          hardness: { operations: [{ type: "get_mined_block_state" }, { type: "get_block" }, { type: "get_hardness" }] },
        },
        experience: "1 + hardness",
      },
    },
  ],
});

const laneCount = classes.reduce((s, c) => s + c.lanes.length, 0);
console.log(`habilidades: ${Object.keys(skills).length} nodos, ${bidirectional.length} conexiones, ${classes.length} clases, ${laneCount} caminos`);
