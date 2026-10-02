import { gsap } from 'gsap';
import { $, $$, hasFinePointer, prefersReducedMotion } from '../lib/dom.js';

const INTERACTIVE = 'a, button, summary, label, [data-cursor]';
const enabled = hasFinePointer && !prefersReducedMotion;

const follow = (el, duration) => ({
  x: gsap.quickTo(el, 'x', { duration, ease: 'power3' }),
  y: gsap.quickTo(el, 'y', { duration, ease: 'power3' }),
});

export function initCursor() {
  if (!enabled) return;

  const cursor = $('.cursor');
  const label = $('.cursor__label', cursor);
  const dot = follow($('.cursor__dot', cursor), 0.12);
  const ring = follow($('.cursor__ring', cursor), 0.5);
  let hasMoved = false;

  document.documentElement.classList.add('has-cursor');

  window.addEventListener('pointermove', ({ clientX, clientY }) => {
    hasMoved = true;
    dot.x(clientX);
    dot.y(clientY);
    ring.x(clientX);
    ring.y(clientY);
    cursor.classList.remove('is-hidden');
  });

  document.addEventListener('mouseout', (event) => {
    if (!event.relatedTarget) cursor.classList.add('is-hidden');
  });

  document.addEventListener('pointerover', ({ target }) => {
    const labelled = target.closest('[data-cursor]');
    const overField = target.closest('input, textarea, iframe');

    cursor.classList.toggle('is-hidden', !hasMoved || Boolean(overField));
    cursor.classList.toggle('is-hover', Boolean(target.closest(INTERACTIVE)));
    cursor.classList.toggle('is-label', Boolean(labelled));
    label.textContent = labelled?.dataset.cursor ?? '';
  });
}

export function initMagneticButtons() {
  if (!enabled) return;

  $$('[data-magnetic]').forEach((el) => {
    const pull = follow(el, 0.6);

    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      pull.x((event.clientX - (rect.left + rect.width / 2)) * 0.3);
      pull.y((event.clientY - (rect.top + rect.height / 2)) * 0.35);
    });

    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)', overwrite: true });
    });
  });
}
