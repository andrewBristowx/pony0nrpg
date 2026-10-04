// Prueba del equipo de rol con atributos (gremio_equipo.js) y de las recompensas de los niveles 1..16 (necesita Iron's Spells y Apothic Attributes).
ServerEvents.loaded((event) => {
  const s = event.server;
  s.scheduleInTicks(60, () => {
    try {
      ['slytherion', 'ravencachalotes', 'huffleponyanos', 'tuliondor', 'bazar'].forEach((id) => { s.persistentData.putInt('pueblo_' + id + '_v', 99); s.persistentData.putInt('npcrol_' + id + '_v', 99); });
      var GPr = Java.loadClass('com.mojang.authlib.GameProfile'), UU = Java.loadClass('java.util.UUID');
      var fp = Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory').get(s.overworld(), new GPr(UU.randomUUID(), 'Tester'));
      var R = global.rolSistema, Slot = Java.loadClass('net.minecraft.world.entity.EquipmentSlot');
      var combos = Object.keys(global.EQUIPO_DEF), malos = 0, total = 0;
      combos.forEach((k) => {
        var rol = k.split('/')[0], clase = k.split('/')[1];
        global.TEST_CLASE = clase; global.rolDe = function () { return rol; };
        for (var n = 0; n <= 16; n++) {
          var t0 = Date.now();
          var piezas = global.equipoDeNivel(rol, clase, n);
          var t1 = Date.now();
          fp.inventory.clearContent(); R.darRecompensa(fp, rol, n);
          if (n === 16) { var inv = []; fp.inventory.allItems.forEach((it) => { if (!it.isEmpty()) inv.push(it.count + 'x ' + it.id); }); console.info('TEST inventario nivel 16 ' + k + ': ' + inv.join(', ')); }
          piezas.forEach((st) => {
            total++;
            var slot = { head: Slot.HEAD, chest: Slot.CHEST, legs: Slot.LEGS, feet: Slot.FEET, weapon: Slot.MAINHAND }[String(st.nbt.getCompound('RolEquipo').getString('pieza'))];
            var mods = st.getAttributeModifiers(slot), lista = [];
            mods.entries().forEach((e) => lista.push(String(e.key.descriptionId || e.key).replace('attribute.name.', '') + '=' + Number(e.value.amount).toFixed(3)));
            if (!lista.length || String(st.id) === 'minecraft:air') { malos++; console.error('TEST equipo sin atributos: ' + k + ' nivel ' + n + ' ' + st.id); }
            if (n === 1 || n === 6 || n === 12 || n === 16) console.info('TEST ' + k + ' L' + n + ' ' + st.hoverName.string + ' [' + st.id + '] ' + lista.join(', '));
          });
        }
      });
      console.info('TEST piezas creadas: ' + total + ', problemas: ' + malos);
    } catch (e) { console.error('TEST FALLO: ' + e); }
    s.scheduleInTicks(20, () => s.runCommandSilent('stop'));
  });
});
