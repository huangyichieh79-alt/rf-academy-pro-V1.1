import { LESSON_COUNT } from './config.js';

export function completionPercent(state) { return Math.round((state.completedDays.length / LESSON_COUNT) * 100); }
export function averageScore(state) {
  const scores = Object.values(state.quizScores).map(item => Number(item.score)).filter(Number.isFinite);
  return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }

export function renderProgress(state) {
  const percent = completionPercent(state);
  const scores = Object.entries(state.quizScores).sort((a, b) => Number(b[0]) - Number(a[0])).slice(0, 8);
  return `
    <section class="view">
      <div class="eyebrow">Learning analytics</div>
      <h1>學習進度</h1>
      <p class="muted">每一格都是完成的一天。資料只保存在這台裝置的瀏覽器中。</p>
      <div class="metric-grid">
        <article class="metric"><strong>${state.completedDays.length}</strong><span>已完成天數</span></article>
        <article class="metric"><strong>${averageScore(state)}%</strong><span>平均測驗</span></article>
        <article class="metric"><strong>${state.streak}</strong><span>連續學習日</span></article>
      </div>
      <div class="section-heading"><div><h2>${LESSON_COUNT} 天地圖</h2><p class="muted">整體完成 ${percent}%</p></div></div>
      <div class="panel">
        <div class="progress-track" style="--progress:${percent}%"><span></span></div>
        <div class="calendar-grid" style="margin-top:16px">${Array.from({ length: LESSON_COUNT }, (_, index) => `<a class="calendar-day ${state.completedDays.includes(index + 1) ? 'completed' : ''}" href="#lesson/${index + 1}" aria-label="第 ${index + 1} 天${state.completedDays.includes(index + 1) ? '，已完成' : ''}">${index + 1}</a>`).join('')}</div>
      </div>
      <div class="section-heading"><div><h2>最近測驗</h2><p class="muted">保存每一天最近一次成績</p></div></div>
      <div class="panel score-list">${scores.length ? scores.map(([day, item]) => `<div class="score-row"><strong>Day ${escapeHtml(day)}</strong><div class="progress-track" style="--progress:${Number(item.score)}%"><span></span></div><span>${Number(item.score)}%</span></div>`).join('') : '<div class="empty-state">完成第一份測驗後，成績會顯示在這裡。</div>'}</div>
      <div class="section-heading"><div><h2>複習清單</h2><p class="muted">由答錯題目自動收集</p></div></div>
      <div class="panel">${state.weakWords.length ? state.weakWords.map(word => `<span class="chip">${escapeHtml(word)}</span>`).join(' ') : '<div class="empty-state">目前沒有需要複習的詞彙。</div>'}</div>
    </section>`;
}
