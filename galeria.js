// ===== Galería "Así se vivió la Tecweek ED" =====
// Carrusel con flechas (y deslizar con el dedo / trackpad). Las fotos se leen de assets/galeria/galeria-01.webp, galeria-02.webp… (ver data-* en #galeria).
// Mientras data-fotos="false" se muestran cuadros de ejemplo; al subir las fotos, ponerlo en "true".
(() => {
  const root = document.getElementById('galeria');
  const track = document.getElementById('galTrack');
  if (!root || !track) return;

  const total = parseInt(root.dataset.total, 10) || 0;
  if (!total) { root.hidden = true; return; }

  const carpeta = root.dataset.carpeta || 'assets/galeria/';
  const ext = root.dataset.ext || 'webp';
  const conFotos = root.dataset.fotos === 'true';
  const pad = (n) => String(n).padStart(2, '0');
  const srcOf = (i) => `${carpeta}galeria-${pad(i)}.${ext}`;
  const altOf = (i) => `Foto ${i} de ${total} de la Tecweek ED`;

  function makeItem(i) {
    const el = document.createElement(conFotos ? 'button' : 'div');
    el.className = 'gal-item' + (conFotos ? '' : ' gal-item--ph');
    el.dataset.i = i;
    if (conFotos) {
      el.type = 'button';
      el.setAttribute('aria-label', `Ampliar: ${altOf(i)}`);
      const img = document.createElement('img');
      img.src = srcOf(i);
      img.alt = altOf(i);
      img.width = 1200; img.height = 800;
      img.loading = i <= 3 ? 'eager' : 'lazy'; img.decoding = 'async';
      el.appendChild(img);
    }
    return el;
  }
  const frag = document.createDocumentFragment();
  for (let i = 1; i <= total; i++) frag.appendChild(makeItem(i));
  track.appendChild(frag);

  // --- Flechas izquierda / derecha ---
  const view = track.parentElement;            // .gal-marquee (el que scrollea)
  const prev = document.getElementById('galPrev');
  const next = document.getElementById('galNext');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const step = () => {
    const it = track.querySelector('.gal-item');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const w = it ? it.getBoundingClientRect().width + gap : view.clientWidth;
    // avanza de a "una pantalla" de fotos enteras (mínimo una)
    return w * Math.max(1, Math.floor(view.clientWidth / w));
  };
  const go = (dir) => view.scrollBy({ left: dir * step(), behavior: reduce.matches ? 'auto' : 'smooth' });
  function sync() {
    const max = view.scrollWidth - view.clientWidth - 2;
    if (prev) prev.disabled = view.scrollLeft <= 2;
    if (next) next.disabled = view.scrollLeft >= max;
  }
  if (prev) prev.addEventListener('click', () => go(-1));
  if (next) next.addEventListener('click', () => go(1));
  view.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  window.addEventListener('load', sync);
  sync();

  // --- Foto ampliada ---
  const dlg = document.getElementById('galLightbox');
  if (!conFotos || !dlg || typeof dlg.showModal !== 'function') return;
  const lbImg = dlg.querySelector('img');
  const lbCount = dlg.querySelector('.gal-lb-count');
  let current = 1;

  function show(i) {
    current = ((i - 1 + total) % total) + 1;
    lbImg.src = srcOf(current);
    lbImg.alt = altOf(current);
    lbCount.textContent = `${current} / ${total}`;
  }
  track.addEventListener('click', (e) => {
    const item = e.target.closest('button.gal-item');
    if (!item) return;
    show(parseInt(item.dataset.i, 10));
    dlg.showModal();
  });
  dlg.querySelector('[data-gal-prev]').addEventListener('click', () => show(current - 1));
  dlg.querySelector('[data-gal-next]').addEventListener('click', () => show(current + 1));
  dlg.querySelector('[data-gal-close]').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });   // clic en el fondo
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
})();
