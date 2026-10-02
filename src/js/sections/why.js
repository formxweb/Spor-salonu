import { gsap } from 'gsap';
import { $, $$ } from '../lib/dom.js';

/** Pinned horizontal scroller on desktop; below 901px the CSS swipe carousel takes over. */
export function initWhy() {
  const section = $('.why');
  const track = $('.why__track', section);
  const progressBar = $('.why__progress span', section);

  gsap.matchMedia().add('(min-width: 901px)', () => {
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const scroll = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: $('.why__pin', section),
        start: 'top top',
        end: () => `+=${distance()}`,
        scrub: 0.8,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: ({ progress }) => {
          progressBar.style.transform = `scaleX(${progress})`;
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

    const photo = $('.why-card--image img', track);
    gsap.fromTo(
      photo,
      { xPercent: -8, scale: 1.2 },
      {
        xPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: photo.parentElement,
          containerAnimation: scroll,
          start: 'left right',
          end: 'right left',
          scrub: true,
        },
      },
    );
  });
}
