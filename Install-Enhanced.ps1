#Requires -Version 5.1

<#
.SYNOPSIS
    Yurei CLI Installer for Windows (Enhanced)
.DESCRIPTION
    Installs Yurei CLI globally on Windows systems with enhanced checks and messages.
.NOTES
    Version: 2.0.1 (Improved)
    Author: Sayang Ku
#>

[CmdletBinding()]
param(
    [switch]$Force,
    [switch]$SkipDependencies,
    [string]$InstallPath = $null
)

$ErrorActionPreference = "Stop"

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    $colorMap = @{
        "Red" = [ConsoleColor]::Red
        "Green" = [ConsoleColor]::Green
        "Yellow" = [ConsoleColor]::Yellow
        "Blue" = [ConsoleColor]::Blue
        "Magenta" = [ConsoleColor]::Magenta
        "Cyan" = [ConsoleColor]::Cyan
        "White" = [ConsoleColor]::White
        "Gray" = [ConsoleColor]::Gray
    }
    Write-Host $Text -ForegroundColor $colorMap[$Color]
}

function Write-Step { param($Message) Write-ColorText "🔄 $Message" "Yellow" }
function Write-Success { param($Message) Write-ColorText "✅ $Message" "Green" }
function Write-Error-Custom { param($Message) Write-ColorText "❌ $Message" "Red" }
function Write-Info { param($Message) Write-ColorText "ℹ️ $Message" "Blue" }

function Test-Prerequisites {
    Write-Step "Checking prerequisites..."

    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -ne 0) { throw "Node.js not found" }
        Write-Success "Node.js found: $nodeVersion"
    } catch {
        Write-Error-Custom "Node.js is required but not installed."
        Write-Info "Please install Node.js from https://nodejs.org/"
        exit 1
    }

    try {
        $npmVersion = npm --version 2>$null
        if ($LASTEXITCODE -ne 0) { throw "npm not found" }
        Write-Success "npm found: v$npmVersion"
    } catch {
        Write-Error-Custom "npm is required but not found."
        exit 1
    }

    if (-not (Test-Path "package.json")) {
        Write-Error-Custom "package.json not found. Run this script from Yurei CLI root directory."
        exit 1
    }

    Write-Success "All prerequisites met"
}

function Get-InstallationPaths {
    if ($InstallPath) {
        $yureiDir = $InstallPath
    } else {
        $yureiDir = Join-Path $env:LOCALAPPDATA "Yurei"
    }
    return @{
        YureiDir = $yureiDir
        BinDir = Join-Path $yureiDir "bin"
        CmdFile = Join-Path (Join-Path $yureiDir "bin") "yurei.cmd"
        NodeModules = Join-Path $yureiDir "node_modules"
    }
}

function Install-Dependencies {
    Write-Step "Installing dependencies..."
    try {
        npm install --silent
        if ($LASTEXITCODE -ne 0) { throw "npm install failed with exit code $LASTEXITCODE" }
        Write-Success "Dependencies installed successfully"
    } catch {
        Write-Error-Custom "Failed to install dependencies: $($_.Exception.Message)"
        throw
    }
}

function New-InstallationDirectories {
    param($Paths)
    Write-Step "Creating installation directories..."
    try {
        if (Test-Path $Paths.YureiDir) {
            if ($Force) {
                Remove-Item $Paths.YureiDir -Recurse -Force
                Write-Info "Removed existing installation"
            } else {
                $response = Read-Host "Installation directory exists. Overwrite? (y/N)"
                if ($response -notin @("y","Y")) {
                    Write-Info "Installation cancelled by user"
                    exit 0
                }
                Remove-Item $Paths.YureiDir -Recurse -Force
            }
        }
        New-Item -ItemType Directory -Path $Paths.YureiDir -Force | Out-Null
        New-Item -ItemType Directory -Path $Paths.BinDir -Force | Out-Null
        Write-Success "Installation directories created"
    } catch {
        Write-Error-Custom "Failed to create directories: $($_.Exception.Message)"
        throw
    }
}

function Copy-ProjectFiles {
    param($Paths)
    Write-Step "Copying project files..."
    try {
        $excludeItems = @(
            "Install.ps1",
            "Install-Enhanced.ps1",
            "install-universal.sh",
            ".git*",
            "node_modules",
            "*.log",
            "*.tmp"
        )
        Get-ChildItem -Path "." | Where-Object {
            $item = $_
            -not ($excludeItems | Where-Object { $item.Name -like $_ })
        } | ForEach-Object {
            Copy-Item -Path $_.FullName -Destination $Paths.YureiDir -Recurse -Force
        }
        Write-Success "Project files copied successfully"
    } catch {
        Write-Error-Custom "Failed to copy files: $($_.Exception.Message)"
        throw
    }
}

function Install-ProductionDependencies {
    param($Paths)
    Write-Step "Installing production dependencies..."
    try {
        Push-Location $Paths.YureiDir
        npm install --production --silent
        if ($LASTEXITCODE -ne 0) { throw "npm install --production failed" }
        Write-Success "Production dependencies installed"
    } catch {
        Write-Error-Custom "Failed to install production dependencies: $($_.Exception.Message)"
        throw
    } finally {
        Pop-Location
    }
}

function New-CommandWrapper {
    param($Paths)
    Write-Step "Creating command wrapper..."
    try {
        $batchContent = @'
@echo off
setlocal
set "YUREI_HOME=%LOCALAPPDATA%\Yurei"
if exist "%YUREI_HOME%\bin\yurei.js" (
    node "%YUREI_HOME%\bin\yurei.js" %*
) else (
    echo Error: Yurei CLI not found at %YUREI_HOME%
    echo Please reinstall Yurei CLI
    exit /b 1
)
'@
        $batchContent | Out-File -FilePath $Paths.CmdFile -Encoding ASCII -Force
        Write-Success "Command wrapper created"
    } catch {
        Write-Error-Custom "Failed to create command wrapper: $($_.Exception.Message)"
        throw
    }
}

function Add-ToPath {
    param($Paths)
    Write-Step "Adding to PATH..."
    try {
        $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
        if ($currentPath -notlike "*$($Paths.BinDir)*") {
            $newPath = if ($currentPath.EndsWith(";")) {
                "$currentPath$($Paths.BinDir)"
            } else {
                "$currentPath;$($Paths.BinDir)"
            }
            [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
            Write-Success "Added to user PATH"
            $env:PATH += ";$($Paths.BinDir)"
            Write-Info "Current session PATH updated"
        } else {
            Write-Info "Already in PATH"
        }
    } catch {
        Write-Error-Custom "Failed to add to PATH: $($_.Exception.Message)"
        throw
    }
}

function Test-Installation {
    param($Paths)
    Write-Step "Verifying installation..."
    try {
        if (-not (Test-Path $Paths.CmdFile)) { throw "Command file not found" }
        if (-not (Test-Path (Join-Path $Paths.YureiDir "bin\yurei.js"))) { throw "Main script not found" }
        if (-not (Test-Path $Paths.NodeModules)) { throw "Node modules not found" }
        Write-Success "Installation verified successfully"
    } catch {
        Write-Error-Custom "Installation verification failed: $($_.Exception.Message)"
        throw
    }
}

function Show-SuccessMessage {
    param($Paths)
    Write-Host ""
    Write-ColorText "🎉 Yurei CLI Installation Complete!" "Green"
    Write-ColorText "====================================" "Green"
    Write-Host ""
    Write-ColorText "📍 Installed to: $($Paths.YureiDir)" "Cyan"
    Write-ColorText "🔗 Command available: yurei" "Cyan"
    Write-Host ""
    Write-ColorText "🚀 Next Steps:" "Yellow"
    Write-ColorText "  1. Restart your terminal (or run: refreshenv)" "White"
    Write-ColorText "  2. Run: yurei menu" "White"
    Write-ColorText "  3. Enjoy using Yurei CLI!" "White"
    Write-Host ""
    Write-ColorText "💡 Troubleshooting:" "Blue"
    Write-ColorText "  • If 'yurei' command not found, restart terminal" "Gray"
    Write-ColorText "  • Check PATH contains: $($Paths.BinDir)" "Gray"
    Write-ColorText "  • Run 'yurei whoami' to test installation" "Gray"
    Write-Host ""
}

function Show-LogoAndSystemInfo {
    Clear-Host

    $logo = @"
       __     __   ____   ____  
       \ \   / /  |  _ \ |  _ \ 
        \ \ / /   | |_) || |_) |
         \ V /    |  _ < |  __/ 
          \_/     |_| \_\|_|    
"@

    Write-ColorText $logo "Cyan"
    Write-Host ""

    try {
        $os = (Get-CimInstance Win32_OperatingSystem).Caption
        $cpu = (Get-CimInstance Win32_Processor | Select-Object -First 1).Name
        $ramGB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
        $disk = Get-CimInstance Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 } | Select-Object -First 1
        $diskSizeGB = [math]::Round($disk.Size / 1GB, 2)
        $diskFreeGB = [math]::Round($disk.FreeSpace / 1GB, 2)
        $user = $env:USERNAME
        $hostname = $env:COMPUTERNAME
    } catch {
        Write-ColorText "Failed to retrieve system info." "Red"
        return
    }

    Write-ColorText "System Information:" "Yellow"
    Write-Host "User: $user"
    Write-Host "Hostname: $hostname"
    Write-Host "OS: $os"
    Write-Host "CPU: $cpu"
    Write-Host "RAM: $ramGB GB"
    Write-Host "Disk: $diskFreeGB GB free / $diskSizeGB GB total"
    Write-Host ""
    Write-ColorText "Thank you for installing Yurei CLI!" "Green"
}

function Install-YureiCLI {
    try {
        Write-ColorText "🌸 Yurei CLI Installer for Windows v2.0.1" "Magenta"
        Write-ColorText "============================================" "Magenta"
        Write-Host ""

        Test-Prerequisites

        $paths = Get-InstallationPaths
        Write-Info "Target installation: $($paths.YureiDir)"
        Write-Host ""

        if (-not $SkipDependencies) {
            Install-Dependencies
        }

        New-InstallationDirectories -Paths $paths
        Copy-ProjectFiles -Paths $paths
        Install-ProductionDependencies -Paths $paths
        New-CommandWrapper -Paths $paths
        Add-ToPath -Paths $paths
        Test-Installation -Paths $paths
        Show-SuccessMessage -Paths $paths

        Show-LogoAndSystemInfo
        
    } catch {
        Write-Error-Custom "Installation failed: $($_.Exception.Message)"
        Write-ColorText "Stack trace: $($_.ScriptStackTrace)" "Gray"
        exit 1
    }
}

Install-YureiCLI