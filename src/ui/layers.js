// Onglet « Calques » : feuille coulissante qui choisit le calque coloré posé sur la carte
// (docs/ARCHITECTURE.md §10.4, docs/MOBILE.md « un seul calque actif à la fois »).
//
//   const layers = createLayers({ sheets, renderer, getGame, pill, vibrate, toasts, onChange });
//   layers.open()                 ouvre (ou replie) la feuille des calques
//   layers.set('air')             allume un calque ; 'none' le coupe ; renvoie le calque actif
//   layers.refresh()              à chaque tick de mois : repousse le tableau à jour au rendu
//   layers.kind                   'none' | 'air' | 'water' | 'fauna' | 'soil'
//   layers.pattern                hachures (daltonisme) actives ?
//
// Quatre grands boutons (Aucun, Air, Eau, Faune) et un cinquième plus discret (Sols) ; le choix actif est
// marqué (coche + `aria-pressed`). Sous les boutons, la **légende** du calque choisi vient du rendu
// (`r.layerInfo(kind)` → { kind, label, unit, min, max, stops }) : barre dégradée et libellés des bornes.
// Une bascule « Hachures (daltonisme) » appelle `r.setLayerPattern(on)`.
//
// Le calque reste allumé quand la feuille se referme : une pastille discrète en haut de l'écran le
// rappelle, avec un ✕ de 48 px pour le couper. Toutes les fonctions du rendu sont appelées avec
// précaution (`?.`) : l'interface marche même si l'étape écologie du rendu n'est pas encore en place.
//
// Fonctions pures exportées (tests sous Node) : isLayerKind, layerChoice, gradientCss, boundsText,
// pillText, layerInfoOf, LAYER_CHOICES, SOIL_CHOICE, LAYER_KINDS, LAYER_INFO_FALLBACK.

import { el, clear, setText } from './dom.js';

/** Les quatre choix principaux, dans l'ordre d'affichage (deux colonnes de grands boutons). */
export const LAYER_CHOICES = Object.freeze([
  Object.freeze({ id: 'none', label: 'Aucun', hint: 'La vallée telle qu’elle est' }),
  Object.freeze({ id: 'air', label: 'Air', hint: 'Turquoise : air pur ; rouge : air pollué' }),
  Object.freeze({ id: 'water', label: 'Eau', hint: 'Bleu : eau claire ; rouge : eau polluée' }),
  Object.freeze({ id: 'fauna', label: 'Faune', hint: 'Plus c’est vert, plus la vie est riche' }),
]);

/** Cinquième choix, discret (une ligne sous les grands boutons) : la fertilité des champs. */
export const SOIL_CHOICE = Object.freeze({ id: 'soil', label: 'Sols', hint: 'La fertilité des champs' });

/** Tous les calques acceptés par `set` (l'ordre sert aux tests et au parcours automatisé). */
export const LAYER_KINDS = Object.freeze([...LAYER_CHOICES.map((c) => c.id), SOIL_CHOICE.id]);

/**
 * Légendes de repli, utilisées tant que le rendu ne fournit pas `layerInfo(kind)` (mêmes teintes que
 * `LAYER_RAMPS` de src/render3d/layers.js, recopiées ici pour que ce module reste testable sans three.js).
 */
export const LAYER_INFO_FALLBACK = Object.freeze({
  air: Object.freeze({ kind: 'air', label: 'Pollution de l’air', unit: '', min: 0, max: 100, minLabel: 'pur', maxLabel: 'irrespirable', stops: Object.freeze(['#3dc8b2', '#d94c48']) }),
  water: Object.freeze({ kind: 'water', label: 'Qualité de l’eau', unit: '', min: 0, max: 100, minLabel: 'claire', maxLabel: 'polluée', stops: Object.freeze(['#36afe0', '#d75845']) }),
  fauna: Object.freeze({ kind: 'fauna', label: 'Biodiversité', unit: '', min: 0, max: 100, minLabel: 'peu de vie', maxLabel: 'vie riche', stops: Object.freeze(['#dcb87a', '#28905d']) }),
  soil: Object.freeze({ kind: 'soil', label: 'Fertilité des sols', unit: '', min: 0, max: 100, minLabel: 'épuisé', maxLabel: 'fertile', stops: Object.freeze(['#bb7953', '#8bbe46']) }),
});

/** Vrai si `kind` est un calque connu ('none' compris). */
export function isLayerKind(kind) {
  return LAYER_KINDS.includes(kind);
}

/** Choix (libellé, phrase d'aide) d'un calque, « Sols » compris ; null si inconnu. */
export function layerChoice(kind) {
  if (kind === SOIL_CHOICE.id) return SOIL_CHOICE;
  return LAYER_CHOICES.find((c) => c.id === kind) || null;
}

/** Légende d'un calque : celle du rendu si elle existe, sinon celle de repli ; null pour « Aucun ». */
export function layerInfoOf(kind, renderer = null) {
  if (!kind || kind === 'none') return null;
  let info = null;
  try {
    info = typeof renderer?.layerInfo === 'function' ? renderer.layerInfo(kind) : null;
  } catch {
    info = null;
  }
  const base = LAYER_INFO_FALLBACK[kind] || null;
  if (!info || typeof info !== 'object') return base;
  // Le rendu peut ne donner qu'une partie de la légende : on complète avec le repli.
  return { ...(base || {}), ...info, stops: info.stops && info.stops.length ? info.stops : base?.stops };
}

/** Teinte d'un arrêt de dégradé : chaîne « #rrggbb » ou objet { color } / { hex } / { value }. */
function stopColor(stop) {
  if (typeof stop === 'string') return stop;
  if (!stop || typeof stop !== 'object') return null;
  return stop.color || stop.hex || stop.css || null;
}

/**
 * Position (0..1) d'un arrêt de dégradé : `t` / `at` / `offset` / `stop`, ou `value` ramené entre les
 * bornes de la légende (c'est ce que donne `layerInfo` du rendu), ou la place dans la liste.
 */
function stopAt(stop, i, n, info = null) {
  if (stop && typeof stop === 'object') {
    for (const k of ['t', 'at', 'offset', 'stop', 'pos']) {
      const v = Number(stop[k]);
      if (Number.isFinite(v)) return Math.max(0, Math.min(1, v > 1 ? v / 100 : v));
    }
    const value = Number(stop.value);
    const min = Number(info?.min);
    const max = Number(info?.max);
    if (Number.isFinite(value) && Number.isFinite(min) && Number.isFinite(max) && max > min) {
      return Math.max(0, Math.min(1, (value - min) / (max - min)));
    }
  }
  return n > 1 ? i / (n - 1) : 0;
}

/**
 * Barre dégradée de la légende, en CSS : « linear-gradient(90deg, #c9c4b8 0%, #7a4a30 100%) ».
 * Accepte des arrêts en chaînes (répartis régulièrement) ou en objets ({ t, color }).
 */
export function gradientCss(info) {
  const stops = Array.isArray(info?.stops) ? info.stops.filter((s) => stopColor(s)) : [];
  if (!stops.length) return 'var(--panel-2)';
  if (stops.length === 1) return stopColor(stops[0]);
  const parts = stops.map((s, i) => `${stopColor(s)} ${Math.round(stopAt(s, i, stops.length, info) * 100)}%`);
  return `linear-gradient(90deg, ${parts.join(', ')})`;
}

/**
 * Libellés des paliers de la légende : { min: 'Pur 0', mid: 'Chargé', max: 'Irrespirable 100' }.
 * Les noms viennent des paliers du rendu (`stops[i].label`) ou, à défaut, de la légende de repli.
 * L'unité du rendu (« / 100 ») n'est pas recopiée : les deux bornes disent déjà l'échelle, et la
 * répéter faisait passer le libellé de droite à la ligne sur un écran de 360 px.
 */
export function boundsText(info) {
  if (!info) return { min: '', mid: '', max: '' };
  const stops = Array.isArray(info.stops) ? info.stops : [];
  const labelAt = (i) => {
    const stop = stops[i];
    return stop && typeof stop === 'object' && stop.label ? String(stop.label) : '';
  };
  const num = (v) => (Number.isFinite(Number(v)) ? String(Math.round(Number(v))) : '');
  const low = labelAt(0) || info.minLabel || '';
  const high = (stops.length ? labelAt(stops.length - 1) : '') || info.maxLabel || '';
  const mid = stops.length >= 3 ? labelAt(Math.floor((stops.length - 1) / 2)) : '';
  return {
    min: [low, num(info.min)].filter(Boolean).join(' '),
    mid,
    max: [high, num(info.max)].filter(Boolean).join(' '),
  };
}

/** Texte de la pastille du calque actif : « Calque Air » (vide pour « Aucun »). */
export function pillText(kind) {
  const c = layerChoice(kind);
  return !c || c.id === 'none' ? '' : `Calque ${c.label}`;
}

export function createLayers({ sheets, renderer = null, getGame = null, pill = null, vibrate = null, toasts = null, onChange = null } = {}) {
  const buzz = (n) => { try { vibrate?.(n); } catch { /* rien */ } };
  const r = renderer;
  let kind = 'none';
  let pattern = false;
  let warned = false; // message « l'écologie démarre au premier mois » affiché une fois

  // ── Pastille du calque actif (en haut de l'écran, hors de la feuille) ────────
  let pillMain = null;
  let pillLabel = null;
  const mapLegend = el('div.analysis-legend');
  if (pill) {
    pillLabel = el('span.layer-pill-text', '');
    pillMain = el(
      'button.layer-pill-main',
      { type: 'button', 'aria-label': 'Calque actif — toucher pour en changer', onclick: () => { buzz(6); open(); } },
      el('span.layer-pill-dot', { 'aria-hidden': 'true' }),
      pillLabel,
    );
    clear(pill).append(
      pillMain,
      el('button.layer-pill-x', { type: 'button', 'aria-label': 'Couper le calque', onclick: () => { buzz(8); set('none'); } }, '✕'),
      mapLegend,
    );
    pill.hidden = true;
  }

  function syncPill() {
    if (!pill) return;
    const on = kind !== 'none';
    document.body.classList.toggle('has-analysis', on);
    pill.hidden = !on;
    pill.classList.toggle('is-on', on);
    if (on) {
      pill.dataset.layer = kind;
      setText(pillLabel, pillText(kind));
      pillMain?.setAttribute('aria-label', `${pillText(kind)} — toucher pour en changer`);
      const info = layerInfoOf(kind, r);
      const bounds = boundsText(info);
      const values = valuesOf(kind);
      const mean = values ? Math.round(Array.from(values).reduce((a, b) => a + b, 0) / values.length) : 0;
      mapLegend.replaceChildren(
        el('span.analysis-gradient', { style: { background: gradientCss(info) } }),
        el('div.analysis-bounds', el('span', bounds.min), el('span', bounds.max)),
        el('span.analysis-hint', `Moyenne ${mean}/100 · Touchez une case pour sa valeur`),
      );
    } else {
      delete pill.dataset.layer;
    }
  }

  // ── Feuille des calques ──────────────────────────────────────────────────────
  let buttons = new Map(); // kind → bouton
  let legendBox = null;
  let patternBtn = null;

  /** Tableau de valeurs du calque dans la partie (`game.eco.air`…), ou null si l'écologie n'a rien encore. */
  function valuesOf(k) {
    if (!k || k === 'none') return null;
    const eco = getGame?.()?.eco;
    const arr = eco ? eco[k] : null;
    return arr && typeof arr.length === 'number' && arr.length > 0 ? arr : null;
  }

  function applyToRenderer() {
    try {
      r?.setLayer?.(kind, kind === 'none' ? null : valuesOf(kind));
    } catch (err) {
      console.warn('Calque :', err);
    }
    try { r?.setLayerPattern?.(pattern); } catch { /* rendu sans hachures */ }
    try { r?.invalidate?.(); } catch { /* rien */ }
  }

  function renderLegend() {
    if (!legendBox) return;
    const info = layerInfoOf(kind, r);
    clear(legendBox);
    if (!info) {
      legendBox.hidden = true;
      return;
    }
    legendBox.hidden = false;
    const b = boundsText(info);
    const choice = layerChoice(kind);
    legendBox.append(
      el('p.layer-legend-title', info.label || choice?.label || ''),
      el('span.layer-legend-bar', { 'aria-hidden': 'true', style: { background: gradientCss(info) } }),
      el('span.layer-legend-min', b.min),
      el('span.layer-legend-mid', b.mid),
      el('span.layer-legend-max', b.max),
      choice?.hint ? el('p.layer-legend-hint', choice.hint) : null,
    );
  }

  function syncButtons() {
    for (const [id, node] of buttons) {
      const on = id === kind;
      node.classList.toggle('is-active', on);
      node.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    if (patternBtn) {
      patternBtn.classList.toggle('is-on', pattern);
      patternBtn.setAttribute('aria-checked', pattern ? 'true' : 'false');
    }
    renderLegend();
  }

  function makeButton(choice, { big = true } = {}) {
    const node = el(
      `button.layer-btn${big ? '' : '.layer-btn--soft'}.layer-btn--${choice.id}`,
      {
        type: 'button',
        role: 'button',
        dataset: { layer: choice.id },
        'aria-pressed': 'false',
        'aria-label': `${choice.label} : ${choice.hint}`,
        onclick: () => { buzz(8); set(choice.id); },
      },
      el('span.layer-btn-swatch', { 'aria-hidden': 'true' }),
      el('span.layer-btn-label', choice.label),
      el('span.layer-btn-mark', { 'aria-hidden': 'true' }, '✓'),
    );
    buttons.set(choice.id, node);
    return node;
  }

  function content() {
    buttons = new Map();
    const grid = el('div.layer-grid', LAYER_CHOICES.map((c) => makeButton(c)));
    legendBox = el('div.layer-legend', { hidden: true });
    patternBtn = el(
      'button.layer-pattern',
      {
        type: 'button',
        role: 'switch',
        'aria-checked': pattern ? 'true' : 'false',
        onclick: () => { buzz(6); setPattern(!pattern); },
      },
      el('span.layer-pattern-box', { 'aria-hidden': 'true' }),
      el('span.layer-pattern-label', 'Hachures (daltonisme)'),
    );
    return el(
      'div.layers',
      grid,
      makeButton(SOIL_CHOICE, { big: false }),
      legendBox,
      patternBtn,
      el('button.btn.btn--wide', { type: 'button', onclick: () => close() }, 'Voir la carte colorée'),
      el('p.sheet-hint', 'Un seul calque à la fois. Il reste allumé quand la feuille se referme : la pastille en haut de l’écran le rappelle.'),
    );
  }

  /** Ouvre la feuille (ou la replie si elle est déjà ouverte, comme les onglets du catalogue). */
  function open() {
    if (sheets?.isOpen('layers')) {
      sheets.close('toggle');
      return false;
    }
    const node = content();
    sheets?.open({
      id: 'layers',
      title: 'Calques',
      content: node,
      className: 'sheet--layers',
      onClose: () => { buttons = new Map(); legendBox = null; patternBtn = null; },
    });
    syncButtons();
    return true;
  }

  function close(reason = 'close') {
    if (!sheets?.isOpen('layers')) return false;
    sheets.close(reason);
    return true;
  }

  /** Allume un calque ('none' le coupe) ; renvoie le calque actif. */
  function set(next, { silent = false } = {}) {
    const k = isLayerKind(next) ? next : 'none';
    const changed = k !== kind;
    kind = k;
    applyToRenderer();
    syncButtons();
    syncPill();
    if (kind !== 'none' && !valuesOf(kind) && !warned) {
      warned = true;
      toasts?.show({ key: 'layer', text: 'Les mesures arrivent au premier mois de jeu.', duration: 2600 });
    }
    if (changed && !silent) { try { onChange?.(kind); } catch { /* rien */ } }
    return kind;
  }

  function setPattern(on) {
    pattern = !!on;
    applyToRenderer();
    syncButtons();
    return pattern;
  }

  /** Le mois a avancé (ou le monde a changé) : le calque allumé est redessiné avec le tableau à jour. */
  function refresh() {
    if (kind !== 'none') applyToRenderer();
    syncPill();
    if (sheets?.isOpen('layers')) renderLegend();
  }

  syncPill();

  return {
    open,
    close,
    set,
    setPattern,
    refresh,
    describeAt(x, y) {
      const game = getGame?.(), values = valuesOf(kind);
      if (!game || !values) return null;
      const value = Math.round(values[y * game.world.cols + x]);
      const info = layerInfoOf(kind, r);
      const stop = info.stops[Math.min(2, Math.floor(value / 34))];
      return `${info.label} : ${value}/100 · ${stop?.label || ''}`;
    },
    isOpen: () => !!sheets?.isOpen('layers'),
    get kind() {
      return kind;
    },
    get pattern() {
      return pattern;
    },
    /** Légende du calque actif (tests, parcours automatisé). */
    info: () => layerInfoOf(kind, r),
  };
}
