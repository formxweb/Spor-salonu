import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, prefersReducedMotion } from './utils.js';

/** <details> akordeonlarına yumuşak açılıp kapanma ekler (JS yoksa yerel davranış çalışır). */
export function initFaq() {
  const items = $$('.acc');

  const close = (item) => {
    const body = $('.acc__body', item);
    gsap.to(body, {
      height: 0,
      duration: prefersReducedMotion ? 0 : 0.55,
      ease: 'expo.inOut',
      onComplete: () => {
        item.open = false;
        gsap.set(body, { clearProps: 'height' });
        ScrollTrigger.refresh();
      },
    });
  };

  const open = (item) => {
    const body = $('.acc__body', item);
    item.open = true;
    gsap.fromTo(
      body,
      { height: 0 },
      {
        height: 'auto',
        duration: prefersReducedMotion ? 0 : 0.7,
        ease: 'expo.inOut',
        onComplete: () => {
          gsap.set(body, { clearProps: 'height' });
          ScrollTrigger.refresh();
        },
      },
    );
  };

  items.forEach((item) => {
    $('summary', item).addEventListener('click', (e) => {
      e.preventDefault();
      if (item.open) {
        close(item);
      } else {
        items.forEach((other) => other !== item && other.open && close(other));
        open(item);
      }
    });
  });
}
