// Gremios, regiones y modo guerra (docs/07-gremios-regiones-guerra.md).
//  - 4 gremios = 4 cuadrantes del mapa alrededor de (0, 0), más una zona neutral central.
//  - Elegir gremio (capa de Origins pony0n:gremio) ejecuta /gremio unir: stage, equipo de FTB Teams, región y reaparición.
//  - En paz nadie sale de su región (salvo operadores); en guerra se quitan los límites y se permite PvP entre gremios.
//  - PvP: nunca dentro del mismo gremio; en el Overworld solo en guerra; en las demás dimensiones siempre entre gremios distintos.
// Comandos (operador):  /guerra on | off | estado     /gremio unir <gremio> <jugador>

const GREMIOS = {
  slytherion:      { nombre: 'Slytheri0n',      sx: -1, sz: -1 },   // noroeste
  ravencachalotes: { nombre: 'RavenCachalotes', sx:  1, sz: -1 },   // noreste
  huffleponyanos:  { nombre: 'Huffleponyanos',  sx: -1, sz:  1 },   // suroeste
  tuliondor:       { nombre: 'Tuliondor',       sx:  1, sz:  1 },   // sureste
};
const BORDE = 6000;      // lado del mundo (borde de vanilla, centrado en 0,0)
const NEUTRAL = 150;     // zona neutral central: |x| <= 150 y |z| <= 150
const PUEBLO = 1500;     // el pueblo inicial de cada región está en (±1500, ±1500)

function guildOf(player) {
  for (var id in GREMIOS) if (player.stages.has('gremio_' + id)) return id;
  return null;
}
function isWar(server) { return server.persistentData.getBoolean('guerra'); }
function inOverworld(entity) { return String(entity.level.dimension).indexOf('minecraft:overworld') >= 0; }

// ---- equipo de FTB Teams por gremio ---------------------------------------------------------------------------
function joinGuildTeam(server, player, id) {
  try {
    const UUID = Java.loadClass('java.util.UUID');
    const api = Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI').api();
    if (!api.isManagerLoaded()) return false;
    const mgr = api.getManager();
    const key = 'equipo_' + id;

    var team = null;
    if (server.persistentData.contains(key)) {
      const opt = mgr.getTeamByID(UUID.fromString(server.persistentData.getString(key)));
      if (opt.isPresent()) team = opt.get();
    }
    const mine = mgr.getTeamForPlayer(player);
    const current = mine.isPresent() ? mine.get() : null;
    if (team != null && current != null && String(current.getId()) === String(team.getId())) return true;

    // si ya estaba en otro equipo "de grupo", sale primero (un jugador solo puede estar en uno)
    if (current != null && current.isPartyTeam()) current.leave(player.getUUID());

    if (team == null) {
      team = mgr.createPartyTeam(player, GREMIOS[id].nombre, 'Gremio ' + GREMIOS[id].nombre, null);
      server.persistentData.putString(key, String(team.getId()));
    } else {
      team.join(player);
    }
    return true;
  } catch (e) {
    console.error('[gremios] no se pudo meter a ' + player.username + ' en el equipo de ' + id + ': ' + e);
    return false;
  }
}

// ---- comandos -------------------------------------------------------------------------------------------------
ServerEvents.commandRegistry((event) => {
  const Commands = event.commands;
  const Arguments = event.arguments;

  const setWar = (server, on) => {
    server.persistentData.putBoolean('guerra', on);
    server.tell(on
      ? Text.red('¡GUERRA! Los límites entre regiones se han abierto y el PvP entre gremios está activo.')
      : Text.green('La guerra ha terminado. Cada gremio vuelve a su región.'));
  };

  event.register(Commands.literal('guerra')
    .requires((src) => src.hasPermission(2))
    .then(Commands.literal('on').executes((ctx) => { setWar(ctx.source.server, true); return 1; }))
    .then(Commands.literal('off').executes((ctx) => { setWar(ctx.source.server, false); return 1; }))
    .then(Commands.literal('estado').executes((ctx) => {
      ctx.source.sendSuccess(() => Text.of('Guerra: ' + (isWar(ctx.source.server) ? 'ACTIVA' : 'desactivada')), false);
      return 1;
    })));

  event.register(Commands.literal('gremio')
    .requires((src) => src.hasPermission(2))
    .then(Commands.literal('unir')
      .then(Commands.argument('gremio', Arguments.STRING.create(event))
        .then(Commands.argument('jugador', Arguments.PLAYER.create(event))
          .executes((ctx) => {
            const id = String(Arguments.STRING.getResult(ctx, 'gremio')).toLowerCase();
            const player = Arguments.PLAYER.getResult(ctx, 'jugador');
            const g = GREMIOS[id];
            if (!g) { ctx.source.sendFailure(Text.of('Gremio desconocido: ' + id)); return 0; }
            const server = ctx.source.server;

            // un solo gremio por jugador
            for (var other in GREMIOS) if (other !== id) player.stages.remove('gremio_' + other);
            player.stages.add('gremio_' + id);

            const inTeam = joinGuildTeam(server, player, id);

            // llevar al pueblo de su región y fijar allí su reaparición
            const tx = g.sx * PUEBLO, tz = g.sz * PUEBLO;
            const n = player.username;
            server.runCommandSilent('execute as ' + n + ' in minecraft:overworld run spreadplayers ' + tx + ' ' + tz + ' 0 20 false @s');
            server.runCommandSilent('execute as ' + n + ' at ' + n + ' run spawnpoint @s ~ ~ ~');

            player.tell(Text.gold('Ahora perteneces al gremio ' + g.nombre + '.'));
            if (!inTeam) player.tell(Text.yellow('No se pudo unirte a su equipo automáticamente; avisa a un administrador.'));
            return 1;
          })))));
});

// ---- mundo: borde y límites entre regiones ---------------------------------------------------------------------
ServerEvents.loaded((event) => {
  const s = event.server;
  if (!s.persistentData.getBoolean('regiones_init')) {
    s.runCommandSilent('worldborder center 0 0');
    s.runCommandSilent('worldborder set ' + BORDE);
    s.persistentData.putBoolean('regiones_init', true);
    console.info('[gremios] borde del mundo fijado en ' + BORDE + ' x ' + BORDE);
  }
});

PlayerEvents.tick((event) => {
  const p = event.player;
  if (p.age % 40 !== 0) return;                    // cada 2 s
  if ((p.op === true) || (p.hasPermissions && p.hasPermissions(2)) || !inOverworld(p)) return;    // los operadores se mueven libres; solo se limita el Overworld
  if (isWar(p.server)) return;
  const id = guildOf(p);
  if (!id) return;
  const g = GREMIOS[id];
  const x = p.x, z = p.z;
  if (Math.abs(x) <= NEUTRAL && Math.abs(z) <= NEUTRAL) return;   // zona neutral
  const sx = x < 0 ? -1 : 1, sz = z < 0 ? -1 : 1;
  if (sx === g.sx && sz === g.sz) return;          // su región

  // devolverlo al borde de su propia región (a 5 bloques de la línea)
  const tx = sx === g.sx ? x : g.sx * 5;
  const tz = sz === g.sz ? z : g.sz * 5;
  p.server.runCommandSilent('execute as ' + p.username + ' in minecraft:overworld run spreadplayers ' + Math.round(tx) + ' ' + Math.round(tz) + ' 0 3 false @s');
  p.setStatusMessage(Text.red('Territorio de otro gremio: no puedes entrar en tiempos de paz.'));
});

// ---- PvP -------------------------------------------------------------------------------------------------------
EntityEvents.hurt((event) => {
  const victim = event.entity;
  if (!victim || !victim.isPlayer()) return;
  const attacker = event.source.player;            // null si no lo causa un jugador
  if (!attacker || attacker === victim) return;

  const a = guildOf(attacker), v = guildOf(victim);
  if (a && a === v) { event.cancel(); return; }    // mismo gremio: sin fuego amigo
  if (inOverworld(victim) && !isWar(victim.server)) {
    attacker.setStatusMessage(Text.red('El PvP solo está permitido en tiempos de guerra.'));
    event.cancel();
  }
});
