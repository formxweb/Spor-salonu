import { gsap } from 'gsap';
import { $, $$, prefersReducedMotion } from '../lib/dom.js';

// Index 0 is Monday. Keep in sync with the copy and JSON-LD in index.html.
const OPENING_HOURS = [[7, 23], [7, 23], [7, 23], [7, 23], [7, 23], [8, 22], [8, 22]];
const CLASS_HOURS = [[7, 21], [7, 21], [7, 21], [7, 21], [7, 21], [9, 19], [9, 19]];
const DAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const AXIS = { start: 6, end: 24, ticks: [6, 9, 12, 15, 18, 21, 24] };

const pad = (n) => String(n).padStart(2, '0');
const formatHour = (hour) => `${pad(hour)}:00`;
const toPercent = (hour) => ((hour - AXIS.start) / (AXIS.end - AXIS.start)) * 100;

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} dk`;
  return m ? `${h} sa ${m} dk` : `${h} sa`;
}

/** Current weekday and time in Istanbul, regardless of the visitor's time zone. */
function istanbulNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Istanbul',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type)?.value;

  const hour = Number(get('hour')) % 24;
  const minute = Number(get('minute'));
  return {
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday')),
    hour,
    minute,
    minutes: hour * 60 + minute,
    label: `${pad(hour)}:${pad(minute)}`,
  };
}

function getStatus(now) {
  const [opens, closes] = OPENING_HOURS[now.day];
  const openMinute = opens * 60;
  const closeMinute = closes * 60;

  if (now.minutes >= openMinute && now.minutes < closeMinute) {
    return {
      open: true,
      state: 'Açık',
      detail: `Kapanışa ${formatDuration(closeMinute - now.minutes)} kaldı · Kapanış ${formatHour(closes)}`,
      summary: `Açık · Kapanış ${formatHour(closes)}`,
      progress: (now.minutes - openMinute) / (closeMinute - openMinute),
    };
  }

  const beforeOpening = now.minutes < openMinute;
  const nextOpen = beforeOpening ? opens : OPENING_HOURS[(now.day + 1) % 7][0];
  const minutesLeft = beforeOpening ? openMinute - now.minutes : 24 * 60 - now.minutes + nextOpen * 60;
  const when = beforeOpening ? 'bugün' : 'yarın';

  return {
    open: false,
    state: 'Kapalı',
    detail: `Açılışa ${formatDuration(minutesLeft)} kaldı · ${when} ${formatHour(nextOpen)}`,
    summary: `Kapalı · ${when} ${formatHour(nextOpen)}`,
    progress: 0,
  };
}

function renderTimeline(timeline, today) {
  $('.timeline__axis', timeline).replaceChildren(
    ...AXIS.ticks.map((hour) => {
      const tick = document.createElement('span');
      tick.style.left = `${toPercent(hour)}%`;
      tick.textContent = pad(hour);
      return tick;
    }),
  );

  $('.timeline__rows', timeline).innerHTML = OPENING_HOURS.map(([opens, closes], day) => {
    const [classesStart, classesEnd] = CLASS_HOURS[day];
    return `
      <div class="timeline__row${day === today ? ' is-today' : ''}">
        <span class="timeline__day">${DAY_LABELS[day]}</span>
        <div class="timeline__track">
          <span class="timeline__hours" style="left:${toPercent(opens)}%;width:${toPercent(closes) - toPercent(opens)}%">${formatHour(opens)} – ${formatHour(closes)}</span>
          <span class="timeline__classes" style="left:calc(${toPercent(classesStart)}% + 6px);width:calc(${toPercent(classesEnd) - toPercent(classesStart)}% - 12px)"></span>
        </div>
      </div>`;
  }).join('');
}

function placeNowMarker(timeline, now) {
  $('.timeline__now', timeline)?.remove();

  const hours = now.hour + now.minute / 60;
  const track = $('.timeline__row.is-today .timeline__track', timeline);
  if (!track || hours < AXIS.start || hours > AXIS.end) return;

  const marker = document.createElement('span');
  marker.className = 'timeline__now';
  marker.dataset.time = now.label;
  marker.style.left = `${toPercent(hours)}%`;
  track.append(marker);
}

export function initHours() {
  const timeline = $('.timeline');
  const live = $('.live');
  const tableRows = $$('.live__table > div', live);
  let renderedDay = -1;

  const update = () => {
    const now = istanbulNow();
    const status = getStatus(now);

    if (now.day !== renderedDay) {
      renderTimeline(timeline, now.day);
      renderedDay = now.day;
    }
    placeNowMarker(timeline, now);

    $$('[data-live-pill]').forEach((pill) => {
      pill.classList.toggle('is-open', status.open);
      pill.classList.toggle('is-closed', !status.open);
    });
    $$('[data-live-short]').forEach((el) => {
      el.textContent = status.summary;
    });
    $$('[data-live-footer]').forEach((el) => {
      el.textContent = status.open ? '● Şu an açık' : '● Şu an kapalı';
      el.classList.toggle('is-open', status.open);
      el.classList.toggle('is-closed', !status.open);
    });

    live.classList.toggle('is-closed', !status.open);
    $('[data-live-state]', live).textContent = status.state;
    $('[data-live-detail]', live).textContent = status.detail;
    $('[data-live-clock]', live).textContent = now.label;
    $('[data-live-meter]', live).style.width = `${Math.round(status.progress * 100)}%`;

    const todayRow = now.day <= 4 ? 0 : now.day - 4;
    tableRows.forEach((row, i) => row.classList.toggle('is-today', i === todayRow));
  };

  update();
  setInterval(update, 30_000);

  if (!prefersReducedMotion) {
    gsap.from($$('.timeline__hours, .timeline__classes', timeline), {
      scaleX: 0,
      duration: 1.4,
      stagger: 0.05,
      ease: 'expo.out',
      scrollTrigger: { trigger: timeline, start: 'top 80%', once: true },
    });
  }
}
