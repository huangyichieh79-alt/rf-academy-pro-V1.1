function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
function list(items, ordered = false) { const tag = ordered ? 'ol' : 'ul'; return `<${tag}>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`; }

export async function mountDebug(container) {
  let cases;
  try {
    const response = await fetch('./data/debug-cases.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    cases = await response.json();
  } catch (error) {
    throw new Error(`Debug data could not be loaded: ${error.message}`);
  }
  let selected = 0;

  function render() {
    const item = cases[selected];
    container.innerHTML = `
      <section class="view">
        <div class="eyebrow">Failure analysis lab</div><h1>Debug 練習</h1>
        <p class="muted">從問題、可能原因、檢查步驟到矯正措施，練習以證據推進工程判斷。</p>
        <div class="practice-list">${cases.map((entry, index) => `<button class="practice-tab ${index === selected ? 'active' : ''}" type="button" data-debug-index="${index}"><strong>${escapeHtml(entry.title)}</strong><small>${escapeHtml(entry.title_zh_tw)}</small></button>`).join('')}</div>
        <article class="case-card">
          <span class="chip accent">CASE ${String(selected + 1).padStart(2, '0')}</span>
          <h2 style="margin-top:14px">${escapeHtml(item.title)}</h2><p class="muted">${escapeHtml(item.title_zh_tw)}</p>
          <div class="detail-grid">
            <div class="detail-block"><h3>Problem</h3><p>${escapeHtml(item.problem)}</p></div>
            <div class="detail-block"><h3>Background</h3><p>${escapeHtml(item.background)}</p></div>
            <div class="detail-block"><h3>Possible causes</h3>${list(item.possible_causes)}</div>
            <div class="detail-block"><h3>Check steps</h3>${list(item.check_steps, true)}</div>
            <div class="detail-block"><h3>Corrective actions</h3>${list(item.corrective_actions)}</div>
            <div class="detail-block"><h3>Supervisor question</h3><p>${escapeHtml(item.supervisor_question)}</p></div>
          </div>
          <button id="showDebugAnswer" class="secondary-button wide" type="button" style="margin-top:14px">顯示建議回答</button>
          <div id="debugAnswer" class="answer-panel" hidden><h3>Suggested answer</h3><p>${escapeHtml(item.suggested_answer)}</p></div>
        </article>
      </section>`;
    container.querySelectorAll('[data-debug-index]').forEach(button => button.addEventListener('click', () => { selected = Number(button.dataset.debugIndex); render(); }));
    container.querySelector('#showDebugAnswer').addEventListener('click', event => {
      const panel = container.querySelector('#debugAnswer'); panel.hidden = !panel.hidden;
      event.currentTarget.textContent = panel.hidden ? '顯示建議回答' : '隱藏建議回答';
    });
  }
  render();
}
