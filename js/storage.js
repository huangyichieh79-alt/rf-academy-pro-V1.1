const KEYS = ['completedDays', 'currentDay', 'learnedWords', 'weakWords', 'quizScores', 'streak', 'lastStudyDate', 'themeMode'];
const DEFAULTS = Object.freeze({
  completedDays: [], currentDay: 1, learnedWords: [], weakWords: [], quizScores: {},
  streak: 0, lastStudyDate: '', themeMode: 'dark'
});

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function safeParse(value, fallback) {
  if (value === null) return clone(fallback);
  try { return JSON.parse(value); } catch { return clone(fallback); }
}
function normalize(key, value) {
  const fallback = DEFAULTS[key];
  if (Array.isArray(fallback)) return Array.isArray(value) ? [...new Set(value)] : clone(fallback);
  if (typeof fallback === 'number') return Number.isFinite(Number(value)) ? Number(value) : fallback;
  if (typeof fallback === 'object') return value && typeof value === 'object' && !Array.isArray(value) ? value : clone(fallback);
  return typeof value === 'string' ? value : fallback;
}
function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function dayDifference(from, to) {
  const a = new Date(`${from}T12:00:00`);
  const b = new Date(`${to}T12:00:00`);
  return Math.round((b - a) / 86400000);
}

export function getState() {
  const state = {};
  for (const key of KEYS) state[key] = normalize(key, safeParse(localStorage.getItem(key), DEFAULTS[key]));
  state.currentDay = Math.min(180, Math.max(1, Math.round(state.currentDay)));
  state.themeMode = state.themeMode === 'light' ? 'light' : 'dark';
  return state;
}

export function saveState(next) {
  for (const key of KEYS) {
    const value = normalize(key, next[key] ?? DEFAULTS[key]);
    localStorage.setItem(key, JSON.stringify(value));
  }
  window.dispatchEvent(new CustomEvent('rf-state-change', { detail: getState() }));
  return getState();
}

export function updateState(updater) {
  const current = getState();
  const next = typeof updater === 'function' ? updater(clone(current)) : { ...current, ...updater };
  return saveState(next);
}

export function setCurrentDay(day) {
  return updateState(state => ({ ...state, currentDay: Math.min(180, Math.max(1, Number(day) || 1)) }));
}

export function markDayCompleted(day) {
  return updateState(state => {
    const now = today();
    if (!state.completedDays.includes(day)) state.completedDays.push(day);
    state.completedDays.sort((a, b) => a - b);
    if (state.lastStudyDate !== now) {
      state.streak = state.lastStudyDate && dayDifference(state.lastStudyDate, now) === 1 ? state.streak + 1 : 1;
      state.lastStudyDate = now;
    }
    state.currentDay = Math.min(180, Math.max(state.currentDay, day < 180 ? day + 1 : 180));
    return state;
  });
}

export function recordQuiz(day, score, wrongTerms) {
  return updateState(state => {
    state.quizScores[String(day)] = { score, completedAt: new Date().toISOString() };
    state.weakWords = [...new Set([...state.weakWords, ...wrongTerms])];
    return state;
  });
}

export function markWordsLearned(words) {
  return updateState(state => ({ ...state, learnedWords: [...new Set([...state.learnedWords, ...words])] }));
}

export function setTheme(themeMode) { return updateState({ themeMode }); }

export function storageSelfCheck() {
  const key = '__rf_academy_storage_check__';
  try { localStorage.setItem(key, 'ok'); const ok = localStorage.getItem(key) === 'ok'; localStorage.removeItem(key); return ok; }
  catch { return false; }
}
