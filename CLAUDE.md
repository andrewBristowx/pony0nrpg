# Pony0n RPG — notas para Claude Code (leer antes de tocar nada)

Modpack Minecraft 1.20.1 Forge 47.4.10 con **packwiz** (repo `andrewBristowx/pony0nrpg`). Cliente: Prism con packwiz-installer; servidor: HolyHosting con `server/start.sh`.
Hablar con el usuario en **español**. El usuario es el dueño del servidor; no tiene acceso a la consola de este entorno: te manda `crash-*.txt`, `latest.log`, capturas.

## Ramas y despliegue
- El servidor sigue la rama indicada en `pack_branch.txt` (hoy **`gremios`**); los jugadores de Prism siguen **`main`**. Mantener `main` y `gremios` iguales (fast-forward) salvo que se pida lo contrario.
- Tras cambiar archivos del pack: `packwiz refresh` (instalar: `go install github.com/packwiz/packwiz@latest`) y commitear `index.toml` + `pack.toml`.
- `start.sh` se auto-actualiza desde `main`, compara los archivos de `kubejs/` con `index.toml` (SHA-256), aparta scripts que no estén en el índice a `kubejs/_fuera_del_pack/` e instala Forge solo. `raw.githubusercontent.com` cachea ~5 min tras un push.
- No subir trabajo a medias a `main`/`gremios`: el servidor lo descarga en el siguiente reinicio. Probar primero en una rama propia.

## Reglas aprendidas (cada una costó un crash)
1. **Nunca** `level.getChunk(...)` ni `ChunkGenerator.getBaseHeight(...)` en el hilo del servidor desde KubeJS: bloquea el tick y el watchdog mata el servidor (60 s). Para cargar chunks: `/forceload add` + sondear `level.hasChunk(cx, cz)` con `server.scheduleInTicks`. Para elegir terreno: solo bioma (`biomaApto`).
2. **Rhino (KubeJS 2001.6.5)**: `const`/`let` dentro de un `try { }` da "redeclaration of var". Dentro de `try` usar `var`. Tampoco `const` en bucles.
3. Los archivos de `kubejs/data` y `kubejs/assets` van en minúsculas (KubeJS aborta si ve una mayúscula). Los `archive-*.tar.gz` del panel dentro de `kubejs/` rompen el arranque (start.sh los borra).
4. Scripts de arranque (`startup_scripts`) corren también en el cliente: todo en `try/catch` y sin depender de datos del servidor.
5. Cada archivo de script tiene su propio ámbito; compartir con `global.algo`. **Nunca guardar `null` en `global`** (Rhino lanza NullPointerException al leerlo): usar `false`/`undefined`.
6. **FTB Quests 2001.4.x**: el tipo de tarea de stage se llama `gamestage` (con `stage` se carga como tarea `custom` que nunca se completa), y **lee etiquetas de entidad** (`/tag`), no los stages de KubeJS: `server_scripts/stages_tags.js` copia los stages a etiquetas. Las tareas de una misión no avanzan si sus dependencias no están completas. Un capítulo se oculta si todas sus misiones son invisibles (`invisible` + `hideUntilDepsVisible` en el DSL).

7. **Rhino + Java sobrecargado**: `SpellRegistry.getSpell("irons_spellbooks:x")` falla con "choice of Java method ... is ambiguous" (String/ResourceLocation); llama con la firma: `Registro['getSpell(java.lang.String)'](id)`.
8. **Hechizos solo por progresión**: no añadir pergaminos a cofres/recetas; se dan desde `HECHIZOS_ROL` (ver `docs/08`). Un mod nuevo que añada botín con pergaminos hay que anularlo igual (`tools/gen-no-scrolls.mjs`).

## Cómo probar sin el hosting
`ACEPTO_EULA=1 tools/test-kubejs.sh` levanta un Forge mínimo (KubeJS + Rhino + Architectury + Easy NPC) con los scripts del repo y un `tools/test/zz_test.js` (jugador simulado `FakePlayer`: nombre, TAB, funciones). No sirve para chat real ni clics de NPC: eso se prueba en el servidor y se pide el log. Para probar hechizos con Iron's Spells: `tools/test-hechizos.sh`. Para probar FTB Quests (carga de capítulos, visibilidad con `ServerQuestFile.INSTANCE`) añade a `mods/` del servidor de prueba los jars `ftb-quests-forge`, `ftb-library-forge` y `ftb-teams-forge` de `https://maven.ftb.dev/releases/dev/ftb/mods/` y copia `config/ftbquests` (ver `tools/test/zz_quests.js`).

## Herramientas (node, sin dependencias)
- `tools/village/gen-village.mjs` (pueblos), `tools/village/gen-bazar.mjs` (bazar neutral), `validate.mjs` (bloques válidos para 1.20.1 contra el cliente de Minecraft), `preview.mjs` (vista isométrica PNG). Las dos últimas necesitan el jar de cliente en `%APPDATA%/PrismLauncher/libraries/com/mojang/minecraft/1.20.1/minecraft-1.20.1-client.jar` (o `APPDATA=<dir>` con esa ruta).
- `tools/gen-quests.mjs` genera `config/ftbquests` desde `tools/quests/chapters/*.mjs` (necesita `tools/.ids.json`: `node tools/build-id-index.mjs`). `gen-skills.mjs`, `gen-origins.mjs` análogos.

## Estado de gremios (docs/07)
Hecho: gremios, regiones, guerra, pueblos, bazar, `/pueblo`, `/limite`, chat global y de gremio (`/gc`, `/g`, `/chat`), TAB, roles, habilidades por clase (`habilidades_<clase>`, XP con `/skillxp`). Ver `docs/08-estado-y-pendientes.md`.
