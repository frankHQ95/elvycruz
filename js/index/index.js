/* ============================================================
   Finanzas con Visión — index.js
   Interacciones: header, menú móvil, reveal, calculadora,
   contadores, formulario de leads -> WhatsApp
   ============================================================ */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
  const WA_NUMBER = '525559544198';

  /* ---------- Año en footer ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header + barra de progreso de scroll ---------- */
  const header = $('#header');
  const progress = $('#scrollProgress');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
    if (progress) {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menú móvil ---------- */
  const toggle = $('#navToggle');
  const nav = $('#nav');
  if (toggle && nav) {
    const closeNav = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); };
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('a', nav).forEach(a => a.addEventListener('click', closeNav));
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = e.target.dataset.delay || 0;
          setTimeout(() => e.target.classList.add('is-visible'), delay);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Contadores animados ---------- */
  const counters = $$('.stat-num');
  if ('IntersectionObserver' in window && counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        if (el.dataset.text) { el.textContent = el.dataset.text; cio.unobserve(el); return; }
        const target = +el.dataset.count;
        const suffix = el.dataset.suffix || '';
        const dur = 1400; const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  }

  /* ---------- Cifra animada del hero ---------- */
  const heroFigure = $('#heroFigure');
  if (heroFigure && 'IntersectionObserver' in window) {
    const hio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const end = +heroFigure.dataset.to;
        const t0 = performance.now(); const dur = 1800;
        const tick = (now) => {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          heroFigure.textContent = fmt.format(Math.round(end * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        hio.unobserve(heroFigure);
      });
    }, { threshold: 0.4 });
    hio.observe(heroFigure);
  }

  /* ---------- Calculadora de retiro ---------- */
  const calc = {
    edad: $('#edad'), retiro: $('#retiro'), aporte: $('#aporte'),
    edadOut: $('#edadOut'), retiroOut: $('#retiroOut'),
    total: $('#calcTotal'), aportado: $('#calcAportado'), rendimiento: $('#calcRendimiento')
  };
  const ANNUAL_RATE = 0.09; // referencial

  function calcular() {
    if (!calc.edad) return;
    let edad = +calc.edad.value;
    let retiro = +calc.retiro.value;
    const aporte = Math.max(0, +calc.aporte.value || 0);

    // El retiro siempre debe ser mayor a la edad actual
    if (retiro <= edad) { retiro = edad + 1; calc.retiro.value = retiro; }

    calc.edadOut.textContent = edad;
    calc.retiroOut.textContent = retiro;

    const meses = (retiro - edad) * 12;
    const i = ANNUAL_RATE / 12;
    // Valor futuro de una anualidad (aportaciones mensuales)
    const fv = i > 0 ? aporte * ((Math.pow(1 + i, meses) - 1) / i) : aporte * meses;
    const aportado = aporte * meses;
    const rendimiento = Math.max(0, fv - aportado);

    animateValue(calc.total, fv);
    calc.aportado.textContent = fmt.format(aportado);
    calc.rendimiento.textContent = fmt.format(rendimiento);
  }

  let rafId;
  function animateValue(el, end) {
    cancelAnimationFrame(rafId);
    const start = parseCurrency(el.textContent) || 0;
    const t0 = performance.now(); const dur = 600;
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt.format(start + (end - start) * eased);
      if (p < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
  }
  const parseCurrency = (s) => +String(s).replace(/[^0-9.-]/g, '');

  if (calc.edad) {
    ['edad', 'retiro', 'aporte'].forEach(k => {
      calc[k].addEventListener('input', calcular);
    });
    calcular();
  }

  /* ---------- Formulario de leads -> guardar + WhatsApp + gracias ---------- */
  // Para guardar los leads: pega la URL de tu Google Apps Script (Web App).
  // Déjalo vacío para no guardar (el lead igual llega por WhatsApp).
  const LEAD_ENDPOINT = '';

  const form = $('#leadForm');
  if (form) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const nombre = $('#nombre'), whatsapp = $('#whatsapp'), interes = $('#interes');
      let ok = true;
      [nombre, whatsapp].forEach(f => {
        const invalid = !f.value.trim() || (f.id === 'whatsapp' && f.value.replace(/\D/g, '').length < 10);
        f.classList.toggle('error', invalid);
        if (invalid) ok = false;
      });
      if (!ok) { (nombre.classList.contains('error') ? nombre : whatsapp).focus(); return; }

      const interesVal = interes ? interes.value : 'Asesoría financiera';

      if (LEAD_ENDPOINT) {
        try {
          fetch(LEAD_ENDPOINT, {
            method: 'POST', mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombre.value, whatsapp: whatsapp.value, servicio: interesVal, fecha: new Date().toISOString() })
          });
        } catch (e) { /* no bloquear la conversión */ }
      }

      const msg = `Hola Elvia, quiero agendar mi asesoría gratuita.%0A%0A` +
        `*Nombre:* ${encodeURIComponent(nombre.value)}%0A` +
        `*WhatsApp:* ${encodeURIComponent(whatsapp.value)}%0A` +
        `*Me interesa:* ${encodeURIComponent(interesVal)}`;

      const success = $('#formSuccess');
      if (success) success.hidden = false;
      if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: interesVal });

      window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
      setTimeout(() => { window.location.href = 'gracias.html?s=' + encodeURIComponent(interesVal); }, 700);
    });
  }

  /* ---------- Tilt sutil en tarjetas de servicio ---------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    $$('.service-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Tracking de CTAs (Meta Pixel) ---------- */
  $$('[data-cta]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof window.fbq === 'function') window.fbq('trackCustom', 'CTAClick', { cta: btn.dataset.cta });
    });
  });
})();
