import { T, R } from "../../quest-dsl.mjs";

// Capítulo 1 — El comienzo (niveles 1–10, ~1 900 XP de habilidades repartidos en las misiones)
export default {
  key: "comienzo", order: 1, group: "campana", icon: "minecraft:oak_log",
  title: "1. El comienzo",
  sub: "El mundo ha cambiado. Antes de aventurarte tendrás que aprender a sobrevivir.",
  quests: [
    { k: "despertar", t: "Despertar", sub: "Tu primera misión", deps: ["bienvenida.listo"],
      d: ["Has despertado en un mundo distinto. Lo primero es reunir recursos.", "Consigue madera de cualquier árbol y crea palos: entrarás en el ciclo de recoger y fabricar."],
      tasks: [T.item("minecraft:stick", 8)],
      rewards: [R.skill(60), R.coins({ cobre: 30 })] },

    { k: "mesa", t: "Mesa de trabajo", sub: "Crafteo básico", deps: ["despertar"],
      d: ["Con una mesa de trabajo puedes fabricar casi todo. Si no recuerdas la receta, mira el objeto en JEI (&6R&r)."],
      tasks: [T.item("minecraft:crafting_table")],
      rewards: [R.skill(70), R.item("minecraft:bread", 4)] },

    { k: "herramientas", t: "Herramientas", sub: "Cada material, un nivel", deps: ["mesa"],
      d: ["Un pico y un hacha de madera te permiten conseguir piedra y madera más rápido.", "Pico: piedra y minerales. Hacha: madera."],
      tasks: [T.item("minecraft:wooden_pickaxe"), T.item("minecraft:wooden_axe")],
      rewards: [R.skill(80), R.job("lenador", 20)] },

    { k: "piedra", t: "Herramientas de piedra", sub: "Un salto de calidad", deps: ["herramientas"],
      d: ["La piedra dura más que la madera y sirve para minar hierro. Consigue adoquín con tu pico."],
      tasks: [T.adv("minecraft:story/mine_stone"), T.item("minecraft:stone_pickaxe")],
      rewards: [R.skill(90), R.job("minero", 25)] },

    { k: "refugio", t: "Refugio", sub: "Noche, mobs y respawn", deps: ["piedra"],
      d: ["De noche salen monstruos. Construye un refugio con antorchas y un cofre, y duerme para fijar tu punto de reaparición.", "Necesitas una cama: lana + tablones."],
      tasks: [T.item("minecraft:torch", 8), T.item("minecraft:chest"), T.stat("minecraft:sleep_in_bed", 1)],
      rewards: [R.skill(100), R.item("minecraft:white_bed")] },

    { k: "noche", t: "La primera noche", sub: "Combate defensivo", deps: ["refugio"],
      d: ["Defiéndete: acaba con unos zombis. Ataca, retrocede y cúrate; el combate es mejor con tiempo entre golpes."],
      tasks: [T.kill("minecraft:zombie", 3)],
      rewards: [R.skill(110), R.item("minecraft:stone_sword")] },

    { k: "hierro", t: "Bajo tierra", sub: "Minería y niveles Y", deps: ["noche"],
      d: ["El hierro aparece entre las alturas Y 0 y 60 aproximadamente. Baja a una cueva con antorchas y no caves justo hacia abajo."],
      tasks: [T.item("minecraft:raw_iron", 6)],
      rewards: [R.skill(130), R.job("minero", 60)] },

    { k: "horno", t: "Horno", sub: "Fundición", deps: ["hierro"],
      d: ["Funde el hierro en un horno con carbón o madera como combustible."],
      tasks: [T.item("minecraft:furnace"), T.item("minecraft:iron_ingot", 6)],
      rewards: [R.skill(140), R.item("minecraft:cooked_beef", 8)] },

    { k: "armadura", t: "Armadura", sub: "Defensa", deps: ["horno"],
      d: ["Fabrica al menos una pieza de armadura de hierro y póntela."],
      tasks: [T.adv("minecraft:story/obtain_armor")],
      rewards: [R.skill(150), R.job("herrero", 40)] },

    { k: "cosecha", t: "Cosecha", sub: "Agricultura", deps: ["piedra"],
      d: ["Cultiva trigo con semillas, espera a que madure y hornea pan.", "Con Farmer's Delight tendrás más recetas de cocina más adelante."],
      tasks: [T.item("minecraft:bread", 3)],
      rewards: [R.skill(120), R.job("granjero", 50), R.item("minecraft:wheat_seeds", 8)] },

    { k: "elige_camino", t: "Elige tu camino", sub: "Clase", deps: ["noche"],
      d: ["Abre el árbol de habilidades (&6K&r) y gasta tu primer punto en el primer nodo de una clase. Las misiones siguientes se completan solas según la clase que elijas."],
      tasks: [T.check()],
      rewards: [R.skill(60)] },

    { k: "c_guerrero", t: "Camino del Guerrero", sub: "Armas pesadas y armadura", deps: ["elige_camino"], opt: true,
      d: ["Tier I de Guerrero: mandobles, hachas de batalla y mazas."],
      tasks: [T.stage("clase_guerrero")], rewards: [R.skill(80)] },
    { k: "c_arquero", t: "Camino del Arquero", sub: "Arcos y ballestas", deps: ["elige_camino"], opt: true,
      d: ["Tier I de Arquero: arcos largos y ballestas pesadas."],
      tasks: [T.stage("clase_arquero")], rewards: [R.skill(80)] },
    { k: "c_mago", t: "Camino del Mago", sub: "Hechizos y grimorios", deps: ["elige_camino"], opt: true,
      d: ["Tier I de Mago: bastones, grimorios básicos y lanzar hechizos."],
      tasks: [T.stage("clase_mago")], rewards: [R.skill(80)] },
    { k: "c_ingeniero", t: "Camino del Ingeniero", sub: "Minería y máquinas", deps: ["elige_camino"], opt: true,
      d: ["Ingeniero: más velocidad de minado, suerte y experiencia. Tus máquinas llegarán en el capítulo 4."],
      tasks: [T.stage("clase_ingeniero")], rewards: [R.skill(80)] },
    { k: "c_asesino", t: "Camino del Asesino", sub: "Armas ligeras", deps: ["elige_camino"], opt: true,
      d: ["Tier I de Asesino: dagas, katanas y armas rápidas."],
      tasks: [T.stage("clase_asesino")], rewards: [R.skill(80)] },

    { k: "primera_habilidad", t: "Tu primera habilidad", sub: "Pufferfish", any: true,
      deps: ["c_guerrero", "c_arquero", "c_mago", "c_ingeniero", "c_asesino"],
      d: ["Ya tienes clase. Cada nivel te dará más puntos; elige con calma cómo repartirlos (puedes reiniciar el árbol)."],
      tasks: [T.check()], rewards: [R.skill(100)] },

    { k: "cierre", t: "De vuelta al spawn", sub: "Cierre del capítulo", deps: ["armadura", "cosecha", "primera_habilidad"],
      d: ["Has sobrevivido a tu primera noche, tienes herramientas, armadura y comida. Entrega lingotes de hierro y pan para completar el capítulo.", "Al terminar se abre el capítulo 2."],
      tasks: [T.item("minecraft:iron_ingot", 5, { consume: true }), T.item("minecraft:bread", 3, { consume: true })],
      rewards: [R.skill(200), R.stage("era_2"), R.coins({ hierro: 20 }), R.item("minecraft:iron_sword")] },
  ],
};
