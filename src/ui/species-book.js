// Carnet des espèces : la liste illustrée des espèces emblématiques de la vallée
// (docs/ARCHITECTURE.md §10.4, docs/GAME_DESIGN.md §5.3). Les espèces présentes portent leur date de
// première apparition, les absentes la phrase qui dit comment les faire venir.
//
//   const book = createSpeciesBook({ sheets, getGame, ops: { speciesSummary }, layers, renderer, focus, vibrate, onBack });
//   book.open()        ouvre le carnet (feuille coulissante, liste en grand)
//   book.refresh()     relit l'état si le carnet est ouvert
//
// Rien n'est mémorisé ici : la première apparition d'une espèce vit dans la sauvegarde de la partie
// (`game.eco.species[id].since`, un mois écoulé). Les icônes sont de petits dessins SVG tracés sur place
// (aucune ressource externe, aucun emoji dépendant de la police).
//
// Fonctions pures exportées (tests sous Node) : sinceLabel, speciesRows, speciesCountText, speciesCellOf,
// SPECIES_ART, speciesArt.

import { el, plural } from './dom.js';
import { calendar } from '../core/calendar.js';
import { SPECIES_BY_ID } from '../data/species.js';

/** Articles des saisons : « depuis le printemps », « depuis l’été ». */
const SEASON_SINCE = Object.freeze({ Printemps: 'le printemps', 'Été': 'l’été', Automne: 'l’automne', Hiver: 'l’hiver' });

/**
 * Dessins des espèces : une teinte et un tracé (viewBox 24 × 24, trait de 1,8). Silhouettes simples,
 * reconnaissables en 28 px : bois du cerf, long cou du héron, dos de la loutre, ailes de l'abeille,
 * aigrettes de la chouette, ailes en V de l'hirondelle, oreilles pointues du renard.
 */
export const SPECIES_ART = Object.freeze({
  deer: Object.freeze({ color: 'var(--c-wood)', d: 'M6 2.5 8 6.5M18 2.5 16 6.5M9 5 7 3M15 5l2-2M12 7.5c2.3 0 3.9 1.8 3.9 4.3 0 3.3-1.7 6.4-3.9 6.4s-3.9-3.1-3.9-6.4C8.1 9.3 9.7 7.5 12 7.5Z' }),
  heron: Object.freeze({ color: 'var(--c-metal-light)', d: 'M3.5 19.5c4.5 0 7.5-2.2 8.5-6.5M12 13c0-4.2 1.2-7.2 3.2-9.2M15.2 3.8 19 5.2M15.5 10c2.5.6 4.5 2 5.5 4' }),
  otter: Object.freeze({ color: 'var(--c-wood)', d: 'M2.5 15.5c3.5-3.2 8-4 12-1.8M14.2 12.3a2.6 2.6 0 1 1 3.9 2.3M3 19.5c2-1.2 3.5-1.2 5.5 0s3.5 1.2 5.5 0 3.5-1.2 5.5 0' }),
  bee: Object.freeze({ color: 'var(--c-sun)', d: 'M12 8.5c2.2 0 3.6 2.1 3.6 5s-1.4 5-3.6 5-3.6-2.1-3.6-5 1.4-5 3.6-5ZM8.6 10C5.5 6.8 4.3 9 7.8 11.4M15.4 10c3.1-3.2 4.3-1 .8 1.4M8.6 13.5h6.8M9 17h6' }),
  owl: Object.freeze({ color: 'var(--c-wall-tan)', d: 'M6 4.5 8.5 7.5M18 4.5 15.5 7.5M12 6.5a5.8 5.8 0 0 1 5.8 5.8c0 3.8-2.6 7-5.8 7s-5.8-3.2-5.8-7A5.8 5.8 0 0 1 12 6.5ZM9.8 12h.01M14.2 12h.01' }),
  swallow: Object.freeze({ color: 'var(--c-roof-slate)', d: 'M2.5 6.5c4.5 1.8 7.8 4.5 9.5 8.5M21.5 6.5c-4.5 1.8-7.8 4.5-9.5 8.5M12 15v4.5' }),
  fox: Object.freeze({ color: 'var(--c-roof-orange)', d: 'M5 4.5 8.5 9M19 4.5 15.5 9M12 9c3 0 5 2 5 4.6 0 2.6-2 4.6-5 6-3-1.4-5-3.4-5-6C7 11 9 9 12 9ZM12 16.5v1' }),
  duck: Object.freeze({ color: 'var(--c-grass)', d: 'M3.5 16c3.5-2.8 8-3.4 11.5-1.2M14.5 11.5a2.4 2.4 0 1 1 3.2 2.2M17.5 11.5 21 11M3 19.5h18' }),
});

/**
 * Noms français de repli : le cœur donne normalement `label` (src/data/species.js), mais la fiche d'une
 * case ne reçoit que des identifiants (`describeTile().eco.species`).
 */
export const SPECIES_LABELS = Object.freeze({
  deer: 'Cerf', heron: 'Héron', otter: 'Loutre', bee: 'Abeilles', bees: 'Abeilles',
  owl: 'Chouette', swallow: 'Hirondelle', fox: 'Renard', duck: 'Canard',
});

/** Nom d'une espèce à afficher : celui du cœur s'il est donné, sinon la table de repli. */
export function speciesLabel(id, label = null) {
  if (label) return label;
  const key = id === 'bees' ? 'bee' : String(id || '');
  return SPECIES_BY_ID[key]?.label || SPECIES_LABELS[key] || key;
}

/** Dessin d'une espèce (repli : une feuille, pour une espèce que l'interface ne connaît pas encore). */
export const SPECIES_FALLBACK = Object.freeze({ color: 'var(--c-forest-dark)', d: 'M12 20V9M12 9c0-3.6 2.9-6.5 6.5-6.5C18.5 6.1 15.6 9 12 9ZM12 9C12 5.4 9.1 2.5 5.5 2.5 5.5 6.1 8.4 9 12 9Z' });

/** Dessin et teinte d'une espèce par identifiant (« bees » est accepté comme « bee »). */
export function speciesArt(id) {
  const key = id === 'bees' ? 'bee' : String(id || '');
  return SPECIES_ART[key] || SPECIES_FALLBACK;
}

/** Icône d'une espèce : petit SVG tracé sur place (aucune ressource externe). */
export function speciesIcon(id, { size = 28 } = {}) {
  const art = speciesArt(id);
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('ico-species');
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', art.d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.8');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.append(path);
  svg.style.color = art.color;
  return svg;
}

/**
 * Date de première apparition en clair : « depuis le printemps de l’an 2 » (`since` = mois écoulés,
 * mois 0 = mars de l'an 1). Chaîne vide si l'espèce n'a pas de date.
 */
export function sinceLabel(since) {
  // `null` (espèce jamais venue) ne doit pas devenir le mois 0 : on exige un vrai nombre.
  if (typeof since !== 'number' || !Number.isFinite(since) || since < 0) return '';
  const c = calendar({ month: since });
  return `depuis ${SEASON_SINCE[c.seasonLabel] || c.seasonLabel.toLowerCase()} de l’an ${c.year}`;
}

/**
 * Lignes du carnet depuis `speciesSummary(eco)` : [{ id, label, present, since, sinceText, hint }],
 * les espèces présentes d'abord (les plus anciennes en tête), puis les absentes par ordre alphabétique.
 */
export function speciesRows(summary) {
  const rows = (Array.isArray(summary) ? summary : [])
    .filter((s) => s && s.id)
    .map((s) => {
      const since = typeof s.since === 'number' && Number.isFinite(s.since) && s.since >= 0 ? s.since : null;
      return {
        id: String(s.id),
        label: speciesLabel(s.id, s.label),
        present: !!s.present,
        since,
        sinceText: s.present ? sinceLabel(since) : '',
        hint: s.hint || '',
      };
    });
  rows.sort((a, b) => {
    if (a.present !== b.present) return a.present ? -1 : 1;
    if (a.present && a.since !== b.since) return (a.since ?? 0) - (b.since ?? 0);
    return a.label.localeCompare(b.label, 'fr');
  });
  return rows;
}

/** « 3 espèces sur 7 vivent dans la vallée » (ou « Aucune espèce emblématique… »). */
export function speciesCountText(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const here = list.filter((r) => r.present).length;
  if (!list.length) return 'Les espèces se comptent au premier mois de jeu.';
  if (!here) return `Aucune espèce emblématique pour l’instant : ${list.length} vous attendent.`;
  return `${plural(here, 'espèce')} sur ${list.length} ${here > 1 ? 'vivent' : 'vit'} dans la vallée.`;
}

/** Case représentative d'une espèce (milieu de sa parcelle) : { x, y } ou null. */
export function speciesCellOf(eco, id, cols) {
  const entry = eco && eco.species ? eco.species[id] : null;
  const cells = entry && Array.isArray(entry.cells) ? entry.cells : null;
  if (!cells || !cells.length || !(cols > 0)) return null;
  const i = Number(cells[Math.floor(cells.length / 2)]);
  if (!Number.isFinite(i) || i < 0) return null;
  return { x: i % cols, y: Math.floor(i / cols) };
}

/**
 * Liste d'espèces en DOM. `big` : version du carnet (icônes et textes plus grands).
 * `onSee(row)` : bouton « Voir » sur une espèce présente (centre la carte et allume le calque faune).
 */
export function renderSpeciesList(rows, { big = false, onSee = null, canSee = null } = {}) {
  const list = el(`ul.species-list${big ? '.species-list--big' : ''}`, { role: 'list' });
  for (const row of rows) {
    const see = row.present && onSee && (!canSee || canSee(row))
      ? el('button.btn.btn--ghost.species-see', { type: 'button', 'aria-label': `Voir ${row.label} sur la carte`, onclick: () => onSee(row) }, 'Voir')
      : null;
    list.append(
      el(
        `li.species${row.present ? '.is-present' : '.is-absent'}`,
        { dataset: { id: row.id, present: row.present ? '1' : '0' } },
        el('span.species-ico', speciesIcon(row.id, { size: big ? 34 : 28 })),
        el(
          'span.species-body',
          el('span.species-name', row.label),
          el('span.species-note', row.present ? (row.sinceText || 'dans la vallée') : (row.hint || 'Conditions encore à réunir')),
        ),
        see,
      ),
    );
  }
  if (!rows.length) list.append(el('li.species.is-absent', el('span.species-body', el('span.species-note', 'Rien à noter pour l’instant.'))));
  return list;
}

export function createSpeciesBook({ sheets, getGame = null, ops = {}, layers = null, renderer = null, focus = null, vibrate = null, onBack = null } = {}) {
  const buzz = (n) => { try { vibrate?.(n); } catch { /* rien */ } };

  /** Lignes du carnet pour la partie en cours (repli sur `eco.species` si le cœur ne résume pas encore). */
  function rows() {
    const game = getGame?.();
    const eco = game?.eco;
    if (!eco) return [];
    try {
      if (typeof ops.speciesSummary === 'function') return speciesRows(ops.speciesSummary(eco));
    } catch (err) {
      console.warn('speciesSummary :', err);
    }
    const entries = eco.species && typeof eco.species === 'object' ? Object.entries(eco.species) : [];
    return speciesRows(entries.map(([id, s]) => ({ id, label: s?.label || id, present: !!s?.present, since: s?.since, hint: s?.hint })));
  }

  /** Centre la carte sur la parcelle de l'espèce et allume le calque faune. */
  function see(row) {
    const game = getGame?.();
    const cell = speciesCellOf(game?.eco, row.id, game?.world?.cols);
    buzz(8);
    layers?.set?.('fauna');
    if (typeof focus === 'function') {
      try { focus({ ...(cell || {}), layer: 'fauna' }); } catch (err) { console.warn('Voir :', err); }
    } else if (cell && renderer?.camera?.lookAt) {
      try { renderer.camera.lookAt(cell.x, cell.y, 8); } catch { /* caméra sans monde */ }
      try { renderer.setHighlight?.([cell]); } catch { /* rien */ }
    }
    sheets?.close('see');
  }

  function content() {
    const list = rows();
    return el(
      'div.book',
      el('p.book-count', speciesCountText(list)),
      renderSpeciesList(list, { big: true, onSee: see, canSee: (row) => !!speciesCellOf(getGame?.()?.eco, row.id, getGame?.()?.world?.cols) }),
      el('p.sheet-hint', 'Chaque espèce qui s’installe ajoute à la note Nature et attire des visiteurs. Les absentes disent ce qu’il leur manque.'),
      onBack ? el('div.sheet-actions', el('button.btn.btn--ghost', { type: 'button', onclick: () => { buzz(6); onBack(); } }, 'Retour à la nature')) : null,
    );
  }

  function open() {
    if (sheets?.isOpen('species')) {
      sheets.close('toggle');
      return false;
    }
    sheets?.open({ id: 'species', title: 'Carnet des espèces', content: content(), className: 'sheet--species' });
    return true;
  }

  function refresh() {
    if (!sheets?.isOpen('species')) return;
    sheets.setContent(content());
  }

  return {
    open,
    refresh,
    rows,
    close: (reason = 'close') => (sheets?.isOpen('species') ? sheets.close(reason) : false),
    isOpen: () => !!sheets?.isOpen('species'),
  };
}
