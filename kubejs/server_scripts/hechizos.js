// Hechizos por progresion. Los hechizos de Iron's Spells solo se pueden lanzar si se han APRENDIDO (stage hech_<hechizo>, ver class_gating.js) y solo
// se aprenden subiendo de nivel en el rol (misiones de rol -> /rol recompensa, gremio_roles.js; tablas en gremio_roles_tabla.js: HECHIZOS_ROL).
// Los pergaminos no salen de cofres ni de mobs (kubejs/data/irons_spellbooks/loot_modifiers) y no se fabrican (fixes.js).
//   /hechizo                       tus hechizos aprendidos y los que te quedan por aprender con tu rol
//   /hechizo recibir <hechizo>     si ya lo aprendiste y perdiste el pergamino, te da otro
//   /hechizo aprender <hechizo> [nivel] <jugador>   (operador) lo enseña y entrega el pergamino
// Nombres y descripciones: startup_scripts/hechizos_datos.js.
// OJO (Rhino de este pack): `const`/`let` DENTRO de un try da "redeclaration of var"; dentro de try se usa `var`.

ServerEvents.commandRegistry((event) => {
  const Commands = event.commands;
  const Arguments = event.arguments;
  const soloJugador = (ctx) => { const p = ctx.source.player; if (!p) ctx.source.sendFailure(Text.of('Solo un jugador puede usar este comando.')); return p; };
  const nombreDe = (id) => (global.HECHIZOS[id] ? global.HECHIZOS[id][0] : id);
  const idValido = (ctx, id) => { if (!global.HECHIZOS[id]) { ctx.source.sendFailure(Text.of('Hechizo desconocido: ' + id)); return false; } return true; };

  event.register(Commands.literal('hechizo')
    .executes((ctx) => {
      const p = soloJugador(ctx);
      if (!p) return 0;
      const aprendidos = Object.keys(global.HECHIZOS).filter((id) => global.hechizoAprendido(p, id));
      p.tell(Text.lightPurple('Hechizos aprendidos (' + aprendidos.length + '):'));
      if (!aprendidos.length) p.tell(Text.gray('  Ninguno todavía. Elige un rol con el maestro de tu pueblo y sube de nivel con sus misiones.'));
      aprendidos.forEach((id) => p.tell(Text.white('  • ' + nombreDe(id)).append(Text.gray(' — ' + global.HECHIZOS[id][1]))));
      const rol = global.rolDe(p), clase = global.rolSistema.claseDe(p);
      if (rol && clase) {
        const pendientes = [];
        for (var n = 0; n <= 8; n++) global.hechizosDe(rol, clase, n).forEach((h) => { if (!global.hechizoAprendido(p, h[0])) pendientes.push('nivel ' + n + ': ' + nombreDe(h[0])); });
        if (pendientes.length) p.tell(Text.yellow('Por aprender con tu rol: ').append(Text.white(pendientes.join(', '))));
      }
      p.tell(Text.gray('Inscribe los pergaminos en un libro de hechizos (mesa de inscripción) para lanzarlos.'));
      return 1;
    })
    .then(Commands.literal('recibir')
      .then(Commands.argument('hechizo', Arguments.STRING.create(event))
        .executes((ctx) => {
          const p = soloJugador(ctx), id = String(Arguments.STRING.getResult(ctx, 'hechizo')).toLowerCase();
          if (!p || !idValido(ctx, id)) return 0;
          if (!global.hechizoAprendido(p, id)) { ctx.source.sendFailure(Text.of('Aún no has aprendido «' + nombreDe(id) + '».')); return 0; }
          global.aprenderHechizo(p, id, 1);
          return 1;
        })))
    .then(Commands.literal('aprender').requires((src) => src.hasPermission(2))
      .then(Commands.argument('hechizo', Arguments.STRING.create(event))
        .then(Commands.argument('nivel', Arguments.INTEGER.create(event))
          .then(Commands.argument('jugador', Arguments.PLAYER.create(event))
            .executes((ctx) => {
              const id = String(Arguments.STRING.getResult(ctx, 'hechizo')).toLowerCase();
              if (!idValido(ctx, id)) return 0;
              global.aprenderHechizo(Arguments.PLAYER.getResult(ctx, 'jugador'), id, Arguments.INTEGER.getResult(ctx, 'nivel'));
              return 1;
            }))))));
});
