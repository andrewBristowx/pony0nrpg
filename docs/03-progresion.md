# 03 — Progresión

## 1. Principio de bloqueo

Un jugador no debe poder saltarse una era, pero tampoco sentirse bloqueado por un muro arbitrario. Se usan **tres mecanismos, en este orden de preferencia**:

1. **Cadena de recetas (KubeJS).** Los objetos poderosos exigen ingredientes que solo existen en su era (fragmentos de boss, materiales dimensionales, componentes de otro mod). Es el bloqueo más robusto: no depende de permisos ni de eventos, funciona igual en singleplayer y servidor.
2. **Entrada a dimensiones con llave.** Portal/cohete/objeto de entrada con receta gated (ver §4). Si hace falta, se refuerza cancelando el viaje por script hasta tener el *stage* correspondiente.
3. **Stages por quest.** Al completar un hito de FTB Quests se concede un stage (`era_create`, `era_magia`…) que activa: recetas concretas, acceso a NPC/tiendas, entrada a dimensiones. Es el mecanismo que conecta misiones con progresión.

**No** se usa "nivel mínimo para equipar" como bloqueo principal hasta resolver el spike S1 (¿quién es la fuente de verdad del nivel? ver `docs/06`).

## 2. Curva de niveles (punto de partida, ajustable)

XP para pasar del nivel *n* al *n+1*: `60 + 12·n + 0.9·n²`.

| Nivel | XP acumulada | Referencia de tiempo (objetivo) |
|---|---|---|
| 10 | ≈ 1 340 | ~5 h |
| 25 | ≈ 9 450 | ~20 h |
| 50 | ≈ 54 000 | ~70 h |
| 75 | ≈ 162 000 | ~130 h |
| 100 | ≈ 361 000 | ~200 h |

Los tiempos son un **objetivo de diseño**, no una medición. Se calibra jugando el pack: si el nivel 25 llega a las 10 h, se sube el coeficiente; si a las 40 h, se baja. Lo importante es la *forma*: niveles rápidos al principio (feedback constante) y cada vez más lentos.

**Fuentes de XP** (pesos iniciales, a calibrar):

| Fuente | Peso |
|---|---|
| Misiones | Principal (la mayor parte del XP hasta nivel ~40) |
| Matar mobs / bosses / mazmorras | Principal desde nivel 20 |
| Explorar (estructuras nuevas, biomas, dimensiones) | Medio; una sola vez por hallazgo |
| Minería, agricultura, Create | Bajo pero continuo |
| Eventos | Ocasional |

Reglas anti-abuso: XP de mobs con rendimientos decrecientes por zona; nada de XP por granjas de mobs.

**Puntos**: 1 punto de habilidad por nivel (+ puntos extra de quests clave). Con ~100 puntos y árboles de ~45–60 nodos, un jugador puede llenar **dos árboles a medias** o **uno a fondo**: ese es el mecanismo de combinación de clases.

## 3. Eras y capítulos

Las 10 eras del plan coinciden con los 10 capítulos de campaña.

| Era / Cap. | Nivel | Se aprende | Stage que abre | Gate de salida (para pasar a la siguiente) |
|---|---|---|---|---|
| 1. El comienzo | 1–10 | Supervivencia, crafteo, minería, granja, combate básico | `era_1` | Primera noche superada + herramientas de hierro |
| 2. Secretos de la tierra | 10–20 | Minería avanzada, exploración, estructuras, primer loot RPG, primeras habilidades | `era_2` | Primer árbol de habilidad desbloqueado + brújula de estructuras |
| 3. El aventurero | 20–30 | Clases, combate avanzado, dungeons, minibosses | `era_3` | Primer miniboss; rango Bronce en el gremio |
| 4. Revolución de Create | 30–40 | Create, automatización, fábricas, trenes | `era_create` | Fábrica automática de hierro + primera estación de tren |
| 5. Era tecnológica | 40–50 | Electricidad, Mekanism, AE2 | `era_tech` | Energía estable + red de almacenamiento |
| 6. Despertar de la magia | 50–60 | Iron's, Ars, rituales, artefactos | `era_magia` | Escuela elegida + boss de Twilight Forest |
| 7. Tierras olvidadas | 60–70 | Mega dungeons, bosses grandes, materiales especiales | `era_7` | Primer boss de Cataclysm |
| 8. Más allá del mundo | 70–80 | Dimensiones nuevas | `era_dim` | Fragmentos dimensionales |
| 9. Los grandes jefes | 80–90 | World y raid bosses, equipo legendario | `era_9` | Arma legendaria fabricada |
| 10. Fin del mundo | 90–100 | Bosses finales, dimensión final, armas míticas | `era_10` | Nivel 100 |
| Ascensión | 100+ | Prestigio | `ascension` | — |

**Solapes deliberados** (el plan pedía varias ramas a la vez):

- **Create I "Primeras máquinas"** (nivel 15, plan §6) es una **rama tutorial opcional** dentro de la era 2: engranajes, ejes, prensa. El capítulo 4 (nivel 30–40) es el Create completo. Así no hay contradicción entre "Create desde el nivel 15" y "Create en el capítulo 4".
- Tecnología y magia pueden empezarse en cualquier orden una vez completadas las eras 4 y 5 (magia no exige tecnología, y viceversa). Las dos convergen en la era 7.

## 4. Dimensiones: llave de entrada

| Dimensión | Era | Llave |
|---|---|---|
| Nether | 3 | Portal vanilla + quest |
| Twilight Forest | 6 | Diamante + objeto de ritual (Ars); boss anterior derrotado |
| End | 7 | Ojos del End con núcleo de boss |
| Undergarden | 8 | Portal con fragmento de boss (Cataclysm) |
| Aether | 8 | Portal con material de Twilight Forest |
| Luna / Marte / Venus / Mercurio | 8 | Cohete (Ad Astra) con componentes de Create + Mekanism |
| Glacio | 8–9 | Cohete de tier superior |
| Dimensión final (custom) | 10 | Fragmentos de 3+ dimensiones |

## 5. Ejemplo de cadena completa (del plan §21)

```
Boss de arena (Twilight Forest / Cataclysm)
   ↓ suelta
Fragmento de boss
   ↓ + Núcleo tecnológico (Mekanism + Create)
Llave dimensional
   ↓ abre
Dimensión (p. ej. Undergarden / Ad Astra)
   ↓ suelta
Material único
   ↓ + fragmento de boss + material mágico (Ars/Iron's)
Arma legendaria
   ↓ necesaria para
Boss más fuerte (raid / world)
```

Todos los sistemas del pack se conectan: para hacer la llave hace falta tecnología, para el arma hace falta magia, para el boss hace falta el arma, y para el arma hace falta la dimensión.

## 6. Cadena de crafteo (plan §14)

| Tier | Ingredientes clave | Origen |
|---|---|---|
| T1 | Hierro, cobre, diamante | Mundo |
| T2 | + Aleación de Andesita, latón | Create |
| T3 | + Material mágico (cristal, glifo) | Ars / Iron's |
| T4 | + Núcleo tecnológico (circuitos, alloy) | Mekanism + Create Additions |
| T5 | + Fragmento de boss | Cataclysm / Twilight Forest / BoMD |
| T6 | + Material dimensional | Undergarden / Aether / espacio |
| T7 (legendario) | + material único de boss final | Bosses de era 9 |
| T8 (mítico) | + fragmentos de 3 dimensiones | Era 10 |

Objetivo de diseño: que cada mod aporte **un ingrediente que otro no tiene**, de modo que ninguna rama vuelva inútil a otra.

## 7. Ascensión (nivel 100+)

- Al llegar al nivel 100, la XP normal deja de subir nivel y pasa a llenar una barra de **XP de Ascensión**.
- Cada Ascensión da **1 punto de Ascensión** para un árbol propio (bonos pequeños y multiplicativos: +2% daño a bosses, +1 slot de amuleto…), cosméticos y quests nuevas.
- Se propone un tope de 50 Ascensiones al lanzar y ampliar con actualizaciones.
- Implementación: categoría extra de Pufferfish + KubeJS para la barra y recompensas. Es trabajo propio (🔧), no viene con ningún mod.
