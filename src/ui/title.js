// Écran titre (docs/ARCHITECTURE.md §11.3) : plein écran par-dessus la scène 3D, qui continue de
// tourner lentement derrière. Nom du jeu en grand, sous-titre d'une ligne, trois boutons de 56 px.
//
//   const title = createTitle(host, { vibrate, onResume, onCareer, onSandbox });
//   title.open({ hasSave: true, resumeText: 'Carrière · La première vallée' });
//   title.close()      title.isOpen()      title.refresh({ hasSave, resumeText })
//
// « Reprendre » n'apparaît que si une partie est en cours (sauvegarde locale). Le bouton est en
// premier : c'est ce qu'on veut neuf fois sur dix. Les trois boutons sont dans la moitié basse de
// l'écran (jeu à une main, docs/MOBILE.md) et mesurent au moins 56 px de haut.
//
// Fonctions pures exportées (tests sous Node) : titleButtons, resumeText, GAME_NAME, GAME_TAGLINE.

import { el, clear } from './dom.js';

export const GAME_NAME = 'Tiletown';
export const GAME_TAGLINE = 'Bâtissez une ville où la vallée respire encore.';

/**
 * Boutons de l'écran titre, dans l'ordre : [ { id, label, sub, kind } ].
 * `hasSave` ajoute « Reprendre » en tête ; `resumeText` décrit la partie en cours (sous le libellé).
 */
export function titleButtons({ hasSave = false, resumeText = '' } = {}) {
  const rows = [];
  if (hasSave) rows.push({ id: 'resume', label: 'Reprendre', sub: resumeText || '', kind: 'primary' });
  rows.push({ id: 'career', label: 'Carrière', sub: 'Des vallées à réussir, une à une', kind: hasSave ? 'normal' : 'primary' });
  rows.push({ id: 'sandbox', label: 'Bac à sable', sub: 'Tout est ouvert, aucun objectif', kind: 'normal' });
  return rows;
}

/**
 * Phrase qui décrit la partie en cours sous « Reprendre » :
 * « Carrière · La première vallée · an 2 » ou « Bac à sable · mars, an 1 ».
 */
export function resumeText({ mode = 'sandbox', levelTitle = '', monthLabel = '', year = 1 } = {}) {
  const where = mode === 'career' ? (levelTitle || 'Carrière') : 'Bac à sable';
  const when = monthLabel ? `${monthLabel}, an ${year}` : `an ${year}`;
  return `${where} · ${when}`;
}

export function createTitle(host, { vibrate = null, onResume = null, onCareer = null, onSandbox = null } = {}) {
  const buzz = (n) => { try { vibrate?.(n); } catch { /* rien */ } };
  let open = false;
  let opts = { hasSave: false, resumeText: '' };
  const handlers = { resume: () => onResume?.(), career: () => onCareer?.(), sandbox: () => onSandbox?.() };

  const list = el('div.title-actions');
  const sub = el('p.title-sub', GAME_TAGLINE);
  const node = el(
    'section.screen.screen--title',
    { role: 'dialog', 'aria-label': `${GAME_NAME} — menu`, 'aria-modal': 'false' },
    el(
      'div.title-box',
      el('div.title-mark', { 'aria-hidden': 'true' }),
      el('h1.title-name', GAME_NAME),
      sub,
      list,
    ),
  );

  function render() {
    clear(list);
    for (const b of titleButtons(opts)) {
      list.append(
        el(
          `button.title-btn${b.kind === 'primary' ? '.title-btn--primary' : ''}`,
          {
            type: 'button',
            dataset: { action: b.id },
            'aria-label': b.sub ? `${b.label} — ${b.sub}` : b.label,
            onclick: () => { buzz(10); handlers[b.id]?.(); },
          },
          el('span.title-btn-label', b.label),
          b.sub ? el('span.title-btn-sub', b.sub) : null,
        ),
      );
    }
  }

  return {
    node,
    open(next = {}) {
      opts = { hasSave: !!next.hasSave, resumeText: next.resumeText || '' };
      render();
      if (!open) {
        open = true;
        host.append(node);
        document.body.classList.add('has-title');
      }
      requestAnimationFrame(() => node.classList.add('is-visible'));
      return true;
    },
    refresh(next = {}) {
      if (!open) return false;
      opts = { hasSave: !!next.hasSave, resumeText: next.resumeText || opts.resumeText };
      render();
      return true;
    },
    close() {
      if (!open) return false;
      open = false;
      node.classList.remove('is-visible');
      node.remove();
      document.body.classList.remove('has-title');
      return true;
    },
    isOpen: () => open,
    get hasSave() { return !!opts.hasSave; },
  };
}
