// Barre du haut, barre d'onglets du catalogue et feuille coulissante (statiques pour le prototype).
//
//   const hud = createHud({ hud, tabbar, sheetLayer }, { onSpeed, onTab, vibrate, catalog });
//   catalog : src/data/tiles.js TILES ([{ id, family, label, price }]) ; sans lui, un catalogue de démonstration
//   hud.setGauges({ population, happiness, nature, money })   valeurs des 4 jauges
//   hud.setDate({ month, year })                               « Printemps · mars · an 1 »
//   hud.setSpeed(0 | 0.5 | 1 | 2 | 4)                          bouton pause / vitesse
//   hud.openSheet(familyId) / hud.closeSheet() / hud.isSheetOpen()
//   hud.insets() → { top, bottom }                             hauteur couverte par la barre du haut et les onglets
//
// Disposition (docs/MOBILE.md) : 4 jauges (Population, Bonheur, Nature, Argent) + date à gauche, pause/vitesse
// à droite (48 × 96) ; en bas, onglets Habitat · Activité · Services · Réseaux · Nature · Démolir · Calques
// (≥ 56 px de haut, ≥ 48 px de large chacun) ; la feuille du bas montre les cartes du catalogue (≥ 64 px)
// de la famille touchée (statique : la pose viendra avec le cœur du jeu).
// Toute information de la barre se lit aussi au toucher : chaque jauge est un bouton (fiche plus tard).

import { el, clear, fmt, setText } from './dom.js';

export const FAMILIES = Object.freeze([
  { id: 'habitat', label: 'Habitat', title: 'Habitat' },
  { id: 'activity', label: 'Activité', title: 'Activité' },
  { id: 'services', label: 'Services', title: 'Services' },
  { id: 'infrastructure', label: 'Réseaux', title: 'Infrastructures' },
  { id: 'nature', label: 'Nature', title: 'Nature' },
]);
export const TOOLS = Object.freeze([
  { id: 'demolish', label: 'Démolir', title: 'Démolir' },
  { id: 'layers', label: 'Calques', title: 'Calques : air, eau, faune' },
]);

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const SEASONS = ['Hiver', 'Hiver', 'Printemps', 'Printemps', 'Printemps', 'Été', 'Été', 'Été', 'Automne', 'Automne', 'Automne', 'Hiver'];

/** Saison d'un mois (0 = janvier) : fonction pure. */
export function seasonOf(month) {
  return SEASONS[((Math.round(month) % 12) + 12) % 12];
}

/** Texte court de la vitesse (bouton) : « ×½ », « ×1 »… ; pause : « ⏸ ». */
export function speedText(sp) {
  if (!sp) return 'Pause';
  return sp === 0.5 ? '×½' : `×${sp}`;
}

/** Vitesse suivante au toucher : pause → ×1 → ×2 → ×4 → pause. */
export function nextSpeed(sp) {
  const cycle = [1, 2, 4];
  if (!sp) return cycle[0];
  const i = cycle.indexOf(sp);
  return i === -1 ? 1 : i === cycle.length - 1 ? 0 : cycle[i + 1];
}

// Catalogue de démonstration (remplacé par src/data/tiles.js quand il sera branché).
const DEMO_CARDS = {
  habitat: [['Quartier', 60, 'var(--c-roof-red)'], ['Immeuble', 140, 'var(--c-roof-orange)'], ['Tour', 320, 'var(--c-roof-slate)']],
  activity: [['Commerce', 90, 'var(--c-sun)'], ['Bureaux', 160, 'var(--c-roof-slate)'], ['Usine', 220, 'var(--c-metal)']],
  services: [['École', 180, 'var(--c-wall-beige)'], ['Dispensaire', 240, 'var(--c-blossom)'], ['Caserne', 260, 'var(--c-roof-red)']],
  infrastructure: [['Éolienne', 150, 'var(--c-metal-light)'], ['Château d’eau', 120, 'var(--c-river)'], ['Gare', 400, 'var(--c-asphalt)']],
  nature: [['Parc', 40, 'var(--c-grass-light)'], ['Bosquet', 30, 'var(--c-forest-dark)'], ['Mare', 50, 'var(--c-lake-deep)'], ['Prairie fleurie', 25, 'var(--c-wheat)']],
  demolish: [],
  layers: [['Air', 0, 'var(--c-metal-light)'], ['Eau', 0, 'var(--c-river)'], ['Faune', 0, 'var(--c-forest-dark)']],
};

/** Couleur de carte par famille (pastille), depuis la palette. */
const FAMILY_SWATCH = {
  habitat: 'var(--c-roof-red)',
  activity: 'var(--c-roof-slate)',
  services: 'var(--c-sun)',
  infrastructure: 'var(--c-metal)',
  nature: 'var(--c-forest-dark)',
};

/** Cartes à montrer pour une famille : [titre, prix, couleur] ; catalogue réel s'il est fourni, sinon démo. */
export function cardsFor(id, catalog) {
  if (Array.isArray(catalog) && catalog.length) {
    const list = catalog.filter((t) => t.family === id).map((t) => [t.label, t.price || 0, FAMILY_SWATCH[t.family] || 'var(--c-sidewalk)']);
    if (list.length || FAMILIES.some((f) => f.id === id)) return list;
  }
  return DEMO_CARDS[id] || [];
}

export function createHud({ hud, tabbar, sheetLayer }, { onSpeed, onTab, vibrate, catalog } = {}) {
  const buzz = (n) => { try { vibrate?.(n); } catch { /* rien */ } };

  // ── Barre du haut ────────────────────────────────────────────────────────────
  const gauges = {};
  // Libellé long, et libellé court montré sur les écrans étroits (< 380 px, css/style.css) : jamais tronqué.
  const makeGauge = (id, label, short = label) => {
    const value = el('span.gauge-value', '0');
    const text = short === label ? label : [el('span.gauge-label-long', label), el('span.gauge-label-short', short)];
    const node = el(`button.gauge.gauge--${id}`, { type: 'button', 'aria-label': label, title: label }, el('span.gauge-label', text), value);
    gauges[id] = { node, value };
    return node;
  };
  const dateSeason = el('span.date-season', 'Printemps');
  const dateMonth = el('span.date-month', 'mars');
  const dateYear = el('span.date-year', 'an 1');
  const dateNode = el('div.hud-date', { 'aria-live': 'polite' }, dateSeason, el('span.date-sep', '·'), dateMonth, el('span.date-sep', '·'), dateYear);
  const speedGlyph = el('span.speed-glyph', { 'aria-hidden': 'true' }, '▶');
  const speedLabel = el('span.speed-text', '×1');
  let speed = 1;
  const speedBtn = el(
    'button.hud-speed',
    {
      type: 'button',
      id: 'speed',
      'aria-label': 'Vitesse du temps',
      onclick: () => {
        buzz(8);
        const next = nextSpeed(speed);
        setSpeed(next);
        onSpeed?.(next);
      },
    },
    speedGlyph,
    speedLabel,
  );
  clear(hud).append(makeGauge('population', 'Population', 'Habitants'), makeGauge('happiness', 'Bonheur'), makeGauge('nature', 'Nature'), makeGauge('money', 'Argent'), dateNode, speedBtn);

  function setGauges(v = {}) {
    if (v.population !== undefined) setText(gauges.population.value, fmt(v.population));
    if (v.happiness !== undefined) setText(gauges.happiness.value, `${Math.round(v.happiness)} %`);
    if (v.nature !== undefined) setText(gauges.nature.value, `${Math.round(v.nature)} %`);
    if (v.money !== undefined) {
      setText(gauges.money.value, fmt(v.money));
      gauges.money.node.classList.toggle('is-negative', v.money < 0);
    }
  }

  function setDate({ month = 2, year = 1 } = {}) {
    setText(dateSeason, seasonOf(month));
    setText(dateMonth, MONTHS[((month % 12) + 12) % 12]);
    setText(dateYear, `an ${year}`);
  }

  function setSpeed(sp) {
    speed = sp;
    speedBtn.classList.toggle('is-paused', !sp);
    speedGlyph.textContent = sp ? '▶' : '❚❚';
    setText(speedLabel, sp ? speedText(sp) : 'Pause');
    speedBtn.setAttribute('aria-label', sp ? `Vitesse ${speedText(sp)} — toucher pour changer` : 'En pause — toucher pour reprendre');
  }

  // ── Feuille du bas ───────────────────────────────────────────────────────────
  const sheetTitle = el('h2.sheet-title', { id: 'sheet-title' }, '');
  const sheetBody = el('div.sheet-body');
  const sheet = el(
    'section.sheet',
    { role: 'dialog', 'aria-labelledby': 'sheet-title', 'aria-modal': 'false' },
    // Poignée décorative (le fond assombri et le bouton ✕, 48 px, ferment la feuille) : pas une cible.
    el('div.sheet-grab', { 'aria-hidden': 'true' }, el('span.sheet-grab-bar')),
    el('div.sheet-head', sheetTitle, el('button.sheet-x', { type: 'button', 'aria-label': 'Fermer', onclick: () => closeSheet() }, '✕')),
    sheetBody,
  );
  const backdrop = el('div.sheet-backdrop', { onclick: () => closeSheet() });
  clear(sheetLayer).append(backdrop, sheet);
  let openId = null;

  function renderSheet(id) {
    const fam = [...FAMILIES, ...TOOLS].find((f) => f.id === id);
    setText(sheetTitle, fam ? fam.title : id);
    clear(sheetBody);
    if (id === 'demolish') {
      sheetBody.append(el('p.sheet-hint', 'Touchez un îlot de la carte pour le démolir (confirmation en deux temps). Bientôt disponible.'));
      return;
    }
    const demo = !(Array.isArray(catalog) && catalog.length);
    sheetBody.append(el('p.sheet-hint', id === 'layers'
      ? 'Un seul calque à la fois, coloré sur la carte (bientôt).'
      : `${demo ? 'Catalogue de démonstration. ' : ''}Pose en deux temps : premier toucher = fantôme avec aperçu des effets, second toucher = confirmation (bientôt).`));
    const grid = el('div.card-grid');
    for (const [title, price, color] of cardsFor(id, catalog)) {
      grid.append(
        el(
          'button.card',
          { type: 'button', onclick: (e) => { buzz(6); for (const c of grid.children) c.classList.toggle('is-selected', c === e.currentTarget); } },
          el('span.card-swatch', { style: { '--sw': color } }),
          el('span.card-body', el('span.card-title', title), el('span.card-price', price ? `${fmt(price)} pièces` : 'calque')),
        ),
      );
    }
    sheetBody.append(grid);
  }

  function publishSheetHeight() {
    const h = sheetLayer.classList.contains('is-open') ? Math.round(sheet.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty('--sheet-h', `${h}px`);
  }

  function openSheet(id) {
    openId = id;
    renderSheet(id);
    sheetLayer.classList.add('is-open');
    document.body.classList.add('has-sheet');
    for (const b of tabbar.children) b.classList.toggle('is-active', b.dataset.id === id);
    requestAnimationFrame(publishSheetHeight);
    setTimeout(publishSheetHeight, 280);
  }

  function closeSheet() {
    if (!openId) return;
    openId = null;
    sheetLayer.classList.remove('is-open');
    document.body.classList.remove('has-sheet');
    for (const b of tabbar.children) b.classList.remove('is-active');
    publishSheetHeight();
  }

  // ── Onglets ──────────────────────────────────────────────────────────────────
  clear(tabbar);
  for (const f of [...FAMILIES, ...TOOLS]) {
    const tool = TOOLS.includes(f);
    tabbar.append(
      el(
        `button.tab.tab--${f.id}${tool ? '.tab--tool' : ''}`,
        {
          type: 'button',
          dataset: { id: f.id },
          'aria-label': f.title,
          onclick: () => {
            buzz(8);
            if (openId === f.id) closeSheet();
            else openSheet(f.id);
            onTab?.(f.id, openId === f.id);
          },
        },
        el('span.tab-ico', { 'aria-hidden': 'true' }),
        el('span.tab-label', f.label),
      ),
    );
  }

  setGauges({ population: 0, happiness: 50, nature: 50, money: 0 });
  setDate({ month: 2, year: 1 });
  setSpeed(1);

  return {
    setGauges,
    setDate,
    setSpeed,
    openSheet,
    closeSheet,
    isSheetOpen: () => !!openId,
    get speed() {
      return speed;
    },
    /** Hauteurs couvertes par la barre du haut et la barre d'onglets (px CSS). */
    insets: () => ({ top: hud.offsetHeight, bottom: tabbar.offsetHeight }),
  };
}
