param(
    [string]$DatabasePath = "",
    [switch]$ResetDb
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$BackendDir = Join-Path $RepoRoot "backend"
$Python = Join-Path $BackendDir ".venv\Scripts\python.exe"
$Alembic = Join-Path $BackendDir ".venv\Scripts\alembic.exe"

if (-not (Test-Path $Python)) {
    throw "Backend virtual environment was not found. Create it with: cd backend; py -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt"
}

if (-not (Test-Path $Alembic)) {
    throw "Alembic was not found in backend .venv. Run: cd backend; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt"
}

if ([string]::IsNullOrWhiteSpace($DatabasePath)) {
    $DatabasePath = Join-Path $BackendDir "local_dev.db"
}

$DatabaseParent = Split-Path -Parent $DatabasePath
if ($DatabaseParent -and -not (Test-Path $DatabaseParent)) {
    New-Item -ItemType Directory -Path $DatabaseParent | Out-Null
}

if ($ResetDb -and (Test-Path $DatabasePath)) {
    Remove-Item -LiteralPath $DatabasePath -Force
}

$ResolvedDatabasePath = [System.IO.Path]::GetFullPath($DatabasePath)
$DatabaseUrlPath = $ResolvedDatabasePath.Replace("\", "/")

$env:APP_ENV = "development"
$env:DATABASE_URL = "sqlite:///$DatabaseUrlPath"
$env:DEV_AUTH_ENABLED = "true"
$env:JWT_SECRET = "dev_secret_change_me"
$env:CORS_ORIGINS = "http://127.0.0.1:5173,http://localhost:5173"

Push-Location $BackendDir
try {
    & $Alembic upgrade head
    & $Python -m scripts.seed_dev
    & $Python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
}
finally {
    Pop-Location
}
