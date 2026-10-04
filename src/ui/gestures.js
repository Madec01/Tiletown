// Reconnaisseur de gestes sur le canvas (adapté de Seve ; ici PUR : aucune connaissance du jeu,
// seulement des rappels). Un geste = une intention (docs/MOBILE.md).
//
//   const g = createGestures(canvas, {
//     onTap({ x, y, clientX, clientY, touch })        toucher bref (ou clic) : sélectionner / poser
//     onLongPress({ x, y, clientX, clientY })          appui long (450 ms, le doigt n'a pas bougé) : fiche
//     onDoubleTap({ x, y, clientX, clientY })          deux touchers rapprochés : cadrage par défaut
//     onPanStart({ x, y })                             le doigt (ou la souris) commence à faire défiler
//     onPan({ dx, dy, x, y })                          déplacement depuis le dernier événement (px CSS)
//     onPanEnd({ vx, vy })                             vitesse au lever (px/ms) : la caméra peut lancer un élan
//     onPinch({ factor, cx, cy, dx, dy })              deux doigts : facteur de zoom depuis le dernier
//                                                      événement (> 1 = rapprocher), centre entre les doigts,
//                                                      et déplacement de ce centre (on pousse la carte en pinçant)
//     onPinchEnd()
//   });
//   g.active   → vrai pendant un geste (la boucle de rendu passe à 60 i/s)
//   g.cancel() → annule le geste en cours ;  g.destroy() → retire les écouteurs
//
// Coordonnées : x, y en px CSS relatifs au canvas (coin haut gauche) ; clientX, clientY ceux de la fenêtre
// (r.pick(clientX, clientY) du rendu). Souris : glisser = défiler, molette = zoom au pointeur (onPinch avec
// cx, cy et un facteur dérivé de deltaY), clic = toucher, double clic = double toucher, clic droit = appui long.
// Le menu contextuel et la sélection sont bloqués sur le canvas.

const LONG_PRESS_MS = 450;
const TOUCH_SLOP = 10; // px avant de considérer qu'on glisse (doigt)
const MOUSE_SLOP = 4;
const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_PX = 36;
const WHEEL_ZOOM_PER_PX = 0.0018; // facteur = exp(−deltaY × k) : 100 px de molette ≈ ×1,2

/** Facteur de zoom pour un cran de molette (fonction pure, testable). */
export function wheelFactor(deltaY, deltaMode = 0) {
  const k = deltaMode === 1 ? 16 : deltaMode === 2 ? 400 : 1; // lignes, pages → px
  return Math.exp(-deltaY * k * WHEEL_ZOOM_PER_PX);
}

export function createGestures(canvas, handlers = {}) {
  const h = handlers;
  const call = (name, arg) => {
    const fn = h[name];
    if (typeof fn !== 'function') return;
    try {
      fn(arg);
    } catch (err) {
      console.warn(`Geste ${name} :`, err);
    }
  };

  let g = null; // geste d'un doigt / souris en cours
  const touches = new Map(); // doigts posés : pointerId → { x, y }
  let pinch = null; // { a, b, d, cx, cy }
  let lastTap = null; // { t, x, y } dernier toucher bref (double toucher)
  let destroyed = false;

  function local(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, clientX: e.clientX, clientY: e.clientY };
  }

  function capture(e) {
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* rien */
    }
  }

  // ── Pincement ──────────────────────────────────────────────────────────────
  function pinchGeom() {
    const pa = touches.get(pinch.a);
    const pb = touches.get(pinch.b);
    if (!pa || !pb) return null;
    return { cx: (pa.x + pb.x) / 2, cy: (pa.y + pb.y) / 2, d: Math.max(8, Math.hypot(pa.x - pb.x, pa.y - pb.y)) };
  }

  function startPinch() {
    const ids = [...touches.keys()].slice(-2);
    endSingle(true);
    lastTap = null;
    pinch = { a: ids[0], b: ids[1], d: 1, cx: 0, cy: 0 };
    const m = pinchGeom();
    if (!m) {
      pinch = null;
      return;
    }
    Object.assign(pinch, m);
  }

  function movePinch() {
    const m = pinchGeom();
    if (!m) return;
    const factor = m.d / pinch.d;
    const dx = m.cx - pinch.cx;
    const dy = m.cy - pinch.cy;
    Object.assign(pinch, m);
    if (Math.abs(factor - 1) < 1e-6 && !dx && !dy) return;
    call('onPinch', { factor, cx: m.cx, cy: m.cy, dx, dy });
  }

  function endPinch() {
    if (!pinch) return;
    pinch = null;
    call('onPinchEnd');
  }

  // ── Un doigt / souris ──────────────────────────────────────────────────────
  function endSingle(cancelled) {
    if (!g) return;
    const cur = g;
    g = null;
    clearTimeout(cur.timer);
    if (cur.mode === 'pan') call('onPanEnd', { vx: cancelled ? 0 : cur.vx, vy: cancelled ? 0 : cur.vy });
  }

  function onDown(e) {
    if (destroyed) return;
    if (e.pointerType === 'touch') touches.set(e.pointerId, local(e));
    if (e.pointerType === 'touch' && touches.size >= 2) {
      // Deuxième doigt : le geste d'un doigt est annulé, on pince.
      capture(e);
      if (!pinch) startPinch();
      return;
    }
    if (pinch || !e.isPrimary) return;
    if (e.pointerType === 'mouse' && e.button !== 0) {
      if (e.pointerType === 'mouse' && e.button === 2) call('onLongPress', local(e)); // clic droit = appui long
      return;
    }
    const p = local(e);
    capture(e);
    g = { id: e.pointerId, touch: e.pointerType !== 'mouse', x0: p.x, y0: p.y, lastX: p.x, lastY: p.y, lastT: performance.now(), vx: 0, vy: 0, mode: null, long: false, timer: null };
    g.timer = setTimeout(() => {
      if (!g || g.mode) return;
      g.long = true;
      call('onLongPress', { x: g.x0, y: g.y0, clientX: p.clientX, clientY: p.clientY });
    }, LONG_PRESS_MS);
  }

  function onMove(e) {
    if (destroyed) return;
    if (touches.has(e.pointerId)) touches.set(e.pointerId, local(e));
    if (pinch) {
      if (e.pointerId === pinch.a || e.pointerId === pinch.b) movePinch();
      return;
    }
    if (!g || e.pointerId !== g.id) return;
    const p = local(e);
    const dx0 = p.x - g.x0;
    const dy0 = p.y - g.y0;
    const slop = g.touch ? TOUCH_SLOP : MOUSE_SLOP;
    if (!g.mode && !g.long && dx0 * dx0 + dy0 * dy0 > slop * slop) {
      clearTimeout(g.timer);
      g.mode = 'pan';
      lastTap = null;
      call('onPanStart', { x: g.x0, y: g.y0 });
      // Le seuil franchi : on repart du point de départ (le premier pas n'est pas perdu).
      g.lastX = g.x0;
      g.lastY = g.y0;
    }
    if (g.mode === 'pan') {
      const now = performance.now();
      const dx = p.x - g.lastX;
      const dy = p.y - g.lastY;
      const dt = Math.max(1, now - g.lastT);
      g.vx = 0.8 * (dx / dt) + 0.2 * g.vx;
      g.vy = 0.8 * (dy / dt) + 0.2 * g.vy;
      g.lastT = now;
      if (dx || dy) call('onPan', { dx, dy, x: p.x, y: p.y });
    }
    g.lastX = p.x;
    g.lastY = p.y;
  }

  function onUp(e, cancelled = false) {
    if (destroyed) return;
    if (touches.has(e.pointerId)) {
      touches.delete(e.pointerId);
      if (pinch && (e.pointerId === pinch.a || e.pointerId === pinch.b)) endPinch();
    }
    if (!g || e.pointerId !== g.id) return;
    const cur = g;
    const p = local(e);
    g = null;
    clearTimeout(cur.timer);
    if (cancelled) {
      if (cur.mode === 'pan') call('onPanEnd', { vx: 0, vy: 0 });
      return;
    }
    if (cur.mode === 'pan') {
      // Pas d'élan si le doigt s'est arrêté avant de se lever.
      const still = performance.now() - cur.lastT > 80;
      call('onPanEnd', { vx: still ? 0 : cur.vx, vy: still ? 0 : cur.vy });
      return;
    }
    if (cur.long) return; // l'appui long a déjà agi
    const now = performance.now();
    const tap = { x: cur.x0, y: cur.y0, clientX: p.clientX, clientY: p.clientY, touch: cur.touch };
    if (lastTap && now - lastTap.t <= DOUBLE_TAP_MS && Math.hypot(tap.x - lastTap.x, tap.y - lastTap.y) <= DOUBLE_TAP_PX) {
      lastTap = null;
      call('onDoubleTap', tap);
      return;
    }
    lastTap = { t: now, x: tap.x, y: tap.y };
    call('onTap', tap);
  }

  function onWheel(e) {
    if (destroyed) return;
    e.preventDefault();
    if (!e.deltaY && !e.deltaX) return;
    const p = local(e);
    if (e.ctrlKey || !e.shiftKey) {
      // Molette (et pincement du pavé tactile, envoyé avec ctrlKey) : zoom au pointeur.
      call('onPinch', { factor: wheelFactor(e.deltaY, e.deltaMode), cx: p.x, cy: p.y, dx: 0, dy: 0 });
      call('onPinchEnd');
    } else {
      // Maj + molette : défilement de côté.
      const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      call('onPan', { dx: -e.deltaY * k, dy: -e.deltaX * k, x: p.x, y: p.y });
    }
  }

  const onCancel = (e) => onUp(e, true);
  const onContext = (e) => e.preventDefault();
  const onDbl = (e) => e.preventDefault(); // (le double toucher est reconnu ici, pas par le navigateur)

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onCancel);
  canvas.addEventListener('lostpointercapture', onCancel);
  canvas.addEventListener('contextmenu', onContext);
  canvas.addEventListener('dblclick', onDbl);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  function cancel() {
    endPinch();
    endSingle(true);
    touches.clear();
  }

  return {
    cancel,
    destroy() {
      cancel();
      destroyed = true;
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onCancel);
      canvas.removeEventListener('lostpointercapture', onCancel);
      canvas.removeEventListener('contextmenu', onContext);
      canvas.removeEventListener('dblclick', onDbl);
      canvas.removeEventListener('wheel', onWheel);
    },
    get active() {
      return !!g || !!pinch;
    },
  };
}
