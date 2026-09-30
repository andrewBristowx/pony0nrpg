# 01 — Sistemas: del plan a la implementación

Leyenda: ✅ lo cubre un mod tal cual · 🔧 hay que construirlo nosotros (KubeJS, datapacks, configs, construcción) · ⚠️ cobertura parcial · ❌ sin solución hoy.

Orden de prioridad del plan original: progresión clara → misiones que enseñen → RPG → exploración → Create → tecnología → magia → dungeons → bosses → dimensiones → endgame → rendimiento. Cuando dos decisiones chocan, gana la de la izquierda.

## Núcleo

| # | Sistema del plan | Solución | Estado |
|---|---|---|---|
| 1 | Misiones como manual | FTB Quests. Convenciones en `docs/04`. Cada mod nuevo tiene su propio capítulo/rama introductoria. | ✅ + 🔧 (escribir las quests) |
| 3 | Nivel 1–100 | Pufferfish's Skills: nivel global, XP por fuentes (matar, minar, explorar, quests). Curva configurable. | ✅ |
| 4 | Atributos (Vitalidad, Fuerza…) | Nodos de Pufferfish que dan atributos: vida, daño, armadura, velocidad de ataque, velocidad de movimiento, y atributos de Iron's Spells (maná, poder de hechizo). Ver mapa abajo. | ✅ |
| 5 | Árboles de clase combinables | Un *category* de Pufferfish por clase (Guerrero, Arquero, Mago, Ingeniero, Asesino). Puntos compartidos → el jugador reparte entre árboles y combina. | ✅ + 🔧 (diseñar los árboles) |
| 20 | Ascensión post-100 | Categoría extra de Pufferfish "Ascensión" que se desbloquea al nivel 100, con puntos propios; recompensas por KubeJS. | 🔧 |

**Mapa de atributos**

| Atributo del plan | Implementación |
|---|---|
| ❤️ Vitalidad | Vida máxima |
| ⚔️ Fuerza | Daño de ataque |
| 🛡️ Defensa | Armadura / dureza |
| 🏹 Destreza | Velocidad de ataque y daño a distancia |
| ✨ Inteligencia | Maná máximo, reducción de cooldown |
| 🔮 Poder mágico | Poder de hechizo |
| ⛏️ Minería | Velocidad de minado |
| 🏃 Velocidad | Velocidad de movimiento |

Los identificadores exactos de atributo se fijan al montar los árboles (dependen de las versiones de Apothic Attributes e Iron's). La hoja "JUGADOR NIVEL 35" del plan se muestra con el propio panel de Pufferfish más los tooltips de Apothic Attributes.

## Combate, loot y magia

| # | Sistema | Solución | Estado |
|---|---|---|---|
| 13 | Rarezas (común → mítico) | Apotheosis: rarezas de equipo con afijos. Base: común/poco común/raro/épico/mítico son nativas; **legendario y mítico como tiers propios** se definen por datapack. | ✅ + 🔧 |
| 13 | Habilidades únicas de armas legendarias ("Golpe Celestial") | Armas de Simply Swords y Artifacts como base + habilidades por datapack/KubeJS. Los legendarios "de verdad" (únicos, con nombre) serán drops fijos de bosses. | ⚠️ + 🔧 |
| 14 | Cadena de crafteo (diamante → material mágico → núcleo tecnológico → fragmento de boss → legendario) | Recetas reescritas con KubeJS. Ver `docs/03`. | 🔧 |
| — | Armas/armaduras extra | Spartan Weaponry, Simply Swords. Better Combat para el sistema de golpes. | ✅ |
| 8 | Escuelas: Fuego, Hielo, Oscuridad, Arcana | Iron's Spells: escuelas fire, ice, ender, blood, eldritch, evocation, holy, lightning, nature. Mapeo: **Fuego**=fire · **Hielo**=ice · **Oscuridad**=ender+blood+eldritch · **Arcana**=evocation+holy (escudos, buffs, teletransporte). | ✅ |
| 8 | Rituales y artefactos | Ars Nouveau (rituales, glifos, familiares) + Artifacts/Curios (objetos equipables). | ✅ |
| 12 | Roles Tanque/Healer/DPS/Soporte | Sin mod de clases de grupo. Tanque = tanque de atributos (Vitalidad/Defensa) + escudos; Healer = escuela holy de Iron's; Soporte = buffs de evocation. Los bosses de raid harán que esos roles importen (ver abajo). | ⚠️ |

## Create y tecnología

| # | Sistema | Solución | Estado |
|---|---|---|---|
| 6 | Create + addons + trenes | Create 6.0.x + Steam 'n' Rails (trenes), Connected, Deco, Enchantment Industry, Sifting, Ironworks, Utilities, Jetpack. | ✅ |
| 7 | Electricidad | Create Crafts & Additions (motores, alternadores, cables, baterías) como puente Create → electricidad. | ✅ |
| 7 | Generación de energía, máquinas, procesamiento | Mekanism (+ Generators) para máquinas de proceso y reactores; Powah como energía intermedia. | ✅ |
| 7 | Storage y automatización avanzada | Applied Energistics 2 + Sophisticated Storage/Backpacks. | ✅ |
| 7 | Agricultura automática | Farmer's Delight + Create (sembradoras/cosechadoras mecánicas) + Mekanism (Cultivador). | ✅ |
| 7 | Robots | Mekanism Robit (nativo, limitado). Sin mod de robots dedicado hoy. | ⚠️ |
| 7 | Create y tecnología sin invalidarse | Regla de diseño: Create = **movimiento, procesamiento en cadena, trenes, logística**. Mekanism = **procesamiento multiplicador de minerales, energía densa, reactores**. AE2 = **almacenamiento/autocrafteo**. Las recetas de Mekanism avanzado piden componentes de Create (ver `docs/03`). | 🔧 |

## Mundo: exploración, mazmorras, bosses, dimensiones

| # | Sistema | Solución | Estado |
|---|---|---|---|
| 10 | Ruinas / templos | Structory, Dungeons and Taverns, Repurposed Structures, IDAS | ✅ |
| 10 | Castillos / dungeons | When Dungeons Arise, Dungeon Crawl, YUNG's Better Dungeons, Cataclysm, Ice and Fire | ✅ |
| 10 | **Mega dungeons de 30–60 min** | Twilight Forest (laberinto, torre del Lich), Cataclysm, When Dungeons Arise (estructuras grandes) cubren parte. Para cumplir 30–60 min con mecánicas propias hay que **construir 2–4 propias** (datapack de estructura + KubeJS). | ⚠️ + 🔧 |
| 11 | Bosses con fases | Cataclysm (varias fases), Mowzie's, Bosses of Mass Destruction (fases y arenas), Ice and Fire (dragones), Twilight Forest (cadena de bosses). | ✅ |
| 11 | "Dragón de las Profundidades": 4 fases con cambio de arena | Sin equivalente exacto. Se aproxima con Cataclysm/BoMD; uno o dos bosses **hechos a medida** requerirían un mod propio; queda fuera de la fase 1. | ❌ (diferido) |
| 12 | **Raid bosses de 4–8 con roles** | Sin mod. Aproximación: bosses existentes con vida escalada por jugadores cercanos (Scaling Health) + arenas propias. Mecánicas de rol reales = desarrollo propio. | ❌ → ⚠️ |
| 9 | Dimensiones | Ver tabla abajo. | ⚠️ |
| 9 | Nuevos biomas/recursos/mobs | Alex's Caves, Deeper and Darker, Twilight Forest, Aether, Blue Skies, Undergarden. | ✅ |

**Mapa de dimensiones del plan**

| Del plan | Se cubre con | Nota |
|---|---|---|
| 🌎 Mundo, 🔥 Nether, 🌌 End | Vanilla | |
| 🌿 Natural | Twilight Forest 🟡 | Cadena de bosses integrada, buena para era 6–7 |
| 🌑 Oscura | The Undergarden | |
| ☁️ (extra) Celestial | The Aether / Blue Skies | Añadida: encaja con exploración vertical |
| ❄️ Helada | Ad Astra — Glacio | Requiere cohete (tecnología) |
| 🌌 Cósmica | Ad Astra — Luna, Marte, Venus, Mercurio | Gancho perfecto con Create/tecnología |
| 🔥 Infernal | Nether ampliado (Cataclysm, IDAS, Repurposed) | No hay dimensión nueva; se sube dificultad con bosses |
| 🏜️ Desértica | ❌ | Sin mod ligero; opción: datapack de dimensión propio, o dejarla fuera |
| ☠️ Vacío | ❌ | Igual; puede ser una dimensión de datapack para el endgame |

## Servidor y sociedad

| # | Sistema | Solución | Estado |
|---|---|---|---|
| 15 | Ciudad de spawn | Construcción a mano (o schematic) + Easy NPC en cada edificio. Ninguna herramienta la genera sola. | 🔧 |
| 15 | NPC que explican sistemas | Easy NPC (diálogos, comandos, acciones por clic). | ✅ |
| 16 | Gremio de aventureros con rangos | Capítulos de FTB Quests "Gremio" con rango en stage (`rank_bronce`…) que desbloquea misiones más difíciles. Rangos por equipo de jugador. | 🔧 |
| 17 | Economía | Lightman's Currency: monedas, cajeros, tiendas de jugador, subastas, cuentas de banco (incluye cuentas de equipo). Recompensas de quests/dungeons/bosses en monedas por KubeJS/FTB Quests. | ✅ |
| 17 | Jobs | Sin mod fiable en 1.20.1 Forge. Se sustituye por recompensas de moneda desde XP de PMMO/quests repetibles. | ❌ → 🔧 |
| 18 | Guilds con base, nivel, banco, misiones | FTB Teams (miembros y roles) + FTB Chunks (base protegida) + cuenta de banco de equipo de Lightman's + misiones de equipo de FTB Quests. **Nivel de gremio** = stage por KubeJS al completar hitos. | ⚠️ + 🔧 |
| 18 | Arenas | Estructura construida + comandos/NPC; PvP opcional con FTB Chunks. | 🔧 |

## Resumen de huecos

Lo que **no** existe hoy y hay que decidir si construir, diferir o descartar:

1. Raid bosses con roles reales (Tanque/Healer/DPS/Soporte).
2. Boss "Dragón de las Profundidades" con cambio de arena en 4 fases.
3. Dimensiones Desértica y del Vacío.
4. Mega dungeons de 30–60 min con mecánicas propias (parcial con mods).
5. Jobs.
6. Niveles y banco de gremio (parcial; requiere lógica propia).

Propuesta: fase 1 sin estos seis (el pack es jugable sin ellos), y cada uno pasa a un mini-proyecto de fase 3 con su propio diseño.
