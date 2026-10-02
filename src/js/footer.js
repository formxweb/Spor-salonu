import { $, isFinePointer } from './utils.js';
import { scrollToTarget } from './smooth-scroll.js';

export function initFooter() {
  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  $('[data-to-top]')?.addEventListener('click', () => scrollToTarget('#top'));

  // Dev yazıda imleci takip eden kırmızı ışık
  const mega = $('.footer__mega');
  if (mega && isFinePointer) {
    mega.addEventListener('pointermove', (e) => {
      const r = mega.getBoundingClientRect();
      mega.style.setProperty('--mx', `${e.clientX - r.left}px`);
      mega.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }
}
