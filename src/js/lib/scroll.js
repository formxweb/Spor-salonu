import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './dom.js';

let lenis = null;

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

export function initSmoothScroll() {
  if (prefersReducedMotion) return;

  lenis = new Lenis({ lerp: 0.085 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/** @param {Element | number} target */
export function smoothScrollTo(target) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.6, easing: easeInOutCubic });
    return;
  }

  const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}

export const lockScroll = () => lenis?.stop();
export const unlockScroll = () => lenis?.start();
