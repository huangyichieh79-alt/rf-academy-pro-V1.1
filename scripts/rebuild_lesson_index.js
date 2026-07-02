'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LESSON_DIR = path.join(ROOT, 'data', 'lessons');
const files = fs.readdirSync(LESSON_DIR).filter(name => /^day\d{3}\.json$/.test(name)).sort();
const index = files.map((file, position) => {
  const lesson = JSON.parse(fs.readFileSync(path.join(LESSON_DIR, file), 'utf8'));
  const day = position + 1;
  const id = `day${String(day).padStart(3, '0')}`;
  if (file !== `${id}.json` || lesson.day !== day || lesson.id !== id) {
    throw new Error(`${file}: filename, day, or id is not continuous at ${id}`);
  }
  return {
    day,
    id,
    topic: lesson.topic,
    topic_zh_tw: lesson.topic_zh_tw,
    stage: lesson.stage,
    stage_zh_tw: lesson.stage_zh_tw,
    duration_minutes: lesson.duration_minutes
  };
});

fs.writeFileSync(path.join(LESSON_DIR, 'index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8');
console.log(`Lesson index rebuilt with ${index.length} continuous records.`);
