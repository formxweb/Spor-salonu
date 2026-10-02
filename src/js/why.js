import { gsap } from 'gsap';
import { $, $$ } from './utils.js';

/** "Neden biz" bölümü: masaüstünde sabitlenmiş yatay kaydırma. Mobilde CSS karuseli. */
export function initWhy() {
  const section = $('.why');
  if (!section) return;

  const pin = $('.why__pin', section);
  const track = $('.why__track', section);
  const bar = $('.why__progress span', section);
  const mm = gsap.matchMedia();

  mm.add('(min-width: 901px)', () => {
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const scroll = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin,
        start: 'top top',
        end: () => `+=${distance()}`,
        scrub: 0.8,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          bar.style.transform = `scaleX(${self.progress})`;
        },
      },
    });

    $$('.why-card', track).forEach((card) => {
      gsap.fromTo(
        card,
        { rotateY: -14, rotateZ: 2, y: 40, transformPerspective: 1200, transformOrigin: 'left center' },
        {
          rotateY: 0,
          rotateZ: 0,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: scroll, start: 'left 100%', end: 'left 55%', scrub: true },
        },
      );
    });

    const img = $('.why-card--image img', track);
    if (img) {
      gsap.fromTo(
        img,
        { xPercent: -8, scale: 1.2 },
        {
          xPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: img.parentElement, containerAnimation: scroll, start: 'left right', end: 'right left', scrub: true },
        },
      );
    }
  });
}
