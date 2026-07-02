'use strict';

const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');
const errors = [];
const required = ['index.html', '404.html', 'manifest.json', 'service-worker.js', '.nojekyll', 'data/lessons/day001.json', 'data/lessons/day065.json', 'data/lessons/index.json', 'data/debug-cases.json', 'data/interviews.json', 'icons/icon-192.png', 'icons/icon-512.png'];
for (const file of required) if (!fs.existsSync(path.join(DIST, file))) errors.push(`dist/${file} is missing`);

const lessonDir = path.join(DIST, 'data', 'lessons');
const lessonFiles = fs.existsSync(lessonDir) ? fs.readdirSync(lessonDir).filter(name => /^day\d{3}\.json$/.test(name)).sort() : [];
if (lessonFiles.length !== 65 || lessonFiles[0] !== 'day001.json' || lessonFiles.at(-1) !== 'day065.json') errors.push('dist lessons are not continuous day001-day065');
for (const file of lessonFiles) {
  try { JSON.parse(fs.readFileSync(path.join(lessonDir, file), 'utf8')); }
  catch (error) { errors.push(`dist/data/lessons/${file}: ${error.message}`); }
}

const html = fs.existsSync(path.join(DIST, 'index.html')) ? fs.readFileSync(path.join(DIST, 'index.html'), 'utf8') : '';
const app = fs.existsSync(path.join(DIST, 'js', 'app.js')) ? fs.readFileSync(path.join(DIST, 'js', 'app.js'), 'utf8') : '';
if (/\b(?:src|href)=["']\//.test(html)) errors.push('dist/index.html contains an absolute root asset path');
if (!app.includes('./data/lessons/day${padDay(day)}.json') || app.includes("fetch('/data/lessons/")) errors.push('dist lesson fetch path is not GitHub Pages compatible');

if (errors.length) {
  console.error(`BUILD VALIDATION FAILED (${errors.length})`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}
console.log('BUILD VALIDATION PASSED');
console.log('- dist contains 65 continuous lessons at data/lessons/day001.json through day065.json');
console.log('- GitHub Pages assets and lesson fetches use repository-relative paths');
