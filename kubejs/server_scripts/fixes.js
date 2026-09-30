// Arreglos de compatibilidad entre mods (no son de diseño).

ServerEvents.recipes((event) => {
  // Ad Astra no define la etiqueta forge:sandstone/venus_sandstone que usa esta receta de Mekanism,
  // y Mekanism avisa en el chat de cada jugador ("Broken tags in Mekanism recipes"). Se quita solo esa receta.
  event.remove({ id: 'mekanism:crushing/venus_sandstone_to_venus_sand' });
});
