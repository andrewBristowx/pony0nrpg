// Tablas de recompensas de los roles (las usa gremio_roles.js).
//
// RECOMPENSAS_ROL[rol][clase][nivel] = objetos que se entregan al llegar a ese nivel.
//   Entrada de objeto:  ['mod:id', cantidad]   o   sc('hechizo', nivelDelHechizo)   (pergamino de Iron's Spells)
//   Nivel 0 = kit de inicio al confirmar el rol; niveles 1..8 = una mision cada uno en el capitulo de ese rol (FTB Quests).
// MEJORAS_ROL[rol][clase o '*'][nivel] = mejoras PERMANENTES de atributos (acumulativas):  [atributo, cantidad, operacion]
//   operacion: 'add' (por defecto) | 'multiply_base' | 'multiply'.
// Los objetos de nivel alto (diamante, netherita, sets de Iron's Spells...) siguen sujetos al bloqueo de equipo por clase
// (startup_scripts/class_gating.js): el rol da el objeto, pero hay que tener el tier de clase (arbol de Habilidades) para usarlo.
// IDs comprobados contra los jars del pack (tools/test: lista de objetos y atributos de cada mod).

const sc = (hechizo, nivel) => ['scroll', 'irons_spellbooks:' + hechizo, nivel || 1];
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
      [['minecraft:shield', 1], ['minecraft:iron_chestplate', 1], ['minecraft:cooked_beef', 16]],
      [['spartanweaponry:iron_flanged_mace', 1], ['minecraft:iron_leggings', 1]],
      [['minecraft:iron_helmet', 1], ['minecraft:iron_boots', 1], ['artifacts:thorn_pendant', 1]],
      [['spartanweaponry:diamond_flanged_mace', 1], ['minecraft:diamond_helmet', 1]],
      [['minecraft:diamond_chestplate', 1], ['minecraft:diamond_leggings', 1], ['artifacts:cross_necklace', 1]],
      [['spartanweaponry:diamond_battle_hammer', 1], ['minecraft:diamond_boots', 1]],
      [['artifacts:crystal_heart', 1], INGOT(2)],
      [NETH, INGOT(4)],
      [['simplyswords:netherite_greathammer', 1], TOTEM],
    ],
  },
  dps: {
    guerrero: [
      [['spartanweaponry:iron_greatsword', 1], ['minecraft:golden_apple', 2]],
      [['spartanweaponry:iron_battleaxe', 1], ['minecraft:iron_chestplate', 1]],
      [['artifacts:power_glove', 1], ['minecraft:iron_leggings', 1]],
      [['spartanweaponry:diamond_greatsword', 1]],
      [['simplyswords:diamond_claymore', 1], ['minecraft:diamond_chestplate', 1]],
      [['artifacts:vampiric_glove', 1], ['minecraft:diamond_leggings', 1]],
      [['spartanweaponry:diamond_battleaxe', 1], ['minecraft:diamond_boots', 1], ['minecraft:diamond_helmet', 1]],
      [NETH, INGOT(4)],
      [['simplyswords:netherite_claymore', 1], TOTEM],
    ],
    arquero: [
      [['spartanweaponry:iron_longbow', 1], ['spartanweaponry:iron_arrow', 32]],
      [['spartanweaponry:iron_heavy_crossbow', 1], ['spartanweaponry:bolt', 32]],
      [['artifacts:running_shoes', 1], ['minecraft:spectral_arrow', 32]],
      [['spartanweaponry:diamond_longbow', 1], ['spartanweaponry:diamond_arrow', 32]],
      [['spartanweaponry:diamond_heavy_crossbow', 1], ['spartanweaponry:diamond_bolt', 32]],
      [['artifacts:cloud_in_a_bottle', 1]],
      [['minecraft:spectral_arrow', 64], ['minecraft:golden_apple', 4]],
      [INGOT(3), ['minecraft:netherite_upgrade_smithing_template', 1]],
      [['spartanweaponry:netherite_longbow', 1], TOTEM],
    ],
    mago: [
      [sc('magic_missile'), ['irons_spellbooks:common_ink', 4]],
      [['irons_spellbooks:copper_spell_book', 1], sc('firebolt')],
      [sc('fireball'), ['irons_spellbooks:rare_ink', 4]],
      [['irons_spellbooks:pyromancer_chestplate', 1], ['irons_spellbooks:iron_spell_book', 1]],
      [['irons_spellbooks:pyromancer_leggings', 1], ['irons_spellbooks:pyromancer_boots', 1], sc('lightning_bolt')],
      [['irons_spellbooks:pyromancer_helmet', 1], ['irons_spellbooks:affinity_ring_fire', 1], sc('icicle')],
      [['irons_spellbooks:gold_spell_book', 1], ['irons_spellbooks:cast_time_ring', 1], sc('wall_of_fire')],
      [['irons_spellbooks:cooldown_ring', 1], sc('ball_lightning')],
      [['irons_spellbooks:diamond_spell_book', 1], ['irons_spellbooks:pyrium_staff', 1]],
    ],
    asesino: [
      [['spartanweaponry:iron_dagger', 1], ['spartanweaponry:iron_throwing_knife', 16]],
      [['spartanweaponry:iron_rapier', 1], ['minecraft:leather_chestplate', 1]],
      [['artifacts:scarf_of_invisibility', 1], ['minecraft:leather_leggings', 1]],
      [['spartanweaponry:diamond_dagger', 1], ['spartanweaponry:diamond_throwing_knife', 16]],
      [['simplyswords:diamond_katana', 1], ['artifacts:feral_claws', 1]],
      [['artifacts:vampiric_glove', 1], ['spartanweaponry:diamond_rapier', 1]],
      [['simplyswords:diamond_warglaive', 1], ['spartanweaponry:diamond_parrying_dagger', 1]],
      [INGOT(3), ['minecraft:netherite_upgrade_smithing_template', 2]],
      [['simplyswords:netherite_katana', 1], TOTEM],
    ],
    ingeniero: [
      [['create:potato_cannon', 1], ['minecraft:baked_potato', 32]],
      [['spartanweaponry:iron_heavy_crossbow', 1], ['spartanweaponry:bolt', 32]],
      [['create:extendo_grip', 1], ['artifacts:pocket_piston', 1]],
      [['spartanweaponry:diamond_heavy_crossbow', 1], ['spartanweaponry:diamond_bolt', 32]],
      [['create:copper_backtank', 1], ['minecraft:crossbow', 1]],
      [['artifacts:power_glove', 1], ['minecraft:firework_rocket', 16]],
      [['artifacts:fire_gauntlet', 1]],
      [INGOT(3), ['minecraft:netherite_upgrade_smithing_template', 1]],
      [['spartanweaponry:netherite_heavy_crossbow', 1], TOTEM],
    ],
  },
  healer: {
    mago: [
      [sc('heal'), ['irons_spellbooks:common_ink', 4]],
      [['irons_spellbooks:copper_spell_book', 1], sc('cleanse')],
      [sc('healing_circle'), ['irons_spellbooks:rare_ink', 4]],
      [['irons_spellbooks:priest_chestplate', 1], ['irons_spellbooks:iron_spell_book', 1]],
      [['irons_spellbooks:priest_leggings', 1], ['irons_spellbooks:priest_boots', 1], sc('fortify')],
      [['irons_spellbooks:priest_helmet', 1], ['irons_spellbooks:affinity_ring_holy', 1], sc('greater_heal')],
      [['irons_spellbooks:gold_spell_book', 1], ['irons_spellbooks:mana_ring', 1], ['irons_spellbooks:greater_healing_potion', 4]],
      [['irons_spellbooks:cooldown_ring', 1], sc('blessing_of_life')],
      [['irons_spellbooks:diamond_spell_book', 1], ['irons_spellbooks:concentration_amulet', 1]],
    ],
  },
  soporte: {
    arquero: [
      [['minecraft:crossbow', 1], ['minecraft:firework_rocket', 16]],
      [['sophisticatedbackpacks:backpack', 1], ['minecraft:cooked_porkchop', 16]],
      [['artifacts:running_shoes', 1], ['minecraft:spectral_arrow', 32]],
      [['artifacts:lucky_scarf', 1], ['minecraft:golden_carrot', 16]],
      [['sophisticatedbackpacks:iron_backpack', 1], ['minecraft:spyglass', 1]],
      [['artifacts:cloud_in_a_bottle', 1], ['minecraft:ender_pearl', 4]],
      [['sophisticatedbackpacks:gold_backpack', 1], ['minecraft:firework_rocket', 32]],
      [['artifacts:universal_attractor', 1], ['minecraft:golden_apple', 4]],
      [['sophisticatedbackpacks:diamond_backpack', 1], TOTEM],
    ],
    ingeniero: [
      [['create:wrench', 1], ['create:goggles', 1]],
      [['sophisticatedbackpacks:backpack', 1], ['create:super_glue', 1]],
      [['minecraft:iron_pickaxe', 1], ['minecraft:iron_shovel', 1], ['minecraft:iron_axe', 1]],
      [['artifacts:digging_claws', 1], ['create:brass_ingot', 8]],
      [['sophisticatedbackpacks:iron_backpack', 1], ['artifacts:night_vision_goggles', 1]],
      [['create:extendo_grip', 1], ['artifacts:pocket_piston', 1]],
      [['minecraft:diamond_pickaxe', 1], ['minecraft:diamond_axe', 1]],
      [['sophisticatedbackpacks:gold_backpack', 1], ['create:wand_of_symmetry', 1]],
      [['sophisticatedbackpacks:diamond_backpack', 1], ['create:handheld_worldshaper', 1]],
    ],
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
