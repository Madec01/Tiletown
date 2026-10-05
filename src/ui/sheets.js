// Feuille coulissante du bas (« bottom sheet »), adaptée de Seve (code seulement, aucune ressource) :
// catalogue d'une famille, fiche d'une case, calques.
//
//   const sheets = createSheets(layer, { vibrate, onChange });
//   sheets.open({ id, title, content, className, onClose(reason) })  → { body, close }
//   sheets.close(reason)        sheets.isOpen(id?)        sheets.current (id ou null)
//   sheets.setContent(node)     sheets.setTitle(text)     sheets.refit()
//
// Une seule feuille à la fois : en ouvrir une autre remplace la précédente. Fermeture par le ✕ (48 px),
// par un glissement vers le bas (poignée, en-tête, ou contenu déjà tout en haut), par un toucher sur le
// fond (la carte), par Échap ou par le bouton « retour » du téléphone (createBackStack ci-dessous).
// La hauteur de la feuille ouverte est publiée dans --sheet-h (les messages se placent au-dessus).

import { clear, el } from './dom.js';

const SWIPE_THRESHOLD = 90; // px de glissement vers le bas pour fermer
const SWIPE_FAST = 0.6; // px/ms : un petit glissement rapide ferme aussi

/**
 * Glisser vers le bas pour fermer. `grab` : zones qui démarrent toujours le glissement (poignée,
 * en-tête) ; `scroller` : zone défilante qui ne le démarre que si elle est tout en haut.
 * Fonction pure côté DOM (aucune connaissance du jeu) ; renvoie la fonction de nettoyage.
 */
export function swipeToClose(box, { grab = [], scroller = null, onClose, canClose = () => true }) {
  let start = null; // { y, t, dy, moved }

  const begin = (y) => {
    start = { y, t: performance.now(), dy: 0, moved: false };
    box.style.transition = 'none';
  };
  const move = (y) => {
    if (!start) return false;
    const dy = Math.max(0, y - start.y);
    start.dy = dy;
    if (dy > 4) start.moved = true;
    box.style.transform = dy ? `translateY(${Math.round(dy)}px)` : '';
    return start.moved;
  };
  const end = () => {
    if (!start) return;
    const { dy, t } = start;
    const v = dy / Math.max(1, performance.now() - t);
    start = null;
    box.style.transition = '';
    box.style.transform = '';
    if (canClose() && shouldClose(dy, v)) onClose('swipe');
  };

  const offs = [];
  for (const g of grab) {
    if (!g) continue;
    const down = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      if (e.target.closest('button')) return; // le ✕ reste un bouton
      begin(e.clientY);
      try { g.setPointerCapture(e.pointerId); } catch { /* rien */ }
    };
    const mv = (e) => move(e.clientY);
    const up = () => end();
    g.addEventListener('pointerdown', down);
    g.addEventListener('pointermove', mv);
    g.addEventListener('pointerup', up);
    g.addEventListener('pointercancel', up);
    offs.push(() => {
      g.removeEventListener('pointerdown', down);
      g.removeEventListener('pointermove', mv);
      g.removeEventListener('pointerup', up);
      g.removeEventListener('pointercancel', up);
    });
  }

  // Contenu défilant : seulement quand il est déjà tout en haut et que le doigt descend.
  if (scroller) {
    let sy = null;
    let dragging = false;
    const ts = (e) => {
      if (e.touches.length !== 1) return;
      sy = e.touches[0].clientY;
      dragging = false;
    };
    const tm = (e) => {
      if (sy === null) return;
      const y = e.touches[0].clientY;
      if (!dragging) {
        if (scroller.scrollTop <= 0 && y - sy > 8) {
          dragging = true;
          begin(sy);
        } else if (Math.abs(y - sy) > 8) {
          sy = null; // défilement normal du contenu
          return;
        }
      }
      if (dragging) {
        e.preventDefault();
        move(y);
      }
    };
    const te = () => {
      if (dragging) end();
      sy = null;
      dragging = false;
    };
    scroller.addEventListener('touchstart', ts, { passive: true });
    scroller.addEventListener('touchmove', tm, { passive: false });
    scroller.addEventListener('touchend', te);
    scroller.addEventListener('touchcancel', te);
    offs.push(() => {
      scroller.removeEventListener('touchstart', ts);
      scroller.removeEventListener('touchmove', tm);
      scroller.removeEventListener('touchend', te);
      scroller.removeEventListener('touchcancel', te);
    });
  }
  return () => offs.forEach((f) => f());
}

/** Un glissement ferme la feuille s'il est long (≥ 90 px) ou court mais vif (> 30 px à plus de 0,6 px/ms). */
export function shouldClose(dy, velocity) {
  return dy > SWIPE_THRESHOLD || (dy > 30 && velocity > SWIPE_FAST);
}

export function createSheets(layer, { vibrate, onChange } = {}) {
  let current = null; // { id, opts }
  let closeTimer = null;
  const buzz = (n) => { try { vibrate?.(n); } catch { /* rien */ } };

  const backdrop = el('div.sheet-backdrop', { 'aria-hidden': 'true' });
  // Poignée : zone de glissement (pas un bouton : le ✕ de 48 px, le fond et Échap ferment aussi).
  const grabBar = el('div.sheet-grab', { 'aria-hidden': 'true' }, el('span.sheet-grab-bar'));
  const title = el('h2.sheet-title', { id: 'sheet-title' });
  const closeBtn = el('button.sheet-x', { type: 'button', 'aria-label': 'Fermer', id: 'sheet-close', onclick: () => close('button') }, '✕');
  const head = el('header.sheet-head', title, closeBtn);
  const body = el('div.sheet-body');
  const box = el('section.sheet', { role: 'dialog', 'aria-labelledby': 'sheet-title', 'aria-modal': 'false', id: 'sheet' }, grabBar, head, body);
  clear(layer).append(backdrop, box);

  // Toucher le fond (la carte au-dessus de la feuille) : la feuille se ferme, et ce toucher ne fait
  // rien d'autre (pas de pose involontaire).
  backdrop.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    close('outside');
  });
  swipeToClose(box, { grab: [grabBar, head], scroller: body, onClose: (r) => close(r) });

  // Hauteur de la feuille ouverte : les messages (toasts) se placent au-dessus.
  let ro = null;
  if (typeof ResizeObserver === 'function') {
    ro = new ResizeObserver(() => publishHeight());
    ro.observe(box);
  }
  function publishHeight() {
    const h = current ? Math.round(box.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty('--sheet-h', `${h}px`);
    try { onChange?.(current ? current.id : null, h); } catch { /* rien */ }
  }

  function open(opts) {
    clearTimeout(closeTimer);
    const replacing = !!current;
    if (replacing && current.opts.onClose) {
      const prev = current.opts;
      current = null;
      try { prev.onClose('replace'); } catch { /* rien */ }
    }
    current = { id: opts.id, opts };
    title.textContent = opts.title || '';
    clear(body);
    if (opts.content) body.append(opts.content);
    body.scrollTop = 0;
    box.className = `sheet${opts.className ? ` ${opts.className}` : ''}`;
    box.dataset.sheet = opts.id;
    layer.classList.add('is-open');
    document.body.classList.add('has-sheet');
    document.body.dataset.sheet = opts.id;
    box.style.transform = '';
    if (!replacing) buzz(6);
    const opened = current;
    requestAnimationFrame(() => {
      if (current !== opened) return; // fermée entre-temps : ne pas réafficher une feuille vide
      box.classList.add('is-visible');
      publishHeight();
    });
    setTimeout(publishHeight, 280);
    return { body, close };
  }

  function close(reason = 'close') {
    if (!current) return false;
    const { opts } = current;
    current = null;
    box.classList.remove('is-visible');
    layer.classList.remove('is-open');
    document.body.classList.remove('has-sheet');
    delete document.body.dataset.sheet;
    closeTimer = setTimeout(() => { if (!current) clear(body); }, 260);
    publishHeight();
    try { opts.onClose?.(reason); } catch (err) { console.warn('Feuille :', err); }
    return true;
  }

  function isOpen(id) {
    if (!current) return false;
    return id ? current.id === id : true;
  }

  return {
    open,
    close,
    isOpen,
    body,
    box,
    get current() {
      return current ? current.id : null;
    },
    /** Remplace le contenu de la feuille ouverte (sans l'animation d'ouverture). */
    setContent(node, keepScroll = true) {
      if (!current) return;
      const top = body.scrollTop;
      clear(body);
      body.append(node);
      if (keepScroll) body.scrollTop = top;
      publishHeight();
    },
    setTitle(t) {
      title.textContent = t;
    },
    refit: publishHeight,
    destroy() {
      ro?.disconnect();
      clear(layer);
    },
  };
}

/**
 * Bouton « retour » du téléphone (et Échap sur PC) : tant qu'au moins une couche (feuille, tuile en
 * main, fantôme…) est « tenue », une entrée d'historique est posée ; revenir en arrière appelle
 * `onBack()` (qui ferme la couche du dessus) au lieu de quitter le jeu.
 *
 *   const back = createBackStack({ onBack });
 *   back.hold('sheet');  back.release('sheet');  back.held → nombre de couches tenues
 */
export function createBackStack({ onBack, history: hist = globalThis.history, win = globalThis } = {}) {
  const held = new Set();
  let armed = false; // une entrée d'historique est posée
  let suppress = 0; // popstate déclenchés par nous (history.back() au relâchement)

  function arm() {
    if (armed || suppress > 0 || !hist || typeof hist.pushState !== 'function') return;
    try {
      hist.pushState({ tiletown: 'layer' }, '');
      armed = true;
    } catch { /* historique indisponible */ }
  }
  function disarm() {
    if (!armed) return;
    armed = false;
    suppress += 1;
    try { hist.back(); } catch { suppress -= 1; }
  }
  function onPop() {
    if (suppress > 0) {
      suppress -= 1;
      // Une autre couche peut s'ouvrir avant la fin asynchrone de history.back().
      if (held.size) arm();
      return;
    }
    if (!armed) return;
    armed = false;
    held.clear();
    try { onBack?.(); } catch (err) { console.warn('Retour :', err); }
  }
  function onKey(e) {
    if (e.key !== 'Escape' || !held.size) return;
    e.preventDefault();
    try { onBack?.(); } catch (err) { console.warn('Échap :', err); }
  }
  win?.addEventListener?.('popstate', onPop);
  win?.addEventListener?.('keydown', onKey);

  return {
    hold(key) {
      held.add(key);
      arm();
    },
    release(key) {
      held.delete(key);
      if (!held.size) disarm();
    },
    get held() {
      return held.size;
    },
    destroy() {
      win?.removeEventListener?.('popstate', onPop);
      win?.removeEventListener?.('keydown', onKey);
    },
  };
}
