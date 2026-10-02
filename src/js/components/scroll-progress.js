import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $ } from '../lib/dom.js';
import { smoothScrollTo } from '../lib/scroll.js';

/** Top progress bar and the progress ring around the back-to-top button. */
export function initScrollProgress() {
  const bar = $('.scroll-progress span');
  const ring = $('.to-top__progress');
  const circumference = ring.getTotalLength();

  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: ({ progress }) => {
      bar.style.transform = `scaleX(${progress})`;
      ring.style.strokeDashoffset = circumference * (1 - progress);
    },
  });

  $('[data-to-top]').addEventListener('click', () => smoothScrollTo(0));
}
