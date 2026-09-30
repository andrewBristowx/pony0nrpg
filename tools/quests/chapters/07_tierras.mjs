import { T, R } from "../../quest-dsl.mjs";

// Capítulo 7 — Las tierras olvidadas (niveles 60–70, ~20 000 XP repartidos)
export default {
  key: "tierras", order: 7, group: "campana", icon: "cataclysm:monstrous_horn",
  title: "7. Las tierras olvidadas",
  sub: "Mazmorras enormes, cuevas imposibles y tu primer jefe de Cataclysm.",
  quests: [
    { k: "intro", t: "Tierras olvidadas", sub: "Peligro real", deps: ["magia.cierre"],
      d: ["Más allá de los caminos conocidos hay fortalezas, templos hundidos y cuevas de otro mundo. Aquí cada estructura es una aventura de un buen rato.",
          "Lleva equipo completo, pociones, comida y una ruta de escape. Trabajen en equipo: los jefes de este capítulo no son para ir solo."],
      tasks: [T.check()], rewards: [R.skill(2000), R.coins({ diamante: 2 })] },

    // ---- estructuras ----
    { k: "fuerte", t: "Fuerte ilagerino", sub: "Estructura grande", deps: ["intro"],
      d: ["Los fuertes de los ilagers están llenos de enemigos y botín. Entra con buena armadura y no te separes de tu grupo."],
      tasks: [T.structure("dungeons_arise:illager_fort")], rewards: [R.skill(2200), R.coins({ diamante: 2 })] },
    { k: "coliseo", t: "Coliseo", sub: "Arena de combate", deps: ["intro"],
      d: ["Un coliseo enorme con oleadas de enemigos. Ideal para probar tu equipo de clase."],
      tasks: [T.structure("dungeons_arise:coliseum")], rewards: [R.skill(2200), R.coins({ diamante: 2 })] },
    { k: "fabrica", t: "La fábrica antigua", sub: "Cataclysm", deps: ["intro"], opt: true,
      d: ["Una estructura de metal y engranajes de una civilización perdida. Custodia un jefe mecánico."],
      tasks: [T.structure("cataclysm:ancient_factory")], rewards: [R.skill(2200)] },
    { k: "templo_hundido", t: "Ciudad hundida", sub: "Bajo el mar", deps: ["intro"], opt: true,
      d: ["Una ciudad sumergida con enemigos acuáticos. Lleva pociones de respiración y visión."],
      tasks: [T.structure("cataclysm:sunken_city")], rewards: [R.skill(2200)] },

    // ---- cuevas y bosses de aventura ----
    { k: "cuevas", t: "Cuevas de Alex", sub: "Biomas subterráneos", deps: ["intro"],
      d: ["Bajo la superficie hay cuevas de dinosaurios, caramelo, imanes y ácido. Cada una tiene sus propios enemigos y recompensas."],
      tasks: [T.adv("alexscaves:alexscaves/discover_primordial_caves")],
      rewards: [R.skill(2300), R.coins({ diamante: 2 })] },
    { k: "oscuro", t: "Más profundo y más oscuro", sub: "Deeper and Darker", deps: ["intro"], opt: true,
      d: ["Bajo el Deep Dark hay una ciudad antigua y criaturas del sculk. Ve sin luz y sin ruido: hay guardianes."],
      tasks: [T.structure("deeperdarker:ancient_temple")], rewards: [R.skill(2500), R.coins({ netherita: 1 })] },

    { k: "wroughtnaut", t: "El Wroughtnaut", sub: "Jefe de Mowzie's Mobs", deps: ["fuerte"],
      d: ["El Ferrous Wroughtnaut custodia su estructura con un hacha enorme. Ataca cuando baja el hacha y retrocede cuando se enfurece."],
      tasks: [T.kill("mowziesmobs:ferrous_wroughtnaut", 1)],
      rewards: [R.skill(3000), R.coins({ netherita: 1 })] },
    { k: "frostmaw", t: "El Frostmaw", sub: "Jefe de las nieves", deps: ["coliseo"], opt: true,
      d: ["Una criatura antigua del hielo. Necesitas fuego, armadura y paciencia."],
      tasks: [T.kill("mowziesmobs:frostmaw", 1)], rewards: [R.skill(3000), R.coins({ netherita: 1 })] },

    // ---- primer boss de Cataclysm ----
    { k: "ciudadela", t: "La ciudadela en ruinas", sub: "Cataclysm", deps: ["wroughtnaut"],
      d: ["Una ciudadela quemada en el Nether alberga a Ignis, un caballero infernal. Prepárate con resistencia al fuego, armadura fuerte y un plan."],
      tasks: [T.structure("cataclysm:ruined_citadel")], rewards: [R.skill(2500)] },
    { k: "ignis", t: "Ignis", sub: "Primer jefe de Cataclysm", deps: ["ciudadela"],
      d: ["Ignis es el primero de los grandes jefes de Cataclysm. Ataca sin cesar y se cura con almas; mantén la presión y evita los proyectiles.",
          "Al derrotarlo, sueltan sus ojos y su espada."],
      tasks: [T.kill("cataclysm:ignis", 1)],
      rewards: [R.skill(4000), R.coins({ netherita: 2 })] },
    { k: "monstruosidad", t: "Monstruosidad de netherita (opcional)", sub: "Otro jefe", deps: ["ignis"], opt: true,
      d: ["Una bestia colosal del Nether. Suelta el cuerno monstruoso, base de armas poderosas."],
      tasks: [T.kill("cataclysm:netherite_monstrosity", 1)],
      rewards: [R.skill(4500), R.coins({ netherita: 2 })] },

    { k: "cierre", t: "Primer gran jefe", sub: "Cierre del capítulo", deps: ["ignis", "cuevas", "fuerte"],
      d: ["Has explorado, sobrevivido y derrotado a un gran jefe. Ya nada te sorprende. Entrega un ojo de Ignis para completar el capítulo.", "Se abre el capítulo 8."],
      tasks: [T.item("cataclysm:flame_eye", 1, { consume: true })],
      rewards: [R.skill(5000), R.stage("era_dim"), R.coins({ netherita: 3 })] },
  ],
};
