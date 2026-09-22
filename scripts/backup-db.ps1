param(
  [string]$ComposeFile = "docker-compose.local.yml",
  [string]$DBName = "loeitech",
  [string]$DBUser = "postgres",
  [string]$OutDir = "backups"
)

if (!(Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$filename = "$OutDir\db-$timestamp.sql"

Write-Host "Backing up database '$DBName' to $filename"
docker compose -f $ComposeFile exec -T db pg_dump -U $DBUser $DBName | Out-File -Encoding UTF8 -FilePath $filename
if ($LASTEXITCODE -eq 0) { Write-Host "DB backup saved to $filename" } else { Write-Host "DB backup may have failed" }
