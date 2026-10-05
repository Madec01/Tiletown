// Fiche Nature (toucher la jauge Nature de la barre du haut) : le détail de la note — air, eau, faune,
// sols — puis les espèces de la vallée (docs/ARCHITECTURE.md §10.4, docs/GAME_DESIGN.md §5, §9).
//
//   const nature = createNatureSheet({ sheets, getGame, ops: { speciesSummary }, layers, renderer, focus, vibrate, book });
//   `focus({ x, y, layer })` : centre la carte et allume le calque (fourni par src/main.js ; sinon la caméra du rendu)
//   nature.open()       ouvre la fiche (ou la replie si elle est déjà ouverte)
//   nature.refresh()    relit l'état si la fiche est ouverte (tick de mois)
//
// Les quatre sous-scores sont des barres **touchables** : toucher « Air » allume le calque Air et replie
// la fiche (docs/GAME_DESIGN.md §9 : « Tap sur Nature → pastilles air / eau / faune »). Dessous, la liste
// des espèces : présentes (icône, nom, « depuis le printemps de l’an 2 ») puis absentes (nom grisé et la
// phrase qui dit ce qui leur manque), et un bouton « Carnet » vers src/ui/species-book.js.
//
// Fonctions pures exportées (tests sous Node) : SCORE_ROWS, scoreRows, scoreWord, natureText.

import { el } from './dom.js';
import { renderSpeciesList, speciesRows, speciesCellOf, speciesCountText } from './species-book.js';

/** Les quatre sous-scores, dans l'ordre d'affichage ; `layer` est le calque que la barre allume. */
export const SCORE_ROWS = Object.freeze([
  Object.freeze({ key: 'air', label: 'Air', layer: 'air', hint: 'Les forêts et les parcs filtrent, le trafic et les usines chargent' }),
  Object.freeze({ key: 'water', label: 'Eau', layer: 'water', hint: 'Tout l’aval subit ce qu’on rejette en amont' }),
  Object.freeze({ key: 'fauna', label: 'Faune', layer: 'fauna', hint: 'De grandes parcelles reliées entre elles' }),
  Object.freeze({ key: 'soil', label: 'Sols', layer: 'soil', hint: 'La fertilité des champs, entretenue par les haies et le bio' }),
]);

/** Appréciation d'une note sur 100, en un mot (ton bienveillant, jamais culpabilisant). */
export function scoreWord(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return '';
  if (n >= 80) return 'excellent';
  if (n >= 60) return 'bon';
  if (n >= 40) return 'passable';
  if (n >= 20) return 'fragile';
  return 'critique';
}

/**
 * Lignes des sous-scores depuis `eco.scores` : [{ key, label, layer, hint, value (0..100 ou null), word }].
 * Une note absente (écologie pas encore calculée) laisse `value` à null.
 */
export function scoreRows(eco) {
  const scores = (eco && eco.scores) || {};
  return SCORE_ROWS.map((row) => {
    const raw = Number(scores[row.key]);
    const value = Number.isFinite(raw) ? Math.max(0, Math.min(100, raw)) : null;
    return { ...row, value, word: value === null ? '' : scoreWord(value) };
  });
}

/** Ligne de tête : « Nature : 64 / 100 · bon » (ou l'attente du premier mois). */
export function natureText(eco) {
  const v = Number(eco && eco.scores ? eco.scores.nature : NaN);
  if (!Number.isFinite(v)) return 'La vallée se mesure au premier mois de jeu.';
  return `Nature : ${Math.round(v)} / 100 · ${scoreWord(v)}`;
}

export function createNatureSheet({ sheets, getGame = null, ops = {}, layers = null, renderer = null, focus = null, vibrate = null, book = null } = {}) {
  const buzz = (n) => { try { vibrate?.(n); } catch { /* rien */ } };

  function ecoOf() {
    return getGame?.()?.eco || null;
  }

  /** Lignes des espèces (résumé du cœur, ou repli direct sur `eco.species`). */
  function rows() {
    const eco = ecoOf();
    if (!eco) return [];
    try {
      if (typeof ops.speciesSummary === 'function') return speciesRows(ops.speciesSummary(eco));
    } catch (err) {
      console.warn('speciesSummary :', err);
    }
    const entries = eco.species && typeof eco.species === 'object' ? Object.entries(eco.species) : [];
    return speciesRows(entries.map(([id, s]) => ({ id, label: s?.label || id, present: !!s?.present, since: s?.since, hint: s?.hint })));
  }

  /** Allume un calque depuis une barre et replie la fiche (un seul calque à la fois). */
  function pickLayer(kind) {
    buzz(8);
    layers?.set?.(kind);
    sheets?.close('layer');
  }

  /** Centre la carte sur la parcelle d'une espèce et allume le calque faune. */
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

  function scoreBar(row) {
    const pct = row.value === null ? 0 : Math.round(row.value);
    return el(
      `button.eco-row.eco-row--${row.key}`,
      {
        type: 'button',
        dataset: { score: row.key },
        'aria-label': row.value === null ? `${row.label} : pas encore mesuré` : `${row.label} : ${pct} sur 100, ${row.word} — voir le calque`,
        title: row.hint,
        onclick: () => pickLayer(row.layer),
      },
      el('span.eco-label', row.label),
      el(
        'span.eco-bar',
        { role: 'meter', 'aria-hidden': 'true' },
        el('span.eco-fill', { style: { width: `${pct}%` } }),
      ),
      el('span.eco-value', row.value === null ? '—' : `${pct}`),
    );
  }

  function content() {
    const eco = ecoOf();
    const game = getGame?.();
    const list = rows();
    const box = el('div.nature-sheet');
    box.append(
      el('p.nature-total', natureText(eco)),
      el('div.eco-rows', scoreRows(eco).map((row) => scoreBar(row))),
      el('p.sheet-hint', 'Touchez une barre pour voir le calque correspondant sur la carte.'),
      el('h3.tile-sub', 'Espèces de la vallée'),
      el('p.book-count', speciesCountText(list)),
      renderSpeciesList(list, { onSee: see, canSee: (row) => !!speciesCellOf(game?.eco, row.id, game?.world?.cols) }),
    );
    if (book) {
      box.append(el('div.sheet-actions', el('button.btn.nature-book', { type: 'button', onclick: () => { buzz(6); book.open(); } }, 'Carnet des espèces')));
    }
    return box;
  }

  function open() {
    if (sheets?.isOpen('nature')) {
      sheets.close('toggle');
      return false;
    }
    sheets?.open({ id: 'nature', title: 'La nature de la vallée', content: content(), className: 'sheet--nature' });
    return true;
  }

  function refresh() {
    if (!sheets?.isOpen('nature')) return;
    sheets.setContent(content());
  }

  return {
    open,
    refresh,
    rows,
    close: (reason = 'close') => (sheets?.isOpen('nature') ? sheets.close(reason) : false),
    isOpen: () => !!sheets?.isOpen('nature'),
  };
}
