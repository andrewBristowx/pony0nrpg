# Pony0n RPG — Minecraft 1.20.1 Forge

Servidor y modpack de **RPG + aventura + exploración + Create + tecnología + magia**, donde las misiones (FTB Quests) funcionan como manual interactivo del pack.

**Estado: fase de diseño.** No hay mods instalados todavía. Este repositorio contiene el plan; el pack packwiz se inicializa en la fase 1 (ver `docs/05-infra-packwiz.md`).

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Versión | Minecraft **1.20.1**, **Forge** (línea 47.x) |
| Gestión del pack | **packwiz** en un repo de GitHub |
| Cliente | **Prism Launcher** con `packwiz-installer-bootstrap` como pre-launch: se auto-actualiza en cada arranque desde GitHub |
| Servidor | Servidor dedicado que ejecuta el mismo installer con `-s server` |
| Misiones | FTB Quests (equipos con FTB Teams) |
| Nivel/clases/atributos | Pufferfish's Skills (árboles de habilidades por clase, atributos como recompensa) |
| Loot RPG | Apotheosis (rarezas y afijos) |
| Combate | Better Combat (no Epic Fight, ver `docs/02-mods.md`) |
| Magia | Iron's Spells 'n Spellbooks (combate) + Ars Nouveau (rituales y magia utilitaria) |
| Economía | Lightman's Currency |
| NPC | Easy NPC |

## Índice

1. [`docs/01-sistemas.md`](docs/01-sistemas.md) — cada sección del plan original → qué mod/sistema la cubre, qué es trabajo propio y qué queda sin cubrir.
2. [`docs/02-mods.md`](docs/02-mods.md) — matriz de mods: rol, etapa, versión verificada, lado (cliente/servidor), riesgos. Incluye los descartados y por qué.
3. [`docs/03-progresion.md`](docs/03-progresion.md) — curva de niveles 1–100, eras/capítulos, cadena de bloqueo de objetos y dimensiones, Ascensión.
4. [`docs/04-misiones.md`](docs/04-misiones.md) — convenciones de misiones, esqueleto de los 10 capítulos, capítulos 1 y 4 desarrollados.
5. [`docs/05-infra-packwiz.md`](docs/05-infra-packwiz.md) — Prism + packwiz + GitHub, flujo de actualización, servidor.
6. [`docs/06-validacion-y-riesgos.md`](docs/06-validacion-y-riesgos.md) — los 8 criterios de admisión de un mod, prototipos pendientes (spikes), riesgos abiertos.

## Qué está verificado y qué no

- **Verificado** (API de Modrinth, 2026-09-29): que cada mod marcado ✅ en `docs/02-mods.md` tiene versión publicada para **1.20.1 + Forge**, y su lado cliente/servidor declarado.
- **No verificado**: compatibilidad real entre mods, balance, rendimiento y comportamiento en servidor dedicado. Eso se comprueba en la fase de prototipo (`docs/06`), no se asume.
- Los mods que solo están en CurseForge (FTB Quests/Teams/Library/Chunks/Ranks, Twilight Forest) están marcados 🟡: existen para 1.20.1 Forge, pero no pude comprobarlos por API; se confirman al hacer `packwiz curseforge add`.
