param(
  [string]$UploadsDir = "backend\uploads",
  [string]$OutDir = "backups"
)

if (!(Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$zip = "$OutDir\uploads-$timestamp.zip"

Write-Host "Archiving uploads from $UploadsDir to $zip"
if (!(Test-Path $UploadsDir)) { Write-Host "Uploads directory not found: $UploadsDir"; exit 1 }
Compress-Archive -Path (Join-Path $UploadsDir '*') -DestinationPath $zip -Force
if ($LASTEXITCODE -eq 0) { Write-Host "Uploads archived to $zip" } else { Write-Host "Uploads archive may have failed" }
