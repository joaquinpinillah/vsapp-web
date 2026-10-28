/* Animación de carga común a todas las páginas:
   1) Pantalla esqueleto mientras carga (se retira al terminar la carga, o a los 6 s como máximo).
   2) Cada bloque de contenido aparece al entrar en pantalla, de arriba hacia abajo. */
(function () {
  const skel = document.getElementById('vsSkel');
  const hideSkel = () => {
    if (!skel || skel.classList.contains('done')) return;
    skel.classList.add('done');
    setTimeout(() => skel.remove(), 450);
  };
  if (document.readyState === 'complete') hideSkel();
  else window.addEventListener('load', hideSkel);
  setTimeout(hideSkel, 6000);

  // Navbar: un recuadro se desliza hasta el link bajo el cursor
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.v-navbar nav, .nav-row').forEach((host) => {
      const links = Array.from(host.querySelectorAll(':scope > a'));
      if (!links.length) return;
      host.classList.add('vs-ind-host');
      const ind = document.createElement('span');
      ind.className = 'vs-ind';
      ind.setAttribute('aria-hidden', 'true');
      host.prepend(ind);
      const PAD = 3;
      links.forEach((link) => link.addEventListener('mouseenter', () => {
        const first = ind.style.opacity !== '1';
        ind.classList.toggle('instant', first);
        ind.style.width = link.offsetWidth + PAD * 2 + 'px';
        ind.style.height = link.offsetHeight + PAD * 2 + 'px';
        ind.style.transform = `translate(${link.offsetLeft - PAD}px, ${link.offsetTop - PAD}px)`;
        ind.style.opacity = '1';
      }));
      host.addEventListener('mouseleave', () => { ind.style.opacity = '0'; });
    });
  }

  if (!('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js-motion');

  // Bloques: los hijos del contenedor de cada sección; si un hijo es una fila o grilla de tarjetas, sus tarjetas
  const blocks = [];
  document.querySelectorAll('section').forEach((sec) => {
    const containers = Array.from(sec.children).filter((el) => el.children.length && getComputedStyle(el).position !== 'absolute');
    containers.forEach((box) => {
      let i = 0;
      Array.from(box.children).forEach((el) => {
        if (el.matches('script, style, [aria-hidden="true"]') || getComputedStyle(el).position === 'absolute') return;
        const disp = getComputedStyle(el).display;
        const kids = Array.from(el.children).filter((k) => getComputedStyle(k).position !== 'absolute');
        const row = /flex|grid/.test(disp) && kids.length >= 2 && kids.length <= 8 && !el.querySelector('[role="tablist"]');
        (row ? kids : [el]).forEach((t) => {
          t.setAttribute('data-rv', '');
          t.style.setProperty('--rv-d', Math.min(i++, 6) * 90 + 'ms');
          blocks.push(t);
        });
      });
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.setAttribute('data-rv', 'in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  blocks.forEach((b) => io.observe(b));
})();
