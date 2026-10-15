/* NOCTURNE — Ink & Amber. Vanilla JS, no dependencies. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;

  /* ---------- midnight theme (localStorage nb-theme) ---------- */
  try {
    var saved = localStorage.getItem('nb-theme');
    if (saved === 'midnight') root.setAttribute('data-theme', 'midnight');
  } catch (e) {}
  d.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'midnight' ? '' : 'midnight';
      if (next) { root.setAttribute('data-theme', 'midnight'); } else { root.removeAttribute('data-theme'); }
      try { localStorage.setItem('nb-theme', next ? 'midnight' : 'light'); } catch (e) {}
      var on = root.getAttribute('data-theme') === 'midnight';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      var label = btn.querySelector('.tt-label');
      if (label) label.textContent = on ? 'Daylight' : 'Midnight';
      toast(on ? 'Midnight tasting, by candlelight.' : 'Daylight returns to the atelier.');
    });
  });

  /* ---------- nav ---------- */
  var navToggle = d.querySelector('.nav-toggle');
  var nav = d.querySelector('.site-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ---------- scroll reveals ---------- */
  var reveals = d.querySelectorAll('.rv, .rv-left, .rv-scale, .rv-mask');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });

    var engravings = d.querySelectorAll('.engraving');
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('drawn'); io2.unobserve(en.target); }
      });
    }, { threshold: 0.3 });
    engravings.forEach(function (el) { io2.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
    d.querySelectorAll('.engraving').forEach(function (el) { el.classList.add('drawn'); });
  }

  /* ---------- reading progress ---------- */
  var bar = d.querySelector('.progress-veil span');
  if (bar) {
    var onScroll = function () {
      var h = d.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    };
    d.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* ---------- ink-bleed internal page transitions ---------- */
  var veil = d.querySelector('.veil');
  d.querySelectorAll('a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href || a.target === '_blank' || a.hasAttribute('download') ||
        href.indexOf('http') === 0 || href.indexOf('mailto:') === 0 || href.indexOf('#') === 0) return;
    if (/^(mailto|tel)/.test(href)) return;
    a.addEventListener('click', function (ev) {
      if (!veil) return;
      var r = a.getBoundingClientRect();
      veil.style.setProperty('--vx', (r.left + r.width / 2) + 'px');
      veil.style.setProperty('--vy', (r.top + r.height / 2) + 'px');
      veil.classList.add('on');
      ev.preventDefault();
      setTimeout(function () { d.location.href = href; }, 420);
    });
  });
  if (veil) {
    veil.classList.add('gone');
    window.addEventListener('pageshow', function () {
      veil.classList.remove('on'); veil.classList.add('gone');
    });
  }

  /* ---------- demo forms ---------- */
  d.querySelectorAll('form[data-demo]').forEach(function (form) {
    var note = form.getAttribute('data-demo');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var field = f.closest('.field');
        var bad = !f.value.trim() || (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
        if (field) field.classList.toggle('invalid', bad);
        var err = field && field.querySelector('.err');
        if (err) err.textContent = bad ? 'This field needs a value.' : '';
        if (bad) ok = false;
      });
      if (ok) {
        toast(note || 'This form is a demonstration. Nothing was sent.');
        form.reset();
      } else {
        toast('A few fields need attention before anything could be sent.');
      }
    });
  });

  /* ---------- toast ---------- */
  var zone = d.querySelector('.toast-zone');
  function toast(msg) {
    if (!zone) { return; }
    var t = d.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    zone.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 350);
    }, 3400);
  }

  /* ---------- diffuser chime + press N ---------- */
  function chime() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { toast('The chime needs a browser with audio.'); return; }
      var ctx = new AC();
      [523.25, 783.99, 1046.5].forEach(function (f, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.08 / (i + 1), ctx.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4);
        o.connect(g); g.connect(ctx.destination);
        o.start(ctx.currentTime + i * 0.06); o.stop(ctx.currentTime + 2.6);
      });
      setTimeout(function () { ctx.close(); }, 2800);
      toast('The diffuser hums. Something resinous, something green.');
    } catch (e) { toast('The chime needs a browser with audio.'); }
  }
  d.addEventListener('keydown', function (ev) {
    if (ev.key === 'n' || ev.key === 'N') {
      if (ev.target && /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName)) return;
      chime();
    }
  });
  d.querySelectorAll('[data-chime]').forEach(function (b) { b.addEventListener('click', chime); });

  /* ---------- footer year ---------- */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
