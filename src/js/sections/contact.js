import { $ } from '../lib/dom.js';
import { whatsappUrl } from '../lib/whatsapp.js';

let toastTimer;

function showToast(message) {
  const toast = $('.toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4200);
}

/** No backend: the form validates, then opens WhatsApp with the message pre-filled. */
export function initContact() {
  const form = $('[data-contact-form]');
  const error = $('.form__error', form);
  const { name, phone, message } = form.elements;

  const showError = (field, text) => {
    error.textContent = text;
    field.closest('.field').classList.add('is-invalid');
    field.focus();
  };

  form.addEventListener('input', (event) => {
    event.target.closest('.field')?.classList.remove('is-invalid');
    error.textContent = '';
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const digits = phone.value.replace(/\D/g, '');
    if (name.value.trim().length < 2) {
      showError(name, 'Lütfen adınızı ve soyadınızı yazın.');
      return;
    }
    if (digits.length < 10 || digits.length > 13) {
      showError(phone, 'Lütfen geçerli bir telefon numarası girin.');
      return;
    }

    const lines = [
      'Merhaba Swiss Fit Club! 👋',
      '',
      `Ad Soyad: ${name.value.trim()}`,
      `Telefon: ${phone.value.trim()}`,
      `Konu: ${form.elements.topic.value}`,
    ];
    if (message.value.trim()) lines.push(`Mesaj: ${message.value.trim()}`);

    window.open(whatsappUrl(lines.join('\n')), '_blank', 'noopener');
    showToast('Teşekkürler! Mesajınız WhatsApp’ta hazır, göndermeyi unutmayın.');
  });
}
