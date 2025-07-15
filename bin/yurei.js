#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import open from 'open';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import ora from 'ora';
import inquirer from 'inquirer';
import { asciiWelcome } from '../utils/asciiWelcome.js';
// Import semua helper functions
import {
  getAppIcon,
  getGameCategory,
  isLikelyGame,
  isPopularApp,
  generateKeywordVariations,
  calculateRelevanceScore,
  groupGamesByCategory,
} from '../utils/icons-helper.js';

import { isUpdateAvailable } from '../utils/update-checker.js';

const program = new Command();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache untuk menyimpan daftar game
let gameCache = [];
const cacheFile = path.join(__dirname, '../cache/games.json');

// Check for updates on startup
(async () => {
  const updateInfo = await isUpdateAvailable();
  if (updateInfo.available) {
    console.log(chalk.yellow(`\n\n🎉 Woohs! Ada Update nih! 🎉`));
    console.log(chalk.yellow(`Versi saat ini: ${updateInfo.current}`));
    console.log(chalk.yellow(`Versi terbaru: ${updateInfo.latest}`));
    console.log(
      chalk.yellow(
        `Update yuk dengan perintah: ${chalk.cyan('yurei update')}\n`
      )
    );
  }
})();
// Website database - Simple mapping
const WEBSITES = {
  // Social Media
  youtube: 'https://youtube.com',
  yt: 'https://youtube.com',
  instagram: 'https://instagram.com',
  ig: 'https://instagram.com',
  twitter: 'https://twitter.com',
  x: 'https://x.com',
  facebook: 'https://facebook.com',
  fb: 'https://facebook.com',
  tiktok: 'https://tiktok.com',
  discord: 'https://discord.com',
  reddit: 'https://reddit.com',
  linkedin: 'https://linkedin.com',

  // Development
  github: 'https://github.com',
  git: 'https://github.com',
  stackoverflow: 'https://stackoverflow.com',
  stack: 'https://stackoverflow.com',
  codepen: 'https://codepen.io',
  replit: 'https://replit.com',
  vercel: 'https://vercel.com',
  netlify: 'https://netlify.com',

  // Google Services
  google: 'https://google.com',
  gmail: 'https://gmail.com',
  drive: 'https://drive.google.com',
  docs: 'https://docs.google.com',
  sheets: 'https://sheets.google.com',
  maps: 'https://maps.google.com',
  translate: 'https://translate.google.com',

  // Entertainment
  netflix: 'https://netflix.com',
  spotify: 'https://spotify.com',
  twitch: 'https://twitch.tv',

  // Tools
  chatgpt: 'https://chat.openai.com',
  openai: 'https://chat.openai.com',
  claude: 'https://claude.ai',
  gemini: 'https://gemini.google.com',
  canva: 'https://canva.com',
  figma: 'https://figma.com',
  notion: 'https://notion.so',

  // Indonesian Sites
  tokopedia: 'https://tokopedia.com',
  shopee: 'https://shopee.co.id',
  bukalapak: 'https://bukalapak.com',
  gojek: 'https://gojek.com',
  grab: 'https://grab.com',
  ovo: 'https://ovo.id',
  dana: 'https://dana.id',

  // News & Info
  wikipedia: 'https://wikipedia.org',
  wiki: 'https://wikipedia.org',
  medium: 'https://medium.com',
  dev: 'https://dev.to',
};

// === MAIN PROGRAM ===
program
  .name('yurei')
  .description('🌸 Yurei CLI - Simple Website & File Launcher')
  .version('3.0.3');

// Default action - handle direct website commands
program
  .argument('[site]', 'Website to open (youtube, github, google, etc.)')
  .option(
    '-b, --browser <browser>',
    'Choose browser (chrome, edge, firefox, brave)'
  )
  .action(async (site, options) => {
    if (!site) {
      await asciiWelcome();
      showHelp();
      return;
    }

    await openWebsite(site, options.browser);
  });

// File explorer command
program
  .command('folder')
  .alias('f')
  .description('📁 Open CLI folder in explorer')
  .action(async () => {
    const folderPath = path.join(__dirname, '../');
    exec(`start "" "${folderPath}"`);
    console.log(chalk.green('📁 CLI folder opened!'));
    await asciiWelcome();
  });

// Open any folder
program
  .command('open <path>')
  .alias('o')
  .description('📂 Open any folder/file')
  .action(async(folderPath) => {
    if (fs.existsSync(folderPath)) {
      exec(`start "" "${folderPath}"`);
      console.log(chalk.green(`📂 Opened: ${folderPath}`));
    } else {
      console.log(chalk.red(`❌ Path not found: ${folderPath}`));
    }
      await asciiWelcome()
  });

// Web command (alternative)
program
  .command('web <site>')
  .alias('w')
  .description('🌐 Open website')
  .option('-b, --browser <browser>', 'Choose browser')
  .action(async (site, options) => {
    await openWebsite(site, options.browser);
      await asciiWelcome()
  });

// Search web
program
  .command('search <query...>')
  .alias('s')
  .description('🔍 Search on Google')
  .action(async(query) => {
    const searchQuery = query.join(' ');
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      searchQuery
    )}`;
    console.log(chalk.cyan(`🔍 Searching: ${searchQuery}`));
    open(searchUrl);
      await asciiWelcome()
  });

// Whoami
program
  .command('whoami')
  .description('👻 Show CLI info')
  .action(async () => {
      await asciiWelcome()
    console.log(chalk.blueBright(`👻 Yurei CLI v2.0.0`));
    console.log(chalk.blueBright(`❤️ Made by: Sayang Ku`));
    console.log(chalk.blueBright(`✨ Simple Website & File Launcher`));
  });

program.parse(process.argv);

// === FUNCTIONS ===

async function openWebsite(site, browserChoice) {
  let finalUrl;

  // Default URL formatting
  if (site.startsWith('http://') || site.startsWith('https://')) {
    finalUrl = site;
  } else if (site.includes('.')) {
    finalUrl = `https://${site}`;
  } else {
    // Default format: add .com
    finalUrl = `https://www.${site}.com`;
  }

  console.log(chalk.cyan(`🌐 Opening: ${finalUrl}`));

  // Browser selection
  if (browserChoice) {
    await openWithBrowser(finalUrl, browserChoice);
  } else {
    open(finalUrl);
  }
}

async function openWithBrowser(url, browserChoice) {
  const browsers = {
    chrome: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    edge: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    firefox: 'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
    brave:
      'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  };

  const browserPath = browsers[browserChoice.toLowerCase()];

  if (browserPath && fs.existsSync(browserPath)) {
    exec(`"${browserPath}" "${url}"`);
    console.log(chalk.green(`✅ Opened with ${browserChoice}`));
  } else {
    console.log(
      chalk.yellow(`⚠️ Browser ${browserChoice} not found. Using default.`)
    );
    open(url);
  }
}

function showHelp() {
  console.log(chalk.cyan('\n🌸 Yurei CLI - Simple Commands:'));
  console.log('='.repeat(40));

  console.log(chalk.yellow('\n🌐 Website Commands:'));
  console.log('  yurei youtube              # Opens youtube.com');
  console.log('  yurei github               # Opens github.com');
  console.log('  yurei google               # Opens google.com');
  console.log('  yurei facebook             # Opens facebook.com');
  console.log('  yurei instagram            # Opens instagram.com');

  console.log(chalk.yellow('\n📁 File Commands:'));
  console.log('  yurei folder               # Open CLI folder');
  console.log('  yurei open C:\\Users        # Open any folder');

  console.log(chalk.yellow('\n🔍 Search Commands:'));
  console.log('  yurei search cats          # Google search');
  console.log('  yurei web youtube.com      # Open any URL');

  console.log(chalk.yellow('\n⚙️ Options:'));
  console.log('  yurei youtube -b chrome    # Choose browser');

  console.log(
    chalk.gray('\n💡 Format: yurei <sitename> = https://www.<sitename>.com')
  );
  console.log(chalk.gray('💡 Examples:'));
  console.log(chalk.gray('  yurei netflix    → https://www.netflix.com'));
  console.log(chalk.gray('  yurei tokopedia  → https://www.tokopedia.com'));
  console.log(chalk.gray('  yurei reddit     → https://www.reddit.com'));
}

// === AI-POWERED COMMANDER ===
program
  .command('run <game>')
  .alias('r')
  .description('🚀 Run game/application')
  .action(async (game) => {
    await jalankanGameDenganKeyword(game);
  });

program
  .command('scan')
  .description('🔄 Scan games')
  .action(async () => {
    await refreshDaftarGame();
  });

// === EXISTING FUNCTIONS (Keep all previous functions) ===

async function jalankanGameDenganKeyword(keyword, forceScan = false) {
  const spinner = ora(`🔍 Searching "${keyword}"...`).start();

  // Load cache terlebih dahulu
  await loadGameCache();

  // Jika cache kosong atau force scan
  if (gameCache.length === 0 || forceScan) {
    spinner.text = '🔄 Scanning games...';
    await scanGameOtomatis();
  }

  // Cari di cache terlebih dahulu
  const cacheResults = gameCache.filter((game) =>
    game.name.toLowerCase().includes(keyword.toLowerCase())
  );

  if (cacheResults.length > 0) {
    spinner.succeed(`✅ Found ${cacheResults.length} games in cache.`);

    if (cacheResults.length === 1) {
      // Langsung jalankan jika hanya 1 hasil
      const game = cacheResults[0];
      console.log(chalk.green(`🚀 Running: ${game.name}`));
      exec(`start "" "${game.path}"`);
      return;
    } else {
      // Pilih dari hasil cache
      const { selected } = await inquirer.prompt({
        type: 'list',
        name: 'selected',
        message: 'Choose game from cache:',
        choices: [
          ...cacheResults.map((game) => ({
            name: `${game.icon} ${game.name} ${chalk.gray(
              '(' + game.location + ')'
            )}`,
            value: game.path,
          })),
          new inquirer.Separator(),
          { name: '🔍 Search more details', value: 'search_more' },
        ],
      });

      if (selected === 'search_more') {
        // Lanjut ke pencarian detail
      } else {
        const selectedGame = cacheResults.find(
          (game) => game.path === selected
        );
        console.log(chalk.green(`🚀 Running: ${selectedGame.name}`));
        exec(`start "" "${selected}"`);
        return;
      }
    }
  }

  // Jika tidak ditemukan di cache, lakukan pencarian detail
  spinner.text = `🔍 Detailed search for "${keyword}"...`;

  const searchPaths = [
    path.join(process.env.USERPROFILE || '', 'Desktop'),
    path.join(
      process.env.APPDATA || '',
      'Microsoft\\Windows\\Start Menu\\Programs'
    ),
    path.join(
      process.env.PROGRAMDATA || '',
      'Microsoft\\Windows\\Start Menu\\Programs'
    ),
    'C:\\Program Files',
    'C:\\Program Files (x86)',
    'C:\\Games',
    'D:\\Games',
    'C:\\Program Files (x86)\\Steam\\steamapps\\common',
    'C:\\Program Files\\Steam\\steamapps\\common',
    'C:\\Program Files\\Epic Games',
    'C:\\Program Files (x86)\\Epic Games',
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
                ignore: ['**/uninstall*', '**/update*', '**/*unins*'],
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
      spinner.fail(`❌ No application found with name "${keyword}".`);

      console.log(chalk.yellow('\n💡 Tips:'));
      console.log(chalk.gray('• Try: yurei run "game name" --force'));
      console.log(chalk.gray('• Or: yurei scan (to refresh cache)'));
      console.log(chalk.gray('• Or: yurei list (to see all games)'));
      return;
    }

    spinner.succeed(`✅ Found ${allExecutables.length} applications.`);

    const sortedApps = allExecutables.sort((a, b) => {
      const aName = path.basename(a, path.extname(a)).toLowerCase();
      const bName = path.basename(b, path.extname(b)).toLowerCase();
      const keywordLower = keyword.toLowerCase();

      const aScore = calculateRelevanceScore(aName, keywordLower);
      const bScore = calculateRelevanceScore(bName, keywordLower);

      return bScore - aScore;
    });

    if (sortedApps.length === 1) {
      // Langsung jalankan jika hanya 1 hasil
      const appPath = sortedApps[0];
      const appName = path.basename(appPath, path.extname(appPath));
      console.log(chalk.green(`🚀 Running: ${appName}`));
      exec(`start "" "${appPath}"`);
      return;
    }

    const { selected } = await inquirer.prompt({
      type: 'list',
      name: 'selected',
      message: 'Select application to run:',
      choices: [
        ...sortedApps.slice(0, 10).map((f) => ({
          name: `${getAppIcon(f)} ${path.basename(
            f,
            path.extname(f)
          )} ${chalk.gray('(' + path.basename(path.dirname(f)) + ')')}`,
          value: f,
        })),
      ],
    });

    const appName = path.basename(selected, path.extname(selected));
    console.log(chalk.green(`🚀 Running: ${appName}`));
    exec(`start "" "${selected}"`);
  } catch (err) {
    spinner.fail('❌ Failed to search application.');
    console.error(chalk.red('Error:'), err.message);
  }
}

// Tampilkan daftar game
async function tampilkanDaftarGame(categoryFilter) {
  await loadGameCache();

  if (gameCache.length === 0) {
    console.log(chalk.yellow('📋 Cache empty. Performing scan...'));
    await scanGameOtomatis();
  }

  if (gameCache.length === 0) {
    console.log(chalk.red('❌ No games found. Try: yurei scan'));
    return;
  }

  let filteredGames = gameCache;

  if (categoryFilter) {
    filteredGames = gameCache.filter((game) =>
      game.category.toLowerCase().includes(categoryFilter.toLowerCase())
    );
  }

  console.log(
    chalk.green(`\n📋 List of Games/Applications (${filteredGames.length}):`)
  );
  console.log('='.repeat(50));

  const gamesByCategory = groupGamesByCategory(filteredGames);

  Object.keys(gamesByCategory).forEach((category) => {
    console.log(chalk.bold.magenta(`\n--- ${category} ---`));
    gamesByCategory[category].forEach((game, index) => {
      console.log(
        `${index + 1}. ${game.icon} ${game.name} ${chalk.gray(
          '(' + game.location + ')'
        )}`
      );
    });
  });

  console.log(chalk.gray('\n💡 Tips:'));
  console.log(chalk.gray('• yurei run "game name" - Run game directly'));
  console.log(chalk.gray('• yurei list --category=Games - Filter by category'));
  console.log(chalk.gray('• yurei scan - Refresh list'));
}

// Buka website populer
async function bukaWebsitePopuler(site) {
  const url = WEBSITES[site.toLowerCase()];

  if (url) {
    console.log(chalk.green(`🌐 Opening ${site}: ${url}`));
    open(url);
  } else {
    console.log(chalk.red(`❌ Website "${site}" not recognized.`));
    console.log(chalk.yellow('💡 Available popular websites:'));
    Object.keys(WEBSITES).forEach((siteName) => {
      console.log(chalk.gray(`• ${siteName}`));
    });
  }
}

// Cache management
async function clearCache() {
  try {
    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile);
      console.log(chalk.green('✅ Cache successfully deleted.'));
    } else {
      console.log(chalk.yellow('⚠️ Cache already empty.'));
    }
    gameCache = [];
  } catch (error) {
    console.log(chalk.red('❌ Failed to delete cache.'));
  }
}

async function showCache() {
  await loadGameCache();

  if (gameCache.length === 0) {
    console.log(chalk.yellow('📋 Cache empty.'));
    return;
  }

  console.log(chalk.green(`\n🗂️ Cache Info:`));
  console.log(`Total games: ${gameCache.length}`);
  console.log(`Cache file: ${cacheFile}`);

  const categories = {};
  gameCache.forEach((game) => {
    categories[game.category] = (categories[game.category] || 0) + 1;
  });

  console.log('\n📊 Categories:');
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`• ${cat}: ${count} games`);
  });
}

// === INTERACTIVE MENU FUNCTIONS (UNCHANGED) ===

async function menuUtama() {
  while (true) {
    try {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: chalk.greenBright('🤖 AI-Powered Yurei - Choose Option:'),
          choices: [
            { name: '🌐 Browse Website (AI-powered)', value: 'browser' },
            { name: '🎮 Run Game/App (Smart search)', value: 'game' },
            { name: '📁 Open CLI Folder', value: 'explorer' },
            { name: '🤖 AI Command Examples', value: 'ai_help' },
            { name: '❌ Exit', value: 'exit' },
          ],
        },
      ]);

      if (action === 'browser') {
        await bukaBrowser();
      } else if (action === 'game') {
        await menuGame();
      } else if (action === 'explorer') {
        exec(`start "" "${path.join(__dirname, '../')}"`);
        console.log(chalk.green('📁 CLI folder opened!'));
      } else if (action === 'ai_help') {
        showAIExamples();
      } else if (action === 'exit') {
        console.log(chalk.yellow('👋 Thanks for using AI-Powered Yurei CLI!'));
        process.exit(0);
      }
    } catch (error) {
      console.log(chalk.red('\n❌ Error occurred. Returning to main menu...'));
      continue;
    }
  }
}

function showAIExamples() {
  console.log(chalk.cyan('\n🤖 AI-Powered Commands:'));
  console.log('='.repeat(40));

  console.log(chalk.yellow('\n🌐 Smart Website Opening:'));
  console.log('• yurei youtube          # Opens YouTube');
  console.log('• yurei github           # Opens GitHub');
  console.log('• yurei gmail            # Opens Gmail');
  console.log('• yurei ig               # Opens Instagram');
  console.log('• yurei chatgpt          # Opens ChatGPT');

  console.log(chalk.yellow('\n🎮 Smart Game/App Launch:'));
  console.log('• yurei minecraft        # Finds & runs Minecraft');
  console.log('• yurei steam            # Opens Steam');
  console.log('• yurei discord          # Opens Discord');
  console.log('• yurei run genshin      # Runs Genshin Impact');

  console.log(chalk.yellow('\n🧠 Natural Language:'));
  console.log('• yurei open youtube     # Natural command');
  console.log('• yurei play minecraft   # Natural game launch');
  console.log('• yurei search cats      # Web search');

  console.log(chalk.gray('\n💡 Just type what you want - AI will understand!'));
}

// === EXISTING FUNCTIONS (Keep all previous functions) ===

async function menuGame() {
  while (true) {
    try {
      const { gameAction } = await inquirer.prompt([
        {
          type: 'list',
          name: 'gameAction',
          message: chalk.cyanBright('🎮 Choose how to run application:'),
          choices: [
            { name: '🔍 Search Manually (type name)', value: 'search' },
            { name: '📋 Select from Game List', value: 'list' },
            { name: '🔄 Refresh Game List', value: 'refresh' },
            { name: '⬅️ Back to Main Menu', value: 'back' },
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
        break;
      }
    } catch (error) {
      console.log(chalk.red('\n❌ Error occurred. Returning to game menu...'));
      continue;
    }
  }
}

async function pilihDariDaftarGame() {
  try {
    await loadGameCache();

    if (gameCache.length === 0) {
      console.log(
        chalk.yellow('\n📋 Game list empty. Performing automatic scan...')
      );
      await scanGameOtomatis();
    }

    if (gameCache.length === 0) {
      console.log(chalk.red('\n❌ No games found on Desktop and Start Menu.'));
      console.log(chalk.gray('💡 Tips:'));
      console.log(chalk.gray('  • Try "Search Manually"'));
      console.log(chalk.gray('  • Ensure game is installed'));
      console.log(chalk.gray('  • Try "Refresh Game List"'));

      await inquirer.prompt([
        {
          type: 'input',
          name: 'continue',
          message: 'Press Enter to return...',
        },
      ]);
      return;
    }

    console.log(
      chalk.green(`\n📋 Found ${gameCache.length} games/applications:`)
    );

    const gamesByCategory = groupGamesByCategory(gameCache);
    const choices = [];

    Object.keys(gamesByCategory).forEach((category) => {
      choices.push(
        new inquirer.Separator(chalk.bold.magenta(`--- ${category} ---`))
      );
      gamesByCategory[category].forEach((game) => {
        choices.push({
          name: `${game.icon} ${game.name} ${chalk.gray(
            '(' + game.location + ')'
          )}`,
          value: game.path,
        });
      });
      choices.push(new inquirer.Separator(' '));
    });

    choices.push(new inquirer.Separator(chalk.gray('--- Actions ---')));
    choices.push({ name: '🔄 Refresh List', value: 'refresh' });
    choices.push({ name: '⬅️ Back', value: 'back' });

    const { selectedGame } = await inquirer.prompt({
      type: 'list',
      name: 'selectedGame',
      message: 'Select game/application to run:',
      choices: choices,
      pageSize: 15,
    });

    if (selectedGame === 'refresh') {
      await refreshDaftarGame();
      return;
    }

    if (selectedGame === 'back') {
      return;
    }

    const selectedGameInfo = gameCache.find(
      (game) => game.path === selectedGame
    );
    if (selectedGameInfo) {
      console.log(
        chalk.yellow(
          '\n⏳ Please wait, speed depends on laptop specifications...'
        )
      );
      console.log(chalk.green(`🚀 Running: ${selectedGameInfo.name}`));

      exec(`start "" "${selectedGame}"`);

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  } catch (error) {
    console.log(chalk.red('\n❌ Error occurred while loading game list.'));
    console.error(error);
  }
}

async function scanGameOtomatis() {
  const spinner = ora('🔍 Scanning games on Desktop and Start Menu...').start();

  const gamePaths = [
    path.join(process.env.USERPROFILE || '', 'Desktop'),
    path.join(
      process.env.APPDATA || '',
      'Microsoft\\Windows\\Start Menu\\Programs'
    ),
    path.join(
      process.env.PROGRAMDATA || '',
      'Microsoft\\Windows\\Start Menu\\Programs'
    ),
    'C:\\Program Files (x86)\\Steam\\steamapps\\common',
    'C:\\Program Files\\Steam\\steamapps\\common',
    'C:\\Program Files\\Epic Games',
    'C:\\Program Files (x86)\\Epic Games',
    'C:\\Games',
    'D:\\Games',
    'E:\\Games',
  ];

  const foundGames = [];

  try {
    for (const gamePath of gamePaths) {
      if (!fs.existsSync(gamePath)) continue;

      try {
        const files = glob.sync(`${gamePath}/**/*.{exe,lnk,launcher}`, {
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
            '**/directx*',
          ],
        });

        const gameFiles = files.filter((file) => {
          const fileName = path.basename(file).toLowerCase();
          return isLikelyGame(fileName) || isPopularApp(fileName);
        });

        foundGames.push(...gameFiles);
      } catch (err) {
        continue;
      }
    }

    const uniqueGames = [...new Set(foundGames)];

    gameCache = [];

    gameCache = uniqueGames.map((gamePath) => {
      const name = path.basename(gamePath, path.extname(gamePath));
      const location = path.basename(path.dirname(gamePath));

      return {
        name: name,
        path: gamePath,
        location: location,
        icon: getAppIcon(gamePath),
        category: getGameCategory(name.toLowerCase()),
      };
    });

    gameCache.sort((a, b) => a.name.localeCompare(b.name));

    await saveGameCache();

    spinner.succeed(
      `✅ Successfully found ${gameCache.length} games/applications.`
    );
  } catch (err) {
    spinner.fail('❌ Failed to scan games.');
    console.error('Error details:', err.message);
  }
}

async function loadGameCache() {
  try {
    if (fs.existsSync(cacheFile)) {
      const cacheData = fs.readFileSync(cacheFile, 'utf8');
      gameCache = JSON.parse(cacheData);
    } else {
      gameCache = [];
    }
  } catch (err) {
    console.log(chalk.yellow('⚠️ Failed to load cache, creating new cache.'));
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
    console.log(chalk.yellow('⚠️ Failed to save cache:', err.message));
  }
}

async function refreshDaftarGame() {
  try {
    console.log(chalk.yellow('\n🔄 Refreshing game list...'));

    gameCache = [];

    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile);
    }

    await scanGameOtomatis();

    console.log(chalk.green('✅ Game list successfully refreshed!'));

    await new Promise((resolve) => setTimeout(resolve, 1500));
  } catch (error) {
    console.log(chalk.red('❌ Failed to refresh game list.'));
    console.error(error);
  }
}

async function jalankanGameManual() {
  try {
    const { keyword } = await inquirer.prompt({
      type: 'input',
      name: 'keyword',
      message: '🔍 Type game/application name (e.g., genshin, steam, discord):',
      validate: (input) => input.trim().length > 0 || 'Please enter a keyword!',
    });

    await jalankanGameDenganKeyword(keyword);
  } catch (error) {
    console.log(chalk.red('❌ Error occurred during manual search.'));
  }
}

async function bukaBrowser() {
  try {
    const { url } = await inquirer.prompt({
      type: 'input',
      name: 'url',
      message: '🔗 Enter URL:',
      default: 'https://youtube.com',
    });

    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = url.includes('.')
        ? `https://${url}`
        : `https://www.${url}.com`;
    }

    const browserList = [
      {
        name: '🌐 Chrome',
        path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      },
      {
        name: '🌀 Edge',
        path: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      },
      {
        name: '🦊 Firefox',
        path: 'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
      },
      {
        name: '🌐 Brave',
        path: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
      },
      { name: '🌐 Default Browser', value: 'default' },
    ].filter((b) => b.value === 'default' || fs.existsSync(b.path));

    if (browserList.length === 1) {
      open(formattedUrl);
      console.log(chalk.green(`🌐 Opening: ${formattedUrl}`));
      return;
    }

    const { selectedBrowser } = await inquirer.prompt({
      type: 'list',
      name: 'selectedBrowser',
      message: 'Select browser:',
      choices: browserList.map((b) => ({
        name: b.name,
        value: b.value === 'default' ? 'default' : b.path,
      })),
    });

    if (selectedBrowser === 'default') {
      open(formattedUrl);
    } else {
      exec(`"${selectedBrowser}" "${formattedUrl}"`);
    }

    console.log(chalk.green(`🌐 Opening: ${formattedUrl}`));
  } catch (error) {
    console.log(chalk.red('❌ Failed to open browser.'));
  }
}
