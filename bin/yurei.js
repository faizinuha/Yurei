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
// import { Worker } from 'worker_threads';
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
        { name: '🎮 Jalankan Game', value: 'game' },
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
  const browserList = [
    { name: '🌐 Chrome', path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' },
    { name: '🌀 Edge', path: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' },
    { name: '🦊 Firefox', path: 'C:\\Program Files\\Mozilla Firefox\\firefox.exe' },
    { name: '🌐 Brave', path: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe' },
    { name: '🌐 Opera', path: 'C:\\Program Files\\Opera\\launcher.exe' },
    { name: '🌐 Vivaldi', path: 'C:\\Program Files\\Vivaldi\\Application\\vivaldi.exe' },
    { name: '🌐 Safari', path: 'C:\\Program Files\\Safari\\Safari.exe' },
  ].filter((b) => fs.existsSync(b.path));

  const { url } = await inquirer.prompt({
    type: 'input',
    name: 'url',
    message: '🔗 Masukkan URL:',
    default: 'https://youtube.com',
  });

  if (browserList.length === 0) return open(url);

  const { selectedBrowser } = await inquirer.prompt({
    type: 'list',
    name: 'selectedBrowser',
    message: 'Pilih browser:',
    choices: browserList.map((b) => ({ name: b.name, value: b.path })),
  });

  exec(`"${selectedBrowser}" "www.${url}.com"`);
}

//  === Fungsi: Jalankan Game === //
async function jalankanGame() {
  const spinner = ora('🔍 Mencari shortcut dan executable...').start();

  const searchPaths = [
    path.join(process.env.USERPROFILE || '', 'Desktop'),
    path.join(process.env.APPDATA || '', 'Microsoft\\Windows\\Start Menu\\Programs'),
  ];

  let allExecutables = [];

  try {
    for (const p of searchPaths) {
      const matches = glob.sync(`${p}/**/*.{exe,lnk}`, { nocase: true });
      allExecutables.push(...matches);
    }

    if (allExecutables.length === 0) {
      spinner.fail('Tidak ditemukan file .exe atau shortcut.');
      return;
    }

    spinner.succeed(`✅ Ditemukan ${allExecutables.length} file.`);

    const { keyword } = await inquirer.prompt({
      type: 'input',
      name: 'keyword',
      message: '🔍 Ketik nama game (contoh: genshin):',
    });

    const filtered = allExecutables.filter(f => f.toLowerCase().includes(keyword.toLowerCase()));

    if (filtered.length === 0) {
      console.log(chalk.red('❌ Tidak ditemukan hasil dengan nama tersebut.'));
      return;
    }

    const { selected } = await inquirer.prompt({
      type: 'list',
      name: 'selected',
      message: 'Pilih file untuk dijalankan:',
      choices: filtered.map(f => ({
        name: path.basename(f),
        value: f
      }))
    });

    exec(`start "" "${selected}"`);
  } catch (err) {
    spinner.fail('❌ Gagal mencari file.');
    console.error(err);
  }
}

// === Konfigurasi Yurei === //
const configPath = path.join(__dirname, '../config/default.json');

function resolveEnvPath(str) {
  return str.replace('%APPDATA%', process.env.APPDATA || '');
}
// Loader config
let yureiConfig = {
  apps: {},
  searchPaths: []
};

if (fs.existsSync(configPath)) {
  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);

    yureiConfig.apps = parsed.apps || {};
    yureiConfig.searchPaths = (parsed.searchPaths || []).map(resolveEnvPath);

  } catch (err) {
    console.error("⚠️ Gagal membaca config Yurei:", err.message);
  }
} else {
  console.warn("⚠️ Config default.json tidak ditemukan. Menggunakan nilai kosong.");
}


// === Slogan Yurei === //
const slogans = [
  'Smart launcher for terminal productivity',
  'Built for speed, designed for flow',
  'Seamless access from shell to system',
  'Simple CLI. Serious control.',
  'Launcher terminal yang bisa kamu andalkan',
  'Terminal rasa lokal, performa global',
  'Faster workflows, cleaner terminal',
  'One CLI to launch them all',
  'Interface modern, semangat klasik',
  'Teknologi praktis, tanpa basa-basi'
];
