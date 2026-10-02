import 'lenis/dist/lenis.css';
import './styles/main.css';

import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import { $, fontsReady } from './js/lib/dom.js';
import { initSmoothScroll, smoothScrollTo } from './js/lib/scroll.js';
import { initWhatsAppLinks } from './js/lib/whatsapp.js';

import { initCursor, initMagneticButtons } from './js/components/cursor.js';
import { initFloatingActions } from './js/components/floating-actions.js';
import { initMarquees } from './js/components/marquee.js';
import { initNav } from './js/components/nav.js';
import { runPreloader } from './js/components/preloader.js';
import { initReveals } from './js/components/reveals.js';
import { initScrollProgress } from './js/components/scroll-progress.js';

import { initClasses } from './js/sections/classes.js';
import { initContact } from './js/sections/contact.js';
import { initFaq } from './js/sections/faq.js';
import { initFooter } from './js/sections/footer.js';
import { prepareHero } from './js/sections/hero.js';
import { initHeroGL } from './js/sections/hero-gl.js';
import { initHours } from './js/sections/hours.js';
import { initPlans } from './js/sections/plans.js';
import { initServices } from './js/sections/services.js';
import { initWhy } from './js/sections/why.js';
import { initZoom } from './js/sections/zoom.js';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

// The preloader and pinned sections assume a fresh start at the top.
history.scrollRestoration = 'manual';
const initialHash = location.hash;
window.scrollTo(0, 0);

async function boot() {
  initWhatsAppLinks();
  initHours();
  initSmoothScroll();
  initNav();
  initScrollProgress();
  initFloatingActions();
  initCursor();
  initMagneticButtons();
  initServices();
  initClasses();
  initPlans();
  initFaq();
  initContact();
  initFooter();

  const heroGL = initHeroGL($('.hero'));

  // Anything that splits text or measures layout waits for the web fonts.
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
  const target = document.getElementById(initialHash.slice(1));
  if (target) smoothScrollTo(target);
}

boot();
