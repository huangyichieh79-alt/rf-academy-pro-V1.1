function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }

function naturalRewrite(input) {
  let text = String(input || '').trim().replace(/\s+/g, ' ');
  if (!text) return '';
  const replacements = [
    [/\bI responsible for\b/gi, 'I was responsible for'],
    [/\bI have experience about\b/gi, 'I have hands-on experience with'],
    [/\baccording to my experience\b/gi, 'based on my experience'],
    [/\bwe find the root cause\b/gi, 'we identified the root cause'],
    [/\bdo the test\b/gi, 'perform the test'],
    [/\bmake sure the result\b/gi, 'verify the result'],
    [/\bsolve this issue\b/gi, 'resolve this issue']
  ];
  for (const [pattern, replacement] of replacements) text = text.replace(pattern, replacement);
  text = text.replace(/\bresponsible for RF test\b/gi, 'responsible for RF testing');
  text = text.replace(/\bI was responsible for ([^.]+?) and perform\b/i, 'I was responsible for $1 and performed');
  text = text.charAt(0).toUpperCase() + text.slice(1);
  if (!/[.!?]$/.test(text)) text += '.';
  return text;
}

export async function mountInterview(container) {
  let items;
  try {
    const response = await fetch('./data/interviews.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    items = await response.json();
  } catch (error) {
    throw new Error(`Interview data could not be loaded: ${error.message}`);
  }
  let selected = 0;

  function render() {
    const item = items[selected];
    container.innerHTML = `
      <section class="view">
        <div class="eyebrow">Interview simulator</div><h1>工程師面試練習</h1>
        <p class="muted">選題、用英文回答，再取得範例與較自然的工程英文改寫。</p>
        <div class="practice-list">${items.map((entry, index) => `<button class="practice-tab ${index === selected ? 'active' : ''}" type="button" data-interview-index="${index}"><strong>${escapeHtml(entry.category)}</strong><small>題目 ${index + 1}</small></button>`).join('')}</div>
        <article class="content-card">
          <span class="chip accent">${escapeHtml(item.category)}</span>
          <h2 style="margin-top:14px">${escapeHtml(item.question)}</h2>
          <p class="muted">${escapeHtml(item.hint_zh_tw)}</p>
          <label for="interviewAnswer"><strong>你的英文回答</strong></label>
          <textarea id="interviewAnswer" spellcheck="true" placeholder="Type your answer in English…"></textarea>
          <div class="button-row" style="margin-top:12px"><button id="reviewInterview" class="primary-button" type="button">檢視範例與改寫</button></div>
          <div id="interviewFeedback" class="answer-panel" hidden></div>
        </article>
      </section>`;
    container.querySelectorAll('[data-interview-index]').forEach(button => button.addEventListener('click', () => { selected = Number(button.dataset.interviewIndex); render(); }));
    container.querySelector('#reviewInterview').addEventListener('click', () => {
      const answer = container.querySelector('#interviewAnswer').value;
      const feedback = container.querySelector('#interviewFeedback');
      const rewrite = naturalRewrite(answer);
      feedback.innerHTML = `
        ${rewrite ? `<h3>較自然的工程英文</h3><p>${escapeHtml(rewrite)}</p>` : '<p class="muted">你尚未輸入回答，可先研究下方的完整範例。</p>'}
        <h3>專業範例答案</h3><p>${escapeHtml(item.sample_answer)}</p>
        <h3>回答結構</h3><p>${escapeHtml(item.natural_rewrite)}</p>`;
      feedback.hidden = false;
    });
  }
  render();
}
