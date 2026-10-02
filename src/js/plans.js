import { gsap } from 'gsap';
import { $, $$, prefersReducedMotion, waLink } from './utils.js';

const PLANS = [
  {
    term: 'Aylık Üyelik',
    badge: 'Esnek başlangıç',
    desc: 'Kısa vadeli başla, ritmini bul. Kulübü tanımak ve alışkanlık kazanmak isteyenler için.',
  },
  {
    term: '3 Aylık Üyelik',
    badge: '',
    desc: 'Alışkanlık kazanmak için ideal süre. İlk gerçek sonuçlarını görmeye yetecek kadar uzun.',
  },
  {
    term: '6 Aylık Üyelik',
    badge: '',
    desc: 'Kalıcı dönüşüm için dengeli bir süre. Hedefine odaklan, gelişimini adım adım takip et.',
  },
  {
    term: 'Yıllık Üyelik',
    badge: 'Önerilen',
    desc: 'Uzun vadeli kararlılık. Bir yıl boyunca en iyi versiyonun için çalış, dönüşümün kalıcı olsun.',
  },
];

/** Üyelik süresi seçici: kayan gösterge + içerik geçişi + WhatsApp teklif bağlantısı. */
export function initPlans() {
  const root = $('.plan');
  if (!root) return;

  const tabs = $$('[data-plan]', root);
  const indicator = $('.plan-switch__indicator', root);
  const term = $('[data-plan-term]', root);
  const badge = $('[data-plan-badge]', root);
  const desc = $('[data-plan-desc]', root);
  const cta = $('[data-plan-cta]', root);
  let current = tabs.findIndex((t) => t.classList.contains('is-active'));

  const moveIndicator = (tab, immediate = false) => {
    gsap.to(indicator, {
      x: tab.offsetLeft,
      y: tab.offsetTop - 6,
      width: tab.offsetWidth,
      height: tab.offsetHeight,
      duration: immediate || prefersReducedMotion ? 0 : 0.7,
      ease: 'expo.out',
    });
  };

  const fill = (index) => {
    const plan = PLANS[index];
    term.textContent = plan.term;
    badge.textContent = plan.badge;
    desc.textContent = plan.desc;
    cta.href = waLink(`Merhaba, ${plan.term.toLocaleLowerCase('tr-TR')} fiyatları hakkında bilgi almak istiyorum.`);
  };

  const select = (index, focus = false) => {
    if (index === current) return;
    current = index;
    tabs.forEach((tab, i) => {
      tab.classList.toggle('is-active', i === index);
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    if (focus) tabs[index].focus();
    moveIndicator(tabs[index]);

    if (prefersReducedMotion) {
      fill(index);
      return;
    }
    gsap
      .timeline()
      .to([term, badge, desc], { y: -18, autoAlpha: 0, duration: 0.25, stagger: 0.03, ease: 'power2.in' })
      .add(() => fill(index))
      .fromTo([term, badge, desc], { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.05, ease: 'expo.out' });
  };

  fill(current);
  tabs.forEach((tab, i) => {
    tab.tabIndex = i === current ? 0 : -1;
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') select((current + 1) % tabs.length, true);
      if (e.key === 'ArrowLeft') select((current - 1 + tabs.length) % tabs.length, true);
    });
  });

  moveIndicator(tabs[current], true);
  window.addEventListener('resize', () => moveIndicator(tabs[current], true));
  document.fonts?.ready.then(() => moveIndicator(tabs[current], true));
}
