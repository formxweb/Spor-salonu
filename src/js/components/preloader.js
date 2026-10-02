import { gsap } from 'gsap';
import { $, $$, prefersReducedMotion, wait } from '../lib/dom.js';
import { lockScroll, unlockScroll } from '../lib/scroll.js';

const MIN_DURATION = 1700;
const MAX_WAIT = 4500;

const pageLoaded = () =>
  new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });

/** Plays the intro and resolves once the page is uncovered. `onReveal` fires as the curtains open. */
export async function runPreloader({ onReveal }) {
  const root = $('.preloader');
  if (!root) {
    onReveal();
    return;
  }

  document.body.classList.add('is-loading');
  lockScroll();
  const ready = Promise.race([pageLoaded(), wait(MAX_WAIT)]);

  if (prefersReducedMotion) {
    await ready;
    onReveal();
    await gsap.to(root, { autoAlpha: 0, duration: 0.4 });
  } else {
    await playIntro(root, ready, onReveal);
  }

  root.remove();
  document.body.classList.remove('is-loading');
  unlockScroll();
}

async function playIntro(root, ready, onReveal) {
  const count = $('.preloader__count', root);
  const bar = $('.preloader__bar', root);
  const barFill = $('span', bar);
  const shapes = $$('.preloader__mark polygon', root);
  const progress = { value: 0 };

  const render = () => {
    count.textContent = String(Math.round(progress.value)).padStart(3, '0');
    barFill.style.transform = `scaleX(${progress.value / 100})`;
  };

  shapes.forEach((shape) => {
    const length = shape.getTotalLength();
    shape.style.strokeDasharray = length;
    shape.style.strokeDashoffset = length;
  });

  gsap
    .timeline()
    .to(shapes, { strokeDashoffset: 0, duration: 1.1, stagger: 0.14, ease: 'power2.inOut' })
    .to(shapes, { fillOpacity: 1, duration: 0.5, stagger: 0.08, ease: 'power1.out' }, '-=0.35')
    .from($$('.preloader__word > *', root), { yPercent: 110, duration: 0.8, stagger: 0.06, ease: 'expo.out' }, '-=0.7');

  gsap.to(progress, { value: 86, duration: 1.5, ease: 'power1.out', onUpdate: render });

  await Promise.all([ready, wait(MIN_DURATION)]);
  await gsap.to(progress, { value: 100, duration: 0.45, ease: 'power2.out', overwrite: true, onUpdate: render });

  await gsap
    .timeline()
    .to($('.preloader__stage', root), { scale: 0.92, autoAlpha: 0, duration: 0.5, ease: 'power3.in' })
    .to([$('.preloader__meta', root), bar], { autoAlpha: 0, duration: 0.3 }, '<')
    .to($('.preloader__curtain--a', root), { yPercent: -100, duration: 1.15, ease: 'expo.inOut' }, '-=0.05')
    .to($('.preloader__curtain--b', root), { yPercent: 100, duration: 1.15, ease: 'expo.inOut' }, '<')
    .add(onReveal, '-=0.85');
}
