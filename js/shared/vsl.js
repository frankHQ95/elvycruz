/* ============================================================
   Finanzas con Visión — vsl.js (compartido por landings de servicio)
   ============================================================ */
(function () {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const WA_NUMBER = '525559544198';

  /* Año en footer */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Header + barra de progreso */
  const header = $('#header');
  const progress = $('#scrollProgress');
  const onScroll = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 12);
    if (progress) {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Menú móvil */
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

  /* Reveal on scroll */
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

  /* Contadores animados */
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

  /* Modal de video VSL */
  const videoWrap = $('#videoWrap');
  const modal = $('#videoModal');
  const modalBody = $('#videoModalBody');
  if (videoWrap && modal && modalBody) {
    const src = videoWrap.dataset.video || '';
    const open = () => {
      if (src) {
        // Si es URL de YouTube/Vimeo => iframe; si es archivo mp4 => <video>
        if (/\.mp4($|\?)/i.test(src)) {
          modalBody.innerHTML = `<video src="${src}" controls autoplay playsinline></video>`;
        } else {
          const sep = src.includes('?') ? '&' : '?';
          modalBody.innerHTML = `<iframe src="${src}${sep}autoplay=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
        }
      } else {
        modalBody.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;text-align:center;padding:2rem;font-family:var(--font-body)">Aquí irá el video de ventas (VSL).<br>Agrega la URL en <code>data-video</code> del bloque del video.</div>`;
      }
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      modal.classList.remove('open');
      modalBody.innerHTML = '';
      document.body.style.overflow = '';
    };
    videoWrap.addEventListener('click', open);
    $('#videoClose')?.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
  }

  /* Herramientas interactivas (calculadoras / simulador) */
  const fmtMX = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
  function animateMoney(el, end, dur) {
    if (!el) return;
    const start = +String(el.textContent).replace(/[^0-9.-]/g, '') || 0;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / (dur || 650), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmtMX.format(Math.round(start + (end - start) * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const fvAnnuity = (P, i, n, PV) => (PV || 0) * Math.pow(1 + i, n) + (i > 0 ? P * ((Math.pow(1 + i, n) - 1) / i) : P * n);

  // Calculadora de retiro
  const cEdad = $('#cEdad');
  if (cEdad) {
    const cRet = $('#cRet'), cAporte = $('#cAporte');
    const run = () => {
      let e = +cEdad.value, r = +cRet.value;
      if (r <= e) { r = e + 1; cRet.value = r; }
      $('#cEdadOut').textContent = e; $('#cRetOut').textContent = r;
      animateMoney($('#cTotal'), fvAnnuity(Math.max(0, +cAporte.value || 0), 0.09 / 12, (r - e) * 12, 0));
    };
    [cEdad, cRet, cAporte].forEach(el => el.addEventListener('input', run));
    run();
  }

  // Calculadora de suma asegurada (seguro de vida)
  const sIngreso = $('#sIngreso');
  if (sIngreso) {
    const sAnios = $('#sAnios');
    const run = () => {
      $('#sAniosOut').textContent = sAnios.value;
      animateMoney($('#sTotal'), Math.max(0, +sIngreso.value || 0) * 12 * (+sAnios.value));
    };
    [sIngreso, sAnios].forEach(el => el.addEventListener('input', run));
    run();
  }

  // Simulador de crecimiento (inversión)
  const gAporte = $('#gAporte');
  if (gAporte) {
    const gInicial = $('#gInicial');
    const run = () => {
      const P = Math.max(0, +gAporte.value || 0), PV = Math.max(0, +gInicial.value || 0), i = 0.10 / 12;
      animateMoney($('#g5'), fvAnnuity(P, i, 60, PV));
      animateMoney($('#g10'), fvAnnuity(P, i, 120, PV));
      animateMoney($('#g20'), fvAnnuity(P, i, 240, PV));
    };
    [gAporte, gInicial].forEach(el => el.addEventListener('input', run));
    run();
  }

  /* Formulario de leads -> guardar + WhatsApp + gracias */
  // Para guardar los leads: pega aquí la URL de tu Google Apps Script (Web App).
  // Déjalo vacío para no guardar (el lead igual llega por WhatsApp).
  const LEAD_ENDPOINT = '';

  const form = $('#leadForm');
  if (form) {
    const servicio = form.dataset.servicio || 'una asesoría';
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const nombre = $('#nombre'), whatsapp = $('#whatsapp');
      let ok = true;
      [nombre, whatsapp].forEach(f => {
        if (!f) return;
        const invalid = !f.value.trim() || (f.id === 'whatsapp' && f.value.replace(/\D/g, '').length < 10);
        f.classList.toggle('error', invalid);
        if (invalid) ok = false;
      });
      if (!ok) { (nombre.classList.contains('error') ? nombre : whatsapp).focus(); return; }

      // Guardar lead (si hay endpoint configurado)
      if (LEAD_ENDPOINT) {
        try {
          fetch(LEAD_ENDPOINT, {
            method: 'POST', mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ nombre: nombre.value, whatsapp: whatsapp.value, servicio, origen: location.pathname, fecha: new Date().toISOString() })
          });
        } catch (e) { /* no bloquear la conversión */ }
      }

      const msg = `Hola Elvia, vi tu información sobre *${servicio}* y quiero agendar mi asesoría gratuita.%0A%0A` +
        `*Nombre:* ${encodeURIComponent(nombre.value)}%0A*WhatsApp:* ${encodeURIComponent(whatsapp.value)}`;

      const success = $('#formSuccess');
      if (success) success.hidden = false;
      if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: servicio });

      window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
      setTimeout(() => { window.location.href = 'gracias.html?s=' + encodeURIComponent(servicio); }, 700);
    });
  }

  /* Tracking de CTAs */
  $$('[data-cta]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof window.fbq === 'function') window.fbq('trackCustom', 'CTAClick', { cta: btn.dataset.cta });
    });
  });
})();
