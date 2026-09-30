import { T, R } from "../../quest-dsl.mjs";

// Capítulo 10 — El fin del mundo (niveles 90–100, ~55 000 XP repartidos)
export default {
  key: "fin", order: 10, group: "campana", icon: "minecraft:dragon_head",
  title: "10. El fin del mundo",
  sub: "El dragón del End, el equipo mítico y la puerta de la Ascensión.",
  quests: [
    { k: "intro", t: "El fin del mundo", sub: "La última era", deps: ["jefes.cierre"],
      d: ["Todo lo que has hecho te ha traído hasta aquí. El End te espera con su dragón y sus ciudades.",
          "Al completar este capítulo se abre la Ascensión: un nuevo camino para tu clase."],
      tasks: [T.check()], rewards: [R.skill(6000), R.coins({ netherita: 3 })] },

    { k: "ojos", t: "Ojos del End", sub: "Encuentra la fortaleza", deps: ["intro"],
      d: ["Los ojos del End te guían hacia la fortaleza donde está el portal al End. Se hacen con una perla de ender y polvo de blaze."],
      tasks: [T.item("minecraft:ender_eye", 12)], rewards: [R.skill(7000), R.coins({ netherita: 2 })] },
    { k: "portal", t: "Portal al End", sub: "Cruza", deps: ["ojos"],
      d: ["Activa el portal con doce ojos del End. Al otro lado te esperan el dragón y los endermen."],
      tasks: [T.dim("minecraft:the_end")], rewards: [R.skill(8000), R.coins({ netherita: 3 })] },
    { k: "dragon", t: "El dragón del End", sub: "El jefe final", deps: ["portal"],
      d: ["Destruye los cristales del End y acaba con el dragón. Lleva bloques, arco y mucha comida."],
      tasks: [T.kill("minecraft:ender_dragon", 1)],
      rewards: [R.skill(12000), R.item("minecraft:dragon_egg"), R.coins({ netherita: 5 })] },
    { k: "elytra", t: "Élitros", sub: "Vuela", deps: ["dragon"],
      d: ["En las ciudades del End hay barcos con élitros. Con ellos y cohetes, el cielo es tuyo."],
      tasks: [T.item("minecraft:elytra")], rewards: [R.skill(9000), R.item("minecraft:firework_rocket", 32)] },
    { k: "shulker", t: "Cajas shulker", sub: "Almacenamiento móvil", deps: ["dragon"], opt: true,
      d: ["Las cajas shulker son la mejor forma de llevar equipo contigo."],
      tasks: [T.item("minecraft:shulker_shell", 4)], rewards: [R.skill(7000)] },
    { k: "baliza", t: "Baliza", sub: "Bonificaciones de zona", deps: ["dragon"], opt: true,
      d: ["Con una estrella del Nether, obsidiana y cristal fabricas una baliza que da bonificaciones a todo tu equipo."],
      tasks: [T.item("minecraft:beacon")], rewards: [R.skill(9000), R.coins({ netherita: 3 })] },

    { k: "mitico", t: "Equipo mítico", sub: "Fruto de tres dimensiones", deps: ["dragon", "elytra"],
      d: ["El equipo mítico se forja con materiales de tres dimensiones distintas: el Undergarden, el Aether y el espacio.",
          "Entrégalos para demostrar que has llegado al final."],
      tasks: [T.item("undergarden:forgotten_ingot", 8, { consume: true }), T.item("aether:zanite_gemstone", 16, { consume: true }), T.item("ad_astra:calorite_ingot", 8, { consume: true })],
      rewards: [R.skill(20000), R.coins({ netherita: 8 })] },

    { k: "cierre", t: "La puerta de la Ascensión", sub: "Fin de la campaña", deps: ["mitico"],
      d: ["Has completado la campaña. Alcanza el nivel 100 y abre la Ascensión: en los capítulos de Ascensión de cada clase ganarás puntos que mejoran a tu personaje para siempre.",
          "Este es el final del camino... y el principio de otro."],
      tasks: [T.check()],
      rewards: [R.skill(30000), R.stage("era_10"), R.coins({ netherita: 10 })] },
  ],
};
