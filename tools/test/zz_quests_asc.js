// Prueba de visibilidad de los capitulos de Ascension con el FTB Quests real: sin clase no se ve ninguno; con la clase, solo el suyo.
ServerEvents.loaded((event) => {
  const s = event.server;
  s.scheduleInTicks(400, () => s.runCommandSilent('stop'));   // por si algo falla antes
  s.scheduleInTicks(80, () => {
    try {
      var QF = Java.loadClass('dev.ftb.mods.ftbquests.quest.ServerQuestFile').INSTANCE;
      var UU = Java.loadClass('java.util.UUID');
      var td = QF.getOrCreateTeamData(UU.randomUUID());
      var caps = QF.getAllChapters();
      var estado = (tag) => {
        var out = [];
        caps.forEach((ch) => { var f = String(ch.getFilename()); if (f.indexOf('ascension_') === 0) out.push(f.replace('ascension_', '') + '=' + ch.isVisible(td)); });
        console.info('TEST ' + tag + ' -> ' + out.join(' '));
      };
      estado('sin clase');
      var ch = null; caps.forEach((c) => { if (String(c.getFilename()) === 'ascension_guerrero') ch = c; });
      var clase = ch.getQuests().get(0);
      console.info('TEST primera mision: tareas=' + clase.getTasks().size() + ' tipo=' + clase.getTasks().get(0).getType().getTypeId());
      td.setCompleted(clase.id, new (Java.loadClass('java.util.Date'))());
      estado('con la clase guerrero (solo guerrero debe verse)');
    } catch (e) { console.error('TEST FALLO: ' + e); }
  });
});
