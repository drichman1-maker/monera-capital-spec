// Monera Capital — spec redesign interactions
(function () {
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduced) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // Count-up numbers
  var counters = document.querySelectorAll('[data-count]');
  var runCount = function (el) {
    var raw = el.getAttribute('data-count');
    var target = parseFloat(raw);
    var decimals = (raw.split('.')[1] || '').length;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var fmt = function (v) { return prefix + v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix; };
    if (reduced) { el.textContent = fmt(target); return; }
    var dur = 1500, start = null;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(runCount);
  }

  // Nav: hairline + compact once scrolled
  var nav = document.querySelector('.nav');
  var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 12); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav
  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    var close = function () {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    };
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    links.addEventListener('click', function (e) { if (e.target.tagName === 'A') close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  // Eligibility check — uses Monera's published minimums:
  //   most products: 1+ year in business and $10,000+/month revenue
  //   revenue-based financing: 4+ months and $7,500+/month revenue
  var form = document.getElementById('elig');
  if (form) {
    var rev = document.getElementById('rev');
    var revOut = document.getElementById('rev-out');
    var result = document.getElementById('elig-result');
    var titleOut = document.getElementById('elig-title-out');
    var bodyOut = document.getElementById('elig-body-out');
    var iconUse = document.getElementById('elig-icon-use');
    var fmtUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    var update = function () {
      var r = Number(rev.value);
      var max = Number(rev.max);
      rev.style.setProperty('--p', (r / max) * 100 + '%');
      revOut.textContent = fmtUsd.format(r) + (r >= max ? '+' : '');

      var checked = form.querySelector('input[name="tib"]:checked');
      var months = checked ? Number(checked.value) : 0;

      var state, title, body, icon;
      if (months >= 12 && r >= 10000) {
        state = 'is-ok'; icon = '#i-check';
        title = 'You meet our basic requirements.';
        body = 'Most applicants get a decision in 4–8 hours.';
      } else if (months >= 4 && r >= 7500) {
        state = 'is-maybe'; icon = '#i-trend';
        title = 'You may qualify for revenue-based financing.';
        body = 'Available from 4 months in business and $7,500+ in monthly revenue.';
      } else {
        state = 'is-no'; icon = '#i-phone';
        title = 'Let’s talk it through.';
        body = 'Most products need 1+ year in business and $10,000+ in monthly revenue. Call 1‑833‑624‑3863 to explore your options.';
      }
      result.className = 'elig-result ' + state;
      titleOut.textContent = title;
      bodyOut.textContent = body;
      iconUse.setAttribute('href', icon);
    };

    form.addEventListener('input', update);
    form.addEventListener('change', update);
    update();
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
