'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function lessonsAreComplete() {
  for (let day = 1; day <= 180; day += 1) {
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
  if (lessonsAreComplete()) return { regenerated: false, count: 180 };
  console.log('Lesson data is missing or incomplete. Regenerating Day001-Day180…');
  require('./generate_lessons.js').main();
  if (!lessonsAreComplete()) throw new Error('Lesson regeneration did not produce a complete Day001-Day180 set.');
  return { regenerated: true, count: 180 };
}

if (require.main === module) {
  const result = ensureLessons();
  console.log(result.regenerated ? 'Lesson regeneration completed.' : 'All 180 lesson files are ready.');
}

module.exports = { ensureLessons, lessonsAreComplete };
