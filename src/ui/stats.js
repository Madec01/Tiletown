// Mesures du prototype (#stats, en haut à droite, petit et discret) : appels de dessin, triangles,
// ms par image, images par seconde. Activé par « ?stats=1 » (ou par défaut en développement),
// désactivé par « ?stats=0 ». Lu aussi par tools/measure.mjs via window.__tiletown.stats().
//
//   const stats = createStats(node, { visible });
//   stats.frame(frameMs)                 à chaque image rendue (compte les images, moyenne des ms)
//   stats.update(r.stats())              toutes les 500 ms : { calls, triangles, frameMs } du rendu
//   stats.snapshot() → { calls, triangles, frameMs, fps }
//   stats.setVisible(bool)

/** Décide si l'affichage est visible : « ?stats=1 » force, « ?stats=0 » interdit, sinon `dev`. */
export function statsWanted(search, dev) {
  const v = new URLSearchParams(search || '').get('stats');
  if (v === '1' || v === 'true') return true;
  if (v === '0' || v === 'false') return false;
  return !!dev;
}

/** Texte affiché (fonction pure, testable). */
export function formatStats({ calls = 0, triangles = 0, frameMs = 0, fps = 0 }) {
  const tri = triangles >= 10000 ? `${(triangles / 1000).toFixed(0)} k` : String(Math.round(triangles));
  return `${Math.round(calls)} appels · ${tri} tri\n${frameMs.toFixed(1)} ms · ${Math.round(fps)} i/s`;
}

export function createStats(node, { visible = false } = {}) {
  let last = { calls: 0, triangles: 0, frameMs: 0, fps: 0 };
  let frames = 0;
  let msSum = 0;
  let windowStart = performance.now();

  function frame(frameMs) {
    frames += 1;
    msSum += Number(frameMs) || 0;
  }

  /** Nouvelles valeurs du rendu ; les i/s sont calculées sur la fenêtre écoulée depuis le dernier appel. */
  function update(rs = {}) {
    const now = performance.now();
    const dt = Math.max(1, now - windowStart);
    const fps = (frames * 1000) / dt;
    const frameMs = Number.isFinite(rs.frameMs) && rs.frameMs > 0 ? rs.frameMs : frames ? msSum / frames : 0;
    last = { calls: rs.calls || 0, triangles: rs.triangles || 0, frameMs, fps };
    frames = 0;
    msSum = 0;
    windowStart = now;
    if (node && node.classList.contains('is-visible')) {
      const text = formatStats(last);
      if (node.textContent !== text) node.textContent = text;
    }
    return last;
  }

  function setVisible(v) {
    if (node) node.classList.toggle('is-visible', !!v);
  }

  setVisible(visible);
  return { frame, update, setVisible, snapshot: () => ({ ...last }) };
}
