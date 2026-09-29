// ===== Acordeón FAQ =====
document.querySelectorAll('.accordion-trigger').forEach((btn) => {
  btn.addEventListener('click', () => {
    const panel = btn.nextElementSibling;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    // Cierra los demás (comportamiento tipo acordeón simple)
    document.querySelectorAll('.accordion-trigger').forEach((otherBtn) => {
      if (otherBtn !== btn) {
        otherBtn.setAttribute('aria-expanded', 'false');
        otherBtn.nextElementSibling.style.maxHeight = null;
      }
    });

    if (isOpen) {
      btn.setAttribute('aria-expanded', 'false');
      panel.style.maxHeight = null;
    } else {
      btn.setAttribute('aria-expanded', 'true');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
});

// ===== Cuenta regresiva =====
// 30 de octubre de 2026, 8:00 h, horario de Buenos Aires (UTC-3)
const EVENT_DATE = new Date('2026-10-30T08:00:00-03:00');

// Guarda el último valor mostrado de cada unidad para saber cuándo animarla
const lastCountdownValues = { days: null, hours: null, minutes: null, seconds: null };

function setCountdownField(id, value, key) {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = value;

  if (lastCountdownValues[key] !== null && lastCountdownValues[key] !== value) {
    // Reinicia la animación aunque el valor cambie dos veces seguidas rápido
    el.classList.remove('is-tick');
    void el.offsetWidth; // fuerza reflow
    el.classList.add('is-tick');
  }
  lastCountdownValues[key] = value;
}

function updateCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;

  const now = new Date();
  const diff = EVENT_DATE - now;

  if (diff <= 0) {
    el.classList.add('is-finished');
    setCountdownField('cd-days', '00', 'days');
    setCountdownField('cd-hours', '00', 'hours');
    setCountdownField('cd-minutes', '00', 'minutes');
    setCountdownField('cd-seconds', '00', 'seconds');
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const pad = (n) => String(n).padStart(2, '0');

  setCountdownField('cd-days', pad(days), 'days');
  setCountdownField('cd-hours', pad(hours), 'hours');
  setCountdownField('cd-minutes', pad(minutes), 'minutes');
  setCountdownField('cd-seconds', pad(seconds), 'seconds');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ===== Carrusel Premium TECWeek =====
// Bucle continuo: después de la última tarjeta vuelve a pasar la primera, siempre hacia adelante.
// Truco: se agrega al final una copia de la primera tarjeta. Al pasar de la última, el carrusel se
// desliza hasta esa copia y, cuando llega, se reubica en la primera real sin animación (no se nota).

(() => {

  const track = document.getElementById('expTrack');
  if (!track) return;

  const slides = Array.from(track.children);          // las tarjetas reales
  const total = slides.length;

  const clone = slides[0].cloneNode(true);            // copia de la primera, sólo visual
  clone.classList.add('is-clone');
  clone.setAttribute('aria-hidden', 'true');
  clone.setAttribute('inert', '');
  track.appendChild(clone);
  const all = [...slides, clone];

  const dots = Array.from(document.querySelectorAll('[data-exp-dot]'));

  const prevBtn = document.querySelector('[data-exp-prev]');
  const nextBtn = document.querySelector('[data-exp-next]');

  const progress = document.getElementById('expProgress');

  let current = 0;
  let autoplay;
  let looping = false;       // true mientras se desliza hacia la copia
  let loopPoll;

  // Si la persona pidió "reducir movimiento" en su sistema: sin autoplay y sin desplazamiento animado
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function updateUI(index, onClone = false){

    all.forEach((slide,i)=>{
      slide.classList.toggle('is-active', i===index || (i===total && onClone));
    });

    dots.forEach((dot,i)=>{
      const active = i===index;
      dot.classList.toggle('is-active',active);
      dot.setAttribute('aria-selected',active);
    });

    if(progress){
      progress.style.width =
        `${((index+1)/total)*100}%`;
    }
  }

  // Posición que deja al slide centrado dentro del track (usa medidas reales, no estimaciones)
  function centerLeft(i){
    const slide = all[i];
    return slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;
  }

  // Salto instantáneo (sin animación ni "imán" del scroll-snap)
  function instantScroll(left){
    track.style.scrollBehavior = 'auto';
    track.style.scrollSnapType = 'none';
    track.scrollLeft = left;
    void track.offsetWidth;                 // fuerza el reflow antes de restaurar
    track.style.scrollSnapType = '';
    track.style.scrollBehavior = '';
  }

  function cancelLoop(){
    clearInterval(loopPoll);
    looping = false;
  }

  // Espera a que el desplazamiento animado llegue a destino y se detenga
  function whenScrollArrives(target, done){
    let last = track.scrollLeft;
    let still = 0;
    let waited = 0;
    clearInterval(loopPoll);
    loopPoll = setInterval(()=>{
      waited += 60;
      const x = track.scrollLeft;
      still = Math.abs(x - last) < 0.5 ? still + 1 : 0;
      last = x;
      if ((Math.abs(x - target) < 6 && still >= 2) || waited > 2500){
        clearInterval(loopPoll);
        done();
      }
    }, 60);
  }

  // Lleva una tarjeta a su estado de reposo sin animación (foto sin zoom, texto oculto).
  // Así la primera real y su copia arrancan exactamente igual y el reemplazo no se nota.
  function resetSlideState(slide){
    const els = [
      slide,
      slide.querySelector('.exp-slide-photo'),
      ...slide.querySelectorAll('.exp-slide-copy > *')
    ].filter(Boolean);
    els.forEach(el => { el.style.transition = 'none'; });
    void slide.offsetWidth;                 // fuerza el reflow con las transiciones apagadas
    els.forEach(el => { el.style.transition = ''; });
  }

  // Ya está sobre la copia: reubicar en la primera real (idéntica, no se nota)
  function landOnFirst(){
    looping = false;
    current = 0;
    instantScroll(centerLeft(0));
    updateUI(0);
  }

  function goTo(index,behavior='smooth'){

    cancelLoop();

    const animated = !reduceMotion.matches && behavior === 'smooth';

    // Adelante desde la última → la primera entra por la derecha (vía la copia)
    if (index >= total){
      if (!animated){
        current = 0;
        instantScroll(centerLeft(0));
        updateUI(0);
        return;
      }
      current = 0;
      looping = true;
      const target = centerLeft(total);
      resetSlideState(slides[0]);
      track.scrollTo({ left: target, behavior: 'smooth' });
      updateUI(0, true);
      whenScrollArrives(target, landOnFirst);
      return;
    }

    // Atrás desde la primera → salta directo a la última
    if (index < 0){
      current = total - 1;
      instantScroll(centerLeft(current));
      updateUI(current);
      return;
    }

    current = index;

    if (animated){
      track.scrollTo({ left: centerLeft(current), behavior: 'smooth' });
    } else {
      instantScroll(centerLeft(current));
    }

    updateUI(current);
  }

  prevBtn?.addEventListener(
    'click',
    ()=>goTo(current-1)
  );

  nextBtn?.addEventListener(
    'click',
    ()=>goTo(current+1)
  );

  dots.forEach((dot,i)=>{
    dot.addEventListener(
      'click',
      ()=>goTo(i)
    );
  });

  track.addEventListener('keydown',(e)=>{

    if(e.key==='ArrowRight'){
      e.preventDefault();
      goTo(current+1);
    }

    if(e.key==='ArrowLeft'){
      e.preventDefault();
      goTo(current-1);
    }

  });

  let scrollTimeout;

  track.addEventListener('scroll',()=>{

    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(()=>{

      if (looping) return;      // el bucle automático se encarga solo

      // Slide cuyo centro queda más cerca del centro visible del track
      const viewCenter = track.scrollLeft + track.clientWidth / 2;
      let nearest = 0;
      let best = Infinity;

      all.forEach((slide,i)=>{
        const d = Math.abs(
          slide.offsetLeft + slide.offsetWidth / 2 - viewCenter
        );
        if (d < best) { best = d; nearest = i; }
      });

      // Si la persona deslizó a mano hasta la copia, se reubica en la primera real
      if (nearest === total){
        landOnFirst();
        return;
      }

      current = nearest;
      updateUI(current);

    },100);

  });

  function startAutoplay(){

    // No arrancar si se pidió reducir movimiento; y evitar intervalos duplicados
    if (reduceMotion.matches) return;
    clearInterval(autoplay);

    autoplay = setInterval(()=>{
      goTo(current + 1);
    },5000);

  }

  function stopAutoplay(){
    clearInterval(autoplay);
  }

  track.addEventListener(
    'mouseenter',
    stopAutoplay
  );

  track.addEventListener(
    'mouseleave',
    startAutoplay
  );

  window.addEventListener(
    'resize',
    ()=>goTo(current,'auto')
  );

  // Si la persona cambia la preferencia del sistema con la página abierta
  reduceMotion.addEventListener('change', ()=>{
    reduceMotion.matches ? stopAutoplay() : startAutoplay();
  });

  updateUI(0);
  startAutoplay();

})();

// ===== Menú mobile =====
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}
