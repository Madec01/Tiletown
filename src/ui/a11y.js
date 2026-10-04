// Accessibilité et confort (adapté de Seve, réduit à ce que le prototype utilise) :
//
//   const a11y = initA11y({ textScale: 1, reducedMotion: false, vibration: true });
//   a11y.apply({ textScale: 1.15 })   applique de nouveaux réglages (classes de <html>, viewport)
//   a11y.vibrate(10)                   petite vibration si l'appareil sait faire et si le réglage l'autorise
//   a11y.reducedMotion()               vrai si les animations doivent être réduites (réglage OU système)
//   a11y.settings                      réglages courants (lecture)
//
// Classes et variables posées sur <html> (lues par css/style.css) :
//   --text-scale     facteur de la taille du texte (html { font-size: calc(16px * var(--text-scale)) })
//   reduced-motion   animations réduites
//   high-contrast    contrastes renforcés (réservé)
//
// Viewport : le jeu installé bloque le zoom à deux doigts de la page (les gestes vont à la carte) ;
// le réglage `pinchZoom: true` le rend au navigateur (WCAG 1.4.4) — la scène garde ses propres gestes.
// Réglages mémorisés dans localStorage (clé `tiletown.a11y`) ; tout est protégé (stockage bloqué, etc.).

const STORE_KEY = 'tiletown.a11y';
const VIEWPORT_LOCKED = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
const VIEWPORT_ZOOM = 'width=device-width, initial-scale=1, viewport-fit=cover';
const TEXT_SCALES = [1, 1.15, 1.3, 1.5];

export const DEFAULT_SETTINGS = Object.freeze({ textScale: 1, reducedMotion: false, highContrast: false, vibration: true, pinchZoom: false });

export function loadSettings() {
  try {
    const v = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    return { ...DEFAULT_SETTINGS, ...(v && typeof v === 'object' ? v : {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(s));
  } catch {
    /* stockage indisponible : les réglages valent pour cette session */
  }
}

/** Facteur de texte valide le plus proche (1 · 1,15 · 1,3 · 1,5). */
export function normalizeTextScale(v) {
  const n = Number(v) || 1;
  return TEXT_SCALES.reduce((best, s) => (Math.abs(s - n) < Math.abs(best - n) ? s : best), TEXT_SCALES[0]);
}

function setViewport(zoom) {
  const meta = document.querySelector('meta[name="viewport"]');
  if (!meta) return;
  const want = zoom ? VIEWPORT_ZOOM : VIEWPORT_LOCKED;
  if (meta.getAttribute('content') !== want) meta.setAttribute('content', want);
}

export function initA11y(overrides = {}) {
  const settings = { ...loadSettings(), ...overrides };
  const root = document.documentElement;
  let systemReduced = false;
  try {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    systemReduced = mq.matches;
    mq.addEventListener?.('change', () => {
      systemReduced = mq.matches;
      apply();
    });
  } catch {
    /* navigateur ancien */
  }

  function apply(patch) {
    if (patch) Object.assign(settings, patch);
    settings.textScale = normalizeTextScale(settings.textScale);
    root.style.setProperty('--text-scale', String(settings.textScale));
    root.dataset.textScale = String(Math.round(settings.textScale * 100));
    root.classList.toggle('reduced-motion', !!settings.reducedMotion || systemReduced);
    root.classList.toggle('high-contrast', !!settings.highContrast);
    setViewport(!!settings.pinchZoom);
    if (patch) saveSettings(settings);
  }

  function vibrate(pattern = 10) {
    if (!settings.vibration) return false;
    try {
      return typeof navigator.vibrate === 'function' ? navigator.vibrate(pattern) : false;
    } catch {
      return false;
    }
  }

  apply();
  return {
    apply,
    vibrate,
    reducedMotion: () => !!settings.reducedMotion || systemReduced,
    get settings() {
      return { ...settings };
    },
  };
}
