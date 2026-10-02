import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { $, $$, prefersReducedMotion } from '../lib/dom.js';

const onEnter = (trigger, start = 'top 90%') => ({ trigger, start, once: true });

const reveals = {
  lines(el) {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'line',
      autoSplit: true,
      onSplit: ({ lines }) =>
        gsap.from(lines, {
          yPercent: 115,
          duration: 1.3,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: onEnter(el, 'top 88%'),
        }),
    });
  },

  fade(el) {
    gsap.from(el, { y: 50, autoAlpha: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: onEnter(el) });
  },

  stagger(el) {
    const items = [...el.children];
    gsap.set(items, { y: 60, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.08, ease: 'power3.out', overwrite: true }),
    });
  },

  words(el) {
    const { words } = SplitText.create(el, { type: 'words', wordsClass: 'word' });
    gsap.fromTo(
      words,
      { opacity: 0.14 },
      {
        opacity: 1,
        stagger: 0.12,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true },
      },
    );
  },

  image(el) {
    gsap
      .timeline({ scrollTrigger: onEnter(el, 'top 85%') })
      .from(el, { clipPath: 'inset(100% 0% 0% 0% round 24px)', duration: 1.6, ease: 'expo.inOut' })
      .from($('img', el), { scale: 1.35, duration: 1.8, ease: 'expo.out' }, 0.2);
  },
};

export function initReveals() {
  if (prefersReducedMotion) return;

  $$('[data-reveal]').forEach((el) => reveals[el.dataset.reveal](el));

  $$('[data-count]').forEach((el) => {
    const counter = { value: 0 };
    el.textContent = '0';
    gsap.to(counter, {
      value: Number(el.dataset.count),
      duration: 2.2,
      ease: 'power3.out',
      scrollTrigger: onEnter(el),
      onUpdate: () => {
        el.textContent = String(Math.round(counter.value));
      },
    });
  });

  $$('[data-parallax]').forEach((el) => {
    gsap.fromTo(
      el,
      { yPercent: -7 },
      {
        yPercent: 7,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
}
