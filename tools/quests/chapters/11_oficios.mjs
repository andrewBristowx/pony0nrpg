import { T, R } from "../../quest-dsl.mjs";

// Rama transversal: Oficios. Cada jugador elige UN oficio con su maestro (kubejs/server_scripts/gremio_oficios.js, stage trabajo_<id>) y solo ve el
// capítulo de ese oficio: el juramento es invisible hasta que se completa su tarea (tener el oficio) y las demás misiones no se ven si sus
// dependencias no se ven (FTB Quests oculta los capítulos sin misiones visibles). El oficio sube solo al hacer sus tareas (ver tools/gen-skills.mjs).
// OJO: la tarea "stage" comprueba ETIQUETAS de entidad; gremio_oficios.js las pone al confirmar y stages_tags.js las sincroniza.
// Cada capítulo: juramento, presentación, práctica con objetos del oficio, hito I (stage oficio_X_1) y hito II (oficio_X_2).
const job = (id, name, icon, intro, practice, rewardItem) => ({
  key: `oficio_${id}`, order: 13, group: "ramas", icon,
  title: `Oficio: ${name}`,
  sub: `Misiones del ${name}`,
  quests: [
    { k: "juramento", t: `Juramento del ${name}`, sub: "Elige tu oficio", invisible: true,   // sin dependencias: FTB Quests no avanza tareas de una mision cuyas dependencias no estan completas
      d: [intro,
          `Habla con el maestro de oficio de tu pueblo (al norte de la plaza, enfrente de los maestros de rol). Al confirmar el oficio de ${name}, esta misión se completa sola (stage &6trabajo_${id}&r).`,
          "&cEl oficio no se puede cambiar&r: solo tendrás el árbol y las misiones de este oficio."],
      tasks: [T.stage(`trabajo_${id}`)], rewards: [R.job(id, 40), R.skill(60)] },
    { k: `${id}_intro`, t: `Oficio: ${name}`, sub: "Presentación", deps: ["juramento"], hideUntilDepsVisible: true,
      d: [intro, `Abre el árbol de habilidades (&6K&r) y busca la pestaña de ${name}. Cada nivel del oficio te da 1 punto para su árbol.`],
      tasks: [T.check()], rewards: [R.job(id, 40), R.skill(60)] },
    { k: `${id}_practica`, t: `${name}: práctica`, sub: "Haz el trabajo", deps: [`${id}_intro`], hideUntilDepsVisible: true,
      d: practice.desc, tasks: practice.tasks, rewards: [R.job(id, practice.xp), R.skill(120), rewardItem] },
    { k: `${id}_h1`, t: `${name} I`, sub: "Hito de oficio", deps: [`${id}_practica`], hideUntilDepsVisible: true,
      d: [`Sube en el árbol de ${name} hasta &6Fundamentos VI&r. Esto activa el hito ${name} I.`],
      tasks: [T.stage(`oficio_${id}_1`)], rewards: [R.job(id, 100), R.skill(200), R.coins({ oro: 2 })] },
    { k: `${id}_h2`, t: `${name} II`, sub: "Maestría", deps: [`${id}_h1`], hideUntilDepsVisible: true,
      d: [`Llega hasta la cima de uno de los dos caminos de ${name}. Es el hito de maestría del oficio.`],
      tasks: [T.stage(`oficio_${id}_2`)], rewards: [R.skill(500), R.coins({ esmeralda: 3 })] },
  ],
});

export default [
  job("minero", "Minero", "minecraft:iron_pickaxe", "El minero sube picando minerales (mucho) y roca (poco).",
    { desc: ["Pica minerales: cada uno da experiencia de oficio. Consigue diamantes y esmeraldas."], tasks: [T.item("minecraft:diamond", 3), T.item("minecraft:emerald", 3)], xp: 150 }, R.item("minecraft:iron_pickaxe")),
  job("lenador", "Leñador", "minecraft:iron_axe", "El leñador sube talando árboles.",
    { desc: ["Tala árboles y consigue troncos de varios tipos."], tasks: [T.item("minecraft:oak_log", 32), T.item("minecraft:spruce_log", 32)], xp: 120 }, R.item("minecraft:iron_axe")),
  job("granjero", "Granjero", "minecraft:iron_hoe", "El granjero sube cosechando cultivos maduros (no vale romper los brotes).",
    { desc: ["Cosecha trigo, zanahorias y patatas maduras."], tasks: [T.item("minecraft:wheat", 32), T.item("minecraft:carrot", 16), T.item("minecraft:potato", 16)], xp: 120 }, R.item("minecraft:iron_hoe")),
  job("pescador", "Pescador", "minecraft:fishing_rod", "El pescador sube pescando.",
    { desc: ["Pesca peces variados."], tasks: [T.item("minecraft:cod", 8), T.item("minecraft:salmon", 8)], xp: 120 }, R.item("minecraft:fishing_rod")),
  job("herrero", "Herrero", "minecraft:anvil", "El herrero sube fabricando herramientas, armas y armaduras, y fundiendo lingotes.",
    { desc: ["Fabrica armas y herramientas de hierro y funde lingotes."], tasks: [T.item("minecraft:iron_sword"), T.item("minecraft:iron_pickaxe"), T.item("minecraft:iron_ingot", 32)], xp: 150 }, R.item("minecraft:anvil")),
  job("cocinero", "Cocinero", "minecraft:smoker", "El cocinero sube cocinando carne y pescado, y comiendo.",
    { desc: ["Cocina carne y pescado, y prepara comida variada."], tasks: [T.item("minecraft:cooked_beef", 16), T.item("minecraft:cooked_porkchop", 16), T.item("minecraft:baked_potato", 16)], xp: 120 }, R.item("minecraft:smoker")),
  job("encantador", "Encantador", "minecraft:enchanting_table", "El encantador sube encantando objetos: más nivel de encantamiento, más experiencia.",
    { desc: ["Encanta objetos en la mesa de encantamientos."], tasks: [T.item("minecraft:enchanted_book", 3)], xp: 150 }, R.item("minecraft:lapis_lazuli", 32)),
];
