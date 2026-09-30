import { T, R } from "../../quest-dsl.mjs";

// Rama transversal: Oficios. Cada oficio sube solo al hacer sus tareas (ver tools/gen-skills.mjs).
// Aquí cada oficio tiene: presentación, práctica con objetos del oficio, hito I (stage oficio_X_1) y hito II (oficio_X_2).
const job = (id, name, intro, practice, rewardItem) => [
  { k: `${id}_intro`, t: `Oficio: ${name}`, sub: "Presentación", deps: ["bienvenida.oficios"],
    d: [intro, `Abre el árbol de habilidades (&6K&r) y busca la pestaña de ${name}. Cada nivel del oficio te da 1 punto para su árbol.`],
    tasks: [T.check()], rewards: [R.job(id, 40), R.skill(60)] },
  { k: `${id}_practica`, t: `${name}: práctica`, sub: "Haz el trabajo", deps: [`${id}_intro`],
    d: practice.desc, tasks: practice.tasks, rewards: [R.job(id, practice.xp), R.skill(120), rewardItem] },
  { k: `${id}_h1`, t: `${name} I`, sub: "Hito de oficio", deps: [`${id}_practica`],
    d: [`Sube en el árbol de ${name} hasta &6Fundamentos VI&r. Esto activa el hito ${name} I.`],
    tasks: [T.stage(`oficio_${id}_1`)], rewards: [R.job(id, 100), R.skill(200), R.coins({ oro: 2 })] },
  { k: `${id}_h2`, t: `${name} II`, sub: "Maestría", deps: [`${id}_h1`],
    d: [`Llega hasta la cima de uno de los dos caminos de ${name}. Es el hito de maestría del oficio.`],
    tasks: [T.stage(`oficio_${id}_2`)], rewards: [R.skill(500), R.coins({ esmeralda: 3 })] },
];

export default {
  key: "oficios", order: 13, group: "ramas", icon: "minecraft:anvil",
  title: "Oficios",
  sub: "Siete oficios que suben mientras haces sus tareas",
  quests: [
    ...job("minero", "Minero", "El minero sube picando minerales (mucho) y roca (poco).",
      { desc: ["Pica minerales: cada uno da experiencia de oficio. Consigue diamantes y esmeraldas."], tasks: [T.item("minecraft:diamond", 3), T.item("minecraft:emerald", 3)], xp: 150 }, R.item("minecraft:iron_pickaxe")),
    ...job("lenador", "Leñador", "El leñador sube talando árboles.",
      { desc: ["Tala árboles y consigue troncos de varios tipos."], tasks: [T.item("minecraft:oak_log", 32), T.item("minecraft:spruce_log", 32)], xp: 120 }, R.item("minecraft:iron_axe")),
    ...job("granjero", "Granjero", "El granjero sube cosechando cultivos maduros (no vale romper los brotes).",
      { desc: ["Cosecha trigo, zanahorias y patatas maduras."], tasks: [T.item("minecraft:wheat", 32), T.item("minecraft:carrot", 16), T.item("minecraft:potato", 16)], xp: 120 }, R.item("minecraft:iron_hoe")),
    ...job("pescador", "Pescador", "El pescador sube pescando.",
      { desc: ["Pesca peces variados."], tasks: [T.item("minecraft:cod", 8), T.item("minecraft:salmon", 8)], xp: 120 }, R.item("minecraft:fishing_rod")),
    ...job("herrero", "Herrero", "El herrero sube fabricando herramientas, armas y armaduras, y fundiendo lingotes.",
      { desc: ["Fabrica armas y herramientas de hierro y funde lingotes."], tasks: [T.item("minecraft:iron_sword"), T.item("minecraft:iron_pickaxe"), T.item("minecraft:iron_ingot", 32)], xp: 150 }, R.item("minecraft:anvil")),
    ...job("cocinero", "Cocinero", "El cocinero sube cocinando carne y pescado, y comiendo.",
      { desc: ["Cocina carne y pescado, y prepara comida variada."], tasks: [T.item("minecraft:cooked_beef", 16), T.item("minecraft:cooked_porkchop", 16), T.item("minecraft:baked_potato", 16)], xp: 120 }, R.item("minecraft:smoker")),
    ...job("encantador", "Encantador", "El encantador sube encantando objetos: más nivel de encantamiento, más experiencia.",
      { desc: ["Encanta objetos en la mesa de encantamientos."], tasks: [T.item("minecraft:enchanted_book", 3)], xp: 150 }, R.item("minecraft:lapis_lazuli", 32)),
  ],
};
