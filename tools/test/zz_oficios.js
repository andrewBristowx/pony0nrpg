// Prueba de los oficios: dialogo y eleccion unica, categoria de Habilidades que se desbloquea y XP solo del oficio propio. Necesita el pack completo
// (Pufferfish con sus atributos de Apothic). La colocacion de los maestros se prueba aparte (zz_oficios_npc.js, servidor minimo).
ServerEvents.loaded((event) => {
  const s = event.server;
  s.scheduleInTicks(60, () => {
    try {
      global.TEST_ECO = true;
      var GPr = Java.loadClass('com.mojang.authlib.GameProfile'), UU = Java.loadClass('java.util.UUID');
      var fp = Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory').get(s.overworld(), new GPr(UU.randomUUID(), 'Tester'));
      var SkillsAPI = Java.loadClass('net.puffish.skillsmod.api.SkillsAPI');
      var cat = (id) => SkillsAPI.getCategory(new ResourceLocation('puffish_skills:oficio_' + id)).get();
      var actual = null;
      global.oficioDe = function () { return actual; };
      var O = global.oficioSistema;
      console.info('TEST --- confirmar sin hablar (debe rechazar)');
      O.confirmar(fp, 'minero');
      console.info('TEST --- hablar con el minero y confirmar');
      O.hablar(fp, 'minero');
      var r = O.confirmar(fp, 'minero'); actual = 'minero';
      console.info('TEST confirmar devolvio ' + r + ' | minero desbloqueado=' + cat('minero').isUnlocked(fp) + ' lenador desbloqueado=' + cat('lenador').isUnlocked(fp) + ' (esperado true/false)');
      console.info('TEST --- hablar con el lenador ya con oficio (debe negarse) y confirmar otro (debe rechazar)');
      O.hablar(fp, 'lenador'); console.info('TEST confirmar lenador devolvio ' + O.confirmar(fp, 'lenador'));
      var xpMin = () => cat('minero').getExperience().get().getTotal(fp), xpLen = () => cat('lenador').getExperience().get().getTotal(fp);
      console.info('TEST XP antes: minero=' + xpMin() + ' lenador=' + xpLen());
      console.info('TEST darXpOficio minero=' + global.darXpOficio(fp, 'minero', 300) + ' lenador=' + global.darXpOficio(fp, 'lenador', 300) + ' (esperado true/false)');
      console.info('TEST XP despues: minero=' + xpMin() + ' lenador=' + xpLen() + ' (esperado >0 / 0)');
      // maestros: NBT de cada oficio
      console.info('TEST oficios: ' + global.OFICIO_IDS.join(','));
      console.info('TEST snbt minero: ' + global.npcOficioSnbt('minero'));
    } catch (e) { console.error('TEST FALLO: ' + e); }
    s.scheduleInTicks(20, () => s.runCommandSilent('stop'));
  });
});
