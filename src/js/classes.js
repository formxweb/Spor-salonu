import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, isFinePointer, prefersReducedMotion } from './utils.js';

/** Grup dersleri: kategori filtresi (FLIP), akordeon satırlar ve imleci takip eden görsel önizleme. */
export function initClasses() {
  const section = $('.classes');
  if (!section) return;

  const rows = $$('.class-row', section);
  initAccordion(rows);
  initFilters(section, rows);
  if (isFinePointer && !prefersReducedMotion) initPreview(section, rows);
}

function setRowOpen(row, open) {
  const head = $('.class-row__head', row);
  const body = $('.class-row__body', row);
  row.classList.toggle('is-open', open);
  head.setAttribute('aria-expanded', String(open));

  gsap.to(body, {
    height: open ? 'auto' : 0,
    duration: prefersReducedMotion ? 0 : 0.7,
    ease: 'expo.inOut',
    overwrite: true,
    onComplete: () => ScrollTrigger.refresh(),
  });
}

function initAccordion(rows) {
  rows.forEach((row) => {
    $('.class-row__head', row).addEventListener('click', () => {
      const willOpen = !row.classList.contains('is-open');
      rows.forEach((other) => {
        if (other !== row && other.classList.contains('is-open')) setRowOpen(other, false);
      });
      setRowOpen(row, willOpen);
    });
  });
}

function initFilters(section, rows) {
  const group = $('.filters', section);
  const buttons = $$('.filter', group);
  const indicator = $('.filters__indicator', group);

  const moveIndicator = (button, immediate = false) => {
    gsap.to(indicator, {
      x: button.offsetLeft,
      y: button.offsetTop - 6,
      width: button.offsetWidth,
      height: button.offsetHeight,
      duration: immediate || prefersReducedMotion ? 0 : 0.7,
      ease: 'expo.out',
    });
  };

  group.classList.add('is-ready');
  const active = () => buttons.find((b) => b.classList.contains('is-active'));
  moveIndicator(active(), true);
  window.addEventListener('resize', () => moveIndicator(active(), true));
  document.fonts?.ready.then(() => moveIndicator(active(), true));

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.classList.contains('is-active')) return;
      buttons.forEach((b) => {
        b.classList.toggle('is-active', b === button);
        b.setAttribute('aria-pressed', String(b === button));
      });
      moveIndicator(button);

      const filter = button.dataset.filter;
      rows.forEach((row) => {
        if (row.classList.contains('is-open')) setRowOpen(row, false);
      });

      const state = Flip.getState(rows);
      rows.forEach((row) => row.classList.toggle('is-hidden', filter !== 'all' && row.dataset.cat !== filter));

      Flip.from(state, {
        duration: prefersReducedMotion ? 0 : 0.7,
        ease: 'expo.inOut',
        absolute: true,
        nested: true,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.05, ease: 'expo.out' }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, x: 40, duration: 0.4, ease: 'power2.in' }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    });
  });
}

function initPreview(section, rows) {
  const preview = $('.class-preview', section);
  const inner = $('.class-preview__inner', preview);
  const images = $$('img', preview);
  const list = $('.class-list', section);

  const x = gsap.quickTo(preview, 'x', { duration: 0.65, ease: 'power3' });
  const y = gsap.quickTo(preview, 'y', { duration: 0.65, ease: 'power3' });
  const rot = gsap.quickTo(inner, 'rotation', { duration: 0.8, ease: 'power3' });
  let lastX = 0;

  const show = (visible) => {
    gsap.to(preview, { autoAlpha: visible ? 1 : 0, duration: 0.35, overwrite: 'auto' });
    gsap.to(inner, { scale: visible ? 1 : 0.6, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
  };

  list.addEventListener('pointerenter', (e) => {
    gsap.set(preview, { x: e.clientX, y: e.clientY });
    lastX = e.clientX;
  });
  list.addEventListener('pointermove', (e) => {
    x(e.clientX + 40);
    y(e.clientY);
    rot(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
    lastX = e.clientX;
  });
  list.addEventListener('pointerleave', () => show(false));

  rows.forEach((row) => {
    $('.class-row__head', row).addEventListener('pointerenter', () => {
      const index = Number(row.dataset.img) || 0;
      images.forEach((img, i) => img.classList.toggle('is-active', i === index));
      show(true);
    });
    $('.class-row__body', row).addEventListener('pointerenter', () => show(false));
  });
}
