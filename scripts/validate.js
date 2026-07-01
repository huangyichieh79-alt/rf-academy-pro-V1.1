'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const errors = [];
const notes = [];
const expectedTopics = ['RF Basic', 'RF Measurement', 'Antenna', 'Conducted Power', 'Radiated Power', 'Wi-Fi', 'Bluetooth', 'Cellular', 'OTA', 'EMC Basic', 'Radiated Emission', 'Conducted Emission', 'Immunity', 'ESD', 'EFT', 'Surge', 'Safety Basic', 'Hipot', 'Leakage Current', 'Ground Bond', 'Creepage', 'Clearance', 'Certification', 'FCC', 'CE', 'NCC', 'BSMI', 'UL', 'IEC', 'EN', 'ISO/IEC 17025', 'Test Report', 'Customer Meeting', 'Lab Communication', 'Job Interview'];
const vocabularyFiles = ['rf', 'emc', 'safety', 'certification', 'interview', 'lab_equipment', 'test_report', 'customer_communication'];
const requiredFiles = ['index.html', 'manifest.json', 'service-worker.js', 'README.md', 'css/style.css', 'js/app.js', 'js/storage.js', 'js/tts.js', 'js/quiz.js', 'js/progress.js', 'js/interview.js', 'js/debug.js', 'scripts/generate_lessons.js', 'icons/icon-192.png', 'icons/icon-512.png'];
const wordFields = ['english', 'zh_tw', 'pronunciation', 'category', 'difficulty', 'example', 'example_zh_tw'];
const debugFields = ['problem', 'background', 'possible_causes', 'check_steps', 'corrective_actions', 'supervisor_question', 'suggested_answer'];
const quizTypes = ['english_to_chinese', 'chinese_to_english', 'fill_in_the_blank', 'listening', 'interview_short_answer'];

function fail(message) { errors.push(message); }
function readJson(relative) { try { return JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8')); } catch (error) { fail(`${relative}: ${error.message}`); return null; } }
function nonEmpty(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0 && value.every(nonEmpty);
  return value !== null && value !== undefined;
}

for (const file of requiredFiles) if (!fs.existsSync(path.join(ROOT, file))) fail(`Missing required file: ${file}`);

const vocabSeen = new Set();
const exampleSeen = new Set();
const sentenceSeen = new Set();
const topicsSeen = new Set();
let vocabularyCount = 0;
for (let day = 1; day <= 180; day += 1) {
  const id = `day${String(day).padStart(3, '0')}`;
  const lesson = readJson(`data/lessons/${id}.json`);
  if (!lesson) continue;
  if (lesson.day !== day || lesson.id !== id) fail(`${id}: day or id mismatch`);
  topicsSeen.add(lesson.topic);
  if (!Array.isArray(lesson.vocabulary) || lesson.vocabulary.length !== 10) fail(`${id}: vocabulary count is not 10`);
  if (!Array.isArray(lesson.common_sentences) || lesson.common_sentences.length !== 5) fail(`${id}: common sentence count is not 5`);
  if (!lesson.dialogue?.lines?.length) fail(`${id}: dialogue is incomplete`);
  if (!Array.isArray(lesson.quiz) || lesson.quiz.length !== 5) fail(`${id}: quiz count is not 5`);
  for (const [index, word] of (lesson.vocabulary || []).entries()) {
    vocabularyCount += 1;
    for (const field of wordFields) if (!nonEmpty(word[field])) fail(`${id}: vocabulary ${index + 1} has empty ${field}`);
    const key = String(word.english).toLowerCase();
    if (vocabSeen.has(key)) fail(`${id}: duplicate vocabulary "${word.english}"`); else vocabSeen.add(key);
    const exampleKey = String(word.example).toLowerCase();
    if (exampleSeen.has(exampleKey)) fail(`${id}: duplicate example sentence`); else exampleSeen.add(exampleKey);
  }
  for (const sentence of lesson.common_sentences || []) {
    if (!nonEmpty(sentence.english) || !nonEmpty(sentence.zh_tw)) fail(`${id}: incomplete common sentence`);
    const key = String(sentence.english).toLowerCase();
    if (sentenceSeen.has(key)) fail(`${id}: duplicate common sentence`); else sentenceSeen.add(key);
  }
  for (const field of debugFields) if (!nonEmpty(lesson.debug_case?.[field])) fail(`${id}: debug case has empty ${field}`);
  for (const field of ['category', 'question', 'hint_zh_tw', 'sample_answer', 'natural_rewrite']) if (!nonEmpty(lesson.interview_question?.[field])) fail(`${id}: interview question has empty ${field}`);
  const actualTypes = (lesson.quiz || []).map(item => item.type);
  for (const type of quizTypes) if (!actualTypes.includes(type)) fail(`${id}: missing quiz type ${type}`);
  for (const question of lesson.quiz || []) {
    if (!nonEmpty(question.prompt) || !nonEmpty(question.answer) || !nonEmpty(question.explanation)) fail(`${id}: incomplete quiz question`);
    if (question.options && (!question.options.includes(question.answer) || new Set(question.options).size !== question.options.length)) fail(`${id}: invalid quiz options for ${question.id}`);
  }
}

for (const topic of expectedTopics) if (!topicsSeen.has(topic)) fail(`Topic is not covered: ${topic}`);
if (vocabularyCount !== 1800) fail(`Vocabulary total is ${vocabularyCount}, expected 1800`);
const index = readJson('data/lessons/index.json');
if (!Array.isArray(index) || index.length !== 180) fail('Lesson index must contain 180 records');

let classifiedCount = 0;
for (const category of vocabularyFiles) {
  const entries = readJson(`data/vocabulary/${category}.json`);
  if (!Array.isArray(entries) || entries.length === 0) fail(`Vocabulary category ${category} is empty`);
  classifiedCount += entries?.length || 0;
  for (const [indexValue, word] of (entries || []).entries()) for (const field of wordFields) if (!nonEmpty(word[field])) fail(`${category}.json record ${indexValue + 1} has empty ${field}`);
}
if (classifiedCount !== 1800) fail(`Classified vocabulary total is ${classifiedCount}, expected 1800`);

const debugCases = readJson('data/debug-cases.json');
if (!Array.isArray(debugCases) || debugCases.length !== 12) fail('Debug catalog must contain 12 complete cases');
for (const [indexValue, item] of (debugCases || []).entries()) for (const field of ['title', ...debugFields]) if (!nonEmpty(item[field])) fail(`Debug catalog case ${indexValue + 1} has empty ${field}`);
const interviews = readJson('data/interviews.json');
if (!Array.isArray(interviews) || interviews.length !== 10) fail('Interview catalog must contain 10 complete questions');

const manifest = readJson('manifest.json');
if (manifest?.start_url?.startsWith('/') || manifest?.scope?.startsWith('/')) fail('Manifest paths must remain repository-relative');
if (!manifest?.icons?.some(icon => icon.sizes === '192x192') || !manifest?.icons?.some(icon => icon.sizes === '512x512')) fail('Manifest requires 192 and 512 icons');
const serviceWorker = fs.readFileSync(path.join(ROOT, 'service-worker.js'), 'utf8');
if (!serviceWorker.includes("./index.html") || !serviceWorker.includes("/data/") || !serviceWorker.includes('caches.match')) fail('Service worker app-shell or runtime data caching is incomplete');

const textExtensions = new Set(['.html', '.css', '.js', '.json', '.md']);
const forbidden = ['TO' + 'DO', 'Demo' + ' Data', 'Lorem' + ' ipsum', 'Coming' + ' soon'];
function scan(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) scan(full);
    else if (textExtensions.has(path.extname(entry.name)) && entry.name !== 'validation_report.md') {
      const text = fs.readFileSync(full, 'utf8');
      const relative = path.relative(ROOT, full);
      for (const marker of forbidden) if (text.toLowerCase().includes(marker.toLowerCase())) fail(`${relative}: contains a forbidden unfinished-content marker`);
      if (/file:\/\/|[A-Z]:\\Users\\/i.test(text)) fail(`${relative}: contains a local absolute path`);
    }
  }
}
scan(ROOT);

for (const file of fs.readdirSync(path.join(ROOT, 'js')).filter(name => name.endsWith('.js')).concat(['service-worker.js'])) {
  const target = file === 'service-worker.js' ? path.join(ROOT, file) : path.join(ROOT, 'js', file);
  const result = cp.spawnSync(process.execPath, ['--check', target], { encoding: 'utf8' });
  if (result.status !== 0) fail(`${path.relative(ROOT, target)}: JavaScript syntax error: ${result.stderr.trim()}`);
}

notes.push('180 lesson JSON files parsed');
notes.push(`${vocabularyCount} unique vocabulary records checked`);
notes.push(`${exampleSeen.size} unique vocabulary examples and ${sentenceSeen.size} unique common sentences checked`);
notes.push('35 required topic families covered');
notes.push('Five quiz types, 12 debug cases, and 10 interview questions checked');
notes.push('Relative PWA paths, app-shell caching, and JavaScript syntax checked');

if (errors.length) {
  console.error(`VALIDATION FAILED (${errors.length})`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}
console.log('VALIDATION PASSED');
notes.forEach(note => console.log(`- ${note}`));
