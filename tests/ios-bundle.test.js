import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile, access} from 'node:fs/promises';

test('iOS bundle includes every linked game and local module, without website trackers or fonts', async () => {
  execFileSync(process.execPath, ['scripts/build-ios-web.mjs']);
  const html = await readFile('dist/index.html', 'utf8');
  const website = await readFile('index.html', 'utf8');
  assert.deepEqual([...html.matchAll(/data-game="([^"]+)"/g)].map(m=>m[1]),
    [...website.matchAll(/data-game="([^"]+)"/g)].map(m=>m[1]));
  assert.equal([...html.matchAll(/data-game=/g)].length, 27);
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /class="native-app"/);
  const visited = new Set();
  async function checkModule(path) {
    if (visited.has(path)) return;
    visited.add(path);
    const source = await readFile(path, 'utf8');
    for (const match of source.matchAll(/(?:from\s*|import\s*)['"](\.\/[^'"]+)['"]/g)) {
      await checkModule(new URL(match[1], new URL(path, `file://${process.cwd()}/`)).pathname);
    }
  }
  await checkModule(`${process.cwd()}/dist/src/app.js`);
  assert.ok(visited.size > 20);
  for (const match of html.matchAll(/(?:src|href)="((?:assets\/)[^"]+)"/g)) await access(`dist/${match[1]}`);
  const config = await import(`../dist/src/analytics-config.js?check=${Date.now()}`);
  assert.equal(config.analyticsConfig.enabled, false);
  assert.doesNotMatch(await readFile('dist/style.css', 'utf8'), /fonts\.googleapis/);
  assert.match(await readFile('dist/privacy.html', 'utf8'), /does not require an account/);
  const native = JSON.parse(await readFile('capacitor.config.json', 'utf8'));
  assert.equal(native.webDir, 'dist');
  assert.equal(native.server?.url, undefined);
});
