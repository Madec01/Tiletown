// Barre du haut, barre d'onglets du catalogue et bandeau d'alertes (saison, année).
//
//   const hud = createHud({ hud, tabbar, action, alerts, goals }, { onSpeed, onTab, onGauge, onMenu, vibrate, speeds });
//   hud.setGauges({ population, happiness, nature, money, delta })   4 jauges ; delta = recettes − entretien ($/mois)
//   hud.setDate(calendar(game))                                      « Printemps · mars · an 1 » ({ seasonLabel, monthLabel, year })
//   hud.setSpeed(0 | 0.5 | 1 | 2 | 4)                                bouton pause / vitesse (⏸ ×½ ×1 ×2 ×4)
//   hud.setActiveTab(id | null)                                      onglet allumé (feuille ouverte, outil actif)
//   hud.setHint({ kind: 'tab' | 'gauge', id } | null)                halo animé du tutoriel (§11.3) sur un onglet,
//                                                                    une jauge ou le bouton de vitesse ('speed')
//   hud.showBanner({ title, text, kind, actionLabel, onAction, seeLabel, onSee })
//                                                                    bandeau d'alerte, un à la fois (file d'attente) : bouton
//                                                                    « Voir » (si `onSee`, docs/MOBILE.md) puis bouton OK
//   hud.hideBanner()                                                 ferme le bandeau courant (et montre le suivant)
//   hud.insets() → { top, bottom }                                   hauteur couverte par la barre du haut et, en bas, par les onglets + la barre d'action
//
// Disposition (docs/MOBILE.md, docs/GAME_DESIGN.md §9) : 4 jauges (Population, Bonheur, Nature, Argent), puis une
// seconde ligne « bouton Menu (48 px) + date », pause/vitesse à droite (48 px de large) ; en bas, onglets Habitat · Activité · Services ·
// Infrastructures · Nature · Démolir · Calques (≥ 56 px de haut, ≥ 48 px de large chacun). Les feuilles (catalogue,
// fiches) vivent dans src/ui/sheets.js et src/ui/catalog.js ; la pose dans src/ui/placement.js.
// Toute information de la barre se lit aussi au toucher : chaque jauge est un bouton (fiche plus tard).

import { el, clear, fmt, setText, signed } from './dom.js';
import { icon } from './icons.js';

export const FAMILIES = Object.freeze([
  { id: 'habitat', label: 'Habitat', title: 'Habitat' },
  { id: 'activity', label: 'Activité', title: 'Activité' },
  { id: 'services', label: 'Services', title: 'Services' },
  // « Infrastructures » ne tient pas dans un onglet de 48 à 56 px à 12 px : libellé court sur téléphone (css/style.css).
  { id: 'infrastructure', label: 'Infrastructures', short: 'Infras.', title: 'Infrastructures' },
  { id: 'nature', label: 'Nature', title: 'Nature' },
]);
export const TOOLS = Object.freeze([
  { id: 'demolish', label: 'Démolir', title: 'Démolir (10 $ par îlot)' },
  { id: 'layers', label: 'Calques', title: 'Calques : air, eau, faune' },
]);

/** Vitesses du temps (docs/ARCHITECTURE.md §9.1 : SPEEDS de src/data/balance.js ; recopiées ici pour l'interface pure). */
export const DEFAULT_SPEEDS = Object.freeze([0, 0.5, 1, 2, 4]);

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const SEASONS = ['Hiver', 'Hiver', 'Printemps', 'Printemps', 'Printemps', 'Été', 'Été', 'Été', 'Automne', 'Automne', 'Automne', 'Hiver'];

/** Saison d'un mois du calendrier (0 = janvier) : fonction pure (repli quand `calendar(game)` n'est pas fourni). */
export function seasonOf(month) {
  return SEASONS[((Math.round(month) % 12) + 12) % 12];
}

/** Texte court de la vitesse (bouton) : « ×½ », « ×1 »… ; pause : « Pause ». */
export function speedText(sp) {
  if (!sp) return 'Pause';
  return sp === 0.5 ? '×½' : `×${sp}`;
}

/** Vitesse suivante au toucher : 0 (pause) → ×½ → ×1 → ×2 → ×4 → pause (le cycle de `cycleSpeed` du cœur). */
export function nextSpeed(sp, speeds = DEFAULT_SPEEDS) {
  const i = speeds.indexOf(sp);
  if (i === -1) return speeds.includes(1) ? 1 : speeds[0];
  return speeds[(i + 1) % speeds.length];
}

/** Texte du delta mensuel de l'argent : « +12 $/mois », « −4 $/mois », « ±0 $/mois ». */
export function deltaText(delta) {
  const v = Math.round(Number(delta) || 0);
  return v === 0 ? '±0 $/mois' : `${signed(v)} $/mois`;
}

/** Libellé de la date depuis `calendar(game)` ou, à défaut, { month (0 = janvier), year }. */
export function dateParts(cal = {}) {
  if (cal.seasonLabel || cal.monthLabel) {
    return { season: cal.seasonLabel || seasonOf(cal.month ?? 2), month: cal.monthLabel || '', year: `an ${cal.year ?? 1}` };
  }
  const m = ((Math.round(cal.month ?? 2) % 12) + 12) % 12;
  return { season: seasonOf(m), month: MONTHS[m], year: `an ${cal.year ?? 1}` };
}

/** Petit pictogramme « menu » (trois barres) en SVG : aucune ressource, aucun caractère exotique. */
export function menuIcon() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '22');
  svg.setAttribute('height', '22');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('ico-menu');
  for (const y of [7, 12, 17]) {
    const line = document.createElementNS(ns, 'rect');
    line.setAttribute('x', '3.5');
    line.setAttribute('y', String(y - 1.1));
    line.setAttribute('width', '17');
    line.setAttribute('height', '2.2');
    line.setAttribute('rx', '1.1');
    line.setAttribute('fill', 'currentColor');
    svg.append(line);
  }
  return svg;
}

export function createHud({ hud, tabbar, action = null, alerts = null, goals = null }, { onSpeed, onTab, onGauge, onMenu, vibrate, speeds = DEFAULT_SPEEDS } = {}) {
  const buzz = (n) => { try { vibrate?.(n); } catch { /* rien */ } };

  // ── Barre du haut ────────────────────────────────────────────────────────────
  const gauges = {};
  // Libellé long, et libellé court montré sur les écrans étroits (< 380 px, css/style.css) : jamais tronqué.
  const makeGauge = (id, label, short = label) => {
    const value = el('span.gauge-value', '0');
    const text = short === label ? label : [el('span.gauge-label-long', label), el('span.gauge-label-short', short)];
    // Chaque jauge est un bouton : la jauge Nature ouvre sa fiche détaillée (src/ui/nature-sheet.js).
    const node = el(
      `button.gauge.gauge--${id}`,
      {
        type: 'button',
        dataset: { gauge: id },
        'aria-label': label,
        title: label,
        onclick: () => { buzz(6); onGauge?.(id); },
      },
      icon(({population:'people',happiness:'smile',nature:'leaf',money:'coin'})[id], 'gauge-icon'),
      el('span.gauge-label', text),
      value,
    );
    gauges[id] = { node, value };
    return node;
  };
  const dateSeason = el('span.date-season', 'Printemps');
  const dateMonth = el('span.date-month', 'mars');
  const dateYear = el('span.date-year', 'an 1');
  const dateNode = el('div.hud-date', { 'aria-live': 'polite' }, dateSeason, el('span.date-sep', '·'), dateMonth, el('span.date-sep', '·'), dateYear);
  const speedGlyph = el('span.speed-glyph', { 'aria-hidden': 'true' }, icon('play'));
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
        const next = nextSpeed(speed, speeds);
        setSpeed(next);
        onSpeed?.(next);
      },
    },
    speedGlyph,
    speedLabel,
  );
  // Bouton menu discret (seconde ligne, à gauche de la date) : revient à l'écran titre (§11.3).
  const menuBtn = el(
    'button.hud-menu',
    { type: 'button', id: 'menu', 'aria-label': 'Menu du jeu', title: 'Menu', onclick: () => { buzz(8); onMenu?.(); } },
    menuIcon(),
  );
  const moneyDelta = el('span.gauge-delta', '±0 $/mois');
  clear(hud).append(makeGauge('population', 'Population', 'Habitants'), makeGauge('happiness', 'Bonheur'), makeGauge('nature', 'Nature'), makeGauge('money', 'Argent'), menuBtn, dateNode, speedBtn);
  gauges.money.node.append(moneyDelta);

  function setGauges(v = {}) {
    if (v.population !== undefined) setText(gauges.population.value, fmt(v.population));
    if (v.happiness !== undefined) setText(gauges.happiness.value, `${Math.round(v.happiness)} %`);
    if (v.nature !== undefined) setText(gauges.nature.value, `${Math.round(v.nature)} %`);
    if (v.money !== undefined) {
      setText(gauges.money.value, Math.abs(v.money) >= 10000 ? `${(v.money/1000).toLocaleString('fr-FR',{maximumFractionDigits:1})} k$` : `${fmt(v.money)} $`);
      gauges.money.node.setAttribute('aria-label', `Argent : ${fmt(v.money)} dollars`);
      gauges.money.node.classList.toggle('is-negative', v.money < 0);
    }
    if (v.delta !== undefined) {
      const d = Math.round(Number(v.delta) || 0);
      setText(moneyDelta, deltaText(d));
      moneyDelta.classList.toggle('is-up', d > 0);
      moneyDelta.classList.toggle('is-down', d < 0);
    }
  }

  function setDate(cal) {
    const p = dateParts(cal || {});
    setText(dateSeason, p.season);
    setText(dateMonth, p.month);
    setText(dateYear, p.year);
  }

  function setSpeed(sp) {
    speed = sp;
    speedBtn.classList.toggle('is-paused', !sp);
    speedGlyph.replaceChildren(icon(sp ? 'play' : 'pause'));
    setText(speedLabel, speedText(sp));
    speedBtn.setAttribute('aria-label', sp ? `Vitesse ${speedText(sp)} — toucher pour changer` : 'En pause — toucher pour reprendre');
  }

  // ── Onglets ──────────────────────────────────────────────────────────────────
  clear(tabbar);
  for (const f of [...FAMILIES, ...TOOLS]) {
    const tool = TOOLS.includes(f);
    const label = f.short ? [el('span.tab-label-long', f.label), el('span.tab-label-short', f.short)] : f.label;
    tabbar.append(
      el(
        `button.tab.tab--${f.id}${tool ? '.tab--tool' : ''}`,
        {
          type: 'button',
          dataset: { id: f.id },
          'aria-label': f.title,
          title: f.title,
          onclick: () => {
            buzz(8);
            onTab?.(f.id);
          },
        },
        el('span.tab-ico', { 'aria-hidden': 'true' }, icon(({habitat:'house',activity:'shop',services:'heart',infrastructure:'bolt',nature:'leaf',demolish:'hammer',layers:'layers'})[f.id])),
        el('span.tab-label', label),
      ),
    );
  }

  function setActiveTab(id) {
    for (const b of tabbar.children) {
      const on = !!id && b.dataset.id === id;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  // ── Surbrillance du tutoriel (halo doux sur un onglet, une jauge, le bouton de vitesse) ─────
  let hint = null; // { kind, id }
  /** Élément visé par une consigne du tutoriel : onglet, jauge, ou bouton de vitesse ('speed'). */
  function hintNode(target) {
    if (!target || !target.id) return null;
    if (target.kind === 'tab') return [...tabbar.children].find((b) => b.dataset.id === target.id) || null;
    if (target.kind !== 'gauge') return null;
    if (target.id === 'speed') return speedBtn;
    return gauges[target.id]?.node || null;
  }
  function setHint(target) {
    const prev = hintNode(hint);
    if (prev) prev.classList.remove('is-hinted');
    hint = target && (target.kind === 'tab' || target.kind === 'gauge') && target.id ? { kind: target.kind, id: String(target.id) } : null;
    const node = hintNode(hint);
    if (node) node.classList.add('is-hinted');
    return hint;
  }

  // ── Bandeau d'alertes (saison, année, écologie) : un à la fois, « Voir » puis OK ─────────────
  const queue = [];
  let banner = null; // { node, opts }
  function showBanner(opts) {
    if (!alerts) return null;
    queue.push(opts);
    if (!banner) nextBanner();
    return opts;
  }
  function nextBanner() {
    if (!alerts) return;
    const opts = queue.shift();
    if (!opts) {
      banner = null;
      alerts.classList.remove('is-open');
      clear(alerts);
      return;
    }
    const kind = opts.kind || 'info';
    // Bouton « Voir » (alertes d'écologie) : centre la carte sur la case en cause et allume le calque.
    const see = typeof opts.onSee === 'function'
      ? el(
          'button.btn.alert-see',
          {
            type: 'button',
            'aria-label': `${opts.seeLabel || 'Voir'} : ${opts.title || opts.text}`,
            onclick: () => { buzz(8); hideBanner({ action: false, see: true }); },
          },
          opts.seeLabel || 'Voir',
        )
      : null;
    const ok = el(
      'button.btn.alert-ok',
      { type: 'button', 'aria-label': `${opts.actionLabel || 'OK'} : ${opts.title || opts.text}`, onclick: () => { buzz(6); hideBanner(); } },
      opts.actionLabel || 'OK',
    );
    const node = el(
      `div.alert.alert--${kind}`,
      { role: 'status' },
      el('div.alert-body', opts.title ? el('strong.alert-title', opts.title) : null, opts.text ? el('span.alert-text', opts.text) : null),
      see,
      ok,
    );
    clear(alerts).append(node);
    alerts.classList.add('is-open');
    banner = { node, opts };
  }
  /** Ferme le bandeau courant et montre le suivant. `see` : c'est le bouton « Voir » qui a fermé. */
  function hideBanner({ action = true, see = false } = {}) {
    if (!banner) return;
    const { opts } = banner;
    banner = null;
    if (see) {
      try { opts.onSee?.(); } catch (err) { console.warn('Alerte :', err); }
    } else if (action) {
      try { opts.onAction?.(); } catch (err) { console.warn('Alerte :', err); }
    }
    nextBanner();
  }

  setGauges({ population: 0, happiness: 50, nature: 50, money: 0, delta: 0 });
  setDate({ month: 2, year: 1 });
  setSpeed(1);

  return {
    element: hud,
    setGauges,
    setDate,
    setSpeed,
    setActiveTab,
    setHint,
    get hint() { return hint; },
    showBanner,
    hideBanner,
    get speed() {
      return speed;
    },
    get bannerOpen() {
      return !!banner;
    },
    /** Zones réellement occupées : jauges, objectifs et construction rapide. */
    insets: () => ({
      top: Math.max(hud.getBoundingClientRect().bottom, goals && !goals.hidden ? goals.getBoundingClientRect().bottom : 0),
      bottom: tabbar.offsetHeight + (action?.offsetHeight || document.querySelector('.quick-build')?.offsetHeight || 0) + 20,
    }),
  };
}
