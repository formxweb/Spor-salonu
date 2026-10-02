import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $$, prefersReducedMotion } from './utils.js';

/**
 * Sonsuz kayan şeritler. Hız ve yön kaydırma hızına tepki verir:
 * hızlı kaydırınca hızlanır, yukarı kaydırınca yön değiştirir.
 */
export function initMarquees() {
  const marquees = $$('[data-marquee]');
  if (!marquees.length || prefersReducedMotion) return;

  let scrollDir = 1;
  let boost = 0;

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      scrollDir = self.direction;
      boost = Math.min(Math.abs(self.getVelocity()) / 90, 14);
    },
  });

  const items = marquees.map((el) => {
    const track = el.querySelector('.ribbon__track');
    const original = [...track.children];
    const item = { el, track, x: 0, half: 0, dir: Number(el.dataset.marquee) || 1, visible: true };

    const build = () => {
      track.replaceChildren(...original);
      const setWidth = track.scrollWidth;
      const needed = Math.ceil((window.innerWidth * 1.2) / Math.max(setWidth, 1));
      const set = [];
      for (let i = 0; i < Math.max(needed, 1); i += 1) set.push(...original.map((n) => n.cloneNode(true)));
      track.replaceChildren(...set, ...set.map((n) => n.cloneNode(true)));
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      item.half = (track.scrollWidth + gap) / 2;
    };

    build();
    let width = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      build();
    });

    new IntersectionObserver(([entry]) => {
      item.visible = entry.isIntersecting;
    }).observe(el);

    return item;
  });

  gsap.ticker.add((_, delta) => {
    const dt = Math.min(delta, 50) / 1000;
    boost *= 0.94;
    items.forEach((item) => {
      if (!item.visible || !item.half) return;
      const speed = 55 + boost * 40;
      item.x -= item.dir * scrollDir * speed * dt;
      const x = gsap.utils.wrap(-item.half, 0, item.x);
      item.track.style.transform = `translate3d(${x}px,0,0)`;
    });
  });
}
