// Prueba base (tools/test-kubejs.sh): jugador simulado con gremio/rol forzados; comprueba nombre, TAB, cabecera/pie y envios de chat.
// El FakePlayer no guarda stages, asi que gremioDe/rolDe se sustituyen. Anade aqui tus propias comprobaciones.
const txt = (c) => (c === null || c === undefined) ? '(null)' : String(c.getString());
ServerEvents.loaded((event) => {
  const s = event.server;
  s.scheduleInTicks(60, () => {
    var fp = null;
    try {
      var GPr = Java.loadClass('com.mojang.authlib.GameProfile'), UU = Java.loadClass('java.util.UUID');
      fp = Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory').get(s.overworld(), new GPr(UU.randomUUID(), 'Tester'));
      var g = 'slytherion', r = 'healer';
      global.gremioDe = function (pl) { return g; };
      global.rolDe = function (pl) { return r; };
      global.refrescarGremio(fp);
      console.info('TEST display=' + txt(fp.getDisplayName()) + ' | tab=' + txt(fp.getTabListDisplayName()));
      console.info('TEST cabecera=' + txt(fp.getTabListHeader()) + ' | pie=' + txt(fp.getTabListFooter()).replace('\n', ' // '));
      global.chatGremio.enviarAGremio(fp, 'hola gremio');
      global.chatGremio.enviarGlobal(fp, 'hola global');
    } catch (e) { console.error('TEST FALLO: ' + e); }
    s.scheduleInTicks(20, () => s.runCommandSilent('stop'));
  });
});
