export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const hasFinePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fontsReady = (timeout = 2500) => Promise.race([document.fonts?.ready, wait(timeout)]);
