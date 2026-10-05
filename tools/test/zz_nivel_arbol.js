// Prueba: nivel de Habilidades en el nombre (chat/TAB) y hechizos de los nodos del arbol (necesita Pufferfish's Skills, Iron's Spells y el pack completo).
ServerEvents.loaded((event) => {
  const s = event.server;
  s.scheduleInTicks(60, () => {
    try {
      var GPr = Java.loadClass('com.mojang.authlib.GameProfile'), UU = Java.loadClass('java.util.UUID');
      var fp = Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory').get(s.overworld(), new GPr(UU.randomUUID(), 'Tester'));
      var SkillsAPI = Java.loadClass('net.puffish.skillsmod.api.SkillsAPI');
      var cat = SkillsAPI.getCategory(new ResourceLocation('puffish_skills:habilidades_mago')).get();
      cat.unlock(fp);
      var exp = cat.getExperience().get();
      console.info('TEST nivel inicial=' + global.nivelDe(fp, 'mago') + ' (esperado 1; sin clase: ' + global.nivelDe(fp) + ')');
      exp.addTotal(fp, 5000);
      console.info('TEST nivel con 5000 XP=' + global.nivelDe(fp, 'mago') + ' api=' + exp.getLevel(fp));
      exp.setLevel(fp, 37);
      console.info('TEST nivel fijado=' + global.nivelDe(fp, 'mago') + ' (esperado 37)');
      // nombre decorado
      var nd = global.nivelDe;
      global.nivelDe = function (pl) { return nd(pl, 'mago'); };
      global.rolDe = function () { return 'healer'; }; global.gremioDe = function () { return 'slytherion'; };
      console.info('TEST nombre: ' + global.nombreDecorado(fp, Text.of('Tester')).getString());
      global.rolDe = function () { return false; };
      console.info('TEST nombre sin rol: ' + global.nombreDecorado(fp, Text.of('Tester')).getString());
      global.nivelDe = nd;
      // arbol: comprar los nodos hasta el primer hechizo de Piromancia
      cat.addExtraPoints(fp, 80);
      var ids = []; for (var i = 1; i <= 10; i++) ids.push('mago_f' + i); for (var j = 1; j <= 11; j++) ids.push('mago_piromancia_' + j);
      ids.forEach((id) => { var sk = cat.getSkill(id); if (!sk.isPresent()) { console.error('TEST nodo inexistente ' + id); return; } try { sk.get().unlock(fp); } catch (e) { console.error('TEST unlock ' + id + ' fallo: ' + e + ' | ' + (e.javaException ? e.javaException.getStackTrace()[0] + ' ' + e.javaException.getStackTrace()[1] + ' ' + e.javaException.getStackTrace()[2] : '')); } });
      var est = (id) => String(cat.getSkill(id).get().getState(fp));
      console.info('TEST estados: f1=' + est('mago_f1') + ' piromancia_5=' + est('mago_piromancia_5') + ' piromancia_11=' + est('mago_piromancia_11') + ' piromancia_17=' + est('mago_piromancia_17') + ' oscuridad_5=' + est('mago_oscuridad_5'));
      global.TEST_ECO = true;
      console.info('TEST sincronizar -> ' + global.sincronizarHechizosArbol(fp, 'mago') + ' hechizos (esperado 2: nodos 5 y 11 de Piromancia)');
      console.info('TEST sincronizar otra vez -> ' + global.sincronizarHechizosArbol(fp, 'mago') + ' (esperado 0)');
      var inv = []; fp.inventory.allItems.forEach((it) => { if (!it.isEmpty()) inv.push(it.count + 'x ' + it.id); });
      console.info('TEST inventario: ' + inv.join(', ') + ' | dado scorch=' + fp.persistentData.getInt('hechDado_scorch') + ' firebolt=' + fp.persistentData.getInt('hechDado_firebolt'));
      // todos los hechizos del arbol existen y su nivel cabe
      var Registro = Java.loadClass('io.redspace.ironsspellbooks.api.registry.SpellRegistry'), malos = 0, n = 0;
      Object.keys(global.HECHIZOS_ARBOL).forEach((nodo) => {
        n++; var d = global.HECHIZOS_ARBOL[nodo], sp = Registro['getSpell(java.lang.String)']('irons_spellbooks:' + d[1]);
        if (!sp || String(sp.getSpellId()) !== 'irons_spellbooks:' + d[1]) { malos++; console.error('TEST hechizo inexistente: ' + d[1] + ' (' + nodo + ')'); }
        var c2 = SkillsAPI.getCategory(new ResourceLocation('puffish_skills:habilidades_' + d[0]));
        if (!c2.isPresent() || !c2.get().getSkill(nodo).isPresent()) { malos++; console.error('TEST nodo inexistente: ' + nodo); }
      });
      console.info('TEST hechizos del arbol: ' + n + ', problemas: ' + malos);
    } catch (e) { console.error('TEST FALLO: ' + e); }
    s.scheduleInTicks(20, () => s.runCommandSilent('stop'));
  });
});
