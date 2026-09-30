# 05 — Infraestructura: Prism + packwiz + GitHub

> Los comandos de este documento **no se han ejecutado todavía**; se escriben desde la documentación de packwiz. Se validan en la fase 1.

## Cómo funciona

```
Tú (dev)                       GitHub                        Jugador / Servidor
─────────                      ──────                        ───────────────────
packwiz add / update  ──git push──▶  repo (pack.toml,        Prism arranca ──▶ packwiz-installer-bootstrap
packwiz refresh                       index.toml, mods/*.pw.toml)   descarga pack.toml + index.toml
                                                                    compara hashes, baja/borra mods
                                                                    ──▶ arranca Minecraft ya actualizado
```

- El repo **no contiene los `.jar`**, solo metadatos (`*.pw.toml`: URL + hash). Los jars se bajan desde Modrinth/CurseForge en cada cliente/servidor.
- `pack.toml` apunta a `index.toml` y define versión de Minecraft y Forge.
- Cada mod tiene `side = client | server | both`; el installer se ejecuta con `-s client` o `-s server` y solo baja lo que toca.
- Para que actualice solo, el jugador **no importa el pack cada vez**: la instancia de Prism lleva un *comando de pre-lanzamiento* que llama al installer en cada arranque.

## Requisitos (una sola vez, en tu PC)

- Go instalado (ya lo tienes) para compilar packwiz:

```bash
go install github.com/packwiz/packwiz@latest
```

- Repo de GitHub **público** (la URL `raw.githubusercontent.com` no sirve para repos privados; si se quiere privado hay que buscar otro hosting).
- Java 17 para 1.20.1 en cliente y servidor.

## Fase 1: inicializar el pack

```bash
cd D:/BrandonProgrmacion/emi/modpack
packwiz init            # nombre, autor, versión 1.0.0, mc 1.20.1, loader forge, versión de Forge
```

- Versión de Forge: la 47.x más reciente que sea estable para todos los mods; se fija en `pack.toml` y **no se cambia sin anunciarlo** (ver "Limitación" abajo).

Añadir mods (los slugs de Modrinth vienen de `docs/02-mods.md`):

```bash
packwiz modrinth add skills            # Pufferfish's Skills (el slug es "skills")
packwiz modrinth add apotheosis
packwiz modrinth add create
packwiz modrinth add irons-spells-n-spellbooks
packwiz curseforge add ftb-quests-forge   # FTB Quests (slug de CurseForge; comprobar al añadir)
```

Los mods de CurseForge (FTB, Twilight Forest) se añaden con `packwiz curseforge add <slug o URL>`. Si un autor desactivó la distribución por terceros, el installer pide bajar el jar a mano; los mods de FTB y Twilight Forest **no** suelen tener ese problema, pero se comprueba.

Marcar cliente/servidor donde Modrinth lo declara (ver columna Lado de `docs/02`): p. ej. Embeddium/Oculus/Xaero → `side = "client"`; Chunky/LuckPerms → `side = "server"`. Packwiz usa el valor de la web si lo hay.

Regenerar el índice tras cualquier cambio:

```bash
packwiz refresh
```

Actualizar mods en dev:

```bash
packwiz update --all
```

## Estructura del repo

```
modpack/
├─ pack.toml                 # versión del pack, MC, Forge
├─ index.toml                # lo genera packwiz refresh
├─ mods/*.pw.toml            # una entrada por mod
├─ config/                   # configs propias (FTB Quests, KubeJS…)
├─ kubejs/                   # scripts de recetas/stages
├─ defaultconfigs/  datapacks/  resourcepacks/
├─ .packwizignore            # cosas que NO se distribuyen
├─ docs/                     # este plan
└─ CHANGELOG.md
```

Configs que el jugador puede cambiar (`options.txt`, ajustes de minimapa) se distribuyen **una sola vez** con `preserve = true` en el índice, para que el installer no las pise.

## Prism Launcher (cliente)

1. Crear instancia: **Minecraft 1.20.1 + Forge** (la misma versión de Forge que `pack.toml`).
2. Descargar `packwiz-installer-bootstrap.jar` desde <https://github.com/packwiz/packwiz-installer-bootstrap/releases> y copiarlo en la carpeta `.minecraft` de la instancia (Prism → *Carpeta Minecraft*).
3. Instancia → *Ajustes* → *Comandos personalizados* → *Comando pre-lanzamiento*:

```
"$INST_JAVA" -jar packwiz-installer-bootstrap.jar -g -s client https://raw.githubusercontent.com/TU_USUARIO/TU_REPO/main/pack.toml
```

4. Ajustes → Java: 6–8 GB de memoria para el cliente (≥ 8 GB de RAM libre en el equipo).
5. Arrancar. El primer arranque descarga todo; los siguientes solo diferencias.

Para no explicar esto a cada jugador: distribuir una **instancia Prism exportada** (`.zip`) con el jar y el comando ya puestos; el jugador solo la importa.

### Cambios de Forge o Minecraft

packwiz-installer detecta instancias de MultiMC/Prism (al ejecutarlo muestra "Loaded MultiMC config") y en principio puede actualizar los componentes de `mmc-pack.json`, pero **no está probado** que un cambio de versión de Forge se aplique bien en Prism ni que no requiera reiniciar. Hasta probarlo, tratar un cambio de Forge/Minecraft como riesgoso: fijar Forge pronto, avisar, y ser capaz de dar una instancia nueva si hace falta.

## Servidor dedicado

En el servidor:

```bash
# start.sh (ejemplo)
java -jar packwiz-installer-bootstrap.jar -g -s server https://raw.githubusercontent.com/TU_USUARIO/TU_REPO/main/pack.toml
java -Xms6G -Xmx10G @user_jvm_args.txt @libraries/net/minecraftforge/forge/<versión>/unix_args.txt nogui
```

- El servidor se actualiza **en cada reinicio** desde `main`. Esto es cómodo y peligroso: un push roto tira el servidor. Por eso el flujo con ramas de abajo.
- Además del installer: `eula.txt`, `server.properties`, `whitelist`, mundo y `ops` no van al repo.
- Instalar Forge en servidor: descargar el installer de Forge 1.20.1 y ejecutar `--installServer`.

## Flujo de ramas (recomendado)

| Rama | Quién la usa | Para qué |
|---|---|---|
| `dev` | Tú y un servidor de pruebas | Todo cambio nuevo entra aquí primero |
| `main` | Jugadores y servidor de producción | Solo se hace merge tras probar en `dev` |

Los jugadores y el servidor de producción apuntan a `.../main/pack.toml`; el servidor de pruebas y tu instancia de desarrollo a `.../dev/pack.toml`.

Versionado: en `pack.toml` cambia `version`, se escribe `CHANGELOG.md` y se crea un tag `vX.Y.Z` en `main`. Para volver atrás, se apunta `main` a un tag anterior.

Nota: `raw.githubusercontent.com` cachea unos minutos; tras un push, esperar un poco antes de probar.

## CI mínimo (opcional, sin probar)

Comprueba que `index.toml` está al día para que nunca se haga merge de un índice desactualizado:

```yaml
name: check-index
on: [push, pull_request]
jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: stable }
      - run: go install github.com/packwiz/packwiz@latest
      - run: packwiz refresh
      - run: git diff --exit-code
```

## Fases

| Fase | Contenido | Salida |
|---|---|---|
| 0 | Diseño (este repo) | Documentos |
| 1 | `packwiz init`, núcleo mínimo (Forge, KubeJS, FTB Quests, Pufferfish, Apotheosis), instancia Prism y servidor de pruebas que arrancan | El pipeline de actualización funciona |
| 2 | Añadir mods por bloques (combate → Create → tecnología → magia → mundo → bosses/dimensiones), probando cada bloque | Pack completo con todos los criterios de `docs/06` |
| 3 | Sistemas propios: cadena de recetas, árboles de habilidad, quests, spawn, gremio, bosses a medida | Contenido jugable |
| 4 | Balance y pruebas con jugadores, perfilado con Spark | Lanzamiento |
