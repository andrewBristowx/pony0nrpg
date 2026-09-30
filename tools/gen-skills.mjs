// Genera config/puffish_skills/ (Pufferfish's Skills 0.19.x, config version 3) a partir de las tablas de abajo.
// Uso:  node tools/gen-skills.mjs
// Decisión S1: UNA sola categoría "habilidades" = nivel global 1–100 y puntos compartidos;
// cada clase es una rama con su raíz. El jugador reparte los puntos entre ramas.
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

// ---- helpers de recompensas --------------------------------------------------------------
const add = (attribute, value) => ({ type: "puffish_skills:attribute", data: { attribute, value, operation: "addition" } });
const mul = (attribute, value) => ({ type: "puffish_skills:attribute", data: { attribute, value, operation: "multiply_base" } });

// atributos (ver docs/01: mapa de atributos)
const HP = "generic.max_health", DMG = "generic.attack_damage", ARM = "generic.armor", TGH = "generic.armor_toughness";
const ASPD = "generic.attack_speed", MOVE = "generic.movement_speed", KBR = "generic.knockback_resistance", LUCK = "generic.luck";
const CRIT = "attributeslib:crit_chance", CRITD = "attributeslib:crit_damage", LIFE = "attributeslib:life_steal";
const DODGE = "attributeslib:dodge_chance", APIERCE = "attributeslib:armor_pierce", AVEL = "attributeslib:arrow_velocity";
const ADMG = "attributeslib:arrow_damage", DRAW = "attributeslib:draw_speed", MINE = "attributeslib:mining_speed";
const XPG = "attributeslib:experience_gained", HEAL = "attributeslib:healing_received";
const MANA = "irons_spellbooks:max_mana", MREGEN = "irons_spellbooks:mana_regen", SPOWER = "irons_spellbooks:spell_power";
const CDR = "irons_spellbooks:cooldown_reduction", CAST = "irons_spellbooks:cast_time_reduction", SRES = "irons_spellbooks:spell_resist";

// ---- ramas: spine = camino principal (12 nodos), spurs = [índice de spine, nodo] ------------
// n(título, icono, [recompensas], marco)   marco: task (pequeño) | goal (notable) | challenge (cima)
const n = (title, icon, rewards, frame = "task", description) => ({ title, icon, rewards, frame, description });
const T = "task", G = "goal", C = "challenge";

const branches = [
  {
    id: "guerrero", name: "Guerrero", icon: "minecraft:iron_sword", angle: -90,
    spine: [
      n("Vitalidad I", "minecraft:apple", [add(HP, 2)]),
      n("Fuerza I", "minecraft:iron_sword", [add(DMG, 0.5)]),
      n("Piel de hierro I", "minecraft:iron_chestplate", [add(ARM, 1)]),
      n("Vitalidad II", "minecraft:golden_apple", [add(HP, 2)]),
      n("Fuerza II", "minecraft:iron_sword", [add(DMG, 0.5)]),
      n("Firmeza", "minecraft:shield", [add(KBR, 0.1)], G),
      n("Piel de hierro II", "minecraft:iron_chestplate", [add(ARM, 1)]),
      n("Vitalidad III", "minecraft:golden_apple", [add(HP, 4)], G),
      n("Fuerza III", "minecraft:diamond_sword", [add(DMG, 1)]),
      n("Baluarte", "minecraft:diamond_chestplate", [add(TGH, 1), add(ARM, 1)], G),
      n("Vitalidad IV", "minecraft:enchanted_golden_apple", [add(HP, 4)]),
      n("Titán", "minecraft:netherite_chestplate", [add(HP, 6), add(DMG, 1), add(LIFE, 0.03)], C, "Cima del Guerrero."),
    ],
    spurs: [
      [2, n("Robustez", "minecraft:leather_chestplate", [add(HP, 2)])],
      [4, n("Golpe certero", "minecraft:flint", [add(CRIT, 0.03)])],
      [7, n("Sed de sangre", "minecraft:redstone", [add(LIFE, 0.02)], G)],
      [9, n("Pulso firme", "minecraft:iron_ingot", [add(KBR, 0.1)])],
    ],
  },
  {
    id: "arquero", name: "Arquero", icon: "minecraft:bow", angle: -18,
    spine: [
      n("Puntería I", "minecraft:arrow", [add(ADMG, 0.03)]),
      n("Agilidad I", "minecraft:leather_boots", [mul(MOVE, 0.02)]),
      n("Tensado I", "minecraft:bow", [add(DRAW, 0.05)]),
      n("Puntería II", "minecraft:arrow", [add(ADMG, 0.03)]),
      n("Proyectil veloz", "minecraft:feather", [add(AVEL, 0.1)], G),
      n("Ojo de halcón", "minecraft:spyglass", [add(CRIT, 0.03)]),
      n("Tensado II", "minecraft:crossbow", [add(DRAW, 0.05)]),
      n("Puntería III", "minecraft:spectral_arrow", [add(ADMG, 0.05)], G),
      n("Agilidad II", "minecraft:chainmail_boots", [mul(MOVE, 0.03)]),
      n("Esquiva I", "minecraft:rabbit_foot", [add(DODGE, 0.03)]),
      n("Tirador certero", "minecraft:tipped_arrow", [add(CRITD, 0.1)], G),
      n("Ojo del cazador", "minecraft:target", [add(ADMG, 0.1), add(AVEL, 0.2), add(CRIT, 0.05)], C, "Cima del Arquero."),
    ],
    spurs: [
      [1, n("Vitalidad ligera", "minecraft:apple", [add(HP, 2)])],
      [3, n("Reflejos", "minecraft:sugar", [add(DODGE, 0.02)])],
      [6, n("Cuero curtido", "minecraft:leather", [add(ARM, 1)])],
      [8, n("Pies ligeros", "minecraft:feather", [mul(MOVE, 0.02)])],
    ],
  },
  {
    id: "mago", name: "Mago", icon: "minecraft:enchanted_book", angle: 54,
    spine: [
      n("Reserva de maná I", "minecraft:lapis_lazuli", [add(MANA, 50)]),
      n("Poder arcano I", "minecraft:amethyst_shard", [mul(SPOWER, 0.03)]),
      n("Concentración I", "minecraft:clock", [mul(CDR, 0.03)]),
      n("Reserva de maná II", "minecraft:lapis_block", [add(MANA, 50)]),
      n("Poder arcano II", "minecraft:amethyst_cluster", [mul(SPOWER, 0.03)]),
      n("Flujo de maná", "minecraft:glowstone_dust", [mul(MREGEN, 0.1)], G),
      n("Concentración II", "minecraft:clock", [mul(CDR, 0.03)]),
      n("Invocación rápida", "minecraft:ender_pearl", [mul(CAST, 0.05)], G),
      n("Reserva de maná III", "minecraft:heart_of_the_sea", [add(MANA, 100)]),
      n("Poder arcano III", "minecraft:nether_star", [mul(SPOWER, 0.05)], G),
      n("Mente clara", "minecraft:experience_bottle", [mul(SRES, 0.05)]),
      n("Archimago", "minecraft:end_crystal", [add(MANA, 150), mul(SPOWER, 0.08), mul(CDR, 0.05)], C, "Cima del Mago."),
    ],
    spurs: [
      [1, n("Cuerpo etéreo", "minecraft:apple", [add(HP, 2)])],
      [4, n("Voluntad", "minecraft:paper", [mul(SRES, 0.03)])],
      [6, n("Sabiduría", "minecraft:book", [add(XPG, 0.05)])],
      [9, n("Vínculo arcano", "minecraft:golden_carrot", [add(HEAL, 0.05)])],
    ],
  },
  {
    id: "ingeniero", name: "Ingeniero", icon: "minecraft:iron_pickaxe", angle: 126,
    spine: [
      n("Excavación I", "minecraft:iron_pickaxe", [add(MINE, 0.05)]),
      n("Suerte I", "minecraft:gold_nugget", [add(LUCK, 0.5)]),
      n("Resistencia I", "minecraft:leather_helmet", [add(HP, 2)]),
      n("Excavación II", "minecraft:iron_pickaxe", [add(MINE, 0.05)]),
      n("Ingenio I", "minecraft:redstone", [add(XPG, 0.05)]),
      n("Manos rápidas", "minecraft:piston", [add(ASPD, 0.1)], G),
      n("Excavación III", "minecraft:diamond_pickaxe", [add(MINE, 0.1)]),
      n("Suerte II", "minecraft:emerald", [add(LUCK, 1)], G),
      n("Casco de obra", "minecraft:iron_helmet", [add(ARM, 1), add(HP, 2)]),
      n("Ingenio II", "minecraft:repeater", [add(XPG, 0.1)]),
      n("Motor incansable", "minecraft:sugar", [mul(MOVE, 0.04)], G),
      n("Maestro de obra", "minecraft:netherite_pickaxe", [add(MINE, 0.2), add(LUCK, 1), add(XPG, 0.1)], C, "Cima del Ingeniero."),
    ],
    spurs: [
      [1, n("Buen ojo", "minecraft:spyglass", [add(LUCK, 0.5)])],
      [3, n("Pico afilado", "minecraft:flint", [add(DMG, 0.5)])],
      [6, n("Botas de trabajo", "minecraft:iron_boots", [add(ARM, 1)])],
      [9, n("Constitución", "minecraft:bread", [add(HP, 2)])],
    ],
  },
  {
    id: "asesino", name: "Asesino", icon: "minecraft:iron_axe", angle: 198,
    spine: [
      n("Filo I", "minecraft:iron_axe", [add(DMG, 0.5)]),
      n("Rapidez I", "minecraft:sugar", [add(ASPD, 0.05)]),
      n("Paso ligero I", "minecraft:leather_boots", [mul(MOVE, 0.02)]),
      n("Filo II", "minecraft:iron_axe", [add(DMG, 0.5)]),
      n("Golpe crítico I", "minecraft:flint", [add(CRIT, 0.04)]),
      n("Sombra", "minecraft:black_dye", [add(DODGE, 0.04)], G),
      n("Rapidez II", "minecraft:blaze_powder", [add(ASPD, 0.05)]),
      n("Perforar", "minecraft:iron_nugget", [add(APIERCE, 2)], G),
      n("Filo III", "minecraft:diamond_axe", [add(DMG, 1)]),
      n("Golpe crítico II", "minecraft:blaze_rod", [add(CRITD, 0.15)], G),
      n("Paso ligero II", "minecraft:chainmail_boots", [mul(MOVE, 0.03)]),
      n("Ejecutor", "minecraft:netherite_axe", [add(DMG, 1.5), add(CRIT, 0.06), add(CRITD, 0.2)], C, "Cima del Asesino."),
    ],
    spurs: [
      [1, n("Vitalidad ágil", "minecraft:apple", [add(HP, 2)])],
      [4, n("Instinto", "minecraft:fermented_spider_eye", [add(CRIT, 0.02)])],
      [6, n("Cuero ligero", "minecraft:leather_chestplate", [add(ARM, 1)])],
      [9, n("Veneno", "minecraft:spider_eye", [add(LIFE, 0.02)])],
    ],
  },
];

// ---- construcción ------------------------------------------------------------------------
const definitions = {}, skills = {}, bidirectional = [];
const STEP = 36, R0 = 70, SPUR = 30;
const rad = (d) => (d * Math.PI) / 180;

for (const b of branches) {
  const ux = Math.cos(rad(b.angle)), uy = Math.sin(rad(b.angle));   // dirección de la rama
  const px = -uy, py = ux;                                           // perpendicular
  const place = (i, side = 0) => ({
    x: Math.round(ux * (R0 + i * STEP) + px * side * SPUR),
    y: Math.round(uy * (R0 + i * STEP) + py * side * SPUR),
  });
  const addNode = (id, node, pos, isRoot = false) => {
    const defId = id;
    definitions[defId] = {
      title: node.title,
      ...(node.description ? { description: node.description } : {}),
      icon: { type: "item", data: { item: node.icon } },
      frame: node.frame,
      rewards: node.rewards,
    };
    skills[id] = { ...pos, definition: defId, ...(isRoot ? { root: true } : {}) };
  };
  b.spine.forEach((node, i) => {
    const id = `${b.id}_${i + 1}`;
    addNode(id, node, place(i), i === 0);
    if (i > 0) bidirectional.push([`${b.id}_${i}`, id]);
  });
  b.spurs.forEach(([at, node], k) => {
    const id = `${b.id}_s${k + 1}`;
    addNode(id, node, place(at, k % 2 === 0 ? 1 : -1));
    bidirectional.push([`${b.id}_${at + 1}`, id]);
  });
}

// ---- ficheros ----------------------------------------------------------------------------
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
// Fuentes iniciales: mobs y minería. Misiones/exploración dan XP por comando desde FTB Quests
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
          hardness: { operations: [{ type: "get_mined_block_state" }, { type: "get_hardness" }] },
        },
        experience: "1 + hardness",
      },
    },
  ],
});

console.log(`habilidades: ${Object.keys(skills).length} nodos, ${bidirectional.length} conexiones, ${branches.length} ramas`);
