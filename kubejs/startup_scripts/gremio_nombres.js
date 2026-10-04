// [startup] Gremio visible: etiqueta de gremio en el nombre del jugador (chat global, lista TAB y nombre sobre la cabeza).
//   Chat global:  <[Slytheri0n] Nombre> hola        TAB:  [Slytheri0n] Nombre        (sin gremio: solo el nombre)
// El gremio se lee del stage gremio_<id> que da /gremio unir (server_scripts/gremios.js). Los colores se cambian en GREMIO_ESTILO.
// Compartido con server_scripts/gremio_chat.js a traves de `global`.
// OJO (Rhino de este pack): `const`/`let` DENTRO de un try da "redeclaration of var"; dentro de try se usa `var`.

global.GREMIO_ESTILO = {
  slytherion:      { nombre: 'Slytheri0n',      color: (s) => Text.green(s) },
  ravencachalotes: { nombre: 'RavenCachalotes', color: (s) => Text.blue(s) },
  huffleponyanos:  { nombre: 'Huffleponyanos',  color: (s) => Text.yellow(s) },
  tuliondor:       { nombre: 'Tuliondor',       color: (s) => Text.red(s) },
};

/** id del gremio del jugador (por su stage) o null */
global.gremioDe = (player) => {
  try {
    for (var id in global.GREMIO_ESTILO) if (player.stages.has('gremio_' + id)) return id;
  } catch (e) { /* los stages aun no estan listos (inicio de sesion): sin etiqueta por ahora */ }
  return null;
};

/** "[Gremio] " en el color del gremio + el nombre tal cual (el padre vacio evita que el nombre herede el color de la etiqueta) */
global.nombreConGremio = (id, nombre) => Text.empty().append(global.GREMIO_ESTILO[id].color('[' + global.GREMIO_ESTILO[id].nombre + '] ')).append(nombre);

// Nombre en el chat, en las muertes y sobre la cabeza
ForgeEvents.onEvent('net.minecraftforge.event.entity.player.PlayerEvent$NameFormat', (event) => {
  try {
    var id = global.gremioDe(event.getEntity());
    if (id) event.setDisplayname(global.nombreConGremio(id, event.getDisplayname()));
  } catch (e) { console.error('[gremio_nombres] NameFormat: ' + e); }
});

// Nombre en la lista TAB
ForgeEvents.onEvent('net.minecraftforge.event.entity.player.PlayerEvent$TabListNameFormat', (event) => {
  try {
    var p = event.getEntity(), id = global.gremioDe(p);
    if (id) event.setDisplayName(global.nombreConGremio(id, p.getName()));
  } catch (e) { console.error('[gremio_nombres] TabListNameFormat: ' + e); }
});
