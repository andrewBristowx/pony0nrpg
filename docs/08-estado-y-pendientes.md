# 08 — Estado y pendientes (para seguir el trabajo en local)

## Cómo seguir en tu PC
1. `git clone https://github.com/andrewBristowx/pony0nrpg` y abre Claude Code en la carpeta: lee `CLAUDE.md` solo y tiene el contexto y las reglas.
2. Instala Node 18+, Go (para packwiz) y Java 17. Pruebas de scripts: `ACEPTO_EULA=1 tools/test-kubejs.sh`.
3. Rama de trabajo nueva; cuando funcione: fast-forward a `gremios` (servidor) y `main` (jugadores) y `packwiz refresh` antes.

## Hecho
- Gremios, regiones con límite, guerra, PvP por reglas, pueblos de 129x129, bazar neutral en (0,0), `/pueblo ir|colocar|estado`, `/limite ir`.
- Chat global y de gremio; TAB con cabecera "Servidor de Pony0n", gremios y "Gracias holy.gg"; etiqueta de gremio en chat/TAB.
- `start.sh`: Forge automático, sincronización de `kubejs/` por SHA-256, scripts ajenos apartados, limpieza de `archive-*.tar.gz`.

## En curso: roles de combate (Tanque, DPS, Healer, Soporte)
Diseño: ver el comentario de cabecera de `kubejs/server_scripts/gremio_roles.js`. Resumen:
- 4 maestros de rol por pueblo (Easy NPC, skins de caballero `KNIGHT_01/02`, `SECURITY_01`, `MAGE_01`) junto a la plaza; clic -> `/rol hablar <rol> @initiator` -> explica el rol y pide confirmar -> `/rol confirmar <rol>` pone el stage `rol_<id>` (irreversible), lo muestra tras el nombre y da el kit de la clase.
- Roles por clase (editable en `ROLES_POR_CLASE`): guerrero tanque/dps, arquero dps/soporte, mago healer/dps, asesino dps, ingeniero soporte/dps.
- Capítulos de FTB Quests por rol (`tools/quests/chapters/12_roles.mjs`): misiones progresivas que llaman a `/rol recompensa <rol> <nivel> {p}` (objetos y atributos según clase y rol; tablas `RECOMPENSAS_ROL`/`MEJORAS_ROL`).
- Pendiente de terminar: colocar los NPC desde `gremios.js` (`recolocarNpcsRol`), tablas de recompensas con IDs verificados, capítulos de misiones, probar el spawn de Easy NPC con `tools/test-kubejs.sh`.

## Ideas pendientes
- Rangos (Novato → Maestro) como segunda etiqueta; PvP prohibido dentro del bazar aunque haya guerra; tiendas de Lightman's Currency / NPC en los puestos del bazar; reinicio programado del mundo de aventura.
