import { getState, setCurrentDay, markDayCompleted, recordQuiz, markWordsLearned, setTheme, storageSelfCheck } from './storage.js';
import { bindSpeechButtons, speechSupported } from './tts.js';
import { mountQuiz } from './quiz.js';
import { renderProgress, completionPercent, averageScore } from './progress.js';
import { mountInterview } from './interview.js';
import { mountDebug } from './debug.js';
import { LESSON_COUNT } from './config.js';

window.RFAcademyBoot?.started();

const app = document.querySelector('#app');
const themeToggle = document.querySelector('#themeToggle');
const networkBadge = document.querySelector('#networkBadge');
const toast = document.querySelector('#toast');
let toastTimer;

function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
function padDay(day) { return String(day).padStart(3, '0'); }
function showToast(message) {
  clearTimeout(toastTimer); toast.textContent = message; toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
window.addEventListener('rf-toast', event => showToast(event.detail));

async function fetchJson(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-cache' });
    if (!response.ok) throw new Error(`${url} 回傳 HTTP ${response.status}`);
    try { return await response.json(); }
    catch (error) { throw new Error(`${url} 不是有效 JSON：${error.message}`); }
  } catch (error) {
    if (error.name === 'AbortError') throw new Error(`${url} 載入超過 ${timeoutMs / 1000} 秒`);
    throw new Error(`無法載入 ${url}：${error.message}`);
  } finally {
    clearTimeout(timer);
  }
}
async function loadLesson(day) { return fetchJson(`./data/lessons/day${padDay(day)}.json`); }

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? '切換為淺色模式' : '切換為深色模式');
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#07111f' : '#f4f8fb';
}
themeToggle.addEventListener('click', () => {
  const next = getState().themeMode === 'dark' ? 'light' : 'dark';
  setTheme(next); applyTheme(next); showToast(next === 'dark' ? '已切換深色模式' : '已切換淺色模式');
});

function updateNetwork() {
  const online = navigator.onLine; networkBadge.textContent = online ? 'ONLINE' : 'OFFLINE'; networkBadge.classList.toggle('offline', !online);
}
window.addEventListener('online', updateNetwork);
window.addEventListener('offline', updateNetwork);

function setActiveNav(route) {
  document.querySelectorAll('.bottom-nav a').forEach(link => link.classList.toggle('active', link.dataset.route === route));
}
function routeInfo() {
  const raw = location.hash.replace(/^#/, '') || 'dashboard';
  const [route, param] = raw.split('/');
  return { route: ['dashboard', 'lesson', 'interview', 'debug', 'progress'].includes(route) ? route : 'dashboard', param };
}
function loading() { app.innerHTML = '<section class="loading-view"><div class="loader" aria-hidden="true"></div><p>正在載入專業課程…</p></section>'; }
function renderError(error) {
  app.innerHTML = `<section class="view empty-state"><h1>內容暫時無法載入</h1><p>${escapeHtml(error.message)}</p><p>如果目前離線，請先開啟曾經載入過的課程。</p><button class="primary-button" id="retryView" type="button">重新載入</button></section>`;
  app.querySelector('#retryView').addEventListener('click', renderRoute);
}

async function renderDashboard() {
  const state = getState();
  const lesson = await loadLesson(state.currentDay);
  const percent = completionPercent(state);
  const completed = state.completedDays.includes(state.currentDay);
  const quizDone = Boolean(state.quizScores[String(state.currentDay)]);
  app.innerHTML = `
    <section class="view">
      <div class="dashboard-grid">
        <article class="hero-card">
          <div class="eyebrow">Today · Day ${padDay(lesson.day)}</div>
          <h1>${escapeHtml(lesson.topic)}</h1>
          <p class="muted">${escapeHtml(lesson.topic_zh_tw)} · ${escapeHtml(lesson.stage_zh_tw)}</p>
          <div class="hero-meta"><span class="chip accent">◷ ${lesson.duration_minutes} 分鐘</span><span class="chip">10 個專業詞彙</span><span class="chip">5 題混合測驗</span></div>
          <a class="primary-button" href="#lesson/${lesson.day}">${completed ? '複習今日課程' : '開始今天的課程'} →</a>
        </article>
        <article class="panel">
          <div class="eyebrow">Your momentum</div><h2>${LESSON_COUNT} 天進度</h2>
          <div class="progress-track" style="--progress:${percent}%"><span></span></div>
          <div class="progress-label"><span>${state.completedDays.length} 天完成</span><strong>${percent}%</strong></div>
          <div class="metric-grid" style="margin-top:20px"><div class="metric"><strong>${state.streak}</strong><span>連續日</span></div><div class="metric"><strong>${averageScore(state)}%</strong><span>平均分</span></div><div class="metric"><strong>${state.weakWords.length}</strong><span>待複習</span></div></div>
        </article>
      </div>
      <div class="section-heading"><div><h2>今天只做這 5 件事</h2><p class="muted">照順序完成，不需要規劃</p></div></div>
      <div class="task-list">
        <a class="task-card" href="#lesson/${lesson.day}"><span class="task-icon">01</span><span><strong>學 10 個專業詞彙</strong><small>含正常與慢速發音</small></span><span class="status-dot"></span></a>
        <a class="task-card" href="#lesson/${lesson.day}"><span class="task-icon">02</span><span><strong>讀 5 句實驗室英文</strong><small>可逐句播放</small></span><span class="status-dot"></span></a>
        <a class="task-card" href="#lesson/${lesson.day}"><span class="task-icon">03</span><span><strong>完成情境與除錯案例</strong><small>用證據說明工程判斷</small></span><span class="status-dot"></span></a>
        <a class="task-card ${quizDone ? 'done' : ''}" href="#lesson/${lesson.day}"><span class="task-icon">04</span><span><strong>完成 5 題測驗</strong><small>${quizDone ? `最近成績 ${state.quizScores[String(state.currentDay)].score}%` : '五種題型一次練習'}</small></span><span class="status-dot"></span></a>
        <a class="task-card ${completed ? 'done' : ''}" href="#lesson/${lesson.day}"><span class="task-icon">05</span><span><strong>完成今日課程</strong><small>${completed ? '進度已保存' : '保存進度並延續連續天數'}</small></span><span class="status-dot"></span></a>
      </div>
    </section>`;
}

function wordCard(word, index) {
  return `<article class="word-card">
    <div class="word-top"><div><span class="eyebrow">WORD ${String(index + 1).padStart(2, '0')} · ${escapeHtml(word.difficulty)}</span><h3>${escapeHtml(word.english)}</h3><span class="pronunciation">${escapeHtml(word.pronunciation)}</span></div>
      <div class="audio-group"><button class="audio-button" type="button" data-speak="${escapeHtml(word.english)}" data-rate="1" aria-label="正常速度播放 ${escapeHtml(word.english)}">▶</button><button class="audio-button" type="button" data-speak="${escapeHtml(word.english)}" data-rate="0.68" aria-label="慢速播放 ${escapeHtml(word.english)}">0.7×</button></div></div>
    <p class="translation">${escapeHtml(word.zh_tw)}</p>
    <div class="example"><div class="word-top"><p>${escapeHtml(word.example)}</p><button class="audio-button" type="button" data-speak="${escapeHtml(word.example)}" data-rate="0.9" aria-label="播放例句">▶</button></div><small class="muted">${escapeHtml(word.example_zh_tw)}</small></div>
  </article>`;
}
function debugBlock(item) {
  const list = values => `<ul>${values.map(value => `<li>${escapeHtml(value)}</li>`).join('')}</ul>`;
  return `<article class="case-card"><h2>${escapeHtml(item.title)}</h2><p class="muted">${escapeHtml(item.title_zh_tw)}</p><div class="detail-grid">
    <div class="detail-block"><h3>Problem</h3><p>${escapeHtml(item.problem)}</p></div><div class="detail-block"><h3>Background</h3><p>${escapeHtml(item.background)}</p></div>
    <div class="detail-block"><h3>Possible causes</h3>${list(item.possible_causes)}</div><div class="detail-block"><h3>Check steps</h3>${list(item.check_steps)}</div>
    <div class="detail-block"><h3>Corrective actions</h3>${list(item.corrective_actions)}</div><div class="detail-block"><h3>Supervisor question</h3><p>${escapeHtml(item.supervisor_question)}</p></div></div>
    <button id="toggleDailyDebug" class="secondary-button wide" type="button">顯示建議回答</button><div id="dailyDebugAnswer" class="answer-panel" hidden><p>${escapeHtml(item.suggested_answer)}</p></div></article>`;
}

async function renderLesson(dayParam) {
  const state = getState();
  const day = Math.min(LESSON_COUNT, Math.max(1, Number(dayParam) || state.currentDay));
  if (state.currentDay !== day) setCurrentDay(day);
  const lesson = await loadLesson(day);
  const quizDone = Boolean(getState().quizScores[String(day)]);
  app.innerHTML = `
    <section class="view lesson-header">
      <div class="day-switcher"><a class="icon-button" href="#lesson/${Math.max(1, day - 1)}" aria-label="前一天">←</a><select id="daySelect" aria-label="選擇課程天數">${Array.from({ length: LESSON_COUNT }, (_, index) => `<option value="${index + 1}" ${index + 1 === day ? 'selected' : ''}>Day ${padDay(index + 1)}</option>`).join('')}</select><a class="icon-button" href="#lesson/${Math.min(LESSON_COUNT, day + 1)}" aria-label="下一天">→</a></div>
      <div style="margin-top:22px"><span class="eyebrow">Day ${padDay(day)} · ${escapeHtml(lesson.stage)}</span><h1>${escapeHtml(lesson.topic)}</h1><p class="muted">${escapeHtml(lesson.topic_zh_tw)} · 今日約 ${lesson.duration_minutes} 分鐘</p></div>
      <div class="progress-track" style="--progress:${(day / LESSON_COUNT) * 100}%"><span></span></div>
    </section>
    <section class="lesson-section"><div class="section-heading"><div><span class="eyebrow">Step 01</span><h2>今日主題</h2></div></div><article class="content-card"><h3>學習目標</h3><ul>${lesson.objectives.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></article></section>
    <section class="lesson-section"><div class="section-heading"><div><span class="eyebrow">Step 02</span><h2>今日 10 個單字</h2></div><span class="chip">${escapeHtml(lesson.topic_zh_tw)}</span></div><div class="word-grid">${lesson.vocabulary.map(wordCard).join('')}</div></section>
    <section class="lesson-section"><div class="section-heading"><div><span class="eyebrow">Step 03</span><h2>發音練習</h2><p class="muted">先正常速度，再用慢速確認重音與節奏</p></div></div><div class="panel button-row">${lesson.vocabulary.map(word => `<button class="secondary-button" type="button" data-speak="${escapeHtml(word.english)}" data-rate="0.72">▶ ${escapeHtml(word.english)}</button>`).join('')}</div></section>
    <section class="lesson-section"><div class="section-heading"><div><span class="eyebrow">Step 04</span><h2>今日 5 句工程師常用句</h2></div></div><div class="sentence-list">${lesson.common_sentences.map(sentence => `<article class="sentence-item"><div><p>${escapeHtml(sentence.english)}</p><small>${escapeHtml(sentence.zh_tw)}</small></div><div class="audio-group"><button class="audio-button" type="button" data-speak="${escapeHtml(sentence.english)}" data-rate="1">▶</button><button class="audio-button" type="button" data-speak="${escapeHtml(sentence.english)}" data-rate="0.68">0.7×</button></div></article>`).join('')}</div></section>
    <section class="lesson-section"><div class="section-heading"><div><span class="eyebrow">Step 05</span><h2>情境對話</h2></div></div><article class="content-card"><span class="chip accent">${escapeHtml(lesson.dialogue.context)}</span><ul class="dialogue-lines" style="margin-top:14px">${lesson.dialogue.lines.map(line => `<li class="dialogue-line"><strong>${escapeHtml(line.speaker)}</strong><p>${escapeHtml(line.english)}</p><small class="muted">${escapeHtml(line.zh_tw)}</small><button class="audio-button" type="button" data-speak="${escapeHtml(line.english)}" data-rate="0.9" aria-label="播放對話">▶</button></li>`).join('')}</ul></article></section>
    <section class="lesson-section"><div class="section-heading"><div><span class="eyebrow">Step 06</span><h2>Debug Case</h2></div></div>${debugBlock(lesson.debug_case)}</section>
    <section class="lesson-section"><div class="section-heading"><div><span class="eyebrow">Step 07</span><h2>Interview Question</h2></div></div><article class="question-card"><span class="chip accent">${escapeHtml(lesson.interview_question.category)}</span><h2 style="margin-top:14px">${escapeHtml(lesson.interview_question.question)}</h2><p class="muted">${escapeHtml(lesson.interview_question.hint_zh_tw)}</p><textarea id="dailyInterviewAnswer" placeholder="Type your answer in English…"></textarea><button id="showDailyInterview" class="secondary-button wide" type="button" style="margin-top:10px">顯示專業範例</button><div id="dailyInterviewSample" class="answer-panel" hidden><h3>Sample answer</h3><p>${escapeHtml(lesson.interview_question.sample_answer)}</p><h3>Natural engineering English</h3><p>${escapeHtml(lesson.interview_question.natural_rewrite)}</p></div></article></section>
    <section class="lesson-section" id="dailyQuiz"><div class="section-heading"><div><span class="eyebrow">Step 08</span><h2>Quiz</h2><p class="muted">英翻中、中翻英、填空、聽力與面試簡答</p></div></div><div id="quizMount"></div></section>
    <section class="lesson-section"><div class="section-heading"><div><span class="eyebrow">Step 09</span><h2>完成今日課程</h2></div></div><article class="content-card"><p>${quizDone ? '測驗已保存，可以完成今天的課程。' : '完成並保存測驗後，即可登記今天的學習進度。'}</p><button id="completeDay" class="primary-button wide" type="button" ${quizDone ? '' : 'disabled'}>✓ 完成 Day ${padDay(day)}</button></article></section>`;

  app.querySelector('#daySelect').addEventListener('change', event => { location.hash = `lesson/${event.target.value}`; });
  app.querySelector('#toggleDailyDebug').addEventListener('click', event => { const panel = app.querySelector('#dailyDebugAnswer'); panel.hidden = !panel.hidden; event.currentTarget.textContent = panel.hidden ? '顯示建議回答' : '隱藏建議回答'; });
  app.querySelector('#showDailyInterview').addEventListener('click', event => { const panel = app.querySelector('#dailyInterviewSample'); panel.hidden = !panel.hidden; event.currentTarget.textContent = panel.hidden ? '顯示專業範例' : '隱藏專業範例'; });
  bindSpeechButtons(app);
  mountQuiz(app.querySelector('#quizMount'), lesson, result => {
    recordQuiz(day, result.score, result.wrongTerms); showToast(`測驗成績 ${result.score}% 已保存`); renderLesson(day).then(() => document.querySelector('#dailyQuiz')?.scrollIntoView());
  });
  app.querySelector('#completeDay').addEventListener('click', () => {
    markWordsLearned(lesson.vocabulary.map(word => word.english)); markDayCompleted(day);
    showToast(`Day ${padDay(day)} 已完成，進度已保存`); location.hash = 'dashboard';
  });
}

async function renderRoute() {
  const { route, param } = routeInfo(); setActiveNav(route); loading();
  try {
    if (route === 'dashboard') await renderDashboard();
    else if (route === 'lesson') await renderLesson(param);
    else if (route === 'interview') await mountInterview(app);
    else if (route === 'debug') await mountDebug(app);
    else if (route === 'progress') app.innerHTML = renderProgress(getState());
    window.scrollTo({ top: 0, behavior: 'instant' });
  } catch (error) { console.error(error); renderError(error); }
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  try {
    const registration = await navigator.serviceWorker.register('./service-worker.js', { scope: './', updateViaCache: 'none' });
    await registration.update();
  }
  catch (error) { console.error('Service worker registration failed:', error); }
}

applyTheme(getState().themeMode); updateNetwork();
if (!storageSelfCheck()) showToast('瀏覽器封鎖了本機進度保存');
if (!speechSupported()) showToast('此瀏覽器未提供語音播放功能');
window.addEventListener('hashchange', renderRoute);
registerServiceWorker();
renderRoute();
