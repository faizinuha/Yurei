#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import open from 'open';
import { exec } from 'child_process';
import fs from 'fs';
import ora from 'ora';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { asciiWelcome } from '../utils/asciiWelcome.js';

// Import semua helper functions
import {
  getAppIcon,
  getGameCategory,
  isLikelyGame,
  isPopularApp,
  generateKeywordVariations,
  calculateRelevanceScore,
  groupGamesByCategory
} from '../utils/icons-helper.js';

const program = new Command();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache untuk menyimpan daftar game
let gameCache = [];
const cacheFile = path.join(__dirname, '../cache/games.json');

// === Commander Command ===
program
  .name('yurei')
  .description('Yurei CLI - Launcher terminal serbaguna dan ringan')
  .version('2.0.0');

program
  .command('menu')
  .alias('M')
  .description('Tampilkan menu interaktif')
  .action(async () => {
    await asciiWelcome();
    await menuUtama();
  });

program
  .command('whoami')
  .alias('W')
  .description('Lihat identitas CLI')
  .action(() => {
    console.log(chalk.blueBright(`👻 Nama tool ini: Yurei CLI\n❤️ Dibuat oleh: Sayang Ku\n✨ Versi: 2.0.0`));
  });

program.parse(process.argv);

// === Menu Utama (DIPERBAIKI) ===
async function menuUtama() {
  while (true) {
    try {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: chalk.greenBright('✨ Pilih aksi:'),
          choices: [
            { name: '🌐 Buka Website', value: 'browser' },
            { name: '🎮 Jalankan Game/Aplikasi', value: 'game' },
            { name: '📁 Buka Folder CLI', value: 'explorer' },
            { name: '❌ Keluar', value: 'exit' },
          ],
        },
      ]);

      if (action === 'browser') {
        await bukaBrowser();
      } else if (action === 'game') {
        await menuGame();
      } else if (action === 'explorer') {
        exec(`start "" "${path.join(__dirname, '../')}"`);
        console.log(chalk.green('📁 Folder CLI dibuka!'));
      } else if (action === 'exit') {
        console.log(chalk.yellow('👋 Terima kasih telah menggunakan Yurei CLI!'));
        process.exit(0);
      }
    } catch (error) {
      console.log(chalk.red('\n❌ Terjadi kesalahan. Kembali ke menu utama...'));
      continue;
    }
  }
}

// === Menu Game (DIPERBAIKI) ===
async function menuGame() {
  while (true) {
    try {
      const { gameAction } = await inquirer.prompt([
        {
          type: 'list',
          name: 'gameAction',
          message: chalk.cyanBright('🎮 Pilih cara menjalankan aplikasi:'),
          choices: [
            { name: '🔍 Cari Manual (ketik nama)', value: 'search' },
            { name: '📋 Pilih dari Daftar Game', value: 'list' },
            { name: '🔄 Refresh Daftar Game', value: 'refresh' },
            { name: '⬅️ Kembali ke Menu Utama', value: 'back' },
          ],
        },
      ]);

      if (gameAction === 'search') {
        await jalankanGameManual();
      } else if (gameAction === 'list') {
        await pilihDariDaftarGame();
      } else if (gameAction === 'refresh') {
        await refreshDaftarGame();
      } else if (gameAction === 'back') {
        break; // Keluar dari loop menu game
      }
    } catch (error) {
      console.log(chalk.red('\n❌ Terjadi kesalahan. Kembali ke menu game...'));
      continue;
    }
  }
}

// === Pilih dari Daftar Game (DIPERBAIKI) ===
async function pilihDariDaftarGame() {
  try {
    // Load cache terlebih dahulu
    await loadGameCache();
    
    // Jika cache kosong, lakukan scan
    if (gameCache.length === 0) {
      console.log(chalk.yellow('\n📋 Daftar game kosong. Melakukan scan otomatis...'));
      await scanGameOtomatis();
    }

    // Jika masih kosong setelah scan
    if (gameCache.length === 0) {
      console.log(chalk.red('\n❌ Tidak ditemukan game di Desktop dan Start Menu.'));
      console.log(chalk.gray('💡 Tips:'));
      console.log(chalk.gray('  • Coba gunakan "Cari Manual"'));
      console.log(chalk.gray('  • Pastikan game sudah terinstall'));
      console.log(chalk.gray('  • Coba "Refresh Daftar Game"'));
      
      // Tunggu user membaca pesan
      await inquirer.prompt([{
        type: 'input',
        name: 'continue',
        message: 'Tekan Enter untuk kembali...',
      }]);
      return;
    }

    console.log(chalk.green(`\n📋 Ditemukan ${gameCache.length} game/aplikasi:`));

    // Group games by category
    const gamesByCategory = groupGamesByCategory(gameCache);
    const choices = [];
    
    Object.keys(gamesByCategory).forEach(category => {
      choices.push(new inquirer.Separator(chalk.bold.magenta(`--- ${category} ---`)));
      gamesByCategory[category].forEach(game => {
        choices.push({
          name: `${game.icon} ${game.name} ${chalk.gray('(' + game.location + ')')}`,
          value: game.path
        });
      });
      choices.push(new inquirer.Separator(' '));
    });

    choices.push(new inquirer.Separator(chalk.gray('--- Aksi ---')));
    choices.push({ name: '🔄 Refresh Daftar', value: 'refresh' });
    choices.push({ name: '⬅️ Kembali', value: 'back' });

    const { selectedGame } = await inquirer.prompt({
      type: 'list',
      name: 'selectedGame',
      message: 'Pilih game/aplikasi untuk dijalankan:',
      choices: choices,
      pageSize: 15
    });

    if (selectedGame === 'refresh') {
      await refreshDaftarGame();
      return; // Kembali ke menu game, bukan recursive call
    }
    
    if (selectedGame === 'back') {
      return; // Kembali ke menu game
    }

    // Jalankan game yang dipilih
    const selectedGameInfo = gameCache.find(game => game.path === selectedGame);
    if (selectedGameInfo) {
      console.log(chalk.yellow('\n⏳ Mohon Bersabar, Kecepatan tergantung spesifikasi Laptop...'));
      console.log(chalk.green(`🚀 Menjalankan: ${selectedGameInfo.name}`));
      
      exec(`start "" "${selectedGame}"`);
      
      // Tunggu sebentar sebelum kembali ke menu
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

  } catch (error) {
    console.log(chalk.red('\n❌ Terjadi kesalahan saat memuat daftar game.'));
    console.error(error);
  }
}

// === Scan Game Otomatis (DIPERBAIKI) ===
async function scanGameOtomatis() {
  const spinner = ora('🔍 Scanning game di Desktop dan Start Menu...').start();
  
  const gamePaths = [
    // Desktop - prioritas utama untuk game
    path.join(process.env.USERPROFILE || '', 'Desktop'),
    
    // Start Menu - shortcut game
    path.join(process.env.APPDATA || '', 'Microsoft\\Windows\\Start Menu\\Programs'),
    path.join(process.env.PROGRAMDATA || '', 'Microsoft\\Windows\\Start Menu\\Programs'),
    
    // Game-specific paths
    'C:\\Program Files (x86)\\Steam\\steamapps\\common',
    'C:\\Program Files\\Steam\\steamapps\\common',
    'C:\\Program Files\\Epic Games',
    'C:\\Program Files (x86)\\Epic Games',
    'C:\\Games',
    'D:\\Games',
    'E:\\Games',
  ];

  let foundGames = [];

  try {
    for (const gamePath of gamePaths) {
      if (!fs.existsSync(gamePath)) continue;
      
      try {
        // Cari file executable dan shortcut
        const files = glob.sync(`${gamePath}/**/*.{exe,lnk}`, { 
          nocase: true, 
          maxDepth: 3,
          ignore: [
            '**/uninstall*',
            '**/update*',
            '**/*unins*',
            '**/cache/**',
            '**/temp/**',
            '**/redist/**',
            '**/vcredist*',
            '**/directx*'
          ]
        });

        // Filter hanya game dan aplikasi populer
        const gameFiles = files.filter(file => {
          const fileName = path.basename(file).toLowerCase();
          return isLikelyGame(fileName) || isPopularApp(fileName);
        });

        foundGames.push(...gameFiles);
      } catch (err) {
        // Skip path yang error
        continue;
      }
    }

    // Hapus duplikat dan buat object game
    const uniqueGames = [...new Set(foundGames)];
    
    // Clear cache lama sebelum mengisi yang baru
    gameCache = [];
    
    gameCache = uniqueGames.map(gamePath => {
      const name = path.basename(gamePath, path.extname(gamePath));
      const location = path.basename(path.dirname(gamePath));
      
      return {
        name: name,
        path: gamePath,
        location: location,
        icon: getAppIcon(gamePath),
        category: getGameCategory(name.toLowerCase())
      };
    });

    // Sort berdasarkan nama
    gameCache.sort((a, b) => a.name.localeCompare(b.name));

    // Simpan ke cache
    await saveGameCache();
    
    spinner.succeed(`✅ Berhasil menemukan ${gameCache.length} game/aplikasi.`);
    
  } catch (err) {
    spinner.fail('❌ Gagal scan game.');
    console.error('Error details:', err.message);
  }
}

// === Cache Management (DIPERBAIKI) ===
async function loadGameCache() {
  try {
    if (fs.existsSync(cacheFile)) {
      const cacheData = fs.readFileSync(cacheFile, 'utf8');
      gameCache = JSON.parse(cacheData);
    } else {
      gameCache = [];
    }
  } catch (err) {
    console.log(chalk.yellow('⚠️ Gagal load cache, akan membuat cache baru.'));
    gameCache = [];
  }
}

async function saveGameCache() {
  try {
    const cacheDir = path.dirname(cacheFile);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    fs.writeFileSync(cacheFile, JSON.stringify(gameCache, null, 2));
  } catch (err) {
    console.log(chalk.yellow('⚠️ Gagal menyimpan cache:', err.message));
  }
}

async function refreshDaftarGame() {
  try {
    console.log(chalk.yellow('\n🔄 Refreshing daftar game...'));
    
    // Clear cache
    gameCache = [];
    
    // Hapus file cache lama
    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile);
    }
    
    // Scan ulang
    await scanGameOtomatis();
    
    console.log(chalk.green('✅ Daftar game berhasil di-refresh!'));
    
    // Tunggu user membaca pesan
    await new Promise(resolve => setTimeout(resolve, 1500));
    
  } catch (error) {
    console.log(chalk.red('❌ Gagal refresh daftar game.'));
    console.error(error);
  }
}

// === Cari Manual (DIPERBAIKI) ===
async function jalankanGameManual() {
  try {
    const { keyword } = await inquirer.prompt({
      type: 'input',
      name: 'keyword',
      message: '🔍 Ketik nama game/aplikasi (contoh: genshin, steam, discord):',
      validate: (input) => input.trim().length > 0 || 'Mohon masukkan keyword!'
    });

    await jalankanGameDenganKeyword(keyword);
  } catch (error) {
    console.log(chalk.red('❌ Terjadi kesalahan saat pencarian manual.'));
  }
}

async function jalankanGameDenganKeyword(keyword) {
  const spinner = ora(`🔍 Mencari "${keyword}"...`).start();

  const searchPaths = [
    path.join(process.env.USERPROFILE || '', 'Desktop'),
    path.join(process.env.APPDATA || '', 'Microsoft\\Windows\\Start Menu\\Programs'),
    path.join(process.env.PROGRAMDATA || '', 'Microsoft\\Windows\\Start Menu\\Programs'),
    'C:\\Program Files',
    'C:\\Program Files (x86)',
    'C:\\Games',
    'D:\\Games',
    'C:\\Program Files (x86)\\Steam\\steamapps\\common',
    'C:\\Program Files\\Epic Games',
  ];

  let allExecutables = [];
  const keywordVariations = generateKeywordVariations(keyword);

  try {
    for (const searchPath of searchPaths) {
      if (!fs.existsSync(searchPath)) continue;
      
      try {
        for (const keywordVar of keywordVariations) {
          const patterns = [
            `${searchPath}/**/*${keywordVar}*.exe`,
            `${searchPath}/**/*${keywordVar}*.lnk`,
            `${searchPath}/*${keywordVar}*.exe`,
            `${searchPath}/*${keywordVar}*.lnk`,
          ];

          for (const pattern of patterns) {
            try {
              const matches = glob.sync(pattern, { 
                nocase: true, 
                maxDepth: 3,
                ignore: ['**/uninstall*', '**/update*', '**/*unins*']
              });
              allExecutables.push(...matches);
            } catch (err) {
              continue;
            }
          }
        }
      } catch (err) {
        continue;
      }
    }

    allExecutables = [...new Set(allExecutables)];

    if (allExecutables.length === 0) {
      spinner.fail(`❌ Tidak ditemukan aplikasi dengan nama "${keyword}".`);
      
      console.log(chalk.yellow('\n💡 Tips pencarian:'));
      console.log(chalk.gray('• Coba kata kunci yang lebih pendek'));
      console.log(chalk.gray('• Periksa ejaan nama aplikasi'));
      console.log(chalk.gray('• Coba nama alternatif aplikasi'));
      
      // Tunggu user membaca
      await inquirer.prompt([{
        type: 'input',
        name: 'continue',
        message: 'Tekan Enter untuk kembali...',
      }]);
      return;
    }

    spinner.succeed(`✅ Ditemukan ${allExecutables.length} aplikasi.`);

    const sortedApps = allExecutables.sort((a, b) => {
      const aName = path.basename(a, path.extname(a)).toLowerCase();
      const bName = path.basename(b, path.extname(b)).toLowerCase();
      const keywordLower = keyword.toLowerCase();
      
      const aScore = calculateRelevanceScore(aName, keywordLower);
      const bScore = calculateRelevanceScore(bName, keywordLower);
      
      return bScore - aScore;
    });

    const { selected } = await inquirer.prompt({
      type: 'list',
      name: 'selected',
      message: 'Pilih aplikasi untuk dijalankan:',
      choices: [
        ...sortedApps.slice(0, 10).map(f => ({
          name: `${getAppIcon(f)} ${path.basename(f, path.extname(f))} ${chalk.gray('(' + path.basename(path.dirname(f)) + ')')}`,
          value: f
        })),
        new inquirer.Separator(),
        { name: '⬅️ Kembali ke pencarian', value: 'back' }
      ]
    });

    if (selected === 'back') return;

    console.log(chalk.yellow('\n⏳ Mohon Bersabar, Kecepatan tergantung spesifikasi Laptop...'));
    console.log(chalk.green(`🚀 Menjalankan: ${path.basename(selected, path.extname(selected))}`));
    
    exec(`start "" "${selected}"`);
    
    // Tunggu sebentar sebelum kembali
    await new Promise(resolve => setTimeout(resolve, 1500));

  } catch (err) {
    spinner.fail('❌ Gagal mencari aplikasi.');
    console.error(chalk.red('Error:'), err.message);
  }
}

// === Buka Browser (TIDAK BERUBAH) ===
async function bukaBrowser() {
  try {
    const { url } = await inquirer.prompt({
      type: 'input',
      name: 'url',
      message: '🔗 Masukkan URL:',
      default: 'https://youtube.com',
    });

    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = url.includes('.') ? `https://${url}` : `https://www.${url}.com`;
    }

    const browserList = [
      { name: '🌐 Chrome', path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' },
      { name: '🌀 Edge', path: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' },
      { name: '🦊 Firefox', path: 'C:\\Program Files\\Mozilla Firefox\\firefox.exe' },
      { name: '🌐 Brave', path: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe' },
      { name: '🌐 Default Browser', value: 'default' },
    ].filter((b) => b.value === 'default' || fs.existsSync(b.path));

    if (browserList.length === 1) {
      open(formattedUrl);
      console.log(chalk.green(`🌐 Membuka: ${formattedUrl}`));
      return;
    }

    const { selectedBrowser } = await inquirer.prompt({
      type: 'list',
      name: 'selectedBrowser',
      message: 'Pilih browser:',
      choices: browserList.map((b) => ({ 
        name: b.name, 
        value: b.value === 'default' ? 'default' : b.path 
      })),
    });

    if (selectedBrowser === 'default') {
      open(formattedUrl);
    } else {
      exec(`"${selectedBrowser}" "${formattedUrl}"`);
    }
    
    console.log(chalk.green(`🌐 Membuka: ${formattedUrl}`));
  } catch (error) {
    console.log(chalk.red('❌ Gagal membuka browser.'));
  }
}