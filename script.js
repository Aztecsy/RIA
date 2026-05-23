/* ============================================================
   RIA — Shared JavaScript
   ============================================================ */

/* ── Mobile menu ────────────────────────────────────────────── */
(function () {
  const btn   = document.getElementById('menuBtn');
  const close = document.getElementById('menuClose');
  const menu  = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  const closeMenu = () => {
    menu.classList.remove('open');
    document.body.style.overflow = '';
  };
  if (close) close.addEventListener('click', closeMenu);
  menu.addEventListener('click', (e) => {
    if (e.target === menu) closeMenu();
  });
})();

/* ── Search tabs ────────────────────────────────────────────── */
function setTab(el) {
  const tabs = el.closest('.search-tabs').querySelectorAll('.search-tab');
  tabs.forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

/* ── Generic carousel ───────────────────────────────────────── */
const carouselState = {};

function getCardWidth(trackId) {
  const track = document.getElementById(trackId);
  if (!track) return 0;
  const card = track.querySelector('.dest-card, .exp-card');
  if (!card) return 0;
  const style = window.getComputedStyle(track);
  const gap = parseFloat(style.gap || style.columnGap || '18');
  return card.offsetWidth + gap;
}

function getVisibleCount(trackId) {
  const outer = document.getElementById(trackId)?.parentElement;
  if (!outer) return 1;
  const card = document.getElementById(trackId)?.querySelector('.dest-card, .exp-card');
  if (!card) return 1;
  return Math.round(outer.offsetWidth / card.offsetWidth) || 1;
}

function moveCarousel(trackId, prevId, nextId, direction) {
  const track = document.getElementById(trackId);
  const prev  = document.getElementById(prevId);
  const next  = document.getElementById(nextId);
  if (!track) return;

  if (!carouselState[trackId]) carouselState[trackId] = 0;
  const total   = track.children.length;
  const visible = getVisibleCount(trackId);
  const maxIdx  = Math.max(0, total - visible);
  const step    = 1;

  carouselState[trackId] = Math.min(maxIdx, Math.max(0, carouselState[trackId] + direction * step));
  const offset = carouselState[trackId] * getCardWidth(trackId);
  track.style.transform = `translateX(-${offset}px)`;

  if (prev) prev.disabled = carouselState[trackId] === 0;
  if (next) next.disabled = carouselState[trackId] >= maxIdx;
}

/* ── Intersection observer fade-up ──────────────────────────── */
(function () {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.dest-card, .exp-card, .manage-card, .event-card, .cat-card, .split-row').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    observer.observe(el);
  });
})();

/* ── Navbar scroll effect ────────────────────────────────────── */
(function () {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  let last = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 60 && y > last) {
      nav.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }
    last = y;
  }, { passive: true });
  nav.style.transition = 'transform .3s ease';
})();
