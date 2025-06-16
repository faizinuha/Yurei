#Requires -Version 5.1
param([switch]$Force)

# Yurei CLI Installer - Fixed Version
$ErrorActionPreference = "Stop"

Write-Host "=== Yurei CLI Installer ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = & node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "ERROR: Node.js required!" -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Paths
$installDir = "$env:LOCALAPPDATA\Yurei"
$binDir = "$installDir\bin"
$cmdFile = "$binDir\yurei.cmd"

Write-Host "Install location: $installDir" -ForegroundColor Cyan

# Remove existing if Force
if ($Force -and (Test-Path $installDir)) {
    Write-Host "Removing existing installation..." -ForegroundColor Yellow
    Remove-Item $installDir -Recurse -Force
}

# Create directories
Write-Host "Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $installDir -Force | Out-Null
New-Item -ItemType Directory -Path $binDir -Force | Out-Null

# Download and extract
Write-Host "Downloading Yurei CLI..." -ForegroundColor Yellow
$tempZip = "$env:TEMP\yurei.zip"
$tempDir = "$env:TEMP\yurei-extract"

try {
    # Download with correct URL
    $downloadUrl = "https://github.com/faizinuha/Yuri-Install/archive/refs/heads/main.zip"
    Invoke-WebRequest -Uri $downloadUrl -OutFile $tempZip -UseBasicParsing
    Write-Host "Download completed" -ForegroundColor Green
    
    # Clean temp directory
    if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
    
    # Extract
    Write-Host "Extracting files..." -ForegroundColor Yellow
    Expand-Archive -Path $tempZip -DestinationPath $tempDir -Force
    
    # Find extracted folder (should be "Yuri-Install-main")
    $sourceDir = Get-ChildItem $tempDir -Directory | Where-Object { $_.Name -like "*Yuri-Install*" } | Select-Object -First 1
    
    if (-not $sourceDir) {
        throw "Could not find extracted directory"
    }
    
    Write-Host "Found source: $($sourceDir.Name)" -ForegroundColor Green
    
    # Copy files (exclude installer files)
    Write-Host "Installing files..." -ForegroundColor Yellow
    $excludeItems = @("Install*.ps1", "install*.sh", ".git*", "*.md", "SECURITY.md")
    
    Get-ChildItem "$($sourceDir.FullName)" | Where-Object {
        $item = $_
        -not ($excludeItems | Where-Object { $item.Name -like $_ })
    } | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $installDir -Recurse -Force
    }
    
    # Install dependencies
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Push-Location $installDir
    & npm install --production --silent
    if ($LASTEXITCODE -ne 0) { 
        Pop-Location
        throw "npm install failed" 
    }
    Pop-Location
    Write-Host "Dependencies installed" -ForegroundColor Green
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Cleanup
    if (Test-Path $tempZip) { Remove-Item $tempZip -Force -ErrorAction SilentlyContinue }
    if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue }
}

# Create command wrapper
Write-Host "Creating command..." -ForegroundColor Yellow
@'
@echo off
setlocal
if exist "%LOCALAPPDATA%\Yurei\bin\yurei.js" (
    node "%LOCALAPPDATA%\Yurei\bin\yurei.js" %*
) else (
    echo ERROR: Yurei CLI not found at %LOCALAPPDATA%\Yurei
    echo Please reinstall Yurei CLI
    exit /b 1
)
'@ | Out-File -FilePath $cmdFile -Encoding ASCII -Force

# Add to PATH
Write-Host "Adding to PATH..." -ForegroundColor Yellow
$userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($userPath -notlike "*$binDir*") {
    $newPath = if ($userPath.EndsWith(";")) { "$userPath$binDir" } else { "$userPath;$binDir" }
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
    Write-Host "Added to PATH" -ForegroundColor Green
} else {
    Write-Host "Already in PATH" -ForegroundColor Blue
}

# Update current session
$env:PATH += ";$binDir"

# Verify installation
Write-Host "Verifying installation..." -ForegroundColor Yellow
$mainScript = "$installDir\bin\yurei.js"
if ((Test-Path $cmdFile) -and (Test-Path $mainScript)) {
    Write-Host ""
    Write-Host "SUCCESS! Yurei CLI installed" -ForegroundColor Green
    Write-Host "=========================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Command: yurei menu" -ForegroundColor Cyan
    Write-Host "Location: $installDir" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Restart terminal" -ForegroundColor White
    Write-Host "2. Run: yurei menu" -ForegroundColor White
    Write-Host ""
    Write-Host "If command not found, restart terminal!" -ForegroundColor Blue
} else {
    Write-Host "ERROR: Installation verification failed" -ForegroundColor Red
    Write-Host "Missing files:" -ForegroundColor Red
    if (-not (Test-Path $cmdFile)) { Write-Host "- $cmdFile" -ForegroundColor Red }
    if (-not (Test-Path $mainScript)) { Write-Host "- $mainScript" -ForegroundColor Red }
    exit 1
}