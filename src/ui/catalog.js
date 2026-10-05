// Catalogue : feuille coulissante par famille (docs/GAME_DESIGN.md §6.3, docs/ARCHITECTURE.md §9.3).
//
//   const catalog = createCatalog({ sheets, placement, getGame, vibrate, toasts, unlockHint });
//   catalog.open('habitat')     ouvre la feuille de la famille (ou « layers » : calques) ; rouvrir la même la ferme
//   catalog.close()             catalog.isOpen(id?)        catalog.current
//   catalog.refresh()           relit l'état (argent, déblocages, demande) et met les cartes à jour, feuille ouverte
//
// En tête : barres de demande (Habitat, Activité, Services) depuis `game.demand` (0..1 : ce qui manque).
// Cartes ≥ 64 px : nom, prix et entretien, pastille de la couleur de la famille, cadenas + condition si la
// tuile n'est pas dans `game.unlocked`, grisée (mais touchable) si `game.money < price`. Toucher une carte
// disponible → `placement.take(tileId)`, la feuille se replie. Toucher une carte verrouillée → message.
//
// Fonctions pures exportées (tests sous Node) : cardsFor, priceText, demandRows, lockTextOf.

import { el, clear, fmt } from './dom.js';
import { tilesOfFamily } from '../data/tiles.js';
import { FAMILIES, TOOLS } from './hud.js';

/** Couleur de pastille par famille (variables de la palette, css/style.css). */
export const FAMILY_SWATCH = Object.freeze({
  habitat: 'var(--c-roof-red)',
  activity: 'var(--c-roof-slate)',
  services: 'var(--c-sun)',
  infrastructure: 'var(--c-metal)',
  nature: 'var(--c-forest-dark)',
});

/** Barres de demande montrées en tête du catalogue, dans l'ordre. */
export const DEMAND_ROWS = Object.freeze([
  { key: 'habitat', label: 'Habitat' },
  { key: 'activity', label: 'Activité' },
  { key: 'services', label: 'Services' },
]);

/** Calques (famille « layers ») : informatifs tant que l'écologie n'est pas branchée (étape 3 bis). */
export const LAYER_CARDS = Object.freeze([
  { id: 'air', label: 'Air', color: 'var(--c-metal-light)', text: 'Gris → brun : la pollution de l’air' },
  { id: 'water', label: 'Eau', color: 'var(--c-river)', text: 'Bleu → vert sale : la qualité de l’eau' },
  { id: 'fauna', label: 'Faune', color: 'var(--c-forest-dark)', text: 'Habitats et corridors' },
]);

/** « 60 $ » ; avec l'entretien : « 60 $ · 5 $/mois ». */
export function priceText(def, { upkeep = true } = {}) {
  const base = `${fmt(def.price || 0)} $`;
  return upkeep && def.upkeep > 0 ? `${base} · ${fmt(def.upkeep)} $/mois` : base;
}

/** Condition de déblocage à afficher : fournie par le cœur (unlockHint) ou générique. */
export function lockTextOf(id, game, unlockHint) {
  let hint = null;
  try { hint = typeof unlockHint === 'function' ? unlockHint(id, game) : null; } catch { hint = null; }
  if (!hint && game && game.unlockHints && typeof game.unlockHints[id] === 'string') hint = game.unlockHints[id];
  return hint || 'Se débloque en avançant dans la partie';
}

/** Vrai si la tuile est débloquée : sans liste `unlocked` (cœur absent), tout est ouvert. */
export function isUnlocked(id, game) {
  if (!game || !Array.isArray(game.unlocked)) return true;
  return game.unlocked.includes(id);
}

/**
 * Cartes d'une famille : [{ id, label, price, upkeep, description, color, locked, lockText, poor }],
 * dans l'ordre du catalogue, sans la mairie (buyable: false).
 */
export function cardsFor(familyId, game = null, unlockHint = null) {
  return tilesOfFamily(familyId)
    .filter((t) => t.buyable !== false)
    .map((t) => {
      const locked = !isUnlocked(t.id, game);
      return {
        id: t.id,
        label: t.label,
        price: t.price || 0,
        upkeep: t.upkeep || 0,
        description: t.description || '',
        color: FAMILY_SWATCH[t.family] || 'var(--c-sidewalk)',
        locked,
        lockText: locked ? lockTextOf(t.id, game, unlockHint) : '',
        poor: !!game && Number.isFinite(game.money) && game.money < (t.price || 0),
      };
    });
}

/** Lignes des barres de demande : [{ key, label, value (0..1), percent }]. */
export function demandRows(game) {
  const d = (game && game.demand) || {};
  return DEMAND_ROWS.map((row) => {
    const v = Math.max(0, Math.min(1, Number(d[row.key]) || 0));
    return { ...row, value: v, percent: Math.round(v * 100) };
  });
}

/** Petit cadenas en SVG (aucune ressource externe, aucun emoji dépendant de la police). */
export function lockIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('ico-lock');
  const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  body.setAttribute('x', '5'); body.setAttribute('y', '10'); body.setAttribute('width', '14'); body.setAttribute('height', '11'); body.setAttribute('rx', '2');
  body.setAttribute('fill', 'currentColor');
  const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  arc.setAttribute('d', 'M8 10V7a4 4 0 0 1 8 0v3');
  arc.setAttribute('fill', 'none'); arc.setAttribute('stroke', 'currentColor'); arc.setAttribute('stroke-width', '2.4'); arc.setAttribute('stroke-linecap', 'round');
  svg.append(body, arc);
  return svg;
}

export function createCatalog({ sheets, placement, getGame, vibrate, toasts, unlockHint = null } = {}) {
  const buzz = (n) => { try { vibrate?.(n); } catch { /* rien */ } };
  let current = null; // identifiant de la feuille ouverte par le catalogue
  let grid = null;
  let demandNode = null;

  const titleOf = (id) => ([...FAMILIES, ...TOOLS].find((f) => f.id === id) || { title: id }).title;

  // ── Barres de demande ─────────────────────────────────────────────────────────
  function renderDemand(game) {
    const node = el('div.demand', { role: 'group', 'aria-label': 'Ce qui manque à la ville' });
    for (const row of demandRows(game)) {
      node.append(
        el(
          'div.demand-row',
          { title: `${row.label} : ${row.percent} %` },
          el('span.demand-label', row.label),
          el('span.demand-bar', { role: 'meter', 'aria-label': `Demande ${row.label}`, 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(row.percent) }, el('span.demand-fill', { style: { width: `${row.percent}%` } })),
          el('span.demand-value', `${row.percent} %`),
        ),
      );
    }
    return node;
  }

  // ── Cartes ────────────────────────────────────────────────────────────────────
  function renderCard(card) {
    const price = card.locked ? el('span.card-price.card-price--locked', lockIcon(), el('span', card.lockText)) : el('span.card-price', priceText(card));
    const node = el(
      `button.card${card.locked ? '.is-locked' : ''}${card.poor && !card.locked ? '.is-poor' : ''}`,
      {
        type: 'button',
        dataset: { id: card.id },
        'aria-label': card.locked ? `${card.label}, verrouillé : ${card.lockText}` : `${card.label}, ${priceText(card)}${card.poor ? ', trop cher pour le moment' : ''}`,
        'aria-disabled': card.locked ? 'true' : undefined,
        onclick: () => pick(card),
      },
      el('span.card-swatch', { style: { '--sw': card.color } }, card.locked ? lockIcon() : null),
      el('span.card-body', el('span.card-title', card.label), price),
    );
    return node;
  }

  function pick(card) {
    const game = getGame?.();
    const fresh = cardsFor(current, game, unlockHint).find((c) => c.id === card.id) || card;
    if (fresh.locked) {
      buzz(20);
      toasts?.show({ key: 'lock', kind: 'warn', title: `${fresh.label} : verrouillé`, text: fresh.lockText, duration: 3500 });
      return;
    }
    buzz(8);
    placement?.take(fresh.id);
    close('pick');
  }

  function renderFamily(id, game) {
    const body = el('div.catalog');
    demandNode = renderDemand(game);
    body.append(demandNode);
    grid = el('div.card-grid');
    const cards = cardsFor(id, game, unlockHint);
    if (!cards.length) grid.append(el('p.sheet-hint', 'Rien à construire dans cette famille pour le moment.'));
    for (const c of cards) grid.append(renderCard(c));
    body.append(grid);
    return body;
  }

  function renderLayers() {
    const body = el('div.catalog');
    body.append(el('p.sheet-hint', 'Un seul calque à la fois, coloré sur la carte. Les calques s’allumeront avec l’écologie (air, eau, faune) : étape suivante.'));
    const g = el('div.card-grid');
    for (const l of LAYER_CARDS) {
      g.append(
        el(
          'button.card.is-locked',
          { type: 'button', dataset: { layer: l.id }, 'aria-disabled': 'true', 'aria-label': `${l.label} : bientôt`, onclick: () => toasts?.show({ key: 'layer', text: `Calque ${l.label} : bientôt.`, duration: 2000 }) },
          el('span.card-swatch', { style: { '--sw': l.color } }),
          el('span.card-body', el('span.card-title', l.label), el('span.card-price', l.text)),
        ),
      );
    }
    body.append(g);
    return body;
  }

  function open(id) {
    if (current === id && sheets.isOpen(id)) {
      close('toggle');
      return false;
    }
    const game = getGame?.();
    const content = id === 'layers' ? renderLayers() : renderFamily(id, game);
    current = id;
    sheets.open({
      id,
      title: titleOf(id),
      content,
      className: `sheet--catalog sheet--${id}`,
      onClose: () => {
        if (current === id) current = null;
        grid = null;
        demandNode = null;
      },
    });
    return true;
  }

  function close(reason = 'close') {
    if (!current) return false;
    const id = current;
    current = null;
    if (sheets.isOpen(id)) sheets.close(reason);
    return true;
  }

  /** L'état a changé (argent, déblocage, demande) : cartes et barres mises à jour sans rouvrir. */
  function refresh() {
    if (!current || !sheets.isOpen(current) || current === 'layers' || !grid) return;
    const game = getGame?.();
    const cards = cardsFor(current, game, unlockHint);
    const byId = new Map(cards.map((c) => [c.id, c]));
    for (const node of [...grid.children]) {
      const c = byId.get(node.dataset?.id);
      if (!c) continue;
      const wasLocked = node.classList.contains('is-locked');
      if (wasLocked !== c.locked) {
        node.replaceWith(renderCard(c));
        continue;
      }
      node.classList.toggle('is-poor', c.poor && !c.locked);
    }
    if (demandNode) {
      const fresh = renderDemand(game);
      demandNode.replaceWith(fresh);
      demandNode = fresh;
    }
  }

  return {
    open,
    close,
    refresh,
    isOpen: (id) => !!current && sheets.isOpen(id || current) && (!id || current === id),
    get current() {
      return current;
    },
  };
}
