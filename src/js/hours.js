import { gsap } from 'gsap';
import { $, $$, prefersReducedMotion } from './utils.js';

/*
 * Çalışma saatleri tek kaynaktan yönetilir. Saat değişirse yalnızca burayı
 * (ve index.html'deki metin/şema bilgisini) güncellemek yeterli.
 * Gün sırası: 0 = Pazartesi … 6 = Pazar.
 */
const GYM = [[7, 23], [7, 23], [7, 23], [7, 23], [7, 23], [8, 22], [8, 22]];
const CLASSES = [[7, 21], [7, 21], [7, 21], [7, 21], [7, 21], [9, 19], [9, 19]];
const DAY_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const AXIS_START = 6;
const AXIS_END = 24;

const pad = (n) => String(n).padStart(2, '0');
const hh = (h) => `${pad(h)}:00`;
const pct = (h) => ((h - AXIS_START) / (AXIS_END - AXIS_START)) * 100;

function duration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m} dk`;
  return m ? `${h} sa ${m} dk` : `${h} sa`;
}

/** İstanbul saatine göre gün ve dakika (ziyaretçinin saat diliminden bağımsız). */
function istanbulNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Istanbul',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday'));
  const hour = Number(get('hour')) % 24;
  const minute = Number(get('minute'));
  return { day, hour, minute, minutes: hour * 60 + minute, label: `${pad(hour)}:${pad(minute)}` };
}

function getStatus(now) {
  const [open, close] = GYM[now.day];
  const openMin = open * 60;
  const closeMin = close * 60;

  if (now.minutes >= openMin && now.minutes < closeMin) {
    return {
      open: true,
      state: 'Açık',
      detail: `Kapanışa ${duration(closeMin - now.minutes)} kaldı · Kapanış ${hh(close)}`,
      short: `Açık · Kapanış ${hh(close)}`,
      progress: (now.minutes - openMin) / (closeMin - openMin),
    };
  }

  const beforeOpening = now.minutes < openMin;
  const nextOpen = beforeOpening ? open : GYM[(now.day + 1) % 7][0];
  const wait = beforeOpening ? openMin - now.minutes : 24 * 60 - now.minutes + nextOpen * 60;
  const when = beforeOpening ? 'bugün' : 'yarın';
  return {
    open: false,
    state: 'Kapalı',
    detail: `Açılışa ${duration(wait)} kaldı · ${when} ${hh(nextOpen)}`,
    short: `Kapalı · ${when} ${hh(nextOpen)}`,
    progress: 0,
  };
}

function buildTimeline(root, now) {
  const axis = $('.timeline__axis', root);
  const rowsEl = $('.timeline__rows', root);

  axis.replaceChildren(
    ...[6, 9, 12, 15, 18, 21, 24].map((h) => {
      const tick = document.createElement('span');
      tick.style.left = `${pct(h)}%`;
      tick.textContent = pad(h % 24 === 0 && h !== 0 ? 24 : h);
      return tick;
    }),
  );

  rowsEl.replaceChildren(
    ...GYM.map(([open, close], i) => {
      const [cOpen, cClose] = CLASSES[i];
      const row = document.createElement('div');
      row.className = `tl-row${i === now.day ? ' is-today' : ''}`;
      row.innerHTML = `
        <span class="tl-row__day">${DAY_SHORT[i]}</span>
        <div class="tl-row__track">
          <span class="tl-row__gym" style="left:${pct(open)}%;width:${pct(close) - pct(open)}%">${hh(open)} – ${hh(close)}</span>
          <span class="tl-row__class" style="left:calc(${pct(cOpen)}% + 6px);width:calc(${pct(cClose) - pct(cOpen)}% - 12px)"></span>
        </div>`;
      return row;
    }),
  );
}

function placeNowMarker(root, now) {
  $('.tl-now', root)?.remove();
  const hours = now.hour + now.minute / 60;
  if (hours < AXIS_START || hours > AXIS_END) return;
  const track = $('.tl-row.is-today .tl-row__track', root);
  if (!track) return;
  const marker = document.createElement('span');
  marker.className = 'tl-now';
  marker.dataset.time = now.label;
  marker.style.left = `${pct(hours)}%`;
  track.append(marker);
}

export function initHours() {
  const timeline = $('[data-timeline]');
  let lastDay = -1;

  const update = () => {
    const now = istanbulNow();
    if (now.day < 0) return;
    const status = getStatus(now);

    if (timeline) {
      if (now.day !== lastDay) buildTimeline(timeline, now);
      placeNowMarker(timeline, now);
    }
    lastDay = now.day;

    $$('[data-live-pill]').forEach((pill) => {
      pill.classList.toggle('is-open', status.open);
      pill.classList.toggle('is-closed', !status.open);
    });
    $$('[data-live-short]').forEach((el) => {
      el.textContent = status.short;
    });

    const live = $('.live');
    if (live) {
      live.classList.toggle('is-closed', !status.open);
      $('[data-live-state]', live).textContent = status.state;
      $('[data-live-detail]', live).textContent = status.detail;
      $('[data-live-clock]', live).textContent = now.label;
      $('[data-live-meter]', live).style.width = `${Math.round(status.progress * 100)}%`;
      const tableRows = $$('.live__table > div', live);
      const todayRow = now.day <= 4 ? 0 : now.day === 5 ? 1 : 2;
      tableRows.forEach((row, i) => row.classList.toggle('is-today', i === todayRow));
    }

    $$('[data-live-footer]').forEach((el) => {
      el.textContent = status.open ? '● Şu an açık' : '● Şu an kapalı';
      el.classList.toggle('is-open', status.open);
      el.classList.toggle('is-closed', !status.open);
    });
  };

  update();
  setInterval(update, 30_000);

  if (timeline && !prefersReducedMotion) {
    gsap.from(timeline.querySelectorAll('.tl-row__gym, .tl-row__class'), {
      scaleX: 0,
      duration: 1.4,
      stagger: 0.05,
      ease: 'expo.out',
      scrollTrigger: { trigger: timeline, start: 'top 80%', once: true },
    });
  }
}
