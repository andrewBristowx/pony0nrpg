# 02 — Matriz de mods

> **Estado real del pack (2026-09-29):** los mods de esta matriz ya están añadidos a packwiz, salvo los marcados como excluidos en  (Create Big Cannons, Project MMO, Scaling Health, Diesel Generators, Saturn, FancyMenu, Blue Skies) y con estas decisiones: JEI en lugar de EMI, Aether sin Blue Skies. Se retiró Quests & Teams Fixes por un conflicto con Create Crafts & Additions. Hay 124 entradas en  (contenido + dependencias + optimización) y 108 jars van al servidor. Un arranque de prueba en servidor Forge 1.20.1 con Java 17 cargó todos los mods hasta la EULA; la carga completa de mundo no está probada.


Todo para **Minecraft 1.20.1 + Forge**.

- ✅ = versión 1.20.1 Forge confirmada en Modrinth el 2026-09-29 (se muestra la última versión vista; el pack fijará la que se pruebe).
- 🟡 = existe para 1.20.1 Forge pero solo en CurseForge; sin verificar por API.
- **Lado**: S = servidor + cliente, C = solo cliente, S* = solo servidor.
- **Etapa** = era del plan (1–10) en la que el jugador *empieza a tocar* el mod, no cuándo se instala. Todo se instala desde el principio; la etapa se impone con recetas y bloqueos (`docs/03`).
- Las dependencias (Geckolib, Curios, Balm, Cloth Config, Kotlin for Forge, etc.) las resuelve packwiz y no se listan aparte, salvo las que conviene conocer.

Nada de esto significa "compatible": eso se comprueba en el prototipo (`docs/06`).

## Núcleo: misiones, RPG, economía

| Mod | Versión | Rol | Etapa | Lado | Notas / riesgo |
|---|---|---|---|---|---|
| FTB Quests 🟡 | 2001.x | Misiones | 1 | S | Corazón del pack. |
| FTB Library / FTB Teams 🟡 | 2001.x | Dependencias / equipos | 1 | S | Equipos = gremios y progreso compartido. |
| Architectury API ✅ | 9.2.14 | Dep. de FTB | 1 | S | |
| FTB Quests Optimizer ✅ | 2.1.0 | Rendimiento de quests | 1 | S* | Recomendado con muchas quests. |
| Quests & Teams Fixes ✅ | 1.0.2 | Correcciones | 1 | S | Confirmar si sigue haciendo falta con las versiones finales. |
| FTB Chunks 🟡 | 2001.x | Claims / bases | 1 | S | Integra con FTB Teams. |
| Pufferfish's Skills ✅ | 0.19.1 | Nivel, árboles de clase, atributos | 1 | S | Slug de Modrinth: `skills`. Es un motor: los árboles hay que diseñarlos. |
| Project MMO ✅ | 1.7.43 | Skills secundarias y requisitos por nivel | 3 | S | **Condicional**: solo si el spike S1 (docs/06) confirma que no choca con Pufferfish. |
| Lightman's Currency ✅ | 2.3.0.5 | Economía, tiendas, banco | 1 | S | Cuentas de equipo para bancos de gremio. |
| Easy NPC ✅ | 7.13.1 | NPCs con diálogo | 1 | S | Spawn y gremio. |
| LuckPerms ✅ | 5.4.102 | Permisos | — | S* | Rangos de admin/moderación. |
| KubeJS ✅ + Rhino ✅ | 2001.6.5 | Recetas, stages, lógica propia | 1 | S | Toda la cadena de bloqueo depende de esto. |
| Item Obliterator ✅ | 2.3.1 | Prohibir objetos | — | S | Solo para lo que no se quiera ver nunca. |

## Combate y loot

| Mod | Versión | Rol | Etapa | Lado | Notas / riesgo |
|---|---|---|---|---|---|
| Apotheosis ✅ | 7.4.8 | Rarezas, afijos, mazmorras con jefes, encantamientos | 2 | S | Cambia mucho el encantado. Necesita Placebo ✅ 8.6.3 y Apothic Attributes ✅ 1.3.7. |
| Better Combat ✅ | 1.9.0 | Animaciones/golpes de arma | 3 | S | Elegido sobre Epic Fight (ver "Descartados"). |
| Spartan Weaponry ✅ | 3.2.1 | Muchas armas por tiers | 2 | S | Compatible con Better Combat. |
| Simply Swords ✅ | 1.70.2 | Espadas únicas con habilidades | 3 | S | Base para legendarios. |
| Artifacts ✅ | 9.5.19 | Objetos equipables con efectos | 3 | S | Vía Curios. Versión base de "artefactos". |
| Curios API ✅ | 5.14.1 | Ranuras de accesorios | 1 | S | |
| Scaling Health ✅ | 8.0.2 | Escalar vida de mobs por jugadores | 9 | S | Opcional. Para raids; riesgo de balance. Se decide en fase 3. |

## Magia

| Mod | Versión | Rol | Etapa | Lado | Notas / riesgo |
|---|---|---|---|---|---|
| Iron's Spells 'n Spellbooks ✅ | 3.16.3 | Escuelas de combate, libros, maná | 6 | S | Sistema principal de hechizos. |
| Ars Nouveau ✅ | 4.12.7 | Glifos, rituales, familiares | 6 | S | Riesgo: dos sistemas de magia. Frontera: Iron's = combate; Ars = utilidad, rituales, crafteo. |

## Create y tecnología

| Mod | Versión | Rol | Etapa | Lado | Notas / riesgo |
|---|---|---|---|---|---|
| Create ✅ | 6.0.8 | Núcleo mecánico | 4 | S | |
| Create: Steam 'n' Rails ✅ | 1.7.3 | Trenes | 4 | S | |
| Create: Connected ✅ | 1.2.3 | Piezas extra | 4 | S | |
| Create Deco ✅ | 2.0.3 | Decoración | 4 | S | Barato en balance. |
| Create Crafts & Additions ✅ | 1.3.3 | Electricidad | 5 | S | Puente Create → energía. |
| Create: Enchantment Industry ✅ | 2.5.4 | Encantamiento automatizado | 6 | S | Puente Create ↔ magia. |
| Create Sifting ✅ | 1.8.6 | Tamices | 4 | S | Mena y materiales tempranos. |
| Create: Ironworks ✅ | 3.5.0 | Piezas metal | 4 | S | Confirmar dependencia de Create 6. |
| Create Utilities ✅ | 0.3.2 | QoL | 4 | S | |
| Create Jetpack ✅ | 4.4.6 | Jetpack | 5 | S | Cuidado con la exploración temprana. |
| Create: Diesel Generators ✅ | 1.3.12 | Combustible | 5 | S | Opcional. |
| Create Big Cannons ✅ | 5.11.4 | Cañones | 7 | S | **Riesgo de grifing en servidor**; opcional. |
| Mekanism ✅ + Generators ✅ + Additions ✅ | 10.4.16 | Procesamiento, energía, reactores | 5 | S | |
| Powah ✅ | 5.0.11 | Energía intermedia | 5 | S | Puede solaparse con Mekanism/CCA. |
| Applied Energistics 2 ✅ | 15.4.11 | Almacenamiento/autocrafteo | 5 | S | |
| Sophisticated Backpacks + Storage ✅ | 3.26.6 / 1.5.0 | Mochilas y cofres | 2 | S | Con integración Create. |
| Ad Astra ✅ | 1.15.21 | Espacio (Luna, Marte, Venus, Mercurio, Glacio) | 8 | S | Dimensiones "cósmica" y "helada". |
| Farmer's Delight ✅ | 1.3.4 | Cocina y agricultura | 1 | S | |

## Mundo: estructuras y exploración

| Mod | Versión | Rol | Etapa | Lado | Notas / riesgo |
|---|---|---|---|---|---|
| Structory ✅ | 1.3.5 | Ruinas pequeñas | 1–2 | S | |
| Dungeons and Taverns ✅ | 3.0.3 | Estructuras variadas | 2 | S | |
| Integrated Dungeons and Structures ✅ | 1.13.0 | Templos/mazmorras medias | 3 | S | |
| YUNG's API + Better Dungeons ✅ | 4.0.6 / 4.0.4 | Mazmorras vanilla mejoradas | 2–3 | S | |
| When Dungeons Arise ✅ | 2.1.58 | Estructuras grandes | 7 | S | Alto coste de worldgen. Candidato a "mega". |
| Dungeon Crawl ✅ | 2.3.15 | Dungeons procedurales | 3 | S | Puede solaparse con IDAS / WDA. |
| Repurposed Structures ✅ | 7.1.25 | Variantes por bioma | 2 | S | |
| Alex's Caves ✅ | 2.0.2 | Cuevas de bioma con mobs propios | 3 | S | Mucho mob nuevo; bloquear con etapa. |
| Deeper and Darker ✅ | 1.3.3 | Ampliación del Deep Dark | 6 | S | |
| Explorer's Compass ✅ / Nature's Compass ✅ | 1.4.0 / 1.12.0 | Localizar estructuras/biomas | 2 | S | Lo que hace explorable un pack con tantas estructuras. |
| Waystones ✅ | 14.1.21 | Teletransporte | 2 | S | Restringir por quest para no matar la exploración. |

## Bosses y dimensiones

| Mod | Versión | Rol | Etapa | Lado | Notas / riesgo |
|---|---|---|---|---|---|
| L_Ender's Cataclysm ✅ | 3.31 | Bosses con fases | 7 | S | Muy difícil; vida/daño configurables. |
| Mowzie's Mobs ✅ | 1.8.2 | Bosses y mobs | 7 | S | |
| Bosses of Mass Destruction (Forge) ✅ | 1.1.2 | Bosses con arena | 7 | S | |
| Ice and Fire ✅ | 2.1.13-beta-5 | Dragones | 8 | S | Versión beta. Vigilar estabilidad. |
| Twilight Forest 🟡 | 4.3.x | Dimensión + cadena de bosses | 6 | S | Progresión propia muy buena. |
| The Aether ✅ | 1.5.2 | Dimensión celestial | 8 | S | |
| Blue Skies ✅ | 1.3.31 | Dimensiones de cielo | 8 | S | Elegir Aether *o* Blue Skies si el pack pesa. |
| The Undergarden ✅ | 0.8.14 | Dimensión oscura | 8 | S | |

## Optimización, shaders y administración (ya añadidos al pack)

Estos ya están en el repo (carpetas `mods/` y `shaderpacks/`). Lado: **C** = solo cliente, **S** = solo servidor, **A** = ambos. Los lados están fijados a mano porque packwiz los marcaba como "both" en varios mods que solo sirven en un lado.

| Mod | Versión | Rol | Lado |
|---|---|---|---|
| Embeddium | 0.3.31 | Render (equivalente a Sodium en Forge) | C |
| Embeddium (Rubidium) Extra | 0.5.4.4 | Opciones extra de vídeo para Embeddium | C |
| Oculus | 1.8.0 | Motor de shaders (equivalente a Iris) | C |
| ImmediatelyFast | 1.2.7 | Renderizado más rápido de HUD y texto | C |
| Entity Culling | 1.11.2 | No dibuja entidades ocultas | C |
| Cull Leaves | 4.1.1 (+ MidnightLib) | Hojas más baratas de dibujar | C |
| Dynamic FPS | 3.11.4 | Baja FPS con la ventana en segundo plano | C |
| BadOptimizations | 2.4.1 | Pequeñas optimizaciones de render y chunks | C |
| FerriteCore | 6.0.1 | Menos RAM | A |
| ModernFix | 5.27.83 | Arranque rápido y menos RAM | A |
| Memory Leak Fix | 1.1.5 | Corrige fugas de memoria | A |
| Clumps | 12.0.0.4 | Agrupa orbes de experiencia | A |
| Neruina | 3.3.3 | Evita crashes por entidades/bloques rotos | A |
| Packet Fixer | 3.3.2 | Evita desconexiones por paquetes grandes | A |
| Better Compatibility Checker | build.58 | Avisa si cliente y servidor no coinciden | A |
| spark | 1.10.53 | Perfilado (TPS/MSPT) | A |
| Radium | 0.12.4 | Optimiza el motor del servidor (tipo Lithium) | S |
| ServerCore | 1.5.2 | Optimiza mobs, chunks y ticks | S |
| AI Improvements | 0.5.2 | Menos coste de IA de mobs | S |
| Noisium | 2.0.1 | Generación de terreno más rápida | S |
| Ksyxis | 1.4.5 | Carga del mundo más rápida | S |
| Chunky | 1.3.146 | Pregenerar mundo | S |
| LuckPerms | 5.4.102 | Permisos | S |

**Shaders** (en `shaderpacks/`, solo cliente; no se activa ninguno por defecto, cada jugador elige en *Opciones → Shaders*):

| Pack | Versión | Perfil |
|---|---|---|
| MakeUp – Ultra Fast | 9.5f | PC modestos |
| Complementary Reimagined | r5.9.3 | Equilibrado (recomendado por defecto) |
| Complementary Unbound | r5.9.3 | Más bonito, más pesado |
| BSL Shaders | 10.1.8 | Clásico, pesado |

### Notas y riesgos

- **Versiones no siempre las más nuevas:** packwiz eligió la versión más reciente *por fecha* de Modrinth, y en ImmediatelyFast, Noisium y Better Compatibility Checker eso es una versión anterior a la más alta numerada. Es válida para 1.20.1, pero si se quiere la última hay que fijarla a mano. Se decide en el prototipo.
- **Radium (tipo Lithium) y Create:** los ports de Lithium a veces chocan con mecánicas de Create. Se prueba al añadir Create (fase 2); si falla, se quita Radium.
- **ServerCore:** revisar su configuración; cambia comportamientos de mobs.
- **Solapes evitados:** Saturn (solapa con ModernFix), Starlight (problemas de iluminación) y Fastload (lo cubre Ksyxis) no se han añadido.
- **Pendientes con shaders:** "Iris/Oculus & GeckoLib Compat" y "Iris & Oculus Flywheel Compat" arreglan entidades invisibles con shaders en mods de GeckoLib y en Create. Se probaron a añadir, pero se retiraron porque dependen de mods que aún no están en el pack (GeckoLib, Create). Se añaden en la fase 2 junto con esos mods.
- Ninguno está probado en un arranque real de cliente ni de servidor.

## Calidad de vida (pendiente de añadir)

| Mod | Versión | Rol | Lado |
|---|---|---|---|
| JEI ✅ (o EMI ✅ 1.1.24) | 15.62 | Recetas | C |
| Jade ✅ | 11.13.3 | Info de bloques | C |
| AppleSkin ✅, Mouse Tweaks ✅, Xaero's Minimap/World Map ✅ | — | QoL | C |
| Simple Voice Chat ✅ | 2.6.24 | Voz de proximidad (cooperativo) | A |
| FancyMenu ✅ | 3.9.14 | Pantalla de título/branding | C (opcional) |

Elegir **JEI o EMI**, no ambos.

## Descartados (por ahora) y por qué

| Mod | Motivo |
|---|---|
| Epic Fight | Reemplaza la animación de combate y choca con Better Combat. Más espectacular pero mayor riesgo en servidores y con otros mods de armas. Reevaluable, pero es una u otra. |
| Mine and Slash | Es un sistema RPG completo (niveles, loot, mapas) que duplicaría a Pufferfish + Apotheosis. |
| Paladins & Priests (RPG Series) | Trae Spell Engine, una tercera magia. Los roles de healer/tank se cubren con Iron's (holy) + atributos. |
| Goety | Tercera magia (oscura). La escuela de Oscuridad ya la da Iron's (ender/blood/eldritch). |
| Immersive Engineering / Thermal Expansion | Solaparían con Mekanism + Create Additions. Se pueden revisar si falta contenido industrial. |
| Botania / Blood Magic / Eidolon | Más magia; fuera de alcance hasta validar Iron's + Ars. |
| Game Stages | Innecesario mientras KubeJS + FTB Quests den stages; opción si falta bloqueo en loot/estructuras. |
| Jobs+ / The Jobs Mod | Poco uso y mantenimiento incierto en 1.20.1 Forge. |
| Custom NPCs | No está verificado para 1.20.1 Forge; Easy NPC ya lo cubre. |

## Dimensión del pack

Unos 80 mods listados; con dependencias serán bastantes más (estimación aproximada, no medida). Es un tamaño grande: el perfilado de la fase 2 decide si algo se recorta. Cada adición nueva pasa por los 8 criterios de `docs/06`.
