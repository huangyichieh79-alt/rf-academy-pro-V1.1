let activeUtterance = null;

export function speechSupported() { return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window; }

export function speak(text, rate = 1) {
  if (!text || !speechSupported()) return false;
  window.speechSynthesis.cancel();
  activeUtterance = new SpeechSynthesisUtterance(text);
  activeUtterance.lang = 'en-US';
  activeUtterance.rate = Math.min(1.2, Math.max(0.55, Number(rate) || 1));
  activeUtterance.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(item => item.lang === 'en-US') || voices.find(item => item.lang?.startsWith('en'));
  if (voice) activeUtterance.voice = voice;
  window.speechSynthesis.speak(activeUtterance);
  return true;
}

export function stopSpeaking() { if (speechSupported()) window.speechSynthesis.cancel(); activeUtterance = null; }

export function bindSpeechButtons(root = document) {
  root.querySelectorAll('[data-speak]').forEach(button => {
    button.addEventListener('click', () => {
      const ok = speak(button.dataset.speak, Number(button.dataset.rate || 1));
      if (!ok) window.dispatchEvent(new CustomEvent('rf-toast', { detail: '此瀏覽器未提供語音播放功能' }));
    });
  });
}
