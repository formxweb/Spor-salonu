import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, prefersReducedMotion } from '../lib/dom.js';

const BASE_SPEED = 55; // px per second

/** Endless ribbons that speed up with scroll velocity and follow scroll direction. */
export function initMarquees() {
  const elements = $$('[data-marquee]');
  if (!elements.length || prefersReducedMotion) return;

  let scrollDirection = 1;
  let boost = 0;

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      scrollDirection = self.direction;
      boost = Math.min(Math.abs(self.getVelocity()) / 90, 14);
    },
  });

  const marquees = elements.map(createMarquee);

  gsap.ticker.add((_, deltaMs) => {
    const seconds = Math.min(deltaMs, 50) / 1000;
    const distance = (BASE_SPEED + boost * 40) * seconds * scrollDirection;
    boost *= 0.94;
    marquees.forEach((marquee) => marquee.advance(distance));
  });
}

function createMarquee(el) {
  const track = $('.ribbon__track', el);
  const items = [...track.children];
  const direction = el.dataset.marquee === 'right' ? -1 : 1;
  let offset = 0;
  let loopWidth = 0;
  let visible = true;
  let viewportWidth = window.innerWidth;

  // Two identical halves, each at least a viewport wide, so wrapping at the halfway point is seamless.
  const fill = () => {
    track.replaceChildren(...items);
    const copies = Math.max(1, Math.ceil((window.innerWidth * 1.2) / Math.max(track.scrollWidth, 1)));
    const half = Array.from({ length: copies }, () => items.map((item) => item.cloneNode(true))).flat();
    track.replaceChildren(...half, ...half.map((item) => item.cloneNode(true)));
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    loopWidth = (track.scrollWidth + gap) / 2;
  };

  fill();
  window.addEventListener('resize', () => {
    if (window.innerWidth === viewportWidth) return;
    viewportWidth = window.innerWidth;
    fill();
  });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }).observe(el);

  return {
    advance(distance) {
      if (!visible || !loopWidth) return;
      offset -= direction * distance;
      track.style.transform = `translate3d(${gsap.utils.wrap(-loopWidth, 0, offset)}px,0,0)`;
    },
  };
}
