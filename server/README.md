# Servidor Pony0n RPG — mods para el hosting

**Sube a la carpeta `mods/` de tu hosting los 118 jars de [`server/mods/`](mods/)** (lista exacta en [`MODS.txt`](MODS.txt)). Para subirlos de una vez hay un zip: `dist/Pony0nRPG-server-mods.zip` (549 MB, jars planos; descomprímelo dentro de `mods/`). No hace falta instalar Forge ni nada más en tu PC.

## Además de los mods: configuración del servidor

Como el hosting no ejecuta packwiz, hay que subir **a mano** la configuración de habilidades, oficios, misiones y bloqueo de clase: `dist/Pony0nRPG-server-config.zip` (se regenera con `tools/make-server-config.ps1`). Descomprímelo en la **raíz** del servidor (crea `config/puffish_skills/`, `config/ftbquests/` y `kubejs/`). Cada vez que cambie algo de esas carpetas hay que volver a subirlo.

## Actualización automática en el hosting (Pterodactyl / HolyHosting)

El hosting puede ejecutar un `start.sh`, así que el servidor se actualiza solo con packwiz, igual que el cliente:

1. Sube a la **raíz** del servidor `server/start.sh` y `server/packwiz-installer-bootstrap.jar` (hay copias en `dist/hosting/`).
2. En el gestor de archivos, **Permisos** de `start.sh` -> 755 (ejecución).
3. **Arranque** -> Comando predefinido: *Utilizar FLAGS Customizadas (crear manualmente un start.sh…)*.
4. **Una sola vez**, antes del primer arranque: vacía la carpeta `mods/` (así no quedan jars subidos a mano que dupliquen los del instalador).
5. Reinicia. `start.sh` baja los mods/config/scripts desde `main`, calcula la memoria (75 % del límite, máx. 12 GB) y arranca Forge con flags de Aikar.

`start.sh` **se actualiza solo** desde GitHub en cada reinicio (descarga su versión nueva, comprueba que es un script válido y se relanza), así que solo hay que subirlo una vez; `packwiz-installer-bootstrap.jar` tampoco cambia. Cada reinicio deja el servidor igual que `main`: los mods quitados del pack se borran solos y los añadidos se descargan. Por eso solo se mezcla a `main` lo ya probado. Si GitHub no responde, arranca con los mods que ya había.

## Qué pedir al hosting

| | |
|---|---|
| Minecraft | **1.20.1** |
| Loader | **Forge 47.4.10** (mismo que el cliente; si el hosting solo ofrece otra 47.x cercana, funciona, pero lo ideal es igualarlo) |
| **Java** | **Java 17** (es lo que usa Forge 1.20.1 y con lo que se hizo la prueba: 17.0.15). No uses Java 8 ni Java 21 |
| RAM | Mínimo 8 GB asignados; **10–12 GB recomendados** (estimación: no se ha medido con jugadores conectados) |

Tras el primer arranque hay que aceptar la EULA de Mojang en `eula.txt` (`eula=true`); eso lo tienes que hacer tú.

## Qué se probó y qué no

- **Probado:** un servidor Forge 1.20.1 (Java 17) cargó los 118 mods hasta la comprobación de la EULA. Es decir: todos son de Forge, no falta ninguna dependencia obligatoria y no hay conflictos de módulos.
- **No probado:** la carga completa (registros, mundo, generación de estructuras, jugadores). Eso solo se ve arrancando de verdad tras aceptar la EULA. Si en el primer arranque hay un fallo, mándame el `crash-report` o `latest.log`.
- Durante la prueba aparecieron 6 dependencias que packwiz no detectó (Kotlin for Forge, Zeta, Iron's Lib, Moonlight Lib…) y un conflicto (S-Lib vs Create Crafts & Additions). Ya están corregidos en estos 108.

## Qué hay en `mods/` (118 jars)

**Contenido de juego**
- Misiones/equipos: FTB Quests, FTB Teams, FTB Library, FTB Chunks, FTB Ranks, FTB Quests Optimizer
- RPG/loot/economía/NPC: Pufferfish's Skills, Apotheosis (+ Apothic Attributes, Placebo, Patchouli), Lightman's Currency, Easy NPC, KubeJS (+ Rhino), Item Obliterator
- Combate/objetos: Better Combat, Spartan Weaponry, Simply Swords, Artifacts, Curios
- Magia: Iron's Spells 'n Spellbooks (+ Iron's Lib), Ars Nouveau
- Create: Create, Steam 'n' Rails, Connected, Deco, Crafts & Additions, Enchantment Industry (+ Dragons Plus), Sifting, Ironworks, Utilities, Jetpack, y las integraciones de Sophisticated Backpacks/Storage
- Tecnología/otros: Mekanism (+ Generators, Additions), Powah, Applied Energistics 2 (+ GuideME), Ad Astra, Farmer's Delight, Sophisticated Backpacks/Storage
- Mundo: Structory, Dungeons and Taverns, Integrated Dungeons and Structures (trae Quark y Supplementaries como dependencia), YUNG's Better Dungeons, When Dungeons Arise, Dungeon Crawl, Repurposed Structures, Alex's Caves, Deeper and Darker, Explorer's/Nature's Compass, Waystones
- Bosses/dimensiones: L_Ender's Cataclysm, Mowzie's Mobs, Bosses of Mass Destruction, Ice and Fire, The Twilight Forest, The Aether, The Undergarden
- Razas y clases: Origins (Forge), Medieval Origins Revival, Mythic Origins (+ Caelus API, Pehkui). Las clases y el resto de la capa de Origins son un datapack de KubeJS (`kubejs/data/`)
- Voz: Simple Voice Chat

**Optimización y administración de servidor**
Radium, ServerCore, AI Improvements, Noisium, Ksyxis, FerriteCore, ModernFix, Memory Leak Fix, Clumps, **Let Me Despawn** (+ Almanac), **Async Locator**, **FastFurnace**, **FastWorkbench**, Neruina, Packet Fixer, Better Compatibility Checker, spark, Chunky, LuckPerms

**Librerías** (necesarias, no aportan contenido): Architectury, GeckoLib, Citadel, Balm, Cloth Config, Botarium, Resourceful Lib/Config, Sophisticated Core, Kotlin for Forge, Zeta, Moonlight Lib, Integrated API, Lionfish API, CERBON's API, Necronomicon, Fzzy Config, Simply Tooltips, playerAnimator, MezzConfig…

## Qué NO se sube al servidor (solo cliente)

JEI, Xaero's Minimap/World Map, Mouse Tweaks, y todo el render: Embeddium (+ Extra), Oculus, Entity Culling, Cull Leaves, Dynamic FPS, BadOptimizations, los shaders y el parche Oculus–Flywheel. Los jugadores los reciben solos por Prism; **no los subas al hosting**.

## Decisiones tomadas por mí al completar el pack (revisables)

| Decisión | Motivo |
|---|---|
| JEI en lugar de EMI | Más compatible con KubeJS/FTB; se puede cambiar |
| The Aether sin Blue Skies | Pack ya muy grande |
| **Sin** Create Big Cannons | Riesgo de grifing en servidor |
| **Sin** Project MMO ni Scaling Health | Dependen de decisiones de diseño pendientes (`docs/06`, spike S1) |
| **Sin** Create Diesel Generators, Saturn, FancyMenu, Blue Skies | Opcionales o solapados |
| **Sin** Quests & Teams Fixes | Choca con Create Crafts & Additions (dos copias de Jankson); era un parche opcional |
| Radium (tipo Lithium) incluido | Puede chocar con Create; si hay problemas, es el primero que se quita |

## Actualizar mods

Si en el futuro cambian los mods, este listado se regenera desde el repo (`packwiz-installer -s server`). Si el hosting no permite ejecutar comandos, hay que volver a subir los jars: pídeme el zip actualizado.

## Ficheros de esta carpeta

- `mods/` — los jars (no se versionan en git)
- `MODS.txt` — lista exacta de jars
- `start.bat`, `start.sh`, `install-forge.bat` — solo para montar un servidor propio en tu PC; **no hacen falta en un hosting**
