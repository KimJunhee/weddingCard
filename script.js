'use strict';

const WEDDING_DATE = new Date(2026, 10, 28, 17, 0, 0); // 2026-11-28 17:00

/* ===== TOAST ===== */
const toastEl = document.getElementById('toast');
let toastTimer = null;
function showToast(message) {
  if (message) toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

/* ===== CALENDAR ===== */
(function buildCalendar() {
  const year = WEDDING_DATE.getFullYear();
  const month = WEDDING_DATE.getMonth();
  const weddingDay = WEDDING_DATE.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const body = document.getElementById('calBody');
  if (!body) return;

  let day = 1;
  for (let row = 0; row < 6 && day <= daysInMonth; row++) {
    const tr = document.createElement('tr');
    for (let col = 0; col < 7; col++) {
      const td = document.createElement('td');
      if ((row === 0 && col < firstDay) || day > daysInMonth) {
        tr.appendChild(td);
        continue;
      }
      if (col === 0) td.className = 'sun';
      if (day === weddingDay) {
        const mark = document.createElement('span');
        mark.className = 'mark';
        mark.textContent = day;
        td.appendChild(mark);
      } else {
        td.textContent = day;
      }
      day++;
      tr.appendChild(td);
    }
    body.appendChild(tr);
  }
})();

/* ===== COUNTDOWN ===== */
(function countdown() {
  const daysEl = document.getElementById('cdDays');
  const hoursEl = document.getElementById('cdHours');
  const minsEl = document.getElementById('cdMins');
  const secsEl = document.getElementById('cdSecs');
  if (!daysEl) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = WEDDING_DATE - new Date();
    if (diff <= 0) {
      daysEl.textContent = hoursEl.textContent = minsEl.textContent = secsEl.textContent = '00';
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minsEl.textContent = pad(mins);
    secsEl.textContent = pad(secs);
  }

  tick();
  setInterval(tick, 1000);
})();

/* ===== SCROLL REVEAL ===== */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); } }),
  { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
);
revealEls.forEach(el => revealObserver.observe(el));

/* ===== MUSIC TOGGLE ===== */
const musicBtn = document.getElementById('musicBtn');
const bgm = document.getElementById('bgm');
if (musicBtn && bgm) {
  musicBtn.addEventListener('click', async () => {
    const playing = musicBtn.classList.contains('playing');
    try {
      if (playing) {
        bgm.pause();
      } else {
        await bgm.play();
      }
    } catch { /* autoplay blocked, ignore */ }
    musicBtn.classList.toggle('playing', !playing);
    musicBtn.setAttribute('aria-pressed', String(!playing));
    musicBtn.setAttribute('aria-label', playing ? '음악 재생' : '음악 정지');
  });
}

/* ===== GALLERY MORE BUTTON ===== */
const moreBtn = document.getElementById('moreBtn');
if (moreBtn) {
  moreBtn.addEventListener('click', () => {
    document.querySelectorAll('#galGrid .cell.hidden').forEach(cell => cell.classList.remove('hidden'));
    moreBtn.remove();
  });
}

/* ===== LIGHTBOX ===== */
const galCells = Array.from(document.querySelectorAll('#galGrid .cell'));
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbDots = document.getElementById('lbDots');
let lbIndex = 0;

function buildDots() {
  lbDots.innerHTML = '';
  galCells.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'lb-dot' + (i === lbIndex ? ' active' : '');
    lbDots.appendChild(dot);
  });
}

function updateLightbox() {
  const img = galCells[lbIndex].querySelector('img');
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  Array.from(lbDots.children).forEach((dot, i) => dot.classList.toggle('active', i === lbIndex));
}

function openLightbox(idx) {
  lbIndex = idx;
  buildDots();
  updateLightbox();
  lightbox.classList.add('on');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('on');
  document.body.style.overflow = '';
}

function showImage(idx) {
  lbIndex = (idx + galCells.length) % galCells.length;
  updateLightbox();
}

galCells.forEach((cell, i) => cell.addEventListener('click', () => openLightbox(i)));
document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', () => showImage(lbIndex - 1));
document.getElementById('lbNext').addEventListener('click', () => showImage(lbIndex + 1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('on')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showImage(lbIndex - 1);
  if (e.key === 'ArrowRight') showImage(lbIndex + 1);
});

let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) showImage(dx < 0 ? lbIndex + 1 : lbIndex - 1);
});

/* ===== ACCOUNT ACCORDION ===== */
document.querySelectorAll('.acc-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    const group = toggle.closest('.acc-group');
    const isOpen = group.classList.contains('open');
    document.querySelectorAll('.acc-group').forEach(g => g.classList.remove('open'));
    if (!isOpen) group.classList.add('open');
  });
});

/* ===== COPY ACCOUNT NUMBER ===== */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const numText = btn.closest('.acc-item').querySelector('.num').textContent;
    const digits = numText.replace(/\D/g, '');
    await copyText(digits);
    showToast('계좌번호가 복사되었습니다');
  });
});

/* ===== SHARE / COPY LINK ===== */
const copyLinkBtn = document.getElementById('copyLinkBtn');
if (copyLinkBtn) {
  copyLinkBtn.addEventListener('click', async () => {
    await copyText(window.location.href);
    showToast('청첩장 주소가 복사되었습니다');
  });
}

const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: '준희 ♥ 원영 결혼합니다',
      text: '2026년 11월 28일 · 노블발렌티 삼성점',
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      await copyText(window.location.href);
      showToast('청첩장 주소가 복사되었습니다');
    }
  });
}
