#Requires -Version 5.1

<#
.SYNOPSIS
    Yurei CLI Installer for Windows
.DESCRIPTION
    Installs Yurei CLI globally on Windows systems
.NOTES
    Version: 2.0.0
    Author: Sayang Ku
#>

[CmdletBinding()]
param(
    [switch]$Force,
    [switch]$SkipDependencies,
    [string]$InstallPath = $null
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors and formatting
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

function Write-Step {
    param([string]$Message)
    Write-ColorText "🔄 $Message" "Yellow"
}

function Write-Success {
    param([string]$Message)
    Write-ColorText "✅ $Message" "Green"
}

function Write-Error-Custom {
    param([string]$Message)
    Write-ColorText "❌ $Message" "Red"
}

function Write-Info {
    param([string]$Message)
    Write-ColorText "ℹ️ $Message" "Blue"
}

# Main installation function
function Install-YureiCLI {
    try {
        # Header
        Write-ColorText "🌸 Yurei CLI Installer for Windows v2.0.0" "Magenta"
        Write-ColorText "============================================" "Magenta"
        Write-Host ""
        
        # Check prerequisites
        Test-Prerequisites
        
        # Define paths
        $paths = Get-InstallationPaths
        Write-Info "Target installation: $($paths.YureiDir)"
        Write-Host ""
        
        # Install dependencies
        if (-not $SkipDependencies) {
            Install-Dependencies
        }
        
        # Create directories
        New-InstallationDirectories -Paths $paths
        
        # Copy files
        Copy-ProjectFiles -Paths $paths
        
        # Install production dependencies
        Install-ProductionDependencies -Paths $paths
        
        # Create command wrapper
        New-CommandWrapper -Paths $paths
        
        # Add to PATH
        Add-ToPath -Paths $paths
        
        # Verify installation
        Test-Installation -Paths $paths
        
        # Success message
        Show-SuccessMessage -Paths $paths
        
    } catch {
        Write-Error-Custom "Installation failed: $($_.Exception.Message)"
        Write-ColorText "Stack trace: $($_.ScriptStackTrace)" "Gray"
        exit 1
    }
}

function Test-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Node.js found: $nodeVersion"
        } else {
            throw "Node.js not found"
        }
    } catch {
        Write-Error-Custom "Node.js is required but not installed."
        Write-Info "Please install Node.js from https://nodejs.org/"
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "npm found: v$npmVersion"
        } else {
            throw "npm not found"
        }
    } catch {
        Write-Error-Custom "npm is required but not found."
        exit 1
    }
    
    # Check if package.json exists
    if (-not (Test-Path "package.json")) {
        Write-Error-Custom "package.json not found. Please run this script from the Yurei CLI directory."
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
        if ($LASTEXITCODE -ne 0) {
            throw "npm install failed with exit code $LASTEXITCODE"
        }
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
                if ($response -ne "y" -and $response -ne "Y") {
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
        if ($LASTEXITCODE -ne 0) {
            throw "npm install --production failed"
        }
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
            
            # Update current session
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
        if (-not (Test-Path $Paths.CmdFile)) {
            throw "Command file not found"
        }
        
        if (-not (Test-Path (Join-Path $Paths.YureiDir "bin\yurei.js"))) {
            throw "Main script not found"
        }
        
        if (-not (Test-Path $Paths.NodeModules)) {
            throw "Node modules not found"
        }
        
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

# Run installation
Install-YureiCLI