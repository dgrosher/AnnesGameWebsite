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
await writeFile(new URL('privacy.html', output), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>Privacy · Anne’s Arcade</title><link rel="stylesheet" href="style.css"></head>
<body><main class="privacy-page"><a href="index.html">← Back to Anne’s Arcade</a><h1>A little about privacy</h1>
<p>This iOS app bundles its games on your device. It does not require an account, show ads, or send website analytics. There are no in-app purchases.</p>
<p>Your chosen read-aloud voice, reading pace, and Desert Dino Dash best score are saved only on this device. Removing the app removes that data.</p>
<p>Read-aloud uses the device’s speech service. Availability and offline support depend on the voices installed on your device; some voices may need an internet connection.</p>
</main></body></html>`);
console.log('Bundled all arcade games in dist/ for iOS (offline assets, no analytics).');
