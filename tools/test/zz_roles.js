// Prueba del dialogo de los maestros de rol y de las recompensas (jugador simulado; los mensajes salen en el log como [eco Tester] ...).
ServerEvents.loaded((event) => {
  const s = event.server;
  s.scheduleInTicks(60, () => {
    try {
      // evita la colocacion pesada de pueblos/maestros del arranque (no es lo que se prueba aqui)
      ['slytherion', 'ravencachalotes', 'huffleponyanos', 'tuliondor', 'bazar'].forEach((id) => { s.persistentData.putInt('pueblo_' + id + '_v', 99); s.persistentData.putInt('npcrol_' + id + '_v', 99); });
      global.TEST_ECO = true;
      var GPr = Java.loadClass('com.mojang.authlib.GameProfile'), UU = Java.loadClass('java.util.UUID');
      var fp = Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory').get(s.overworld(), new GPr(UU.randomUUID(), 'Tester'));
      var rolActual = null;
      global.rolDe = function (pl) { return rolActual; };
      global.gremioDe = function (pl) { return 'slytherion'; };
      var R = global.rolSistema;
      console.info('TEST --- sin clase: hablar tanque');
      global.TEST_CLASE = false; R.hablar(fp, 'tanque');
      console.info('TEST --- asesino: hablar healer (debe rechazar)');
      global.TEST_CLASE = 'asesino'; R.hablar(fp, 'healer');
      console.info('TEST --- asesino: hablar dps (propone)');
      R.hablar(fp, 'dps');
      console.info('TEST --- mago: confirmar healer SIN haber hablado (debe rechazar)');
      global.TEST_CLASE = 'mago'; fp.persistentData.remove('rolPropuesto'); R.confirmar(fp, 'healer');
      console.info('TEST --- mago: hablar tanque (rechaza) y healer (propone), confirmar healer');
      R.hablar(fp, 'tanque'); R.hablar(fp, 'healer');
      console.info('TEST propuesto=' + fp.persistentData.getString('rolPropuesto'));
      var r = R.confirmar(fp, 'healer');
      console.info('TEST confirmar devolvio ' + r + ' | propuesto despues=' + fp.persistentData.getString('rolPropuesto'));
      rolActual = 'healer';
      console.info('TEST --- mago con rol healer: hablar dps (ya elegido)');
      R.hablar(fp, 'dps');
      console.info('TEST --- recompensa guerrero/tanque nivel 0 y 1 (objetos vanilla + Spartan que no existen en este servidor de prueba)');
      global.TEST_CLASE = 'guerrero';
      R.darRecompensa(fp, 'tanque', 0);
      var inv = []; fp.inventory.allItems.forEach((st) => { if (!st.isEmpty()) inv.push(st.count + 'x ' + st.id); });
      console.info('TEST inventario=' + inv.join(', '));
      R.darRecompensa(fp, 'tanque', 1);
    } catch (e) { console.error('TEST FALLO: ' + e); }
    s.scheduleInTicks(20, () => s.runCommandSilent('stop'));
  });
});
