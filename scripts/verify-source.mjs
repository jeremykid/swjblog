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
