# 07 — Gremios, regiones, guerra y mundo de aventura (diseño)

Estado: **fase 1 implementada en la rama `gremios` (sin probar en juego)**: gremios, regiones, guerra y PvP. Lo demás sigue siendo propuesta. Marca qué es seguro, qué hay que verificar y qué decisiones quedan abiertas.

## 1. Los 4 gremios (capa de Origins)

Nombres: **Slytheri0n**, **RavenCachalotes**, **Huffleponyanos**, **Tuliondor**.

- Nueva capa `pony0n:gremio` con 4 orígenes, como la de razas y clases. Orden de elección: **Gremio → Raza → Clase**. ✅ (mismo mecanismo que ya funciona)
- Al elegir gremio: stage `gremio_<x>`, teletransporte al pueblo inicial de su región y entrada en el **equipo de FTB Teams** de ese gremio. ✅ stage y teletransporte · ⚠️ equipo automático: hay que verificar la API de FTB Teams desde KubeJS (plan B: 4 equipos fijos creados por un administrador y comando de unión).
- Cada gremio puede dar un pequeño efecto propio (sugerencia): Slytheri0n = ambición (+XP de oficios), RavenCachalotes = ingenio (+maná/poder de hechizo), Huffleponyanos = lealtad (regeneración y comida), Tuliondor = valor (vida/daño).

## 2. Mapa con límite dividido en 4 regiones

- Límite del mundo con `/worldborder` (vanilla) y **4 regiones = 4 cuadrantes** alrededor de (0, 0). Tamaño propuesto: borde de 6 000 × 6 000 (cada región 3 000 × 3 000); se ajusta al número de jugadores. ✅
- Zona neutral central pequeña (capital/mercado/portal a la aventura) abierta a todos. (opcional, recomendado)
- **Cada región tiene su pueblo inicial con el NPC guía** (Easy NPC). Los pueblos hay que **construirlos a mano**; el NPC y sus diálogos los configuro yo.
- **Límite entre regiones**: script de KubeJS que comprueba la posición y devuelve al jugador a su región (con aviso) mientras no haya guerra. ✅ viable

## 3. Reclamos solo en tu región

- Como en paz no se puede salir de la región, los reclamos de FTB Chunks quedan dentro de ella de forma natural. ⚠️ Verificar que no se pueda reclamar chunks lejanos desde el mapa; si se puede, script que desreclama los que estén fuera de la región.

## 4. Modo guerra

- Interruptor global (comando de administrador `/guerra on|off` y programable desde las Programaciones del panel, p. ej. fines de semana). ✅
- En guerra: se quitan los límites entre regiones y se permite PvP entre gremios distintos. Mismo gremio = sin fuego amigo. Fuera de guerra, el PvP se cancela con un evento de KubeJS. ✅
- Opcional: los reclamos se pueden asediar solo en guerra (configuración de FTB Chunks). ⚠️ por verificar.

## 5. Dos mundos: construcción y aventura

- **Overworld = mundo de construcción** (casas, bases, oficios, Create, tecnología). Sin PvP salvo guerra.
- **Mundo de aventura = dimensión aparte** con las mazmorras y los jefes, que **se reinicia** (p. ej. cada semana) y donde **hay PvP entre gremios**. Reinicio = borrar la carpeta de esa dimensión con una marca que lee `start.sh` al arrancar (o tarea programada + reinicio). ✅
- Mods encontrados (1.20.1, Forge) — a evaluar antes de añadir:
  - **Dimensional Dungeons**: una dimensión con mazmorras infinitas y renovables; limita construir y romper bloques (modo aventura en survival). Encaja muy bien.
  - **Cataclysm Dimension**: cada estructura de Cataclysm en su propia dimensión (una sola estructura por dimensión) → jefes **únicos y repetibles** al reiniciar la dimensión.
  - **Dimensions of Alex's Caves**: dimensiones para las cuevas de Alex's Caves.
  - **Desert Dimension** y **The Void Dimension** (pequeños): dimensiones Desértica y del Vacío del plan original.
- ⚠️ Por resolver: que las estructuras de los mods de mazmorras (Dungeons Arise, YUNG's, Dungeon Crawl, etc.) **no aparezcan en el mundo de construcción**. Se hace con la configuración de cada mod, y es lo más laborioso.

## 6. Jefes que exijan roles

- Los jefes de Cataclysm tienen `health_multiplier`, `attack_multiplier` y `armor_multiplier` **por jefe** en `config/cataclysm-common.toml` (comprobado). Otros mods (Mowzie's, Ice and Fire, Bosses of Mass Destruction) tienen opciones similares por revisar. ✅ subir vida y daño es cuestión de configuración.
- Que el combate pida *roles* de verdad depende de los números (daño alto que exige armadura y sanación, vida alta que exige buen DPS). Mecánicas propias por rol requerirían jefes propios (fase 3).

## 7. Roles y rangos

- **Roles** (Tanque, Sanador, DPS, Soporte) según el camino del árbol donde se gasten los puntos + auras de grupo (bonos pequeños a los miembros del equipo cercanos) + habilidad de provocar del Tanque. ✅
- **Rangos**: Novato → Bronce → Plata → Oro → Maestro, con **prefijo visible** en el chat y la lista de jugadores mediante FTB Ranks (instalado), y que suban ligados a misiones y nivel. ✅

## 8. Orden de trabajo sugerido

1. **Gremios + regiones + guerra** (Origins, KubeJS, FTB Teams/Chunks). Requiere mundo nuevo con el borde y las 4 regiones.
2. **Roles y rangos con prefijo.**
3. **Mundo de aventura**: evaluar y añadir Dimensional Dungeons y Cataclysm Dimension, reinicio programado, subir la vida de los jefes.
4. **Contenido de construcción**: pueblos de las 4 regiones, NPC guía, ciudad neutral.

## Decisiones tomadas

- Mapa de **6 000 × 6 000** (cada región 3 000 × 3 000), centrado en (0, 0).
- **Zona neutral central** de 300 × 300 (|x| ≤ 150 y |z| ≤ 150).
- Regiones: **Slytheri0n** noroeste (x<0, z<0) · **RavenCachalotes** noreste (x>0, z<0) · **Huffleponyanos** suroeste (x<0, z>0) · **Tuliondor** sureste (x>0, z>0).
- **Pueblo inicial** de cada región en **(±1 500, ±1 500)** (hay que construirlo ahí; el jugador aparece en la superficie más cercana).
- Guerra **manual** con comando (y programable desde las Programaciones del panel); reinicio del mundo de aventura **a demanda**.
- Empezar con un **mundo nuevo** (el script fija el borde la primera vez que carga un mundo).

## Fase 1 implementada (rama `gremios`)

- Capa de Origins `pony0n:gremio` (orden antes que raza y clase) con 4 orígenes y un pequeño efecto cada uno (`tools/gen-origins.mjs`).
- `kubejs/server_scripts/gremios.js`: comandos `/guerra on|off|estado` y `/gremio unir <gremio> <jugador>` (lo ejecuta Origins al elegir), equipo de FTB Teams por gremio, límite entre regiones, borde del mundo y reglas de PvP.

### Cómo probarla en el servidor sin tocar `main`
1. En la raíz del servidor crea un archivo `pack_branch.txt` que contenga `gremios` y reinicia (`start.sh` usará esa rama).
2. Con un mundo nuevo, entra: debe salir primero **Gremio**, luego raza y clase. Al elegir gremio te lleva a tu región.
3. Comprueba: no puedes cruzar a otra región; `/guerra on` lo permite; `/guerra off` lo cierra; el PvP solo funciona en guerra y entre gremios distintos.
4. Si todo va bien se mezcla a `main` y se borra `pack_branch.txt`.

## Pueblos iniciales (fase 1b)

Cada gremio tiene un pueblo amurallado de 65 × 65 bloques hecho con un generador propio (`tools/village/`), no un diseño al azar:
las técnicas (base de adoquín, esquinas de tronco, entramado de paredes, ventanas con contraventanas, tejado de escaleras a dos aguas
con alero, chimenea) salen de estudiar las casas de aldea de vanilla con `dump.mjs` y de comparar renders (`preview.mjs`) antes de darlo por bueno.

**Contenido:** muralla con almenas y 3 puertas (sur, este, oeste), 4 torres de esquina con escalera y tejado, plaza con pozo, 4 mástiles con el
estandarte del gremio y farolas, **Salón del gremio** al norte (tarima, alfombra, estandartes; ahí va el NPC guía), **taberna** de 2 plantas con camas,
**herrería** abierta (yunque, hornos, amoladora), 6 casas amuebladas (camas, cofres, mesa, estantes, chimenea), 3 puestos de mercado y 2 granjas.
Colores/material por gremio: Slytheri0n verde y roble oscuro, RavenCachalotes azul y abeto, Huffleponyanos amarillo y roble, Tuliondor rojo y ladrillo.

**Regenerar:** `node tools/village/gen-village.mjs all` → `kubejs/data/pony0n/structures/pueblo_<gremio>.nbt`.
**Comprobar:** `node tools/village/validate.mjs <archivo.nbt>` (cada bloque y propiedad existe en vanilla 1.20.1) y
`node tools/village/preview.mjs <archivo.nbt> salida.png 8 <0-3>` para verlo desde los 4 ángulos (`CROP=x0,z0,x1,z1,ymax` recorta una zona).

**Colocación:** la primera vez que carga un mundo nuevo, el servidor coloca los 4 pueblos solo en (±1500, ±1500): carga los chunks, despeja árboles,
rellena huecos y agua debajo y pega la plantilla. `/pueblo colocar <gremio|todos>` lo repite y `/pueblo estado` dice cuáles están hechos.
`/gremio unir` ahora teletransporta a la plaza del pueblo (junto al pozo) y fija allí la reaparición.

### Verificaciones pendientes
- Que la unión automática al equipo de FTB Teams funcione (si falla, sale un aviso y el log del servidor explica por qué).
- Que los reclamos de FTB Chunks no permitan salirse de la región.
- Nombres de comandos y propiedades de KubeJS usados en el script (si alguno falla, sale en `logs/kubejs/server.log`).

## Decisiones aún abiertas

- Frecuencia de reinicio del mundo de aventura (ahora a demanda).
- Qué mods de dimensiones/mazmorras se añaden y cuándo (fase 3).
