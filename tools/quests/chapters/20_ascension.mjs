import { T, R } from "../../quest-dsl.mjs";

// Ascensión: un capítulo por clase. Cada misión da 1 punto (o más) en la categoría ascension_<clase> de Pufferfish.
// Desbloqueo: la primera misión exige el stage "era_10" (campaña completada). Para probar: /kubejs stages add @s era_10
// Cada clase tiene ahora ~10 misiones; el árbol admite hasta 50 puntos, así que estos capítulos crecerán.
const asc = (cls, name, icon, intro, quests) => ({
  key: `ascension_${cls}`, order: 20, group: "ascension", icon,
  title: `Ascensión: ${name}`,
  sub: `Puntos de Ascensión para ${name}`,
  quests: [
    { k: "puerta", t: `La puerta de la Ascensión`, sub: "Se abre al terminar la campaña",
      d: ["La Ascensión es el camino después del nivel 100: cada misión de tu clase te da puntos de Ascensión, con bonos pequeños y permanentes.",
          "Esta misión se completa sola cuando terminas la campaña (stage &6era_10&r)."],
      tasks: [T.stage("era_10")], rewards: [R.skill(100)] },
    { k: "elige", t: `Elige la Ascensión de ${name}`, sub: "Desbloquea la pestaña", deps: ["puerta"],
      d: [intro, "Al recoger el premio se desbloquea la pestaña de Ascensión de esta clase en el árbol de habilidades (&6K&r)."],
      tasks: [T.check()], rewards: [R.unlockAsc(cls), R.asc(cls, 1)] },
    ...quests.map((q, i) => ({
      k: `m${i + 1}`, t: q.t, sub: q.sub, d: q.d, tasks: q.tasks,
      deps: [i === 0 ? "elige" : `m${i}`],
      rewards: [R.asc(cls, q.pts || 1), R.skill(500), ...(q.extra || [])],
    })),
  ],
});

export default [
  asc("guerrero", "Guerrero", "minecraft:netherite_sword", "El Guerrero se hace más resistente y más letal con cada punto.", [
    { t: "Fuerza bruta", sub: "Mata sin descanso", d: ["Acaba con 200 zombis: la fuerza se gana golpeando."], tasks: [T.kill("minecraft:zombie", 200)] },
    { t: "Muralla", sub: "Bloquea el daño", d: ["Bloquea daño con tu escudo hasta acumular una gran cantidad."], tasks: [T.stat("minecraft:damage_blocked_by_shield", 5000)] },
    { t: "Armadura completa", sub: "Un titán de netherita", d: ["Fabrica una armadura de netherita, aunque sea una pieza."], tasks: [T.item("minecraft:netherite_chestplate")] },
    { t: "Hoja de guerra", sub: "El mandoble definitivo", d: ["Forja un mandoble de netherita."], tasks: [T.item("simplyswords:netherite_claymore")] },
    { t: "Contra el Wither", sub: "Prueba de valor", d: ["Derrota al Wither. Prepara pociones, armadura encantada y un plan."], tasks: [T.kill("minecraft:wither", 1)], pts: 2 },
    { t: "Aguante", sub: "Recibe golpes", d: ["Resiste un gran volumen de daño acumulado."], tasks: [T.stat("minecraft:damage_taken", 10000)] },
    { t: "Aplasta devastadores", sub: "Raid", d: ["Acaba con 10 devastadores."], tasks: [T.kill("minecraft:ravager", 10)] },
    { t: "Maestría final", sub: "Tier III", d: ["Llega a la cima de un camino de Guerrero (Tier III)."], tasks: [T.stage("maestria_guerrero_3")], pts: 2 },
  ]),
  asc("arquero", "Arquero", "minecraft:bow", "El Arquero gana precisión y velocidad con cada punto.", [
    { t: "Ojo de halcón", sub: "Tiros certeros", d: ["Derrota 200 esqueletos con tu arco."], tasks: [T.kill("minecraft:skeleton", 200)] },
    { t: "Cazador de fantasmas", sub: "Los cielos", d: ["Derriba 30 fantasmas."], tasks: [T.kill("minecraft:phantom", 30)] },
    { t: "Arco supremo", sub: "Materiales nobles", d: ["Fabrica un arco largo de diamante."], tasks: [T.item("spartanweaponry:diamond_longbow")] },
    { t: "Flechas espectrales", sub: "Munición", d: ["Reúne 64 flechas espectrales."], tasks: [T.item("minecraft:spectral_arrow", 64)] },
    { t: "Ghast a distancia", sub: "Dispara a la bola", d: ["Derrota 10 ghasts, de lejos."], tasks: [T.kill("minecraft:ghast", 10)] },
    { t: "Corredor de largas distancias", sub: "Movilidad", d: ["Recorre una gran distancia a pie."], tasks: [T.stat("minecraft:walk_one_cm", 500000)] },
    { t: "Cazador de blazes", sub: "El Nether", d: ["Derrota 50 blazes."], tasks: [T.kill("minecraft:blaze", 50)] },
    { t: "Maestría final", sub: "Tier III", d: ["Llega a la cima de un camino de Arquero (Tier III)."], tasks: [T.stage("maestria_arquero_3")], pts: 2 },
  ]),
  asc("mago", "Mago", "minecraft:enchanted_book", "El Mago crece en poder mágico y maná con cada punto.", [
    { t: "Caza de brujas", sub: "Práctica", d: ["Elimina 20 brujas."], tasks: [T.kill("minecraft:witch", 20)] },
    { t: "Grimorio superior", sub: "Un libro mayor", d: ["Fabrica un grimorio de diamante."], tasks: [T.item("irons_spellbooks:diamond_spell_book")] },
    { t: "Libro del archimago", sub: "Ars Nouveau", d: ["Consigue el libro de hechizos de archimago."], tasks: [T.item("ars_nouveau:archmage_spell_book")] },
    { t: "Tinta legendaria", sub: "El arte de escribir", d: ["Consigue tinta legendaria para tus pergaminos."], tasks: [T.item("irons_spellbooks:legendary_ink")] },
    { t: "Contra la Naga y el Lich", sub: "Bosque Crepuscular", d: ["Completa la torre del Lich."], tasks: [T.adv("twilightforest:progress_lich")] },
    { t: "Fuego de blaze", sub: "El Nether", d: ["Derrota 40 blazes."], tasks: [T.kill("minecraft:blaze", 40)] },
    { t: "Contra el Wither", sub: "Prueba mágica", d: ["Derrota al Wither con magia."], tasks: [T.kill("minecraft:wither", 1)], pts: 2 },
    { t: "Maestría final", sub: "Tier III", d: ["Llega a la cima de un camino de Mago (Tier III)."], tasks: [T.stage("maestria_mago_3")], pts: 2 },
  ]),
  asc("ingeniero", "Ingeniero", "create:precision_mechanism", "El Ingeniero optimiza cada tarea: más minería, suerte y experiencia.", [
    { t: "Bóvedas rebosantes", sub: "Almacenamiento", d: ["Construye 8 bóvedas de Create."], tasks: [T.item("create:item_vault", 8)] },
    { t: "Chapa de latón", sub: "Producción", d: ["Entrega 64 placas de latón a tu fábrica.", "Se consumen al entregar."], tasks: [T.item("create:brass_sheet", 64, { consume: true })] },
    { t: "Circuito supremo", sub: "Mekanism", d: ["Fabrica un circuito de control definitivo."], tasks: [T.item("mekanism:ultimate_control_circuit")] },
    { t: "Célula de 4K", sub: "AE2", d: ["Fabrica una célula de almacenamiento de 4K."], tasks: [T.item("ae2:item_storage_cell_4k")] },
    { t: "Obsidiana refinada", sub: "Mekanism", d: ["Consigue un lingote de obsidiana refinada."], tasks: [T.item("mekanism:ingot_refined_obsidian")] },
    { t: "Motor de vapor", sub: "Create", d: ["Construye un motor de vapor."], tasks: [T.item("create:steam_engine")] },
    { t: "Faro del ingeniero", sub: "Baliza", d: ["Construye una baliza."], tasks: [T.item("minecraft:beacon")], pts: 2 },
    { t: "Maestría final", sub: "Tier III", d: ["Llega a la cima de un camino de Ingeniero (Tier III)."], tasks: [T.stage("maestria_ingeniero_3")], pts: 2 },
  ]),
  asc("asesino", "Asesino", "minecraft:netherite_axe", "El Asesino golpea rápido, esquiva y remata.", [
    { t: "Golpe de sombra", sub: "Endermen", d: ["Derrota 50 endermen."], tasks: [T.kill("minecraft:enderman", 50)] },
    { t: "Verdugo del Nether", sub: "Esqueletos", d: ["Derrota 40 esqueletos del Wither."], tasks: [T.kill("minecraft:wither_skeleton", 40)] },
    { t: "Daga de netherita", sub: "El filo silencioso", d: ["Forja una daga de netherita."], tasks: [T.item("spartanweaponry:netherite_dagger")] },
    { t: "Cazador nocturno", sub: "Phantoms", d: ["Derrota 30 fantasmas."], tasks: [T.kill("minecraft:phantom", 30)] },
    { t: "Sigilo prolongado", sub: "Agáchate y avanza", d: ["Recorre una larga distancia agachado."], tasks: [T.stat("minecraft:crouch_one_cm", 100000)] },
    { t: "Devastadores", sub: "Raid", d: ["Acaba con 10 devastadores."], tasks: [T.kill("minecraft:ravager", 10)] },
    { t: "Contra el Wither", sub: "Prueba final", d: ["Derrota al Wither."], tasks: [T.kill("minecraft:wither", 1)], pts: 2 },
    { t: "Maestría final", sub: "Tier III", d: ["Llega a la cima de un camino de Asesino (Tier III)."], tasks: [T.stage("maestria_asesino_3")], pts: 2 },
  ]),
];
