// Prueba de la colocacion de los maestros de oficio y de rol en los pueblos (servidor minimo con Easy NPC; la colocacion tarda unos minutos en un mundo nuevo).
ServerEvents.loaded((event) => {
  const s = event.server;
  var intentos = 0;
  s.scheduleInTicks(100, function sondear() {
    try {
      var ids = ['slytherion', 'ravencachalotes', 'huffleponyanos', 'tuliondor'];
      var listos = ids.filter((id) => s.persistentData.getInt('npcofi_' + id + '_v') >= 1 && s.persistentData.getInt('npcrol_' + id + '_v') >= 1);
      if (listos.length < ids.length && ++intentos < 150) { s.scheduleInTicks(100, sondear); return; }
      console.info('TEST pueblos con maestros de rol y de oficio: ' + listos.join(',') + ' (intentos ' + intentos + ')');
      var id = listos[0], pd = s.persistentData, x = pd.getInt('pueblo_' + id + '_x'), z = pd.getInt('pueblo_' + id + '_z');
      s.runCommandSilent('execute in minecraft:overworld run forceload add ' + (x + 40) + ' ' + (z + 40) + ' ' + (x + 90) + ' ' + (z + 90));
      s.scheduleInTicks(100, () => {
        try {
          var of = [], ro = [], it = s.overworld().getAllEntities().iterator();
          while (it.hasNext()) { var en = it.next(); if (en.tags.contains('pony0n_oficio_npc')) of.push(en); else if (en.tags.contains('pony0n_rol_npc')) ro.push(en); }
          console.info('TEST entidades: oficio=' + of.length + ' rol=' + ro.length);
          of.forEach((e) => console.info('TEST oficio ' + e.type + ' ' + String(e.nbt.getString('Profession')) + ' en +' + Math.round(e.x - x) + ',+' + Math.round(e.z - z) + ' nombre=' + e.customName.getString() + ' accion=' + e.nbt.getCompound('ActionData').toString().substring(0, 90)));
          ro.forEach((e) => console.info('TEST rol ' + e.type + ' en +' + Math.round(e.x - x) + ',+' + Math.round(e.z - z)));
        } catch (e) { console.error('TEST FALLO: ' + e); }
        s.runCommandSilent('stop');
      });
    } catch (e) { console.error('TEST FALLO sondeo: ' + e); s.runCommandSilent('stop'); }
  });
});
