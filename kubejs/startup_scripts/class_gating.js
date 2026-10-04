// [startup] Bloqueo DURO del equipo de clase de alto tier (docs/03). Lo básico (vanilla) sigue libre.
//
// Stages que da el árbol de Habilidades (tools/gen-skills.mjs):
//   clase_<c>        Tier I   -> raíz de la clase (1 punto)
//   maestria_<c>_2   Tier II  -> Fundamentos VI
//   maestria_<c>_3   Tier III -> cima de cualquier camino
// Un stage de tier mayor cubre los menores. Las misiones (FTB Quests) podrán dar los mismos stages.
//
// Para ajustar qué objeto pide qué: edita classify() y las tablas de abajo. Probar en el juego con:
//   /kubejs stages add @s clase_mago      /kubejs stages remove @s clase_mago      /kubejs stages list @s

const CLASS_NAMES = { guerrero: 'Guerrero', arquero: 'Arquero', mago: 'Mago', asesino: 'Asesino', ingeniero: 'Ingeniero' };
const TIER_ROMAN = ['', 'I', 'II', 'III'];

// ---- tablas --------------------------------------------------------------------------------------------
const MAT_T3 = /(netherite|mythril|adamantite|runic)/;
const MAT_T2 = /(diamond|steel|invar|electrum|constantan|silver|platinum|nickel)/;
const matTier = (path) => (MAT_T3.test(path) ? 3 : MAT_T2.test(path) ? 2 : 1);

const SPARTAN_EXCLUDE = /(_arrow|_bolt|quiver|handle|grease|dynamite|explosive|^custom_|cestus)/;
const HEAVY = /(greatsword|battle_hammer|battleaxe|warhammer|halberd|lance|glaive|pike|flanged_mace|scythe|quarterstaff|claymore|greataxe|greathammer|twinblade)/;
const LIGHT = /(dagger|throwing_knife|rapier|saber|katana|tomahawk|boomerang|javelin|chakram|cutlass|sai|warglaive)/;
const RANGED = /(longbow|heavy_crossbow)/;

// Armas únicas de Simply Swords (Tier III; Guerrero o Asesino)
const SIMPLY_UNIQUE = /^simplyswords:(awakened_lichblade|slumbering_lichblade|waking_lichblade|bloodwake|bramblethorn|brimstone_claymore|caelestis|dreadtide|dreadwhisper|emberblade|emberlash|enigma|flamewind|frostfall|gloampiercer|harbinger|hearthflame|hiveheart|icewhisper|livyatan|molten_edge|mjolnir|ribboncleaver|riftmane|shadowsting|soulkeeper|soulpyre|soulrender|soulstalker|soulstealer|stars_edge|stormbringer|storms_edge|tempest|the_devourer|thunderbrand|toxic_longsword|twilight|twisted_blade|watcher_claymore|watching_warglaive|waxweaver|whisperwind|wickpiercer|wraithfang|wraithmaw)$/;
const SIMPLY_MAGIC = /^simplyswords:(magiblade|magic_estoc|magiscythe|magispear)$/;

const IRONS_SETS = '(pyromancer|cryomancer|electromancer|priest|shadowwalker|cultist|plagued|tarnished|pumpkin|wandering_magician|infernal_sorcerer)';
const ARMOR_PIECE = '(helmet|chestplate|leggings|boots)';
const RX = {
  mageT3: new RegExp('^irons_spellbooks:((netherite|dragonskin|necronomicon)_spell_book|staff_of_the_nines|pyrium_staff|netherite_mage_' + ARMOR_PIECE + '|archevoker_' + ARMOR_PIECE + ')$|^ars_nouveau:archmage_spell_book$'),
  mageT1: new RegExp('^irons_spellbooks:((wimpy|copper|iron)_spell_book|graybeard_staff|wizard_' + ARMOR_PIECE + ')$|^ars_nouveau:(novice_spell_book|wand|sorcerer_(hood|robes|leggings|boots))$'),
  mageT2: new RegExp('^irons_spellbooks:(\\w+_spell_book|\\w+_staff|artificer_cane|' + IRONS_SETS + '_' + ARMOR_PIECE + ')$|^ars_nouveau:(apprentice_spell_book|arcanist_\\w+|battlemage_\\w+)$'),
};

/** Devuelve { classes: [...], tier } si el objeto es de clase, o null si es libre. */
function classify(id) {
  // Los libros de hechizos de Iron's son solo un contenedor: el limite ahora es QUE hechizos has aprendido (ver el evento de abajo), no la clase.
  if (/^irons_spellbooks:\w+_spell_book$/.test(id)) return null;
  if (RX.mageT3.test(id)) return { classes: ['mago'], tier: 3 };
  if (RX.mageT1.test(id)) return { classes: ['mago'], tier: 1 };
  if (RX.mageT2.test(id)) return { classes: ['mago'], tier: 2 };
  if (id === 'ars_nouveau:spell_bow' || id === 'ars_nouveau:spell_crossbow') return { classes: ['mago', 'arquero'], tier: 2 };
  if (id === 'irons_spellbooks:autoloader_crossbow') return { classes: ['arquero'], tier: 2 };
  if (SIMPLY_UNIQUE.test(id)) return { classes: ['guerrero', 'asesino'], tier: 3 };
  if (SIMPLY_MAGIC.test(id)) return { classes: ['mago', 'guerrero'], tier: 3 };

  const parts = id.split(':');
  const ns = parts[0], path = parts[1];
  if (ns === 'spartanweaponry') {
    if (SPARTAN_EXCLUDE.test(path)) return null;
    if (RANGED.test(path)) return { classes: ['arquero'], tier: matTier(path) };
    if (HEAVY.test(path)) return { classes: ['guerrero'], tier: matTier(path) };
    if (LIGHT.test(path)) return { classes: ['asesino'], tier: matTier(path) };
    return null;
  }
  if (ns === 'simplyswords') {
    const m = /^(iron|gold|diamond|netherite|runic)_(.+)$/.exec(path);
    if (!m) return null;
    const tier = m[1] === 'diamond' ? 2 : (m[1] === 'netherite' || m[1] === 'runic') ? 3 : 1;
    if (HEAVY.test(m[2])) return { classes: ['guerrero'], tier: tier };
    if (LIGHT.test(m[2])) return { classes: ['asesino'], tier: tier };
    if (m[2] === 'longsword') return { classes: ['guerrero', 'asesino'], tier: tier };
  }
  return null;
}

// ---- comprobación --------------------------------------------------------------------------------------
function stageFor(cls, tier) { return tier === 1 ? 'clase_' + cls : 'maestria_' + cls + '_' + tier; }

/** ¿El jugador cumple el requisito? (un tier mayor cubre los menores) */
function hasTier(player, cls, tier) {
  // elegir la clase en Origins concede 'origen_<c>' (Tier I) aunque luego se reinicie el árbol de habilidades
  if (tier <= 1 && player.stages.has('origen_' + cls)) return true;
  for (let t = tier; t <= 3; t++) if (player.stages.has(stageFor(cls, t))) return true;
  return false;
}
function allowed(player, rule) {
  for (let i = 0; i < rule.classes.length; i++) if (hasTier(player, rule.classes[i], rule.tier)) return true;
  return false;
}
function requirementText(rule) {
  return rule.classes.map((c) => CLASS_NAMES[c] + ' ' + TIER_ROMAN[rule.tier]).join(' o ');
}

const cache = {};
function ruleOf(stack) {
  if (!stack || stack.isEmpty()) return null;
  const id = String(stack.id);
  if (!(id in cache)) cache[id] = classify(id);
  return cache[id];
}
function isCreative(player) { return player.isCreative(); }
function deny(player, rule) {
  player.setStatusMessage(Text.red('Necesitas ' + requirementText(rule) + ' (árbol de Habilidades) para usar esto.'));
}

// ---- eventos de Forge (solo se pueden registrar en startup_scripts) ---------------------------------------
// Atacar con el arma en la mano
ForgeEvents.onEvent('net.minecraftforge.event.entity.player.AttackEntityEvent', (event) => {
  const player = event.getEntity();
  const rule = ruleOf(player.mainHandItem);
  if (rule && !isCreative(player) && !allowed(player, rule)) {
    deny(player, rule);
    event.setCanceled(true);
  }
});

// Lanzar hechizos (libros, bastones, pergaminos de Iron's Spells): solo los que el jugador ha APRENDIDO (stage hech_<hechizo>, que da la
// progresion de rol: /rol recompensa). Da igual de donde salga el pergamino o el libro: sin haber aprendido el hechizo no se lanza.
// Se dejan pasar el modo creativo y el origen COMMAND (administradores).
ForgeEvents.onEvent('io.redspace.ironsspellbooks.api.events.SpellPreCastEvent', (event) => {
  try {
    var player = event.getEntity();
    if (!player || isCreative(player)) return;
    if (String(event.getCastSource()) === 'COMMAND') return;
    var id = String(event.getSpellId()), path = id.substring(id.indexOf(':') + 1);
    if (global.hechizoAprendido(player, path)) return;
    var info = global.HECHIZOS && global.HECHIZOS[path];
    player.setStatusMessage(Text.red('No has aprendido ' + (info ? '«' + info[0] + '»' : 'este hechizo') + ': los hechizos se consiguen con tu progresión (misiones de rol).'));
    event.setCanceled(true);
  } catch (e) { console.error('[class_gating] SpellPreCastEvent: ' + e); }
});

// ---- compartido con server_scripts/class_gating.js ---------------------------------------------------------
global.CG = { ruleOf: ruleOf, allowed: allowed, hasTier: hasTier, deny: deny, isCreative: isCreative };
