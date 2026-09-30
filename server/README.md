# Servidor Pony0n RPG

Esta carpeta es el servidor dedicado. `mods/` contiene **solo** los mods que hacen falta en el servidor (los de cliente como shaders o Embeddium no se descargan). Se rellena y se actualiza sola desde el repo de GitHub con el mismo instalador que usa Prism (`-s server`).

## Puesta en marcha

Requisitos: **Java 17** (recomendado para Forge 1.20.1) y unos 8 GB de RAM libres para empezar.

1. `install-forge.bat`: instala Forge 1.20.1-47.4.10 y crea `user_jvm_args.txt` (memoria 6–8 GB + flags G1). Una sola vez.
2. `start.bat` (o `start.sh` en Linux): actualiza los mods desde GitHub y arranca. Falla el primer arranque hasta que aceptes la EULA en `eula.txt`.

Si falla la actualización de mods, el script **no** arranca el servidor.

## Mods en `mods/` ahora mismo (15)

### Optimización de servidor
| Mod | Para qué |
|---|---|
| Radium | Optimiza el motor (físicas, listas de entidades, pathfinding); equivalente a Lithium |
| ServerCore | Optimiza mobs, chunks y ticks. **Revisar su config**: puede cambiar el comportamiento de algunos mobs |
| AI Improvements | Reduce el coste de la IA de mobs |
| Noisium | Genera el terreno más rápido |
| Ksyxis | Acelera la carga del mundo al arrancar |
| FerriteCore | Menos memoria RAM |
| ModernFix | Arranque más rápido y menos RAM |
| Memory Leak Fix | Corrige fugas de memoria |
| Clumps | Agrupa orbes de experiencia (menos entidades) |
| Neruina | Evita que una entidad/bloque "roto" tumbe el servidor |

### Diagnóstico, red y administración
| Mod | Para qué |
|---|---|
| spark | Perfilado: `/spark profiler`, TPS y MSPT |
| Chunky | Pregenerar el mundo (`/chunky radius 5000`, `/chunky start`) |
| Packet Fixer | Evita desconexiones por paquetes grandes en packs con muchos mods |
| Better Compatibility Checker | Avisa al jugador si su cliente no coincide con el servidor |
| LuckPerms | Permisos y rangos |

## Qué falta

El contenido de juego (FTB Quests, Create, Iron's, estructuras, bosses…) entra en las fases 1 y 2; cada mod que sea de servidor aparecerá aquí al ejecutar `start.bat`. Lo que sí se mantiene aparte, sin versionar: mundo, `eula.txt`, `server.properties`, `ops.json`, `whitelist.json`, `logs/`.

## Notas

- `mods/` no se sube a git; se descarga con el instalador.
- Ningún mod de esta carpeta se ha probado aún en un servidor dedicado arrancado (criterio 7 de `docs/06`). Eso se hace al primer arranque real.
- Perfilar con spark antes y después de añadir cada bloque de mods.
