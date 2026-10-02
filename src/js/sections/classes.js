import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, hasFinePointer, prefersReducedMotion } from '../lib/dom.js';
import { toggleHeight } from '../lib/collapse.js';
import { createSegmentIndicator } from '../lib/segmented.js';

export function initClasses() {
  const section = $('.classes');
  const rows = $$('.class-row', section);

  initAccordion(rows);
  initFilters(section, rows);
  if (hasFinePointer && !prefersReducedMotion) initPreview(section, rows);
}

function setRowOpen(row, open) {
  row.classList.toggle('is-open', open);
  $('.class-row__head', row).setAttribute('aria-expanded', String(open));
  toggleHeight($('.class-row__body', row), open);
}

function initAccordion(rows) {
  rows.forEach((row) => {
    $('.class-row__head', row).addEventListener('click', () => {
      const open = !row.classList.contains('is-open');
      rows.forEach((other) => {
        if (other !== row && other.classList.contains('is-open')) setRowOpen(other, false);
      });
      setRowOpen(row, open);
    });
  });
}

function initFilters(section, rows) {
  const group = $('.filters', section);
  const buttons = $$('.filter', group);
  const getActive = () => buttons.find((button) => button.classList.contains('is-active'));
  const moveIndicator = createSegmentIndicator(group, getActive);

  group.classList.add('is-ready');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button === getActive()) return;

      buttons.forEach((other) => {
        other.classList.toggle('is-active', other === button);
        other.setAttribute('aria-pressed', String(other === button));
      });
      moveIndicator();

      rows.forEach((row) => {
        if (row.classList.contains('is-open')) setRowOpen(row, false);
      });

      const { filter } = button.dataset;
      const state = Flip.getState(rows);
      rows.forEach((row) => row.classList.toggle('is-hidden', filter !== 'all' && row.dataset.cat !== filter));

      Flip.from(state, {
        duration: prefersReducedMotion ? 0 : 0.7,
        ease: 'expo.inOut',
        absolute: true,
        nested: true,
        onEnter: (entering) =>
          gsap.fromTo(
            entering,
            { autoAlpha: 0, x: -40 },
            { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.05, ease: 'expo.out' },
          ),
        onLeave: (leaving) => gsap.to(leaving, { autoAlpha: 0, x: 40, duration: 0.4, ease: 'power2.in' }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    });
  });
}

/** Photo card that trails the pointer over the class list. */
function initPreview(section, rows) {
  const preview = $('.class-preview', section);
  const card = $('.class-preview__inner', preview);
  const images = $$('img', preview);
  const list = $('.class-list', section);

  const moveX = gsap.quickTo(preview, 'x', { duration: 0.65, ease: 'power3' });
  const moveY = gsap.quickTo(preview, 'y', { duration: 0.65, ease: 'power3' });
  const tilt = gsap.quickTo(card, 'rotation', { duration: 0.8, ease: 'power3' });
  let lastX = 0;

  const setVisible = (visible) => {
    gsap.to(preview, { autoAlpha: visible ? 1 : 0, duration: 0.35, overwrite: 'auto' });
    gsap.to(card, { scale: visible ? 1 : 0.6, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
  };

  list.addEventListener('pointerenter', ({ clientX, clientY }) => {
    gsap.set(preview, { x: clientX, y: clientY });
    lastX = clientX;
  });
  list.addEventListener('pointermove', ({ clientX, clientY }) => {
    moveX(clientX + 40);
    moveY(clientY);
    tilt(gsap.utils.clamp(-12, 12, (clientX - lastX) * 0.6));
    lastX = clientX;
  });
  list.addEventListener('pointerleave', () => setVisible(false));

  rows.forEach((row) => {
    $('.class-row__head', row).addEventListener('pointerenter', () => {
      const index = Number(row.dataset.img) || 0;
      images.forEach((img, i) => img.classList.toggle('is-active', i === index));
      setVisible(true);
    });
    $('.class-row__body', row).addEventListener('pointerenter', () => setVisible(false));
  });
}
