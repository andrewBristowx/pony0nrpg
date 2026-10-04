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

## Ideas pendientes
- Rangos (Novato → Maestro) como tercera etiqueta; PvP prohibido dentro del bazar aunque haya guerra; tiendas de Lightman's Currency / NPC en los puestos del bazar; reinicio programado del mundo de aventura.
