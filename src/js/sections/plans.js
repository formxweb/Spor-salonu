import { gsap } from 'gsap';
import { $, $$, prefersReducedMotion } from '../lib/dom.js';
import { createSegmentIndicator } from '../lib/segmented.js';
import { whatsappUrl } from '../lib/whatsapp.js';

const PLANS = [
  {
    term: 'Aylık Üyelik',
    badge: 'Esnek başlangıç',
    description: 'Kısa vadeli başla, ritmini bul. Kulübü tanımak ve alışkanlık kazanmak isteyenler için.',
  },
  {
    term: '3 Aylık Üyelik',
    badge: '',
    description: 'Alışkanlık kazanmak için ideal süre. İlk gerçek sonuçlarını görmeye yetecek kadar uzun.',
  },
  {
    term: '6 Aylık Üyelik',
    badge: '',
    description: 'Kalıcı dönüşüm için dengeli bir süre. Hedefine odaklan, gelişimini adım adım takip et.',
  },
  {
    term: 'Yıllık Üyelik',
    badge: 'Önerilen',
    description: 'Uzun vadeli kararlılık. Bir yıl boyunca en iyi versiyonun için çalış, dönüşümün kalıcı olsun.',
  },
];

export function initPlans() {
  const root = $('.plan');
  const tablist = $('.plan-switch', root);
  const tabs = $$('[data-plan]', tablist);
  const term = $('[data-plan-term]', root);
  const badge = $('[data-plan-badge]', root);
  const description = $('[data-plan-desc]', root);
  const cta = $('[data-plan-cta]', root);
  const content = [term, badge, description];

  let current = tabs.findIndex((tab) => tab.classList.contains('is-active'));
  const moveIndicator = createSegmentIndicator(tablist, () => tabs[current]);

  const render = (index) => {
    const plan = PLANS[index];
    term.textContent = plan.term;
    badge.textContent = plan.badge;
    description.textContent = plan.description;
    cta.href = whatsappUrl(`Merhaba, ${plan.term.toLocaleLowerCase('tr-TR')} fiyatları hakkında bilgi almak istiyorum.`);
  };

  const select = (index, { focus = false } = {}) => {
    if (index === current) return;
    current = index;

    tabs.forEach((tab, i) => {
      tab.classList.toggle('is-active', i === index);
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    if (focus) tabs[index].focus();
    moveIndicator();

    if (prefersReducedMotion) {
      render(index);
      return;
    }

    gsap
      .timeline()
      .to(content, { y: -18, autoAlpha: 0, duration: 0.25, stagger: 0.03, ease: 'power2.in' })
      .add(() => render(index))
      .fromTo(content, { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.05, ease: 'expo.out' });
  };

  render(current);

  tabs.forEach((tab, i) => {
    tab.tabIndex = i === current ? 0 : -1;
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (event) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (step) select((current + step + tabs.length) % tabs.length, { focus: true });
    });
  });
}
