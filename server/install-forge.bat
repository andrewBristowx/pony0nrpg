@echo off
rem Instala el servidor Forge 1.20.1 (47.4.10) en esta carpeta. Requiere Java 17.
rem Ejecutar UNA sola vez. Despues usar start.bat.
cd /d "%~dp0"
set FORGE=1.20.1-47.4.10
if not exist forge-installer.jar (
  curl -L -o forge-installer.jar https://maven.minecraftforge.net/net/minecraftforge/forge/%FORGE%/forge-%FORGE%-installer.jar
)
java -jar forge-installer.jar --installServer
rem Memoria y flags de JVM (ajusta -Xmx a la RAM del servidor)
(
echo -Xms6G
echo -Xmx8G
echo -XX:+UseG1GC
echo -XX:+ParallelRefProcEnabled
echo -XX:MaxGCPauseMillis=200
echo -XX:+UnlockExperimentalVMOptions
echo -XX:+DisableExplicitGC
echo -XX:+AlwaysPreTouch
echo -XX:G1NewSizePercent=30
echo -XX:G1MaxNewSizePercent=40
echo -XX:G1HeapRegionSize=8M
echo -XX:G1ReservePercent=20
echo -XX:G1HeapWastePercent=5
echo -XX:G1MixedGCCountTarget=4
echo -XX:InitiatingHeapOccupancyPercent=15
echo -XX:G1MixedGCLiveThresholdPercent=90
echo -XX:G1RSetUpdatingPauseTimePercent=5
echo -XX:SurvivorRatio=32
echo -XX:+PerfDisableSharedMem
echo -XX:MaxTenuringThreshold=1
) > user_jvm_args.txt
echo.
echo Forge instalado. Acepta la EULA editando eula.txt tras el primer arranque y ejecuta start.bat.
pause
