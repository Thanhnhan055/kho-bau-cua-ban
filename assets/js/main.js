/* Kho Báu Của Bản – tương tác trang */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: trạng thái khi cuộn + nút lên đầu trang ---------- */
  const header = $('.header');
  const toTop = $('#toTop');

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 30);
    toTop.classList.toggle('is-visible', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ---------- Menu di động ---------- */
  const nav = $('#nav');
  const navToggle = $('#navToggle');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
  }
  navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('.nav__link', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Đánh dấu mục đang xem trên menu ---------- */
  const links = $$('.nav__link');
  const sections = links
    .map((a) => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Hiệu ứng xuất hiện khi cuộn ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Tranh phong cảnh nhiều lớp (parallax) ---------- */
  const scene = $('#scene');
  if (scene && !reduceMotion) {
    const layers = $$('.layer', scene).map((el) => ({ el, depth: parseFloat(el.dataset.depth) || 0 }));
    let mouseX = 0, mouseY = 0, scrollShift = 0, ticking = false;

    function render() {
      layers.forEach(({ el, depth }) => {
        el.style.setProperty('--tx', (mouseX * depth * 18).toFixed(2) + 'px');
        el.style.setProperty('--ty', (mouseY * depth * 12 + scrollShift * depth).toFixed(2) + 'px');
      });
      ticking = false;
    }
    function request() {
      if (!ticking) { ticking = true; requestAnimationFrame(render); }
    }

    const hero = $('.hero');
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      mouseX = (e.clientX - r.left) / r.width - 0.5;
      mouseY = (e.clientY - r.top) / r.height - 0.5;
      request();
    });
    hero.addEventListener('mouseleave', () => { mouseX = 0; mouseY = 0; request(); });
    window.addEventListener('scroll', () => {
      scrollShift = Math.min(window.scrollY, window.innerHeight) * 0.12;
      request();
    }, { passive: true });
  }

  /* ---------- Tabs: Kênh & quan hệ khách hàng ---------- */
  const tabBtns = $$('.tabs__btn');
  function activateTab(btn) {
    tabBtns.forEach((b) => {
      const active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-selected', String(active));
      b.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(b.getAttribute('aria-controls'));
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
  }
  tabBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => activateTab(btn));
    btn.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabBtns[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabBtns.length) % tabBtns.length];
      next.focus();
      activateTab(next);
    });
  });

  /* ---------- Phóng to ảnh ---------- */
  const lightbox = $('#lightbox');
  const lbImg = $('img', lightbox);
  let lastTrigger = null;

  function openLightbox(trigger) {
    lastTrigger = trigger;
    const img = $('img', trigger);
    lbImg.src = trigger.dataset.lightbox;
    lbImg.alt = img ? img.alt : '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.lightbox__close', lightbox).focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }
  $$('[data-lightbox]').forEach((el) => el.addEventListener('click', () => openLightbox(el)));
  lightbox.addEventListener('click', (e) => { if (e.target !== lbImg) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lightbox.hidden) closeLightbox(); });

  /* ---------- Form liên hệ (chạy local, chưa gửi lên máy chủ) ---------- */
  const form = $('#contactForm');
  const status = $('#formStatus');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name;
    const phone = form.elements.phone;
    const email = form.elements.email;
    let firstInvalid = null;

    [name, phone, email].forEach((f) => f.classList.remove('is-invalid'));

    if (!name.value.trim()) firstInvalid = firstInvalid || name;
    if (!/^[0-9+\s().-]{8,}$/.test(phone.value.trim())) firstInvalid = firstInvalid || phone;
    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) firstInvalid = firstInvalid || email;

    if (firstInvalid) {
      firstInvalid.classList.add('is-invalid');
      firstInvalid.focus();
      status.className = 'form__status is-error';
      status.textContent = 'Vui lòng kiểm tra lại họ tên, số điện thoại và email.';
      return;
    }

    status.className = 'form__status is-ok';
    status.textContent = `Cảm ơn ${name.value.trim()}! Kho Báu Của Bản đã nhận lời nhắn và sẽ liên hệ lại sớm.`;
    form.reset();
  });

  /* ---------- Năm hiện tại ở chân trang ---------- */
  $('#year').textContent = new Date().getFullYear();
})();
