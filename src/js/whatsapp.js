import { $$, waLink } from './utils.js';

/** data-wa="mesaj" taşıyan bağlantılara hazır mesajlı WhatsApp adresi verir. */
export function initWhatsAppLinks() {
  $$('[data-wa]').forEach((link) => {
    link.href = waLink(link.dataset.wa);
  });
}
