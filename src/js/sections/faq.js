import { gsap } from 'gsap';
import { $, $$ } from '../lib/dom.js';
import { toggleHeight } from '../lib/collapse.js';

// Animates native <details>; without JS they still open and close on their own.
export function initFaq() {
  const items = $$('.faq-item');

  const close = (item) => {
    const body = $('.faq-item__body', item);
    toggleHeight(body, false, {
      duration: 0.55,
      onComplete: () => {
        item.open = false;
        gsap.set(body, { clearProps: 'height' });
      },
    });
  };

  const open = (item) => {
    const body = $('.faq-item__body', item);
    item.open = true;
    gsap.set(body, { height: 0 });
    toggleHeight(body, true, { onComplete: () => gsap.set(body, { clearProps: 'height' }) });
  };

  items.forEach((item) => {
    $('summary', item).addEventListener('click', (event) => {
      event.preventDefault();
      if (item.open) {
        close(item);
        return;
      }
      items.filter((other) => other !== item && other.open).forEach(close);
      open(item);
    });
  });
}
