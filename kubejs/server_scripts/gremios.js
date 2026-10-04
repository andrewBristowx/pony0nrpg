// Gremios, regiones y modo guerra (docs/07-gremios-regiones-guerra.md).
//  - 4 gremios = 4 cuadrantes del mapa alrededor de (0, 0), más una zona neutral central.
//  - Elegir gremio (capa de Origins pony0n:gremio) ejecuta /gremio unir: stage, equipo de FTB Teams, región y reaparición.
//  - En paz nadie sale de su región (salvo operadores); en guerra se quitan los límites y se permite PvP entre gremios.
//  - PvP: nunca dentro del mismo gremio; en el Overworld solo en guerra; en las demás dimensiones siempre entre gremios distintos.
// Comandos (operador):  /guerra on | off | estado     /gremio unir <gremio> <jugador>
//   /pueblo estado | colocar <gremio|bazar|todos> | ir <gremio|bazar>     /limite ir <gremio|norte|sur|este|oeste>
//  - Bazar neutral (plantilla pony0n:bazar, tools/village/gen-bazar.mjs) en el centro (0, 0), dentro de la zona neutral; se coloca solo al arrancar.

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
    var uuidClase = Java.loadClass('java.util.UUID');
    var api = Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI').api();
    if (!api.isManagerLoaded()) return false;
    var mgr = api.getManager();
    var key = 'equipo_' + id;

    var team = null;
    if (server.persistentData.contains(key)) {
      var opt = mgr.getTeamByID(uuidClase.fromString(server.persistentData.getString(key)));
      if (opt.isPresent()) team = opt.get();
    }
    var mine = mgr.getTeamForPlayer(player);
    var current = mine.isPresent() ? mine.get() : null;
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
const BAZAR = 'bazar';                   // el bazar neutral del centro del mapa (tools/village/gen-bazar.mjs): misma talla y suelo que un pueblo, sitio fijo (0, 0)
const BAZAR_SPAWN = [64, 80];            // sobre la avenida sur del bazar, fuera del brocal de la fuente
const PUEBLOS = Object.keys(GREMIOS).concat([BAZAR]);   // todo lo que /pueblo sabe colocar
const plantillaDe = (id) => 'pony0n:' + (id === BAZAR ? 'bazar' : 'pueblo_' + id);
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

/** ¿el punto es tierra firme apta para un pueblo? Solo mira el BIOMA (barato). NO usar ChunkGenerator.getBaseHeight: cada llamada construye un
 *  NoiseChunk entero y en este pack (muchas funciones de densidad) tarda cientos de ms; ~180 llamadas en un tick colgaron el servidor (crash 17:36). */
const BIOMAS_NO_APTOS = /ocean|river|beach|shore|peak|mountain|slope|jagged|stony|windswept|badlands|swamp|mangrove|lake|cave|lush|dripstone|deep_dark|void/;
function biomaApto(level, gen, rs, x, z) {
  const bioma = String(gen.getBiomeSource().getNoiseBiome(x >> 2, 16, z >> 2, rs.sampler()).unwrapKey().get().location());
  return !BIOMAS_NO_APTOS.test(bioma);
}

/** busca en la región del gremio el sitio de tierra firme (3x3 puntos separados 56 bloques, todos de bioma apto) más cercano a (±PUEBLO, ±PUEBLO).
 *  Los candidatos se prueban por tramos (unos pocos por tick); al terminar llama a alTerminar(sitio). Si ninguno sirve, usa (±PUEBLO, ±PUEBLO). */
function elegirSitio(server, level, id, alTerminar) {
  const g = GREMIOS[id];
  const gen = level.getChunkSource().getGenerator(), rs = level.getChunkSource().randomState();
  const candidatos = [];
  for (var ax = 260; ax <= 2800; ax += 60) for (var az = 260; az <= 2800; az += 60) {
    candidatos.push({ cx: g.sx * ax, cz: g.sz * az, d: Math.abs(ax - PUEBLO) + Math.abs(az - PUEBLO) });
  }
  candidatos.sort(function (p, q) { return p.d - q.d; });
  var i = 0;
  (function tramo() {
    const fin = Math.min(i + 20, candidatos.length);
    for (; i < fin; i++) {
      var c = candidatos[i], ok = true;
      for (var u = -1; u <= 1 && ok; u++) for (var v = -1; v <= 1 && ok; v++) ok = biomaApto(level, gen, rs, c.cx + u * 56, c.cz + v * 56);
      if (ok) { alTerminar({ cx: c.cx, cz: c.cz, rango: 0, agua: 0 }); return; }
    }
    if (i < candidatos.length) { server.scheduleInTicks(1, tramo); return; }
    console.error('[gremios] ' + id + ': ningún sitio de tierra firme en la región; se usa (' + g.sx * PUEBLO + ', ' + g.sz * PUEBLO + ')');
    alTerminar({ cx: g.sx * PUEBLO, cz: g.sz * PUEBLO, rango: 0, agua: 0 });
  })();
}

/** quita un pueblo ya colocado (solo lo construido sobre el suelo) para poder volver a colocarlo */
function limpiarPueblo(server, id, run) {
  const pd = server.persistentData;
  if (!pd.contains('pueblo_' + id + '_y')) return;
  const o = puebloOrigen(server, id), ref = pd.getInt('pueblo_' + id + '_y');
  rellenar(run, o.x - 1, o.z - 1, o.x + o.lado, o.z + o.lado, ref + 1, ref + 34, 'minecraft:air');
}

/** ruido suave determinista en [-1, 1] para que el borde del terreno nivelado no sea una forma regular */
function ruido(x, z) {
  return (Math.sin(x * 0.11 + 1.3) + Math.sin(z * 0.09 + 4.1) + Math.sin((x + z) * 0.05) + Math.sin((x - z) * 0.07 + 2.2)) / 4;
}

/** suaviza el terreno alrededor del pueblo con una rampa irregular (hasta ~26 bloques, de ancho variable y con esquinas redondeadas) que pasa
 *  de la altura del pueblo a la del terreno natural; fuera del césped cercano usa los mismos bloques de superficie del terreno (arena, nieve, etc.) */
function suavizarBordes(level, x1, z1, x2, z2, ref) {
  const Heightmap = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap');
  const BlockPos = Java.loadClass('net.minecraft.core.BlockPos');
  const Blocks = Java.loadClass('net.minecraft.world.level.block.Blocks');
  const aire = Blocks.AIR.defaultBlockState(), tierra = Blocks.DIRT.defaultBlockState(), cesped = Blocks.GRASS_BLOCK.defaultBlockState();
  const ANCHO = 26;
  for (var x = x1 - ANCHO; x <= x2 + ANCHO; x++) {
    for (var z = z1 - ANCHO; z <= z2 + ANCHO; z++) {
      var dx = Math.max(x1 - x, 0, x - x2), dz = Math.max(z1 - z, 0, z - z2);
      var d = Math.sqrt(dx * dx + dz * dz);
      if (d < 0.5) continue;                                 // dentro del pueblo: ya está hecho
      var ancho = ANCHO * (0.65 + 0.35 * ruido(x, z));
      if (d > ancho) continue;
      var natural = level.getHeight(Heightmap.Types.MOTION_BLOCKING_NO_LEAVES, x, z) - 1;
      var sup = level.getBlockState(new BlockPos(x, natural, z));
      var t = d / ancho, s = t * t * (3 - 2 * t);
      var objetivo = Math.round(ref + (natural - ref) * s);
      for (var y = objetivo + 1; y <= Math.max(natural, objetivo) + 24; y++) {   // quita relieve, troncos y hojas de encima
        var pos = new BlockPos(x, y, z);
        if (!level.getBlockState(pos).isAir()) level.setBlock(pos, aire, 2);
      }
      var arenoso = sup.getBlock() === Blocks.SAND || sup.getBlock() === Blocks.RED_SAND;
      var relleno = arenoso ? sup : tierra;
      for (var y2 = natural + 1; y2 < objetivo; y2++) level.setBlock(new BlockPos(x, y2, z), relleno, 2);   // rellena si el terreno está más bajo
      if (objetivo !== natural) {
        var azar = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
        var cercaDelPueblo = d < 3 || azar > s * 1.4;         // cerca del pueblo, césped; lejos, mezcla hasta el bloque natural
        var libre = sup.isAir() || !sup.getFluidState().isEmpty();
        level.setBlock(new BlockPos(x, objetivo, z), (libre || cercaDelPueblo) ? cesped : sup, 2);
      }
    }
  }
}

/** Coloca el pueblo de un gremio SIN bloquear el servidor (alTerminar es opcional):
 *  1) elige el sitio por tramos; 2) pide los chunks de la zona con /forceload (carga y generación en segundo plano) y espera a que estén listos;
 *  3) con los chunks ya listos, construye (fill, plantilla, rampa) y suelta el forceload. Nunca se llama a level.getChunk (bloquea el tick). */
function colocarPueblo(server, id, alTerminar) {
  const level = server.overworld();
  const run = (c) => server.runCommandSilent('execute in minecraft:overworld run ' + c);
  limpiarPueblo(server, id, run);
  const elegir = id === BAZAR ? function (srv, lvl, i, cb) { cb({ cx: 0, cz: 0 }); } : elegirSitio;   // el bazar va siempre en el centro
  elegir(server, level, id, function (s) {
    const ox = s.cx - PUEBLO_MITAD, oz = s.cz - PUEBLO_MITAD;
    const cx0 = (ox - 32) >> 4, cx1 = (ox + PUEBLO_LADO + 32) >> 4, cz0 = (oz - 32) >> 4, cz1 = (oz + PUEBLO_LADO + 32) >> 4;
    const zona = cx0 * 16 + ' ' + cz0 * 16 + ' ' + (cx1 * 16 + 15) + ' ' + (cz1 * 16 + 15);
    run('forceload add ' + zona);
    var esperas = 0;
    (function esperar() {
      var faltan = 0;
      for (var cx = cx0; cx <= cx1; cx++) for (var cz = cz0; cz <= cz1; cz++) if (!level.hasChunk(cx, cz)) faltan++;
      if (faltan > 0) {
        if (++esperas > 180) {   // 3 minutos (un sondeo por segundo)
          run('forceload remove ' + zona);
          console.error('[gremios] pueblo de ' + id + ': faltaron ' + faltan + ' chunks tras 3 minutos; se reintentará con /pueblo colocar ' + id);
          if (alTerminar) alTerminar(false);
          return;
        }
        server.scheduleInTicks(20, esperar);
        return;
      }
      construirPueblo(server, level, run, id, s, ox, oz);
      run('forceload remove ' + zona);
      if (alTerminar) alTerminar(true);
    })();
  });
}

/** construcción síncrona del pueblo; solo se llama con todos los chunks de la zona ya cargados */
function construirPueblo(server, level, run, id, s, ox, oz) {
  const Heightmap = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap');
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
  run('place template ' + plantillaDe(id) + ' ' + ox + ' ' + (ref - PUEBLO_SUELO) + ' ' + oz);
  suavizarBordes(level, x1, z1, x2, z2, ref);
  const pd = server.persistentData;
  pd.putInt('pueblo_' + id + '_x', ox); pd.putInt('pueblo_' + id + '_z', oz); pd.putInt('pueblo_' + id + '_y', ref);
  pd.putInt('pueblo_' + id + '_lado', PUEBLO_LADO); pd.putInt('pueblo_' + id + '_v', PUEBLO_VERSION);
  console.info('[gremios] pueblo de ' + id + ' colocado en ' + ox + ',' + (ref - PUEBLO_SUELO) + ',' + oz + ' (suelo a y=' + ref + ')');
}

/** coloca uno detrás de otro (en serie) los pueblos de la lista */
function colocarPueblos(server, ids, alTerminar) {
  var k = 0;
  (function siguiente() {
    if (k >= ids.length) { if (alTerminar) alTerminar(); return; }
    colocarPueblo(server, ids[k++], function () { server.scheduleInTicks(40, siguiente); });
  })();
}

/** posición de aparición dentro del pueblo de un gremio, o null si aún no se colocó */
function puebloSpawn(server, id) {
  if (!puebloColocado(server, id)) return null;
  const o = puebloOrigen(server, id);
  const off = id === BAZAR ? BAZAR_SPAWN : PUEBLO_SPAWN;
  return { x: o.x + off[0] + 0.5, y: server.persistentData.getInt('pueblo_' + id + '_y') + 1, z: o.z + off[1] + 0.5 };
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
          const ids = id === 'todos' ? PUEBLOS : [id];
          for (var i = 0; i < ids.length; i++) {
            if (PUEBLOS.indexOf(ids[i]) < 0) { ctx.source.sendFailure(Text.of('Desconocido: ' + ids[i] + ' (' + PUEBLOS.join(', ') + ', todos)')); return 0; }
          }
          ctx.source.sendSuccess(() => Text.of('Colocando ' + ids.length + ' pueblo(s) en segundo plano; tarda unos minutos y avisa en el chat al terminar (progreso en el log).'), false);
          const server = ctx.source.server;
          colocarPueblos(server, ids, () => server.tell(Text.green('[gremios] Pueblos colocados.')));
          return 1;
        })))
    .then(Commands.literal('ir')       // /pueblo ir <gremio>: teletransporta al operador a la plaza del pueblo (para revisarlos)
      .then(Commands.argument('gremio', Arguments.STRING.create(event))
        .executes((ctx) => {
          const id = String(Arguments.STRING.getResult(ctx, 'gremio')).toLowerCase();
          if (PUEBLOS.indexOf(id) < 0) { ctx.source.sendFailure(Text.of('Desconocido: ' + id + ' (' + PUEBLOS.join(', ') + ')')); return 0; }
          const server = ctx.source.server, player = ctx.source.player;
          if (!player) { ctx.source.sendFailure(Text.of('Solo un jugador puede usar /pueblo ir.')); return 0; }
          const sp = puebloSpawn(server, id);
          if (!sp) { ctx.source.sendFailure(Text.of('El pueblo de ' + id + ' aún no está colocado (mira /pueblo estado).')); return 0; }
          server.runCommandSilent('execute in minecraft:overworld run tp ' + player.username + ' ' + sp.x + ' ' + sp.y + ' ' + sp.z);
          ctx.source.sendSuccess(() => Text.green('Teletransportado a ' + (id === BAZAR ? 'el bazar' : 'el pueblo de ' + GREMIOS[id].nombre) + '.'), false);
          return 1;
        })))
    .then(Commands.literal('estado').executes((ctx) => {
      PUEBLOS.forEach((id) => {
        const sp = puebloSpawn(ctx.source.server, id);
        ctx.source.sendSuccess(() => Text.of(id + ': ' + (sp ? 'colocado, plaza en ' + Math.floor(sp.x) + ' ' + Math.floor(sp.y) + ' ' + Math.floor(sp.z) : 'pendiente')), false);
      });
      return 1;
    })));

  // /limite ir <gremio|norte|sur|este|oeste>: teletransporta al borde del mundo (a 10 bloques) para revisarlo; gremio = la esquina exterior de su región
  const MITAD = BORDE / 2 - 10;
  const destinoLimite = (d) => {
    if (GREMIOS[d]) return [GREMIOS[d].sx * MITAD, GREMIOS[d].sz * MITAD];
    return { norte: [0, -MITAD], sur: [0, MITAD], este: [MITAD, 0], oeste: [-MITAD, 0] }[d] || null;
  };
  event.register(Commands.literal('limite')
    .requires((src) => src.hasPermission(2))
    .then(Commands.literal('ir')
      .then(Commands.argument('destino', Arguments.STRING.create(event))
        .executes((ctx) => {
          const d = String(Arguments.STRING.getResult(ctx, 'destino')).toLowerCase();
          const t = destinoLimite(d), player = ctx.source.player;
          if (!t) { ctx.source.sendFailure(Text.of('Destinos: ' + Object.keys(GREMIOS).join(', ') + ', norte, sur, este, oeste')); return 0; }
          if (!player) { ctx.source.sendFailure(Text.of('Solo un jugador puede usar /limite ir.')); return 0; }
          ctx.source.sendSuccess(() => Text.of('Yendo al límite (' + t[0] + ', ' + t[1] + '); si el terreno no está generado puede tardar unos segundos…'), false);
          ctx.source.server.runCommandSilent('execute as ' + player.username + ' in minecraft:overworld run spreadplayers ' + t[0] + ' ' + t[1] + ' 0 2 false @s');
          return 1;
        }))));

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
  console.info('[gremios] script v3 cargado (sitio del pueblo por bioma, sin getBaseHeight)');
  if (!s.persistentData.getBoolean('regiones_init')) {
    s.runCommandSilent('worldborder center 0 0');
    s.runCommandSilent('worldborder set ' + BORDE);
    s.persistentData.putBoolean('regiones_init', true);
    console.info('[gremios] borde del mundo fijado en ' + BORDE + ' x ' + BORDE);
  }
  // los pueblos que falten se colocan solos al arrancar, en segundo plano (la búsqueda va por tramos y los chunks se cargan con /forceload,
  // así que el tick nunca se bloquea); /pueblo colocar los rehace
  const pendientes = PUEBLOS.filter((id) => !puebloColocado(s, id));
  if (pendientes.length) s.scheduleInTicks(200, () => colocarPueblos(s, pendientes));
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
