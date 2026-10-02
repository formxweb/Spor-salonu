import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $ } from '../lib/dom.js';

/** Call / WhatsApp buttons appear once the hero (and its own CTAs) scrolls away. */
export function initFloatingActions() {
  const actions = $('.fab');

  ScrollTrigger.create({
    trigger: '.hero',
    start: 'bottom 65%',
    onEnter: () => actions.classList.add('is-visible'),
    onLeaveBack: () => actions.classList.remove('is-visible'),
  });
}
