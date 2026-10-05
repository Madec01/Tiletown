// Pose et démolition en deux temps (docs/MOBILE.md, docs/GAME_DESIGN.md §9, docs/ARCHITECTURE.md §9.3).
//
//   const placement = createPlacement({ bar, renderer, ops, getGame, apply, toasts, vibrate, back, onState });
//   ops : { canPlace(game, x, y, id), place(game, x, y, id, nowSeconds), demolish(game, x, y),
//           undoLast(game, nowSeconds), previewYaw?(game, x, y, res) }  (fonctions pures du cœur)
//   apply(nextGame, meta) : l'appelant (main.js) remplace l'état, pousse le monde au rendu, sauvegarde.
//
//   placement.take(tileId)        tuile « en main » (pastille au-dessus des onglets, ✕ pour lâcher)
//   placement.tap({ x, y } | null) → bool   toucher sur la carte : consommé par l'outil ?
//   placement.preview(x, y)       fantôme sur la case (canPlace → r.setGhost) + bandeau de résumé + ✓
//   placement.confirm()           pose (place) ou démolit ; la tuile reste en main pour enchaîner
//   placement.drop()              lâche tout (✕, retour arrière, Échap) → idle
//   placement.setTool('demolish') outil Démolir : toucher un îlot → surbrillance rouge + « Démolir · 10 $ » + ✓
//   placement.demolishAt(x, y)    entre dans la confirmation de démolition d'une case (depuis la fiche)
//   placement.refresh()           l'état a changé (argent…) : réévalue le fantôme et le bandeau
//   placement.undo()              annule la dernière pose si la fenêtre de 10 s court encore
//   placement.state  'idle' | 'hand' | 'ghost' | 'demolish' | 'demolish-target'
//   placement.hand   tileId | null        placement.ghost   { x, y, tileId, ok, res } | null
//
// La barre d'action (#action, au-dessus des onglets, moitié basse de l'écran) porte une ligne de texte et deux
// boutons : ✓ (56 px) et ✕ (48 px). Tout texte est en HTML ; la scène ne montre que le fantôme et la surbrillance.
// Fonctions pures exportées (tests) : costText, reasonText, ghostStatus, costParts.

import { el, clear, fmt, setText } from './dom.js';
import { TILE_BY_ID } from '../data/tiles.js';
import { TERRAINS } from '../data/terrain.js';

export const DEMOLISH_COST = 10;
export const UNDO_TOAST_MS = 10000;

/** Parts du coût d'une pose : [{ label, amount }] (prix, défrichement, rue / pont) et total. */
export function costParts(def, res = {}) {
  const price = Number(def?.price) || 0;
  const clearing = Math.max(0, Number(res.clearing) || 0);
  const path = Array.isArray(res.path) ? res.path : [];
  const roadInfo = res.road && typeof res.road === 'object' ? res.road.cost : res.road;
  let road = Number.isFinite(roadInfo) ? roadInfo : Number.isFinite(res.roadCost) ? res.roadCost : null;
  if (road === null) road = Number.isFinite(res.cost) ? Math.max(0, Math.round(res.cost - price - clearing)) : 0;
  const parts = [{ label: def?.label || 'Tuile', amount: price }];
  if (clearing > 0) parts.push({ label: 'défrichement', amount: clearing });
  if (road > 0 || path.length) parts.push({ label: path.some((e) => e.value === 3) ? 'rue et pont' : 'rue', amount: road });
  const total = Number.isFinite(res.cost) ? res.cost : parts.reduce((s, p) => s + p.amount, 0);
  return { parts, total };
}

/** « Quartier · 60 $ + défrichement 80 $ + rue 20 $ = 160 $ » (ou « Quartier · 60 $ » sans surcoût). */
export function costText(def, res = {}) {
  const { parts, total } = costParts(def, res);
  const [first, ...rest] = parts;
  if (!rest.length) return `${first.label} · ${fmt(first.amount)} $`;
  return `${first.label} · ${fmt(first.amount)} $ ${rest.map((p) => `+ ${p.label} ${fmt(p.amount)} $`).join(' ')} = ${fmt(total)} $`;
}

/** Raison d'un refus en clair (reason de canPlace / place / demolish). */
export function reasonText(reason, { def = null, terrain = null, hint = null } = {}) {
  switch (reason) {
    case 'locked': return `Verrouillé : ${hint || 'se débloque en avançant dans la partie'}`;
    case 'terrain': {
      const t = terrain && TERRAINS[terrain];
      if (t && t.water) return 'Pas sur l’eau';
      if (terrain === 'hill') return 'Pas sur une colline';
      return t ? `Pas sur ${t.label.toLowerCase().startsWith('h') || t.label.toLowerCase().startsWith('é') ? 'l’' : 'la '}${t.label.toLowerCase()}` : 'Ce terrain ne s’y prête pas';
    }
    case 'occupied': return 'La case est déjà occupée';
    case 'money': return 'Pas assez d’argent';
    case 'unreachable': return 'Il faut passer par la terre ferme';
    case 'no_network': return 'Aucune rue à rejoindre';
    case 'out_of_bounds': return 'Hors de la vallée';
    case 'adjacent': return def && def.requires && def.requires.adjacent ? `Se pose au bord de l’eau` : 'Il manque un voisin';
    case 'townhall':
    case 'protected':
    case 'indestructible': return 'La mairie ne se démolit pas';
    case 'empty': return 'Rien à démolir ici';
    case 'undo_expired': return 'Trop tard pour annuler';
    default: return reason ? `Impossible ici (${reason})` : 'Impossible ici';
  }
}

/** Couleur du fantôme : vert (ok), jaune (ok mais défrichement ou rue à construire), rouge (refus). */
export function ghostStatus(res) {
  if (!res || !res.ok) return false;
  const path = Array.isArray(res.path) ? res.path : [];
  return (Number(res.clearing) > 0 || path.length > 0) ? 'warn' : true;
}

const nowSeconds = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;

export function createPlacement({ bar, renderer = null, ops = {}, getGame, apply, toasts = null, vibrate = null, back = null, onState = null, unlockHint = null } = {}) {
  const buzz = (n) => { try { vibrate?.(n); } catch { /* rien */ } };
  const r = renderer;
  let state = 'idle';
  let hand = null; // tileId en main
  let ghost = null; // { x, y, tileId, ok, res }
  let target = null; // { x, y } : case visée par l'outil Démolir
  let undoNode = null; // message « Annuler » affiché

  // ── Barre d'action ────────────────────────────────────────────────────────────
  const title = el('strong.action-title', '');
  const sub = el('span.action-sub', '');
  const text = el('div.action-text', title, sub);
  const okBtn = el('button.btn.action-ok', { type: 'button', 'aria-label': 'Confirmer', onclick: () => confirm() }, '✓');
  const xBtn = el('button.btn.btn--ghost.action-x', { type: 'button', 'aria-label': 'Lâcher', onclick: () => { buzz(6); drop(); } }, '✕');
  clear(bar).append(text, okBtn, xBtn);

  function setBar({ open, titleText = '', subText = '', ok = null, kind = '' }) {
    bar.classList.toggle('is-open', !!open);
    bar.className = `${bar.className.replace(/\baction--\S+/g, '').trim()}${kind ? ` action--${kind}` : ''}`.trim();
    bar.setAttribute('aria-hidden', open ? 'false' : 'true');
    setText(title, titleText);
    setText(sub, subText);
    okBtn.hidden = ok === null;
    okBtn.setAttribute('aria-disabled', ok === false ? 'true' : 'false');
    okBtn.classList.toggle('is-disabled', ok === false);
  }

  function setState(next) {
    if (state === next) return;
    const prev = state;
    state = next;
    if (next === 'idle') back?.release?.('tool'); else back?.hold?.('tool');
    try { onState?.(next, prev); } catch { /* rien */ }
  }

  const clearGhost = () => { if (ghost) { ghost = null; try { r?.setGhost?.(null); } catch { /* rien */ } } };
  const clearTarget = () => { if (target) { target = null; try { r?.setHighlight?.(null); } catch { /* rien */ } } };

  // ── Tuile en main ─────────────────────────────────────────────────────────────
  function take(tileId) {
    const def = TILE_BY_ID[tileId];
    if (!def) return false;
    clearTarget();
    clearGhost();
    hand = tileId;
    setState('hand');
    setBar({ open: true, titleText: `En main : ${def.label} · ${fmt(def.price)} $`, subText: 'Touchez une case pour voir le fantôme', ok: null, kind: 'hand' });
    return true;
  }

  function drop() {
    clearGhost();
    clearTarget();
    hand = null;
    setBar({ open: false });
    setState('idle');
  }

  // ── Fantôme ───────────────────────────────────────────────────────────────────
  function preview(x, y) {
    if (!hand) return null;
    const game = getGame();
    const def = TILE_BY_ID[hand];
    let res;
    try { res = ops.canPlace(game, x, y, hand); } catch (err) { console.warn('canPlace :', err); res = { ok: false, reason: 'error' }; }
    if (!res || typeof res !== 'object') res = { ok: false, reason: 'error' };
    const ok = ghostStatus(res);
    let yaw = 0;
    try { yaw = ops.previewYaw ? (ops.previewYaw(game, x, y, res) || 0) : 0; } catch { yaw = 0; }
    ghost = { x, y, tileId: hand, ok, res };
    try { r?.setGhost?.({ x, y, tileId: hand, ok, path: Array.isArray(res.path) ? res.path : [], yaw }); } catch (err) { console.warn('setGhost :', err); }
    const tile = game?.world?.tiles?.[y * game.world.cols + x];
    if (res.ok) {
      setBar({ open: true, titleText: costText(def, res), subText: 'Touchez à nouveau la case ou ✓ pour poser', ok: true, kind: ok === 'warn' ? 'warn' : 'ok' });
    } else {
      setBar({ open: true, titleText: costText(def, res), subText: reasonText(res.reason, { def, terrain: tile?.terrain, hint: unlockHint?.(hand, game) }), ok: false, kind: 'no' });
    }
    setState('ghost');
    return ghost;
  }

  // ── Démolition ────────────────────────────────────────────────────────────────
  function setTool(tool) {
    if (tool !== 'demolish') { drop(); return false; }
    clearGhost();
    hand = null;
    clearTarget();
    setState('demolish');
    setBar({ open: true, titleText: `Démolir · ${fmt(DEMOLISH_COST)} $`, subText: 'Touchez un îlot à démolir', ok: null, kind: 'demolish' });
    return true;
  }

  function demolishAt(x, y) {
    const game = getGame();
    const tile = game?.world?.tiles?.[y * game.world.cols + x];
    if (!tile || !tile.building) {
      toasts?.show({ key: 'demolish', kind: 'info', text: reasonText('empty'), duration: 1800 });
      return false;
    }
    const def = TILE_BY_ID[tile.building.type];
    if (state !== 'demolish' && state !== 'demolish-target') setTool('demolish');
    if (tile.building.type === 'townhall' || def?.buyable === false) {
      clearTarget();
      buzz(20);
      setBar({ open: true, titleText: `${def?.label || 'Mairie'}`, subText: reasonText('townhall'), ok: false, kind: 'no' });
      setState('demolish');
      return false;
    }
    target = { x, y };
    try { r?.setHighlight?.([{ x, y }]); } catch { /* rien */ }
    setBar({ open: true, titleText: `Démolir ${def?.label || tile.building.type} · ${fmt(DEMOLISH_COST)} $`, subText: 'Touchez à nouveau ou ✓ pour confirmer', ok: true, kind: 'demolish' });
    setState('demolish-target');
    return true;
  }

  // ── Toucher sur la carte ──────────────────────────────────────────────────────
  function tap(hit) {
    if (state === 'idle') return false;
    if (!hit) {
      if (state === 'hand' || state === 'ghost') toasts?.show({ key: 'tile', text: 'Hors de la vallée', duration: 1500 });
      return true;
    }
    if (state === 'hand') { buzz(6); preview(hit.x, hit.y); return true; }
    if (state === 'ghost') {
      if (ghost && ghost.x === hit.x && ghost.y === hit.y) confirm();
      else { buzz(6); preview(hit.x, hit.y); }
      return true;
    }
    if (state === 'demolish') { buzz(6); demolishAt(hit.x, hit.y); return true; }
    if (state === 'demolish-target') {
      if (target && target.x === hit.x && target.y === hit.y) confirm();
      else { buzz(6); demolishAt(hit.x, hit.y); }
      return true;
    }
    return false;
  }

  // ── Confirmation ──────────────────────────────────────────────────────────────
  function confirm() {
    if (state === 'ghost' && ghost) return confirmPlace();
    if (state === 'demolish-target' && target) return confirmDemolish();
    return false;
  }

  function confirmPlace() {
    const game = getGame();
    const { x, y, tileId, res } = ghost;
    const def = TILE_BY_ID[tileId];
    if (!res.ok) {
      buzz(20);
      toasts?.show({ key: 'place', kind: 'warn', text: reasonText(res.reason, { def, hint: unlockHint?.(tileId, game) }), duration: 2500 });
      return false;
    }
    let out;
    try { out = ops.place(game, x, y, tileId, nowSeconds()); } catch (err) { console.warn('place :', err); out = { ok: false, reason: 'error' }; }
    if (!out || !out.ok) {
      buzz(20);
      toasts?.show({ key: 'place', kind: 'warn', text: reasonText(out && out.reason, { def }), duration: 2500 });
      refresh();
      return false;
    }
    const cost = Number.isFinite(out.cost) ? out.cost : costParts(def, res).total;
    clearGhost();
    apply(out.game, { kind: 'place', x, y, tileId, cost, events: out.events || [] });
    buzz(12);
    undoNode = toasts?.show({
      key: 'undo', kind: 'money', title: `${def.label} posé${/e$/i.test(def.label) ? 'e' : ''} · −${fmt(cost)} $`, text: 'Remboursement intégral pendant 10 s.',
      actionLabel: 'Annuler', onClick: () => undo(), duration: UNDO_TOAST_MS,
    }) || null;
    // La tuile reste en main pour enchaîner.
    setBar({ open: true, titleText: `En main : ${def.label} · ${fmt(def.price)} $`, subText: 'Touchez une autre case pour continuer', ok: null, kind: 'hand' });
    setState('hand');
    return true;
  }

  function confirmDemolish() {
    const game = getGame();
    const { x, y } = target;
    const tile = game?.world?.tiles?.[y * game.world.cols + x];
    const def = tile?.building ? TILE_BY_ID[tile.building.type] : null;
    let out;
    try { out = ops.demolish(game, x, y); } catch (err) { console.warn('demolish :', err); out = { ok: false, reason: 'error' }; }
    if (!out || !out.ok) {
      buzz(20);
      toasts?.show({ key: 'demolish', kind: 'warn', text: reasonText(out && out.reason), duration: 2500 });
      clearTarget();
      setTool('demolish');
      return false;
    }
    clearTarget();
    apply(out.game, { kind: 'demolish', x, y, cost: Number.isFinite(out.cost) ? out.cost : DEMOLISH_COST });
    buzz(12);
    toasts?.show({ key: 'demolish', kind: 'money', text: `${def?.label || 'Îlot'} démoli · −${fmt(Number.isFinite(out.cost) ? out.cost : DEMOLISH_COST)} $`, duration: 2500 });
    setTool('demolish'); // l'outil reste actif pour enchaîner
    return true;
  }

  // ── Annulation (10 s) ─────────────────────────────────────────────────────────
  function undo() {
    const game = getGame();
    if (!game?.undo) {
      toasts?.show({ key: 'undo', kind: 'info', text: reasonText('undo_expired'), duration: 2000 });
      return false;
    }
    let next;
    try { next = ops.undoLast(game, nowSeconds()); } catch (err) { console.warn('undoLast :', err); next = game; }
    if (!next || next === game) {
      toasts?.show({ key: 'undo', kind: 'info', text: reasonText('undo_expired'), duration: 2000 });
      return false;
    }
    clearGhost();
    clearTarget();
    apply(next, { kind: 'undo' });
    buzz(8);
    if (undoNode) { toasts?.hide(undoNode); undoNode = null; }
    toasts?.show({ key: 'undone', kind: 'success', text: 'Pose annulée · remboursée.', duration: 2500 });
    if (state === 'ghost') setState('hand');
    if (state === 'demolish-target') setTool('demolish');
    return true;
  }

  /** L'état a changé (argent, mois…) : le fantôme et le bandeau sont réévalués. */
  function refresh() {
    if (state === 'ghost' && ghost) preview(ghost.x, ghost.y);
    else if (state === 'demolish-target' && target) {
      const game = getGame();
      const tile = game?.world?.tiles?.[target.y * game.world.cols + target.x];
      if (!tile?.building) setTool('demolish');
    }
  }

  setBar({ open: false });

  return {
    take, drop, preview, tap, confirm, setTool, demolishAt, undo, refresh,
    get state() { return state; },
    get hand() { return hand; },
    get ghost() { return ghost; },
    get target() { return target; },
    get tool() { return state === 'demolish' || state === 'demolish-target' ? 'demolish' : hand ? 'build' : null; },
    destroy() { drop(); clear(bar); },
  };
}
