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
    const JavaUUID = Java.loadClass('java.util.UUID');
    const api = Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI').api();
    if (!api.isManagerLoaded()) return false;
    const mgr = api.getManager();
    const key = 'equipo_' + id;

    var team = null;
    if (server.persistentData.contains(key)) {
      const opt = mgr.getTeamByID(JavaUUID.fromString(server.persistentData.getString(key)));
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

// ---- pueblos iniciales --------------------------------------------------------------------------------------------
// Las plantillas (kubejs/data/pony0n/structures/pueblo_<gremio>.nbt) las genera tools/village/gen-village.mjs.
// Miden 129 x 34 x 129 y su suelo está en y=3 de la plantilla (debajo hay 3 capas de tierra).
// El sitio se elige dentro de la región del gremio, cerca de (±PUEBLO, ±PUEBLO), buscando el terreno más llano y sin agua.
const PUEBLO_LADO = 129, PUEBLO_MITAD = 64, PUEBLO_SUELO = 3, PUEBLO_VERSION = 3;
const PUEBLO_SPAWN = [64, 70];           // desplazamiento dentro de la plantilla donde aparece el jugador (plaza, al sur del pozo)

/** origen (esquina noroeste) del pueblo colocado; si hay uno antiguo (65x65, sin datos guardados) devuelve el que tenía */
function puebloOrigen(server, id) {
  const pd = server.persistentData;
  if (pd.contains('pueblo_' + id + '_x')) return { x: pd.getInt('pueblo_' + id + '_x'), z: pd.getInt('pueblo_' + id + '_z'), lado: pd.getInt('pueblo_' + id + '_lado') };
  const g = GREMIOS[id];
  return { x: g.sx * PUEBLO - 32, z: g.sz * PUEBLO - 32, lado: 65 };
}

function puebloColocado(server, id) { return server.persistentData.getInt('pueblo_' + id + '_v') >= PUEBLO_VERSION; }

/** /fill por tramos (el límite de /fill es 32768 bloques por orden) */
function rellenar(run, x1, z1, x2, z2, y1, y2, bloque, reemplazo) {
  const alto = Math.max(1, Math.floor(32000 / ((x2 - x1 + 1) * (z2 - z1 + 1))));
  for (var y = y1; y <= y2; y += alto)
    run('fill ' + x1 + ' ' + y + ' ' + z1 + ' ' + x2 + ' ' + Math.min(y + alto - 1, y2) + ' ' + z2 + ' ' + bloque + (reemplazo ? ' replace ' + reemplazo : ''));
}

/** altura natural del terreno en (x,z) sin generar el chunk: [superficie (con agua), fondo] */
function alturasNaturales(level, x, z) {
  const Heightmap = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap');
  const gen = level.getChunkSource().getGenerator(), rs = level.getChunkSource().randomState();
  return [gen.getBaseHeight(x, z, Heightmap.Types.WORLD_SURFACE_WG, level, rs), gen.getBaseHeight(x, z, Heightmap.Types.OCEAN_FLOOR_WG, level, rs)];
}

/** puntúa un sitio (menor = mejor): desnivel + agua. Muestrea una cuadrícula de n x n con separación paso */
function puntuarSitio(level, cx, cz, n, paso) {
  var min = 999, max = -999, agua = 0, mitad = (n - 1) / 2;
  for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
    var h = alturasNaturales(level, cx + (i - mitad) * paso, cz + (j - mitad) * paso);
    if (h[0] - h[1] >= 2 || h[0] <= 62) agua++;            // agua encima del fondo, o terreno bajo el nivel del mar
    if (h[0] < min) min = h[0];
    if (h[0] > max) max = h[0];
  }
  return { puntos: (max - min) + agua * 8, rango: max - min, agua: agua };
}

/** busca en TODA la región del gremio el sitio más llano y seco para un pueblo de PUEBLO_LADO (con rampa); prefiere los cercanos a (±PUEBLO, ±PUEBLO) */
function elegirSitio(level, id) {
  const g = GREMIOS[id];
  var mejor = null;
  function probar(cx, cz, n, paso) {
    var p = puntuarSitio(level, cx, cz, n, paso);
    var total = p.puntos + (Math.abs(Math.abs(cx) - PUEBLO) + Math.abs(Math.abs(cz) - PUEBLO)) * 0.004;
    if (mejor === null || total < mejor.total) mejor = { cx: cx, cz: cz, total: total, rango: p.rango, agua: p.agua };
  }
  // búsqueda gruesa por toda la región (|x|,|z| entre 260 y 2800: fuera de la zona neutral y del borde)
  for (var ax = 260; ax <= 2800; ax += 100) for (var az = 260; az <= 2800; az += 100) probar(g.sx * ax, g.sz * az, 3, 56);
  // refinado alrededor del mejor
  const c0 = { x: mejor.cx, z: mejor.cz };
  for (var dx = -72; dx <= 72; dx += 24) for (var dz = -72; dz <= 72; dz += 24) {
    var nx = c0.x + dx, nz = c0.z + dz;
    if (Math.abs(nx) >= 260 && Math.abs(nx) <= 2800 && Math.abs(nz) >= 260 && Math.abs(nz) <= 2800) probar(nx, nz, 5, 32);
  }
  return mejor;
}

/** quita un pueblo ya colocado (solo lo construido sobre el suelo) para poder volver a colocarlo */
function limpiarPueblo(server, id, run) {
  const pd = server.persistentData;
  if (!pd.contains('pueblo_' + id + '_y')) return;
  const o = puebloOrigen(server, id), ref = pd.getInt('pueblo_' + id + '_y');
  rellenar(run, o.x - 1, o.z - 1, o.x + o.lado, o.z + o.lado, ref + 1, ref + 34, 'minecraft:air');
}

/** suaviza el terreno alrededor del pueblo: una rampa de 16 bloques que pasa de la altura del pueblo a la del terreno natural */
function suavizarBordes(level, x1, z1, x2, z2, ref) {
  const Heightmap = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap');
  const BlockPos = Java.loadClass('net.minecraft.core.BlockPos');
  const Blocks = Java.loadClass('net.minecraft.world.level.block.Blocks');
  const aire = Blocks.AIR.defaultBlockState(), tierra = Blocks.DIRT.defaultBlockState(), cesped = Blocks.GRASS_BLOCK.defaultBlockState();
  const ANCHO = 16;
  for (var x = x1 - ANCHO; x <= x2 + ANCHO; x++) {
    for (var z = z1 - ANCHO; z <= z2 + ANCHO; z++) {
      var d = Math.max(x1 - x, x - x2, z1 - z, z - z2);
      if (d < 1) continue;                                  // dentro del pueblo: ya está hecho
      var natural = level.getHeight(Heightmap.Types.MOTION_BLOCKING_NO_LEAVES, x, z) - 1;
      var t = d / (ANCHO + 1), s = t * t * (3 - 2 * t);
      var objetivo = Math.round(ref + (natural - ref) * s);
      for (var y = objetivo + 1; y <= Math.max(natural, objetivo) + 24; y++) {   // quita relieve, troncos y hojas de encima
        var pos = new BlockPos(x, y, z);
        if (!level.getBlockState(pos).isAir()) level.setBlock(pos, aire, 2);
      }
      for (var y2 = natural + 1; y2 < objetivo; y2++) level.setBlock(new BlockPos(x, y2, z), tierra, 2);   // rellena si el terreno está más bajo
      if (objetivo !== natural) level.setBlock(new BlockPos(x, objetivo, z), cesped, 2);
    }
  }
}

function colocarPueblo(server, id) {
  const Heightmap = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap');
  const level = server.overworld();
  const run = (c) => server.runCommandSilent('execute in minecraft:overworld run ' + c);
  limpiarPueblo(server, id, run);
  const s = elegirSitio(level, id);
  const ox = s.cx - PUEBLO_MITAD, oz = s.cz - PUEBLO_MITAD;
  // cargar (y generar si hace falta) los chunks de la zona + margen
  for (var cx = (ox - 20) >> 4; cx <= (ox + PUEBLO_LADO + 20) >> 4; cx++)
    for (var cz = (oz - 20) >> 4; cz <= (oz + PUEBLO_LADO + 20) >> 4; cz++) level.getChunk(cx, cz);
  // el suelo del pueblo queda a la altura media del terreno (en el mar, a nivel del agua)
  var suma = 0, n = 0;
  for (var i = 0; i < 5; i++) for (var j = 0; j < 5; j++) {
    suma += level.getHeight(Heightmap.Types.MOTION_BLOCKING_NO_LEAVES, ox + 10 + i * 27, oz + 10 + j * 27); n++;
  }
  const ref = Math.max(Math.round(suma / n) - 1, 63);
  const x1 = ox - 1, x2 = ox + PUEBLO_LADO, z1 = oz - 1, z2 = oz + PUEBLO_LADO;
  // 1) despejar árboles y relieve sobre el suelo del pueblo
  rellenar(run, x1, z1, x2, z2, ref + 1, ref + 34, 'minecraft:air');
  // 2) rellenar huecos y agua por debajo para que el pueblo no quede colgando
  ['minecraft:air', 'minecraft:water', 'minecraft:lava'].forEach(function (blk) {
    rellenar(run, x1, z1, x2, z2, ref - 25, ref - 4, 'minecraft:dirt', blk);
  });
  // 3) colocar la plantilla (su suelo queda en y=ref)
  run('place template pony0n:pueblo_' + id + ' ' + ox + ' ' + (ref - PUEBLO_SUELO) + ' ' + oz);
  suavizarBordes(level, x1, z1, x2, z2, ref);
  const pd = server.persistentData;
  pd.putInt('pueblo_' + id + '_x', ox); pd.putInt('pueblo_' + id + '_z', oz); pd.putInt('pueblo_' + id + '_y', ref);
  pd.putInt('pueblo_' + id + '_lado', PUEBLO_LADO); pd.putInt('pueblo_' + id + '_v', PUEBLO_VERSION);
  console.info('[gremios] pueblo de ' + id + ' colocado en ' + ox + ',' + (ref - PUEBLO_SUELO) + ',' + oz + ' (desnivel ' + s.rango + ', columnas con agua ' + s.agua + ')');
  return ref;
}

/** posición de aparición dentro del pueblo de un gremio, o null si aún no se colocó */
function puebloSpawn(server, id) {
  if (!puebloColocado(server, id)) return null;
  const o = puebloOrigen(server, id);
  return { x: o.x + PUEBLO_SPAWN[0] + 0.5, y: server.persistentData.getInt('pueblo_' + id + '_y') + 1, z: o.z + PUEBLO_SPAWN[1] + 0.5 };
}

// ---- comandos -------------------------------------------------------------------------------------------------
ServerEvents.commandRegistry((event) => {
  const Commands = event.commands;
  const Arguments = event.arguments;

  event.register(Commands.literal('pueblo')
    .requires((src) => src.hasPermission(2))
    .then(Commands.literal('colocar')
      .then(Commands.argument('gremio', Arguments.STRING.create(event))
        .executes((ctx) => {
          const id = String(Arguments.STRING.getResult(ctx, 'gremio')).toLowerCase();
          const ids = id === 'todos' ? Object.keys(GREMIOS) : [id];
          for (var i = 0; i < ids.length; i++) {
            if (!GREMIOS[ids[i]]) { ctx.source.sendFailure(Text.of('Gremio desconocido: ' + ids[i])); return 0; }
          }
          ctx.source.sendSuccess(() => Text.of('Colocando ' + ids.length + ' pueblo(s); puede tardar unos segundos…'), false);
          ids.forEach((g) => colocarPueblo(ctx.source.server, g));
          ctx.source.sendSuccess(() => Text.green('Listo.'), false);
          return 1;
        })))
    .then(Commands.literal('estado').executes((ctx) => {
      Object.keys(GREMIOS).forEach((id) => ctx.source.sendSuccess(() => Text.of(id + ': ' + (puebloColocado(ctx.source.server, id) ? 'colocado' : 'pendiente')), false));
      return 1;
    })));

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
            const n = player.username;
            const sp = puebloSpawn(server, id);
            if (sp) {
              server.runCommandSilent('execute in minecraft:overworld run tp ' + n + ' ' + sp.x + ' ' + sp.y + ' ' + sp.z);
            } else {   // el pueblo aún no existe: a una zona al azar cerca de donde estará
              const tx = g.sx * PUEBLO, tz = g.sz * PUEBLO;
              server.runCommandSilent('execute as ' + n + ' in minecraft:overworld run spreadplayers ' + tx + ' ' + tz + ' 0 20 false @s');
            }
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
  // los pueblos que falten se colocan solos al arrancar (2 segundos entre uno y otro para no bloquear el servidor); /pueblo colocar los rehace
  Object.keys(GREMIOS).forEach((id, i) => s.scheduleInTicks(100 + i * 40, () => { if (!puebloColocado(s, id)) colocarPueblo(s, id); }));
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
