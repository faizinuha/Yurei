import ora from 'ora';

export async function loadingTask(text, fn) {
  const spinner = ora(text).start();

  try {
    const result = await fn();
    spinner.succeed('Selesai!');
    return result;
  } catch (err) {
    spinner.fail('Gagal!');
    console.error(err);
  }
}
