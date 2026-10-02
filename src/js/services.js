import { gsap } from 'gsap';
import { $$, isFinePointer, prefersReducedMotion } from './utils.js';

/** Bento kartları: imleci takip eden ışık + öne çıkan kartlarda 3B eğim. */
export function initServices() {
  const tiles = $$('.tile');
  if (!tiles.length || !isFinePointer) return;

  tiles.forEach((tile) => {
    tile.addEventListener('pointermove', (e) => {
      const r = tile.getBoundingClientRect();
      tile.style.setProperty('--mx', `${e.clientX - r.left}px`);
      tile.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  if (prefersReducedMotion) return;

  $$('[data-tilt]').forEach((tile) => {
    gsap.set(tile, { transformPerspective: 1000 });
    const rx = gsap.quickTo(tile, 'rotationX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(tile, 'rotationY', { duration: 0.6, ease: 'power3' });
    tile.addEventListener('pointermove', (e) => {
      const r = tile.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rx(py * -6);
      ry(px * 8);
    });
    tile.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
    });
  });
}
