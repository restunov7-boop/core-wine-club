param(
    [switch]$Clean
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$TmpDir = Join-Path $RepoRoot ".tmp\mobile-preview"
$StatePath = Join-Path $TmpDir "pids.json"

function Stop-MobilePreviewPid {
    param(
        [object]$Value,
        [string]$Name
    )

    if ($null -eq $Value) {
        return
    }

    $processId = [int]$Value
    if ($processId -le 0) {
        return
    }

    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if ($null -eq $process) {
        return
    }

    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Write-Host "[mobile-preview] stopped $Name (PID $processId)"
}

if (Test-Path $StatePath) {
    $state = Get-Content -Path $StatePath -Raw | ConvertFrom-Json

    Stop-MobilePreviewPid -Value $state.frontend_tunnel.pid -Name "frontend tunnel"
    Stop-MobilePreviewPid -Value $state.backend_tunnel.pid -Name "backend tunnel"
    Stop-MobilePreviewPid -Value $state.frontend.pid -Name "frontend"
    Stop-MobilePreviewPid -Value $state.backend.pid -Name "backend"
}
else {
    Write-Host "[mobile-preview] no pids.json found"
}

if ($Clean) {
    if (Test-Path $TmpDir) {
        Remove-Item -LiteralPath $TmpDir -Recurse -Force
    }
}

Write-Host "Mobile preview stopped."
