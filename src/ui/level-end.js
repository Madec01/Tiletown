// Fin de niveau (docs/ARCHITECTURE.md §11.3) : un voile par-dessus le jeu, les trois étoiles
// (gagnées pleines, perdues creuses) avec leur libellé, la liste des objectifs et leur avancement,
// le score, puis les boutons Rejouer et Niveau suivant (ou Carte de carrière s'il n'y en a plus).
// Ton cosy : on félicite, on n'accable jamais.
//
//   const end = createLevelEnd(host, { vibrate, onReplay, onNext, onMap });
//   end.open({ level, stars: { count, details }, goals, score, nextLevel })
//   end.close()    end.isOpen()
//
// Fonctions pures exportées (tests sous Node) : endTitle, endText, scoreText, nextLabel, starDetails.

import { el, clear, fmt } from './dom.js';
import { MAX_STARS, starIcon, starGlyphs } from './career-map.js';
import { goalRows, goalValueText } from './goals.js';

/** Titre de l'écran selon le nombre d'étoiles (chaleureux, jamais culpabilisant). */
export function endTitle(count) {
  const n = Math.max(0, Math.min(MAX_STARS, Math.round(Number(count) || 0)));
  if (n >= 3) return 'Vallée magnifique !';
  if (n === 2) return 'Belle vallée !';
  if (n === 1) return 'Vallée réussie';
  return 'L’année s’achève';
}

/** Phrase sous le titre. */
export function endText(count, { levelTitle = '', allGoals = false } = {}) {
  const n = Math.max(0, Math.min(MAX_STARS, Math.round(Number(count) || 0)));
  const where = levelTitle ? `« ${levelTitle} »` : 'cette vallée';
  if (n >= 3) return `Rien à redire : ${where} est un modèle du genre.`;
  if (n >= 1) return `${where} tient debout. Il reste de quoi faire mieux : rejouez quand vous voulez.`;
  if (allGoals) return `Les objectifs sont là : les étoiles viendront en rejouant ${where}.`;
  return `Le temps a passé plus vite que la ville. Reprenez ${where} quand vous voulez.`;
}

/** « Score : 1 240 ». */
export function scoreText(score) {
  return `Score : ${fmt(Math.max(0, Math.round(Number(score) || 0)))}`;
}

/** Libellé du bouton de droite : « Niveau suivant » ou « Carte de carrière ». */
export function nextLabel(nextLevel) {
  return nextLevel && nextLevel.title ? 'Niveau suivant' : 'Carte de carrière';
}

/** Lignes des étoiles, toujours trois : [ { id, label, done } ]. */
export function starDetails(stars) {
  const details = Array.isArray(stars && stars.details) ? stars.details : [];
  const out = [];
  for (let i = 0; i < MAX_STARS; i++) {
    const d = details[i] || {};
    out.push({ id: d.id || `star-${i + 1}`, label: d.label || `Étoile ${i + 1}`, done: !!d.done });
  }
  return out;
}

export function createLevelEnd(host, { vibrate = null, onReplay = null, onNext = null, onMap = null } = {}) {
  const buzz = (n) => { try { vibrate?.(n); } catch { /* rien */ } };
  let open = false;
  let data = null;

  const starsRow = el('div.end-stars');
  const starsList = el('ul.end-star-list');
  const goalsList = el('ul.end-goals');
  const heading = el('h2.end-title', '');
  const subtitle = el('p.end-text', '');
  const score = el('p.end-score', '');
  const actions = el('div.end-actions');
  const node = el(
    'section.screen.screen--end',
    { role: 'dialog', 'aria-label': 'Fin de niveau', 'aria-modal': 'false' },
    el('div.end-box', heading, subtitle, starsRow, starsList, el('h3.end-sub', 'Objectifs'), goalsList, score, actions),
  );

  function render() {
    const level = (data && data.level) || {};
    const stars = (data && data.stars) || { count: 0, details: [] };
    const count = Math.max(0, Math.min(MAX_STARS, Math.round(Number(stars.count) || 0)));
    const rows = goalRows(data && data.goals);
    const all = rows.length > 0 && rows.every((r) => r.done);

    heading.textContent = endTitle(count);
    subtitle.textContent = endText(count, { levelTitle: level.title || '', allGoals: all });

    clear(starsRow);
    starsRow.setAttribute('aria-label', `${count} étoile${count > 1 ? 's' : ''} sur ${MAX_STARS}`);
    starsRow.dataset.stars = String(count);
    starsRow.dataset.glyphs = starGlyphs(count);
    const details = starDetails(stars);
    for (const d of details) starsRow.append(el(`span.end-star${d.done ? '.is-on' : ''}`, { 'aria-hidden': 'true' }, starIcon(d.done, 44)));

    clear(starsList);
    for (const d of details) {
      starsList.append(
        el(
          `li.end-star-row${d.done ? '.is-done' : ''}`,
          { dataset: { star: d.id, done: d.done ? '1' : '0' } },
          el('span.end-star-mark', { 'aria-hidden': 'true' }, starIcon(d.done, 18)),
          el('span.end-star-label', d.label),
        ),
      );
    }

    clear(goalsList);
    if (!rows.length) goalsList.append(el('li.end-goal', el('span.end-goal-label', 'Pas d’objectif pour cette vallée.')));
    for (const r of rows) {
      goalsList.append(
        el(
          `li.end-goal${r.done ? '.is-done' : ''}`,
          { dataset: { goal: r.id, done: r.done ? '1' : '0' } },
          el('span.end-goal-mark', { 'aria-hidden': 'true' }, r.done ? '✓' : '·'),
          el('span.end-goal-label', r.label),
          el('span.end-goal-value', goalValueText(r)),
        ),
      );
    }

    score.textContent = scoreText(data && data.score);

    const next = data && data.nextLevel;
    clear(actions).append(
      el(
        'button.end-btn.end-btn--ghost',
        { type: 'button', dataset: { action: 'replay' }, 'aria-label': 'Rejouer ce niveau', onclick: () => { buzz(10); onReplay?.(); } },
        'Rejouer',
      ),
      el(
        'button.end-btn.end-btn--primary',
        {
          type: 'button',
          dataset: { action: next ? 'next' : 'map' },
          'aria-label': next ? `Niveau suivant : ${next.title}` : 'Revenir à la carte de carrière',
          onclick: () => { buzz(10); if (next) onNext?.(next.id); else onMap?.(); },
        },
        nextLabel(next),
      ),
    );
  }

  return {
    node,
    open(next = {}) {
      data = {
        level: next.level || null,
        stars: next.stars || { count: 0, details: [] },
        goals: next.goals || [],
        score: next.score || 0,
        nextLevel: next.nextLevel || null,
      };
      render();
      if (!open) {
        open = true;
        host.append(node);
        document.body.classList.add('has-level-end');
      }
      requestAnimationFrame(() => node.classList.add('is-visible'));
      return true;
    },
    close() {
      if (!open) return false;
      open = false;
      node.classList.remove('is-visible');
      node.remove();
      document.body.classList.remove('has-level-end');
      return true;
    },
    isOpen: () => open,
    get data() { return data; },
  };
}
