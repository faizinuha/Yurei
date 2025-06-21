#!/usr/bin/env node

import boxen from 'boxen';
import chalk from 'chalk';
import { exec } from 'child_process';
import { resolve4, resolveMx, resolveNs } from 'dns';
import figlet from 'figlet';
import { existsSync, readdirSync, statSync } from 'fs';
import gradient from 'gradient-string';
import { Socket } from 'net';
import {
  cpus as _cpus,
  arch,
  freemem,
  homedir,
  hostname,
  networkInterfaces,
  platform,
  release,
  tmpdir,
  totalmem,
  type,
  uptime,
  userInfo,
} from 'os';
import { join } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];
const params = args.slice(1);

// Main command handler
async function main() {
  if (
    !command ||
    command === 'help' ||
    command === '-h' ||
    command === '--help'
  ) {
    showHelp();
    return;
  }

  try {
    await executeCommand(command, params);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Command executor
async function executeCommand(cmd, params) {
  switch (cmd) {
    // Network Commands
    case 'ip':
      await getIPInfo();
      break;
    case 'ping':
      await pingHost(params[0] || 'google.com');
      break;
    case 'port':
      await checkPort(params[0], params[1]);
      break;
    case 'dns':
      await dnsLookup(params[0]);
      break;
    case 'speedtest':
      await networkSpeedTest();
      break;

    // Environment Commands
    case 'env':
      showEnvironmentVariables(params[0]);
      break;
    case 'setenv':
      await setEnvironmentVariable(params[0], params[1]);
      break;
    case 'path':
      showPathVariables();
      break;

    // System Info Commands
    case 'sysinfo':
      showSystemInfo();
      break;
    case 'cpu':
      showCPUInfo();
      break;
    case 'memory':
      showMemoryInfo();
      break;
    case 'disk':
      await showDiskInfo();
      break;
    case 'processes':
      await showProcesses(params[0]);
      break;

    // File System Commands
    case 'drives':
      await showDrives();
      break;
    case 'temp':
      showTempDirectory();
      break;
    case 'home':
      showHomeDirectory();
      break;
    case 'pwd':
      console.log(process.cwd());
      break;

    // Registry Commands (Windows)
    case 'registry':
      await registryOperation(params);
      break;

    // Service Commands
    case 'services':
      await showServices();
      break;
    case 'startup':
      await showStartupPrograms();
      break;

    // Security Commands
    case 'firewall':
      await firewallStatus();
      break;
    case 'users':
      await showUsers();
      break;

    // Utility Commands
    case 'open':
      await openLocation(params[0]);
      break;
    case 'kill':
      await killProcess(params[0]);
      break;
    case 'restart':
      await restartSystem(params[0]);
      break;

    default:
      console.log(`❌ Unknown command: ${cmd}`);
      console.log("💡 Use 'ysys help' to see available commands");
  }
}

// Network Commands Implementation
async function getIPInfo() {
  // Create cool header
  console.log(
    gradient.pastel.multiline(figlet.textSync('Network', { font: 'Speed' }))
  );

  console.log(
    boxen(chalk.cyan('🌐 NETWORK STATUS CHECK'), {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'cyan',
    })
  );

  try {
    // Local IP
    const interfaces = networkInterfaces();
    console.log(
      boxen(chalk.magenta('📡 LOCAL NETWORK'), {
        padding: 1,
        margin: { left: 2, right: 2 },
        borderStyle: 'round',
        borderColor: 'magenta',
      })
    );

    Object.entries(interfaces).forEach(([name, addrs]) => {
      addrs.forEach((addr) => {
        if (!addr.internal && addr.family === 'IPv4') {
          console.log(
            chalk.green(
              `  ${chalk.bold('⚡ Interface')}: ${chalk.yellow(name)}`
            )
          );
          console.log(
            chalk.green(
              `  ${chalk.bold('�IP Address')}: ${chalk.yellow(addr.address)}`
            )
          );
          console.log(
            chalk.green(
              `  ${chalk.bold('📡 Subnet')}: ${chalk.yellow(addr.netmask)}`
            )
          );
          console.log();
        }
      });
    });

    // Public IP
    try {
      const { stdout } = await execAsync('curl -s ifconfig.me');
      console.log(
        boxen(chalk.blue('🌍 INTERNET CONNECTION'), {
          padding: 1,
          margin: { left: 2, right: 2 },
          borderStyle: 'round',
          borderColor: 'blue',
        })
      );
      console.log(
        chalk.green(
          `  ${chalk.bold('🌐 Public IP')}: ${chalk.yellow(stdout.trim())}`
        )
      );
    } catch {
      console.log(chalk.red('  ❌ Unable to fetch public IP'));
    }

    // Default Gateway
    if (platform() === 'win32') {
      try {
        const { stdout } = await execAsync('ipconfig | findstr /i gateway');
        console.log(
          boxen(chalk.yellow('🚪 GATEWAY INFO'), {
            padding: 1,
            margin: { left: 2, right: 2 },
            borderStyle: 'round',
            borderColor: 'yellow',
          })
        );
        const gateways = stdout.trim().split('\n');
        gateways.forEach((gateway) => {
          console.log(
            chalk.green(`  ${chalk.bold('🔗')} ${chalk.yellow(gateway.trim())}`)
          );
        });
      } catch {
        console.log(chalk.red('  ❌ Unable to fetch gateway info'));
      }
    }

    // Add cool footer
    console.log('\n' + gradient.rainbow('━'.repeat(50)));
    console.log(
      boxen(chalk.cyan('💫 Network scan completed successfully! 💫'), {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        float: 'center',
      })
    );
  } catch (error) {
    console.error(chalk.red(`❌ Error getting IP info: ${error.message}`));
  }
}

async function pingHost(host) {
  if (!host) {
    console.log('❌ Please specify a host to ping');
    console.log('💡 Usage: ysys ping google.com');
    return;
  }

  console.log(`🏓 Pinging ${host}...`);

  const pingCmd =
    platform() === 'win32' ? `ping -n 4 ${host}` : `ping -c 4 ${host}`;

  try {
    const { stdout } = await execAsync(pingCmd);
    console.log(stdout);
  } catch (error) {
    console.error(`❌ Ping failed: ${error.message}`);
  }
}

async function checkPort(host, port) {
  if (!host || !port) {
    console.log('❌ Please specify host and port');
    console.log('💡 Usage: ysys port google.com 80');
    return;
  }

  console.log(`🔍 Checking ${host}:${port}...`);

  const socket = new Socket();
  const timeout = 5000;

  return new Promise((resolve) => {
    socket.setTimeout(timeout);

    socket.on('connect', () => {
      console.log(`✅ Port ${port} is open on ${host}`);
      socket.destroy();
      resolve();
    });

    socket.on('timeout', () => {
      console.log(`❌ Port ${port} is closed or filtered on ${host}`);
      socket.destroy();
      resolve();
    });

    socket.on('error', () => {
      console.log(`❌ Port ${port} is closed on ${host}`);
      resolve();
    });

    socket.connect(port, host);
  });
}

async function dnsLookup(domain) {
  if (!domain) {
    console.log('❌ Please specify a domain');
    console.log('💡 Usage: ysys dns google.com');
    return;
  }

  console.log(`🔍 DNS Lookup for ${domain}`);
  console.log('==========================');

  try {
    // A Record
    const addresses = await promisify(resolve4)(domain);
    console.log('A Records:');
    addresses.forEach((addr) => console.log(`  ${addr}`));

    // MX Record
    try {
      const mx = await promisify(resolveMx)(domain);
      console.log('MX Records:');
      mx.forEach((record) =>
        console.log(`  ${record.exchange} (priority: ${record.priority})`)
      );
    } catch {
      console.log('MX Records: None found');
    }

    // NS Record
    try {
      const ns = await promisify(resolveNs)(domain);
      console.log('NS Records:');
      ns.forEach((server) => console.log(`  ${server}`));
    } catch {
      console.log('NS Records: None found');
    }
  } catch (error) {
    console.error(`❌ DNS lookup failed: ${error.message}`);
  }
}

async function networkSpeedTest() {
  console.log('🚀 Network Speed Test');
  console.log('====================');
  console.log(
    '💡 This is a basic test. For accurate results, use dedicated tools.'
  );

  try {
    const start = Date.now();
    await execAsync(
      'curl -s -o nul http://speedtest.wdc01.softlayer.com/downloads/test10.zip'
    );
    const end = Date.now();
    const duration = (end - start) / 1000;
    const speed = (10 * 8) / duration; // Mbps approximation
    console.log(`📊 Approximate Download Speed: ${speed.toFixed(2)} Mbps`);
  } catch {
    console.log('❌ Speed test failed. Check your internet connection.');
  }
}

// Environment Commands Implementation
function showEnvironmentVariables(filter) {
  // Create cool header
  console.log(
    gradient.passion.multiline(figlet.textSync('ENV', { font: 'Block' }))
  );

  console.log(
    boxen(chalk.greenBright('🌿 Environment Variables Explorer'), {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'green',
    })
  );

  const env = process.env;
  const keys = Object.keys(env).sort();

  // Group variables by common prefixes
  const groups = {};
  keys.forEach((key) => {
    if (!filter || key.toLowerCase().includes(filter.toLowerCase())) {
      const prefix = key.split('_')[0];
      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push(key);
    }
  });

  // Display grouped variables
  Object.entries(groups).forEach(([prefix, groupKeys]) => {
    console.log(
      boxen(chalk.yellow(`📁 ${prefix} Variables`), {
        padding: 1,
        margin: { left: 2, right: 2 },
        borderStyle: 'round',
        borderColor: 'yellow',
      })
    );

    groupKeys.forEach((key) => {
      const value = env[key];
      console.log(chalk.green(`  ${chalk.bold('🔑')} ${chalk.cyan(key)}`));
      console.log(chalk.green(`  ${chalk.bold('📄')} ${chalk.white(value)}`));
      console.log();
    });
  });

  // Add cool footer
  console.log('\n' + gradient.cristal('━'.repeat(50)));
  if (filter) {
    console.log(
      boxen(chalk.magenta(`🔍 Filtered by: "${filter}"`), {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'magenta',
      })
    );
  }
}

async function setEnvironmentVariable(key, value) {
  // Create cool header
  console.log(
    gradient.mind.multiline(figlet.textSync('SET ENV', { font: 'Small' }))
  );
  if (!key || !value) {
    console.log(
      boxen(chalk.red('⚠️  Missing Parameters'), {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'red',
      })
    );
    console.log(chalk.yellow('💡 Usage: ysys setenv MY_VAR my_value'));
    return;
  }

  console.log(
    boxen(chalk.cyan(`Setting Environment Variable`), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
    })
  );

  if (platform() === 'win32') {
    try {
      await execAsync(`setx ${key} "${value}"`);
      console.log(
        boxen(
          chalk.green(`✅ Successfully Set Variable\n\n`) +
            chalk.white(`🔑 Key: ${chalk.cyan(key)}\n`) +
            chalk.white(`📄 Value: ${chalk.yellow(value)}`),
          { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'green' }
        )
      );
      console.log(
        chalk.magenta('💡 Tip: Restart your terminal to see the changes')
      );
    } catch (error) {
      console.log(
        boxen(chalk.red(`❌ Failed to set variable\n\n${error.message}`), {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'red',
        })
      );
    }
  } else {
    console.log(
      boxen(
        chalk.yellow('📝 Unix System Detected\n\n') +
          chalk.white('Add this to your shell profile:\n\n') +
          chalk.green(`export ${key}="${value}"`),
        { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'yellow' }
      )
    );
  }
}

function showPathVariables() {
  // Create cool header
  console.log(
    gradient.rainbow.multiline(figlet.textSync('PATH', { font: 'Standard' }))
  );
  console.log(
    boxen(chalk.blueBright('🛣️  PATH Variables Explorer'), {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'blue',
    })
  );

  const pathVar = process.env.PATH || process.env.Path;
  const paths = pathVar.split(platform() === 'win32' ? ';' : ':');

  // Group paths by type
  const systemPaths = [];
  const userPaths = [];
  const customPaths = [];

  paths.forEach((p) => {
    if (p.toLowerCase().includes('system')) {
      systemPaths.push(p);
    } else if (p.toLowerCase().includes('users')) {
      userPaths.push(p);
    } else {
      customPaths.push(p);
    }
  });

  // Display system paths
  if (systemPaths.length > 0) {
    console.log(
      boxen(chalk.yellow('⚙️  System Paths'), {
        padding: 1,
        margin: { left: 2, right: 2 },
        borderStyle: 'round',
        borderColor: 'yellow',
      })
    );
    systemPaths.forEach((p, index) => {
      const exists = existsSync(p) ? '✅' : '❌';
      console.log(chalk.green(`  ${exists} ${chalk.cyan(p)}`));
    });
  }

  // Display user paths
  if (userPaths.length > 0) {
    console.log(
      boxen(chalk.magenta('👤 User Paths'), {
        padding: 1,
        margin: { left: 2, right: 2 },
        borderStyle: 'round',
        borderColor: 'magenta',
      })
    );
    userPaths.forEach((p, index) => {
      const exists = existsSync(p) ? '✅' : '❌';
      console.log(chalk.green(`  ${exists} ${chalk.cyan(p)}`));
    });
  }

  // Display custom paths
  if (customPaths.length > 0) {
    console.log(
      boxen(chalk.blue('🔧 Custom Paths'), {
        padding: 1,
        margin: { left: 2, right: 2 },
        borderStyle: 'round',
        borderColor: 'blue',
      })
    );
    customPaths.forEach((p, index) => {
      const exists = existsSync(p) ? '✅' : '❌';
      console.log(chalk.green(`  ${exists} ${chalk.cyan(p)}`));
    });
  }

  // Add summary
  console.log('\n' + gradient.cristal('━'.repeat(50)));
  console.log(
    boxen(
      chalk.white(`📊 Summary:\n\n`) +
        chalk.green(`System Paths: ${systemPaths.length}\n`) +
        chalk.magenta(`User Paths: ${userPaths.length}\n`) +
        chalk.blue(`Custom Paths: ${customPaths.length}`),
      { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'cyan' }
    )
  );
}

// System Info Commands Implementation
function showSystemInfo() {
  console.log('💻 System Information');
  console.log('====================');
  console.log(`OS: ${type()} ${release()}`);
  console.log(`Platform: ${platform()}`);
  console.log(`Architecture: ${arch()}`);
  console.log(`Hostname: ${hostname()}`);
  console.log(`User: ${userInfo().username}`);
  console.log(`Home Directory: ${homedir()}`);
  console.log(`Temp Directory: ${tmpdir()}`);
  console.log(`Uptime: ${Math.floor(uptime() / 3600)} hours`);
  console.log(`Node.js Version: ${process.version}`);
}

function showCPUInfo() {
  console.log('🔧 CPU Information');
  console.log('==================');

  const cpus = _cpus();
  console.log(`Model: ${cpus[0].model}`);
  console.log(`Cores: ${cpus.length}`);
  console.log(`Speed: ${cpus[0].speed} MHz`);

  console.log('\nCore Details:');
  cpus.forEach((cpu, index) => {
    const total = Object.values(cpu.times).reduce((acc, time) => acc + time, 0);
    const idle = cpu.times.idle;
    const usage = ((total - idle) / total) * 100;
    console.log(`  Core ${index + 1}: ${usage.toFixed(1)}% usage`);
  });
}

function showMemoryInfo() {
  console.log('💾 Memory Information');
  console.log('====================');

  const totalMem = totalmem();
  const freeMem = freemem();
  const usedMem = totalMem - freeMem;

  console.log(`Total: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`Used: ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`Free: ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`Usage: ${((usedMem / totalMem) * 100).toFixed(1)}%`);

  // Process memory
  const processMemory = process.memoryUsage();
  console.log('\nProcess Memory:');
  console.log(`  RSS: ${(processMemory.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(
    `  Heap Used: ${(processMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(
    `  Heap Total: ${(processMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`
  );
}

async function showDiskInfo() {
  console.log('💿 Disk Information');
  console.log('==================');

  if (platform() === 'win32') {
    try {
      const { stdout } = await execAsync(
        'wmic logicaldisk get size,freespace,caption'
      );
      console.log(stdout);
    } catch (error) {
      console.log('❌ Unable to get disk info:', error.message);
    }
  } else {
    try {
      const { stdout } = await execAsync('df -h');
      console.log(stdout);
    } catch (error) {
      console.log('❌ Unable to get disk info:', error.message);
    }
  }
}

async function showProcesses(filter) {
  console.log('⚙️ Running Processes');
  console.log('===================');

  if (platform() === 'win32') {
    const cmd = filter ? `tasklist | findstr /i ${filter}` : 'tasklist';
    try {
      const { stdout } = await execAsync(cmd);
      console.log(stdout);
    } catch (error) {
      console.log('❌ Unable to get processes:', error.message);
    }
  } else {
    const cmd = filter ? `ps aux | grep ${filter}` : 'ps aux';
    try {
      const { stdout } = await execAsync(cmd);
      console.log(stdout);
    } catch (error) {
      console.log('❌ Unable to get processes:', error.message);
    }
  }
}

// Utility Commands
async function openLocation(location) {
  if (!location) {
    console.log('❌ Please specify a location to open');
    console.log('💡 Usage: ysys open C:\\Users');
    return;
  }

  const cmd =
    platform() === 'win32' ? `explorer "${location}"` : `open "${location}"`;

  try {
    await execAsync(cmd);
    console.log(`✅ Opened: ${location}`);
  } catch (error) {
    console.error(`❌ Failed to open location: ${error.message}`);
  }
}

async function killProcess(processName) {
  if (!processName) {
    console.log('❌ Please specify a process name or PID');
    console.log('💡 Usage: ysys kill notepad.exe');
    return;
  }

  const cmd =
    platform() === 'win32'
      ? `taskkill /f /im ${processName}`
      : `pkill ${processName}`;

  try {
    await execAsync(cmd);
    console.log(`✅ Killed process: ${processName}`);
  } catch (error) {
    console.error(`❌ Failed to kill process: ${error.message}`);
  }
}

// Help function
function showHelp() {
  console.log('🌸 Yurei System CLI (ysys)');
  console.log('==========================');
  console.log('');
  console.log('🌐 Network Commands:');
  console.log('  ysys ip                    - Show IP information');
  console.log('  ysys ping <host>           - Ping a host');
  console.log('  ysys port <host> <port>    - Check if port is open');
  console.log('  ysys dns <domain>          - DNS lookup');
  console.log('  ysys speedtest             - Basic speed test');
  console.log('');
  console.log('🌍 Environment Commands:');
  console.log('  ysys env [filter]          - Show environment variables');
  console.log('  ysys setenv <key> <value>  - Set environment variable');
  console.log('  ysys path                  - Show PATH variables');
  console.log('');
  console.log('💻 System Info Commands:');
  console.log('  ysys sysinfo               - Show system information');
  console.log('  ysys cpu                   - Show CPU information');
  console.log('  ysys memory                - Show memory information');
  console.log('  ysys disk                  - Show disk information');
  console.log('  ysys processes [filter]    - Show running processes');
  console.log('');
  console.log('📁 File System Commands:');
  console.log('  ysys drives                - Show available drives');
  console.log('  ysys temp                  - Show temp directory');
  console.log('  ysys home                  - Show home directory');
  console.log('  ysys pwd                   - Show current directory');
  console.log('');
  console.log('🛠️ Utility Commands:');
  console.log('  ysys open <path>           - Open file/folder');
  console.log('  ysys kill <process>        - Kill a process');
  console.log('');
  console.log('💡 Examples:');
  console.log('  ysys ip');
  console.log('  ysys ping google.com');
  console.log('  ysys env PATH');
  console.log('  ysys processes chrome');
  console.log('  ysys open C:\\\\Users');
}

// Additional utility functions
function showTempDirectory() {
  const tempDir = tmpdir();
  console.log(`📁 Temp Directory: ${tempDir}`);

  try {
    const files = readdirSync(tempDir);
    console.log(`📊 Files in temp: ${files.length}`);
  } catch (error) {
    console.log('❌ Unable to read temp directory');
  }
}

function showHomeDirectory() {
  const homeDir = homedir();
  console.log(`🏠 Home Directory: ${homeDir}`);

  try {
    const files = readdirSync(homeDir);
    console.log('📁 Contents:');
    files.slice(0, 10).forEach((file) => {
      const filePath = join(homeDir, file);
      const isDir = statSync(filePath).isDirectory();
      console.log(`  ${isDir ? '📁' : '📄'} ${file}`);
    });
    if (files.length > 10) {
      console.log(`  ... and ${files.length - 10} more items`);
    }
  } catch (error) {
    console.log('❌ Unable to read home directory');
  }
}

async function showDrives() {
  console.log('💿 Available Drives');
  console.log('==================');

  if (platform() === 'win32') {
    try {
      const { stdout } = await execAsync(
        'wmic logicaldisk get caption,description,size,freespace'
      );
      console.log(stdout);
    } catch (error) {
      console.log('❌ Unable to get drive info');
    }
  } else {
    try {
      const { stdout } = await execAsync('df -h');
      console.log(stdout);
    } catch (error) {
      console.log('❌ Unable to get drive info');
    }
  }
}

// Placeholder functions for undeclared variables
async function registryOperation(params) {
  console.log('Registry operation not implemented');
}

async function showServices() {
  console.log('Show services not implemented');
}

async function showStartupPrograms() {
  console.log('Show startup programs not implemented');
}

async function firewallStatus() {
  console.log('Firewall status not implemented');
}

async function showUsers() {
  console.log('Show users not implemented');
}

async function restartSystem(params) {
  console.log('Restart system not implemented');
}

// Run the main function
main().catch((error) => {
  console.error('❌ Unexpected error:', error.message);
  process.exit(1);
});
