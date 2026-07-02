'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const LESSON_COUNT = 65;
const errors = [];
const fail = message => errors.push(message);
const readJson = relative => {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8')); }
  catch (error) { fail(`${relative}: ${error.message}`); return null; }
};

for (const file of ['index.html', 'manifest.json', 'service-worker.js', '.nojekyll', 'js/app.js', 'js/config.js', 'data/debug-cases.json', 'data/interviews.json']) {
  if (!fs.existsSync(path.join(ROOT, file))) fail(`Missing required file: ${file}`);
}

const rootLessons = fs.readdirSync(ROOT).filter(name => /^day\d{3}\.json$/.test(name));
if (rootLessons.length) fail(`Root directory still contains: ${rootLessons.join(', ')}`);

const lessonDir = path.join(ROOT, 'data', 'lessons');
const actualFiles = fs.existsSync(lessonDir) ? fs.readdirSync(lessonDir).filter(name => /^day\d{3}\.json$/.test(name)).sort() : [];
const expectedFiles = Array.from({ length: LESSON_COUNT }, (_, index) => `day${String(index + 1).padStart(3, '0')}.json`);
if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) fail('Lesson files are not continuous day001-day065');

for (let day = 1; day <= LESSON_COUNT; day += 1) {
  const id = `day${String(day).padStart(3, '0')}`;
  const lesson = readJson(`data/lessons/${id}.json`);
  if (!lesson) continue;
  if (lesson.day !== day || lesson.id !== id) fail(`${id}: day or id mismatch`);
  if (!Array.isArray(lesson.vocabulary) || lesson.vocabulary.length !== 10) fail(`${id}: vocabulary count is not 10`);
  if (!Array.isArray(lesson.common_sentences) || lesson.common_sentences.length !== 5) fail(`${id}: common sentence count is not 5`);
  if (!lesson.dialogue?.lines?.length) fail(`${id}: dialogue is incomplete`);
  if (!lesson.debug_case) fail(`${id}: debug case is missing`);
  if (!lesson.interview_question) fail(`${id}: interview question is missing`);
  if (!Array.isArray(lesson.quiz) || lesson.quiz.length !== 5) fail(`${id}: quiz count is not 5`);
}

const index = readJson('data/lessons/index.json');
if (!Array.isArray(index) || index.length !== LESSON_COUNT) fail(`Lesson index must contain ${LESSON_COUNT} records`);
for (let day = 1; day <= (index?.length || 0); day += 1) {
  if (index[day - 1].day !== day || index[day - 1].id !== `day${String(day).padStart(3, '0')}`) fail(`Lesson index sequence error at day ${day}`);
}

readJson('data/debug-cases.json');
readJson('data/interviews.json');
const manifest = readJson('manifest.json');
if (manifest?.start_url?.startsWith('/') || manifest?.scope?.startsWith('/')) fail('Manifest start_url and scope must be repository-relative');
if (!manifest?.icons?.some(icon => icon.sizes === '192x192') || !manifest?.icons?.some(icon => icon.sizes === '512x512')) fail('Manifest requires 192 and 512 icons');

const app = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
if (!app.includes('./data/lessons/day${padDay(day)}.json')) fail('Relative lesson fetch path is missing');
if (app.includes("fetch('/data/lessons/") || app.includes('fetch("/data/lessons/')) fail('Absolute root lesson fetch path is forbidden');
const serviceWorker = fs.readFileSync(path.join(ROOT, 'service-worker.js'), 'utf8');
for (const marker of ['rf-academy-v1.1.0', './data/lessons/day001.json', './data/lessons/index.json', './data/debug-cases.json', './data/interviews.json']) {
  if (!serviceWorker.includes(marker)) fail(`Service worker is missing ${marker}`);
}

for (const file of fs.readdirSync(path.join(ROOT, 'js')).filter(name => name.endsWith('.js')).concat(['service-worker.js'])) {
  const target = file === 'service-worker.js' ? path.join(ROOT, file) : path.join(ROOT, 'js', file);
  const result = cp.spawnSync(process.execPath, ['--check', target], { encoding: 'utf8' });
  if (result.status !== 0) fail(`${path.relative(ROOT, target)}: JavaScript syntax error: ${result.stderr.trim()}`);
}

if (errors.length) {
  console.error(`VALIDATION FAILED (${errors.length})`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}
console.log('VALIDATION PASSED');
console.log('- data/lessons contains valid continuous day001-day065 JSON; root contains none');
console.log('- lesson fetch, manifest, and service worker paths are GitHub Pages compatible');
console.log('- service worker cache version is rf-academy-v1.1.0');
