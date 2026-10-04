// Habilidades por clase: cada clase tiene su propia categoria de Pufferfish's Skills ("habilidades_<clase>", con su nivel y sus puntos) y cada
// jugador solo ve la de su clase (las demas estan bloqueadas). Aqui:
//  - se desbloquea la categoria de la clase al entrar y cada 5 s (la clase la da Origins con el stage origen_<clase>);
//  - /skillxp <jugador> <xp> (operador) da XP de habilidades a la categoria de la clase del jugador: es lo que usan las misiones de FTB Quests
//    (antes iba a la categoria unica "habilidades"). Si el jugador aun no tiene clase, la XP queda pendiente y se aplica al elegirla.
// OJO (Rhino de este pack): `const`/`let` DENTRO de un try da "redeclaration of var"; dentro de try se usa `var`.

const CLASES_HAB = ['guerrero', 'arquero', 'mago', 'asesino', 'ingeniero'];

function claseHab(p) {
  for (var i = 0; i < CLASES_HAB.length; i++) if (p.stages.has('origen_' + CLASES_HAB[i])) return CLASES_HAB[i];
  return null;
}

/** desbloquea la categoria de la clase (una sola vez) y aplica la XP que estuviera pendiente */
function desbloquearHabilidades(p) {
  var c = claseHab(p);
  if (!c) return null;
  if (String(p.persistentData.getString('habUnlock')) !== c) {
    p.server.runCommandSilent('puffish_skills category unlock ' + p.username + ' habilidades_' + c);
    p.persistentData.putString('habUnlock', c);
    var pendiente = p.persistentData.getInt('xpPendiente');
    if (pendiente > 0) {
      p.server.runCommandSilent('puffish_skills experience add ' + p.username + ' habilidades_' + c + ' ' + pendiente);
      p.persistentData.putInt('xpPendiente', 0);
    }
  }
  return c;
}
global.desbloquearHabilidades = desbloquearHabilidades;

PlayerEvents.loggedIn((event) => desbloquearHabilidades(event.player));
PlayerEvents.tick((event) => {
  const p = event.player;
  if (p.age % 100 === 13) desbloquearHabilidades(p);
});

ServerEvents.commandRegistry((event) => {
  const Commands = event.commands;
  const Arguments = event.arguments;
  event.register(Commands.literal('skillxp').requires((src) => src.hasPermission(2))
    .then(Commands.argument('jugador', Arguments.PLAYER.create(event))
      .then(Commands.argument('xp', Arguments.INTEGER.create(event))
        .executes((ctx) => {
          const p = Arguments.PLAYER.getResult(ctx, 'jugador'), xp = Arguments.INTEGER.getResult(ctx, 'xp');
          const c = desbloquearHabilidades(p);
          if (!c) {   // sin clase todavia: se guarda y se aplica al elegirla
            p.persistentData.putInt('xpPendiente', p.persistentData.getInt('xpPendiente') + xp);
            return 1;
          }
          p.server.runCommandSilent('puffish_skills experience add ' + p.username + ' habilidades_' + c + ' ' + xp);
          return 1;
        }))));
});
