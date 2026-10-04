/* Kho Báu Của Bản – tương tác trang */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CONTACT_EMAIL = 'khobaucuaban@gmail.com';

  /* ---------- Header, nút lên đầu trang, nút "Đặt tour ngay" ---------- */
  const header = $('.header');
  const toTop = $('#toTop');
  const stickyCta = $('#stickyCta');
  const booking = $('#dat-tour');

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 30);
    toTop.classList.toggle('is-visible', y > 700);
    const nearBooking = booking.getBoundingClientRect().top < window.innerHeight * 0.9;
    stickyCta.classList.toggle('is-visible', y > 700 && !nearBooking);
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

  /* ---------- Form đặt tour: giá tham khảo theo gói ---------- */
  const form = $('#bookingForm');
  const pkgSelect = $('#f-package');
  const qtyInput = $('#f-qty');
  const qtyLabel = $('#qtyLabel');
  const tripFields = $('#tripFields');
  const estPrice = $('#estPrice');
  const estNote = $('#estNote');
  const status = $('#formStatus');

  const vnd = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

  // Giá tham khảo theo kế hoạch của dự án
  const PRICE = { truong: 8000000, workshop: 3000000, single: 250000, group: 180000, groupMin: 5 };

  const PACKAGES = {
    truong:   { qty: 'Số học sinh dự kiến', defQty: 40,
                estimate: () => ['Từ ' + vnd(PRICE.truong), '/ chương trình · gói học kỳ/năm gồm 2–3 chương trình'] },
    workshop: { qty: 'Số người tham gia', defQty: 30,
                estimate: () => ['Từ ' + vnd(PRICE.workshop), '/ workshop · tổ chức độc lập hoặc kết hợp chương trình'] },
    dukhach:  { qty: 'Số khách', defQty: 2,
                estimate: (n) => {
                  if (n >= PRICE.groupMin) {
                    const save = n * (PRICE.single - PRICE.group);
                    return [vnd(n * PRICE.group), `${n} khách × ${vnd(PRICE.group)} (giá nhóm) · tiết kiệm ${vnd(save)}`];
                  }
                  const more = PRICE.groupMin - n;
                  return [vnd(n * PRICE.single), `${n} khách × ${vnd(PRICE.single)} · thêm ${more} khách để hưởng giá nhóm ${vnd(PRICE.group)}/khách`];
                } },
    anpham:   { estimate: () => ['Quà văn hóa có câu chuyện', 'Chúng mình sẽ gửi danh mục ấn phẩm, đặc sản và điểm bán gần bạn'] },
    homestay: { estimate: () => ['Ký gửi miễn phí', 'Chiết khấu 20–30% mỗi ấn phẩm bán ra · tài trợ kệ trưng bày'] },
    nghenhan: { estimate: () => ['Hợp tác minh bạch', 'Hỗ trợ chi phí mỗi buổi làm việc · chia sẻ doanh thu cho nghệ nhân, quỹ bản làng'] },
    taitro:   { estimate: () => ['Đồng hành CSR', 'Triển lãm lưu động, học bổng, thiết bị cho chương trình'] }
  };

  function currentQty() {
    const n = parseInt(qtyInput.value, 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }

  function updateEstimate() {
    const p = PACKAGES[pkgSelect.value];
    tripFields.hidden = !p.qty;
    if (p.qty) qtyLabel.textContent = p.qty;
    const [price, note] = p.estimate(currentQty());
    estPrice.textContent = price;
    estNote.textContent = note;
  }

  function selectPackage(key) {
    if (!PACKAGES[key]) return;
    pkgSelect.value = key;
    if (PACKAGES[key].defQty) qtyInput.value = PACKAGES[key].defQty;
    updateEstimate();
  }

  pkgSelect.addEventListener('change', () => selectPackage(pkgSelect.value));
  qtyInput.addEventListener('input', updateEstimate);

  // Nút "Đặt gói này" / "Trở thành điểm ký gửi"… chọn sẵn gói trong form
  $$('[data-package]').forEach((el) => {
    el.addEventListener('click', () => {
      selectPackage(el.dataset.package);
      setTimeout(() => $('#f-name').focus({ preventScroll: true }), 600);
    });
  });

  selectPackage(pkgSelect.value);

  // Không cho chọn ngày trong quá khứ
  const dateInput = $('#f-date');
  const today = new Date();
  dateInput.min = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');

  /* ---------- Gửi yêu cầu: kiểm tra dữ liệu và soạn sẵn email ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = form.elements;
    const fields = [f.name, f.phone, f.email];
    fields.forEach((el) => el.classList.remove('is-invalid'));

    let firstInvalid = null;
    if (!f.name.value.trim()) firstInvalid = f.name;
    if (!/^[0-9+\s().-]{8,}$/.test(f.phone.value.trim())) firstInvalid = firstInvalid || f.phone;
    if (f.email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())) firstInvalid = firstInvalid || f.email;

    if (firstInvalid) {
      firstInvalid.classList.add('is-invalid');
      firstInvalid.focus();
      status.className = 'form__status is-error';
      status.textContent = 'Vui lòng kiểm tra lại họ tên, số điện thoại và email.';
      return;
    }

    const pkgName = pkgSelect.options[pkgSelect.selectedIndex].text;
    const p = PACKAGES[pkgSelect.value];
    const lines = [
      'Gói / hình thức: ' + pkgName,
      p.qty ? p.qty + ': ' + currentQty() : null,
      p.qty && f.date.value ? 'Ngày dự kiến: ' + f.date.value.split('-').reverse().join('/') : null,
      'Giá tham khảo: ' + estPrice.textContent + ' (' + estNote.textContent + ')',
      '',
      'Họ tên: ' + f.name.value.trim(),
      'Điện thoại: ' + f.phone.value.trim(),
      f.email.value.trim() ? 'Email: ' + f.email.value.trim() : null,
      f.org.value.trim() ? 'Trường / đơn vị: ' + f.org.value.trim() : null,
      f.message.value.trim() ? 'Ghi chú: ' + f.message.value.trim() : null
    ].filter((l) => l !== null);

    const mailto = 'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent('Đặt tour – ' + pkgName) +
      '&body=' + encodeURIComponent(lines.join('\n'));

    status.className = 'form__status is-ok';
    status.innerHTML = '';
    const msg = document.createElement('p');
    msg.style.margin = '0';
    msg.innerHTML = '<strong>Cảm ơn bạn!</strong> Yêu cầu đã sẵn sàng. Bấm nút dưới để gửi qua email, hoặc gọi ' +
      '<a href="tel:+84912345678">(+84) 912 345 678</a> để được tư vấn ngay.';
    const btn = document.createElement('a');
    btn.className = 'btn btn--primary';
    btn.href = mailto;
    btn.textContent = 'Gửi yêu cầu qua email';
    status.append(msg, btn);
    btn.focus();
  });

  /* ---------- Năm hiện tại ở chân trang ---------- */
  $('#year').textContent = new Date().getFullYear();
})();
