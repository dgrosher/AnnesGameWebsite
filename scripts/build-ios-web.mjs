import {cp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';

// An explicit allowlist keeps tests, dependencies and developer tools out of the app.
const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
await rm(output, {recursive: true, force: true});
await mkdir(output, {recursive: true});
for (const path of ['index.html', 'privacy.html', 'style.css', 'src', 'assets']) {
  await cp(new URL(path, root), new URL(path, output), {recursive: true});
}
const html = await readFile(new URL('index.html', output), 'utf8');
await writeFile(new URL('index.html', output), html
  .replace('width=device-width, initial-scale=1', 'width=device-width, initial-scale=1, viewport-fit=cover')
  .replace('<html lang="en">', '<html lang="en" class="native-app">')
  .replace('No downloads. No sign-ups. Just play.', 'All your favorites. No sign-ups. Play offline.'));
const css = await readFile(new URL('style.css', output), 'utf8');
await writeFile(new URL('style.css', output), css.replace(/^@import url\([^\n]+\);\s*/, '') + `
/* Keep controls clear of the notch, home indicator and landscape camera area. */
.native-app body{padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}
`);
// The offline app does not send website analytics or load third-party fonts.
await writeFile(new URL('src/analytics-config.js', output), 'export const analyticsConfig = {enabled:false};\n');
await cp(new URL('privacy-ios.html', root), new URL('privacy.html', output));
console.log('Bundled all arcade games in dist/ for iOS (offline assets, no analytics).');
