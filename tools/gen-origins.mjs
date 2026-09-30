// Genera el datapack de Origins en kubejs/data/ (KubeJS lo carga como datapack):
//   - capa de RAZAS (origins:origin) con una lista curada de razas mitológicas/fantásticas
//   - capa de CLASES (pony0n:clase): Guerrero, Arquero, Mago, Ingeniero, Asesino, cada una con efectos únicos
//     y un kit de inicio; elegir la clase concede los stages clase_<c> y origen_<c> (ver kubejs/startup_scripts/class_gating.js)
// Uso:  node tools/gen-origins.mjs
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "kubejs", "data");
for (const d of ["origins", "medievalorigins", "pony0n"]) rmSync(join(root, d), { recursive: true, force: true });
const out = (rel, data) => {
  const f = join(root, rel);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify(data, null, 2) + "\n");
};

// ---- razas ---------------------------------------------------------------------------------------------------
// Se descartan: alfiq (gato), incubus (demonio), revenant (nigromante), plague_victim, pixie y fae (vuelo libre
// desde el inicio), el Trol (su descripción dice "no implementado"), la Valquiria (sus alas necesitan Icarus, que no va con esta versión) y mythic:valkyrie.
const RACES = [
  "origins:human",
  "medievalorigins:dwarf", "medievalorigins:high_elf", "medievalorigins:wood_elf", "medievalorigins:moon_elf",
  "medievalorigins:ogre", "medievalorigins:goblin",
  "medievalorigins:gorgon", "medievalorigins:siren", "medievalorigins:yeti",
  "medievalorigins:banshee", "medievalorigins:arachnae",
  "mythic:kitsune", "mythic:djinn", "mythic:phoenix", "mythic:druid",
];
out("origins/origin_layers/origin.json", {
  replace: true,
  loading_priority: 1000,
  order: 0,
  enabled: true,
  name: "Raza",
  missing_name: "Raza",
  missing_description: "Elige una raza",
  origins: RACES,
  gui_title: { view_origin: "Tu raza", choose_origin: "Elige tu raza" },
});
// La capa extra de Medieval Origins (subclases del Elfo Alto) choca con nuestras clases: se desactiva.
out("medievalorigins/origin_layers/magic_subclasses.json", { replace: true, loading_priority: 1000, enabled: false, order: 99, origins: [] });

// ---- clases --------------------------------------------------------------------------------------------------
const attr = (attribute, operation, value) => ({ attribute, operation, value });
const give = (item, amount = 1) => ({ type: "origins:give", stack: { item, amount } });
const cmd = (command) => ({ type: "origins:execute_command", command });
// "ignore_death" no hace falta: los kits solo se entregan al ELEGIR la clase
const kitPower = (cls, items) => ({
  hidden: true,
  type: "origins:action_on_callback",
  entity_action_chosen: {
    type: "origins:and",
    actions: [cmd(`kubejs stages add @s clase_${cls}`), cmd(`kubejs stages add @s origen_${cls}`), ...items.map(([i, n]) => give(i, n))],
  },
  execute_chosen_when_orb: false,
});

const classes = [
  {
    id: "guerrero", name: "Guerrero", icon: "minecraft:iron_sword", impact: 2,
    description: "Un luchador de primera línea. Aguanta golpes, pega fuerte cuando está al límite y abre el camino a su grupo. Empiezas con arma pesada y escudo, y desbloqueas el equipo de Guerrero (Tier I).",
    powers: {
      piel_de_acero: { type: "origins:attribute", name: "Piel de acero", description: "+2 de armadura y +2 corazones de vida máxima.",
        modifiers: [attr("minecraft:generic.armor", "addition", 2), attr("minecraft:generic.max_health", "addition", 4)] },
      furia: { type: "origins:modify_damage_dealt", name: "Furia del guerrero", description: "Con menos de la mitad de tu vida haces un 25 % más de daño.",
        modifier: { operation: "multiply_total_multiplicative", value: 0.25 }, condition: { type: "origins:relative_health", comparison: "<=", compare_to: 0.5 } },
      pesado: { type: "origins:attribute", name: "Paso pesado", description: "Tu equipamiento te hace un 3 % más lento.",
        modifier: attr("minecraft:generic.movement_speed", "multiply_base", -0.03) },
    },
    kit: [["spartanweaponry:copper_greatsword", 1], ["minecraft:shield", 1], ["minecraft:leather_chestplate", 1], ["minecraft:cooked_beef", 12]],
  },
  {
    id: "arquero", name: "Arquero", icon: "minecraft:bow", impact: 2,
    description: "Preciso y veloz. Golpea desde la distancia, se mueve con ligereza y amortigua las caídas. Empiezas con arco largo y flechas, y desbloqueas el equipo de Arquero (Tier I).",
    powers: {
      punteria: { type: "origins:modify_projectile_damage", name: "Puntería", description: "Tus proyectiles hacen un 20 % más de daño.",
        modifier: { operation: "multiply_total_multiplicative", value: 0.2 } },
      pies_ligeros: { type: "origins:attribute", name: "Pies ligeros", description: "Te mueves un 6 % más rápido.",
        modifier: attr("minecraft:generic.movement_speed", "multiply_base", 0.06) },
      caida_suave: { type: "origins:modify_damage_taken", name: "Caída suave", description: "Recibes un 40 % menos de daño por caídas.",
        damage_condition: { type: "origins:name", name: "fall" }, modifier: { operation: "multiply_total_multiplicative", value: -0.4 } },
      fragil: { type: "origins:attribute", name: "Constitución ligera", description: "Tienes 1 corazón menos de vida máxima.",
        modifier: attr("minecraft:generic.max_health", "addition", -2) },
    },
    kit: [["spartanweaponry:copper_longbow", 1], ["minecraft:arrow", 48], ["minecraft:leather_boots", 1], ["minecraft:cooked_chicken", 12]],
  },
  {
    id: "mago", name: "Mago", icon: "minecraft:enchanted_book", impact: 2,
    description: "Domina la magia arcana. Más maná, hechizos más potentes y menos enfriamiento, a costa de un cuerpo frágil. Empiezas con bastón, grimorio y tinta, y puedes lanzar hechizos (Mago Tier I).",
    powers: {
      sangre_arcana: { type: "origins:attribute", name: "Sangre arcana", description: "+100 de maná máximo.",
        modifier: attr("irons_spellbooks:max_mana", "addition", 100) },
      mente_clara: { type: "origins:attribute", name: "Mente clara", description: "+8 % de poder de hechizo y 5 % menos de enfriamiento.",
        modifiers: [attr("irons_spellbooks:spell_power", "multiply_base", 0.08), attr("irons_spellbooks:cooldown_reduction", "multiply_base", 0.05)] },
      cuerpo_fragil: { type: "origins:attribute", name: "Cuerpo frágil", description: "Tienes 2 corazones menos de vida máxima.",
        modifier: attr("minecraft:generic.max_health", "addition", -4) },
    },
    kit: [["irons_spellbooks:graybeard_staff", 1], ["irons_spellbooks:wimpy_spell_book", 1], ["irons_spellbooks:common_ink", 4], ["minecraft:golden_carrot", 12], ["minecraft:experience_bottle", 4]],
  },
  {
    id: "ingeniero", name: "Ingeniero", icon: "minecraft:iron_pickaxe", impact: 1,
    description: "Manitas e ingenioso. Mina y construye más rápido, tiene más suerte y gana más experiencia. Empiezas con pico, mochila y gafas de ingeniero, y desbloqueas las habilidades de Ingeniero.",
    powers: {
      manos_habiles: { type: "origins:modify_break_speed", name: "Manos hábiles", description: "Rompes bloques un 20 % más rápido.",
        modifier: { operation: "multiply_base", value: 0.2 } },
      ingenio: { type: "origins:attribute", name: "Ingenio", description: "+1 de suerte y +10 % de experiencia ganada.",
        modifiers: [attr("minecraft:generic.luck", "addition", 1), attr("attributeslib:experience_gained", "addition", 0.1)] },
      delicado: { type: "origins:attribute", name: "Manos delicadas", description: "Haces un 10 % menos de daño cuerpo a cuerpo.",
        modifier: attr("minecraft:generic.attack_damage", "multiply_base", -0.1) },
    },
    kit: [["minecraft:iron_pickaxe", 1], ["sophisticatedbackpacks:backpack", 1], ["create:goggles", 1], ["create:andesite_alloy", 8], ["minecraft:bread", 12]],
  },
  {
    id: "asesino", name: "Asesino", icon: "minecraft:iron_axe", impact: 2,
    description: "Sigiloso y letal. Sus golpes son más duros, se mueve rápido agachado y cae de pie. Empiezas con daga y perla de ender, y desbloqueas el equipo de Asesino (Tier I).",
    powers: {
      filo: { type: "origins:modify_damage_dealt", name: "Filo mortal", description: "Haces un 10 % más de daño.",
        modifier: { operation: "multiply_total_multiplicative", value: 0.1 } },
      sigilo: { type: "origins:conditioned_attribute", name: "Paso de sombra", description: "Agachado te mueves mucho más rápido.",
        modifiers: [attr("minecraft:generic.movement_speed", "multiply_base", 0.6)], condition: { type: "origins:sneaking" }, tick_rate: 4 },
      sin_armadura: { type: "origins:attribute", name: "Sin corazas", description: "-1 de armadura: confías en la velocidad y no en el metal.",
        modifier: attr("minecraft:generic.armor", "addition", -1) },
    },
    kit: [["spartanweaponry:copper_dagger", 1], ["minecraft:leather_boots", 1], ["minecraft:ender_pearl", 2], ["minecraft:cooked_porkchop", 12]],
  },
];

for (const c of classes) {
  const powerIds = [];
  for (const [key, p] of Object.entries(c.powers)) { out(`pony0n/powers/${c.id}/${key}.json`, p); powerIds.push(`pony0n:${c.id}/${key}`); }
  out(`pony0n/powers/${c.id}/kit.json`, kitPower(c.id, c.kit));
  powerIds.push(`pony0n:${c.id}/kit`);
  out(`pony0n/origins/${c.id}.json`, {
    name: c.name, description: c.description, icon: { item: c.icon }, impact: c.impact, order: classes.indexOf(c) + 1, powers: powerIds,
  });
}
out("pony0n/origin_layers/clase.json", {
  order: 10,
  enabled: true,
  name: "Clase",
  missing_name: "Clase",
  missing_description: "Elige una clase",
  origins: classes.map((c) => `pony0n:${c.id}`),
  gui_title: { view_origin: "Tu clase", choose_origin: "Elige tu clase" },
});

console.log(`razas: ${RACES.length}, clases: ${classes.length}`);
