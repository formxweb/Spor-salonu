import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { $, $$, prefersReducedMotion } from '../lib/dom.js';

/** Splits the headline and builds the paused intro; `play()` runs when the preloader opens. */
export function prepareHero() {
  const hero = $('.hero');
  if (prefersReducedMotion) return { play() {} };

  const lines = $$('[data-hero-line]', hero);
  const chars = lines.flatMap((line) => SplitText.create(line, { type: 'chars', charsClass: 'char' }).chars);
  const fades = $$('[data-hero-fade]', hero);

  lines.forEach((line) => line.classList.add('is-masked'));
  gsap.set(chars, { yPercent: 118, rotate: 4 });
  gsap.set(fades, { autoAlpha: 0, y: 34 });
  gsap.set('.nav', { yPercent: -100, autoAlpha: 0 });

  const intro = gsap
    .timeline({ paused: true, defaults: { ease: 'expo.out' } })
    .to(chars, { yPercent: 0, rotate: 0, duration: 1.5, stagger: 0.045 })
    .to(fades, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.45)
    .to('.nav', { yPercent: 0, autoAlpha: 1, duration: 1.2, clearProps: 'transform' }, 0.6);

  const scrollOut = { trigger: hero, start: 'top top', scrub: true };
  gsap.to('.hero__content', {
    yPercent: -18,
    autoAlpha: 0.15,
    ease: 'none',
    scrollTrigger: { ...scrollOut, end: 'bottom top' },
  });
  gsap.to('.hero__stats, .hero__side', {
    yPercent: -40,
    autoAlpha: 0,
    ease: 'none',
    scrollTrigger: { ...scrollOut, end: '60% top' },
  });

  return { play: () => intro.play() };
}
