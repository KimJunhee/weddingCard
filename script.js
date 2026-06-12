'use strict';

/* ===== CALENDAR ===== */
(function buildCalendar() {
  const year = 2026, month = 10; // month index (0-based): 10 = November
  const weddingDay = 28;
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const container = document.getElementById('calDays');
  if (!container) return;

  // empty cells before 1st
  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('span');
    el.className = 'empty';
    container.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const el = document.createElement('span');
    el.textContent = d;
    const dow = (firstDay + d - 1) % 7;
    if (dow === 0) el.classList.add('sunday');
    if (dow === 6) el.classList.add('saturday');
    if (d === weddingDay) el.classList.add('today');
    container.appendChild(el);
  }

  // D-day
  const ddayEl = document.getElementById('dday');
  if (!ddayEl) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const wedding = new Date(year, month, weddingDay);
  const diff = Math.round((wedding - today) / 86400000);
  if (diff > 0) ddayEl.textContent = `D - ${diff}`;
  else if (diff === 0) ddayEl.textContent = 'D - Day 🎉';
  else ddayEl.textContent = `결혼 + ${Math.abs(diff)}일`;
})();

/* ===== ACCORDION ===== */
document.querySelectorAll('.accordion-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const body = document.getElementById(targetId);
    const isOpen = btn.classList.contains('open');

    // close all
    document.querySelectorAll('.accordion-btn').forEach(b => b.classList.remove('open'));
    document.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('open'));

    if (!isOpen) {
      btn.classList.add('open');
      body.classList.add('open');
    }
  });
});

/* ===== COPY TO CLIPBOARD ===== */
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const num = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(num);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = num;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    showToast();
  });
});

function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ===== GALLERY LIGHTBOX ===== */
const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
let currentIdx = 0;

function openLightbox(idx) {
  currentIdx = idx;
  const bg = galleryItems[idx].style.backgroundImage;
  const url = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
  lbImg.src = url;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function showImage(idx) {
  currentIdx = (idx + galleryItems.length) % galleryItems.length;
  const bg = galleryItems[currentIdx].style.backgroundImage;
  const url = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
  lbImg.src = url;
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
});

document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', () => showImage(currentIdx - 1));
document.getElementById('lbNext').addEventListener('click', () => showImage(currentIdx + 1));

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// swipe support
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) showImage(dx < 0 ? currentIdx + 1 : currentIdx - 1);
});

/* ===== SCROLL FADE-IN ===== */
const fadeEls = document.querySelectorAll(
  '.section-inner, .date-detail, .calendar, .transport-item, .account-card'
);

fadeEls.forEach(el => el.classList.add('fade-in'));

const io = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }),
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

fadeEls.forEach(el => io.observe(el));
