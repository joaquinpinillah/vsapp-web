/* Portada del Inicio: navbar flotante que toma fondo al bajar, y red de nodos animada
   que reacciona al mouse (se pausa cuando la portada no está visible). */
(function () {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const hero = document.getElementById('inicio');
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
    if (!reduceMotion) {
      for (const n of nodes) {
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

  const loop = () => { draw(); rafId = requestAnimationFrame(loop); };
  const start = () => { if (rafId === null && !reduceMotion) loop(); };
  const stop = () => { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } };

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
    new IntersectionObserver((entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop()))).observe(hero);
  } else {
    start();
  }
})();
