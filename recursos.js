// Recursos: la página muestra 5 tarjetas; cada una abre su "interior" (Salas TEC, Asistente IA, etc.).
// Se navega con la dirección (recursos.html#asistente-ia), así funciona el botón "Atrás" del navegador
// y se pueden compartir links directos (por ejemplo, en un QR).
(() => {
  const inicio = document.getElementById('recursos-inicio');
  const paneles = Array.from(document.querySelectorAll('.recursos-panel'));
  if (!inicio || !paneles.length) return;

  function mostrar() {
    const id = decodeURIComponent(location.hash.slice(1));
    const panel = paneles.find((p) => p.id === id) || null;
    inicio.hidden = !!panel;
    paneles.forEach((p) => p.classList.toggle('is-off', p !== panel));
    window.scrollTo(0, 0);
    const foco = panel ? panel.querySelector('h2') : inicio.querySelector('h1');
    if (foco) foco.focus({ preventScroll: true });
  }

  window.addEventListener('hashchange', mostrar);
  // "Volver a Recursos": un href="#" solo no dispara hashchange si ya no hay hash, así que se limpia a mano.
  document.querySelectorAll('[data-rback]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', location.pathname + location.search);
    mostrar();
  }));
  if (location.hash) mostrar();

  // Videos: buscador de cada categoría (título, quién habla y descripción; sin distinguir tildes ni mayúsculas).
  const norm = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  document.querySelectorAll('[data-vsearch]').forEach((input) => {
    const panel = input.closest('.recursos-panel');
    const cards = Array.from(panel.querySelectorAll('.video-card'));
    const count = panel.querySelector('[data-vcount]');
    const empty = panel.querySelector('[data-vempty]');
    const textos = cards.map((c) => norm(c.textContent));
    function filtrar() {
      const q = norm(input.value.trim());
      let n = 0;
      cards.forEach((c, i) => {
        const ok = !q || textos[i].includes(q);
        c.hidden = !ok;
        if (ok) n++;
      });
      if (count) count.textContent = 'Mostrando ' + n + ' de ' + cards.length + ' videos.';
      if (empty) empty.hidden = n !== 0;
    }
    input.addEventListener('input', filtrar);
  });
})();

/* "Ver más" en las descripciones de los videos: aparece solo si el texto está cortado. */
(function () {
  var descs = document.querySelectorAll('.video-card .video-desc');
  if (!descs.length) return;
  function medir() {
    descs.forEach(function (d) {
      var b = d.nextElementSibling && d.nextElementSibling.classList.contains('video-more') ? d.nextElementSibling : null;
      var abierta = d.classList.contains('is-open');
      var cortada = abierta || d.scrollHeight > d.clientHeight + 1;
      if (cortada && !b) {
        b = document.createElement('button');
        b.type = 'button'; b.className = 'video-more'; b.textContent = 'Ver más'; b.setAttribute('aria-expanded', 'false');
        b.addEventListener('click', function () {
          var open = d.classList.toggle('is-open');
          b.textContent = open ? 'Ver menos' : 'Ver más';
          b.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        d.parentNode.insertBefore(b, d.nextSibling);
      } else if (!cortada && b) { b.remove(); }
    });
  }
  var t;
  function pedir() { clearTimeout(t); t = setTimeout(medir, 120); }
  window.addEventListener('load', pedir);
  window.addEventListener('resize', pedir);
  window.addEventListener('hashchange', pedir);
  pedir();
})();
