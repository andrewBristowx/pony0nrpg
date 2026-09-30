import { T, R } from "../../quest-dsl.mjs";

// Rama transversal: Gremio de aventureros y economía (Lightman's Currency)
export default {
  key: "gremio", order: 10, group: "ramas", icon: "lightmanscurrency:coin_gold",
  title: "Gremio y economía",
  sub: "Encargos, rangos y monedas",
  quests: [
    { k: "intro", t: "Gremio de aventureros", sub: "Encargos con recompensa", deps: ["bienvenida.listo"],
      d: ["El gremio publica encargos repetibles en el tablón del spawn. Cada encargo se paga en monedas.",
          "Los rangos (Novato, Bronce, Plata, Oro, Maestro) se ganan con la campaña y los encargos."],
      tasks: [T.check()], rewards: [R.skill(60), R.coins({ cobre: 30 })] },

    { k: "monedas", t: "Las monedas", sub: "Lightman's Currency", deps: ["intro"],
      d: ["El dinero del mundo son monedas: cobre, hierro, oro, esmeralda, diamante y netherita. Cada una vale más que la anterior.",
          "Guarda las monedas en tu cartera y usa cajeros (ATM) para tu cuenta de banco."],
      tasks: [T.item("lightmanscurrency:coin_copper", 10)],
      rewards: [R.skill(60), R.item("lightmanscurrency:wallet_copper")] },

    { k: "cajero", t: "Cajero automático", sub: "Tu cuenta de banco", deps: ["monedas"],
      d: ["Un ATM guarda tus monedas en el banco: no se pierden al morir. También sirve para transferir dinero a otros jugadores."],
      tasks: [T.item("lightmanscurrency:atm")], rewards: [R.skill(120), R.coins({ hierro: 5 })] },
    { k: "tienda", t: "Tu primera tienda", sub: "Comercio entre jugadores", deps: ["cajero"], opt: true,
      d: ["Un comerciante de objetos vende lo que pongas en su inventario al precio que fijes. Es la base de la economía del servidor."],
      tasks: [T.item("lightmanscurrency:item_trader_server_sml")], rewards: [R.skill(150), R.coins({ hierro: 10 })] },

    { k: "novato", t: "Rango Novato", sub: "Punto de partida", deps: ["intro"],
      d: ["Eres un aventurero del gremio. Los encargos de rango Novato son sencillos: mobs comunes cerca del spawn."],
      tasks: [T.check()], rewards: [R.skill(50)] },
    { k: "e_zombis", t: "Encargo: zombis", sub: "Novato", deps: ["novato"],
      d: ["Los zombis rodean el pueblo. Elimina 30."],
      tasks: [T.kill("minecraft:zombie", 30)], rewards: [R.skill(160), R.coins({ hierro: 8 })] },
    { k: "e_esqueletos", t: "Encargo: esqueletos", sub: "Novato", deps: ["novato"],
      d: ["Los esqueletos atacan a los viajeros. Derrota 25."],
      tasks: [T.kill("minecraft:skeleton", 25)], rewards: [R.skill(160), R.coins({ hierro: 8 })] },
    { k: "e_aranas", t: "Encargo: arañas", sub: "Novato", deps: ["novato"],
      d: ["Las arañas infestan las cuevas. Acaba con 20."],
      tasks: [T.kill("minecraft:spider", 20)], rewards: [R.skill(160), R.coins({ hierro: 8 })] },

    { k: "bronce", t: "Rango Bronce", sub: "Tras el capítulo 3", deps: ["e_zombis", "e_esqueletos", "aventurero.cierre"],
      d: ["Al completar &6El aventurero&r te reconocen como aventurero de Bronce. Ya puedes tomar encargos contra enemigos del Nether."],
      tasks: [T.stage("rango_bronce")], rewards: [R.skill(300), R.coins({ oro: 3 })] },
    { k: "e_brujas", t: "Encargo: brujas", sub: "Bronce", deps: ["bronce"],
      d: ["Las brujas envenenan los pozos. Encuentra y elimina 5."],
      tasks: [T.kill("minecraft:witch", 5)], rewards: [R.skill(300), R.coins({ oro: 2 })] },
    { k: "e_enderman", t: "Encargo: endermen", sub: "Bronce", deps: ["bronce"],
      d: ["Los endermen se llevan bloques del pueblo. Derrota 8 (no los mires a los ojos)."],
      tasks: [T.kill("minecraft:enderman", 8)], rewards: [R.skill(320), R.coins({ oro: 2 })] },
    { k: "e_blaze", t: "Encargo: blazes", sub: "Bronce", deps: ["bronce", "aventurero.fortaleza"],
      d: ["Las varas de blaze escasean. Elimina 10 blazes en una fortaleza del Nether."],
      tasks: [T.kill("minecraft:blaze", 10)], rewards: [R.skill(340), R.coins({ oro: 3 })] },

    { k: "plata", t: "Rango Plata", sub: "Prueba de valor", deps: ["e_brujas", "e_enderman", "e_blaze"],
      d: ["Para subir a Plata tienes que demostrar que puedes con los esqueletos del Nether.", "Cuando lo hagas, el gremio te reconoce como aventurero de &6Plata&r."],
      tasks: [T.kill("minecraft:wither_skeleton", 10)],
      rewards: [R.skill(600), R.stage("rango_plata"), R.coins({ esmeralda: 3 })] },
  ],
};
