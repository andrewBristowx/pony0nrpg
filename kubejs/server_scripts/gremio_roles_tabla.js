// Tablas de recompensas de los roles (las usa gremio_roles.js).
//
// RECOMPENSAS_ROL[rol][clase][nivel] = objetos que se entregan al llegar a ese nivel.
//   Entrada de objeto:  ['mod:id', cantidad]
//   Los HECHIZOS no van aqui: se aprenden por progresion, ver HECHIZOS_ROL mas abajo (los pergaminos ya no salen de cofres ni se fabrican).
//   Nivel 0 = kit de inicio al confirmar el rol; niveles 1..8 = una mision cada uno en el capitulo de ese rol (FTB Quests).
// MEJORAS_ROL[rol][clase o '*'][nivel] = mejoras PERMANENTES de atributos (acumulativas):  [atributo, cantidad, operacion]
//   operacion: 'add' (por defecto) | 'multiply_base' | 'multiply'.
// Los objetos de nivel alto (diamante, netherita, sets de Iron's Spells...) siguen sujetos al bloqueo de equipo por clase
// (startup_scripts/class_gating.js): el rol da el objeto, pero hay que tener el tier de clase (arbol de Habilidades) para usarlo.
// IDs comprobados contra los jars del pack (tools/test: lista de objetos y atributos de cada mod).

const MESA = ['irons_spellbooks:inscription_table', 1], LIBRO = (m) => ['irons_spellbooks:' + m + '_spell_book', 1];
const hp = 'minecraft:generic.max_health', armor = 'minecraft:generic.armor', tough = 'minecraft:generic.armor_toughness';
const kb = 'minecraft:generic.knockback_resistance', atk = 'minecraft:generic.attack_damage', aspd = 'minecraft:generic.attack_speed';
const mov = 'minecraft:generic.movement_speed', luck = 'minecraft:generic.luck';
const mana = 'irons_spellbooks:max_mana', manaReg = 'irons_spellbooks:mana_regen', sp = 'irons_spellbooks:spell_power', holy = 'irons_spellbooks:holy_spell_power';
const cd = 'irons_spellbooks:cooldown_reduction', cast = 'irons_spellbooks:cast_time_reduction', sres = 'irons_spellbooks:spell_resist';
const crit = 'attributeslib:crit_chance', critD = 'attributeslib:crit_damage', pierce = 'attributeslib:armor_pierce';
const arrowD = 'attributeslib:arrow_damage', draw = 'attributeslib:draw_speed', xp = 'attributeslib:experience_gained', mine = 'attributeslib:mining_speed';
const NETH = ['minecraft:netherite_upgrade_smithing_template', 2], INGOT = (n) => ['minecraft:netherite_ingot', n], TOTEM = ['minecraft:totem_of_undying', 1];

global.RECOMPENSAS_ROL = {
  tanque: {
    guerrero: [
      [['minecraft:shield', 1], ['minecraft:cooked_beef', 16], MESA, LIBRO('copper')],
      [['spartanweaponry:iron_flanged_mace', 1]],
      [, ['artifacts:thorn_pendant', 1]],
      [['spartanweaponry:diamond_flanged_mace', 1]],
      [, ['artifacts:cross_necklace', 1], LIBRO('iron')],
      [['spartanweaponry:diamond_battle_hammer', 1]],
      [['artifacts:crystal_heart', 1], INGOT(2), LIBRO('gold')],
      [NETH, INGOT(4)],
      [['simplyswords:netherite_greathammer', 1], TOTEM],
    ],
  },
  dps: {
    guerrero: [
      [['spartanweaponry:iron_greatsword', 1], ['minecraft:golden_apple', 2], MESA, LIBRO('copper')],
      [['spartanweaponry:iron_battleaxe', 1]],
      [['artifacts:power_glove', 1]],
      [['spartanweaponry:diamond_greatsword', 1]],
      [['simplyswords:diamond_claymore', 1], LIBRO('iron')],
      [['artifacts:vampiric_glove', 1]],
      [['spartanweaponry:diamond_battleaxe', 1], LIBRO('gold')],
      [NETH, INGOT(4)],
      [['simplyswords:netherite_claymore', 1], TOTEM],
    ],
    arquero: [
      [['spartanweaponry:iron_longbow', 1], ['spartanweaponry:iron_arrow', 32], MESA, LIBRO('copper')],
      [['spartanweaponry:iron_heavy_crossbow', 1], ['spartanweaponry:bolt', 32]],
      [['artifacts:running_shoes', 1], ['minecraft:spectral_arrow', 32]],
      [['spartanweaponry:diamond_longbow', 1], ['spartanweaponry:diamond_arrow', 32]],
      [['spartanweaponry:diamond_heavy_crossbow', 1], ['spartanweaponry:diamond_bolt', 32], LIBRO('iron')],
      [['artifacts:cloud_in_a_bottle', 1]],
      [['minecraft:spectral_arrow', 64], ['minecraft:golden_apple', 4], LIBRO('gold')],
      [INGOT(3), ['minecraft:netherite_upgrade_smithing_template', 1]],
      [['spartanweaponry:netherite_longbow', 1], TOTEM],
    ],
    mago: [
      [MESA, ['irons_spellbooks:common_ink', 4]],
      [LIBRO('copper'), ['irons_spellbooks:common_ink', 4]],
      [['irons_spellbooks:rare_ink', 4]],
      [['irons_spellbooks:pyromancer_chestplate', 1], LIBRO('iron')],
      [['irons_spellbooks:pyromancer_leggings', 1], ['irons_spellbooks:pyromancer_boots', 1]],
      [['irons_spellbooks:pyromancer_helmet', 1], ['irons_spellbooks:fireward_ring', 1]],
      [LIBRO('gold'), ['irons_spellbooks:cast_time_ring', 1]],
      [['irons_spellbooks:cooldown_ring', 1], ['irons_spellbooks:epic_ink', 4]],
      [['irons_spellbooks:diamond_spell_book', 1], ['irons_spellbooks:pyrium_staff', 1]],
    ],
    asesino: [
      [['spartanweaponry:iron_dagger', 1], ['spartanweaponry:iron_throwing_knife', 16], MESA, LIBRO('copper')],
      [['spartanweaponry:iron_rapier', 1]],
      [['artifacts:scarf_of_invisibility', 1]],
      [['spartanweaponry:diamond_dagger', 1], ['spartanweaponry:diamond_throwing_knife', 16]],
      [['simplyswords:diamond_katana', 1], ['artifacts:feral_claws', 1], LIBRO('iron')],
      [['artifacts:vampiric_glove', 1], ['spartanweaponry:diamond_rapier', 1]],
      [['simplyswords:diamond_warglaive', 1], ['spartanweaponry:diamond_parrying_dagger', 1], LIBRO('gold')],
      [INGOT(3), ['minecraft:netherite_upgrade_smithing_template', 2]],
      [['simplyswords:netherite_katana', 1], TOTEM],
    ],
    ingeniero: [
      [['create:potato_cannon', 1], ['minecraft:baked_potato', 32], MESA, LIBRO('copper')],
      [['spartanweaponry:iron_heavy_crossbow', 1], ['spartanweaponry:bolt', 32]],
      [['create:extendo_grip', 1], ['artifacts:pocket_piston', 1]],
      [['spartanweaponry:diamond_heavy_crossbow', 1], ['spartanweaponry:diamond_bolt', 32]],
      [['create:copper_backtank', 1], ['minecraft:crossbow', 1], LIBRO('iron')],
      [['artifacts:power_glove', 1], ['minecraft:firework_rocket', 16]],
      [['artifacts:fire_gauntlet', 1], LIBRO('gold')],
      [INGOT(3), ['minecraft:netherite_upgrade_smithing_template', 1]],
      [['spartanweaponry:netherite_heavy_crossbow', 1], TOTEM],
    ],
  },
  healer: {
    mago: [
      [MESA, ['irons_spellbooks:common_ink', 4]],
      [LIBRO('copper'), ['irons_spellbooks:common_ink', 4]],
      [['irons_spellbooks:rare_ink', 4]],
      [['irons_spellbooks:priest_chestplate', 1], LIBRO('iron')],
      [['irons_spellbooks:priest_leggings', 1], ['irons_spellbooks:priest_boots', 1]],
      [['irons_spellbooks:priest_helmet', 1], ['irons_spellbooks:mana_ring', 1]],
      [LIBRO('gold'), ['irons_spellbooks:cast_time_ring', 1], ['irons_spellbooks:greater_healing_potion', 4]],
      [['irons_spellbooks:cooldown_ring', 1], ['irons_spellbooks:epic_ink', 4]],
      [['irons_spellbooks:diamond_spell_book', 1], ['irons_spellbooks:concentration_amulet', 1]],
    ],
  },
  soporte: {
    arquero: [
      [['minecraft:crossbow', 1], ['minecraft:firework_rocket', 16], MESA, LIBRO('copper')],
      [['sophisticatedbackpacks:backpack', 1], ['minecraft:cooked_porkchop', 16]],
      [['artifacts:running_shoes', 1], ['minecraft:spectral_arrow', 32]],
      [['artifacts:lucky_scarf', 1], ['minecraft:golden_carrot', 16]],
      [['sophisticatedbackpacks:iron_backpack', 1], ['minecraft:spyglass', 1], LIBRO('iron')],
      [['artifacts:cloud_in_a_bottle', 1], ['minecraft:ender_pearl', 4]],
      [['sophisticatedbackpacks:gold_backpack', 1], ['minecraft:firework_rocket', 32]],
      [['artifacts:universal_attractor', 1], ['minecraft:golden_apple', 4]],
      [['sophisticatedbackpacks:diamond_backpack', 1], TOTEM],
    ],
    ingeniero: [
      [['create:wrench', 1], ['create:goggles', 1], MESA, LIBRO('copper')],
      [['sophisticatedbackpacks:backpack', 1], ['create:super_glue', 1]],
      [['minecraft:iron_pickaxe', 1], ['minecraft:iron_shovel', 1], ['minecraft:iron_axe', 1]],
      [['artifacts:digging_claws', 1], ['create:brass_ingot', 8]],
      [['sophisticatedbackpacks:iron_backpack', 1], ['artifacts:night_vision_goggles', 1], LIBRO('iron')],
      [['create:extendo_grip', 1], ['artifacts:pocket_piston', 1]],
      [['minecraft:diamond_pickaxe', 1], ['minecraft:diamond_axe', 1]],
      [['sophisticatedbackpacks:gold_backpack', 1], ['create:wand_of_symmetry', 1], LIBRO('gold')],
      [['sophisticatedbackpacks:diamond_backpack', 1], ['create:handheld_worldshaper', 1]],
    ],
  },
};

// HECHIZOS_ROL[rol][clase][nivel] = hechizos que se APRENDEN al llegar a ese nivel (stage hech_<hechizo>) y se entregan en pergamino.
//   Entrada: 'hechizo'  o  ['hechizo', nivelDelPergamino].  Los pergaminos ya no salen de cofres ni se fabrican (ver kubejs/data/irons_spellbooks y fixes.js):
//   solo se consiguen asi. Para lanzarlos hay que inscribirlos en un libro de hechizos (mesa de inscripcion + libro, que tambien da el rol).
//   Nombres y descripciones: startup_scripts/hechizos_datos.js.
global.HECHIZOS_ROL = {
  tanque: {
    guerrero: [['oakskin'], [], ['fortify'], ['scapegoat'], ['shield'], ['stomp'], ['heartstop'], ['root'], ['shockwave']],
  },
  dps: {
    guerrero: [[], ['haste'], ['flaming_strike'], ['charge'], ['burning_dash'], ['echoing_strikes'], ['stomp'], ['heat_surge'], ['shockwave']],
    arquero:  [[], ['poison_arrow'], ['echoing_strikes'], ['haste'], ['arrow_volley'], ['evasion'], ['spider_aspect'], ['gust'], [['arrow_volley', 3]]],
    mago:     [['magic_missile'], ['firebolt'], ['fireball'], ['electrocute'], ['lightning_bolt'], ['icicle'], ['wall_of_fire'], ['ball_lightning', 'chain_lightning'], ['thunderstorm', 'starfall']],
    asesino:  [[], ['shadow_slash'], ['invisibility'], ['blood_step'], ['echoing_strikes'], ['evasion'], ['frost_step', 'spider_aspect'], ['abyssal_shroud'], ['teleport']],
    ingeniero:[[], ['charge'], ['electrocute'], ['haste'], ['gust'], ['lightning_lance'], ['chain_lightning'], ['ball_lightning'], ['thunderstorm']],
  },
  healer: {
    mago: [['heal'], ['cleanse'], ['healing_circle'], [], ['fortify'], ['greater_heal'], ['wisp'], ['blessing_of_life'], ['shield']],
  },
  soporte: {
    arquero:  [[], ['haste'], ['planar_sight'], ['evasion'], ['fortify'], ['teleport'], ['telekinesis'], ['cleanse'], ['invisibility']],
    ingeniero:[[], ['haste'], ['planar_sight'], ['telekinesis'], ['shield'], ['fortify'], ['teleport'], ['cleanse'], ['healing_circle']],
  },
};

global.MEJORAS_ROL = {
  tanque: { '*': [
    [],
    [[hp, 2], [armor, 1]],
    [[kb, 0.1], [armor, 1]],
    [[hp, 2], [tough, 1]],
    [[hp, 2], [armor, 1]],
    [[kb, 0.1], [tough, 1]],
    [[hp, 4], [armor, 2]],
    [[armor, 2], [tough, 1]],
    [[hp, 4], [kb, 0.1]],
  ] },
  dps: {
    guerrero: [[], [[atk, 0.5]], [[crit, 0.03]], [[aspd, 0.1]], [[atk, 0.5], [critD, 0.1]], [[crit, 0.03], [mov, 0.03, 'multiply_base']], [[atk, 1], [pierce, 2]], [[critD, 0.15], [aspd, 0.1]], [[atk, 1], [crit, 0.04]]],
    asesino: [[], [[atk, 0.5]], [[crit, 0.04]], [[aspd, 0.15]], [[critD, 0.15], [mov, 0.03, 'multiply_base']], [[crit, 0.04], [atk, 0.5]], [[atk, 1], [pierce, 2]], [[critD, 0.2], [aspd, 0.1]], [[atk, 1], [crit, 0.05]]],
    arquero: [[], [[arrowD, 0.05]], [[draw, 0.05]], [[crit, 0.03]], [[arrowD, 0.08]], [[draw, 0.05], [mov, 0.03, 'multiply_base']], [[crit, 0.03], [pierce, 2]], [[arrowD, 0.1]], [[critD, 0.2], [draw, 0.05]]],
    mago: [[], [[sp, 0.04]], [[mana, 25]], [[cd, 0.03]], [[sp, 0.04], [manaReg, 0.1]], [[cast, 0.05]], [[sp, 0.05], [mana, 25]], [[cd, 0.03], [manaReg, 0.1]], [[sp, 0.07], [mana, 50]]],
    '*': [[], [[atk, 0.5]], [[crit, 0.03]], [[aspd, 0.1]], [[atk, 0.5], [critD, 0.1]], [[crit, 0.03]], [[atk, 1], [pierce, 2]], [[critD, 0.15]], [[atk, 1], [crit, 0.04]]],
  },
  healer: { '*': [
    [],
    [[mana, 25], [holy, 0.05]],
    [[manaReg, 0.1], [sp, 0.03]],
    [[cd, 0.03], [hp, 2]],
    [[holy, 0.05], [mana, 25]],
    [[cast, 0.05], [manaReg, 0.1]],
    [[sp, 0.05], [cd, 0.03]],
    [[holy, 0.07], [hp, 2]],
    [[mana, 50], [sres, 0.05]],
  ] },
  soporte: {
    arquero: [[], [[mov, 0.03, 'multiply_base']], [[luck, 0.5]], [[hp, 2]], [[arrowD, 0.05]], [[mov, 0.03, 'multiply_base'], [xp, 0.05]], [[luck, 0.5], [draw, 0.05]], [[hp, 2]], [[mov, 0.04, 'multiply_base'], [luck, 0.5]]],
    ingeniero: [[], [[mine, 0.1]], [[luck, 0.5]], [[hp, 2]], [[mine, 0.1], [xp, 0.05]], [[mov, 0.03, 'multiply_base']], [[luck, 0.5], [mine, 0.1]], [[hp, 2], [xp, 0.05]], [[mine, 0.15], [luck, 0.5]]],
    '*': [[], [[mov, 0.03, 'multiply_base']], [[luck, 0.5]], [[hp, 2]], [[xp, 0.05]], [[mov, 0.03, 'multiply_base']], [[luck, 0.5]], [[hp, 2]], [[mov, 0.04, 'multiply_base'], [luck, 0.5]]],
  },
};

// ---- niveles 9..16 (segunda mitad del capitulo de rol: jefes y materiales) -------------------------------------------------
// El equipo de rol con atributos (tiers III y IV) lo da gremio_equipo.js; aqui: objetos sueltos, mejoras de atributos y hechizos mejorados.
(function () {
  // objetos extra por nivel, iguales para todos los roles
  var EXTRA = { 9: [['minecraft:golden_apple', 8]], 10: [['minecraft:netherite_ingot', 2]], 12: [TOTEM], 13: [['minecraft:golden_apple', 8]],
    14: [['minecraft:netherite_ingot', 3]], 16: [['minecraft:enchanted_golden_apple', 2], TOTEM] };
  var R = global.RECOMPENSAS_ROL;
  Object.keys(R).forEach(function (rol) {
    Object.keys(R[rol]).forEach(function (clase) {
      var arr = R[rol][clase];
      for (var n = 9; n <= 16; n++) arr[n] = (EXTRA[n] || []).slice();
      if (clase === 'mago') {
        arr[10].push(['irons_spellbooks:legendary_ink', 4]);
        arr[16].push(LIBRO('netherite'));
      } else {
        arr[12].push(LIBRO('diamond'));
        arr[16].push(LIBRO('netherite'));
      }
      if (rol === 'healer') { arr[10].push(['irons_spellbooks:greater_healing_potion', 4]); arr[14].push(['irons_spellbooks:greater_healing_potion', 4]); }
    });
  });

  // mejoras de atributos: los niveles 9..16 repiten las de los niveles 1..8 con un 50 % mas
  var M = global.MEJORAS_ROL;
  Object.keys(M).forEach(function (rol) {
    Object.keys(M[rol]).forEach(function (clase) {
      var arr = M[rol][clase];
      for (var n = 9; n <= 16; n++) arr[n] = (arr[n - 8] || []).map(function (m) { return [m[0], Number((m[1] * 1.5).toFixed(4)), m[2]]; });
    });
  });

  // hechizos: pergaminos de mayor nivel de los ya aprendidos y alguno nuevo
  var EXT = {
    'tanque/guerrero': [[['oakskin', 3]], [['stomp', 3]], [['fortify', 3]], [['heartstop', 3]], ['gust'], [['shockwave', 3]], [['scapegoat', 3]], [['root', 3], ['shield', 3]]],
    'dps/guerrero':    [[['haste', 3]], [['flaming_strike', 3]], [['charge', 3]], ['spider_aspect'], [['burning_dash', 3]], [['echoing_strikes', 3]], [['heat_surge', 3]], [['shockwave', 3]]],
    'dps/arquero':     [[['poison_arrow', 3]], [['haste', 3]], ['invisibility'], [['arrow_volley', 5]], [['evasion', 3]], [['echoing_strikes', 3]], ['teleport'], [['arrow_volley', 6]]],
    'dps/mago':        [[['firebolt', 3]], [['fireball', 3]], ['lightning_lance'], [['lightning_bolt', 3]], [['wall_of_fire', 3]], [['chain_lightning', 3]], ['telekinesis'], [['fireball', 5], ['thunderstorm', 3]]],
    'dps/asesino':     [[['shadow_slash', 3]], [['blood_step', 3]], [['invisibility', 3]], [['echoing_strikes', 3]], ['burning_dash'], [['evasion', 3]], [['teleport', 3]], [['abyssal_shroud', 3]]],
    'dps/ingeniero':   [[['electrocute', 3]], [['charge', 3]], [['lightning_lance', 3]], [['chain_lightning', 3]], [['gust', 3]], [['ball_lightning', 3]], ['shockwave'], [['thunderstorm', 3]]],
    'healer/mago':     [[['heal', 5]], [['heal', 8]], [['healing_circle', 3]], [['fortify', 3]], [['wisp', 3]], [['wisp', 5]], [['blessing_of_life', 3]], [['healing_circle', 5], ['shield', 3]]],
    'soporte/arquero': [[['haste', 3]], [['planar_sight', 3]], [['fortify', 3]], [['evasion', 3]], [['teleport', 3]], [['fortify', 5]], [['telekinesis', 3]], [['invisibility', 3]]],
    'soporte/ingeniero': [[['haste', 3]], [['shield', 3]], [['planar_sight', 3]], [['fortify', 3]], [['telekinesis', 3]], [['teleport', 3]], [['teleport', 5]], [['healing_circle', 3]]],
  };
  Object.keys(EXT).forEach(function (k) {
    var parts = k.split('/'), arr = global.HECHIZOS_ROL[parts[0]][parts[1]];
    EXT[k].forEach(function (lista, i) { arr[9 + i] = lista; });
  });
})();
