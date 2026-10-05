// [startup] Gremio visible: etiqueta de gremio en el nombre del jugador (chat global, lista TAB y nombre sobre la cabeza).
//   Chat global:  <[Slytheri0n] Nombre [Healer · Nv 37]> hola     TAB:  [Slytheri0n] Nombre [Healer · Nv 37]     (sin gremio/rol: solo lo que tenga)
// El rol (stage rol_<id>, que da /rol confirmar tras hablar con el maestro de rol de un pueblo) va a continuacion del nombre, con el nivel de Habilidades
// (se actualiza solo: server_scripts/habilidades.js refresca el nombre cuando el nivel cambia).
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

/** nivel de Habilidades (1-100) de la clase del jugador, leido de Pufferfish's Skills (categoria habilidades_<clase>); 0 si no tiene clase o no se puede leer.
 *  `clase` es opcional (solo lo usan las pruebas). Solo funciona con jugadores del servidor: en el cliente devuelve 0. */
global.nivelDe = (player, clase) => {
  try {
    var c = clase || null;
    if (!c) {
      var clases = ['guerrero', 'arquero', 'mago', 'asesino', 'ingeniero'];
      for (var i = 0; i < clases.length; i++) if (player.stages.has('origen_' + clases[i])) { c = clases[i]; break; }
    }
    if (!c) return 0;
    var cat = Java.loadClass('net.puffish.skillsmod.api.SkillsAPI').getCategory(new ResourceLocation('puffish_skills:habilidades_' + c));
    if (!cat.isPresent()) return 0;
    var exp = cat.get().getExperience();
    return exp.isPresent() ? Math.max(1, Number(exp.get().getLevel(player))) : 0;
  } catch (e) { return 0; }
};

/** "[Gremio] " + nombre + " [Rol · Nv N]": cada etiqueta en su color; el padre vacio evita que el nombre herede el color de una etiqueta */
global.nombreDecorado = (player, base) => {
  var g = global.gremioDe(player), r = global.rolDe(player), lv = global.nivelDe(player);
  if (!g && !r && !lv) return base;
  var c = Text.empty();
  if (g) c.append(global.GREMIO_ESTILO[g].color('[' + global.GREMIO_ESTILO[g].nombre + '] '));
  c.append(base);
  if (r) c.append(Text.of(' ')).append(global.ROLES[r].color('[' + global.ROLES[r].nombre + (lv ? ' · Nv ' + lv : '') + ']'));
  else if (lv) c.append(Text.of(' ')).append(Text.gray('[Nv ' + lv + ']'));
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
