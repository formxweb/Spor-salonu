import 'lenis/dist/lenis.css';
import './styles/base.css';
import './styles/sections.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';

import heroLarge from './assets/images/gym-floor.webp';
import heroSmall from './assets/images/gym-floor-sm.webp';

import { $, fontsReady } from './js/utils.js';
import { initWhatsAppLinks } from './js/whatsapp.js';
import { initSmoothScroll, scrollToTarget } from './js/smooth-scroll.js';
import { runPreloader } from './js/preloader.js';
import { initHeroGL } from './js/hero-gl.js';
import { prepareHero } from './js/hero.js';
import { initCursor } from './js/cursor.js';
import { initNav } from './js/nav.js';
import { initReveals } from './js/reveals.js';
import { initMarquees } from './js/marquee.js';
import { initWhy } from './js/why.js';
import { initServices } from './js/services.js';
import { initZoom } from './js/zoom.js';
import { initClasses } from './js/classes.js';
import { initHours } from './js/hours.js';
import { initPlans } from './js/plans.js';
import { initFaq } from './js/faq.js';
import { initContact } from './js/contact.js';
import { initFooter } from './js/footer.js';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const initialHash = location.hash;
window.scrollTo(0, 0);

async function boot() {
  // İçerik ve etkileşimler (animasyondan bağımsız olanlar önce)
  initWhatsAppLinks();
  initHours();
  initSmoothScroll();
  initNav();
  initCursor();
  initServices();
  initClasses();
  initPlans();
  initFaq();
  initContact();
  initFooter();

  const heroGL = initHeroGL({ hero: $('.hero'), src: { large: heroLarge, small: heroSmall } });

  // Metin bölme işlemleri doğru ölçüm için fontları bekler (preloader bu sırada ekranı örter).
  await fontsReady();
  const hero = prepareHero();
  initMarquees();
  initWhy();
  initZoom();
  initReveals();
  ScrollTrigger.refresh();

  await runPreloader({
    onReveal: () => {
      heroGL.reveal();
      hero.play();
    },
  });

  ScrollTrigger.refresh();
  if (initialHash && initialHash.length > 1 && $(initialHash)) {
    scrollToTarget($(initialHash));
  }
}

boot();
