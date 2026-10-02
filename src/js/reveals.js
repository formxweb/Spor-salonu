import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { $, $$, prefersReducedMotion } from './utils.js';

/** Kaydırmaya bağlı genel giriş animasyonları (data-reveal, sayaçlar, parallax). */
export function initReveals() {
  initProgress();
  if (prefersReducedMotion) return;

  // Başlıklar: satır satır maskeli yükseliş
  $$('[data-reveal="lines"]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'line',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 115,
          duration: 1.3,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
    });
  });

  // Tekil öğeler: yumuşak yükselerek belirme
  $$('[data-reveal="fade"]').forEach((el) => {
    gsap.from(el, {
      y: 50,
      autoAlpha: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  // Gruplar: çocuklar sırayla belirir (ekrana girdikçe)
  $$('[data-reveal="stagger"]').forEach((group) => {
    const items = [...group.children];
    gsap.set(items, { y: 60, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.08, ease: 'power3.out', overwrite: true }),
    });
  });

  // Manifesto: kelimeler kaydırdıkça aydınlanır
  $$('[data-scrub-words]').forEach((el) => {
    const { words } = SplitText.create(el, { type: 'words', wordsClass: 'word' });
    gsap.fromTo(
      words,
      { opacity: 0.14 },
      {
        opacity: 1,
        stagger: 0.12,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true },
      },
    );
  });

  // Sayaçlar
  $$('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const counter = { value: 0 };
    el.textContent = '0';
    gsap.to(counter, {
      value: end,
      duration: 2.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => {
        el.textContent = String(Math.round(counter.value));
      },
    });
  });

  // Görseller: perde açılışı + içten parallax
  $$('[data-img-reveal]').forEach((figure) => {
    const img = $('img', figure);
    gsap
      .timeline({ scrollTrigger: { trigger: figure, start: 'top 85%', once: true } })
      .from(figure, { clipPath: 'inset(100% 0% 0% 0% round 24px)', duration: 1.6, ease: 'expo.inOut' })
      .from(img, { scale: 1.35, duration: 1.8, ease: 'expo.out' }, 0.2);
  });

  $$('[data-parallax-img]').forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -7 },
      {
        yPercent: 7,
        ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
}

function initProgress() {
  const bar = $('.scroll-progress span');
  const ring = $('.to-top__progress');
  const circumference = 125.66;

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      if (bar) bar.style.transform = `scaleX(${self.progress})`;
      if (ring) ring.style.strokeDashoffset = String(circumference * (1 - self.progress));
    },
  });
}
