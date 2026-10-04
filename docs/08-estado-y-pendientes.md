# 08 — Estado y pendientes (para seguir el trabajo en local)

## Cómo seguir en tu PC
1. `git clone https://github.com/andrewBristowx/pony0nrpg` y abre Claude Code en la carpeta: lee `CLAUDE.md` solo y tiene el contexto y las reglas.
2. Instala Node 18+, Go (para packwiz) y Java 17. Pruebas de scripts: `ACEPTO_EULA=1 tools/test-kubejs.sh`.
3. Rama de trabajo nueva; cuando funcione: fast-forward a `gremios` (servidor) y `main` (jugadores) y `packwiz refresh` antes.

## Hecho
- Gremios, regiones con límite, guerra, PvP por reglas, pueblos de 129x129, bazar neutral en (0,0), `/pueblo ir|colocar|estado`, `/limite ir`.
- Chat global y de gremio; TAB con cabecera "Servidor de Pony0n", gremios y "Gracias holy.gg"; etiqueta de gremio en chat/TAB.
- `start.sh`: Forge automático, sincronización de `kubejs/` por SHA-256, scripts ajenos apartados, limpieza de `archive-*.tar.gz`.

## Hecho: roles de combate (Tanque, DPS, Healer, Soporte)
Ver `docs/07` sección 11. Código: `gremio_roles.js` (maestros, `/rol`), `gremio_roles_tabla.js` (recompensas por clase y rol), `gremios.js` (colocación de los NPC), `tools/quests/chapters/12_roles.mjs` (misiones).
Probado con `tools/test-kubejs.sh` y los scripts de `tools/test/` (zz_npc.js: invoca los 4 maestros; zz_roles.js: diálogo y recompensas): los NPC se guardan con su skin y su acción de clic; el diálogo y las recompensas vanilla funcionan. **Falta probar con jugadores reales** (ver docs/07 §11).

## Hecho: hechizos y habilidades SOLO por progresión
- Los hechizos de Iron's Spells solo se pueden lanzar si el jugador los **aprendió** (stage `hech_<hechizo>`); lo comprueba `class_gating.js` en `SpellPreCastEvent` (cualquier origen: libro, pergamino, espada; el comando de operador pasa). Se aprenden con `/rol recompensa` (cada misión de rol) según `HECHIZOS_ROL[rol][clase][nivel]` en `gremio_roles_tabla.js`; al aprender se entrega el pergamino y, en el nivel 0 y en niveles 4/6 (marciales), mesa de inscripción y libros de hechizos (copper/iron/gold). Los libros de hechizos ya no están bloqueados por clase.
- No hay otra fuente: los 13 modificadores de botín de Iron's están anulados (`kubejs/data/irons_spellbooks/loot_modifiers/`, generados con `tools/gen-no-scrolls.mjs`; comprobado: 0 objetos de Iron's en cofres frente a miles antes) y la receta de la forja de pergaminos se quita en `fixes.js`.
- `/hechizo` (aprendidos y por aprender), `/hechizo recibir <h>` (otro pergamino de uno aprendido), `/hechizo aprender <h> <nivel> <jugador>` (op). Nombres/descripciones en `startup_scripts/hechizos_datos.js`; las descripciones de las misiones (`12_roles.mjs`) se generan leyendo la misma tabla.
- Prueba: `ACEPTO_EULA=1 tools/test-hechizos.sh <carpeta ya preparada con test-kubejs.sh>` (baja Iron's Spells y deps). Ojo Rhino: `SpellRegistry.getSpell("...")` es ambiguo (String/ResourceLocation) → `Registro['getSpell(java.lang.String)'](id)`.
- **Limites**: sin probar con jugador real (inscribir en el libro y lanzar); `/hechizo` y el stage persistente no se pueden probar con FakePlayer. Los personajes que ya existían deben volver a ganar sus hechizos (o un op usa `/rol recompensa <rol> <nivel> <jugador>` / `/hechizo aprender`). Los cofres de las estructuras propias de Iron's no se anularon (no aparecen en el Overworld; aunque salieran, el pergamino no sirve sin aprender el hechizo).
- Fase 2 pendiente de decidir: mods de la serie RPG de Spell Engine (Rogues & Warriors, Paladins & Priests, Archers, Berserker) para habilidades de arma reales.

## Ideas pendientes
- Rangos (Novato → Maestro) como tercera etiqueta; PvP prohibido dentro del bazar aunque haya guerra; tiendas de Lightman's Currency / NPC en los puestos del bazar; reinicio programado del mundo de aventura.
