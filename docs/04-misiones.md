# 04 — Misiones

## Reglas de diseño

1. **Cada misión enseña algo concreto** y dice cómo hacerlo. Nada de "mata 10 zombies" sin contexto. Toda misión tiene: qué (objetivo), por qué (una línea de historia) y cómo (una pista o enlace a la receta).
2. **Cada mod tiene su introducción.** Antes de exigir usar un mod, hay una misión que lo presenta con el primer paso mínimo.
3. **Una sola cosa nueva por misión.** Si dos ideas nuevas, dos misiones.
4. **La recompensa refuerza el sistema que se acaba de aprender** (tras aprender Create: un engranaje de herramienta, no un lingote de hierro suelto).
5. **Estructura de capítulo**: 1 misión de bienvenida → 6–12 misiones lineales que enseñan → 2–4 misiones de "prueba" (aplicar lo aprendido) → 1 misión de cierre que concede el stage de la siguiente era → misiones opcionales de exploración.
6. **Progreso por equipo.** Los equipos de FTB Teams comparten misiones de grupo; las de aprendizaje son individuales.
7. **Texto breve.** El detalle largo va en un NPC/biblioteca del spawn.

## Estructura de los 10 capítulos

Cada capítulo tiene un **stage de salida** (`docs/03`), que activa recetas, dimensiones y NPC.

| Cap. | Título | Nivel | Contenido | Recompensa de cierre |
|---|---|---|---|---|
| 1 | El comienzo | 1–10 | Mesa, herramientas, refugio, comida, granja, combate básico, primer descenso a cueva | Monedas + primera arma con afijo |
| 2 | Secretos de la tierra | 10–20 | Minería, brújulas de estructura, primeras ruinas, encantar, mochila, **rama opcional Create I** | Accesorio (Artifacts) |
| 3 | El aventurero | 20–30 | Clases, árboles, primer dungeon, miniboss, entrar al gremio | Rango Bronce + arma con nombre |
| 4 | La revolución de Create | 30–40 | Engranajes → prensa → taladros → mezclador → cintas → fábrica → tren | Estación de tren + planos |
| 5 | La era tecnológica | 40–50 | Energía (Additions/Powah), Mekanism, AE2 | Núcleo tecnológico |
| 6 | El despertar de la magia | 50–60 | Escuelas de Iron's, glifos y rituales de Ars, Twilight Forest | Libro de hechizos + material mágico |
| 7 | Las tierras olvidadas | 60–70 | Estructuras grandes, primer boss de Cataclysm, mega dungeon | Fragmento de boss |
| 8 | Más allá del mundo | 70–80 | Undergarden, Aether, espacio, materiales dimensionales | Llave dimensional |
| 9 | Los grandes jefes | 80–90 | World/raid bosses, equipo legendario | Arma legendaria |
| 10 | El fin del mundo | 90–100 | Bosses finales, dimensión final, armas míticas | Ascensión I |

**Ramas transversales** (activas en paralelo, no bloquean la campaña): Gremio (rangos Novato→Maestro), Economía, Exploración (estructuras y biomas), Cooperativo (raids, fábricas compartidas, gremios).

## Ejemplo: Capítulo 1 — El comienzo

> *"El mundo ha cambiado. Antes de aventurarte demasiado lejos tendrás que aprender a sobrevivir."*

| # | Misión | Objetivo | Enseña | Recompensa |
|---|---|---|---|---|
| 1.1 | Despertar | Habla con el NPC guía del spawn | Interfaz de misiones | 50 monedas |
| 1.2 | Manos a la obra | Consigue madera | Recolectar | XP |
| 1.3 | Mesa de trabajo | Fabrica una mesa de trabajo | Crafteo básico, JEI/receta | XP + Comida |
| 1.4 | Herramientas | Pico y hacha de madera | Herramientas por tier | XP |
| 1.5 | Refugio | Construye un refugio (cama + antorchas) | Noche, mobs, respawn | Manta/cama |
| 1.6 | La primera noche | Sobrevive hasta el amanecer | Combate defensivo | Arma |
| 1.7 | Bajo tierra | Consigue hierro | Minería, niveles Y | XP |
| 1.8 | Horno | Funde hierro | Fundición | Comida |
| 1.9 | Armadura | Fabrica una pieza de hierro | Defensa | XP |
| 1.10 | Cosecha | Cultiva trigo y hornea pan | Agricultura, Farmer's Delight | Semillas |
| 1.11 | Tu primera habilidad | Abre el árbol de habilidades y gasta 1 punto | Pufferfish, nivel, atributos | XP |
| 1.12 | Arma con historia | Encuentra un objeto con rareza | Rarezas Apotheosis | Yunque |
| 1.13 | Cierre | Vuelve al spawn con hierro y comida | — | 200 monedas, stage `era_2`, primera arma con afijo |

Optativas: matar cada mob común (por bestiario), encontrar una estructura, pescar.

## Ejemplo: Capítulo 4 — El ingeniero

> *"Has aprendido a sobrevivir. Ahora es hora de descubrir el poder de las máquinas."*

| # | Misión | Objetivo | Enseña | Recompensa |
|---|---|---|---|---|
| 4.1 | Las máquinas despiertan | Habla con el ingeniero del spawn | Contexto | XP |
| 4.2 | Aleación de Andesita | Fabrica andesite alloy | Ingrediente base | 4 engranajes |
| 4.3 | Movimiento | Coloca una rueda hidráulica o molino | Fuerza rotacional (RPM/estrés) | Ejes |
| 4.4 | Transmisión | Conecta ejes y engranajes | Dirección y velocidad | Correa |
| 4.5 | Prensa mecánica | Prensa un lingote a placa | Primera máquina | XP |
| 4.6 | Taladro | Coloca un taladro mecánico | Minado automático | Taladro |
| 4.7 | Sierra | Sierra madera automática | Tala automática | Sierra |
| 4.8 | Cintas y embudos | Mueve items con cinta + embudo | Logística | Cintas |
| 4.9 | Mezclador | Mezcla una aleación | Procesamiento | Latón |
| 4.10 | Automatiza un recurso | Fábrica de hierro sin intervención | Integración | 400 monedas |
| 4.11 | Almacenamiento | Contenedor + mochila | Logística | Mochila |
| 4.12 | Línea de producción | Placas de hierro/cobre en cadena | Producción | Componentes |
| 4.13 | Estación de tren | Construye una estación | Steam 'n' Rails | Planos |
| 4.14 | Cierre | Fábrica completa + estación | — | Stage `era_create` |

Desde la misión 4.8, la recompensa incluye la **pista de la siguiente era**: los componentes de Create que luego pide Mekanism.

## Estado (fase 1)

Capítulos escritos y cargando sin errores en el juego (18 capítulos, 255 misiones): Bienvenida, los 10 capítulos de la campaña (1 El comienzo … 10 El fin del mundo) y las ramas Gremio y economía, Oficios y Ascensión (un capítulo por clase). Los textos y el equilibrio de XP/monedas son un primer borrador para revisar jugando.

Las misiones se **generan** desde `tools/quests/chapters/*.mjs` con `node tools/gen-quests.mjs` (antes, una vez: `node tools/build-id-index.mjs`). El generador valida que cada objeto, entidad, logro, estructura y bioma exista en el pack y que las dependencias existan; los IDs de misión salen de un hash de su clave, así que regenerar no borra el progreso de nadie. Salida: `config/ftbquests/quests/`.

Convenciones técnicas: la XP de Habilidades y de Oficios y los puntos de Ascensión se dan con premios de tipo comando (`/puffish_skills ...` con `{p}`), y las eras con `/kubejs stages add {p} era_X`. Las tareas de tipo "stage" leen los stages de KubeJS (que son etiquetas de entidad, las mismas que lee FTB Library).

## Herramientas para escribir las misiones

- **FTB Quests** guarda las misiones como archivos SNBT en `config/ftbquests/quests/`. Son texto: caben perfectamente en git, se revisan por diff y se pueden generar por script.
- Se propone un **script generador** (Node) que lea un YAML por capítulo y produzca los `.snbt`, para no editar cientos de misiones a mano en el editor gráfico. Decisión pendiente; ver `docs/06`.
- Textos y traducciones: se escriben una vez en español; el inglés se añade con un archivo de lang si se quiere.
