import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { $, $$, prefersReducedMotion } from './utils.js';

/**
 * Hero başlığını harflere böler ve giriş animasyonunu hazırlar (duraklatılmış).
 * Preloader perdeleri açılırken `play()` çağrılır.
 */
export function prepareHero() {
  const hero = $('.hero');
  if (!hero || prefersReducedMotion) return { play() {} };

  const lines = $$('[data-hero-line]', hero);
  const chars = lines.flatMap((line) => SplitText.create(line, { type: 'chars', charsClass: 'char' }).chars);
  const fades = $$('[data-hero-fade]', hero);

  // Aksanlı büyük harfler (Ü, İ, Ş) maskede kırpılmasın diye dikey pay bırakılır.
  gsap.set(lines, { overflow: 'hidden', paddingTop: '0.22em', marginTop: '-0.22em', paddingBottom: '0.08em', marginBottom: '-0.08em' });
  gsap.set(chars, { yPercent: 118, rotate: 4 });
  gsap.set(fades, { autoAlpha: 0, y: 34 });
  gsap.set('.nav', { yPercent: -100, autoAlpha: 0 });

  const tl = gsap
    .timeline({ paused: true, defaults: { ease: 'expo.out' } })
    .to(chars, { yPercent: 0, rotate: 0, duration: 1.5, stagger: 0.045 })
    .to(fades, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.45)
    .to('.nav', { yPercent: 0, autoAlpha: 1, duration: 1.2, clearProps: 'transform' }, 0.6);

  // Kaydırırken içerik yukarı süzülür ve solar.
  gsap.to('.hero__content', {
    yPercent: -18,
    autoAlpha: 0.15,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero__stats, .hero__side', {
    yPercent: -40,
    autoAlpha: 0,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: '60% top', scrub: true },
  });

  return { play: () => tl.play() };
}
