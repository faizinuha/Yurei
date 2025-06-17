import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import gradient from 'gradient-string';
import chalk from 'chalk';

export async function asciiWelcome() {
  // 1. Banner YUREI CLI
  const bannerText = figlet.textSync('YUREI CLI', {
    font: 'Slant',
    horizontalLayout: 'fitted',
    verticalLayout: 'default',
  });

  console.log(gradient.pastel.multiline(bannerText));

  // 2. Animasi rainbow "Loading..."
  const rainbow = chalkAnimation.rainbow('✨ Loading YUREI.....');
  await new Promise(resolve => setTimeout(resolve, 1500));
  rainbow.stop();

  // 3. Pesan About
  console.log();
  console.log(chalk.cyan(`📦 Version : 2.0.0`))
  console.log(chalk.greenBright('💚 Terima kasih telah menginstall YUREI CLI!'));
  console.log(chalk.cyan(`🔧 Nikmati berbagai fitur serba guna langsung dari terminal kamu.`));
  console.log(chalk.yellow('📨 Jika mengalami masalah, klik link di bawah ini:'));
  console.log(chalk.blueBright('🌐 https://github.com/mahirodev/yurei-cli/issues\n'));
}
