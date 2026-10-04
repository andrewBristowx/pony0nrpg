// Equipo de rol: armaduras, armas y herramientas CON ATRIBUTOS que sirven al rol y a la clase (vida y defensa para el Tanque; daño, velocidad de ataque,
// crítico y esquive para el DPS; curación y maná para el Healer; movimiento, suerte y minado para el Soporte...). Mejora de tier en tier:
//   Tier I Aprendiz (niveles 1-4 del rol)  ->  II Veterano (5-8)  ->  III Campeón (9-12)  ->  IV Legendario (13-16)
// Cada nivel de rol (misiones de FTB Quests, tools/quests/chapters/12_roles.mjs) entrega una parte de la panoplia (EQUIPO_NIVEL):
//   nivel 4k-3: arma/herramienta · 4k-2: peto · 4k-1: casco y pantalones · 4k: botas.   Los niveles 9+ piden matar jefes o reunir materiales.
// gremio_roles.js llama a global.equipoDeNivel(rol, clase, nivel) desde darRecompensa. Todo se ajusta en las tablas de este archivo.
// Los objetos son los vanilla (cuero/cota/hierro/diamante/netherita, hachas, espadas, arcos...) con NBT AttributeModifiers: el NBT SUSTITUYE los atributos
// del objeto, asi que aqui tambien se escriben la armadura y el daño base. Cada modificador lleva un UUID propio por pieza (si no, dos piezas con el
// mismo UUID se pisan). Esta parte (EQUIPO_DEF) es solo datos: 12_roles.mjs la lee con node para escribir las descripciones.
// OJO (Rhino de este pack): `const`/`let` DENTRO de un try da "redeclaration of var"; dentro de try se usa `var`.

var EQ_ATTR = {
  hp: 'minecraft:generic.max_health', arm: 'minecraft:generic.armor', tgh: 'minecraft:generic.armor_toughness', kbr: 'minecraft:generic.knockback_resistance',
  dmg: 'minecraft:generic.attack_damage', aspd: 'minecraft:generic.attack_speed', move: 'minecraft:generic.movement_speed', luck: 'minecraft:generic.luck',
  crit: 'attributeslib:crit_chance', critd: 'attributeslib:crit_damage', pierce: 'attributeslib:armor_pierce', life: 'attributeslib:life_steal',
  dodge: 'attributeslib:dodge_chance', admg: 'attributeslib:arrow_damage', avel: 'attributeslib:arrow_velocity', draw: 'attributeslib:draw_speed',
  mine: 'attributeslib:mining_speed', xpg: 'attributeslib:experience_gained', heal: 'attributeslib:healing_received',
  mana: 'irons_spellbooks:max_mana', mregen: 'irons_spellbooks:mana_regen', spower: 'irons_spellbooks:spell_power', cdr: 'irons_spellbooks:cooldown_reduction',
  cast: 'irons_spellbooks:cast_time_reduction', fire: 'irons_spellbooks:fire_spell_power', holy: 'irons_spellbooks:holy_spell_power',
};
// operacion de cada atributo: 'add' (suma plana, por defecto) o 'mb' (multiply_base: el valor es una fraccion, 0.02 = +2%)
var EQ_OP_MB = { move: 1, mregen: 1, spower: 1, cdr: 1, cast: 1, fire: 1, holy: 1 };

var EQ_MULT = [0, 1, 1.9, 3.2, 5];                       // multiplicador de las estadisticas de rol por tier
var EQ_TIER = ['', 'Aprendiz', 'Veterano', 'Campeón', 'Legendario'];
var EQ_COLOR = ['', 'green', 'aqua', 'light_purple', 'gold'];
// armadura base por pieza y tier (I..IV) para la arquetipo "pesada"; media = 75 %, ligera = 50 %
var EQ_ARM = { head: [1, 2, 3, 4], chest: [4, 6, 8, 9], legs: [3, 5, 6, 7], feet: [1, 2, 3, 4] };
var EQ_TGH = [0, 1, 2, 3];
var EQ_FACTOR = { pesada: 1, media: 0.75, ligera: 0.5 };
var EQ_BASE_ARMOR = {   // objeto base de cada arquetipo y tier
  pesada: ['chainmail', 'iron', 'diamond', 'netherite'],
  media:  ['leather', 'chainmail', 'diamond', 'netherite'],
  ligera: ['leather', 'leather', 'leather', 'leather'],
};
var EQ_PIEZA = {
  pesada: { head: 'Yelmo', chest: 'Peto', legs: 'Grebas', feet: 'Botas' },
  media:  { head: 'Casco', chest: 'Coraza', legs: 'Pantalones', feet: 'Botas' },
  ligera: { head: 'Capucha', chest: 'Túnica', legs: 'Pantalones', feet: 'Calzado' },
};
// daño y velocidad base del arma por tipo (tier I..IV). dmg es el modificador (el daño total es 1 + dmg), aspd el modificador de velocidad (4 + aspd)
var EQ_ARMA = {
  hacha:   { dmg: [5, 7, 9, 11],  aspd: -3.0 },
  espada:  { dmg: [3, 5, 7, 9],   aspd: -2.4 },
  daga:    { dmg: [2, 3.5, 5, 7], aspd: -1.6 },
  pico:    { dmg: [2, 3, 4, 5],   aspd: -2.8 },
  distancia: null,   // arcos, ballestas y baculos: sin daño cuerpo a cuerpo propio
};
// por clase+rol: tema (nombre del conjunto), arquetipo, arma por tier (nombre y objeto base) y estadisticas del conjunto en tier I:
//   [atributo, valor_total_tier_I, donde]  donde: 'armor' (repartido entre las 4 piezas), 'weapon' (arma completa), 'all' (repartido entre las 5)
var EQUIPO_DEF = {
  'tanque/guerrero': { tema: 'del Centinela', arq: 'pesada', tipo: 'hacha', color: 0,
    armas: ['Hacha de guardia', 'Maza de vanguardia', 'Martillo de asedio', 'Hacha del Coloso'], base: ['stone_axe', 'iron_axe', 'diamond_axe', 'netherite_axe'],
    stats: [['hp', 2, 'armor'], ['kbr', 0.04, 'armor'], ['arm', 0.8, 'armor'], ['tgh', 0.4, 'armor'], ['dmg', 0.4, 'weapon']] },
  'dps/guerrero': { tema: 'del Berserker', arq: 'media', tipo: 'espada', color: 0xB03A2E,
    armas: ['Espada de recluta', 'Hoja del veterano', 'Mandoble del campeón', 'Hoja del Señor de la Guerra'], base: ['stone_sword', 'iron_sword', 'diamond_sword', 'netherite_sword'],
    stats: [['crit', 0.015, 'armor'], ['critd', 0.08, 'armor'], ['life', 0.006, 'armor'], ['hp', 1, 'armor'], ['dmg', 0.8, 'weapon'], ['aspd', 0.06, 'weapon'], ['pierce', 0.4, 'weapon']] },
  'dps/arquero': { tema: 'del Cazador', arq: 'media', tipo: 'distancia', color: 0x2E7D32,
    armas: ['Arco de cazador', 'Arco del rastreador', 'Arco del montero', 'Arco del Ojo Infinito'], base: ['bow', 'bow', 'bow', 'bow'],
    stats: [['admg', 0.03, 'armor'], ['draw', 0.03, 'armor'], ['crit', 0.012, 'armor'], ['move', 0.008, 'armor'], ['avel', 0.03, 'armor'], ['admg', 0.03, 'weapon'], ['draw', 0.03, 'weapon']] },
  'dps/mago': { tema: 'del Piromante', arq: 'ligera', tipo: 'distancia', color: 0xC0392B,
    armas: ['Báculo de brasas', 'Báculo ígneo', 'Cetro del Piromante', 'Cetro del Archimago'], base: ['stick', 'blaze_rod', 'amethyst_shard', 'echo_shard'],
    stats: [['mana', 30, 'armor'], ['spower', 0.02, 'armor'], ['cdr', 0.015, 'armor'], ['cast', 0.015, 'armor'], ['fire', 0.02, 'armor'], ['spower', 0.03, 'weapon'], ['mana', 20, 'weapon']] },
  'dps/asesino': { tema: 'de la Sombra', arq: 'ligera', tipo: 'daga', color: 0x1B1B1B,
    armas: ['Daga de sombra', 'Estoque de sombra', 'Hoja del Verdugo', 'Colmillo del Fantasma'], base: ['stone_sword', 'iron_sword', 'diamond_sword', 'netherite_sword'],
    stats: [['crit', 0.02, 'armor'], ['critd', 0.08, 'armor'], ['dodge', 0.015, 'armor'], ['move', 0.01, 'armor'], ['hp', 1, 'armor'], ['dmg', 0.7, 'weapon'], ['aspd', 0.1, 'weapon'], ['pierce', 0.4, 'weapon']] },
  'dps/ingeniero': { tema: 'del Artillero', arq: 'media', tipo: 'distancia', color: 0xB9770E,
    armas: ['Ballesta de taller', 'Ballesta de resorte', 'Ballesta de asedio', 'Cañón de precisión'], base: ['crossbow', 'crossbow', 'crossbow', 'crossbow'],
    stats: [['admg', 0.025, 'armor'], ['crit', 0.012, 'armor'], ['pierce', 0.3, 'armor'], ['xpg', 0.02, 'armor'], ['hp', 1.5, 'armor'], ['admg', 0.04, 'weapon'], ['draw', 0.04, 'weapon']] },
  'healer/mago': { tema: 'del Sanador', arq: 'ligera', tipo: 'distancia', color: 0xF8BBD0,
    armas: ['Cayado de sanador', 'Báculo de luz', 'Cetro de vida', 'Cetro de la Aurora'], base: ['stick', 'blaze_rod', 'amethyst_shard', 'nether_star'],
    stats: [['mana', 40, 'armor'], ['holy', 0.025, 'armor'], ['spower', 0.015, 'armor'], ['mregen', 0.04, 'armor'], ['cdr', 0.015, 'armor'], ['heal', 0.03, 'armor'], ['hp', 1, 'armor'], ['holy', 0.04, 'weapon'], ['spower', 0.02, 'weapon']] },
  'soporte/arquero': { tema: 'del Explorador', arq: 'media', tipo: 'distancia', color: 0x8D6E63,
    armas: ['Ballesta de explorador', 'Ballesta de ruta', 'Ballesta del viajero', 'Ballesta del Horizonte'], base: ['crossbow', 'crossbow', 'crossbow', 'crossbow'],
    stats: [['move', 0.012, 'armor'], ['luck', 0.4, 'armor'], ['hp', 1.5, 'armor'], ['xpg', 0.025, 'armor'], ['dodge', 0.01, 'armor'], ['draw', 0.03, 'weapon'], ['move', 0.01, 'weapon']] },
  'soporte/ingeniero': { tema: 'del Mecánico', arq: 'media', tipo: 'pico', color: 0xF1C40F,
    armas: ['Pico de obrero', 'Pico reforzado', 'Pico del maestro', 'Pico del Titán'], base: ['iron_pickaxe', 'iron_pickaxe', 'diamond_pickaxe', 'netherite_pickaxe'],
    stats: [['mine', 0.03, 'armor'], ['luck', 0.4, 'armor'], ['hp', 1.5, 'armor'], ['xpg', 0.025, 'armor'], ['move', 0.008, 'armor'], ['mine', 0.06, 'weapon'], ['luck', 0.6, 'weapon']] },
};

/** que piezas da cada nivel de rol (1..16): [tier, [piezas]] */
var EQUIPO_NIVEL = {};
(function () {
  var orden = [['weapon'], ['chest'], ['head', 'legs'], ['feet']];
  for (var n = 1; n <= 16; n++) EQUIPO_NIVEL[n] = [Math.ceil(n / 4), orden[(n - 1) % 4]];
})();

global.EQUIPO_DEF = EQUIPO_DEF;
global.EQUIPO_NIVEL = EQUIPO_NIVEL;
global.EQ_TIER = EQ_TIER;

// ---- creacion de objetos ---------------------------------------------------------------------------------------------
/** 4 enteros no nulos a partir de una clave (UUID de un modificador de atributo) */
function eqUuid(clave) {
  var h = [0x811c9dc5, 0x1b873593, 0xcc9e2d51, 0x85ebca6b];
  for (var i = 0; i < clave.length; i++) {
    for (var k = 0; k < 4; k++) { h[k] = Math.imul(h[k] ^ clave.charCodeAt(i), 0x01000193 + k * 2) >>> 0; h[k] = (h[k] ^ (h[k] >>> 15)) >>> 0; }
  }
  return h.map(function (n) { return (n | 0) || 1; });
}
function eqNum(v) { return String(Number(v.toFixed(4))); }

/** modificador de atributo en SNBT */
function eqMod(clave, attr, cantidad, op, slot) {
  return '{AttributeName:"' + attr + '",Name:"rol_equipo",Amount:' + eqNum(cantidad) + 'd,Operation:' + op + ',Slot:"' + slot + '",UUID:[I;' + eqUuid(clave + ':' + attr).join(',') + ']}';
}

/** lista [atributo, cantidad, operacion] de una pieza ('head'|'chest'|'legs'|'feet'|'weapon') del conjunto de rol/clase en un tier */
function eqEstadisticas(def, tier, pieza) {
  var m = EQ_MULT[tier], out = {}, orden = [];
  var suma = function (k, v, op) { if (!(k in out)) { out[k] = [k, 0, op]; orden.push(k); } out[k][1] += v; };
  var f = EQ_FACTOR[def.arq];
  if (pieza !== 'weapon') {
    suma('arm', EQ_ARM[pieza][tier - 1] * f, 0);
    if (EQ_TGH[tier - 1] > 0) suma('tgh', EQ_TGH[tier - 1] * f, 0);
  } else if (EQ_ARMA[def.tipo]) {
    suma('dmg', EQ_ARMA[def.tipo].dmg[tier - 1], 0);
    suma('aspd', EQ_ARMA[def.tipo].aspd, 0);
  }
  def.stats.forEach(function (s) {
    var donde = s[2], v = s[1] * m;
    if (donde === 'armor') { if (pieza === 'weapon') return; v = v / 4; }
    else if (donde === 'weapon') { if (pieza !== 'weapon') return; }
    else v = v / 5;
    suma(s[0], v, EQ_OP_MB[s[0]] ? 1 : 0);
  });
  return orden.map(function (k) { return out[k]; });
}
global.eqEstadisticas = eqEstadisticas;

/** objeto de equipo de rol (ItemStack) o vacio. pieza: 'head'|'chest'|'legs'|'feet'|'weapon' */
function crearEquipo(rol, clase, tier, pieza) {
  rol = String(rol); clase = String(clase); pieza = String(pieza);   // pueden llegar como String de Java (charAt devolveria un numero)
  var def = EQUIPO_DEF[rol + '/' + clase];
  if (!def || tier < 1 || tier > 4) return Item.of('minecraft:air');
  var slotAttr = { head: 'head', chest: 'chest', legs: 'legs', feet: 'feet', weapon: 'mainhand' }[pieza];
  var id, nombre;
  if (pieza === 'weapon') { id = 'minecraft:' + def.base[tier - 1]; nombre = def.armas[tier - 1]; }
  else {
    id = 'minecraft:' + EQ_BASE_ARMOR[def.arq][tier - 1] + '_' + { head: 'helmet', chest: 'chestplate', legs: 'leggings', feet: 'boots' }[pieza];
    nombre = EQ_PIEZA[def.arq][pieza] + ' ' + def.tema;
  }
  var clave = rol + ':' + clase + ':' + pieza;
  var mods = eqEstadisticas(def, tier, pieza).map(function (e) { return eqMod(clave, EQ_ATTR[e[0]], e[1], e[2], slotAttr); });
  var json = function (o) { return JSON.stringify(o).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); };
  var lore = [
    json({ text: 'Equipo de rol · ' + global.ROLES[rol].nombre + ' (' + clase.charAt(0).toUpperCase() + clase.slice(1) + ')', color: 'gray', italic: false }),
    json({ text: 'Tier ' + ['', 'I', 'II', 'III', 'IV'][tier] + ' · ' + EQ_TIER[tier], color: EQ_COLOR[tier], italic: false }),
  ];
  var ench = tier === 2 ? '[{id:"minecraft:unbreaking",lvl:2s}]' : tier >= 3 ? '[{id:"minecraft:unbreaking",lvl:3s},{id:"minecraft:mending",lvl:1s}]' : '';
  var display = '{Name:\'' + json({ text: nombre, color: EQ_COLOR[tier], italic: false }) + '\',Lore:[' + lore.map(function (l) { return "'" + l + "'"; }).join(',') + ']'
    + (pieza !== 'weapon' && def.color && EQ_BASE_ARMOR[def.arq][tier - 1] === 'leather' ? ',color:' + def.color : '') + '}';
  var nbt = '{display:' + display + ',AttributeModifiers:[' + mods.join(',') + ']' + (ench ? ',Enchantments:' + ench : '') + (tier === 4 ? ',Unbreakable:1b' : '')
    + ',RolEquipo:{rol:"' + rol + '",clase:"' + clase + '",tier:' + tier + 'b,pieza:"' + pieza + '"}}';
  // Item.of('id{nbt}') no interpreta el NBT: se crea el objeto y se le pone la etiqueta leida de SNBT
  var stack = Item.of(id);
  var TagParser = Java.loadClass('net.minecraft.nbt.TagParser');
  stack.nbt = TagParser.parseTag(nbt);
  return stack;
}
global.crearEquipo = crearEquipo;

/** objetos de equipo de rol que da un nivel de rol segun la clase del jugador (lista de ItemStack) */
function equipoDeNivel(rol, clase, nivel) {
  rol = String(rol); clase = String(clase);
  var e = EQUIPO_NIVEL[nivel];
  if (!e || !EQUIPO_DEF[rol + '/' + clase]) return [];
  return e[1].map(function (pieza) { return crearEquipo(rol, clase, e[0], pieza); });
}
global.equipoDeNivel = equipoDeNivel;
