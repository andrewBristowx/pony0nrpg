# Genera dist/Pony0nRPG-Prism.zip: instancia de Prism Launcher que se auto-actualiza desde GitHub.
# Uso:  powershell -File tools/make-prism-instance.ps1 [-GithubUser USUARIO] [-Repo REPO] [-Branch main]
param(
    [string]$GithubUser = "andrewBristowx",
    [string]$Repo = "pony0nrpg",
    [string]$Branch = "main",
    [string]$InstanceName = "Pony0n RPG",
    [string]$MinecraftVersion = "1.20.1",
    [string]$ForgeVersion = "47.4.10",
    [int]$MaxMemMB = 6144
)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $root "dist"
$stage = Join-Path $dist "stage"
$packUrl = "https://raw.githubusercontent.com/$GithubUser/$Repo/$Branch/pack.toml"

if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Force (Join-Path $stage ".minecraft") | Out-Null

# 1. Bootstrap de packwiz (descarga y actualiza el pack en cada arranque)
$bootstrap = Join-Path $stage ".minecraft\packwiz-installer-bootstrap.jar"
Invoke-WebRequest "https://github.com/packwiz/packwiz-installer-bootstrap/releases/download/v0.0.3/packwiz-installer-bootstrap.jar" -OutFile $bootstrap

# 2. Componentes: Minecraft + Forge
$mmc = @{
    formatVersion = 1
    components    = @(
        @{ uid = "net.minecraft"; version = $MinecraftVersion; important = $true },
        @{ uid = "net.minecraftforge"; version = $ForgeVersion }
    )
} | ConvertTo-Json -Depth 5
[IO.File]::WriteAllText((Join-Path $stage "mmc-pack.json"), $mmc, (New-Object Text.UTF8Encoding($false)))

# 3. Configuración de la instancia con el comando de pre-lanzamiento
$cfg = @"
[General]
ConfigVersion=1.2
InstanceType=OneSix
name=$InstanceName
iconKey=default
OverrideCommands=true
PreLaunchCommand=\"`$INST_JAVA\" -jar packwiz-installer-bootstrap.jar -g -s client $packUrl
OverrideMemory=true
MinMemAlloc=2048
MaxMemAlloc=$MaxMemMB
"@
[IO.File]::WriteAllText((Join-Path $stage "instance.cfg"), $cfg, (New-Object Text.UTF8Encoding($false)))

# 4. Zip
$zip = Join-Path $dist "Pony0nRPG-Prism.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$fs = [IO.File]::Open($zip, [IO.FileMode]::Create)
$archive = New-Object IO.Compression.ZipArchive($fs, [IO.Compression.ZipArchiveMode]::Create)
Get-ChildItem $stage -Recurse -File -Force | ForEach-Object {
    # Entradas con "/" (Compress-Archive de PS 5.1 usa "\" y algunos lectores fallan)
    $entry = $_.FullName.Substring($stage.Length + 1).Replace("\", "/")
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $entry) | Out-Null
}
$archive.Dispose(); $fs.Dispose()
Remove-Item $stage -Recurse -Force
Write-Host "Creado: $zip"
Write-Host "Auto-actualiza desde: $packUrl"
