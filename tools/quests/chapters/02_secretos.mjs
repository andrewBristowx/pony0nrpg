import { T, R } from "../../quest-dsl.mjs";

// Capítulo 2 — Secretos de la tierra (niveles 10–20, ~3 200 XP repartidos)
export default {
  key: "secretos", order: 2, group: "campana", icon: "minecraft:diamond_pickaxe",
  title: "2. Secretos de la tierra",
  sub: "Minería avanzada, exploración, encantamientos y tus primeras ruinas.",
  quests: [
    { k: "diamante", t: "Brillo de diamante", sub: "Minería profunda", deps: ["comienzo.cierre"],
      d: ["Los diamantes aparecen muy abajo, cerca de la capa Y -58. Lleva antorchas, comida y un pico de hierro, y ten cuidado con la lava.",
          "El nivel de tu oficio de Minero sube mientras picas."],
      tasks: [T.adv("minecraft:story/mine_diamond")],
      rewards: [R.skill(200), R.job("minero", 120), R.coins({ hierro: 15 })] },

    { k: "encantar", t: "Mesa de encantamientos", sub: "Encantar", deps: ["diamante"],
      d: ["Con una mesa de encantamientos y lapislázuli puedes mejorar herramientas y armas. Rodéala de estanterías para opciones mejores.",
          "El oficio de Encantador sube cada vez que encantas algo."],
      tasks: [T.item("minecraft:enchanting_table"), T.adv("minecraft:story/enchant_item")],
      rewards: [R.skill(220), R.job("encantador", 100), R.item("minecraft:lapis_lazuli", 16)] },

    { k: "brujula", t: "Brújula del explorador", sub: "Encuentra estructuras", deps: ["diamante"],
      d: ["La brújula del explorador te indica hacia dónde está la estructura que elijas más cercana. Es la mejor amiga de un aventurero.",
          "La brújula de la naturaleza hace lo mismo con los biomas."],
      tasks: [T.item("explorerscompass:explorerscompass"), T.item("naturescompass:naturescompass")],
      rewards: [R.skill(220), R.coins({ hierro: 10 })] },

    { k: "mochila", t: "Una mochila", sub: "Más espacio, menos viajes", deps: ["comienzo.cierre"],
      d: ["Las mochilas de Sophisticated Backpacks se pueden mejorar con mejoras (recoger objetos, imán, bomba…). Equípala y pulsa &6B&r para abrirla."],
      tasks: [T.item("sophisticatedbackpacks:backpack")],
      rewards: [R.skill(180), R.item("sophisticatedbackpacks:pickup_upgrade")] },

    { k: "waystone", t: "Piedras de viaje", sub: "Waystones", deps: ["brujula"],
      d: ["Las waystones te permiten teletransportarte entre las que hayas activado. Colocar una junto a tu base te evitará muchos viajes."],
      tasks: [T.item("waystones:waystone")],
      rewards: [R.skill(200), R.item("waystones:warp_stone")] },

    { k: "aldea", t: "Comercio", sub: "Aldeanos", deps: ["brujula"],
      d: ["Los aldeanos comercian con esmeraldas. Busca una aldea y haz un intercambio."],
      tasks: [T.adv("minecraft:adventure/trade")],
      rewards: [R.skill(220), R.coins({ oro: 3 })] },

    { k: "ruinas", t: "Primeras ruinas", sub: "Estructuras", deps: ["brujula"],
      d: ["Las ruinas, minas abandonadas y templos guardan cofres y peligros. Usa tu brújula para encontrar una mina abandonada."],
      tasks: [T.structure("minecraft:mineshaft")],
      rewards: [R.skill(240), R.coins({ hierro: 12 })] },

    { k: "loot", t: "Botín de aventurero", sub: "Objetos con rareza", deps: ["ruinas"],
      d: ["Los monstruos y cofres ahora pueden soltar equipo con rareza y afijos (Apotheosis). Cuanto más rara la rareza, mejor el objeto.",
          "Derrota esqueletos y zombis: prueba suerte."],
      tasks: [T.kill("minecraft:skeleton", 10)],
      rewards: [R.skill(260), R.item("minecraft:experience_bottle", 6)] },

    { k: "cocina", t: "Buena cocina", sub: "Farmer's Delight", deps: ["comienzo.cosecha"],
      d: ["Con la olla de cocina y la tabla de cortar, Farmer's Delight añade platos que dan bonificaciones. El oficio de Cocinero sube al cocinar."],
      tasks: [T.item("farmersdelight:cooking_pot"), T.item("farmersdelight:cutting_board")],
      rewards: [R.skill(180), R.job("cocinero", 100), R.item("farmersdelight:tomato_seeds", 4)] },

    { k: "oficio", t: "Un oficio", sub: "Elige en qué especializarte", deps: ["mochila"],
      d: ["Habla con un maestro de oficio (al norte de la plaza de tu pueblo) y elige UNO: no se puede cambiar. Se abre su pestaña en el árbol de habilidades (&6K&r) y su capítulo de misiones.",
          "Tu oficio sube al hacer sus tareas: pica, tala, cultiva, pesca, forja, cocina o encanta. Cuando llegues al nivel 5 de tu oficio, marca esta misión."],
      tasks: [T.check()],
      rewards: [R.skill(200)] },

    { k: "create1", t: "Primeras máquinas (opcional)", sub: "Introducción a Create", deps: ["mochila"], opt: true,
      d: ["Create mueve el mundo con fuerza rotatoria. Esta rama opcional te enseña lo mínimo; el capítulo 4 trata Create a fondo.",
          "Empieza con una aleación de andesita: andesita + hierro (o pepitas de hierro)."],
      tasks: [T.item("create:andesite_alloy", 4)],
      rewards: [R.skill(160), R.item("create:cogwheel", 2)] },
    { k: "create2", t: "Ejes y engranajes", sub: "Transmisión", deps: ["create1"], opt: true,
      d: ["Los ejes y engranajes transmiten la fuerza rotatoria."],
      tasks: [T.item("create:shaft", 4), T.item("create:cogwheel", 2)],
      rewards: [R.skill(160)] },
    { k: "create3", t: "Rueda hidráulica", sub: "Fuerza gratis", deps: ["create2"], opt: true,
      d: ["Una rueda hidráulica junto al agua en movimiento genera fuerza sin combustible."],
      tasks: [T.item("create:water_wheel")],
      rewards: [R.skill(200), R.item("create:andesite_casing", 4)] },

    { k: "cierre", t: "Manual del aventurero", sub: "Cierre del capítulo", deps: ["encantar", "waystone", "aldea", "loot", "cocina", "oficio"],
      d: ["Sabes minar, explorar, encantar y sobrevivir. Ya estás listo para las mazmorras.", "Al terminar se abre el capítulo 3."],
      tasks: [T.check()],
      rewards: [R.skill(300), R.stage("era_3"), R.coins({ oro: 5 })] },
  ],
};
