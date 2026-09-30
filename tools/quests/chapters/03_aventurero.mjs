import { T, R } from "../../quest-dsl.mjs";

// Capítulo 3 — El aventurero (niveles 20–30, ~6 500 XP repartidos)
export default {
  key: "aventurero", order: 3, group: "campana", icon: "minecraft:iron_sword",
  title: "3. El aventurero",
  sub: "Clases, combate, mazmorras y tu primer miniboss. Entra al gremio.",
  quests: [
    { k: "gremio", t: "El gremio de aventureros", sub: "Rangos: Novato, Bronce, Plata, Oro…", deps: ["secretos.cierre"],
      d: ["El gremio te da encargos y te reconoce con rangos. Empiezas de Novato; al completar este capítulo subes a &6Bronce&r.",
          "Cada rango desbloquea misiones más difíciles y mejores recompensas."],
      tasks: [T.check()], rewards: [R.skill(300), R.coins({ hierro: 20 })] },

    // ---- equipo de clase (Tier I) ----
    { k: "eq_guerrero", t: "Equipo de Guerrero", sub: "Mandoble de hierro", deps: ["gremio"], opt: true,
      d: ["Las armas pesadas golpean fuerte pero lento. Requieren Guerrero (Tier I)."],
      tasks: [T.item("spartanweaponry:iron_greatsword")], rewards: [R.skill(320), R.job("herrero", 80)] },
    { k: "eq_arquero", t: "Equipo de Arquero", sub: "Arco largo de hierro", deps: ["gremio"], opt: true,
      d: ["El arco largo tiene más alcance y potencia. Requiere Arquero (Tier I)."],
      tasks: [T.item("spartanweaponry:iron_longbow")], rewards: [R.skill(320), R.item("minecraft:arrow", 32)] },
    { k: "eq_mago", t: "Equipo de Mago", sub: "Grimorio de hierro", deps: ["gremio"], opt: true,
      d: ["Los grimorios guardan hechizos y aumentan tu poder mágico. Requiere Mago (Tier I)."],
      tasks: [T.item("irons_spellbooks:iron_spell_book")], rewards: [R.skill(320), R.item("irons_spellbooks:common_ink", 4)] },
    { k: "eq_asesino", t: "Equipo de Asesino", sub: "Daga de hierro", deps: ["gremio"], opt: true,
      d: ["Las armas ligeras son rápidas y dan críticos. Requieren Asesino (Tier I)."],
      tasks: [T.item("spartanweaponry:iron_dagger")], rewards: [R.skill(320), R.job("herrero", 80)] },
    { k: "eq_ingeniero", t: "Equipo de Ingeniero", sub: "Mochila de hierro", deps: ["gremio"], opt: true,
      d: ["Un ingeniero necesita almacenamiento. Mejora tu mochila a hierro."],
      tasks: [T.item("sophisticatedbackpacks:iron_backpack")], rewards: [R.skill(320), R.item("sophisticatedbackpacks:magnet_upgrade")] },

    { k: "maestria", t: "Maestría de clase", sub: "Fundamentos VI (Tier II)", any: true,
      deps: ["eq_guerrero", "eq_arquero", "eq_mago", "eq_asesino", "eq_ingeniero"],
      d: ["Sigue subiendo en tu clase hasta &6Fundamentos VI&r: eso te da el Tier II y abre equipo mejor.", "Mientras tanto, prepárate para explorar."],
      tasks: [T.check()], rewards: [R.skill(350)] },

    // ---- combate y exploración ----
    { k: "combate", t: "Combate avanzado", sub: "Better Combat", deps: ["gremio"],
      d: ["Con Better Combat cada arma tiene su propio estilo de golpe. Prueba distintos ataques y esquiva con tiempo.",
          "Derrota a unas cuantas arañas y creepers: los creepers se combaten a distancia o con escudo."],
      tasks: [T.kill("minecraft:spider", 10), T.kill("minecraft:creeper", 5)],
      rewards: [R.skill(340), R.item("minecraft:shield")] },

    { k: "mazmorra", t: "Primera mazmorra", sub: "Entra y sal con vida", deps: ["combate"],
      d: ["Las mazmorras tienen enemigos, trampas y mucho botín. Prepara comida, antorchas y un escudo antes de entrar."],
      tasks: [T.structure("betterdungeons:small_dungeon")], rewards: [R.skill(380), R.coins({ oro: 4 })] },
    { k: "mazmorra2", t: "Torres y templos", sub: "Otra estructura", deps: ["combate"], opt: true,
      d: ["Explora un templo o torre y sal con vida."],
      tasks: [T.structure("minecraft:desert_pyramid")], rewards: [R.skill(340)] },

    { k: "nether", t: "Portal al Nether", sub: "Otra dimensión", deps: ["combate"],
      d: ["Construye un portal de obsidiana y enciéndelo. El Nether es peligroso: lleva armadura, armas y bloques para taparte."],
      tasks: [T.adv("minecraft:story/enter_the_nether")],
      rewards: [R.skill(420), R.coins({ oro: 5 }), R.item("minecraft:golden_apple", 2)] },
    { k: "fortaleza", t: "Fortaleza del Nether", sub: "Exploración", deps: ["nether"],
      d: ["Las fortalezas del Nether contienen blaze y cofres. Usa tu brújula del explorador para encontrar una."],
      tasks: [T.adv("minecraft:nether/find_fortress")], rewards: [R.skill(400), R.coins({ oro: 5 })] },
    { k: "bastion", t: "Bastión", sub: "Piglins", deps: ["nether"],
      d: ["Los bastiones tienen piglins y mucho oro. Ponte una pieza de oro para que no se enfaden."],
      tasks: [T.adv("minecraft:nether/find_bastion")], rewards: [R.skill(400), R.coins({ oro: 5 })] },

    { k: "miniboss", t: "Primer miniboss", sub: "Un enemigo de élite", any: true, deps: ["fortaleza", "bastion"],
      d: ["Enfréntate a un enemigo de élite: un piglin bruto en un bastión, o un invocador si lo encuentras.",
          "Prepara pociones, buena armadura y un plan de retirada."],
      tasks: [T.kill("minecraft:piglin_brute", 1)],
      rewards: [R.skill(600), R.coins({ esmeralda: 2 })] },

    { k: "cierre", t: "Rango Bronce", sub: "Cierre del capítulo", deps: ["maestria", "mazmorra", "miniboss"],
      d: ["Has demostrado tu valía. El gremio te concede el rango &6Bronce&r y un arma con nombre.", "Se abre el capítulo 4: la revolución de Create."],
      tasks: [T.check()],
      rewards: [R.skill(500), R.stage("rango_bronce"), R.stage("era_create"), R.coins({ esmeralda: 3 }), R.item("minecraft:diamond_sword")] },
  ],
};
