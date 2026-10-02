import { gsap } from 'gsap';
import { $, prefersReducedMotion } from '../lib/dom.js';

/** A small framed photo that opens up to full screen while the section is stuck. */
export function initZoom() {
  if (prefersReducedMotion) return;

  const section = $('.zoom');
  const frame = $('.zoom__frame', section);
  const caption = $('.zoom__caption', section);

  gsap.matchMedia().add({ desktop: '(min-width: 761px)', mobile: '(max-width: 760px)' }, ({ conditions }) => {
    const startClip = conditions.desktop ? 'inset(24% 31% 24% 31% round 32px)' : 'inset(30% 10% 30% 10% round 24px)';

    gsap
      .timeline({ scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 1 } })
      .fromTo(frame, { clipPath: startClip }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 1 })
      .fromTo($('img', frame), { scale: 1.45 }, { scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
      .fromTo($('.zoom__big', section), { scale: 0.9, autoAlpha: 1 }, { scale: 1.5, autoAlpha: 0, ease: 'power2.in', duration: 0.75 }, 0)
      .fromTo(
        caption.children,
        { y: 70, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.3, ease: 'power3.out' },
        0.72,
      );
  });
}
