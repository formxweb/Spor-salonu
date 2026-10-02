import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, prefersReducedMotion } from './utils.js';
import { scrollToTarget, stopScroll, startScroll } from './smooth-scroll.js';

export function initNav() {
  const nav = $('[data-nav]');
  const burger = $('.burger');
  const menu = $('#menu');
  let menuOpen = false;

  // Kaydırma: cam efekti + aşağı inerken gizle, yukarı çıkarken göster
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('is-scrolled', y > 40);
      if (!menuOpen) nav.classList.toggle('is-hidden', self.direction === 1 && y > 480);
    },
  });

  // Yüzen arama/WhatsApp butonları hero'yu geçince belirir (hero CTA'larıyla çakışmasın).
  const fab = $('.fab');
  const hero = $('.hero');
  if (fab && hero) {
    ScrollTrigger.create({
      trigger: hero,
      start: 'bottom 65%',
      onEnter: () => fab.classList.add('is-visible'),
      onLeaveBack: () => fab.classList.remove('is-visible'),
    });
  } else {
    fab?.classList.add('is-visible');
  }

  // Aktif bölüm vurgusu
  const links = $$('.nav__links a');
  links.forEach((link) => {
    const section = $(link.getAttribute('href'));
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => link.classList.toggle('is-active', self.isActive),
    });
  });

  // Tam ekran menü
  const menuTl = gsap
    .timeline({ paused: true, defaults: { ease: 'expo.inOut' } })
    .set(menu, { visibility: 'visible' })
    .fromTo('.menu__bg', { clipPath: 'circle(0% at calc(100% - 44px) 42px)' }, { clipPath: 'circle(150% at calc(100% - 44px) 42px)', duration: 1 })
    .fromTo('.menu__links a', { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.06, ease: 'expo.out' }, 0.35)
    .fromTo('.menu__foot', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.6);

  const setMenu = (open) => {
    menuOpen = open;
    document.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    menu.setAttribute('aria-hidden', String(!open));
    menu.inert = !open;
    nav.classList.remove('is-hidden');
    if (open) {
      stopScroll();
      menuTl.timeScale(1).play();
    } else {
      startScroll();
      menuTl.timeScale(1.6).reverse();
    }
  };

  burger.addEventListener('click', () => setMenu(!menuOpen));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) setMenu(false);
  });

  // Sayfa içi bağlantılar
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    if (hash.length < 2) return;
    const target = hash === '#top' ? '#top' : $(hash);
    if (!target) return;
    e.preventDefault();
    const go = () => scrollToTarget(target);
    if (menuOpen) {
      setMenu(false);
      setTimeout(go, prefersReducedMotion ? 0 : 450);
    } else {
      go();
    }
    history.replaceState(null, '', hash === '#top' ? location.pathname : hash);
  });
}
