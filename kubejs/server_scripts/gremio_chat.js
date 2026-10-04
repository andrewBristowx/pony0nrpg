// Chat global y de gremio, y cabecera/pie de la lista TAB.
//  - Por defecto se habla en el chat GLOBAL (todos ven <[Gremio] Nombre> mensaje; la etiqueta la pone startup_scripts/gremio_nombres.js).
//  - Chat de GREMIO: solo lo ven los miembros del mismo gremio, todo en el color del gremio:  [Gremio] Nombre: mensaje
//  - Comandos (todos los jugadores):
//      /gc <mensaje>            un mensaje al chat de tu gremio
//      /g <mensaje>             un mensaje al chat global (util si tu chat por defecto es el de gremio)
//      /chat gremio | global    cambia el chat por defecto (se guarda con el jugador); /chat estado lo muestra
//  - TAB: cabecera "Servidor de Pony0n", pie con los 4 gremios y "Gracias holy.gg", y cada jugador como "[Gremio] Nombre [Rol]".

const MODO_CHAT = 'modoChat';   // en player.persistentData: '' / 'global' (por defecto) o 'gremio'

const modoDe = (p) => String(p.persistentData.getString(MODO_CHAT)) === 'gremio' ? 'gremio' : 'global';

/** actualiza nombre en chat y TAB y la cabecera/pie; se llama al entrar y al unirse a un gremio */
global.refrescarGremio = (player) => {
  try {
    player.refreshDisplayName();
    player.refreshTabListName();
    var pie = Text.empty().append(Text.gray('Gremios: '));
    Object.keys(global.GREMIO_ESTILO).forEach((id, i) => {
      if (i > 0) pie.append(Text.darkGray(' | '));
      pie.append(global.GREMIO_ESTILO[id].color(global.GREMIO_ESTILO[id].nombre));
    });
    pie.append(Text.of('\n')).append(Text.gold('Gracias holy.gg'));
    player.setTabListHeaderFooter(Text.gold('Servidor de Pony0n').bold(), pie);
  } catch (e) { console.error('[gremio_chat] refrescarGremio: ' + e); }
};

function enviarAGremio(emisor, texto) {
  const id = global.gremioDe(emisor);
  const linea = global.GREMIO_ESTILO[id].color('[Gremio] ' + emisor.username + ': ' + texto);
  emisor.server.players.forEach((p) => { if (global.gremioDe(p) === id) p.tell(linea); });
  console.info('[chat gremio ' + id + '] ' + emisor.username + ': ' + texto);
}

function enviarGlobal(emisor, texto) {
  emisor.server.tell(Text.empty().append(Text.of('<')).append(emisor.getDisplayName()).append(Text.of('> ' + texto)));
}

global.chatGremio = { enviarAGremio: enviarAGremio, enviarGlobal: enviarGlobal };   // expuestas para pruebas

// al entrar: nombre y TAB (con un pequeño retraso para que los stages ya esten cargados)
PlayerEvents.loggedIn((event) => {
  const p = event.player;
  p.server.scheduleInTicks(20, () => global.refrescarGremio(p));
});

// si el chat por defecto del jugador es el de gremio, el mensaje se redirige a su gremio y no sale al global
PlayerEvents.chat((event) => {
  const p = event.player;
  if (modoDe(p) !== 'gremio' || !global.gremioDe(p)) return;
  enviarAGremio(p, String(event.message));
  event.cancel();
});

ServerEvents.commandRegistry((event) => {
  const Commands = event.commands;
  const Arguments = event.arguments;
  const soloJugador = (ctx) => { const p = ctx.source.player; if (!p) ctx.source.sendFailure(Text.of('Solo un jugador puede usar este comando.')); return p; };

  event.register(Commands.literal('gc')
    .then(Commands.argument('mensaje', Arguments.GREEDY_STRING.create(event))
      .executes((ctx) => {
        const p = soloJugador(ctx);
        if (!p) return 0;
        if (!global.gremioDe(p)) { ctx.source.sendFailure(Text.of('No perteneces a ningún gremio.')); return 0; }
        enviarAGremio(p, String(Arguments.GREEDY_STRING.getResult(ctx, 'mensaje')));
        return 1;
      })));

  event.register(Commands.literal('g')
    .then(Commands.argument('mensaje', Arguments.GREEDY_STRING.create(event))
      .executes((ctx) => {
        const p = soloJugador(ctx);
        if (!p) return 0;
        enviarGlobal(p, String(Arguments.GREEDY_STRING.getResult(ctx, 'mensaje')));
        return 1;
      })));

  const fijarModo = (ctx, modo) => {
    const p = soloJugador(ctx);
    if (!p) return 0;
    if (modo === 'gremio' && !global.gremioDe(p)) { ctx.source.sendFailure(Text.of('No perteneces a ningún gremio.')); return 0; }
    p.persistentData.putString(MODO_CHAT, modo);
    ctx.source.sendSuccess(() => Text.green('Chat por defecto: ' + (modo === 'gremio' ? 'GREMIO (solo tu gremio te ve; /g para hablar en el global)' : 'GLOBAL (todos te ven; /gc para hablar en tu gremio)')), false);
    return 1;
  };
  event.register(Commands.literal('chat')
    .then(Commands.literal('gremio').executes((ctx) => fijarModo(ctx, 'gremio')))
    .then(Commands.literal('global').executes((ctx) => fijarModo(ctx, 'global')))
    .then(Commands.literal('estado').executes((ctx) => {
      const p = soloJugador(ctx);
      if (!p) return 0;
      ctx.source.sendSuccess(() => Text.of('Chat por defecto: ' + modoDe(p).toUpperCase()), false);
      return 1;
    })));
});
