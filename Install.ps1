# 🌸 Yurei CLI Installer for Windows
Write-Host "🌸 Yurei CLI Installer for Windows" -ForegroundColor Magenta
Write-Host "-----------------------------------"

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

# Define installation paths
$localAppData = $env:LOCALAPPDATA
$yureiDir = Join-Path $localAppData "Yurei"
$yureiBin = Join-Path $yureiDir "bin"
$yureiExe = Join-Path $yureiBin "yurei.cmd"

Write-Host "📍 Target installation: $yureiDir" -ForegroundColor Cyan

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Gagal install dependency."
    exit 1
}

# Create installation directory
Write-Host "📁 Creating installation directory..." -ForegroundColor Yellow
if (!(Test-Path $yureiDir)) {
    New-Item -ItemType Directory -Path $yureiDir -Force | Out-Null
}
if (!(Test-Path $yureiBin)) {
    New-Item -ItemType Directory -Path $yureiBin -Force | Out-Null
}

# Copy files to installation directory
Write-Host "📋 Copying files..." -ForegroundColor Yellow
Copy-Item -Path ".\*" -Destination $yureiDir -Recurse -Force -Exclude @("Install.ps1", "install-universal.sh", ".git*", "node_modules")

# Reinstall dependencies in target location
Push-Location $yureiDir
npm install --production
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Gagal install dependency di lokasi target."
    Pop-Location
    exit 1
}
Pop-Location

# Create batch wrapper
Write-Host "🔧 Creating command wrapper..." -ForegroundColor Yellow
$batchContent = @"
@echo off
node "$yureiDir\bin\yurei.js" %*
"@
$batchContent | Out-File -FilePath $yureiExe -Encoding ASCII

# Add to PATH
Write-Host "🔗 Adding to PATH..." -ForegroundColor Yellow
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*$yureiBin*") {
    $newPath = "$currentPath;$yureiBin"
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
    Write-Host "✅ Added to user PATH" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Already in PATH" -ForegroundColor Blue
}

# Update current session PATH
$env:PATH += ";$yureiBin"

Write-Host ""
Write-Host "🎉 Instalasi berhasil!" -ForegroundColor Green
Write-Host "📍 Installed to: $yureiDir" -ForegroundColor Cyan
Write-Host "🚀 Restart terminal atau jalankan: refreshenv" -ForegroundColor Yellow
Write-Host "✨ Kemudian gunakan: yurei menu" -ForegroundColor Magenta
Write-Host ""
Write-Host "💡 Tip: Jika command tidak ditemukan, restart terminal Anda." -ForegroundColor Blue