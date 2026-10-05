// Oficios (Minero, Leñador, Granjero, Pescador, Herrero, Cocinero, Encantador): cada jugador elige UNO con su maestro de oficio y no puede cambiarlo.
//  - Cada pueblo tiene 7 maestros de oficio (aldeanos de Easy NPC con la profesion del oficio) en fila al NORTE de la plaza, justo enfrente de los
//    maestros de rol (que estan al sur). Al hablar con uno: te explica el oficio y te pide CONFIRMAR.
//  - /oficio confirmar concede el stage trabajo_<id> (y la etiqueta, que es lo que lee FTB Quests), desbloquea SOLO la categoria de Habilidades
//    oficio_<id> (las demas siguen bloqueadas) y desbloquea el capitulo de misiones de ese oficio (tools/quests/chapters/11_oficios.mjs).
//  - Comandos:  /oficio (tu oficio)   /oficio hablar <oficio> <jugador> (lo usa el NPC)   /oficio confirmar <oficio>
//               (operador)  /oficio reset <jugador>   /oficio npcs (recoloca los maestros)   /oficioxp <jugador> <oficio> <xp> (lo usan las misiones)
// El stage se llama trabajo_<id> (y no oficio_<id>) porque oficio_<id>_1/_2 ya son los hitos del arbol de Habilidades del oficio.
// OJO (Rhino de este pack): `const`/`let` DENTRO de un try da "redeclaration of var"; dentro de try se usa `var`.

const OFICIOS = {
  minero:     { nombre: 'Minero',     maestro: 'Capataz',     profesion: 'MASON',       color: '#AAAAAA', texto: (s) => Text.gray(s),
    desc: 'Picar minerales y roca: subes de nivel al minar (los minerales dan mucho más). Mejoras: velocidad de minado, suerte y resistencia.' },
  lenador:    { nombre: 'Leñador',    maestro: 'Maderero',    profesion: 'TOOLSMITH',   color: '#00AA00', texto: (s) => Text.darkGreen(s),
    desc: 'Talar árboles: subes de nivel al talar troncos. Mejoras: vida, fuerza con el hacha y velocidad de talado.' },
  granjero:   { nombre: 'Granjero',   maestro: 'Hortelano',   profesion: 'FARMER',      color: '#FFFF55', texto: (s) => Text.yellow(s),
    desc: 'Cosechar cultivos maduros: subes de nivel al recoger la cosecha. Mejoras: curación, vida y suerte.' },
  pescador:   { nombre: 'Pescador',   maestro: 'Barquero',    profesion: 'FISHERMAN',   color: '#00AAAA', texto: (s) => Text.darkAqua(s),
    desc: 'Pescar: subes de nivel con cada captura. Mejoras: suerte, velocidad de nado y esquive.' },
  herrero:    { nombre: 'Herrero',    maestro: 'Maestro herrero', profesion: 'WEAPONSMITH', color: '#555555', texto: (s) => Text.darkGray(s),
    desc: 'Forjar armas, herramientas y armaduras y fundir lingotes: subes de nivel al fabricarlos. Mejoras: armadura, daño y perforación.' },
  cocinero:   { nombre: 'Cocinero',   maestro: 'Cocinero mayor', profesion: 'BUTCHER',  color: '#FF5555', texto: (s) => Text.red(s),
    desc: 'Cocinar comida en hornos y ahumadores y comer: subes de nivel al cocinar. Mejoras: curación, vida y sobrecuración.' },
  encantador: { nombre: 'Encantador', maestro: 'Bibliotecario', profesion: 'LIBRARIAN', color: '#AA00AA', texto: (s) => Text.darkPurple(s),
    desc: 'Encantar objetos: más nivel de encantamiento, más experiencia. Mejoras: experiencia ganada, suerte y maná.' },
};

global.OFICIO_IDS = Object.keys(OFICIOS);
global.OFICIOS = OFICIOS;

function decir(p, componente) {
  p.tell(componente);
  if (global.TEST_ECO) console.info('[eco ' + p.username + '] ' + componente.getString());
}

/** id del oficio del jugador (por su stage trabajo_<id>) o null; global para que otros scripts y las pruebas lo usen */
global.oficioDe = (player) => {
  try {
    var ids = Object.keys(OFICIOS);
    for (var i = 0; i < ids.length; i++) if (player.stages.has('trabajo_' + ids[i])) return ids[i];
  } catch (e) { /* stages aun no listos */ }
  return null;
};

// ---- maestros de oficio (Easy NPC): aldeanos con profesion --------------------------------------------------------------
/** NBT (SNBT) para /summon del maestro de un oficio. El clic ejecuta /oficio hablar <oficio> <jugador> (@initiator lo sustituye Easy NPC). */
global.npcOficioSnbt = (of) => {
  var d = OFICIOS[of];
  var nombre = JSON.stringify({ text: d.maestro + ' ', color: d.color, extra: [{ text: '(' + d.nombre + ')', color: 'white' }] });
  return '{Tags:["pony0n_oficio_npc","pony0n_oficio_' + of + '"],CustomName:\'' + nombre.replace(/'/g, "\\'") + '\',CustomNameVisible:1b,Invulnerable:1b,PersistenceRequired:1b,'
    + 'Attributes:[{Name:"minecraft:generic.movement_speed",Base:0.0d},{Name:"minecraft:generic.knockback_resistance",Base:1.0d}],'
    + 'Rotation:[0.0f,0.0f],EasyNPCVersion:3,Profession:"' + d.profesion + '",'
    + 'ObjectiveData:{HasObjectives:1b,ObjectiveDataSet:[{Type:"LOOK_AT_PLAYER"}]},'
    + 'ActionData:{ActionEventSet:{ON_INTERACTION:[{Cmd:"/oficio hablar ' + of + ' @initiator",Type:"COMMAND"}]}}}';
};
global.NPC_OFICIO_ENTIDAD = (of) => 'easy_npc:villager';

// ---- dialogo del maestro --------------------------------------------------------------------------------------------------
function hablar(p, of) {
  var d = OFICIOS[of], actual = global.oficioDe(p);
  var cab = d.texto('[' + d.maestro + '] ');
  if (actual) {
    if (actual === of) decir(p, cab.append(Text.white('Ya eres ' + d.nombre + '. Abre el libro de misiones y el árbol de Habilidades (K): tienes tu capítulo y tu pestaña de oficio.')));
    else decir(p, cab.append(Text.white('Elegiste el oficio de ' + OFICIOS[actual].nombre + ' y no se puede cambiar. Tus misiones y tu árbol de oficio son los suyos.')));
    return;
  }
  p.persistentData.putString('oficioPropuesto', of);
  decir(p, cab.append(Text.white(d.desc)));
  decir(p, Text.yellow('¿Seguro que quieres ser ').append(d.texto(d.nombre)).append(Text.yellow('? ')).append(Text.red('NO PODRÁS CAMBIARLO')).append(Text.yellow(' y solo tendrás el árbol y las misiones de ese oficio. ')));
  decir(p, Text.green('[CONFIRMAR]').bold().clickRunCommand('/oficio confirmar ' + of).hover(Text.of('Elegir ' + d.nombre + ' para siempre'))
    .append(Text.of('   ')).append(Text.gray('[Pensarlo]').hover(Text.of('Cierra el dialogo; vuelve a hablar con el maestro cuando quieras'))));
}

/** desbloquea la categoria de Habilidades del oficio elegido (solo esa) */
function desbloquearOficio(p, of) {
  p.server.runCommandSilent('puffish_skills category unlock ' + p.username + ' oficio_' + of);
  p.persistentData.putString('ofiUnlock', of);
}
global.desbloquearOficio = desbloquearOficio;

function confirmar(p, of) {
  if (global.oficioDe(p)) { decir(p, Text.red('Ya tienes un oficio y no se puede cambiar.')); return 0; }
  if (String(p.persistentData.getString('oficioPropuesto')) !== of) { decir(p, Text.red('Habla primero con el maestro de ese oficio.')); return 0; }
  var d = OFICIOS[of];
  p.persistentData.remove('oficioPropuesto');
  p.stages.add('trabajo_' + of);
  p.addTag('trabajo_' + of);   // FTB Quests lee etiquetas, no stages de KubeJS (ver stages_tags.js)
  desbloquearOficio(p, of);
  decir(p, Text.green('¡Ahora eres ').append(d.texto(d.nombre)).append(Text.green('! Tu pestaña de oficio está en el árbol de Habilidades (K) y tu capítulo, en el libro de misiones.')));
  p.server.tell(Text.yellow(p.username + ' ha elegido el oficio de ').append(d.texto(d.nombre)).append(Text.yellow('.')));
  return 1;
}

// Quien tenga oficio pero no la categoria desbloqueada (p. ej. tras un reinicio de datos) la recupera; se comprueba al entrar y cada 5 s
function sincronizarOficio(p) {
  var of = global.oficioDe(p);
  if (of && String(p.persistentData.getString('ofiUnlock')) !== of) desbloquearOficio(p, of);
}
PlayerEvents.loggedIn((event) => sincronizarOficio(event.player));
PlayerEvents.tick((event) => {
  const p = event.player;
  if (p.age % 100 === 19) sincronizarOficio(p);
});

/** XP de oficio solo si el jugador tiene ese oficio; devuelve si se dio */
function darXpOficio(p, of, xp) {
  if (global.oficioDe(p) !== of) return false;
  p.server.runCommandSilent('puffish_skills experience add ' + p.username + ' oficio_' + of + ' ' + xp);
  return true;
}
global.darXpOficio = darXpOficio;

// ---- comandos -------------------------------------------------------------------------------------------------------------
ServerEvents.commandRegistry((event) => {
  const Commands = event.commands;
  const Arguments = event.arguments;
  const soloJugador = (ctx) => { const p = ctx.source.player; if (!p) ctx.source.sendFailure(Text.of('Solo un jugador puede usar este comando.')); return p; };
  const ofValido = (ctx, id) => { if (!OFICIOS[id]) { ctx.source.sendFailure(Text.of('Oficio desconocido: ' + id + ' (' + Object.keys(OFICIOS).join(', ') + ')')); return false; } return true; };
  const arg = (ctx, n) => String(Arguments.STRING.getResult(ctx, n)).toLowerCase();

  // /oficioxp <jugador> <oficio> <xp> (operador): XP de oficio de las misiones; solo se da si el jugador TIENE ese oficio (las misiones generales
  // premian XP de varios oficios y cada jugador solo recibe la del suyo)
  event.register(Commands.literal('oficioxp').requires((src) => src.hasPermission(2))
    .then(Commands.argument('jugador', Arguments.PLAYER.create(event))
      .then(Commands.argument('oficio', Arguments.STRING.create(event))
        .then(Commands.argument('xp', Arguments.INTEGER.create(event))
          .executes((ctx) => {
            const p = Arguments.PLAYER.getResult(ctx, 'jugador'), id = arg(ctx, 'oficio');
            if (!ofValido(ctx, id)) return 0;
            return darXpOficio(p, id, Arguments.INTEGER.getResult(ctx, 'xp')) ? 1 : 0;
          })))));

  event.register(Commands.literal('oficio')
    .executes((ctx) => {
      const p = soloJugador(ctx);
      if (!p) return 0;
      const of = global.oficioDe(p);
      if (of) decir(p, Text.of('Tu oficio: ').append(OFICIOS[of].texto(OFICIOS[of].nombre)));
      else decir(p, Text.of('Aún no tienes oficio. Habla con un maestro de oficio, al norte de la plaza de tu pueblo (enfrente de los maestros de rol). Oficios: ' + Object.keys(OFICIOS).map((k) => OFICIOS[k].nombre).join(', ') + '.'));
      return 1;
    })
    .then(Commands.literal('hablar')
      .then(Commands.argument('oficio', Arguments.STRING.create(event))
        .then(Commands.argument('jugador', Arguments.PLAYER.create(event))
          .executes((ctx) => {
            const id = arg(ctx, 'oficio');
            if (!ofValido(ctx, id)) return 0;
            hablar(Arguments.PLAYER.getResult(ctx, 'jugador'), id);
            return 1;
          }))))
    .then(Commands.literal('confirmar')
      .then(Commands.argument('oficio', Arguments.STRING.create(event))
        .executes((ctx) => {
          const p = soloJugador(ctx), id = arg(ctx, 'oficio');
          if (!p || !ofValido(ctx, id)) return 0;
          return confirmar(p, id);
        })))
    .then(Commands.literal('reset').requires((src) => src.hasPermission(2))
      .then(Commands.argument('jugador', Arguments.PLAYER.create(event))
        .executes((ctx) => {
          const p = Arguments.PLAYER.getResult(ctx, 'jugador');
          Object.keys(OFICIOS).forEach((id) => {
            p.stages.remove('trabajo_' + id); p.removeTag('trabajo_' + id);
            p.server.runCommandSilent('puffish_skills category lock ' + p.username + ' oficio_' + id);
          });
          p.persistentData.remove('oficioPropuesto'); p.persistentData.remove('ofiUnlock');
          ctx.source.sendSuccess(() => Text.green('Oficio de ' + p.username + ' reiniciado (la experiencia de oficio ya ganada se conserva).'), false);
          return 1;
        })))
    .then(Commands.literal('npcs').requires((src) => src.hasPermission(2))
      .executes((ctx) => {
        if (!global.recolocarNpcsOficio) { ctx.source.sendFailure(Text.of('gremios.js no está cargado.')); return 0; }
        ctx.source.sendSuccess(() => Text.of('Recolocando los maestros de oficio en los pueblos colocados…'), false);
        global.recolocarNpcsOficio(ctx.source.server);
        return 1;
      })));
});

global.oficioSistema = { hablar: hablar, confirmar: confirmar };   // expuesto para pruebas
