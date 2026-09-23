/* =========================================================================
   vSApp Ltda. — JavaScript principal (vanilla, sin dependencias)
   Módulos:
   1. Navbar flotante: efecto de scroll + panel lateral desplegable desde la izquierda
   2. Smooth scroll para anclas (fallback / offset por navbar fija)
   3. Animaciones on-scroll con Intersection Observer
   4. Contador animado de estadísticas ("Sobre vSApp")
   5. Botón "volver arriba"
   6. Validación del formulario de contacto
   7. Año dinámico en el footer
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollSpy();
  initHeroNetwork();
  initSmoothScroll();
  initScrollAnimations();
  initStatCounters();
  initLogoCarousel();
  initBackToTop();
  initContactForm();
  initFooterYear();
});

/* -------------------------------------------------------------------------
   1. NAVBAR: efecto de scroll + menú hamburguesa responsive
   ------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const backdrop = document.getElementById('navBackdrop');

  if (!navbar) return;

  // Refuerza el fondo de la píldora flotante cuando el usuario baja de 40px
  const onScroll = () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (!toggle || !menu) return;

  // Panel lateral desplegable desde la izquierda
  const setOpen = (open) => {
    navbar.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
  };

  toggle.addEventListener('click', () => setOpen(!navbar.classList.contains('is-open')));
  if (backdrop) backdrop.addEventListener('click', () => setOpen(false));

  // Cierra el panel al seleccionar un link
  menu.querySelectorAll('.navbar__link').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  // Cierra con Escape y devuelve el foco al botón
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navbar.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}

/* -------------------------------------------------------------------------
   1a. SCROLL-SPY: marca en el navbar la sección visible; en escritorio un indicador
   se desliza hasta el enlace activo. Las secciones que no están en el menú
   (HOME, "Por qué vSApp") no marcan ningún enlace.
   ------------------------------------------------------------------------- */
function initScrollSpy() {
  const menu = document.getElementById('navMenu');
  const indicator = menu && menu.querySelector('.navbar__indicator');
  if (!menu) return;

  const links = [...menu.querySelectorAll('.navbar__link')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  if (!links.length || !sections.length) return;

  const linkById = new Map(links.map((link) => [link.getAttribute('href').slice(1), link]));
  const PAD = 3; // el indicador sobresale unos px del enlace
  let activeId = null;

  const placeIndicator = () => {
    if (!indicator) return;
    const link = linkById.get(activeId);
    if (!link || getComputedStyle(indicator).display === 'none') {
      indicator.style.opacity = '0';
      return;
    }
    // Primera aparición: se ubica sin animar para que no "vuele" desde la esquina
    const instant = indicator.style.opacity !== '1';
    if (instant) indicator.classList.add('is-instant');
    indicator.style.width = `${link.offsetWidth + PAD * 2}px`;
    indicator.style.height = `${link.offsetHeight + PAD * 2}px`;
    indicator.style.transform = `translate(${link.offsetLeft - PAD}px, ${link.offsetTop - PAD}px)`;
    indicator.style.opacity = '1';
    if (instant) {
      void indicator.offsetWidth;
      indicator.classList.remove('is-instant');
    }
  };

  const setActive = (id) => {
    if (id === activeId) return;
    activeId = id;
    links.forEach((link) => {
      const isActive = link === linkById.get(id);
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    placeIndicator();
  };

  const update = () => {
    const line = window.innerHeight * 0.35;
    let current = null;
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= line) current = section.id;
    });
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) current = sections[sections.length - 1].id;
    setActive(linkById.has(current) ? current : null);
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }, { passive: true });

  window.addEventListener('resize', () => { placeIndicator(); update(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeIndicator);

  update();
}

/* -------------------------------------------------------------------------
   1b. FONDO DEL HERO: red de nodos animada que reacciona al mouse
   Se pausa cuando el hero no está visible; con movimiento reducido dibuja un solo cuadro.
   ------------------------------------------------------------------------- */
function initHeroNetwork() {
  const hero = document.getElementById('home');
  const canvas = document.getElementById('heroCanvas');
  if (!hero || !canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LINK_DIST = 150;
  const POINTER_DIST = 190;
  const pointer = { x: null, y: null };
  let width = 0;
  let height = 0;
  let nodes = [];
  let rafId = null;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(30, Math.min(110, Math.round((width * height) / 14000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.8,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    for (const n of nodes) {
      if (!reduceMotion) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }
    }

    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DIST) {
          ctx.strokeStyle = `rgba(43, 182, 163, ${(1 - d / LINK_DIST) * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      if (pointer.x !== null) {
        const d = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        if (d < POINTER_DIST) {
          ctx.strokeStyle = `rgba(120, 220, 255, ${(1 - d / POINTER_DIST) * 0.55})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = 'rgba(160, 235, 225, 0.85)';
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const loop = () => {
    draw();
    rafId = requestAnimationFrame(loop);
  };
  const start = () => { if (rafId === null && !reduceMotion) loop(); };
  const stop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  resize();
  draw();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); draw(); }, 150);
  });

  if (reduceMotion) return;

  hero.addEventListener('mousemove', (event) => {
    const rect = hero.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  });
  hero.addEventListener('mouseleave', () => { pointer.x = null; pointer.y = null; });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
    }).observe(hero);
  } else {
    start();
  }
}

/* -------------------------------------------------------------------------
   2. SMOOTH SCROLL con compensación de la altura de la navbar fija
   ------------------------------------------------------------------------- */
function initSmoothScroll() {
  const navbar = document.getElementById('navbar');
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;

      window.scrollTo({ top: targetPosition, behavior: 'smooth' });

      // Actualiza la URL sin saltar (accesibilidad + navegación con teclado)
      history.pushState(null, '', targetId);
    });
  });
}

/* -------------------------------------------------------------------------
   3. ANIMACIONES ON-SCROLL (fade-in / fade-up discretos vía Intersection Observer)
   ------------------------------------------------------------------------- */
function initScrollAnimations() {
  const animatedEls = document.querySelectorAll('[data-animate]');
  if (!animatedEls.length) return;

  // Si el navegador no soporta IO, muestra todo de inmediato
  if (!('IntersectionObserver' in window)) {
    animatedEls.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // anima una sola vez
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  animatedEls.forEach((el) => observer.observe(el));
}

/* -------------------------------------------------------------------------
   4. CONTADOR ANIMADO DE ESTADÍSTICAS (sección "Sobre vSApp")
   ------------------------------------------------------------------------- */
function initStatCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const duration = 1200; // ms
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach((el) => { el.textContent = el.getAttribute('data-count'); });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* -------------------------------------------------------------------------
   4b. COLLAGE DE LOGOS: cada columna se duplica las veces necesarias para un loop
   continuo sin saltos; la velocidad se fija en px/s para que todas se muevan parejo.
   ------------------------------------------------------------------------- */
function initLogoCarousel() {
  const viewport = document.querySelector('.logo-carousel__viewport');
  if (!viewport) return;

  const tracks = [...viewport.querySelectorAll('.logo-carousel__track')];
  if (!tracks.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const SPEEDS = [26, 34, 22]; // px por segundo, distinto por columna

  const build = () => {
    viewport.classList.add('is-animated');
    const viewportHeight = viewport.clientHeight;

    tracks.forEach((track, index) => {
      track.querySelectorAll('[data-clone]').forEach((el) => el.remove());

      const group = track.querySelector('.logo-carousel__group');
      const distance = group.offsetHeight;
      if (!distance) return;

      const copies = Math.ceil(viewportHeight / distance) + 1;
      for (let i = 0; i < copies; i++) {
        const clone = group.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('data-clone', '');
        track.appendChild(clone);
      }

      track.style.setProperty('--loop-distance', `${distance}px`);
      track.style.setProperty('--loop-duration', `${distance / SPEEDS[index % SPEEDS.length]}s`);
    });
  };

  build();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 200);
  });
}

/* -------------------------------------------------------------------------
   5. BOTÓN "VOLVER ARRIBA"
   ------------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* -------------------------------------------------------------------------
   6. VALIDACIÓN DEL FORMULARIO DE CONTACTO
   El envío se simula localmente (sin backend). Para conectar un envío real,
   reemplazar la función `submitForm()` por una llamada fetch() a un endpoint,
   o por una redirección `mailto:` con los datos precargados.
   ------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const status = document.getElementById('formStatus');

  const validators = {
    name: (value) => value.trim().length >= 3 || 'Ingresa tu nombre completo (mínimo 3 caracteres).',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || 'Ingresa un correo electrónico válido.',
    subject: (value) => value !== '' || 'Selecciona un motivo de contacto.',
    message: (value) => value.trim().length >= 10 || 'Cuéntanos un poco más (mínimo 10 caracteres).',
  };

  const showError = (fieldName, message) => {
    const field = form.elements[fieldName];
    const errorEl = document.getElementById(`${fieldName}Error`);
    field.closest('.form-field').classList.toggle('has-error', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
  };

  const validateField = (fieldName) => {
    const field = form.elements[fieldName];
    const validator = validators[fieldName];
    if (!field || !validator) return true;

    const result = validator(field.value);
    const isValid = result === true;
    showError(fieldName, isValid ? '' : result);
    return isValid;
  };

  // Validación en vivo al salir de cada campo
  Object.keys(validators).forEach((fieldName) => {
    const field = form.elements[fieldName];
    if (field) {
      field.addEventListener('blur', () => validateField(fieldName));
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const isFormValid = Object.keys(validators)
      .map(validateField)
      .every(Boolean);

    if (!isFormValid) {
      status.textContent = 'Por favor corrige los campos marcados antes de enviar.';
      status.className = 'form-status is-error';
      return;
    }

    submitForm(form, status);
  });
}

function submitForm(form, status) {
  // Envío simulado: en producción, reemplazar por fetch() a un backend/API,
  // o por un enlace mailto: con los datos del formulario precargados.
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';

  setTimeout(() => {
    status.textContent = '¡Gracias! Tu mensaje fue enviado correctamente. Te contactaremos a la brevedad.';
    status.className = 'form-status is-success';
    form.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar mensaje';
  }, 900);
}

/* -------------------------------------------------------------------------
   7. AÑO DINÁMICO EN EL FOOTER
   ------------------------------------------------------------------------- */
function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
