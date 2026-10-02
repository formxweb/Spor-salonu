import { $, waLink } from './utils.js';

let toastTimer;
export function showToast(message) {
  const toast = $('.toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4200);
}

/**
 * İletişim formu sunucu gerektirmez: bilgiler doğrulanır ve hazır bir mesajla
 * WhatsApp sohbeti açılır.
 */
export function initContact() {
  const form = $('[data-contact-form]');
  if (!form) return;
  const error = $('.form__error', form);

  const fail = (field, message) => {
    error.textContent = message;
    field.closest('.field')?.classList.add('is-invalid');
    field.focus();
  };

  form.addEventListener('input', (e) => {
    e.target.closest('.field')?.classList.remove('is-invalid');
    error.textContent = '';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name;
    const phone = form.elements.phone;
    const digits = phone.value.replace(/\D/g, '');

    if (name.value.trim().length < 2) return fail(name, 'Lütfen adınızı ve soyadınızı yazın.');
    if (digits.length < 10 || digits.length > 13) return fail(phone, 'Lütfen geçerli bir telefon numarası girin.');

    const topic = form.elements.topic.value;
    const message = form.elements.message.value.trim();
    const text = [
      'Merhaba Swiss Fit Club! 👋',
      '',
      `Ad Soyad: ${name.value.trim()}`,
      `Telefon: ${phone.value.trim()}`,
      `Konu: ${topic}`,
      message ? `Mesaj: ${message}` : null,
    ]
      .filter((line) => line !== null)
      .join('\n');

    window.open(waLink(text), '_blank', 'noopener');
    showToast('Teşekkürler! Mesajınız WhatsApp’ta hazır, göndermeyi unutmayın.');
  });
}
