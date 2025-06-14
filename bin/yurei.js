
// File: bin/yurei.js
// #!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { exec } from 'child_process';
import open from 'open';
import inquirer from 'inquirer';

const program = new Command();
program.name('yurei').description('CLI ala Sayang Ku').version('1.0.0');

// 🔧 Fungsi penting: install (simulasi)
program
  .command('install')
  .description('Install sesuatu (simulasi saja)')
  .option('--save-dev', 'Install sebagai dev dep')
  .action((opts) => {
    if (opts.saveDev) {
      console.log(chalk.green('🛠️ Installing as dev dependency...'));
    } else {
      console.log(chalk.cyan('🌸 Installing...'));
    }
  });

// 🌐 Fungsi penting: buka website
program
  .command('open <site>')
  .description('Buka situs populer atau custom')
  .option('--browser <name>', 'Pilih browser (chrome, edge, dll)')
  .action(async (site, options) => {
    const sites = {
      youtube: 'https://youtube.com',
      instagram: 'https://instagram.com',
      github: 'https://github.com'
    };

    const url = sites[site.toLowerCase()] || site;
    console.log(chalk.magenta(`🔗 Membuka: ${url}`));
    await open(url, options.browser ? { app: { name: options.browser } } : {});
  });

// 🕹️ Fungsi penting: jalankan aplikasi/game
program
  .command('run <name>')
  .description('Jalankan game/aplikasi dari path preset')
  .action((name) => {
    const paths = {
      genshin: '"C:/Program Files/Genshin Impact/launcher.exe"',
      valorant: '"C:/Riot Games/VALORANT/live/VALORANT.exe"'
    };
    const path = paths[name.toLowerCase()];
    if (!path) {
      console.log(chalk.red('❌ Path tidak ditemukan, coba konfigurasi dulu.'));
      return;
    }
    console.log(chalk.yellow(`🚀 Menjalankan ${name}...`));
    exec(path);
  });

// 🛠️ Fungsi dasar tambahan: whoami
program
  .command('whoami')
  .description('Lihat identitas CLI (easter egg 😎)')
  .action(() => {
    console.log(chalk.blueBright(`👻 Nama tool ini: Yurei
❤️ Dibuat oleh: Sayang Ku
✨ Versi: 1.0.0`));
  });

program.parse();
