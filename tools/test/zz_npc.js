// Prueba de los maestros de rol: invoca los 4 con el NBT de gremio_roles.js y comprueba que Easy NPC los acepta (skin, nombre, accion de clic).
ServerEvents.loaded((event) => {
  const s = event.server;
  s.scheduleInTicks(80, () => {
    try {
      global.ROL_IDS.forEach((rol, i) => {
        var cmd = 'execute in minecraft:overworld run summon ' + global.NPC_ROL_ENTIDAD(rol) + ' ' + (4 * i) + ' 120 0 ' + global.npcRolSnbt(rol);
        var r = s.runCommandSilent(cmd);
        console.info('TEST summon ' + rol + ' -> resultado ' + r);
      });
    } catch (e) { console.error('TEST FALLO summon: ' + e); }
    s.scheduleInTicks(40, () => {
      try {
        var n = 0;
        s.overworld().getEntities().forEach((e) => {
          if (!e.tags.contains('pony0n_rol_npc')) return;
          n++;
          var nbt = String(e.nbt);
          if (e.tags.contains('pony0n_rol_tanque')) console.info('TEST NBT_TANQUE ' + nbt);
          console.info('TEST npc tipo=' + e.type + ' nombre=' + e.customName.getString() + ' tags=' + e.tags
            + ' skin=' + (nbt.match(/SkinData:\{[^}]*\}/) || ['?'])[0]
            + ' accion=' + (nbt.match(/Cmd:"[^"]*"/) || ['(sin Cmd)'])[0]
            + ' invulnerable=' + (nbt.indexOf('Invulnerable:1b') >= 0));
        });
        console.info('TEST maestros encontrados: ' + n);
      } catch (e) { console.error('TEST FALLO lectura: ' + e); }
      s.scheduleInTicks(20, () => s.runCommandSilent('stop'));
    });
  });
});
