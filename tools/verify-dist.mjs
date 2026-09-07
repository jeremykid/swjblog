import { readFile, stat } from 'node:fs/promises';

const paths = (await readFile('tests/fixtures/legacy-paths.txt', 'utf8'))
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

function outputPath(path) {
  if (path === '/') return 'public/index.html';
  if (path.endsWith('.html')) return `public${path}`;
  return `public${path}index.html`;
}

for (const path of paths) {
  await stat(outputPath(path));
}

const articlePath = 'public/2026/09/07/tied-event-times-survival-analysis/index.html';
const article = await readFile(articlePath, 'utf8');
for (const text of [
  'Tie handling depends on the training objective',
  'survival 3.8-11',
  'TorchSurv 0.2.0',
  'pycox 0.3.0',
  'scikit-survival 0.28.0'
]) {
  if (!article.includes(text)) throw new Error(`Article is missing: ${text}`);
}

for (const privateText of ['turn0file', 'chatgpt.com/share', 'TODO']) {
  if (article.includes(privateText)) throw new Error(`Article leaked draft text: ${privateText}`);
}

console.log('generated-site contract: ok');
