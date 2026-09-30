# 06 — Validación y riesgos

## Los 8 criterios de admisión de un mod

Un mod entra al pack solo con una ficha completa. Ejemplo de ficha (plantilla para copiar):

| # | Criterio | Cómo se comprueba |
|---|---|---|
| 1 | Qué aporta | Una frase: qué hueco de `docs/01` cubre |
| 2 | Compatibilidad | Arranca con el resto; sin errores de dependencias/mixins; revisar issues de GitHub del mod con los mods ya presentes |
| 3 | Etapa | En qué era entra; qué stage/receta lo bloquea |
| 4 | Balance | Recetas y drops revisados; nada que se salte una era |
| 5 | Rendimiento | Spark en servidor con 4+ jugadores: TPS y MSPT antes/después; tiempo de arranque |
| 6 | Conflictos | Sin duplicar sistema (2 magias, 2 combates, 2 niveles); recetas y tags solapados |
| 7 | Servidor dedicado | Arranca en dedicado; sin clases cliente en servidor; funciona con clientes vía packwiz |
| 8 | Versión exacta | La versión probada se fija en `.pw.toml`; se registra en `CHANGELOG.md` |

La columna ✅ de `docs/02` **solo garantiza el criterio 8 parcial** (existe en 1.20.1 Forge). Los criterios 2–7 no están hechos.

## Spikes (comprobar antes de construir encima)

Estas son las incógnitas que pueden cambiar el diseño. Cada una debe resolverse con una prueba corta y decidir.

| # | Duda | Prueba | Decisión según resultado |
|---|---|---|---|
| **S1** | **¿Quién es la fuente de verdad del nivel?** Pufferfish lleva el nivel global; Project MMO tiene sus propias skills y requisitos. Dos sistemas de nivel confunden al jugador. | Instalar ambos. Ver si Pufferfish expone el nivel a KubeJS/comandos/quests (FTB Quests puede pedir XP/stages). Ver si PMMO puede leer o dar XP de Pufferfish. | A) Solo Pufferfish + stages por quests (más simple) · B) PMMO como respaldo de requisitos · C) Vanilla XP como nivel |
| **S2** | ¿Puede Pufferfish dar atributos de Iron's Spells y Apothic? ¿Y niveles de 1–100 con curva personalizada? | Un árbol mínimo de prueba con atributo de vida y de maná | Ajustar el diseño de atributos en `docs/01` |
| **S3** | ¿Apotheosis soporta rarezas "legendaria" y "mítica" como tiers propios sin romper otros mods? | Crear tiers por datapack, ver tooltips y afijos | Si no, usar nombres de rareza de Apotheosis tal cual |
| **S4** | ¿Create 6.0.x funciona con cada addon en 1.20.1? (algunos addons se hicieron para 0.5.1) | Cargar todos los addons con Create 6.0.8; probar máquina por addon | Quitar los que fallen |
| **S5** | Coste de worldgen con 6+ mods de estructuras | Pregenerar (Chunky) 5 000×5 000 y medir tiempo y mundo; ver solapes | Quitar los duplicados (Dungeon Crawl / IDAS / WDA) |
| **S6** | ¿Funciona Easy NPC con diálogos y comandos para las guías del spawn? | Crear un NPC que dé un stage y abra un diálogo | Si no, alternativa de NPC |
| **S7** | Pipeline packwiz: Prism cliente y servidor se actualizan desde GitHub sin intervención | Fase 1 de `docs/05` | Ajustar flujo |
| **S8** | Generador de quests: ¿SNBT desde YAML es viable o mejor el editor gráfico? | Generar un capítulo de prueba y cargarlo | Decidir herramienta |

## Riesgos abiertos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Demasiados sistemas de magia/combate/nivel solapados | Pack confuso | Reglas de frontera de `docs/02` ("Descartados"); un sistema por función |
| Tamaño del pack (~80 mods listados + dependencias) en RAM y arranque | Clientes lentos, servidor con TPS bajo | Perfilar con Spark en cada bloque; ModernFix/FerriteCore; recortar por perfil de rendimiento |
| Ice and Fire en beta | Bugs/crashes con el resto | Mantenerlo aislado y fácil de retirar |
| Cambios de versión de Forge tras el lanzamiento | Jugadores tienen que reinstalar | Fijar Forge al final de fase 2 |
| Mods solo de CurseForge (FTB, Twilight Forest) | Distribución/verificación distinta | Probar `packwiz cf add` en fase 1; tener plan B |
| Contenido propio (bosses a medida, raids con roles, mega dungeons) | Mucho trabajo; no existe hoy | Diferirlo a fase 3 y decidir caso por caso (`docs/01` → Resumen de huecos) |
| Balance de vida/daño en bosses de Cataclysm | Imposible o trivial según nivel | Configurar por config y calibrar con jugadores reales |
| Un push roto a `main` tira el servidor en el siguiente reinicio | Caída de producción | Flujo `dev` → `main` y CI del índice (`docs/05`) |
| Griefing con Create Big Cannons / Jetpack | Daño a bases y exploración temprana | Opcionales; desactivar o bloquear por era |

## Decisiones que quedan abiertas para ti

1. ~~JEI o EMI~~ Resuelto: se usan los dos (EMI como interfaz, JEI como API/plugins).
2. **Aether o Blue Skies** como dimensión "celestial" (o ambas, con más peso).
3. **Dimensiones Desértica y del Vacío**: ¿construirlas por datapack, o dejarlas fuera de la versión 1?
4. **Raid bosses con roles**: ¿desarrollo propio (mod) o aproximación con bosses existentes?
5. **Create Big Cannons**: ¿dentro o fuera del servidor?
6. **Repo**: nombre y usuario de GitHub para fijar la URL de `pack.toml`.
7. **Hardware del servidor** (RAM/CPU/jugadores simultáneos previstos): condiciona cuántos mods estructurales aguantan.

## Próximo paso propuesto

Fase 1 de `docs/05`: crear el repo, `packwiz init`, meter el núcleo mínimo y comprobar la actualización automática en Prism y en servidor de pruebas (spike S7). Con eso ya hay una base real sobre la que ejecutar S1–S6.
