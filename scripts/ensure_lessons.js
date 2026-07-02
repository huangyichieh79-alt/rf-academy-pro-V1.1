'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const LESSON_COUNT = 65;

function lessonsAreComplete() {
  for (let day = 1; day <= LESSON_COUNT; day += 1) {
    const file = path.join(ROOT, 'data', 'lessons', `day${String(day).padStart(3, '0')}.json`);
    try {
      const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (lesson.day !== day || lesson.vocabulary?.length !== 10 || lesson.quiz?.length !== 5) return false;
    } catch {
      return false;
    }
  }
  return true;
}

function ensureLessons() {
  if (lessonsAreComplete()) return { regenerated: false, count: LESSON_COUNT };
  console.log('Lesson data is missing or incomplete. Regenerating Day001-Day065…');
  require('./generate_lessons.js').main();
  if (!lessonsAreComplete()) throw new Error('Lesson regeneration did not produce a complete Day001-Day065 set.');
  return { regenerated: true, count: LESSON_COUNT };
}

if (require.main === module) {
  const result = ensureLessons();
  console.log(result.regenerated ? 'Lesson regeneration completed.' : 'All 65 lesson files are ready.');
}

module.exports = { ensureLessons, lessonsAreComplete };
