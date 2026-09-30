@echo off
rem Actualiza los mods desde GitHub y arranca el servidor.
cd /d "%~dp0"
java -jar packwiz-installer-bootstrap.jar -g -s server https://raw.githubusercontent.com/andrewBristowx/pony0nrpg/main/pack.toml
if errorlevel 1 (
  echo La actualizacion de mods fallo. No se arranca el servidor.
  pause
  exit /b 1
)
java @user_jvm_args.txt @libraries/net/minecraftforge/forge/1.20.1-47.4.10/win_args.txt nogui %*
pause
