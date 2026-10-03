// priority: 0
// El Overworld (mundo de construcción) solo tiene mobs de vanilla: se cancelan las apariciones naturales de mobs de otros mods.
// Los mobs de mods quedan para el mundo de aventura (fase 3). No afecta a invocaciones, huevos, spawners, comandos ni a otras dimensiones.
const MOBS_MODS_PERMITIDOS = [];                 // ids exentos, p. ej. 'alexscaves:tremorsaurus'
const RAZONES_BLOQUEADAS = ['NATURAL', 'CHUNK_GENERATION', 'PATROL', 'EVENT', 'STRUCTURE'];

EntityEvents.checkSpawn((event) => {
  const id = String(event.entity.type);
  if (id.indexOf('minecraft:') === 0 || MOBS_MODS_PERMITIDOS.indexOf(id) >= 0) return;
  if (String(event.level.dimension).indexOf('minecraft:overworld') < 0) return;
  const razon = String(event.type).toUpperCase();
  for (var i = 0; i < RAZONES_BLOQUEADAS.length; i++) {
    if (razon.indexOf(RAZONES_BLOQUEADAS[i]) >= 0) { event.cancel(); return; }
  }
});
