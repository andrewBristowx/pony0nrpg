#!/usr/bin/env bash
# Arranque del servidor Pony0n RPG para el hosting (Pterodactyl / HolyHosting).
#  1) Actualiza mods, configuración y scripts desde GitHub con packwiz (solo lo marcado "server"/"both").
#  2) Arranca Forge con flags de Aikar.
# Uso en el panel: Arranque -> "Utilizar FLAGS Customizadas" y dar permiso de ejecución (755) a este archivo.
cd "$(dirname "$0")" || exit 1

# ---- 0. este script se actualiza solo desde GitHub (así solo se sube UNA vez al hosting) -----------------------
SELF_URL="${START_SH_URL:-https://raw.githubusercontent.com/andrewBristowx/pony0nrpg/main/server/start.sh}"
if [ -z "$START_SH_UPDATED" ]; then
  NEW="./.start.sh.new"
  rm -f "$NEW"
  if { command -v curl >/dev/null 2>&1 && curl -fsSL --max-time 20 "$SELF_URL" -o "$NEW"; } ||      { command -v wget >/dev/null 2>&1 && wget -q -T 20 -O "$NEW" "$SELF_URL"; }; then
    # solo se acepta si es un script de bash válido y distinto del actual
    if [ -s "$NEW" ] && head -1 "$NEW" | grep -q '^#!' && bash -n "$NEW" 2>/dev/null && ! cmp -s "$NEW" "$0"; then
      chmod 755 "$NEW"
      mv -f "$NEW" "$0"   # se sustituye el archivo (no se escribe encima) para no romper la ejecución en curso
      echo "[start.sh] Script actualizado desde GitHub; reiniciando con la version nueva..."
      export START_SH_UPDATED=1
      exec bash "$0" "$@"
    fi
  fi
  rm -f "$NEW"
fi

# Rama del pack: "main" por defecto. Para probar una rama en el servidor, crea un archivo pack_branch.txt con su nombre
# (p. ej. gremios); al borrarlo vuelve a main. El cliente (Prism) sigue con main.
PACK_BRANCH="${PACK_BRANCH:-}"
if [ -z "$PACK_BRANCH" ] && [ -f pack_branch.txt ]; then PACK_BRANCH="$(tr -d '[:space:]' < pack_branch.txt)"; fi
PACK_BRANCH="${PACK_BRANCH:-main}"
PACK_URL="https://raw.githubusercontent.com/andrewBristowx/pony0nrpg/${PACK_BRANCH}/pack.toml"
echo "[start.sh] Rama del pack: ${PACK_BRANCH}"

# ---- 1. actualización de mods/config -------------------------------------------------------------------------
if [ -f packwiz-installer-bootstrap.jar ]; then
  echo "[start.sh] Actualizando mods desde GitHub..."
  if ! java -jar packwiz-installer-bootstrap.jar -g -s server "$PACK_URL"; then
    echo "[start.sh] AVISO: la actualizacion fallo (¿GitHub no responde?). Se arranca con los mods que ya hay."
  fi
else
  echo "[start.sh] No esta packwiz-installer-bootstrap.jar: se arranca sin actualizar."
fi

# ---- 1a. limpieza: los archivos "archive-*.tar.gz" que crea el panel al archivar una carpeta y quedan dentro de kubejs/ ------
# KubeJS aborta el arranque ("Invalid file name: Uppercase 'T' ...") si encuentra uno en kubejs/data; se borran antes de arrancar.
find kubejs -type f -name 'archive-*.tar.gz' -print -delete 2>/dev/null | sed 's/^/[start.sh] Borrado (rompe KubeJS): /'

# ---- 1b. Forge: se instala solo a la version que fija pack.toml (la misma que el cliente de Prism) ---------------
# packwiz solo gestiona mods y archivos, no el loader; aqui se baja el instalador oficial de Forge y se ejecuta --installServer
# si falta esa version. Para forzar otra: variable FORGE_VERSION (p. ej. 47.4.23). Necesita Java 17 y acceso a maven.minecraftforge.net.
descargar() {   # descargar URL DESTINO SEGUNDOS
  if command -v curl >/dev/null 2>&1; then curl -fsSL --max-time "$3" "$1" -o "$2"
  elif command -v wget >/dev/null 2>&1; then wget -q -T "$3" -O "$2" "$1"
  else return 1; fi
}
FORGE_VER="${FORGE_VERSION:-}"
if [ -z "$FORGE_VER" ]; then
  descargar "$PACK_URL" ./.pack.toml.tmp 20 && FORGE_VER="$(sed -n 's/^forge *= *"\([^"]*\)".*/\1/p' ./.pack.toml.tmp | head -1)"
  rm -f ./.pack.toml.tmp
fi
FORGE_VER="${FORGE_VER:-47.4.10}"
FORGE_FULL="1.20.1-${FORGE_VER}"
FORGE_ARGS="libraries/net/minecraftforge/forge/${FORGE_FULL}/unix_args.txt"
if [ ! -f "$FORGE_ARGS" ]; then
  echo "[start.sh] Forge ${FORGE_FULL} no esta instalado: descargando el instalador (puede tardar unos minutos)..."
  FORGE_INST="forge-${FORGE_FULL}-installer.jar"
  if descargar "https://maven.minecraftforge.net/net/minecraftforge/forge/${FORGE_FULL}/forge-${FORGE_FULL}-installer.jar" "$FORGE_INST" 300 \
     && java -jar "$FORGE_INST" --installServer; then
    echo "[start.sh] Forge ${FORGE_FULL} instalado."
  else
    echo "[start.sh] AVISO: no se pudo instalar Forge ${FORGE_FULL}. Se arranca con el que ya haya."
  fi
  rm -f "$FORGE_INST" "${FORGE_INST}.log"
fi

# ---- 2. memoria: 75 % del limite del contenedor, con tope de 12 GB (mas heap no mejora el TPS) --------------
LIMIT_MB="${SERVER_MEMORY:-0}"
if [ "$LIMIT_MB" -gt 0 ] 2>/dev/null; then HEAP_MB=$(( LIMIT_MB * 75 / 100 )); else HEAP_MB=12288; fi
[ "$HEAP_MB" -gt 12288 ] && HEAP_MB=12288
[ "$HEAP_MB" -lt 4096 ] && HEAP_MB=4096
MIN_MB=$(( HEAP_MB / 2 ))

JVM_FLAGS="-Xms${MIN_MB}M -Xmx${HEAP_MB}M \
 -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions \
 -XX:+DisableExplicitGC -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M \
 -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 \
 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 \
 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 \
 -Dterminal.jline=false -Dterminal.ansi=true -Dforge.readTimeout=120"

# forge.readTimeout=120: por defecto el servidor expulsa ("Timed out") al cliente que no responde en 30 s. Al entrar, JEI bloquea
# el cliente ~30 s dos veces seguidas en este pack; con 120 s el jugador ya no es expulsado mientras JEI carga.

# ---- 3. Forge ------------------------------------------------------------------------------------------------
echo "[start.sh] Iniciando servidor con ${HEAP_MB} MB de heap..."
ARGS_FILE="$FORGE_ARGS"
[ -f "$ARGS_FILE" ] || ARGS_FILE="$(ls libraries/net/minecraftforge/forge/*/unix_args.txt 2>/dev/null | sort | tail -1)"
if [ -n "$ARGS_FILE" ]; then
  # shellcheck disable=SC2086
  exec java $JVM_FLAGS @"$ARGS_FILE" nogui "$@"
else
  # instalaciones que arrancan con un jar unico (como el server.jar del panel)
  # shellcheck disable=SC2086
  exec java $JVM_FLAGS -jar "${SERVER_JARFILE:-server.jar}" nogui "$@"
fi
