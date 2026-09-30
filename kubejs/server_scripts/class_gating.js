// [server] Parte de servidor del bloqueo de equipo por clase. La lógica y las tablas están en
// startup_scripts/class_gating.js (global.CG); ese archivo solo se recarga al reiniciar el juego.
const CG = global.CG;

// Usar el objeto (clic derecho: grimorios, bastones, pergaminos, arcos, ballestas...)
ItemEvents.rightClicked((event) => {
  const rule = CG.ruleOf(event.item);
  if (rule && !CG.isCreative(event.player) && !CG.allowed(event.player, rule)) {
    CG.deny(event.player, rule);
    event.cancel();
  }
});

// Armaduras: cada segundo se comprueba lo equipado; lo que no se pueda usar vuelve al inventario
const EquipmentSlot = Java.loadClass('net.minecraft.world.entity.EquipmentSlot');
const ARMOR_SLOTS = [EquipmentSlot.HEAD, EquipmentSlot.CHEST, EquipmentSlot.LEGS, EquipmentSlot.FEET];
PlayerEvents.tick((event) => {
  const player = event.player;
  if (player.age % 20 !== 0 || CG.isCreative(player)) return;
  for (let i = 0; i < ARMOR_SLOTS.length; i++) {
    const stack = player.getItemBySlot(ARMOR_SLOTS[i]);
    const rule = CG.ruleOf(stack);
    if (rule && !CG.allowed(player, rule)) {
      const copy = stack.copy();
      player.setItemSlot(ARMOR_SLOTS[i], Item.empty);
      player.give(copy);
      CG.deny(player, rule);
    }
  }
});
