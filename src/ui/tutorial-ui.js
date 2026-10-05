// Tutoriel (docs/ARCHITECTURE.md §11.3) : une bulle en bas de l'écran, au-dessus des onglets, avec le
// titre et le texte de la leçon et un bouton « Compris » qui range la bulle sans valider la leçon.
// L'élément visé est mis en surbrillance : un onglet du HUD, une jauge, ou une case de la carte
// (`r.setHighlight`). Dès que la leçon est faite, la bulle s'efface et un petit message de
// récompense s'affiche. **Le tutoriel ne bloque jamais l'interface** : la bulle ne couvre ni les
// onglets ni la barre d'action, et on peut jouer sans jamais la regarder.
//
//   const tuto = createTutorialUi(host, { getGame, getContext, ops, renderer, hud, toasts, vibrate, onSeen });
//   ops : { nextLesson(scenario, game, seen, ctx), lessonDone(lesson, game, ctx), markSeen(seen, id),
//           lessonHighlight(lesson, game) }   (src/core/tutorial.js)
//   getContext() → { layer, level, goals } : ce que l'interface sait et que le cœur ne voit pas
//   tuto.setScenario('base', ['pose'])   scénario et leçons déjà vues (carrière)
//   tuto.refresh()                       à chaque pose, chaque mois, chaque changement d'état
//   tuto.dismiss()                       « Compris » : range la bulle, la leçon reste à faire
//   tuto.stop()                          fin du niveau : plus de bulle, plus de surbrillance
//   tuto.lesson                          leçon courante ou null        tuto.seen
//
// Fonctions pures exportées (tests sous Node) : lessonText, highlightOf, rewardOf.

import { el, clear, setText } from './dom.js';

/** Titre et texte d'une leçon, toujours une chaîne (une leçon mal formée n'écrit rien d'illisible). */
export function lessonText(lesson) {
  if (!lesson || typeof lesson !== 'object') return null;
  return { id: String(lesson.id || ''), title: String(lesson.title || 'Petite leçon'), text: String(lesson.text || '') };
}

/**
 * Cible de la surbrillance, normalisée pour l'interface (src/core/tutorial.js `HIGHLIGHT_KINDS`) :
 *   { kind: 'tab', id }   un onglet du bas          { kind: 'tile', x, y }   une case de la carte
 *   { kind: 'gauge', id } une jauge du haut, ou le bouton de vitesse (kind 'speed' → id 'speed')
 * Tout le reste (forme inconnue, leçon sans surbrillance) donne null : la leçon reste lisible.
 * `spec` est la leçon elle-même, ou déjà le résultat de `lessonHighlight(lesson, game)`.
 */
export function highlightOf(spec) {
  const h = spec && typeof spec === 'object' && spec.kind ? spec : spec && spec.highlight;
  if (!h || typeof h !== 'object') return null;
  if (h.kind === 'tile') {
    const x = Number(h.x);
    const y = Number(h.y);
    return Number.isFinite(x) && Number.isFinite(y) ? { kind: 'tile', x: Math.trunc(x), y: Math.trunc(y) } : null;
  }
  if (h.kind === 'speed') return { kind: 'gauge', id: 'speed' };
  if ((h.kind === 'tab' || h.kind === 'gauge') && h.id) return { kind: h.kind, id: String(h.id) };
  return null;
}

/** Récompense d'une leçon : { money, text } ou null (rien à annoncer). */
export function rewardOf(lesson) {
  const r = lesson && lesson.reward;
  if (!r || typeof r !== 'object') return null;
  const money = Math.round(Number(r.money) || 0);
  const text = typeof r.text === 'string' ? r.text : '';
  return money || text ? { money, text } : null;
}

export function createTutorialUi(host, {
  getGame = () => null,
  getContext = () => ({}),
  ops = {},
  renderer = null,
  hud = null,
  toasts = null,
  vibrate = null,
  onSeen = null,
} = {}) {
  const buzz = (n) => { try { vibrate?.(n); } catch { /* rien */ } };
  let scenario = null;
  let seen = [];
  let lesson = null; // leçon courante (affichée ou rangée)
  let dismissed = null; // identifiant de la leçon rangée par « Compris »
  let stopped = false;
  let ownsHighlight = false;

  const title = el('p.tuto-title', '');
  const text = el('p.tuto-text', '');
  const okBtn = el(
    'button.tuto-ok',
    { type: 'button', 'aria-label': 'Compris : ranger la leçon', onclick: () => { buzz(8); dismiss(); } },
    'Compris',
  );
  const node = el(
    'div.tuto-bubble',
    { role: 'status' },
    el('span.tuto-mark', { 'aria-hidden': 'true' }),
    el('div.tuto-body', title, text),
    okBtn,
  );
  clear(host).append(node);
  host.hidden = true;
  if (typeof ResizeObserver === 'function') new ResizeObserver(() => publishHeight()).observe(node);

  // ── Surbrillance ─────────────────────────────────────────────────────────────
  function clearHighlight() {
    try { hud?.setHint?.(null); } catch { /* rien */ }
    if (ownsHighlight) {
      ownsHighlight = false;
      try { renderer?.setHighlight?.(null); } catch { /* rien */ }
      try { renderer?.invalidate?.(); } catch { /* rien */ }
    }
  }

  function applyHighlight(target) {
    clearHighlight();
    if (!target) return;
    if (target.kind === 'tile') {
      try {
        renderer?.setHighlight?.([{ x: target.x, y: target.y }]);
        renderer?.invalidate?.();
        ownsHighlight = true;
      } catch { /* rien */ }
      return;
    }
    try { hud?.setHint?.({ kind: target.kind, id: target.id }); } catch { /* rien */ }
  }

  // ── Affichage ────────────────────────────────────────────────────────────────
  /** Ce que la leçon demande de montrer : `lessonHighlight(lesson, game)` d'abord (cases calculées). */
  function targetOf(l) {
    if (typeof ops.lessonHighlight === 'function') {
      try { return highlightOf(ops.lessonHighlight(l, getGame?.())); } catch { /* repli */ }
    }
    return highlightOf(l);
  }

  /** Hauteur occupée par la bulle : les messages (toasts) se placent juste au-dessus. */
  function publishHeight() {
    const h = host.hidden ? 0 : Math.round(host.getBoundingClientRect().height);
    try { document.documentElement.style.setProperty('--tuto-h', `${h}px`); } catch { /* rien */ }
  }

  function showBubble() {
    const t = lessonText(lesson);
    if (!t) return hideBubble();
    setText(title, t.title);
    setText(text, t.text);
    node.dataset.lesson = t.id;
    host.hidden = false;
    host.classList.add('is-open');
    document.body.classList.add('has-tuto');
    applyHighlight(targetOf(lesson));
    publishHeight();
    return true;
  }

  function hideBubble() {
    host.hidden = true;
    host.classList.remove('is-open');
    document.body.classList.remove('has-tuto');
    clearHighlight();
    publishHeight();
    return false;
  }

  function celebrate(done) {
    const reward = rewardOf(done);
    if (!reward || !toasts) return;
    toasts.show({ key: `tuto:${done.id}`, kind: 'success', title: done.title, text: reward.text || 'Bien joué !', duration: 5000 });
  }

  function context() {
    try { return getContext?.() || {}; } catch { return {}; }
  }

  function isDone(l) {
    if (!l) return false;
    const game = getGame?.();
    if (typeof ops.lessonDone === 'function') {
      try { return !!ops.lessonDone(l, game, context()); } catch { return false; }
    }
    try { return typeof l.done === 'function' ? !!l.done(game, context()) : false; } catch { return false; }
  }

  function pick() {
    if (!scenario || typeof ops.nextLesson !== 'function') return null;
    try { return ops.nextLesson(scenario, getGame?.(), seen, context()) || null; } catch { return null; }
  }

  /**
   * Relit l'état : chaque leçon déjà faite est validée (message de récompense si elle était affichée),
   * puis la bulle montre la première leçon qui reste à faire. `nextLesson` rend la première leçon non
   * vue : c'est bien l'interface qui marque une leçon comme vue quand sa condition est remplie.
   */
  function refresh() {
    if (stopped || !scenario) return null;
    for (let guard = 0; guard < 64; guard++) {
      const next = pick();
      if (!next) {
        lesson = null;
        hideBubble();
        return null;
      }
      if (isDone(next)) {
        const wasShown = lesson && lesson.id === next.id;
        seen = typeof ops.markSeen === 'function' ? ops.markSeen(seen, next.id) : [...seen, next.id];
        lesson = null;
        dismissed = null;
        hideBubble();
        if (wasShown) celebrate(next);
        try { onSeen?.(next.id, seen); } catch { /* rien */ }
        continue;
      }
      if (!lesson || lesson.id !== next.id) {
        lesson = next;
        dismissed = null;
      }
      if (dismissed === lesson.id) hideBubble();
      else showBubble();
      return lesson;
    }
    return lesson;
  }

  /** « Compris » : la bulle se range, la leçon reste à faire (elle ne revient pas d'elle-même). */
  function dismiss() {
    if (!lesson) return false;
    dismissed = lesson.id;
    hideBubble();
    return true;
  }

  return {
    node,
    /** Scénario du niveau ('base', ou une liste de leçons) et leçons déjà vues (carrière). */
    setScenario(next, alreadySeen = []) {
      scenario = next || null;
      seen = Array.isArray(alreadySeen) ? [...alreadySeen] : [];
      lesson = null;
      dismissed = null;
      stopped = false;
      if (!scenario) hideBubble();
      else refresh();
      return scenario;
    },
    refresh,
    dismiss,
    /** Remontre la leçon courante (après « Compris », ou au retour dans la partie). */
    reopen() {
      dismissed = null;
      return refresh();
    },
    /** Fin de niveau, écran titre, carte de carrière : plus de bulle ni de surbrillance. */
    stop() {
      stopped = true;
      lesson = null;
      hideBubble();
    },
    resume() {
      stopped = false;
      return refresh();
    },
    get lesson() { return lesson; },
    get seen() { return [...seen]; },
    get stopped() { return stopped; },
    isOpen: () => !host.hidden,
  };
}
