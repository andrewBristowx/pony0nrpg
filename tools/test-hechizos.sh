#!/usr/bin/env bash
# Prueba "hechizos solo por progresion" en un Forge minimo CON Iron's Spells (y sus dependencias). Parte de un servidor ya preparado por tools/test-kubejs.sh
# (carpeta con Forge instalado y mods de KubeJS/Rhino/Architectury/Easy NPC). Baja Iron's Spells y sus dependencias de las URL de mods/*.pw.toml.
# Uso:  ACEPTO_EULA=1 tools/test-hechizos.sh [carpeta=/tmp/pony-mini] [sin_override]   (sin_override: no copia kubejs/data, para comparar el botin original)
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
DIR="${1:-/tmp/pony-mini}"
[ "${ACEPTO_EULA:-}" = "1" ] || { echo "Pon ACEPTO_EULA=1 para aceptar la EULA de Mojang en el servidor de prueba."; exit 1; }
FORGE="1.20.1-$(sed -n 's/^forge *= *"\(.*\)"/\1/p' "$REPO/pack.toml")"
cd "$DIR"
[ -f "libraries/net/minecraftforge/forge/$FORGE/unix_args.txt" ] || { echo "Primero prepara la carpeta con tools/test-kubejs.sh $DIR"; exit 1; }
pw_url() { sed -n 's/^url = "\(.*\)"/\1/p' "$REPO/mods/$1.pw.toml" | head -1; }
for m in irons-spells-n-spellbooks irons-lib playeranimator geckolib curios; do [ -f "mods/$m.jar" ] || curl -fsSL -o "mods/$m.jar" "$(pw_url "$m")"; done
rm -rf kubejs/server_scripts kubejs/startup_scripts kubejs/data world logs
mkdir -p kubejs/server_scripts kubejs/startup_scripts
cp "$REPO"/kubejs/server_scripts/*.js kubejs/server_scripts/
cp "$REPO"/kubejs/startup_scripts/*.js kubejs/startup_scripts/
[ "${2:-}" = "sin_override" ] || { mkdir -p kubejs/data; cp -r "$REPO/kubejs/data/irons_spellbooks" kubejs/data/; }
cp "$REPO/tools/test/zz_hechizos.js" kubejs/server_scripts/zz_test.js
echo "eula=true" > eula.txt
java -Xmx3G -XX:+UseG1GC @libraries/net/minecraftforge/forge/$FORGE/unix_args.txt nogui > run.log 2>&1 || true
echo "=== resultado (TEST / errores) ==="
grep -E "TEST|ERROR\]|\[eco|Loaded [0-9]+/[0-9]+ KubeJS" run.log | grep -v "Settings\|server.properties" || true
echo "(registro completo: $DIR/run.log)"
