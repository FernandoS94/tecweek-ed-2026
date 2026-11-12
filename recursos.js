// Recursos: la página muestra 4 tarjetas; cada una abre su "interior" (Salas TEC, Asistente IA, etc.).
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
})();
