export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const WHATSAPP_NUMBER = '905520346777';
export const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Fontlar yüklenene kadar bekler; ağ yavaşsa en fazla `timeout` ms. */
export const fontsReady = (timeout = 2500) =>
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), wait(timeout)]);
