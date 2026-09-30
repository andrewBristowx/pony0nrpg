# Genera dist/Pony0nRPG-server-config.zip con lo que el hosting necesita ademas de los mods:
# config/puffish_skills y kubejs (el hosting no ejecuta packwiz). Descomprimir en la raiz del servidor.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$zip = Join-Path $root "dist\Pony0nRPG-server-config.zip"
New-Item -ItemType Directory -Force (Split-Path $zip) | Out-Null
if (Test-Path $zip) { Remove-Item $zip -Force }
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$fs = [IO.File]::Open($zip, [IO.FileMode]::Create)
$archive = New-Object IO.Compression.ZipArchive($fs, [IO.Compression.ZipArchiveMode]::Create)
foreach ($dir in @("config\puffish_skills", "config\ftbquests", "kubejs")) {
    Get-ChildItem (Join-Path $root $dir) -Recurse -File | ForEach-Object {
        $entry = $_.FullName.Substring($root.Length + 1).Replace("\", "/")
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $entry) | Out-Null
    }
}
$archive.Dispose(); $fs.Dispose()
Write-Host "Creado: $zip"
