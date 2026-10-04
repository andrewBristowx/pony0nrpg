// Sincroniza los stages de KubeJS con ETIQUETAS de entidad (/tag).
// Motivo: la tarea "stage" de FTB Quests (2001.4.x) no lee los stages de KubeJS: su proveedor por defecto (EntityTagStageProvider de FTB Library)
// comprueba player.getTags(). Sin esto, ninguna mision con T.stage(...) se completa (era_10, rango_bronce, rol_<id>...).
// Se copia cada stage a una etiqueta con el mismo nombre al entrar y cada 5 segundos; /rol confirmar la pone al instante.
// Las etiquetas no se borran solas al quitar un stage: quien quite un stage (p. ej. /rol reset) quita tambien la etiqueta.
function sincronizarStages(p) {
  try {
    var todos = p.stages.getAll();
    todos.forEach((st) => { var nombre = String(st); if (!p.tags.contains(nombre)) p.addTag(nombre); });
  } catch (e) { /* stages aun no listos o jugador especial */ }
}
global.sincronizarStages = sincronizarStages;

PlayerEvents.loggedIn((event) => sincronizarStages(event.player));
PlayerEvents.tick((event) => {
  const p = event.player;
  if (p.age % 100 === 7) sincronizarStages(p);
});
