import { bindSpeechButtons } from './tts.js';

function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
function normalize(value) { return String(value ?? '').trim().toLowerCase().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' '); }
const TYPE_LABELS = {
  english_to_chinese: '英翻中', chinese_to_english: '中翻英', fill_in_the_blank: '填空',
  listening: '聽力', interview_short_answer: '面試簡答'
};

function evaluate(question, response) {
  if (question.type === 'interview_short_answer') {
    const answer = normalize(response);
    const keywords = question.keywords.filter(word => answer.includes(normalize(word)));
    return answer.split(' ').filter(Boolean).length >= 8 && keywords.length >= 1;
  }
  const accepted = [question.answer, ...(question.accepted_answers || [])].map(normalize);
  return accepted.includes(normalize(response));
}

export function mountQuiz(container, lesson, onComplete) {
  let current = 0;
  const answers = [];

  function renderQuestion() {
    const question = lesson.quiz[current];
    const options = question.options?.map(option => `
      <label class="quiz-option"><input type="radio" name="quiz-answer" value="${escapeHtml(option)}"><span>${escapeHtml(option)}</span></label>`).join('') || '';
    const textInput = question.options ? '' : question.type === 'interview_short_answer'
      ? '<textarea id="textQuizAnswer" placeholder="請用至少 8 個英文單字回答，並包含具體工程概念。" aria-label="英文面試簡答"></textarea>'
      : '<input id="textQuizAnswer" class="text-answer" type="text" autocomplete="off" placeholder="輸入英文答案" aria-label="測驗答案">';
    container.innerHTML = `
      <div class="quiz-shell">
        <div class="quiz-header"><span class="quiz-type">${TYPE_LABELS[question.type]}</span><span class="muted">${current + 1} / ${lesson.quiz.length}</span></div>
        <div class="progress-track" style="--progress:${((current + 1) / lesson.quiz.length) * 100}%"><span></span></div>
        <article class="question-card">
          <h3>${escapeHtml(question.prompt)}</h3>
          ${question.prompt_zh_tw ? `<p class="muted">${escapeHtml(question.prompt_zh_tw)}</p>` : ''}
          ${question.type === 'listening' ? `<button class="secondary-button" type="button" data-speak="${escapeHtml(question.speech)}">▶ 播放題目</button>` : ''}
          <div class="quiz-options">${options}${textInput}</div>
          <button id="submitQuizAnswer" class="primary-button wide" type="button">${current === lesson.quiz.length - 1 ? '完成並查看成績' : '確認並繼續'}</button>
        </article>
      </div>`;
    bindSpeechButtons(container);
    container.querySelector('#submitQuizAnswer').addEventListener('click', () => {
      const selected = container.querySelector('input[name="quiz-answer"]:checked');
      const typed = container.querySelector('#textQuizAnswer');
      const response = selected?.value ?? typed?.value?.trim() ?? '';
      if (!response) {
        window.dispatchEvent(new CustomEvent('rf-toast', { detail: '請先選擇或輸入答案' }));
        return;
      }
      answers.push({ question, response, correct: evaluate(question, response) });
      current += 1;
      if (current < lesson.quiz.length) renderQuestion(); else renderResults();
    });
  }

  function renderResults() {
    const correctCount = answers.filter(item => item.correct).length;
    const score = Math.round((correctCount / answers.length) * 100);
    const wrong = answers.filter(item => !item.correct);
    container.innerHTML = `
      <div class="quiz-shell">
        <article class="question-card">
          <div class="eyebrow">Quiz complete</div><h2>今日測驗完成</h2>
          <div class="result-score"><strong>${score}%</strong></div>
          <p class="muted" style="text-align:center">答對 ${correctCount} / ${answers.length} 題</p>
          ${wrong.length ? `<h3>錯題與正確答案</h3>${wrong.map(item => `<div class="review-item"><strong>${escapeHtml(TYPE_LABELS[item.question.type])}</strong><p>${escapeHtml(item.question.prompt)}</p><small>你的答案：${escapeHtml(item.response)}</small><br><small>參考答案：${escapeHtml(item.question.answer)}</small><p class="muted">${escapeHtml(item.question.explanation)}</p></div>`).join('')}` : '<div class="answer-panel">全部答對。今天的專業詞彙已掌握。</div>'}
          <div class="button-row" style="margin-top:16px"><button id="retryQuiz" class="secondary-button" type="button">重新測驗</button><button id="finishQuiz" class="primary-button" type="button">保存成績</button></div>
        </article>
      </div>`;
    container.querySelector('#retryQuiz').addEventListener('click', () => { current = 0; answers.length = 0; renderQuestion(); });
    container.querySelector('#finishQuiz').addEventListener('click', () => onComplete({ score, wrongTerms: wrong.map(item => item.question.term) }));
  }
  renderQuestion();
}
