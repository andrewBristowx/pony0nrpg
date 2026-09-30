import { T, R } from "../../quest-dsl.mjs";

// Capítulo 4 — La revolución de Create (niveles 30–40, ~9 000 XP repartidos)
export default {
  key: "create", order: 4, group: "campana", icon: "create:cogwheel",
  title: "4. La revolución de Create",
  sub: "Has aprendido a sobrevivir. Ahora descubre el poder de las máquinas.",
  quests: [
    { k: "ingeniero", t: "Las máquinas despiertan", sub: "Contexto", deps: ["aventurero.cierre"],
      d: ["Create mueve el mundo con fuerza rotatoria: ejes, engranajes, ruedas y motores. Todo se mide en RPM y en estrés.",
          "Aquí aprenderás desde tu primer engranaje hasta un tren. Ponte las gafas de ingeniero (goggles) cuando las tengas: te muestran RPM y estrés."],
      tasks: [T.check()], rewards: [R.skill(500), R.coins({ oro: 5 })] },

    { k: "andesita", t: "Aleación de andesita", sub: "El ingrediente base", deps: ["ingeniero"],
      d: ["Casi todo en Create empieza con la aleación de andesita: pepitas de hierro + andesita en una mesa de trabajo."],
      tasks: [T.item("create:andesite_alloy", 16)], rewards: [R.skill(560), R.item("create:cogwheel", 4)] },

    { k: "movimiento", t: "Movimiento", sub: "Fuerza rotacional", deps: ["andesita"],
      d: ["Una rueda hidráulica colocada junto al agua en movimiento, o un molino de viento, produce fuerza sin combustible.",
          "Comprueba el estrés con los goggles."],
      tasks: [T.item("create:water_wheel")], rewards: [R.skill(580), R.item("create:shaft", 8)] },
    { k: "molino", t: "Molino de viento (opcional)", sub: "Otra fuente", deps: ["movimiento"], opt: true,
      d: ["Un rodamiento de molino con velas produce fuerza continua sin agua."],
      tasks: [T.item("create:windmill_bearing")], rewards: [R.skill(500)] },

    { k: "transmision", t: "Transmisión", sub: "Dirección y velocidad", deps: ["movimiento"],
      d: ["Los ejes transmiten. Los engranajes cambian la dirección. Los engranajes grandes cambian la velocidad. Una caja de cambios invierte el sentido."],
      tasks: [T.item("create:shaft", 8), T.item("create:cogwheel", 4), T.item("create:large_cogwheel"), T.item("create:gearbox")],
      rewards: [R.skill(600), R.item("create:belt_connector", 4)] },

    { k: "prensa", t: "Prensa mecánica", sub: "Tu primera máquina", deps: ["transmision"],
      d: ["La prensa convierte lingotes en placas. Colócala sobre un depósito o una cinta con un lingote debajo y aliméntala con fuerza."],
      tasks: [T.item("create:mechanical_press"), T.item("create:iron_sheet", 8)],
      rewards: [R.skill(620), R.job("herrero", 60)] },

    { k: "taladro", t: "Taladro mecánico", sub: "Minado automático", deps: ["prensa"],
      d: ["Un taladro rompe bloques por ti mientras recibe fuerza. Ponlo frente a una veta y recoge los objetos."],
      tasks: [T.item("create:mechanical_drill")],
      rewards: [R.skill(640), R.job("minero", 80), R.item("create:andesite_casing", 4)] },

    { k: "sierra", t: "Sierra mecánica", sub: "Tala automática", deps: ["prensa"],
      d: ["La sierra corta troncos y árboles. También procesa madera en tablones desde una cinta."],
      tasks: [T.item("create:mechanical_saw")],
      rewards: [R.skill(640), R.job("lenador", 80)] },

    { k: "cintas", t: "Cintas y embudos", sub: "Logística", deps: ["taladro", "sierra"],
      d: ["Las cintas mueven objetos. Los embudos los meten y sacan de los contenedores. Con estas dos piezas empieza cualquier fábrica.",
          "&6Pista del futuro:&r Mekanism y otros mods te pedirán componentes de Create más adelante, así que guarda planchas y mecanismos."],
      tasks: [T.item("create:belt_connector", 16), T.item("create:andesite_funnel", 4)],
      rewards: [R.skill(660), R.item("create:chute", 4)] },

    { k: "mezclador", t: "Mezclador y cuenco", sub: "Procesamiento", deps: ["cintas"],
      d: ["El cuenco y el mezclador combinan ingredientes. Con calor (un quemador de blaze) fabrican latón: cobre + zinc.",
          "El latón abre una segunda mitad de recetas de Create."],
      tasks: [T.item("create:basin"), T.item("create:mechanical_mixer"), T.item("create:brass_ingot", 8)],
      rewards: [R.skill(700), R.item("create:blaze_burner")] },

    { k: "hierro_auto", t: "Fábrica de hierro", sub: "Automatiza un recurso", deps: ["mezclador"],
      d: ["Automatiza la producción de placas de hierro: taladro o mena → cinta → prensa → cofre. Sin intervención.",
          "Cuando la fábrica esté sola, recoge las placas."],
      tasks: [T.item("create:iron_sheet", 64)],
      rewards: [R.skill(760), R.coins({ esmeralda: 3 })] },

    { k: "almacen", t: "Almacenamiento", sub: "Bóvedas", deps: ["cintas"],
      d: ["Las bóvedas de objetos guardan miles de objetos y se conectan con embudos y cintas.", "Usa la mochila (&6B&r) para llevar contigo lo importante."],
      tasks: [T.item("create:item_vault", 2)],
      rewards: [R.skill(680), R.item("sophisticatedbackpacks:stack_upgrade_tier_1")] },

    { k: "produccion", t: "Línea de producción", sub: "Cadenas de procesado", deps: ["hierro_auto", "almacen"],
      d: ["Encadena máquinas: placas de cobre y latón, envases de diamante y más. Un mecanismo de precisión es la pieza estrella: se monta en una cadena con un desplegador.",
          "Fabrica algunos mecanismos: los necesitarás para todo lo que viene."],
      tasks: [T.item("create:brass_sheet", 16), T.item("create:copper_sheet", 16), T.item("create:precision_mechanism", 2)],
      rewards: [R.skill(800), R.coins({ esmeralda: 3 })] },

    { k: "desplegador", t: "Desplegador (opcional)", sub: "Manos mecánicas", deps: ["produccion"], opt: true,
      d: ["El desplegador usa objetos por ti: coloca bloques, ensambla piezas, hasta ataca."],
      tasks: [T.item("create:deployer")], rewards: [R.skill(700)] },
    { k: "vapor", t: "Motor de vapor (opcional)", sub: "Mucha fuerza", deps: ["produccion"], opt: true,
      d: ["Una caldera con agua y calor alimenta motores de vapor que dan un montón de estrés."],
      tasks: [T.item("create:steam_engine")], rewards: [R.skill(700)] },

    { k: "tren_via", t: "Vías", sub: "Steam 'n' Rails", deps: ["produccion"],
      d: ["Los trenes de Create usan sus propias vías. Con Steam 'n' Rails tienes más tipos de vía y decoración."],
      tasks: [T.item("create:track", 16)], rewards: [R.skill(800), R.item("create:controls")] },
    { k: "tren_estacion", t: "Estación de tren", sub: "Movimiento a gran escala", deps: ["tren_via"],
      d: ["Coloca una estación, monta un vagón con controles y ponle nombre a tu tren. Un tren une tu base con tus fábricas y con el mundo."],
      tasks: [T.item("create:controls"), T.item("create:track_station")],
      rewards: [R.skill(900), R.coins({ esmeralda: 4 })] },

    { k: "cierre", t: "Fábrica completa", sub: "Cierre del capítulo", deps: ["produccion", "tren_estacion"],
      d: ["Tienes una fábrica con recursos automáticos y una estación de tren. Entrega tus mecanismos de precisión para abrir la era tecnológica.", "Se abre el capítulo 5."],
      tasks: [T.item("create:precision_mechanism", 4, { consume: true })],
      rewards: [R.skill(1200), R.stage("era_tech"), R.coins({ diamante: 2 })] },
  ],
};
