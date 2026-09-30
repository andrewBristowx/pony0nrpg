#!/usr/bin/env bash
# Actualiza los mods desde GitHub y arranca el servidor (Linux).
cd "$(dirname "$0")" || exit 1
java -jar packwiz-installer-bootstrap.jar -g -s server https://raw.githubusercontent.com/andrewBristowx/pony0nrpg/main/pack.toml || { echo "La actualizacion de mods fallo. No se arranca el servidor."; exit 1; }
exec java @user_jvm_args.txt @libraries/net/minecraftforge/forge/1.20.1-47.4.10/unix_args.txt nogui "$@"
