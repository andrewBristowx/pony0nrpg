#!/usr/bin/env bash
# Servidor Forge 1.20.1 MINIMO para probar los scripts de KubeJS del pack sin subirlos al hosting (necesita Java 17+, curl, python3).
#  - Instala Forge (la version de pack.toml) y baja solo KubeJS, Rhino, Architectury y Easy NPC (de las URL de mods/*.pw.toml y Modrinth).
#  - Copia kubejs/server_scripts y kubejs/startup_scripts del repo (sin class_gating.js, que necesita Iron's Spells) y un script de prueba.
#  - Arranca, deja correr el script de prueba y se apaga. Resultado: las lineas TEST / ERROR del registro.
# Uso:  ACEPTO_EULA=1 tools/test-kubejs.sh [carpeta=/tmp/pony-mini] [script_de_prueba=tools/test/zz_test.js]
#   (al poner ACEPTO_EULA=1 aceptas la EULA de Mojang https://aka.ms/MinecraftEULA para ese servidor de prueba)
# Limites: no hay jugadores reales; el chat y los clics de NPC no se pueden probar aqui (FakePlayer sirve para nombres, TAB y funciones).
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
DIR="${1:-/tmp/pony-mini}"
TEST="${2:-$REPO/tools/test/zz_test.js}"
FORGE_VER="$(sed -n 's/^forge *= *"\(.*\)"/\1/p' "$REPO/pack.toml")"
FORGE="1.20.1-$FORGE_VER"
[ "${ACEPTO_EULA:-}" = "1" ] || { echo "Pon ACEPTO_EULA=1 para aceptar la EULA de Mojang en el servidor de prueba."; exit 1; }
mkdir -p "$DIR/mods" && cd "$DIR"

if [ ! -f "libraries/net/minecraftforge/forge/$FORGE/unix_args.txt" ]; then
  curl -fsSL -o forge-installer.jar "https://maven.minecraftforge.net/net/minecraftforge/forge/$FORGE/forge-$FORGE-installer.jar"
  java -jar forge-installer.jar --installServer
fi
pw_url() { sed -n 's/^url = "\(.*\)"/\1/p' "$REPO/mods/$1.pw.toml" | head -1; }
for m in kubejs rhino easy-npc easy-npc-core easy-npc-config-ui; do
  [ -n "$(ls mods | grep -i "^$m" || true)" ] && continue
  u="$(pw_url "$m")"; [ -n "$u" ] && curl -fsSL -o "mods/$m.jar" "$u"
done
[ -f mods/architectury.jar ] || curl -fsSL -o mods/architectury.jar "$(curl -fsSL 'https://api.modrinth.com/v2/project/architectury-api/version?game_versions=%5B%221.20.1%22%5D&loaders=%5B%22forge%22%5D' | python3 -c "import json,sys;d=json.load(sys.stdin);v=[x for x in d if x['version_number'].startswith('9.2.14')] or d;print(v[0]['files'][0]['url'])")"

rm -rf kubejs/server_scripts kubejs/startup_scripts world logs
mkdir -p kubejs/server_scripts kubejs/startup_scripts
for t in server_scripts startup_scripts; do
  for f in "$REPO/kubejs/$t"/*.js; do [ "$(basename "$f")" = "class_gating.js" ] || cp "$f" "kubejs/$t/"; done
done
cp "$TEST" kubejs/server_scripts/zz_test.js
echo "eula=true" > eula.txt
java -Xmx3G -XX:+UseG1GC @libraries/net/minecraftforge/forge/$FORGE/unix_args.txt nogui > run.log 2>&1 || true
echo "=== resultado (TEST / errores) ==="
grep -E "TEST|ERROR\]|Loaded [0-9]+/[0-9]+ KubeJS" run.log | grep -v "Settings\|server.properties" || true
echo "(registro completo: $DIR/run.log y $DIR/logs/kubejs/)"
