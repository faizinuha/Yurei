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

const program = new Command();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// === === === === === //
// === Menu Interaktif === //
async function menuUtama() {
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

  if (action === 'browser') await bukaBrowser();
  if (action === 'game') await jalankanGame();
  if (action === 'explorer') exec(`start "" "${path.join(__dirname, '../')}"`);
  if (action === 'exit') process.exit(0);
  
  setTimeout(menuUtama, 1000);
}

// === Fungsi: Buka Browser === //
async function bukaBrowser() {
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
    { name: '🌐 Opera', path: 'C:\\Program Files\\Opera\\launcher.exe' },
    { name: '🌐 Vivaldi', path: 'C:\\Program Files\\Vivaldi\\Application\\vivaldi.exe' },
    { name: '🌐 Default Browser', value: 'default' },
  ].filter((b) => b.value === 'default' || fs.existsSync(b.path));

  if (browserList.length === 1) {
    return open(formattedUrl);
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
}

// === Fungsi: Jalankan Game (DIPERBAIKI TOTAL) === //
async function jalankanGame() {
  const { keyword } = await inquirer.prompt({
    type: 'input',
    name: 'keyword',
    message: '🔍 Ketik nama game/aplikasi (contoh: genshin, steam, discord):',
    validate: (input) => input.trim().length > 0 || 'Mohon masukkan keyword!'
  });

  const spinner = ora(`🔍 Mencari "${keyword}"...`).start();

  // Path pencarian yang SANGAT lengkap
  const searchPaths = [
    // Desktop - prioritas tertinggi
    path.join(process.env.USERPROFILE || '', 'Desktop'),
    
    // Start Menu - lokasi shortcut utama
    path.join(process.env.APPDATA || '', 'Microsoft\\Windows\\Start Menu\\Programs'),
    path.join(process.env.PROGRAMDATA || '', 'Microsoft\\Windows\\Start Menu\\Programs'),
    
    // Program Files - aplikasi terinstall
    'C:\\Program Files',
    'C:\\Program Files (x86)',
    
    // AppData - aplikasi portable/user
    path.join(process.env.LOCALAPPDATA || '', 'Programs'),
    path.join(process.env.APPDATA || ''),
    path.join(process.env.LOCALAPPDATA || ''),
    
    // Common installation paths
    'C:\\Games',
    'D:\\Games',
    'E:\\Games',
    'C:\\Program Files\\WindowsApps',
    
    // Steam paths
    'C:\\Program Files (x86)\\Steam\\steamapps\\common',
    'C:\\Program Files\\Steam\\steamapps\\common',
    
    // Epic Games
    'C:\\Program Files\\Epic Games',
    'C:\\Program Files (x86)\\Epic Games',
  ];

  let allExecutables = [];
  const keywordVariations = generateKeywordVariations(keyword);

  try {
    // Phase 1: Pencarian langsung dengan semua variasi keyword
    for (const searchPath of searchPaths) {
      if (!fs.existsSync(searchPath)) continue;
      
      try {
        for (const keywordVar of keywordVariations) {
          // Pencarian dengan berbagai pattern
          const patterns = [
            `${searchPath}/**/*${keywordVar}*.exe`,
            `${searchPath}/**/*${keywordVar}*.lnk`,
            `${searchPath}/*${keywordVar}*.exe`,
            `${searchPath}/*${keywordVar}*.lnk`,
            `${searchPath}/**/${keywordVar}*.exe`,
            `${searchPath}/**/${keywordVar}*.lnk`,
          ];

          for (const pattern of patterns) {
            try {
              const matches = glob.sync(pattern, { 
                nocase: true, 
                maxDepth: 3,
                ignore: [
                  '**/node_modules/**', 
                  '**/cache/**', 
                  '**/temp/**', 
                  '**/backup/**',
                  '**/uninstall*',
                  '**/update*',
                  '**/*unins*'
                ]
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

    // Hapus duplikat
    allExecutables = [...new Set(allExecutables)];

    // Phase 2: Jika masih kosong, lakukan deep fuzzy search
    if (allExecutables.length === 0) {
      spinner.text = `🔍 Pencarian mendalam untuk "${keyword}"...`;
      
      const deepSearchPaths = searchPaths.slice(0, 6); // Batasi untuk performa
      
      for (const searchPath of deepSearchPaths) {
        if (!fs.existsSync(searchPath)) continue;
        
        try {
          // Ambil semua exe dan lnk
          const allFiles = glob.sync(`${searchPath}/**/*.{exe,lnk}`, { 
            nocase: true, 
            maxDepth: 3,
            ignore: [
              '**/node_modules/**', 
              '**/cache/**', 
              '**/temp/**',
              '**/uninstall*',
              '**/update*',
              '**/*unins*'
            ]
          });

          // Filter dengan advanced fuzzy matching
          const fuzzyMatches = allFiles.filter(file => {
            const fileName = path.basename(file, path.extname(file)).toLowerCase();
            return isAdvancedMatch(fileName, keyword.toLowerCase());
          });

          allExecutables.push(...fuzzyMatches);
        } catch (err) {
          continue;
        }
      }

      allExecutables = [...new Set(allExecutables)];
    }

    if (allExecutables.length === 0) {
      spinner.fail(`❌ Tidak ditemukan aplikasi dengan nama "${keyword}" atau yang mirip.`);
      
      console.log(chalk.yellow('\n💡 Tips pencarian yang lebih baik:'));
      console.log(chalk.gray('• Coba kata kunci yang lebih pendek: "obs" bukan "obs studio"'));
      console.log(chalk.gray('• Coba nama alternatif: "streamlabs" untuk "streamlabs obs"'));
      console.log(chalk.gray('• Periksa apakah aplikasi sudah terinstall'));
      console.log(chalk.gray('• Coba cari di Desktop atau Start Menu secara manual'));
      
      return;
    }

    spinner.succeed(`✅ Ditemukan ${allExecutables.length} aplikasi yang cocok.`);

    // Sorting berdasarkan relevansi yang lebih pintar
    const sortedApps = allExecutables.sort((a, b) => {
      const aName = path.basename(a, path.extname(a)).toLowerCase();
      const bName = path.basename(b, path.extname(b)).toLowerCase();
      const keywordLower = keyword.toLowerCase();
      
      // Hitung score untuk setiap aplikasi
      const aScore = calculateRelevanceScore(aName, keywordLower);
      const bScore = calculateRelevanceScore(bName, keywordLower);
      
      return bScore - aScore; // Sort descending
    });

    const { selected } = await inquirer.prompt({
      type: 'list',
      name: 'selected',
      message: 'Pilih aplikasi untuk dijalankan:',
      choices: sortedApps.slice(0, 12).map(f => {
        const fileName = path.basename(f, path.extname(f));
        const dirName = path.basename(path.dirname(f));
        return {
          name: `${getAppIcon(f)} ${fileName} ${chalk.gray(`(${dirName})`)}`,
          value: f
        };
      })
    });

    // Pesan loading saat membuka aplikasi
    console.log(chalk.yellow('\n⏳ Mohon Bersabar, Kecepatan tergantung spesifikasi Laptop...'));
    console.log(chalk.green(`🚀 Menjalankan: ${path.basename(selected, path.extname(selected))}`));
    
    exec(`start "" "${selected}"`);

  } catch (err) {
    spinner.fail('❌ Gagal mencari aplikasi.');
    console.error(chalk.red('Error:'), err.message);
  }
}

// === Helper Functions ===

function generateKeywordVariations(keyword) {
  const variations = [keyword.toLowerCase()];
  
  // Tambah variasi tanpa spasi
  variations.push(keyword.replace(/\s+/g, ''));
  
  // Tambah variasi dengan underscore dan dash
  variations.push(keyword.replace(/\s+/g, '_'));
  variations.push(keyword.replace(/\s+/g, '-'));
  
  // Tambah kata individual
  const words = keyword.toLowerCase().split(/\s+/);
  variations.push(...words);
  
  // Tambah singkatan
  if (words.length > 1) {
    variations.push(words.map(w => w[0]).join(''));
  }
  
  return [...new Set(variations)];
}

function isAdvancedMatch(fileName, keyword) {
  const keywordWords = keyword.split(/\s+/);
  
  // Exact match
  if (fileName.includes(keyword)) return true;
  
  // All words present
  if (keywordWords.every(word => fileName.includes(word))) return true;
  
  // Any word present (untuk kata kunci panjang)
  if (keywordWords.length > 1 && keywordWords.some(word => word.length > 2 && fileName.includes(word))) return true;
  
  // Similarity check
  if (calculateSimilarity(fileName, keyword) > 0.3) return true;
  
  // Word boundary matching
  const fileWords = fileName.split(/[\s\-_\.]/);
  if (fileWords.some(word => keywordWords.some(kw => word.includes(kw) || kw.includes(word)))) return true;
  
  return false;
}

function calculateRelevanceScore(fileName, keyword) {
  let score = 0;
  
  // Exact match - highest score
  if (fileName === keyword) score += 100;
  
  // Starts with keyword
  if (fileName.startsWith(keyword)) score += 80;
  
  // Contains keyword
  if (fileName.includes(keyword)) score += 60;
  
  // Word match
  const keywordWords = keyword.split(/\s+/);
  const fileWords = fileName.split(/[\s\-_\.]/);
  
  keywordWords.forEach(kw => {
    fileWords.forEach(fw => {
      if (fw === kw) score += 40;
      else if (fw.includes(kw) || kw.includes(fw)) score += 20;
    });
  });
  
  // Similarity bonus
  score += calculateSimilarity(fileName, keyword) * 30;
  
  // Length penalty (prefer shorter, more specific names)
  score -= fileName.length * 0.1;
  
  return score;
}

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function getAppIcon(filePath) {
  const name = path.basename(filePath).toLowerCase();
  
  // Specific apps
  if (name.includes('obs')) return '📹';
  if (name.includes('streamlabs')) return '📺';
  if (name.includes('bandicam')) return '🎬';
  if (name.includes('camtasia')) return '🎞️';
  
  // Games
  if (name.includes('steam') || name.includes('game')) return '🎮';
  if (name.includes('genshin') || name.includes('honkai')) return '⚔️';
  if (name.includes('minecraft')) return '🧱';
  if (name.includes('valorant') || name.includes('csgo')) return '🔫';
  if (name.includes('league') || name.includes('dota')) return '🏆';
  
  // Browsers
  if (name.includes('chrome') || name.includes('firefox') || name.includes('edge')) return '🌐';
  
  // Communication
  if (name.includes('discord') || name.includes('telegram') || name.includes('whatsapp')) return '💬';
  if (name.includes('zoom') || name.includes('teams') || name.includes('meet')) return '📞';
  
  // Media
  if (name.includes('spotify') || name.includes('music')) return '🎵';
  if (name.includes('vlc') || name.includes('media')) return '🎥';
  
  // Development
  if (name.includes('code') || name.includes('studio') || name.includes('editor')) return '💻';
  
  // Design
  if (name.includes('photoshop') || name.includes('gimp') || name.includes('paint')) return '🎨';
  
  // File type
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.lnk') return '🔗';
  
  return '📱';
}