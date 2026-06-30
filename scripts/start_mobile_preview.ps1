param(
    [int]$BackendPort = 8000,
    [int]$FrontendPort = 5173,
    [int]$TimeoutSeconds = 60,
    [string]$ProjectSlug = "doch-vinodela"
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$RepoRootPath = $RepoRoot.Path
$BackendDir = Join-Path $RepoRoot "backend"
$FrontendDir = Join-Path $RepoRoot "frontend"
$TmpDir = Join-Path $RepoRoot ".tmp\mobile-preview"
$StatePath = Join-Path $TmpDir "pids.json"

$BackendLog = Join-Path $TmpDir "backend.log"
$BackendOutLog = Join-Path $TmpDir "backend-out.log"
$FrontendLog = Join-Path $TmpDir "frontend.log"
$FrontendErrLog = Join-Path $TmpDir "frontend-error.log"
$BackendTunnelLog = Join-Path $TmpDir "backend-tunnel.log"
$BackendTunnelOutLog = Join-Path $TmpDir "backend-tunnel-out.log"
$FrontendTunnelLog = Join-Path $TmpDir "frontend-tunnel.log"
$FrontendTunnelOutLog = Join-Path $TmpDir "frontend-tunnel-out.log"

function Write-Step {
    param([string]$Message)
    Write-Host "[mobile-preview] $Message"
}

function Get-RequiredCommand {
    param(
        [string]$Name,
        [string]$InstallMessage
    )

    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if ($null -eq $command) {
        Write-Host ""
        Write-Host "$Name is required for mobile preview."
        Write-Host $InstallMessage
        Write-Host ""
        Write-Host "No project files, env files, databases, or background processes were changed."
        exit 1
    }
    return $command.Source
}

function Assert-FileExists {
    param(
        [string]$Path,
        [string]$Message
    )

    if (-not (Test-Path $Path)) {
        throw $Message
    }
}

function Assert-PortFree {
    param([int]$Port)

    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -ne $connection) {
        throw "Port $Port is already in use by PID $($connection.OwningProcess). Stop that process or choose another port."
    }
}

function Wait-HttpOk {
    param(
        [string]$Url,
        [string]$Name
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2 | Out-Null
            return
        }
        catch {
            Start-Sleep -Seconds 1
        }
    }

    throw "$Name did not become ready at $Url within $TimeoutSeconds seconds."
}

function Wait-TunnelUrl {
    param(
        [System.Diagnostics.Process]$Process,
        [string[]]$LogPaths,
        [string]$Name
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    $pattern = "https://[a-zA-Z0-9-]+\.trycloudflare\.com"

    while ((Get-Date) -lt $deadline) {
        foreach ($logPath in $LogPaths) {
            if (Test-Path $logPath) {
                $content = Get-Content -Path $logPath -Raw -ErrorAction SilentlyContinue
                $match = [regex]::Match($content, $pattern)
                if ($match.Success) {
                    return $match.Value.TrimEnd("/")
                }
            }
        }

        $Process.Refresh()
        if ($Process.HasExited) {
            throw "$Name tunnel stopped before a public URL was detected. Check logs in $TmpDir."
        }

        Start-Sleep -Seconds 1
    }

    throw "$Name tunnel did not publish a trycloudflare.com URL within $TimeoutSeconds seconds. Check logs in $TmpDir."
}

function Stop-TrackedProcesses {
    param([System.Diagnostics.Process[]]$Processes)

    $processList = @($Processes | Where-Object { $null -ne $_ })
    [array]::Reverse($processList)
    foreach ($process in $processList) {
        try {
            $process.Refresh()
            if (-not $process.HasExited) {
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            }
        }
        catch {
            # Best-effort cleanup only.
        }
    }
}

$cloudflared = Get-RequiredCommand -Name "cloudflared" -InstallMessage "Install Cloudflare Tunnel, then reopen PowerShell and confirm: cloudflared --version"
$pnpm = Get-RequiredCommand -Name "pnpm" -InstallMessage "Install pnpm or enable it with Corepack, then retry."
$node = Get-RequiredCommand -Name "node" -InstallMessage "Install Node.js LTS, then retry."

$Python = Join-Path $BackendDir ".venv\Scripts\python.exe"
$Alembic = Join-Path $BackendDir ".venv\Scripts\alembic.exe"
$ViteBin = Join-Path $FrontendDir "node_modules\vite\bin\vite.js"

Assert-FileExists -Path $Python -Message "Backend virtual environment was not found. Create it with: cd backend; py -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt"
Assert-FileExists -Path $Alembic -Message "Alembic was not found in backend .venv. Run: cd backend; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt"

if (Test-Path $StatePath) {
    throw "Mobile preview state already exists at $StatePath. Run .\scripts\stop_mobile_preview.ps1 first."
}

Assert-PortFree -Port $BackendPort
Assert-PortFree -Port $FrontendPort

New-Item -ItemType Directory -Path $TmpDir -Force | Out-Null

$processes = @()

try {
    $DatabasePath = Join-Path $BackendDir "mobile_preview.db"
    $DatabaseUrlPath = ([System.IO.Path]::GetFullPath($DatabasePath)).Replace("\", "/")

    $env:APP_ENV = "development"
    $env:DATABASE_URL = "sqlite:///$DatabaseUrlPath"
    $env:DEV_AUTH_ENABLED = "true"
    $env:MOBILE_PREVIEW_ENABLED = "true"
    $env:JWT_SECRET = "mobile_preview_dev_secret"
    $env:CORS_ORIGINS = "http://127.0.0.1:$FrontendPort,http://localhost:$FrontendPort"

    Write-Step "Preparing backend database"
    Push-Location $BackendDir
    try {
        & $Alembic upgrade head *>> $BackendLog
        & $Python -m scripts.seed_dev *>> $BackendLog
    }
    finally {
        Pop-Location
    }

    Write-Step "Starting backend on 127.0.0.1:$BackendPort"
    $backend = Start-Process -FilePath $Python `
        -ArgumentList @("-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", $BackendPort.ToString()) `
        -WorkingDirectory $BackendDir `
        -RedirectStandardOutput $BackendOutLog `
        -RedirectStandardError $BackendLog `
        -WindowStyle Hidden `
        -PassThru
    $processes += $backend
    Wait-HttpOk -Url "http://127.0.0.1:$BackendPort/api/v1/health" -Name "Backend"

    Write-Step "Starting backend Cloudflare tunnel"
    $backendTunnel = Start-Process -FilePath $cloudflared `
        -ArgumentList @("tunnel", "--url", "http://127.0.0.1:$BackendPort") `
        -WorkingDirectory $RepoRootPath `
        -RedirectStandardOutput $BackendTunnelOutLog `
        -RedirectStandardError $BackendTunnelLog `
        -WindowStyle Hidden `
        -PassThru
    $processes += $backendTunnel
    $backendPublicUrl = Wait-TunnelUrl -Process $backendTunnel -LogPaths @($BackendTunnelLog, $BackendTunnelOutLog) -Name "Backend"

    Write-Step "Preparing frontend"
    Push-Location $FrontendDir
    try {
        & $pnpm install *>> $FrontendLog
    }
    finally {
        Pop-Location
    }
    Assert-FileExists -Path $ViteBin -Message "Vite was not found in frontend/node_modules. Check $FrontendLog for pnpm install output."

    $env:VITE_API_BASE_URL = "$backendPublicUrl/api/v1"
    $env:VITE_PROJECT_SLUG = $ProjectSlug
    $env:VITE_DEV_TELEGRAM_MOCK = "true"

    Write-Step "Starting frontend on 127.0.0.1:$FrontendPort"
    $frontend = Start-Process -FilePath $node `
        -ArgumentList @($ViteBin, "--host", "127.0.0.1", "--port", $FrontendPort.ToString()) `
        -WorkingDirectory $FrontendDir `
        -RedirectStandardOutput $FrontendLog `
        -RedirectStandardError $FrontendErrLog `
        -WindowStyle Hidden `
        -PassThru
    $processes += $frontend
    Wait-HttpOk -Url "http://127.0.0.1:$FrontendPort/home" -Name "Frontend"

    Write-Step "Starting frontend Cloudflare tunnel"
    $frontendTunnel = Start-Process -FilePath $cloudflared `
        -ArgumentList @("tunnel", "--url", "http://127.0.0.1:$FrontendPort") `
        -WorkingDirectory $RepoRootPath `
        -RedirectStandardOutput $FrontendTunnelOutLog `
        -RedirectStandardError $FrontendTunnelLog `
        -WindowStyle Hidden `
        -PassThru
    $processes += $frontendTunnel
    $frontendPublicUrl = Wait-TunnelUrl -Process $frontendTunnel -LogPaths @($FrontendTunnelLog, $FrontendTunnelOutLog) -Name "Frontend"

    $state = [ordered]@{
        created_at = (Get-Date).ToString("o")
        repo_root = $RepoRootPath
        tmp_dir = $TmpDir
        database_path = $DatabasePath
        backend = [ordered]@{
            pid = $backend.Id
            local_url = "http://127.0.0.1:$BackendPort"
            public_url = $backendPublicUrl
        }
        frontend = [ordered]@{
            pid = $frontend.Id
            local_url = "http://127.0.0.1:$FrontendPort"
            public_url = $frontendPublicUrl
        }
        backend_tunnel = [ordered]@{
            pid = $backendTunnel.Id
            public_url = $backendPublicUrl
        }
        frontend_tunnel = [ordered]@{
            pid = $frontendTunnel.Id
            public_url = $frontendPublicUrl
        }
        logs = [ordered]@{
            backend = $BackendLog
            frontend = $FrontendLog
            backend_tunnel = $BackendTunnelLog
            frontend_tunnel = $FrontendTunnelLog
        }
    }

    $state | ConvertTo-Json -Depth 6 | Set-Content -Path $StatePath -Encoding UTF8

    Write-Host ""
    Write-Host "Mobile preview is ready."
    Write-Host ""
    Write-Host "Open this URL on your phone:"
    Write-Host $frontendPublicUrl
    Write-Host ""
    Write-Host "Backend tunnel:"
    Write-Host $backendPublicUrl
    Write-Host ""
    Write-Host "Stop with:"
    Write-Host ".\scripts\stop_mobile_preview.ps1"
}
catch {
    Write-Host ""
    Write-Host "Mobile preview failed to start."
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "Logs are in:"
    Write-Host $TmpDir
    Stop-TrackedProcesses -Processes $processes
    exit 1
}
