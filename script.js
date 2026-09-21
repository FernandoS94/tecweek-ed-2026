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

// ===== Cinco experiencias: tarjetas con flip =====
document.querySelectorAll('.exp-visual').forEach((card) => {
  const toggle = () => {
    const isFlipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-pressed', String(isFlipped));
  };

  card.addEventListener('click', toggle);

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      toggle();
    }
  });
});

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
