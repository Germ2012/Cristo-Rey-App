$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$target = Join-Path $root "app/src/main/assets/www"
$targetAssets = Join-Path $target "assets"

New-Item -ItemType Directory -Force -Path $targetAssets | Out-Null

Copy-Item -Force (Join-Path $root "index.html") $target
Copy-Item -Force (Join-Path $root "app.js") $target
Copy-Item -Force (Join-Path $root "styles.css") $target
Copy-Item -Force (Join-Path $root "manifest.webmanifest") $target
Copy-Item -Force (Join-Path $root "service-worker.js") $target
Copy-Item -Force (Join-Path $root "assets/icon.svg") (Join-Path $targetAssets "icon.svg")

Write-Host "App web sincronizada en app/src/main/assets/www"
