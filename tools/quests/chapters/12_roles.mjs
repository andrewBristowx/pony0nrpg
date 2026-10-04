import fs from "node:fs";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { T, R } from "../../quest-dsl.mjs";

// Hechizos que da cada nivel (HECHIZOS_ROL en gremio_roles_tabla.js) con nombre y descripcion (hechizos_datos.js): se leen de esos archivos para que
// las descripciones de las misiones no se desincronicen de lo que realmente se entrega.
const kube = (f) => fileURLToPath(new URL("../../../kubejs/" + f, import.meta.url));
const ctx = { global: {}, console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(kube("startup_scripts/hechizos_datos.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(kube("server_scripts/gremio_roles_tabla.js"), "utf8").replace(/^const /gm, "var "), ctx);
vm.runInContext(fs.readFileSync(kube("server_scripts/gremio_equipo.js"), "utf8"), ctx);
const NOMBRE_CLASE = { guerrero: "Guerrero", arquero: "Arquero", mago: "Mago", asesino: "Asesino", ingeniero: "Ingeniero" };
const ROMANO = ["", "I", "II", "III", "IV"];
/** lineas de descripcion con el equipo de rol (gremio_equipo.js) que da ese nivel, por clase */
const equipoNivel = (rolId, nivel) => {
  const e = ctx.global.EQUIPO_NIVEL[nivel];
  if (!e) return [];
  const [tier, piezas] = e;
  const lineas = [];
  for (const [key, def] of Object.entries(ctx.global.EQUIPO_DEF)) {
    if (!key.startsWith(rolId + "/")) continue;
    const nombres = piezas.map((p) => (p === "weapon" ? def.armas[tier - 1] : `${ctx.EQ_PIEZA[def.arq][p]} ${def.tema}`));
    lineas.push(`&d${NOMBRE_CLASE[key.split("/")[1]]}&r: ${nombres.join(" y ")}.`);
  }
  return lineas.length ? [`&6Equipo de rol Tier ${ROMANO[tier]} (${ctx.global.EQ_TIER[tier]})&r con atributos para tu rol:`, ...lineas] : [];
};
// XP de habilidades de cada mision: crece con el nivel; las de jefes (9+) dan mucho
const xpMision = (i) => (i < 8 ? 150 + 100 * i : 1200 + 500 * (i - 8));
/** lineas de descripcion con los hechizos que se aprenden en ese nivel de ese rol, por clase */
const hechizosNivel = (rolId, nivel) => {
  const porClase = ctx.global.HECHIZOS_ROL[rolId] || {};
  const lineas = [];
  for (const [clase, niveles] of Object.entries(porClase)) {
    const lista = (niveles[nivel] || []).map((e) => (Array.isArray(e) ? e : [e, 1]));
    if (!lista.length) continue;
    lineas.push(`&d${NOMBRE_CLASE[clase]}&r: ` + lista.map(([id, lvl]) => `&b${ctx.global.HECHIZOS[id][0]}&r${lvl > 1 ? ` (nv ${lvl})` : ""}`).join(", ") + ".");
  }
  return lineas;
};

// Roles de combate: un capítulo por rol (Tanque, DPS, Healer, Soporte). Cada capítulo se desbloquea solo cuando el jugador elige ese rol con el
// maestro de rol de su pueblo (stage rol_<id>, que da /rol confirmar en kubejs/server_scripts/gremio_roles.js); quien eligió otro rol no puede avanzar.
// Visibilidad: el juramento es invisible hasta que se completa su tarea (tener el rol) y las demás misiones no se ven si sus dependencias no se ven,
// así un jugador solo ve el capítulo de SU rol (FTB Quests oculta los capítulos sin misiones visibles).
// OJO: la tarea "stage" de FTB Quests comprueba ETIQUETAS de entidad (/tag), no los stages de KubeJS; kubejs/server_scripts/stages_tags.js los sincroniza.
// Cada misión (1..8) da XP y llama a /rol recompensa <rol> <nivel> {p}: objetos y mejoras de atributos SEGUN LA CLASE del jugador
// (tablas en kubejs/server_scripts/gremio_roles_tabla.js). Las misiones se vuelven más difíciles y el equipo, mejor.
const rol = (id, nombre, icon, intro, misiones) => ({
  key: `rol_${id}`, order: 30, group: "ramas", icon,
  title: `Rol: ${nombre}`,
  sub: `Misiones del ${nombre}`,
  quests: [
    { k: "juramento", t: `Juramento del ${nombre}`, sub: "Elige tu rol", invisible: true, at: [0.5, 2],   // sin dependencias: FTB Quests no avanza tareas de una mision si sus dependencias no estan completas
      d: [intro,
          `Habla con el maestro de rol de tu pueblo (junto a la plaza). Al confirmar el rol de ${nombre}, esta misión se completa sola (stage &6rol_${id}&r).`,
          "&cEl rol no se puede cambiar&r: solo podrás hacer las misiones de este capítulo.",
          ...(hechizosNivel(id, 0).length ? ["&dHechizos de inicio&r:", ...hechizosNivel(id, 0)] : []),
          "&7Los hechizos solo se consiguen por progresión (no hay pergaminos en cofres ni se fabrican). Usa /hechizo para ver los tuyos."],
      tasks: [T.stage(`rol_${id}`)], rewards: [R.skill(100)] },
    ...misiones.map((m, i) => ({
      k: `n${i + 1}`, t: m.t, sub: `${nombre} · nivel ${i + 1}`, deps: [i === 0 ? "juramento" : `n${i}`], hideUntilDepsVisible: true,
      d: [...m.d, "Recompensa: equipo y una mejora permanente para tu rol, según tu clase.", ...equipoNivel(id, i + 1),
          ...(hechizosNivel(id, i + 1).length ? ["&dHechizos que aprendes&r (según tu clase; te llega el pergamino, inscríbelo en un libro de hechizos):", ...hechizosNivel(id, i + 1)] : [])],
      tasks: m.tasks,
      // dos filas en serpiente: 1-8 de izquierda a derecha, 9-16 de derecha a izquierda
      at: i < 8 ? [2.5 + 2 * i, 2] : [2.5 + 2 * (15 - i), 4.5],
      rewards: [R.skill(xpMision(i)), R.cmd(`/rol recompensa ${id} ${i + 1} {p}`)],
    })),
  ],
});

export default [
  rol("tanque", "Tanque", "minecraft:shield",
    "El Tanque aguanta los golpes en primera línea para que el grupo pueda actuar. Este camino te da armaduras pesadas, escudos y mejoras de vida, armadura y resistencia al empuje.",
    [
      { t: "Primera línea", d: ["Un tanque se acostumbra a recibir golpes. Acumula daño recibido."], tasks: [T.stat("minecraft:damage_taken", 500)] },
      { t: "Detrás del escudo", d: ["Bloquear es mejor que curarse. Bloquea daño con tu escudo."], tasks: [T.stat("minecraft:damage_blocked_by_shield", 300)] },
      { t: "Contra los saqueadores", d: ["Los saqueadores atacan en grupo. Elimina a 12 sin retroceder."], tasks: [T.kill("minecraft:pillager", 12)] },
      { t: "Piel de roca", d: ["Resiste un volumen de daño mucho mayor."], tasks: [T.stat("minecraft:damage_taken", 3000)] },
      { t: "Muro del Nether", d: ["Bloquea más daño y derrota esqueletos del Nether, que golpean fuerte.", "Eliminar a 10 esqueletos wither."], tasks: [T.stat("minecraft:damage_blocked_by_shield", 2000), T.kill("minecraft:wither_skeleton", 10)] },
      { t: "Rompe la carga", d: ["Los vindicadores cargan con hacha. Derrota a 15."], tasks: [T.kill("minecraft:vindicator", 15)] },
      { t: "Inamovible", d: ["Resiste y bloquea de forma sostenida."], tasks: [T.stat("minecraft:damage_taken", 8000), T.stat("minecraft:damage_blocked_by_shield", 5000)] },
      { t: "El guardián final", d: ["Un tanque de verdad se planta ante el peor enemigo del Overworld. Derrota al Wither."], tasks: [T.kill("minecraft:wither", 1)] },
      { t: "Contra el coloso de hierro", d: ["Aguanta el martillo del Ferrous Wroughtnaut y derrótalo."], tasks: [T.kill("mowziesmobs:ferrous_wroughtnaut", 1)] },
      { t: "Guardián caído", d: ["Los Subterráneos esconden un guardián olvidado. Derrótalo."], tasks: [T.kill("undergarden:forgotten_guardian", 1)] },
      { t: "El silencio", d: ["En las ciudades antiguas duerme un guardián que no perdona. Derrota al Warden."], tasks: [T.kill("minecraft:warden", 1)] },
      { t: "Muralla viviente", d: ["Un tanque de leyenda: acumula daño recibido y bloqueado a lo largo de toda tu aventura."], tasks: [T.stat("minecraft:damage_taken", 30000), T.stat("minecraft:damage_blocked_by_shield", 20000)] },
      { t: "Ante la monstruosidad", d: ["Planta cara a la Netherite Monstrosity de Cataclysm."], tasks: [T.kill("cataclysm:netherite_monstrosity", 1)] },
      { t: "El señor del Fin", d: ["Aguanta el aliento del dragón y derrótalo: Ender Dragon."], tasks: [T.kill("minecraft:ender_dragon", 1)] },
      { t: "Guardián del abismo", d: ["Derrota al Ender Guardian de Cataclysm."], tasks: [T.kill("cataclysm:ender_guardian", 1)] },
      { t: "Titán inquebrantable", d: ["La última prueba del Tanque: derrota al Ancient Remnant."], tasks: [T.kill("cataclysm:ancient_remnant", 1)] },
    ]),

  rol("dps", "DPS", "minecraft:diamond_sword",
    "El DPS elimina las amenazas lo más rápido posible. Este camino te da armas, flechas o hechizos ofensivos (según tu clase) y mejoras de daño, velocidad y críticos.",
    [
      { t: "Primeras bajas", d: ["Un DPS cuenta sus bajas. Elimina mobs."], tasks: [T.stat("minecraft:mob_kills", 100)] },
      { t: "Daño constante", d: ["Acumula daño infligido."], tasks: [T.stat("minecraft:damage_dealt", 2000)] },
      { t: "Fuego contra fuego", d: ["Los blazes protegen las fortalezas. Derrota a 15."], tasks: [T.kill("minecraft:blaze", 15)] },
      { t: "Máquina de matar", d: ["Mucho más daño acumulado."], tasks: [T.stat("minecraft:damage_dealt", 10000)] },
      { t: "Huesos negros", d: ["Los esqueletos wither son rápidos y letales. Elimina a 20."], tasks: [T.kill("minecraft:wither_skeleton", 20)] },
      { t: "Cazador de ojos", d: ["Los endermen exigen precisión. Derrota a 30."], tasks: [T.kill("minecraft:enderman", 30)] },
      { t: "Tormenta de acero", d: ["Una cifra de daño de leyenda."], tasks: [T.stat("minecraft:damage_dealt", 50000)] },
      { t: "Verdugo", d: ["Demuestra tu potencia contra el Wither."], tasks: [T.kill("minecraft:wither", 1)] },
      { t: "Garras de hielo", d: ["Derrota a Frostmaw, la bestia de las nieves de Mowzie's Mobs."], tasks: [T.kill("mowziesmobs:frostmaw", 1)] },
      { t: "El silencio", d: ["Derrota al Warden de las ciudades antiguas."], tasks: [T.kill("minecraft:warden", 1)] },
      { t: "Cazador de dragones", d: ["Derrota al Ender Dragon."], tasks: [T.kill("minecraft:ender_dragon", 1)] },
      { t: "Cenizas de Ignis", d: ["Derrota a Ignis, el caballero del fuego de Cataclysm."], tasks: [T.kill("cataclysm:ignis", 1)] },
      { t: "Heraldo del fin", d: ["Derrota a The Harbinger de Cataclysm."], tasks: [T.kill("cataclysm:the_harbinger", 1)] },
      { t: "Rey no-muerto", d: ["Derrota al Lich de Bosses of Mass Destruction."], tasks: [T.kill("bosses_of_mass_destruction:lich", 1)] },
      { t: "Dragón de fuego", d: ["Derrota a un dragón de fuego de Ice and Fire."], tasks: [T.kill("iceandfire:fire_dragon", 1)] },
      { t: "Reina de las mareas", d: ["La última prueba del DPS: derrota a Scylla de Cataclysm."], tasks: [T.kill("cataclysm:scylla", 1)] },
    ]),

  rol("healer", "Healer", "minecraft:golden_apple",
    "El Healer mantiene vivo al grupo. Este camino te da pergaminos y libros de curación, el equipo de sacerdote y mejoras de maná, curación y recuperación. Solo los magos pueden ser Healer.",
    [
      { t: "Primeros auxilios", d: ["Un healer siempre lleva algo con que curar. Consigue 2 manzanas doradas."], tasks: [T.item("minecraft:golden_apple", 2)] },
      { t: "Alquimia básica", d: ["Las pociones curan al grupo. Consigue un soporte para pociones."], tasks: [T.item("minecraft:brewing_stand")] },
      { t: "Sanar al enfermo", d: ["Cura a un aldeano zombi."], tasks: [T.adv("minecraft:story/cure_zombie_villager")] },
      { t: "Ingredientes de curación", d: ["Reúne rodajas de sandía brillante para pociones de curación."], tasks: [T.item("minecraft:glistering_melon_slice", 8)] },
      { t: "Lágrimas de ghast", d: ["La regeneración necesita lágrimas de ghast. Reúne 4."], tasks: [T.item("minecraft:ghast_tear", 4)] },
      { t: "Reserva de curación", d: ["Ten a mano una buena reserva para emergencias."], tasks: [T.item("minecraft:golden_apple", 16)] },
      { t: "Pociones mayores", d: ["Consigue pociones de curación mayores de Iron's Spells."], tasks: [T.item("irons_spellbooks:greater_healing_potion", 3)] },
      { t: "Faro de esperanza", d: ["Un healer maestro levanta un faro para su grupo. Consigue una baliza."], tasks: [T.item("minecraft:beacon")] },
      { t: "Segunda oportunidad", d: ["Los tótems devuelven la vida. Reúne 3 tótems de la inmortalidad (los jefes de las mansiones los sueltan; pídelos a tu grupo si hace falta)."], tasks: [T.item("minecraft:totem_of_undying", 3)] },
      { t: "Esencia arcana", d: ["La curación avanzada pide magia pura. Reúne 8 esencias arcanas."], tasks: [T.item("irons_spellbooks:arcane_essence", 8)] },
      { t: "Ojos del Fin", d: ["Reúne 12 ojos de Ender para guiar al grupo hasta el Fin."], tasks: [T.item("minecraft:ender_eye", 12)] },
      { t: "Cajas de sanación", d: ["Consigue 4 caparazones de shulker: las ciudades del Fin los guardan."], tasks: [T.item("minecraft:shulker_shell", 4)] },
      { t: "Aliento de dragón", d: ["Recoge 4 frascos de aliento de dragón (hace falta que tu grupo pelee con el Ender Dragon)."], tasks: [T.item("minecraft:dragon_breath", 4)] },
      { t: "Metal de los olvidados", d: ["Consigue 4 lingotes olvidados en los Subterráneos."], tasks: [T.item("undergarden:forgotten_ingot", 4)] },
      { t: "Estrellas del Wither", d: ["Reúne 2 estrellas del Nether: el grupo te las consigue y tú las proteges."], tasks: [T.item("minecraft:nether_star", 2)] },
      { t: "Alas del sanador", d: ["La última prueba del Healer: consigue unas élitros para llegar a todo el grupo."], tasks: [T.item("minecraft:elytra")] },
    ]),

  rol("soporte", "Soporte", "minecraft:ender_chest",
    "El Soporte potencia al grupo con provisiones, movilidad y utilidades. Este camino te da mochilas, herramientas y objetos de utilidad (según tu clase) y mejoras de velocidad, suerte y resistencia.",
    [
      { t: "Provisiones", d: ["Un buen soporte alimenta al grupo. Prepara 32 panes."], tasks: [T.item("minecraft:bread", 32)] },
      { t: "Comerciante", d: ["Comercia con aldeanos para conseguir lo que el grupo necesita."], tasks: [T.stat("minecraft:traded_with_villager", 5)] },
      { t: "Señales y vuelo", d: ["Los cohetes sirven de señal y de transporte. Prepara 32."], tasks: [T.item("minecraft:firework_rocket", 32)] },
      { t: "Explorador", d: ["Abre el camino al grupo: recorre una gran distancia a pie."], tasks: [T.stat("minecraft:walk_one_cm", 200000)] },
      { t: "Almacén del grupo", d: ["Un cofre del Ender te permite llevar tus cosas a todas partes."], tasks: [T.item("minecraft:ender_chest")] },
      { t: "Cajas de carga", d: ["Consigue caparazones de shulker para hacer cajas de carga."], tasks: [T.item("minecraft:shulker_shell", 2)] },
      { t: "Mercader curtido", d: ["Haz muchos tratos con aldeanos."], tasks: [T.stat("minecraft:traded_with_villager", 50)] },
      { t: "Corazón del mar", d: ["Un soporte maestro consigue un conducto. Reúne lo necesario y fabrícalo."], tasks: [T.item("minecraft:conduit")] },
      { t: "Gran comerciante", d: ["Haz muchísimos tratos con aldeanos."], tasks: [T.stat("minecraft:traded_with_villager", 150)] },
      { t: "Netherita para el grupo", d: ["Fabrica 4 lingotes de netherita."], tasks: [T.item("minecraft:netherite_ingot", 4)] },
      { t: "Caminante infatigable", d: ["Recorre 5 km a pie abriendo camino."], tasks: [T.stat("minecraft:walk_one_cm", 500000)] },
      { t: "Acero helado", d: ["Consigue 4 lingotes de acero helado en los Subterráneos."], tasks: [T.item("undergarden:froststeel_ingot", 4)] },
      { t: "Metales del espacio", d: ["Reúne 16 lingotes de desh."], tasks: [T.item("ad_astra:desh_ingot", 16)] },
      { t: "Alas de cargador", d: ["Consigue unas élitros: el soporte siempre llega primero."], tasks: [T.item("minecraft:elytra")] },
      { t: "Estrellas del Wither", d: ["Reúne 2 estrellas del Nether para fabricar balizas para el grupo."], tasks: [T.item("minecraft:nether_star", 2)] },
      { t: "Mercader legendario", d: ["La última prueba del Soporte: comercia 400 veces con aldeanos."], tasks: [T.stat("minecraft:traded_with_villager", 400)] },
    ]),
];
