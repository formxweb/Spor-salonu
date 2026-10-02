import { gsap } from 'gsap';
import { $, $$, isFinePointer, prefersReducedMotion } from './utils.js';

const INTERACTIVE = 'a, button, summary, label, [data-cursor], .class-row__head';

/** Özel imleç + mıknatıslı butonlar (yalnızca fare kullanan cihazlarda). */
export function initCursor() {
  if (!isFinePointer || prefersReducedMotion) return;

  const cursor = $('.cursor');
  const dot = $('.cursor__dot', cursor);
  const ring = $('.cursor__ring', cursor);
  const label = $('.cursor__label', cursor);
  document.documentElement.classList.add('has-cursor');

  const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });

  let moved = false;
  window.addEventListener('pointermove', (e) => {
    moved = true;
    dotX(e.clientX);
    dotY(e.clientY);
    ringX(e.clientX);
    ringY(e.clientY);
    cursor.classList.remove('is-hidden');
  });

  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) cursor.classList.add('is-hidden');
  });

  document.addEventListener('pointerover', (e) => {
    const target = e.target.closest?.(INTERACTIVE);
    const text = e.target.closest?.('input, textarea, iframe');
    cursor.classList.toggle('is-hidden', !moved || Boolean(text));
    cursor.classList.toggle('is-hover', Boolean(target));
    const labelled = e.target.closest?.('[data-cursor]');
    cursor.classList.toggle('is-label', Boolean(labelled));
    label.textContent = labelled ? labelled.dataset.cursor : '';
  });

  // Mıknatıslı butonlar
  $$('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.3);
      y((e.clientY - (r.top + r.height / 2)) * 0.35);
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)', overwrite: true });
    });
  });
}
