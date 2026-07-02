'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const directories = ['css', 'data', 'icons', 'js'];
const files = ['index.html', 'manifest.json', 'service-worker.js', '.nojekyll'];

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
for (const directory of directories) fs.cpSync(path.join(ROOT, directory), path.join(DIST, directory), { recursive: true });
for (const file of files) fs.copyFileSync(path.join(ROOT, file), path.join(DIST, file));
fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(DIST, '404.html'));

console.log('Production bundle created in dist/.');
