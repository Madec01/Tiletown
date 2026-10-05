// Carte de carrière (docs/ARCHITECTURE.md §11.3) : les niveaux en liste verticale défilante, un par
// carte — titre, sous-titre, étoiles gagnées sur trois, et état (verrouillé avec sa condition,
// ouvert, terminé). Le bouton Jouer fait au moins 56 px, tout ce qui se touche au moins 48 px.
//
//   const map = createCareerMap(host, { vibrate, onPlay, onBack });
//   map.open({ levels, career })    map.refresh({ levels, career })    map.close()    map.isOpen()
//
// Fonctions pures exportées (tests sous Node) : levelState, levelRows, lockTextOf, starGlyphs,
// playLabel, progressText.

import { el, clear } from './dom.js';

export const MAX_STARS = 3;

/** État d'un niveau pour la carte : 'done' (déjà réussi), 'open' (jouable), 'locked'. */
export function levelState(level, career) {
  const id = level && level.id;
  const unlocked = (career && career.unlocked) || [];
  const stars = (career && career.stars) || {};
  if (!unlocked.includes(id)) return 'locked';
  return Object.prototype.hasOwnProperty.call(stars, id) ? 'done' : 'open';
}

/** Condition d'ouverture d'un niveau verrouillé, en une phrase (« Réussissez La première vallée »). */
export function lockTextOf(level, levels = [], career = null) {
  const i = levels.findIndex((l) => l.id === (level && level.id));
  const prev = i > 0 ? levels[i - 1] : null;
  if (!prev) return 'Se débloque en avançant dans la carrière';
  const done = career && career.stars && Object.prototype.hasOwnProperty.call(career.stars, prev.id);
  return done ? 'Bientôt ouvert' : `Terminez « ${prev.title} » pour l’ouvrir`;
}

/** Trois caractères d'étoile : pleines pour celles qui sont gagnées (« ★★☆ »), pour l'aide vocale. */
export function starGlyphs(n, max = MAX_STARS) {
  const got = Math.max(0, Math.min(max, Math.round(Number(n) || 0)));
  return '★'.repeat(got) + '☆'.repeat(max - got);
}

/**
 * Étoile dessinée en SVG (aucune ressource externe, aucun caractère dépendant de la police) :
 * pleine quand elle est gagnée, creuse sinon.
 */
export function starIcon(filled, size = 20) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('ico-star');
  if (filled) svg.classList.add('is-on');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', 'M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.45 6.19 20.5 7.3 14.03 2.6 9.45l6.5-.95z');
  path.setAttribute('fill', filled ? 'currentColor' : 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.8');
  path.setAttribute('stroke-linejoin', 'round');
  svg.append(path);
  return svg;
}

/** Rangée de `max` étoiles en SVG, les `n` premières pleines. */
export function starRow(n, max = MAX_STARS, size = 20) {
  const got = Math.max(0, Math.min(max, Math.round(Number(n) || 0)));
  const out = [];
  for (let i = 0; i < max; i++) out.push(starIcon(i < got, size));
  return out;
}

/** Libellé du bouton d'un niveau selon son état. */
export function playLabel(state) {
  if (state === 'done') return 'Rejouer';
  if (state === 'open') return 'Jouer';
  return 'Verrouillé';
}

/** Lignes de la carte : [ { id, title, subtitle, state, stars, lockText, years, goals } ]. */
export function levelRows(levels = [], career = null) {
  return levels.map((l) => {
    const state = levelState(l, career);
    return {
      id: l.id,
      title: l.title,
      subtitle: l.subtitle || '',
      years: Number(l.years) || 3,
      goals: (l.goals || []).map((g) => g.label),
      state,
      stars: Math.max(0, Math.min(MAX_STARS, Math.round(Number((career && career.stars && career.stars[l.id]) || 0)))),
      lockText: state === 'locked' ? lockTextOf(l, levels, career) : '',
    };
  });
}

/** « 4 étoiles sur 15 · 2 vallées réussies ». */
export function progressText(rows = []) {
  const stars = rows.reduce((a, r) => a + r.stars, 0);
  const done = rows.filter((r) => r.state === 'done').length;
  const max = rows.length * MAX_STARS;
  const vallees = done <= 1 ? `${done} vallée réussie` : `${done} vallées réussies`;
  return `${stars} étoile${stars > 1 ? 's' : ''} sur ${max} · ${vallees}`;
}

export function createCareerMap(host, { vibrate = null, onPlay = null, onBack = null } = {}) {
  const buzz = (n) => { try { vibrate?.(n); } catch { /* rien */ } };
  let open = false;
  let data = { levels: [], career: null };

  const list = el('ul.level-list');
  const progress = el('p.career-progress');
  const node = el(
    'section.screen.screen--career',
    { role: 'dialog', 'aria-label': 'Carte de carrière', 'aria-modal': 'false' },
    el(
      'header.career-head',
      el('h2.career-title', 'Carrière'),
      el('button.career-back', { type: 'button', 'aria-label': 'Revenir au menu', onclick: () => { buzz(8); onBack?.(); } }, 'Menu'),
    ),
    progress,
    el('div.career-body', list),
  );

  function renderRow(row) {
    const stars = el(
      'span.level-stars',
      { 'aria-label': `${row.stars} étoile${row.stars > 1 ? 's' : ''} sur ${MAX_STARS}`, dataset: { stars: String(row.stars), glyphs: starGlyphs(row.stars) } },
      starRow(row.stars, MAX_STARS, 20),
    );
    const badge = row.state === 'done'
      ? el('span.level-badge.level-badge--done', 'Terminé')
      : row.state === 'open'
        ? el('span.level-badge.level-badge--open', 'Ouvert')
        : el('span.level-badge.level-badge--locked', 'Verrouillé');
    const goals = row.goals.length ? el('p.level-goals', `Objectifs : ${row.goals.join(' · ')}`) : null;
    const action = row.state === 'locked'
      ? el('p.level-lock', row.lockText)
      : el(
          `button.level-play${row.state === 'open' ? '.level-play--primary' : ''}`,
          {
            type: 'button',
            dataset: { level: row.id },
            'aria-label': `${playLabel(row.state)} : ${row.title}`,
            onclick: () => { buzz(10); onPlay?.(row.id); },
          },
          playLabel(row.state),
        );
    return el(
      `li.level-card.is-${row.state}`,
      { dataset: { level: row.id, state: row.state } },
      el('div.level-head', el('h3.level-title', row.title), stars),
      el('p.level-sub', row.subtitle),
      goals,
      el('div.level-foot', badge, el('span.level-years', `${row.years} ans`), action),
    );
  }

  function render() {
    const rows = levelRows(data.levels, data.career);
    progress.textContent = progressText(rows);
    clear(list);
    for (const row of rows) list.append(renderRow(row));
  }

  return {
    node,
    open(next = {}) {
      data = { levels: next.levels || data.levels || [], career: next.career || data.career || null };
      render();
      if (!open) {
        open = true;
        host.append(node);
        document.body.classList.add('has-career-map');
      }
      requestAnimationFrame(() => node.classList.add('is-visible'));
      return true;
    },
    refresh(next = {}) {
      if (next.levels) data.levels = next.levels;
      if (next.career) data.career = next.career;
      if (open) render();
      return open;
    },
    close() {
      if (!open) return false;
      open = false;
      node.classList.remove('is-visible');
      node.remove();
      document.body.classList.remove('has-career-map');
      return true;
    },
    isOpen: () => open,
    get rows() { return levelRows(data.levels, data.career); },
  };
}
