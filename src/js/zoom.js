import { gsap } from 'gsap';
import { $, prefersReducedMotion } from './utils.js';

/** Küçük bir pencereden tam ekrana açılan görsel (sticky + scrub). */
export function initZoom() {
  const section = $('.zoom');
  if (!section || prefersReducedMotion) return;

  const frame = $('.zoom__frame', section);
  const img = $('img', frame);
  const big = $('.zoom__big', section);
  const caption = $('.zoom__caption', section);
  const mm = gsap.matchMedia();

  mm.add({ desktop: '(min-width: 761px)', mobile: '(max-width: 760px)' }, (ctx) => {
    const from = ctx.conditions.desktop ? 'inset(24% 31% 24% 31% round 32px)' : 'inset(30% 10% 30% 10% round 24px)';

    gsap
      .timeline({
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 1 },
      })
      .fromTo(frame, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 1 })
      .fromTo(img, { scale: 1.45 }, { scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
      .fromTo(big, { scale: 0.9, autoAlpha: 1 }, { scale: 1.5, autoAlpha: 0, ease: 'power2.in', duration: 0.75 }, 0)
      .fromTo(caption.children, { y: 70, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.3, ease: 'power3.out' }, 0.72);
  });
}
