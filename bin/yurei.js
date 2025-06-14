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
import { Worker } from 'worker_threads';
import { asciiWelcome } from '../utils/asciiWelcome.js';

const program = new Command();
program.name('yurei').description('CLI sayangku yang paling manis').version('2.0.0');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Commander Command ===

program
  .command('menu')
  .description('Tampilkan menu interaktif')
  .action(async () => {
    await asciiWelcome();
    await menuUtama();
  });

program
  .command('whoami')
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

  exec(`"${selectedBrowser}" "${url}"`);
}

function runScanThread(folderPath) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, '../Worker/ScanWorker.js'), {
      workerData: { path: folderPath },
    });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => code !== 0 && reject(new Error(`Worker exited: ${code}`)));
  });
}

async function jalankanGame() {
  const paths = ['C:/Games', 'D:/Games', 'C:/Program Files/Steam'].filter(Boolean);
  const spinner = ora('🔍 Mencari game...').start();

  try {
    const results = await Promise.all(paths.map((p) => runScanThread(p)));
    const allGames = results.flat();
    spinner.succeed('✅ Game ditemukan');

    const { selected } = await inquirer.prompt({
      type: 'list',
      name: 'selected',
      message: 'Pilih game:',
      choices: allGames.map((g) => ({ name: g.name || path.basename(g.path), value: g.path })),
    });

    exec(`"${selected}"`);
  } catch (err) {
    spinner.fail('❌ Gagal scan game.');
    console.error(err);
  }
}
