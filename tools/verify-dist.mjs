import { readFile, stat } from 'node:fs/promises';
import { extname, normalize } from 'node:path';

const publicRoot = 'public';
const siteOrigin = 'https://jeremykid.github.io';
const articleRoute = '/2026/09/07/tied-event-times-survival-analysis/';
const articlePath = `${publicRoot}${articleRoute}index.html`;

const legacyPaths = (await readFile('tests/fixtures/legacy-paths.txt', 'utf8'))
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

function outputPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  if (decoded === '/') return `${publicRoot}/index.html`;
  if (decoded.endsWith('/')) return `${publicRoot}${decoded}index.html`;
  if (extname(decoded)) return `${publicRoot}${decoded}`;
  return `${publicRoot}${decoded}/index.html`;
}

async function requireOutput(path) {
  try {
    await stat(path);
  } catch {
    throw new Error(`Missing generated output: ${path}`);
  }
}

for (const path of legacyPaths) {
  await requireOutput(outputPath(path));
}

for (const path of [
  `${publicRoot}/index.html`,
  `${publicRoot}/archives/index.html`,
  `${publicRoot}/tags/index.html`,
  `${publicRoot}/categories/index.html`,
  `${publicRoot}/search.xml`,
  `${publicRoot}/sitemap.xml`,
  articlePath
]) {
  await requireOutput(path);
}

const article = await readFile(articlePath, 'utf8');
const articleText = article.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

for (const text of [
  'Tie handling depends on the training objective',
  'survival 3.8-11',
  'TorchSurv 0.2.0',
  'pycox 0.3.0',
  'scikit-survival 0.28.0'
]) {
  if (!articleText.includes(text)) throw new Error(`Article is missing: ${text}`);
}

for (const path of [
  `${publicRoot}/index.html`,
  `${publicRoot}/archives/index.html`,
  `${publicRoot}/categories/Research-Notes/index.html`,
  `${publicRoot}/tags/Survival-Analysis/index.html`,
  `${publicRoot}/tags/Clinical-AI/index.html`,
  `${publicRoot}/tags/Machine-Learning/index.html`
]) {
  const listing = await readFile(path, 'utf8');
  if (!listing.includes(articleRoute)) {
    throw new Error(`Article is missing from listing: ${path}`);
  }
}

const mathContainerCount = article.match(/<mjx-container\b/g)?.length ?? 0;
if (mathContainerCount < 20) {
  throw new Error(`Expected rendered MathJax output; found ${mathContainerCount} containers`);
}

for (const formula of [
  /data-latex="\s*\\ell_t\^\{\\mathrm\{Efron\}\}/,
  /data-latex="\s*\\mathcal P =/,
  /data-latex="\s*L_i =/
]) {
  if (!formula.test(article)) throw new Error(`Rendered formula is missing: ${formula}`);
}

for (const brokenFormula of [/<p>\[\s*<br>/, /<h[1-6][^>]*>\s*\$\$/]) {
  if (brokenFormula.test(article)) {
    throw new Error(`Formula was parsed as ordinary Markdown: ${brokenFormula}`);
  }
}

for (const privateText of ['turn0file', 'chatgpt.com/share', 'TODO', '@ualberta.ca']) {
  if (article.includes(privateText)) throw new Error(`Article leaked draft text: ${privateText}`);
}

const hrefs = [...article.matchAll(/\shref=(['"])(.*?)\1/g)].map((match) => match[2]);
for (const href of new Set(hrefs)) {
  const decodedHref = href.replaceAll('&amp;', '&');
  if (decodedHref.startsWith('#') || decodedHref.startsWith('//')) continue;
  if (/^[a-z][a-z\d+.-]*:/i.test(decodedHref)) continue;

  const url = new URL(decodedHref, `${siteOrigin}${articleRoute}`);
  if (url.origin !== siteOrigin) continue;

  const path = normalize(outputPath(url.pathname));
  if (!path.startsWith(`${publicRoot}/`)) {
    throw new Error(`Local link escapes the generated site: ${href}`);
  }
  await requireOutput(path);
}

console.log(`generated-site contract: ok (${legacyPaths.length} legacy paths, ${mathContainerCount} formulas)`);
