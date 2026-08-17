// Copies the root web app (index.html, manifest.json, sw.js, icons/) into
// www/, which is Capacitor's webDir. There's no build step in this project,
// so this stands in for one — run it (via `npm run sync:android`) before
// `npx cap sync` any time the root web files change, or the Android app
// will keep shipping a stale copy.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const wwwDir = path.join(root, 'www');

const files = ['index.html', 'manifest.json', 'sw.js'];
fs.mkdirSync(path.join(wwwDir, 'icons'), { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(wwwDir, file));
}

for (const iconFile of fs.readdirSync(path.join(root, 'icons'))) {
  fs.copyFileSync(path.join(root, 'icons', iconFile), path.join(wwwDir, 'icons', iconFile));
}

console.log('Copied web assets into www/');
