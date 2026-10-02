import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './utils.js';

let lenis = null;

export function initSmoothScroll() {
  if (prefersReducedMotion) return null;

  lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export const getLenis = () => lenis;

export function scrollToTarget(target, { immediate = false } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  const top = el === null || target === '#top' ? 0 : el;

  if (lenis) {
    lenis.scrollTo(top, {
      immediate,
      duration: 1.6,
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    });
    return;
  }

  const y = top === 0 ? 0 : top.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: y, behavior: immediate || prefersReducedMotion ? 'auto' : 'smooth' });
}

export const stopScroll = () => lenis?.stop();
export const startScroll = () => lenis?.start();
