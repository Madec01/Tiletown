// Fiche d'une case (appui long sur la carte) : terrain, bâtiment et niveau, conditions de la prochaine
// évolution (cochées ou non), recettes et entretien, bouton Démolir (docs/GAME_DESIGN.md §9, ARCHITECTURE §9.3).
//
//   const tileSheet = createTileSheet({ sheets, ops: { describeTile }, getGame, onDemolish, renderer, vibrate });
//   tileSheet.open(x, y)      ouvre la fiche (feuille coulissante) et surligne la case
//   tileSheet.close()         tileSheet.isOpen()
//
// `describeTile(game, x, y)` (cœur, pur) → { terrainLabel, native, building: { id | type, label, level, levelLabel,
// family } | null, conditions: [{ label, met }], yields: { income, upkeep, jobs, capacity, residents },
// eco: { air, water, fauna, soil, species: [ids] } (étape 4, docs/ARCHITECTURE.md §10.2) }.
// Fonctions pures exportées (tests) : yieldLines, conditionsTitle, ecoRows, ecoWord, ecoSpeciesText.

import { el, fmt, plural, signed } from './dom.js';
import { TILE_BY_ID } from '../data/tiles.js';
import { speciesLabel } from './species-book.js';

/**
 * Les quatre mesures d'écologie d'une case. `invert` : la valeur haute est mauvaise (air, eau = pollution) ;
 * `words` : les cinq appréciations, de la valeur basse à la valeur haute.
 */
export const ECO_FIELDS = Object.freeze([
  Object.freeze({ key: 'air', label: 'Air', invert: true, words: Object.freeze(['pur', 'correct', 'chargé', 'mauvais', 'irrespirable']) }),
  Object.freeze({ key: 'water', label: 'Eau', invert: true, words: Object.freeze(['claire', 'correcte', 'trouble', 'polluée', 'très polluée']) }),
  Object.freeze({ key: 'fauna', label: 'Faune', invert: false, words: Object.freeze(['déserte', 'timide', 'vivante', 'riche', 'foisonnante']) }),
  Object.freeze({ key: 'soil', label: 'Fertilité', invert: false, words: Object.freeze(['épuisée', 'pauvre', 'moyenne', 'bonne', 'riche']) }),
]);

/** Appréciation d'une mesure d'écologie en un mot : ecoWord('air', 12) → « pur ». */
export function ecoWord(key, value) {
  const field = ECO_FIELDS.find((f) => f.key === key);
  const v = Number(value);
  if (!field || !Number.isFinite(v)) return '';
  return field.words[Math.min(4, Math.max(0, Math.floor(Math.max(0, Math.min(100, v)) / 20)))];
}

/**
 * Lignes du bloc écologie d'une case : [{ key, label, value, pct, word, invert }].
 * Les mesures absentes sont omises ; la fertilité n'apparaît que sur un sol cultivé (valeur > 0).
 */
export function ecoRows(eco) {
  if (!eco || typeof eco !== 'object') return [];
  const out = [];
  for (const field of ECO_FIELDS) {
    const v = Number(eco[field.key]);
    if (!Number.isFinite(v)) continue;
    if (field.key === 'soil' && v <= 0) continue;
    const pct = Math.round(Math.max(0, Math.min(100, v)));
    out.push({ key: field.key, label: field.label, value: v, pct, word: ecoWord(field.key, v), invert: field.invert });
  }
  return out;
}

/** « Espèces ici : Cerf, Renard » (chaîne vide si la parcelle n'en abrite aucune). */
export function ecoSpeciesText(eco) {
  const ids = eco && Array.isArray(eco.species) ? eco.species : [];
  if (!ids.length) return '';
  const names = ids.map((s) => (typeof s === 'string' ? speciesLabel(s) : speciesLabel(s?.id, s?.label))).filter(Boolean);
  return names.length ? `Espèces ici : ${names.join(', ')}` : '';
}

/** Lignes des rendements : « Recettes : 40 $/saison », « Entretien : 5 $/saison », « Emplois : 15 », « Capacité : 20 habitants ». */
export function yieldLines(yields = {}) {
  const out = [];
  if (Number.isFinite(yields.income) && yields.income !== 0) out.push(`Recettes : ${fmt(yields.income)} $/saison`);
  if (Number.isFinite(yields.upkeep) && yields.upkeep !== 0) out.push(`Entretien : ${fmt(yields.upkeep)} $/saison`);
  if (Number.isFinite(yields.jobs) && yields.jobs > 0) out.push(`Emplois : ${fmt(yields.jobs)}`);
  if (Number.isFinite(yields.capacity) && yields.capacity > 0) {
    const res = Number.isFinite(yields.residents) ? `${fmt(yields.residents)} / ` : '';
    out.push(`Habitants : ${res}${plural(yields.capacity, 'place')}`);
  }
  for (const [k, label] of [['energy', 'Énergie'], ['water', 'Eau'], ['food', 'Nourriture']]) {
    const v = yields[k];
    if (Number.isFinite(v) && v !== 0) out.push(`${label} : ${v > 0 ? '+' : '−'}${fmt(Math.abs(v))}`);
  }
  return out;
}

/** Titre de la liste des conditions selon le niveau. */
export function conditionsTitle(building, conditions) {
  if (!building) return '';
  if (!conditions || !conditions.length) return 'Au niveau maximal';
  return `Prochaine évolution (niveau ${(building.level || 1) + 1})`;
}

export function createTileSheet({ sheets, ops = {}, getGame, onDemolish, renderer = null, vibrate = null } = {}) {
  const buzz = (n) => { try { vibrate?.(n); } catch { /* rien */ } };
  let openAt = null; // { x, y }

  function describe(game, x, y) {
    try {
      const d = ops.describeTile ? ops.describeTile(game, x, y) : null;
      if (d) return d;
    } catch (err) {
      console.warn('describeTile :', err);
    }
    // Repli sans le cœur : lecture directe du monde.
    const tile = game?.world?.tiles?.[y * game.world.cols + x];
    if (!tile) return null;
    const def = tile.building ? TILE_BY_ID[tile.building.type] : null;
    return {
      terrainLabel: tile.terrain,
      native: !!tile.native,
      building: def ? { id: def.id, label: def.label, level: tile.building.level, family: def.family } : null,
      conditions: [],
      yields: {},
    };
  }

  function content(desc, x, y) {
    const b = desc.building;
    const id = b ? (b.id || b.type) : null;
    const def = id ? TILE_BY_ID[id] : null;
    const indestructible = !!b && (id === 'townhall' || def?.buyable === false || b.indestructible);
    const box = el('div.tile-sheet');
    box.append(
      el('p.tile-terrain', el('strong', desc.terrainLabel || 'Terrain'), desc.native ? el('span.tile-native', ' · nature d’origine') : null, el('span.tile-pos', ` · case ${x},${y}`)),
    );
    if (b) {
      const levelLabel = b.levelLabel || (def?.perLevel?.[b.level]?.label) || null;
      box.append(el('p.tile-level', `Niveau ${b.level || 1}${def?.levels > 1 ? ` sur ${def.levels}` : ''}${levelLabel ? ` · ${levelLabel}` : ''}`));
      if (def?.description) box.append(el('p.tile-desc', def.description));
      const lines = yieldLines(desc.yields || {});
      if (lines.length) box.append(el('ul.tile-yields', lines.map((t) => el('li', t))));
      if (Number.isFinite(desc.happiness)) {
        box.append(el('h3.tile-sub', `Bonheur local : ${Math.round(desc.happiness)}/100`));
        const adj = Array.isArray(desc.adjacency) ? desc.adjacency.filter((a) => a && a.value) : [];
        if (adj.length) box.append(el('ul.tile-yields.tile-adjacency', adj.map((a) => el(`li${a.value > 0 ? '.is-up' : '.is-down'}`, `${a.label} : ${signed(a.value)}`))));
      }
      const title = conditionsTitle(b, desc.conditions);
      if (title) {
        box.append(el('h3.tile-sub', title));
        if (desc.conditions && desc.conditions.length) {
          box.append(
            el('ul.cond-list', desc.conditions.map((c) => el(`li.cond${c.met ? '.is-met' : ''}`, el('span.cond-mark', { 'aria-hidden': 'true' }, c.met ? '✓' : '✗'), el('span.cond-text', c.label), el('span.visually-hidden', c.met ? ' (remplie)' : ' (manquante)')))),
          );
        }
      }
    } else {
      box.append(el('p.sheet-hint', desc.native ? 'Nature d’origine : la détruire coûte plus que replanter ne rapporte.' : 'Case libre : choisissez une tuile dans le catalogue pour y bâtir.'));
    }
    // Bloc écologie de la case (étape 4) : air, eau, faune, fertilité en barres courtes, puis les espèces.
    const eco = ecoSection(desc.eco);
    if (eco) box.append(eco);
    if (b && !indestructible) {
      box.append(
        el('div.sheet-actions', el('button.btn.btn--danger.tile-demolish', { type: 'button', onclick: () => { buzz(8); const at = openAt; close(); onDemolish?.(at.x, at.y); } }, 'Démolir · 10 $')),
      );
    } else if (b) {
      box.append(el('p.sheet-hint', 'La mairie est le cœur de la ville : elle ne se démolit pas.'));
    }
    return box;
  }

  /** Bloc « Écologie » : une barre courte par mesure, puis les espèces de la parcelle ; null si rien à dire. */
  function ecoSection(eco) {
    const rows = ecoRows(eco);
    const species = ecoSpeciesText(eco);
    if (!rows.length && !species) return null;
    const box = el('div.tile-eco', el('h3.tile-sub', 'Écologie'));
    if (rows.length) {
      box.append(
        el(
          'div.tile-eco-rows',
          rows.map((row) => el(
            `div.tile-eco-row${row.invert ? '.is-load' : '.is-life'}`,
            { dataset: { eco: row.key } },
            el('span.tile-eco-label', row.label),
            el('span.tile-eco-bar', { role: 'meter', 'aria-label': `${row.label} : ${row.word}`, 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(row.pct) }, el('span.tile-eco-fill', { style: { width: `${row.pct}%` } })),
            el('span.tile-eco-word', row.word),
          )),
        ),
      );
    }
    if (species) box.append(el('p.tile-eco-species', species));
    return box;
  }

  function open(x, y) {
    const game = getGame();
    const desc = describe(game, x, y);
    if (!desc) return false;
    openAt = { x, y };
    try { renderer?.setHighlight?.([{ x, y }]); } catch { /* rien */ }
    const b = desc.building;
    sheets.open({
      id: 'tile',
      title: b ? b.label : desc.terrainLabel || 'Case',
      content: content(desc, x, y),
      className: 'sheet--tile',
      onClose: () => {
        if (openAt && openAt.x === x && openAt.y === y) {
          openAt = null;
          try { renderer?.setHighlight?.(null); } catch { /* rien */ }
        }
      },
    });
    return true;
  }

  function close() {
    if (!openAt) return false;
    if (sheets.isOpen('tile')) sheets.close('close');
    openAt = null;
    return true;
  }

  return {
    open,
    close,
    isOpen: () => !!openAt && sheets.isOpen('tile'),
    get at() {
      return openAt;
    },
  };
}
