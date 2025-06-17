#Requires -Version 5.1
param([switch]$Force)

# Yurei CLI Installer with Fixed System Info Display
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
    
    # Find extracted folder
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
    
    # === FIXED SYSTEM INFO DISPLAY ===
    Write-Host "System Information:" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        # Get system info safely
        $hostname = $env:COMPUTERNAME.ToLower()
        $username = $env:USERNAME.ToLower()
        $osInfo = Get-CimInstance -ClassName Win32_OperatingSystem -ErrorAction SilentlyContinue
        $cpuInfo = Get-CimInstance -ClassName Win32_Processor -ErrorAction SilentlyContinue | Select-Object -First 1
        $memInfo = Get-CimInstance -ClassName Win32_ComputerSystem -ErrorAction SilentlyContinue
        $diskInfo = Get-CimInstance -ClassName Win32_LogicalDisk -ErrorAction SilentlyContinue | Where-Object { $_.DriveType -eq 3 } | Select-Object -First 1
        
        # Calculate memory safely
        $totalMemGB = if ($memInfo) { [math]::Round($memInfo.TotalPhysicalMemory / 1GB, 1) } else { "N/A" }
        $freeMemGB = if ($osInfo) { [math]::Round($osInfo.FreePhysicalMemory / 1MB / 1024, 1) } else { "N/A" }
        $usedMemGB = if ($totalMemGB -ne "N/A" -and $freeMemGB -ne "N/A") { [math]::Round($totalMemGB - $freeMemGB, 1) } else { "N/A" }
        
        # Calculate disk safely
        $diskTotalGB = if ($diskInfo) { [math]::Round($diskInfo.Size / 1GB) } else { "N/A" }
        $diskFreeGB = if ($diskInfo) { [math]::Round($diskInfo.FreeSpace / 1GB) } else { "N/A" }
        $diskUsedGB = if ($diskTotalGB -ne "N/A" -and $diskFreeGB -ne "N/A") { $diskTotalGB - $diskFreeGB } else { "N/A" }
        
        # Uptime safely
        $uptimeHours = if ($osInfo) { [math]::Floor(((Get-Date) - $osInfo.LastBootUpTime).TotalHours) } else { "N/A" }
        
        # Simple ASCII Art (Fixed)
        $asciiLines = @(
            "                          ",
            "        .oyhhs:           ",
            "     ..-......shhhhhhh-   ",
            "  -+++++++++++:yyhyyo     ",
            " -+++++++++++/-..-::      ",
            ".::::::-    :---:::/+++/++/",
            ".::::::.        :++++++:  ",
            "-::::::-.           .+++++++- ",
            "-::::::::             .++++++-",
            " -::::::-               //////:",
            "  -::::-                      ",
            "     .:::::-                   ",
            "       -ohhhhhhh+              ",
            "        :yhhhhhh:              ",
            "         /hhhhhhhv+....        ",
            "          /hhhhhhhhhh-         ",
            "           .:://:::-           "
        )
        
        # System info data
        $systemData = @(
            @{ Label = "User"; Value = $username },
            @{ Label = "Hostname"; Value = $hostname },
            @{ Label = "OS"; Value = if ($osInfo) { $osInfo.Caption } else { "Windows" } },
            @{ Label = "Kernel"; Value = if ($osInfo) { $osInfo.Version } else { $env:PROCESSOR_ARCHITECTURE } },
            @{ Label = "Uptime"; Value = "$uptimeHours hours" },
            @{ Label = "Shell"; Value = "PowerShell","CMD" },
            @{ Label = "Terminal"; Value = if ($env:TERM_PROGRAM) { $env:TERM_PROGRAM } else { "Windows Terminal" } },
            @{ Label = "CPU"; Value = if ($cpuInfo) { $cpuInfo.Name.Substring(0, [Math]::Min(40, $cpuInfo.Name.Length)) } else { "Unknown" } },
            @{ Label = "RAM"; Value = "$usedMemGB GB / $totalMemGB GB" },
            @{ Label = "Disk"; Value = "$diskUsedGB GB / $diskTotalGB GB" },
            @{ Label = "Node.js"; Value = $nodeVersion }
        )
        
        # Display side by side
        for ($i = 0; $i -lt [Math]::Max($asciiLines.Count, $systemData.Count); $i++) {
            $asciiLine = if ($i -lt $asciiLines.Count) { $asciiLines[$i] } else { " " * 26 }
            
            Write-Host $asciiLine -ForegroundColor Yellow -NoNewline
            
            if ($i -lt $systemData.Count) {
                $data = $systemData[$i]
                Write-Host "  " -NoNewline
                Write-Host "$($data.Label):" -ForegroundColor Red -NoNewline
                Write-Host " $($data.Value)" -ForegroundColor White
            } else {
                Write-Host ""
            }
        }
        
    } catch {
        # Fallback simple display
        Write-Host "User: $username" -ForegroundColor White
        Write-Host "Hostname: $hostname" -ForegroundColor White
        Write-Host "Node.js: $nodeVersion" -ForegroundColor White
        Write-Host "Installation: Success" -ForegroundColor Green
    }
    
    Write-Host "=================================================================="
    Write-Host "----- Selamat Datang DI Yurie Tool ----- " -ForegroundColor Cyan
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Restart terminal (or run: refreshenv)" -ForegroundColor White
    Write-Host "2. Run: yurei menu" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands available:" -ForegroundColor Yellow
    Write-Host "  yurei menu     - Main interactive menu" -ForegroundColor Gray
    Write-Host "  yurei whoami   - CLI information" -ForegroundColor Gray
    Write-Host "=================================================================="
    
} else {
    Write-Host "ERROR: Installation verification failed" -ForegroundColor Red
    Write-Host "Missing files:" -ForegroundColor Red
    if (-not (Test-Path $cmdFile)) { Write-Host "- $cmdFile" -ForegroundColor Red }
    if (-not (Test-Path $mainScript)) { Write-Host "- $mainScript" -ForegroundColor Red }
    exit 1
}