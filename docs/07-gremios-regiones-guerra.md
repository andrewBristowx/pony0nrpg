# 07 — Gremios, regiones, guerra y mundo de aventura (diseño)

Estado: **propuesta, nada implementado todavía**. Marca qué es seguro, qué hay que verificar y qué decisiones quedan abiertas.

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

## Decisiones abiertas

- Tamaño del mapa y de cada región (y número de jugadores previsto).
- ¿Zona neutral central?
- ¿Guerra manual, programada o las dos?
- ¿Reinicio del mundo de aventura cada semana, cada dos o a demanda?
- ¿Empezamos con un mundo nuevo? (el actual es de pruebas)
