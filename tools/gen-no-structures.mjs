// Genera el datapack (kubejs/data/<mod>/worldgen/structure_set/*.json) que vacía los conjuntos de estructuras del Overworld,
// para que el mundo de construcción no tenga aldeas, mazmorras, templos, torres, jefes... Las estructuras irán al mundo de aventura.
// Se dejan: fortalezas (acceso al End), Nether/End, las de las dimensiones propias de los mods (Twilight Forest, Aether, Undergarden,
// Ad Astra), meteoritos de AE2, cuevas de Alex's Caves y los carteles de Supplementaries.
// Uso: node tools/gen-no-structures.mjs      (hay que rehacer el mundo para que surta efecto: solo afecta a chunks nuevos)
import { writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";

const SETS = {
  minecraft: ["villages", "desert_pyramids", "igloos", "jungle_temples", "mineshafts", "ocean_monuments", "ocean_ruins", "pillager_outposts",
    "ruined_portals", "shipwrecks", "swamp_huts", "woodland_mansions", "buried_treasures", "ancient_cities", "trail_ruins"],
  nova_structures: ["badlands_miner_outpost", "bunker", "conduit_ruin", "creeping_crypt", "desert_ruins", "firewatch_towers", "illager_camp",
    "illager_hideout", "jungle_ruins", "mangrove_witch_hut", "ruin_town", "stray_fort", "taverns", "undead_crypt", "underground_house",
    "villages_jungle", "villages_swamp", "wells", "wild_ruin", "witch_villa"],
  idas: ["idas_common", "idas_ocean", "idas_rare", "idas_small", "idas_underground", "idas_underground_rare"],
  structory: ["mid_rare_ruin", "old_manor", "outcast_villager", "ruin", "ruin_quiet"],
  cataclysm: ["abandoned_structures", "acropolis", "amethyst_nest", "ancient_factory", "cursed_pyramid", "desert_structures", "frosted_prison",
    "ruined_citadel", "sunken_city"],
  irons_spellbooks: ["ancient_battleground", "catacombs", "citadel", "evoker_fort", "ice_spider_den", "impaled_icebreaker", "mangrove_hut",
    "mountain_tower", "pyromancer_tower"],
  bosses_of_mass_destruction: ["gauntlet_arena", "lich_tower", "obsidilith_arena", "void_blossom"],
  mowziesmobs: ["frostmaw_spawns", "monasteries", "umvuthana_groves", "wrought_chambers"],
  apotheosis: ["tower_leaf", "tower_main", "tower_sand", "tower_spruce"],
  iceandfire: ["gorgon_temple", "graveyard", "mausoleum"],
  deeperdarker: ["ancient_temple"],
  ars_nouveau: ["wilden_den_set"],
  dungeoncrawl: ["dungeons"],
  dungeons_arise: ["major_structures", "minor_structures"],
  betterdungeons: ["skeleton_dungeons", "small_dungeons", "spider_dungeons", "zombie_dungeons"],
  repurposed_structures: ["ancient_cities_overworld", "bastions_overworld", "cities_overworld", "fortresses_overworld", "igloos_overworld", "mansions_mangrove",
    "mansions_overworld", "mineshafts_ocean", "mineshafts_overworld", "monuments_overworld", "outposts_overworld", "pyramids_mushroom", "pyramids_overworld",
    "ruins_overworld", "temples_overworld", "villages_mushroom", "villages_overworld", "witch_huts_overworld"],
};

const root = "kubejs/data";
const empty = { structures: [], placement: { type: "minecraft:random_spread", spacing: 8, separation: 4, salt: 0 } };
let n = 0;
for (const [ns, names] of Object.entries(SETS)) {
  const dir = `${root}/${ns}/worldgen/structure_set`;
  if (existsSync(dir)) rmSync(dir, { recursive: true });
  mkdirSync(dir, { recursive: true });
  for (const name of names) { writeFileSync(`${dir}/${name}.json`, JSON.stringify(empty, null, 2) + "\n"); n++; }
}
// Estructuras que se añaden como "features" por biome modifiers (nidos de Ice and Fire, mazmorras del jefe de Apotheosis, campamentos de Artifacts, pozos y
// mazmorras de Repurposed Structures): se desactivan con el tipo forge:none.
const NONE = JSON.stringify({ type: "forge:none" }) + "\n";
const MODS = {
  iceandfire: ["iaf_features", "iaf_mob_spawns"],
  apotheosis: ["boss_dungeon", "boss_dungeon_2", "boss_dungeon_2_deep", "boss_dungeon_deep", "rogue_spawner", "rogue_spawner_deep"],
  artifacts: ["add_campsite"],
  "repurposed_structures/dungeons": ["badlands", "dark_forest", "deep", "desert", "icy", "jungle", "mushroom", "ocean_cold", "ocean_frozen", "ocean_lukewarm", "ocean_neutral", "ocean_warm", "snow", "swamp"],
  "repurposed_structures/wells": ["badlands", "cherry", "forest", "mossy_stone", "mushroom", "snow"],
};
let m = 0;
for (const [k, names] of Object.entries(MODS)) {
  const ns = k.split("/")[0], sub = k.split("/").slice(1).join("/");
  const dir = `${root}/${ns}/forge/biome_modifier${sub ? "/" + sub : ""}`;
  mkdirSync(dir, { recursive: true });
  for (const name of names) { writeFileSync(`${dir}/${name}.json`, NONE); m++; }
}
console.log(`${m} biome modifiers desactivados`);
console.log(`${n} conjuntos de estructuras vaciados en ${Object.keys(SETS).length} espacios de nombres`);
