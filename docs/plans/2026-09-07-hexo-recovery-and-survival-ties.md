# Hexo Recovery and Survival Ties Article Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Recover a maintainable Hexo source project that reproduces the current NexT/Muse blog and adds a reviewed English article about tied event times across survival-analysis objectives.

**Architecture:** Keep `jeremykid/swjblog` as the authored Hexo source and `jeremykid/jeremykid.github.io` as the generated deployment repository. Modernize only the build layer, preserve the current UI and historical paths, and stop at a local preview until the user explicitly approves publication.

**Tech Stack:** Node.js 20, Hexo 7.3.0, NexT 7.8.0, Markdown, MathJax/KaTeX through `hexo-math` 4.0.0, Node standard-library verification scripts.

---

### Task 1: Add source and output contract tests

**Files:**
- Create: `tests/fixtures/legacy-paths.txt`
- Create: `scripts/verify-source.mjs`
- Create: `scripts/verify-dist.mjs`
- Modify: `package.json`

**Step 1: Record the public paths that must survive the recovery**

Create `tests/fixtures/legacy-paths.txt` with one decoded path per line. Include `/`, `/about/`, `/archives/`, `/categories/`, `/tags/`, both legacy top-level HTML pages, and every dated post path currently listed in `https://jeremykid.github.io/sitemap.xml`. Include `/2020/06/23/Survival-Analysis-note-0/`, which is missing from the old source repository.

**Step 2: Write the failing source verification script**

Create `scripts/verify-source.mjs`:

```js
import { execFileSync } from 'node:child_process';

const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

const forbidden = tracked.filter((path) =>
  path === 'db.json' ||
  path.endsWith('/.DS_Store') ||
  path === '.DS_Store' ||
  path.startsWith('node_modules/') ||
  path.startsWith('public/')
);

if (forbidden.length) {
  throw new Error(`Generated or local files are tracked:\n${forbidden.join('\n')}`);
}

for (const path of ['_config.yml', '_config.next.yml', 'source/_posts']) {
  if (!tracked.some((trackedPath) => trackedPath === path || trackedPath.startsWith(`${path}/`))) {
    throw new Error(`Missing required source path: ${path}`);
  }
}

console.log('source contract: ok');
```

**Step 3: Write the failing generated-site verification script**

Create `scripts/verify-dist.mjs`:

```js
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
```

**Step 4: Add temporary verification scripts to `package.json`**

Add:

```json
"scripts": {
  "verify:source": "node scripts/verify-source.mjs",
  "verify:dist": "node scripts/verify-dist.mjs"
}
```

Preserve the existing package metadata for now; Task 3 will replace the dependency set.

**Step 5: Run the source test and verify that it fails**

Run: `npm run verify:source`

Expected: FAIL and list tracked paths under `node_modules/`, `public/`, `db.json`, or `.DS_Store`.

**Step 6: Commit the test harness**

```bash
git add package.json scripts tests
git commit -m "test: define Hexo recovery contracts"
```

### Task 2: Remove generated and machine-local files from source control

**Files:**
- Modify: `.gitignore`
- Delete from source control: `.DS_Store`
- Delete from source control: `db.json`
- Delete from source control: `node_modules/`
- Delete from source control: `public/`
- Delete from source control: `source/.DS_Store`
- Delete from source control: `source/_posts/.DS_Store`
- Delete from source control: `themes/.DS_Store`
- Delete from source control: `themes/chan`
- Delete from source control: `themes/next`
- Delete from source control: `themes/next-old`

**Step 1: Preserve the two legacy top-level pages before removing `public/`**

Move `public/Reinforcement-Learning-Note-1.html` to `source/Reinforcement-Learning-Note-1.html`. Fetch the current live `Deep learning.html`, inspect it for external or private content, and add the approved file at `source/Deep learning.html`. These will be copied through unchanged by Hexo.

**Step 2: Replace `.gitignore` with a source-oriented ignore policy**

Keep any relevant Python exclusions and add:

```gitignore
.DS_Store
Thumbs.db
node_modules/
public/
db.json
*.log
.deploy_git/
```

**Step 3: Remove only the verified generated and broken theme paths**

Run the following against the explicit repository-relative targets:

```bash
git rm -r node_modules public
git rm -f .DS_Store db.json source/.DS_Store source/_posts/.DS_Store themes/.DS_Store
git rm -f themes/chan themes/next themes/next-old
```

Do not remove `source/`, `scaffolds/`, the Django-era `swjblog/` directory, or historical post sources.

**Step 4: Run the source test**

Run: `npm run verify:source`

Expected: FAIL only because `_config.next.yml` has not been created yet. No generated or local file should be reported as tracked.

**Step 5: Commit the cleanup**

```bash
git add .gitignore source
git commit -m "chore: remove generated Hexo artifacts"
```

### Task 3: Modernize the reproducible Hexo build

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `_config.yml`
- Create: `_config.next.yml`

**Step 1: Replace `package.json` with a pinned build definition**

Use:

```json
{
  "name": "weijie-sun-blog",
  "version": "1.0.0",
  "private": true,
  "description": "Hexo source for jeremykid.github.io",
  "scripts": {
    "clean": "hexo clean",
    "build": "hexo generate",
    "server": "hexo server",
    "verify:source": "node scripts/verify-source.mjs",
    "verify:dist": "node scripts/verify-dist.mjs",
    "test": "npm run verify:source && npm run clean && npm run build && npm run verify:dist"
  },
  "dependencies": {
    "hexo": "7.3.0",
    "hexo-generator-archive": "2.0.0",
    "hexo-generator-category": "2.0.0",
    "hexo-generator-index": "4.0.0",
    "hexo-generator-searchdb": "1.5.0",
    "hexo-generator-sitemap": "3.0.1",
    "hexo-generator-tag": "2.0.0",
    "hexo-inject": "1.0.0",
    "hexo-math": "4.0.0",
    "hexo-renderer-ejs": "2.0.0",
    "hexo-renderer-marked": "7.0.1",
    "hexo-renderer-stylus": "3.0.1",
    "hexo-server": "3.0.0",
    "hexo-theme-next": "7.8.0"
  },
  "engines": {
    "node": ">=20 <21"
  }
}
```

Before installing, confirm that each pinned package version is available with `npm view <package>@<version> version`.

**Step 2: Regenerate the lockfile and install cleanly**

Run:

```bash
npm install --package-lock-only
npm ci
```

Expected: dependencies install without relying on the historical tracked `node_modules` tree.

**Step 3: Update `_config.yml` conservatively**

- Change `url` to `https://jeremykid.github.io/`.
- Keep `root: /` and `permalink: :year/:month/:day/:title/`.
- Keep `theme: next`, `timezone: America/Edmonton`, and the current site title, author, menu, search, and Creative Commons settings.
- Add both top-level HTML files to `skip_render`.
- Remove obsolete or invalid options only when Hexo 7 emits a warning.
- Do not add deployment credentials or a deploy target.

**Step 4: Create `_config.next.yml` as the only NexT customization layer**

Configure NexT 7.8.0 to match the live site:

```yaml
scheme: Muse

menu:
  home: / || home
  about: /about/ || user
  tags: /tags/ || tags
  categories: /categories/ || th
  archives: /archives/ || archive

avatar:
  url: /images/avatar.jpeg
  rounded: false
  rotated: false

sidebar:
  position: left
  display: post

local_search:
  enable: true
  trigger: auto
  top_n_per_article: 1
  unescape: false
  preload: false
```

Transfer only settings confirmed in the current live HTML or old theme config. Do not introduce a new palette, font, layout, widget, or animation.

**Step 5: Run the source test**

Run: `npm run verify:source`

Expected: `source contract: ok`.

**Step 6: Commit the build modernization**

```bash
git add package.json package-lock.json _config.yml _config.next.yml
git commit -m "build: restore reproducible Hexo site"
```

### Task 4: Recover source content missing from `swjblog`

**Files:**
- Create: `source/_posts/Survival-Analysis-note-0.md`
- Modify as needed: `source/Deep learning.html`
- Modify as needed: `source/Reinforcement-Learning-Note-1.html`
- Modify: `tests/fixtures/legacy-paths.txt`

**Step 1: Recover the Brier Score post**

Use the Markdown version on `jeremykid/jeremykid.github.io:astro-refactor` as the source because it was migrated from the live post. Preserve:

```yaml
title: Brier Score
date: 2020-06-23 21:16:51
tags:
  - Machine Learning Survival Analysis
categories:
  - Research
```

Save it as `source/_posts/Survival-Analysis-note-0.md` so the generated path remains `/2020/06/23/Survival-Analysis-note-0/`. Do not rewrite the article in this task.

**Step 2: Check the recovered source inventory**

Run: `npx hexo list post`

Expected: every dated post in `tests/fixtures/legacy-paths.txt` appears, including `Brier Score`.

**Step 3: Generate the site and run the path portion of verification**

Run:

```bash
npm run clean
npm run build
```

Expected: the build succeeds. `npm run verify:dist` may still fail only because the new 2026 article does not exist.

**Step 4: Commit recovered content**

```bash
git add source tests/fixtures/legacy-paths.txt
git commit -m "content: recover missing legacy pages"
```

### Task 5: Add and correct the survival ties article

**Files:**
- Create: `source/_posts/tied-event-times-survival-analysis.md`

**Step 1: Start from the reviewed draft**

Use `/Users/weijie/Downloads/tied_event_times_survival_analysis_revised.md` as the prose source. Preserve its title, date, category, tags, equations, comparison table, clinical example, decision guide, and references.

**Step 2: Apply the two required factual corrections**

Replace both references to `survival 3.8-6` with `survival 3.8-11`.

Replace the Survival SVM paragraph with:

```markdown
Survival SVMs provide another ranking example. Conceptually, equal event times do not encode a strict temporal ordering. However, `FastSurvivalSVM` in scikit-survival 0.28.0 resolves ties in survival times before optimization, using `random_state` to make this ordering reproducible. This implementation convention should not be mistaken for temporal information observed in the data.
```

**Step 3: Apply the approved precision edits**

- Explain that the usual Cox risk set keeps a person censored at time `t` in `R(t)` for failures at `t`, while evaluation metrics may use different comparability conventions.
- Describe the pycox within-tie behavior as an inference from its version-pinned source, not as an explicit library claim.
- Change the Random Survival Forest table cell to `No Cox-style correction; estimator-specific handling`.
- Use version-pinned scikit-survival links.
- Use `\ell_t^{\mathrm{Efron}}` for the Efron contribution.

**Step 4: Check the article for private or draft-only text**

Run:

```bash
rg -n 'turn[0-9]+(file|search|view)|chatgpt.com/share|TODO|phone|@ualberta.ca' source/_posts/tied-event-times-survival-analysis.md
```

Expected: no matches.

**Step 5: Build and run the generated-site contract**

Run:

```bash
npm run clean
npm run build
npm run verify:dist
```

Expected: `generated-site contract: ok`.

**Step 6: Commit the article**

```bash
git add source/_posts/tied-event-times-survival-analysis.md
git commit -m "content: add survival ties research note"
```

### Task 6: Verify links, mathematics, and historical paths

**Files:**
- Modify: `scripts/verify-dist.mjs`
- Modify as needed: `_config.yml`
- Modify as needed: `_config.next.yml`
- Modify as needed: `source/_posts/tied-event-times-survival-analysis.md`

**Step 1: Extend `verify-dist.mjs` with structural checks**

Add assertions that:

- `public/index.html`, archives, tags, categories, search XML, and sitemap exist.
- The article appears on the homepage, in archives, and in each configured tag/category page.
- The article HTML contains math-renderer assets or MathJax configuration.
- Formula source has not been escaped into broken text.
- Every local `href` referenced by the article resolves under `public/`.

**Step 2: Run the full clean test**

Run: `npm test`

Expected: source contract, Hexo build, and generated-site contract all pass.

**Step 3: Check external article links**

Check the DOI, CRAN, TorchSurv, pycox, and scikit-survival URLs with HTTP HEAD/GET requests. Record redirects, but fail only on persistent 4xx/5xx responses.

**Step 4: Inspect build output for warnings and accidental secrets**

Run:

```bash
rg -n 'WARN|ERROR' .deploy-log public 2>/dev/null || true
rg -n 'turn[0-9]+(file|search|view)|chatgpt.com/share|TODO|@ualberta.ca' public/2026/09/07/tied-event-times-survival-analysis/index.html
```

Expected: no fatal build warning and no private/draft-only match.

**Step 5: Commit verification improvements**

```bash
git add scripts _config.yml _config.next.yml source/_posts/tied-event-times-survival-analysis.md
git commit -m "test: verify recovered Hexo output"
```

### Task 7: Perform local visual QA and prepare the user preview

**Files:**
- Modify only if QA exposes a defect: `_config.yml`
- Modify only if QA exposes a defect: `_config.next.yml`
- Modify only if QA exposes a defect: `source/_posts/tied-event-times-survival-analysis.md`

**Step 1: Start a local server**

Run in a persistent terminal:

```bash
npm run server -- --port 4000
```

Expected: Hexo serves `http://localhost:4000/`.

**Step 2: Compare the home page with the live site**

Open the local and live home pages at a normal desktop viewport. Verify the NexT/Muse header, navigation, content width, sidebar, typography, colors, post list, and footer.

**Step 3: Inspect the new article**

Open `http://localhost:4000/2026/09/07/tied-event-times-survival-analysis/`. Verify headings, table overflow, inline code, block quotes, equations, bibliography links, and long package names.

**Step 4: Test a narrow viewport**

Temporarily use a 390 by 844 viewport. Verify that navigation, tables, equations, links, and code do not overflow the page. Reset the viewport afterward.

**Step 5: Re-run tests after any QA fix**

Run: `npm test`

Expected: PASS.

**Step 6: Commit only if QA required changes**

```bash
git add _config.yml _config.next.yml source/_posts/tied-event-times-survival-analysis.md
git commit -m "fix: polish recovered Hexo preview"
```

**Step 7: Stop before publication**

Report the local preview URL, test results, changed files, and commit list to the user. Do not push the branch, change GitHub Pages settings, overwrite `jeremykid.github.io/master`, or publish the article until the user explicitly approves the preview.
