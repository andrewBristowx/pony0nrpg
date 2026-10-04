// [startup] Gremio visible: etiqueta de gremio en el nombre del jugador (chat global, lista TAB y nombre sobre la cabeza).
//   Chat global:  <[Slytheri0n] Nombre [Healer]> hola     TAB:  [Slytheri0n] Nombre [Healer]     (sin gremio/rol: solo lo que tenga)
// El rol (stage rol_<id>, que da /rol confirmar tras hablar con el maestro de rol de un pueblo) va a continuacion del nombre.
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

/** roles de combate (se eligen con un maestro de rol; stage rol_<id>) */
global.ROLES = {
  tanque:  { nombre: 'Tanque',  color: (s) => Text.aqua(s) },
  dps:     { nombre: 'DPS',     color: (s) => Text.darkRed(s) },
  healer:  { nombre: 'Healer',  color: (s) => Text.lightPurple(s) },
  soporte: { nombre: 'Soporte', color: (s) => Text.gold(s) },
};

/** id del rol del jugador (por su stage) o null */
global.rolDe = (player) => {
  try {
    for (var id in global.ROLES) if (player.stages.has('rol_' + id)) return id;
  } catch (e) { /* stages aun no listos */ }
  return null;
};

/** "[Gremio] " + nombre + " [Rol]": cada etiqueta en su color; el padre vacio evita que el nombre herede el color de una etiqueta */
global.nombreDecorado = (player, base) => {
  var g = global.gremioDe(player), r = global.rolDe(player);
  if (!g && !r) return base;
  var c = Text.empty();
  if (g) c.append(global.GREMIO_ESTILO[g].color('[' + global.GREMIO_ESTILO[g].nombre + '] '));
  c.append(base);
  if (r) c.append(Text.of(' ')).append(global.ROLES[r].color('[' + global.ROLES[r].nombre + ']'));
  return c;
};

// Nombre en el chat, en las muertes y sobre la cabeza
ForgeEvents.onEvent('net.minecraftforge.event.entity.player.PlayerEvent$NameFormat', (event) => {
  try {
    var p = event.getEntity();
    event.setDisplayname(global.nombreDecorado(p, event.getDisplayname()));
  } catch (e) { console.error('[gremio_nombres] NameFormat: ' + e); }
});

// Nombre en la lista TAB
ForgeEvents.onEvent('net.minecraftforge.event.entity.player.PlayerEvent$TabListNameFormat', (event) => {
  try {
    var p = event.getEntity();
    event.setDisplayName(global.nombreDecorado(p, p.getName()));
  } catch (e) { console.error('[gremio_nombres] TabListNameFormat: ' + e); }
});
