import { gsap } from 'gsap';
import { $, $$, prefersReducedMotion, wait } from './utils.js';
import { stopScroll, startScroll } from './smooth-scroll.js';

/**
 * Logo çizimi + yüzde sayacı + perde açılışı.
 * `onReveal` perdeler açılırken çağrılır (hero girişini başlatmak için).
 */
export function runPreloader({ onReveal } = {}) {
  const root = $('.preloader');
  if (!root) {
    onReveal?.();
    return Promise.resolve();
  }

  document.body.classList.add('is-loading');
  stopScroll();

  const count = $('.preloader__count', root);
  const bar = $('.preloader__bar span', root);
  const shapes = $$('.preloader__mark polygon', root);

  const pageLoaded = new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });
  // Yavaş bağlantıda ziyaretçiyi bekletmemek için üst sınır.
  const ready = Promise.race([pageLoaded, wait(4500)]);

  const finish = (resolve) => {
    root.remove();
    document.body.classList.remove('is-loading');
    startScroll();
    resolve();
  };

  if (prefersReducedMotion) {
    return ready.then(
      () =>
        new Promise((resolve) => {
          onReveal?.();
          gsap.to(root, { autoAlpha: 0, duration: 0.4, onComplete: () => finish(resolve) });
        }),
    );
  }

  shapes.forEach((shape) => {
    const length = shape.getTotalLength();
    shape.style.strokeDasharray = `${length}`;
    shape.style.strokeDashoffset = `${length}`;
  });

  const progress = { value: 0 };
  const render = () => {
    count.textContent = String(Math.round(progress.value)).padStart(3, '0');
    bar.style.transform = `scaleX(${progress.value / 100})`;
  };

  gsap
    .timeline()
    .to(shapes, { strokeDashoffset: 0, duration: 1.1, stagger: 0.14, ease: 'power2.inOut' })
    .to(shapes, { fillOpacity: 1, duration: 0.5, stagger: 0.08, ease: 'power1.out' }, '-=0.35')
    .from('.preloader__word > *', { yPercent: 110, duration: 0.8, stagger: 0.06, ease: 'expo.out' }, '-=0.7');

  gsap.to(progress, { value: 86, duration: 1.5, ease: 'power1.out', onUpdate: render });

  return new Promise((resolve) => {
    Promise.all([ready, wait(1700)]).then(() => {
      gsap.to(progress, {
        value: 100,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: true,
        onUpdate: render,
        onComplete: () => {
          gsap
            .timeline({ onComplete: () => finish(resolve) })
            .to('.preloader__stage', { scale: 0.92, autoAlpha: 0, duration: 0.5, ease: 'power3.in' })
            .to('.preloader__meta, .preloader__bar', { autoAlpha: 0, duration: 0.3 }, '<')
            .to('.preloader__curtain--a', { yPercent: -100, duration: 1.15, ease: 'expo.inOut' }, '-=0.05')
            .to('.preloader__curtain--b', { yPercent: 100, duration: 1.15, ease: 'expo.inOut' }, '<')
            .add(() => onReveal?.(), '-=0.85');
        },
      });
    });
  });
}
