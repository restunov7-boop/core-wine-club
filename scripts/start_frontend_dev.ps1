param(
    [string]$ApiBaseUrl = "http://127.0.0.1:8000/api/v1",
    [string]$ProjectSlug = "doch-vinodela"
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$FrontendDir = Join-Path $RepoRoot "frontend"

$env:VITE_API_BASE_URL = $ApiBaseUrl
$env:VITE_PROJECT_SLUG = $ProjectSlug
$env:VITE_DEV_TELEGRAM_MOCK = "true"

Push-Location $FrontendDir
try {
    pnpm install
    pnpm dev -- --host 127.0.0.1 --port 5173
}
finally {
    Pop-Location
}
