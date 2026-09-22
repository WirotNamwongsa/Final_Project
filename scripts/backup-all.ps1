param(
  [string]$ComposeFile = "docker-compose.local.yml",
  [string]$DBName = "loeitech",
  [string]$DBUser = "postgres",
  [string]$UploadsDir = "backend\uploads",
  [string]$OutDir = "backups"
)

Write-Host "Running full backup..."
.
${PSScriptRoot}\backup-db.ps1 -ComposeFile $ComposeFile -DBName $DBName -DBUser $DBUser -OutDir $OutDir
.
${PSScriptRoot}\backup-uploads.ps1 -UploadsDir $UploadsDir -OutDir $OutDir
Write-Host "Full backup complete. Files in: $OutDir"
