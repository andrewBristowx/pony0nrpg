// Anula los 13 modificadores globales de botin de Iron's Spells que añaden pergaminos (y tintas) a cofres del mapa y a mobs:
// los hechizos solo se consiguen por progresion de rol (kubejs/server_scripts/gremio_roles_tabla.js, HECHIZOS_ROL).
// Escribe kubejs/data/irons_spellbooks/loot_modifiers/{chest_loot,entity_drops}/*.json (misma ruta que el mod, asi los sustituyen) con la condicion
// "nunca" (invertida de random_chance 1.0). Los archivos originales: 'jar tf irons-spells-n-spellbooks.jar | grep loot_modifiers'. Uso: node tools/gen-no-scrolls.mjs
import fs from "node:fs";
import path from "node:path";
const raiz = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "kubejs", "data", "irons_spellbooks", "loot_modifiers");
const mods = {
  chest_loot: ["ancient_city_modifier", "compat_generic_loot_modifier", "compat_good_loot_modifier", "compat_treasure_loot_modifier", "end_city_modifier",
    "nether_loot_modifier", "stronghold_library_modifier", "vanilla_generic_loot_modifier"],
  entity_drops: ["blaze_modifier", "ender_dragon_modifier", "evoker_modifier", "hoglin_modifier", "stray_modifier"],
};
// 'key' (la tabla de botin que añade cada modificador) se conserva tal cual del mod; esta en tools/no-scrolls-keys.json (extraido del jar de Iron's Spells).
const claves = JSON.parse(fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "no-scrolls-keys.json"), "utf8"));
for (const [dir, lista] of Object.entries(mods)) {
  fs.mkdirSync(path.join(raiz, dir), { recursive: true });
  for (const nombre of lista) {
    const key = claves[`${dir}/${nombre}`];
    if (!key) throw new Error("falta la clave de " + dir + "/" + nombre);
    const json = { type: "irons_spellbooks:append_loot",
      conditions: [{ condition: "minecraft:inverted", term: { condition: "minecraft:random_chance", chance: 1.0 } }], key };
    fs.writeFileSync(path.join(raiz, dir, nombre + ".json"), JSON.stringify(json, null, 2) + "\n");
  }
}
console.log("13 modificadores anulados en", raiz);
