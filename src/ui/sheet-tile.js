// Fiche d'une case (appui long sur la carte) : terrain, bâtiment et niveau, conditions de la prochaine
// évolution (cochées ou non), recettes et entretien, bouton Démolir (docs/GAME_DESIGN.md §9, ARCHITECTURE §9.3).
//
//   const tileSheet = createTileSheet({ sheets, ops: { describeTile }, getGame, onDemolish, renderer, vibrate });
//   tileSheet.open(x, y)      ouvre la fiche (feuille coulissante) et surligne la case
//   tileSheet.close()         tileSheet.isOpen()
//
// `describeTile(game, x, y)` (cœur, pur) → { terrainLabel, native, building: { id | type, label, level, levelLabel,
// family } | null, conditions: [{ label, met }], yields: { income, upkeep, jobs, capacity, residents } }.
// Fonctions pures exportées (tests) : yieldLines, conditionsTitle.

import { el, fmt, plural, signed } from './dom.js';
import { TILE_BY_ID } from '../data/tiles.js';

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
      if (!indestructible) {
        box.append(
          el('div.sheet-actions', el('button.btn.btn--danger.tile-demolish', { type: 'button', onclick: () => { buzz(8); const at = openAt; close(); onDemolish?.(at.x, at.y); } }, 'Démolir · 10 $')),
        );
      } else {
        box.append(el('p.sheet-hint', 'La mairie est le cœur de la ville : elle ne se démolit pas.'));
      }
    } else {
      box.append(el('p.sheet-hint', desc.native ? 'Nature d’origine : la détruire coûte plus que replanter ne rapporte.' : 'Case libre : choisissez une tuile dans le catalogue pour y bâtir.'));
    }
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
