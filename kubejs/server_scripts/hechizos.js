// Hechizos por progresion. Los hechizos de Iron's Spells solo se pueden lanzar si se han APRENDIDO (stage hech_<hechizo>, ver class_gating.js) y solo
// se aprenden subiendo de nivel en el rol (misiones de rol -> /rol recompensa, gremio_roles.js; tablas en gremio_roles_tabla.js: HECHIZOS_ROL).
// Tambien se aprenden en los nodos de hechizo del arbol de Habilidades (4 por camino; ver abajo y tools/gen-skills.mjs).
// Los pergaminos no salen de cofres ni de mobs (kubejs/data/irons_spellbooks/loot_modifiers) y no se fabrican (fixes.js).
//   /hechizo                       tus hechizos aprendidos y los que te quedan por aprender con tu rol
//   /hechizo recibir <hechizo>     si ya lo aprendiste y perdiste el pergamino, te da otro
//   /hechizo aprender <hechizo> [nivel] <jugador>   (operador) lo enseña y entrega el pergamino
// Nombres y descripciones: startup_scripts/hechizos_datos.js.
// OJO (Rhino de este pack): `const`/`let` DENTRO de un try da "redeclaration of var"; dentro de try se usa `var`.

// ---- hechizos del arbol de Habilidades -----------------------------------------------------------------------------------
// Los nodos de hechizo de los caminos (tools/gen-skills.mjs -> hechizos_arbol_datos.js: nodo -> [clase, hechizo, nivel]) enseñan el hechizo al
// comprarse. Se detecta con la API de Pufferfish (estado UNLOCKED del nodo) al entrar y cada 5 s; el pergamino se entrega una sola vez por nivel.
/** estado del nodo para el jugador ('UNLOCKED', 'AVAILABLE', 'LOCKED'...) o '' si no se puede consultar */
function estadoNodo(p, categoria, nodo) {
  try {
    var SkillsAPI = Java.loadClass('net.puffish.skillsmod.api.SkillsAPI');
    var cat = SkillsAPI.getCategory(new ResourceLocation('puffish_skills:' + categoria));
    if (!cat.isPresent()) return '';
    var sk = cat.get().getSkill(String(nodo));
    return sk.isPresent() ? String(sk.get().getState(p)) : '';
  } catch (e) { return ''; }
}
/** enseña los hechizos de los nodos comprados que aun no se hayan aprendido; clase = la del jugador (o la indicada, para las pruebas) */
function sincronizarHechizosArbol(p, clase) {
  var tabla = global.HECHIZOS_ARBOL;
  if (!tabla) return 0;
  var c = clase || (global.rolSistema && global.rolSistema.claseDe(p));
  if (!c) return 0;
  var n = 0;
  Object.keys(tabla).forEach(function (nodo) {
    var d = tabla[nodo];
    if (d[0] !== c) return;
    if (p.persistentData.getInt('hechDado_' + d[1]) >= d[2]) return;   // ya recibio el pergamino de ese nivel
    if (estadoNodo(p, 'habilidades_' + c, nodo) === 'UNLOCKED') { global.aprenderHechizo(p, d[1], d[2]); n++; }
  });
  return n;
}
global.sincronizarHechizosArbol = sincronizarHechizosArbol;
PlayerEvents.loggedIn((event) => event.server.scheduleInTicks(60, () => { try { sincronizarHechizosArbol(event.player); } catch (e) { console.error('[hechizos] sincronizar: ' + e); } }));
PlayerEvents.tick((event) => {
  const p = event.player;
  if (p.age % 100 === 31) { try { sincronizarHechizosArbol(p); } catch (e) { console.error('[hechizos] sincronizar: ' + e); } }
});

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
          global.aprenderHechizo(p, id, 1, true);
          return 1;
        })))
    .then(Commands.literal('aprender').requires((src) => src.hasPermission(2))
      .then(Commands.argument('hechizo', Arguments.STRING.create(event))
        .then(Commands.argument('nivel', Arguments.INTEGER.create(event))
          .then(Commands.argument('jugador', Arguments.PLAYER.create(event))
            .executes((ctx) => {
              const id = String(Arguments.STRING.getResult(ctx, 'hechizo')).toLowerCase();
              if (!idValido(ctx, id)) return 0;
              global.aprenderHechizo(Arguments.PLAYER.getResult(ctx, 'jugador'), id, Arguments.INTEGER.getResult(ctx, 'nivel'), true);
              return 1;
            }))))));
});
