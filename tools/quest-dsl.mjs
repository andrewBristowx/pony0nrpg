// Ayudantes para escribir capítulos de misiones (tools/quests/chapters/*.mjs).
// Tareas:  T.check() T.item(id, n) T.kill(entidad, n) T.adv(logro) T.dim(dimensión) T.stat(estadística, n)
//          T.structure(id) T.biome(id) T.stage(nombre)
// Premios: R.item(id, n) R.xp(puntos_vanilla) R.skill(xp) R.job(oficio, xp) R.coins(cobre, hierro, oro...)
//          R.cmd(comando) R.stage(nombre) R.asc(clase, puntos) R.unlockAsc(clase)

// "{p}" en un comando de FTB Quests se sustituye por el nombre del jugador.
const L = (n) => ({ __long: n });
const D = (n) => ({ __double: n });

export const T = {
  check: () => ({ type: "checkmark" }),
  item: (id, n = 1, opts = {}) => ({ type: "item", item: id, ...(n > 1 ? { count: L(n) } : {}), ...(opts.consume ? { consume_items: true } : {}), _item: id }),
  kill: (entity, n = 1) => ({ type: "kill", entity, value: L(n), _entity: entity }),
  adv: (advancement) => ({ type: "advancement", advancement, criterion: "", _adv: advancement }),
  dim: (dimension) => ({ type: "dimension", dimension }),
  stat: (stat, n = 1) => ({ type: "stat", stat, value: n }),
  structure: (structure) => ({ type: "structure", structure, _structure: structure }),
  biome: (biome) => ({ type: "biome", biome, _biome: biome }),
  stage: (stage) => ({ type: "stage", stage }),
};

const cmd = (command) => ({ type: "command", command, elevate_perms: true, silent: true });
const COINS = { cobre: "lightmanscurrency:coin_copper", hierro: "lightmanscurrency:coin_iron", oro: "lightmanscurrency:coin_gold", esmeralda: "lightmanscurrency:coin_emerald", diamante: "lightmanscurrency:coin_diamond", netherita: "lightmanscurrency:coin_netherite" };

export const R = {
  item: (id, n = 1) => ({ type: "item", item: id, ...(n > 1 ? { count: n } : {}), _item: id }),
  xp: (n) => ({ type: "xp", xp: n }),
  // XP de la categoría "habilidades" (nivel global de Pufferfish's Skills)
  skill: (n) => cmd(`/puffish_skills experience add {p} habilidades ${n}`),
  // XP de un oficio (categoría oficio_<id>)
  job: (job, n) => cmd(`/puffish_skills experience add {p} oficio_${job} ${n}`),
  // Monedas de Lightman's Currency: R.coins({ cobre: 50 }) -> un premio por tipo de moneda
  coins: (obj) => Object.entries(obj).map(([k, n]) => ({ type: "item", item: COINS[k], ...(n > 1 ? { count: n } : {}), _item: COINS[k] })),
  cmd,
  stage: (stage) => cmd(`/kubejs stages add {p} ${stage}`),
  asc: (cls, n = 1) => cmd(`/puffish_skills points add {p} ascension_${cls} ${n}`),
  unlockAsc: (cls) => cmd(`/puffish_skills category unlock {p} ascension_${cls}`),
};

export { L, D };
