// Bandeau d'objectifs (docs/ARCHITECTURE.md §11.3) : une ligne discrète sous les jauges, repliée par
// défaut (« Objectifs 1/2 »), dépliable d'un tap. Dépliée, chaque objectif montre son libellé, sa
// valeur courante, sa cible, et une coche quand il est atteint. Mis à jour à chaque tick de mois.
//
//   const goals = createGoals(host, { vibrate, onToggle });
//   goals.setGoals([ { id, label, done, value, target } ], { title: 'La première vallée · an 1 sur 3' });
//   goals.expand()   goals.collapse()   goals.toggle()   goals.isOpen()
//   goals.show()     goals.hide()       goals.visible    goals.height
//
// Le bandeau n'apparaît qu'en carrière (le bac à sable n'a pas d'objectif). Il ne bloque jamais la
// carte : il fait partie de la zone haute de l'interface, comptée dans les marges du rendu.
//
// Fonctions pures exportées (tests sous Node) : goalSummary, goalValueText, goalPercent, goalRows.

import { el, clear, fmt, setText } from './dom.js';

/** Lignes sûres (jamais undefined) à partir de ce que renvoie `evaluateGoals(game, level)`. */
export function goalRows(goals) {
  return (Array.isArray(goals) ? goals : []).map((g, i) => ({
    id: g && g.id ? String(g.id) : `goal-${i}`,
    label: (g && g.label) || 'Objectif',
    value: Math.round(Number(g && g.value) || 0),
    target: Math.round(Number(g && g.target) || 0),
    done: !!(g && g.done),
    // Le cœur sait écrire certaines mesures mieux que « valeur / cible » (« 3 espèces sur 5 »).
    text: g && typeof g.text === 'string' && g.text ? g.text : null,
  }));
}

/** « Objectifs 1/2 » (et « Objectifs atteints » quand tout est fait). */
export function goalSummary(goals) {
  const rows = goalRows(goals);
  const done = rows.filter((r) => r.done).length;
  const total = rows.length;
  const text = total === 0 ? 'Aucun objectif' : done === total ? 'Objectifs atteints' : `Objectifs ${done}/${total}`;
  return { done, total, text, all: total > 0 && done === total };
}

/** « 87 / 120 » (valeur courante sur cible), ou le texte que le cœur fournit déjà. */
export function goalValueText(goal) {
  const r = goalRows([goal])[0];
  return r.text || `${fmt(r.value)} / ${fmt(r.target)}`;
}

/** Avancement d'un objectif, de 0 à 100 (pour la petite barre). */
export function goalPercent(goal) {
  const r = goalRows([goal])[0];
  if (r.done) return 100;
  if (!(r.target > 0)) return 0;
  return Math.max(0, Math.min(100, Math.round((r.value / r.target) * 100)));
}

export function createGoals(host, { vibrate = null, onToggle = null } = {}) {
  const buzz = (n) => { try { vibrate?.(n); } catch { /* rien */ } };
  let open = false;
  let visible = false;
  let rows = [];
  let titleText = '';

  const summary = el('span.goals-summary', 'Objectifs');
  const note = el('span.goals-note', '');
  const chevron = el('span.goals-chevron', { 'aria-hidden': 'true' });
  const head = el(
    'button.goals-head',
    {
      type: 'button',
      'aria-expanded': 'false',
      'aria-controls': 'goals-list',
      'aria-label': 'Objectifs du niveau',
      onclick: () => { buzz(6); toggle(); },
    },
    summary,
    note,
    chevron,
  );
  const list = el('ul.goals-list', { id: 'goals-list' });
  const node = el('div.goals-box', head, list);

  function renderHead() {
    const s = goalSummary(rows);
    setText(summary, s.text);
    setText(note, titleText);
    head.classList.toggle('is-all', s.all);
    head.setAttribute('aria-label', titleText ? `${s.text} — ${titleText}` : s.text);
  }

  function renderList() {
    clear(list);
    for (const r of rows) {
      list.append(
        el(
          `li.goal${r.done ? '.is-done' : ''}`,
          { dataset: { goal: r.id, done: r.done ? '1' : '0' } },
          el('span.goal-mark', { 'aria-hidden': 'true' }, r.done ? '✓' : ''),
          el('span.goal-label', r.label),
          el('span.goal-bar', { 'aria-hidden': 'true' }, el('span.goal-fill', { style: { width: `${goalPercent(r)}%` } })),
          el('span.goal-value', goalValueText(r)),
        ),
      );
    }
    if (!rows.length) list.append(el('li.goal.goal--empty', el('span.goal-label', 'Aucun objectif : jouez comme vous voulez.')));
  }

  function apply() {
    host.classList.toggle('is-open', visible);
    host.hidden = !visible;
    node.classList.toggle('is-expanded', open);
    head.setAttribute('aria-expanded', open ? 'true' : 'false');
    list.hidden = !open;
    document.body.classList.toggle('has-goals', visible);
  }

  function toggle() {
    open = !open;
    apply();
    if (open) renderList();
    try { onToggle?.(open); } catch { /* rien */ }
    return open;
  }

  clear(host).append(node);
  apply();
  renderHead();
  renderList();

  return {
    node,
    /** Remplace les objectifs ; `title` complète la ligne repliée (« La première vallée · an 1 sur 3 »). */
    setGoals(goals, { title = null } = {}) {
      rows = goalRows(goals);
      if (title !== null) titleText = String(title || '');
      renderHead();
      if (open) renderList();
      return rows;
    },
    show() { visible = true; apply(); return true; },
    hide() { visible = false; open = false; apply(); return true; },
    expand() { if (!open) toggle(); return open; },
    collapse() { if (open) toggle(); return open; },
    toggle,
    isOpen: () => open,
    get visible() { return visible; },
    get rows() { return rows.map((r) => ({ ...r })); },
    get height() { return visible ? Math.round(host.getBoundingClientRect().height) : 0; },
  };
}
