import { gsap } from 'gsap';
import { $, prefersReducedMotion } from './dom.js';

/** Slides `.segment-indicator` under whichever option `getActive` returns. */
export function createSegmentIndicator(container, getActive) {
  const indicator = $('.segment-indicator', container);

  const move = (instant = false) => {
    const option = getActive();
    gsap.to(indicator, {
      x: option.offsetLeft,
      y: option.offsetTop,
      width: option.offsetWidth,
      height: option.offsetHeight,
      duration: instant || prefersReducedMotion ? 0 : 0.7,
      ease: 'expo.out',
    });
  };

  const snap = () => move(true);
  snap();
  window.addEventListener('resize', snap);
  document.fonts?.ready.then(snap);

  return move;
}
