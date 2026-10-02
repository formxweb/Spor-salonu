import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, prefersReducedMotion } from '../lib/dom.js';
import { lockScroll, smoothScrollTo, unlockScroll } from '../lib/scroll.js';

export function initNav() {
  const nav = $('.nav');
  const menu = initMenu(nav);

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('is-scrolled', y > 40);
      if (!menu.isOpen()) nav.classList.toggle('is-hidden', self.direction === 1 && y > 480);
    },
  });

  $$('.nav__links a').forEach((link) => {
    const section = $(link.hash);
    if (!section) return;

    ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => link.classList.toggle('is-active', self.isActive),
    });
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    const target = link?.hash.length > 1 && $(link.hash);
    if (!target) return;

    event.preventDefault();
    history.replaceState(null, '', link.hash === '#top' ? location.pathname : link.hash);

    if (menu.isOpen()) {
      menu.close();
      setTimeout(() => smoothScrollTo(target), prefersReducedMotion ? 0 : 450);
    } else {
      smoothScrollTo(target);
    }
  });
}

function initMenu(nav) {
  const menu = $('#menu');
  const burger = $('.burger');
  let open = false;

  const timeline = gsap
    .timeline({ paused: true, defaults: { ease: 'expo.inOut' } })
    .set(menu, { visibility: 'visible' })
    .fromTo(
      '.menu__bg',
      { clipPath: 'circle(0% at calc(100% - 44px) 42px)' },
      { clipPath: 'circle(150% at calc(100% - 44px) 42px)', duration: 1 },
    )
    .fromTo(
      '.menu__links a',
      { yPercent: 110, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.06, ease: 'expo.out' },
      0.35,
    )
    .fromTo('.menu__foot', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.6);

  const setOpen = (value) => {
    open = value;
    document.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    menu.setAttribute('aria-hidden', String(!open));
    menu.inert = !open;
    nav.classList.remove('is-hidden');

    if (open) {
      lockScroll();
      timeline.timeScale(1).play();
    } else {
      unlockScroll();
      timeline.timeScale(1.6).reverse();
    }
  };

  burger.addEventListener('click', () => setOpen(!open));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open) setOpen(false);
  });

  return { isOpen: () => open, close: () => setOpen(false) };
}
