import { $, hasFinePointer } from '../lib/dom.js';

export function initFooter() {
  $('[data-year]').textContent = new Date().getFullYear();

  if (!hasFinePointer) return;

  const wordmark = $('.footer__mega');
  wordmark.addEventListener('pointermove', (event) => {
    const rect = wordmark.getBoundingClientRect();
    wordmark.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    wordmark.style.setProperty('--my', `${event.clientY - rect.top}px`);
  });
}
