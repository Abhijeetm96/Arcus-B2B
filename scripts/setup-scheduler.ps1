# Arcus Git Autocommit Scheduler Setup Script
# This registers a Windows Scheduled Task to run the autocommit script every 30 minutes.

$ScriptPath = Join-Path (Get-Location) "scripts\git-autocommit.cjs"

if (-not (Test-Path $ScriptPath)) {
    Write-Error "Could not find git-autocommit.cjs at $ScriptPath"
    exit 1
}

$Action = New-ScheduledTaskAction -Execute "node" -Argument "`"$ScriptPath`"" -WorkingDirectory (Get-Location)
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 30)

Write-Host "Registering Scheduled Task 'ArcusAutocommit' to run every 30 minutes..." -ForegroundColor Cyan

try {
    Register-ScheduledTask -TaskName "ArcusAutocommit" -Action $Action -Trigger $Trigger -Description "Auto-scans, commits and pushes changes to Git every 30 minutes." -Force
    Write-Host "Successfully registered task! You can view it in Windows Task Scheduler." -ForegroundColor Green
} catch {
    Write-Error "Failed to register task. Please verify you are running this in an Administrator shell."
}
