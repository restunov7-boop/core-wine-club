param(
    [switch]$CheckPorts,
    [int]$BackendPort = 8000,
    [int]$FrontendPort = 5173
)

$ErrorActionPreference = "Stop"

function Write-Ok {
    param([string]$Message)
    Write-Host "[OK] $Message"
}

function Write-Fail {
    param([string]$Message)
    Write-Host "[FAIL] $Message"
}

$hasError = $false

if ([string]::IsNullOrWhiteSpace($env:TELEGRAM_BOT_TOKEN)) {
    Write-Fail "TELEGRAM_BOT_TOKEN is not set. Create a local token with BotFather and set it only in your local environment."
    $hasError = $true
}
else {
    Write-Ok "TELEGRAM_BOT_TOKEN is set locally. Token value was not printed."
}

if ([string]::IsNullOrWhiteSpace($env:TELEGRAM_WEB_APP_URL)) {
    Write-Fail "TELEGRAM_WEB_APP_URL is not set. Use a temporary HTTPS tunnel URL for real Telegram QA."
    $hasError = $true
}
elseif (-not $env:TELEGRAM_WEB_APP_URL.StartsWith("https://")) {
    Write-Fail "TELEGRAM_WEB_APP_URL must start with https://. Telegram Web App buttons reject localhost/http URLs."
    $hasError = $true
}
else {
    Write-Ok "TELEGRAM_WEB_APP_URL is HTTPS."
}

if ($CheckPorts) {
    foreach ($port in @($BackendPort, $FrontendPort)) {
        $connection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($null -eq $connection) {
            Write-Fail "Expected local port $port is not listening."
            $hasError = $true
        }
        else {
            Write-Ok "Local port $port is listening."
        }
    }
}

if ($hasError) {
    exit 1
}

Write-Ok "Telegram QA environment looks safe to use."
