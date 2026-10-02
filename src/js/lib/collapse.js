import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './dom.js';

/**
 * Tweens an element between height 0 and its natural height. Content below
 * moves, so pinned ScrollTriggers are refreshed once the tween settles.
 */
export function toggleHeight(el, open, { duration = 0.7, onComplete } = {}) {
  return gsap.to(el, {
    height: open ? 'auto' : 0,
    duration: prefersReducedMotion ? 0 : duration,
    ease: 'expo.inOut',
    overwrite: true,
    onComplete: () => {
      onComplete?.();
      ScrollTrigger.refresh();
    },
  });
}
