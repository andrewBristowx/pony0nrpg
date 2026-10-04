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

## Hecho: árboles de habilidades hasta nivel 100 y equipo de rol con atributos
- **Habilidades** (`tools/gen-skills.mjs`, categorías `habilidades_<clase>`): 10 nodos de Fundamentos + caminos de 30 nodos con apoyos (124–161 nodos por clase) para 100 puntos (nivel 1–100, un punto por nivel): hay que elegir caminos. Los nodos valen 1x (1–10), 1,4x (11–20) y 1,8x (21–30); la cima exige 45 puntos gastados. XP por nivel: `50 + 10n + 0,6n²` (~260.000 XP hasta el 100; los jefes y las misiones dan miles). Tier III de equipo de clase: nodo 10 de cualquier camino.
- **Capítulos de rol de 16 misiones** (`12_roles.mjs`, dos filas): las 1–8 como antes; 9–16 piden jefes (Tanque y DPS: Wroughtnaut, Frostmaw, Warden, Ender Dragon, Cataclysm, Lich, dragones…) o materiales/estadísticas (Healer y Soporte, que no pueden matar jefes solos). XP de habilidades 1.200–4.700 por misión.
- **Equipo de rol con atributos** (`server_scripts/gremio_equipo.js`): objetos vanilla con NBT `AttributeModifiers` (el NBT sustituye los atributos base, así que se escriben también armadura y daño; UUID propio por pieza) según rol+clase (9 combinaciones). Cuatro tiers (Aprendiz, Veterano, Campeón, Legendario) = 4 niveles de rol cada uno: arma, peto, casco+pantalones, botas. Tanque: vida/armadura/empuje; DPS: daño/crítico/velocidad/esquive/flechas/hechizos; Healer: maná/curación/poder sagrado; Soporte: movimiento/suerte/minado. Todo se ajusta en `EQUIPO_DEF` (valores del conjunto en tier I; los tiers multiplican x1/1,9/3,2/5). Probado: 180 piezas con atributos en un servidor con el pack completo (`tools/test/zz_equipo.js`).
- Niveles 9–16 de `gremio_roles_tabla.js`: objetos extra, mejoras (las de 1–8 +50 %), pergaminos de más nivel, libros de hechizos (diamante nv 12, netherita nv 16). Los hechizos tienen un nivel máximo por hechizo (p. ej. Curación mayor y Purificar solo nivel 1: no se les sube).
- Para jugadores que ya habían completado misiones antes: un operador usa `/rol recompensa <rol> <nivel> <jugador>` (da también el equipo con atributos).
- Prueba con el pack completo: bajar los mods del servidor (126 en Modrinth + FTB de maven.ftb.dev; Twilight Forest solo está en CurseForge) a una carpeta con Forge; **neutralizar** la colocación automática de pueblos de `gremios.js` (si no, `/forceload` bloquea un mundo nuevo). `Item.of('id{nbt}')` NO interpreta el NBT: `Item.of(id)` y `stack.nbt = TagParser.parseTag(snbt)`.

## Ideas pendientes
- Rangos (Novato → Maestro) como tercera etiqueta; PvP prohibido dentro del bazar aunque haya guerra; tiendas de Lightman's Currency / NPC en los puestos del bazar; reinicio programado del mundo de aventura.
