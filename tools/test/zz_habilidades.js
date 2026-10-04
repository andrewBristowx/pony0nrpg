// Prueba: el servidor carga el script de habilidades y Pufferfish's Skills carga las categorias por clase (ver el log: lineas de puffish_skills).
ServerEvents.loaded((event) => {
  const s = event.server;
  s.scheduleInTicks(100, () => s.runCommandSilent('stop'));
  s.scheduleInTicks(60, () => { console.info('TEST habilidades.js cargado: desbloquearHabilidades=' + (typeof global.desbloquearHabilidades)); });
});
