   $systemData = OS(
            { Label = "User", Value = $username },
            { Label = "Hostname", Value = $hostname },
            { Label = "OS", Value = if ($osInfo) { $osInfo.Caption } else { "Windows" } },
            { Label = "Kernel", Value = if ($osInfo) { $osInfo.Version } else { $env:PROCESSOR_ARCHITECTURE } },
            { Label = "Uptime", Value = "$uptimeHours hours" },
            { Label = "Shell", Value = "PowerShell","CMD" },
            { Label = "Terminal", Value = if ($env:TERM_PROGRAM) { $env:TERM_PROGRAM } else { "Windows Terminal" } },
            { Label = "CPU",Value = if ($cpuInfo) { $cpuInfo.Name.Substring(0, [Math]::Min(40, $cpuInfo.Name.Length)) } else { "Unknown" } },
            { Label = "RAM", Value = "$usedMemGB GB / $totalMemGB GB" },
            { Label = "Disk", Value = "$diskUsedGB GB / $diskTotalGB GB" },
            { Label = "Node.js"; Value = $nodeVersion }
        )