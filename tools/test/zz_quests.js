// Prueba de visibilidad de los capitulos de rol con el FTB Quests real: un equipo sin rol no debe ver el capitulo; con la tarea "stage" cumplida, si.
ServerEvents.loaded((event) => {
  const s = event.server;
  s.scheduleInTicks(80, () => {
    try {
      var QF = Java.loadClass('dev.ftb.mods.ftbquests.quest.ServerQuestFile').INSTANCE;
      var UU = Java.loadClass('java.util.UUID');
      var td = QF.getOrCreateTeamData(UU.randomUUID());
      var caps = QF.getAllChapters();
      console.info('TEST capitulos cargados: ' + caps.size());
      var estado = (tag) => {
        var out = [];
        caps.forEach((ch) => { var f = String(ch.getFilename()); if (f.indexOf('rol_') === 0) out.push(f + '=' + ch.isVisible(td)); });
        console.info('TEST ' + tag + ' -> ' + out.join(' '));
      };
      estado('sin rol');
      var dps = null; caps.forEach((ch) => { if (String(ch.getFilename()) === 'rol_dps') dps = ch; });
      var juramento = dps.getQuests().get(0), n1 = dps.getQuests().get(1);
      console.info('TEST dps: juramento visible=' + juramento.isVisible(td) + ' n1 visible=' + n1.isVisible(td) + ' tareas=' + juramento.getTasks().size() + ' tipo=' + juramento.getTasks().get(0).getType().getTypeId());
      td.setCompleted(juramento.id, new (Java.loadClass('java.util.Date'))());   // como si el jugador hubiera cumplido el juramento (stage rol_dps)
      console.info('TEST tras cumplir la tarea: juramento completo=' + td.isCompleted(juramento));
      estado('con rol dps (solo dps debe verse)');
      console.info('TEST dps: juramento visible=' + juramento.isVisible(td) + ' n1 visible=' + n1.isVisible(td) + ' n1 puede empezar=' + td.canStartTasks(n1));
    } catch (e) { console.error('TEST FALLO: ' + e); }
    s.scheduleInTicks(20, () => s.runCommandSilent('stop'));
  });
});
