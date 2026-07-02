param()

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$BackendDir = Join-Path $RepoRoot "backend"
$Python = Join-Path $BackendDir ".venv\Scripts\python.exe"
$CheckScript = Join-Path $PSScriptRoot "check_telegram_qa_env.ps1"

if (-not (Test-Path $Python)) {
    throw "Backend virtual environment was not found. Create it first, then install backend requirements."
}

& $CheckScript
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Starting Telegram bot polling."
Write-Host "Bot token is set but will not be printed."
Write-Host "Mini App URL:"
Write-Host $env:TELEGRAM_WEB_APP_URL
Write-Host ""
Write-Host "Press Ctrl+C to stop."
Write-Host ""

Push-Location $BackendDir
try {
    & $Python -m scripts.run_telegram_bot
}
finally {
    Pop-Location
}
