import { $$ } from './dom.js';

const PHONE = '905520346777';

export const whatsappUrl = (message) => `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;

export function initWhatsAppLinks() {
  $$('[data-whatsapp]').forEach((link) => {
    link.href = whatsappUrl(link.dataset.whatsapp);
  });
}
