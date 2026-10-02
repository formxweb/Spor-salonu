import { gsap } from 'gsap';
import { $$, hasFinePointer, prefersReducedMotion } from '../lib/dom.js';

/** Pointer-following glow on every tile, plus a subtle 3D tilt on the photo tiles. */
export function initServices() {
  if (!hasFinePointer) return;

  $$('.tile').forEach((tile) => {
    tile.addEventListener('pointermove', (event) => {
      const rect = tile.getBoundingClientRect();
      tile.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      tile.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  });

  if (prefersReducedMotion) return;

  $$('[data-tilt]').forEach((tile) => {
    gsap.set(tile, { transformPerspective: 1000 });
    const rotateX = gsap.quickTo(tile, 'rotationX', { duration: 0.6, ease: 'power3' });
    const rotateY = gsap.quickTo(tile, 'rotationY', { duration: 0.6, ease: 'power3' });

    tile.addEventListener('pointermove', (event) => {
      const rect = tile.getBoundingClientRect();
      rotateX(((event.clientY - rect.top) / rect.height - 0.5) * -6);
      rotateY(((event.clientX - rect.left) / rect.width - 0.5) * 8);
    });
    tile.addEventListener('pointerleave', () => {
      rotateX(0);
      rotateY(0);
    });
  });
}
