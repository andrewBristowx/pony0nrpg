#!/usr/bin/env bash
# Arranque del servidor Pony0n RPG para el hosting (Pterodactyl / HolyHosting).
#  1) Actualiza mods, configuración y scripts desde GitHub con packwiz (solo lo marcado "server"/"both").
#  2) Arranca Forge con flags de Aikar.
# Uso en el panel: Arranque -> "Utilizar FLAGS Customizadas" y dar permiso de ejecución (755) a este archivo.
cd "$(dirname "$0")" || exit 1

PACK_URL="https://raw.githubusercontent.com/andrewBristowx/pony0nrpg/main/pack.toml"

# ---- 1. actualización de mods/config -------------------------------------------------------------------------
if [ -f packwiz-installer-bootstrap.jar ]; then
  echo "[start.sh] Actualizando mods desde GitHub..."
  if ! java -jar packwiz-installer-bootstrap.jar -g -s server "$PACK_URL"; then
    echo "[start.sh] AVISO: la actualizacion fallo (¿GitHub no responde?). Se arranca con los mods que ya hay."
  fi
else
  echo "[start.sh] No esta packwiz-installer-bootstrap.jar: se arranca sin actualizar."
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
 -Dterminal.jline=false -Dterminal.ansi=true \n -Dforge.readTimeout=120"

# forge.readTimeout=120: por defecto el servidor expulsa ("Timed out") al cliente que no responde en 30 s. Al entrar, JEI bloquea
# el cliente ~30 s dos veces seguidas en este pack; con 120 s el jugador ya no es expulsado mientras JEI carga.

# ---- 3. Forge ------------------------------------------------------------------------------------------------
echo "[start.sh] Iniciando servidor con ${HEAP_MB} MB de heap..."
ARGS_FILE="$(ls libraries/net/minecraftforge/forge/*/unix_args.txt 2>/dev/null | sort | tail -1)"
if [ -n "$ARGS_FILE" ]; then
  # shellcheck disable=SC2086
  exec java $JVM_FLAGS @"$ARGS_FILE" nogui "$@"
else
  # instalaciones que arrancan con un jar unico (como el server.jar del panel)
  # shellcheck disable=SC2086
  exec java $JVM_FLAGS -jar "${SERVER_JARFILE:-server.jar}" nogui "$@"
fi
