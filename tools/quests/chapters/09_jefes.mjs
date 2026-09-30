import { T, R } from "../../quest-dsl.mjs";

// Capítulo 9 — Los grandes jefes (niveles 80–90, ~35 000 XP repartidos)
export default {
  key: "jefes", order: 9, group: "campana", icon: "cataclysm:the_incinerator",
  title: "9. Los grandes jefes",
  sub: "Jefes del mundo, dragones y tu arma legendaria.",
  quests: [
    { k: "intro", t: "Los grandes jefes", sub: "Solo para veteranos", deps: ["mas_alla.cierre"],
      d: ["Aquí están los enemigos más poderosos del mundo. Se enfrentan en grupo, con buen equipo, pociones, comida y un plan.",
          "Cada jefe suelta materiales únicos. Con ellos forjarás tu arma legendaria."],
      tasks: [T.check()], rewards: [R.skill(4000), R.coins({ netherita: 2 })] },

    { k: "harbinger", t: "El Harbinger", sub: "Cataclysm", deps: ["intro"],
      d: ["Un coloso mecánico de una civilización antigua. Sus rayos y misiles te obligan a moverte sin parar."],
      tasks: [T.kill("cataclysm:the_harbinger", 1)], rewards: [R.skill(6000), R.coins({ netherita: 3 })] },
    { k: "guardian_ender", t: "Guardián del End", sub: "Cataclysm", deps: ["intro"],
      d: ["Un guardián de cristal y vacío. Es rápido y su daño atraviesa armaduras."],
      tasks: [T.kill("cataclysm:ender_guardian", 1)], rewards: [R.skill(6000), R.coins({ netherita: 3 })] },
    { k: "leviatan", t: "El Leviatán", sub: "Cataclysm", deps: ["intro"],
      d: ["El rey del abismo marino. Necesitas respiración submarina, buena visión y armas potentes."],
      tasks: [T.kill("cataclysm:the_leviathan", 1)], rewards: [R.skill(6500), R.coins({ netherita: 3 })] },
    { k: "scylla", t: "Scylla", sub: "Cataclysm", deps: ["leviatan"], opt: true,
      d: ["La reina de las tormentas del mar. Solo para quien ya venció al Leviatán."],
      tasks: [T.kill("cataclysm:scylla", 1)], rewards: [R.skill(7000), R.coins({ netherita: 3 })] },
    { k: "remanente", t: "El Remanente Antiguo", sub: "Cataclysm", deps: ["intro"],
      d: ["Un coloso del desierto. Ataca a distancia y abre el suelo bajo tus pies."],
      tasks: [T.kill("cataclysm:ancient_remnant", 1)], rewards: [R.skill(6500), R.coins({ netherita: 3 })] },

    { k: "lich", t: "El Lich", sub: "Bosses of Mass Destruction", deps: ["intro"],
      d: ["El Lich invoca cometas y cráneos. Su arena es una torre; lleva armadura con protección mágica."],
      tasks: [T.kill("bosses_of_mass_destruction:lich", 1)], rewards: [R.skill(6500), R.coins({ netherita: 3 })] },

    { k: "wither", t: "El Wither", sub: "El clásico", deps: ["intro"],
      d: ["El Wither ataca con calaveras que se lo llevan todo. Combátelo en un túnel bajo tierra."],
      tasks: [T.kill("minecraft:wither", 1)], rewards: [R.skill(6000), R.item("minecraft:nether_star")] },

    { k: "dragon_fuego", t: "Dragón de fuego", sub: "Ice and Fire", deps: ["intro"], opt: true,
      d: ["Los dragones de Ice and Fire son de los enemigos más peligrosos. Cazarlos exige armadura de netherita y armas potentes."],
      tasks: [T.kill("iceandfire:fire_dragon", 1)], rewards: [R.skill(8000), R.coins({ netherita: 4 })] },
    { k: "dragon_hielo", t: "Dragón de hielo", sub: "Ice and Fire", deps: ["intro"], opt: true,
      d: ["El dragón de hielo se cura con nieve y ataca con aliento congelante."],
      tasks: [T.kill("iceandfire:ice_dragon", 1)], rewards: [R.skill(8000), R.coins({ netherita: 4 })] },
    { k: "dragon_rayo", t: "Dragón de rayo", sub: "Ice and Fire", deps: ["intro"], opt: true,
      d: ["El dragón de rayo es el más veloz. Su aliento paraliza."],
      tasks: [T.kill("iceandfire:lightning_dragon", 1)], rewards: [R.skill(8000), R.coins({ netherita: 4 })] },

    // ---- arma legendaria ----
    { k: "legendaria", t: "Arma legendaria", sub: "Forja la tuya", any: true, deps: ["harbinger", "guardian_ender", "leviatan", "remanente"],
      d: ["Con las armas de los jefes forjas armas legendarias. Consigue una de ellas: la incineradora, la garra de las mareas o el renderizador de almas.",
          "Se fabrican en las forjas de Cataclysm con los ojos y lingotes de los jefes."],
      tasks: [T.item("cataclysm:the_incinerator")], rewards: [R.skill(9000), R.coins({ netherita: 5 })] },
    { k: "legendaria_mar", t: "Garra de las mareas (opcional)", sub: "Alternativa", deps: ["leviatan"], opt: true,
      d: ["La garra de las mareas se forja con el tridente del Leviatán."],
      tasks: [T.item("cataclysm:tidal_claws")], rewards: [R.skill(9000)] },
    { k: "legendaria_alma", t: "Renderizador de almas (opcional)", sub: "Alternativa", deps: ["remanente"], opt: true,
      d: ["El renderizador de almas es un arma de energía oscura."],
      tasks: [T.item("cataclysm:soul_render")], rewards: [R.skill(9000)] },

    { k: "cierre", t: "Leyenda", sub: "Cierre del capítulo", deps: ["legendaria", "wither", "lich"],
      d: ["Has fabricado un arma legendaria y vencido a los grandes jefes. Solo queda el final del mundo.", "Se abre el capítulo 10."],
      tasks: [T.item("minecraft:nether_star", 2, { consume: true })],
      rewards: [R.skill(12000), R.stage("era_10_previa"), R.coins({ netherita: 6 })] },
  ],
};
