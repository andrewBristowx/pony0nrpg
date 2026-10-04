// Prueba de "hechizos solo por progresion" (necesita Iron's Spells en el servidor de prueba): recompensas que enseñan y dan pergamino, bloqueo al lanzar
// un hechizo no aprendido, receta de la forja de pergaminos quitada y modificadores de botin anulados (tools/test-hechizos.sh).
ServerEvents.loaded((event) => {
  const s = event.server;
  s.scheduleInTicks(60, () => {
    try {
      ['slytherion', 'ravencachalotes', 'huffleponyanos', 'tuliondor', 'bazar'].forEach((id) => { s.persistentData.putInt('pueblo_' + id + '_v', 99); s.persistentData.putInt('npcrol_' + id + '_v', 99); });
      global.TEST_ECO = true;
      var GPr = Java.loadClass('com.mojang.authlib.GameProfile'), UU = Java.loadClass('java.util.UUID');
      var fp = Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory').get(s.overworld(), new GPr(UU.randomUUID(), 'Tester'));
      var R = global.rolSistema;

      // 1) recompensas: aprenden y entregan pergamino (aprendido = conjunto propio porque los stages de un FakePlayer no persisten)
      var aprendidos = {};
      var Registro = Java.loadClass('io.redspace.ironsspellbooks.api.registry.SpellRegistry');
      var tabla = global.HECHIZOS_ROL, malos = 0, total = 0;
      Object.keys(tabla).forEach((rol) => Object.keys(tabla[rol]).forEach((clase) => tabla[rol][clase].forEach((nivel, n) => nivel.forEach((e) => {
        var id = Array.isArray(e) ? e[0] : e, lvl = Array.isArray(e) ? e[1] : 1; total++;
        var sp = Registro['getSpell(java.lang.String)']('irons_spellbooks:' + id);
        if (!sp || String(sp.getSpellId()) !== 'irons_spellbooks:' + id) { malos++; console.error('TEST hechizo inexistente: ' + id); return; }
      }))));
      console.info('TEST hechizos de la tabla: ' + total + ', problemas: ' + malos);
      global.rolDe = function () { return 'healer'; };
      global.TEST_CLASE = 'mago';
      R.darRecompensa(fp, 'healer', 0);
      var inv = []; fp.inventory.allItems.forEach((st) => { if (!st.isEmpty()) inv.push(st.count + 'x ' + st.id + (st.id === 'irons_spellbooks:scroll' ? ' ' + st.nbt : '')); });
      console.info('TEST inventario healer/mago nivel 0: ' + inv.join(' | '));
      console.info('TEST stage hech_heal tras aprender (puede ser false en FakePlayer): ' + fp.stages.has('hech_heal'));

      // 2) bloqueo al lanzar: SpellPreCastEvent publicado en el bus de Forge
      var Evento = Java.loadClass('io.redspace.ironsspellbooks.api.events.SpellPreCastEvent');
      var Fuente = Java.loadClass('io.redspace.ironsspellbooks.api.spells.CastSource');
      var Bus = Java.loadClass('net.minecraftforge.common.MinecraftForge').EVENT_BUS;
      var lanzar = (id, fuente) => { var ev = new Evento(fp, 'irons_spellbooks:' + id, 1, null, Fuente.valueOf(fuente)); Bus.post(ev); return ev.isCanceled(); };
      var real = global.hechizoAprendido;
      global.hechizoAprendido = (pl, id) => !!aprendidos[id];
      console.info('TEST sin aprender: fireball SPELLBOOK cancelado=' + lanzar('fireball', 'SPELLBOOK') + ' (esperado true)');
      console.info('TEST sin aprender: fireball SCROLL cancelado=' + lanzar('fireball', 'SCROLL') + ' (esperado true)');
      console.info('TEST sin aprender: fireball COMMAND cancelado=' + lanzar('fireball', 'COMMAND') + ' (esperado false)');
      aprendidos.fireball = true;
      console.info('TEST aprendido: fireball SPELLBOOK cancelado=' + lanzar('fireball', 'SPELLBOOK') + ' (esperado false)');
      global.hechizoAprendido = real;

      // 3) receta de la forja
      var rm = s.recipeManager;
      console.info('TEST receta scroll_forge presente=' + rm.byKey(new ResourceLocation('irons_spellbooks:scroll_forge')).isPresent() + ' (esperado false)');

      // 4) botin: cofres con GLM de Iron's (biblioteca de fortaleza, bastion, ciudad antigua...)
      var LootParams = Java.loadClass('net.minecraft.world.level.storage.loot.LootParams$Builder');
      var Par = Java.loadClass('net.minecraft.world.level.storage.loot.parameters.LootContextParams');
      var Sets = Java.loadClass('net.minecraft.world.level.storage.loot.parameters.LootContextParamSets');
      var Vec3 = Java.loadClass('net.minecraft.world.phys.Vec3');
      var ltc = Java.loadClass('net.minecraft.world.level.storage.loot.LootTable');
      ['minecraft:chests/stronghold_library', 'minecraft:chests/bastion_treasure', 'minecraft:chests/ancient_city', 'minecraft:chests/simple_dungeon', 'minecraft:chests/end_city_treasure'].forEach((tabla) => {
        var n = 0, scrolls = 0;
        var lt = s.getLootData().getLootTable(new ResourceLocation(tabla));
        for (var i = 0; i < 300; i++) {
          var params = new LootParams(s.overworld()).withParameter(Par.ORIGIN, Vec3.ZERO).create(Sets.CHEST);
          lt.getRandomItems(params).forEach((st) => { n++; if (String(st.id).indexOf('irons_spellbooks') >= 0) scrolls++; });
        }
        console.info('TEST botin ' + tabla + ': ' + n + ' objetos en 300 cofres, de Iron\'s: ' + scrolls);
      });
    } catch (e) { console.error('TEST FALLO: ' + e); }
    s.scheduleInTicks(20, () => s.runCommandSilent('stop'));
  });
});
