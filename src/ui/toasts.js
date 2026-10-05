// Messages temporaires (toasts), adaptés de Seve et allégés pour le prototype.
//
//   const toasts = createToasts(document.getElementById('toasts'));
//   toasts.show('Case 3,4 : herbe');
//   toasts.show({ title: 'Nouvelle version', text: 'Rechargez pour en profiter.', kind: 'info',
//                 actionLabel: 'Recharger', onClick: () => …, duration: 8000, key: 'update' });
//   toasts.clearAll();   toasts.stats() → { visible }
//
// Règles (docs/MOBILE.md) : au plus MAX_VISIBLE messages à la fois (les plus anciens s'effacent) ; un
// message ne capte JAMAIS le doigt (la carte et les onglets dessous restent utilisables) : seul le
// bouton d'un message qui propose une action (actionLabel + onClick) se touche, et il fait ≥ 48 px.
// `key` : un message déjà affiché avec la même clé est mis à jour au lieu d'être empilé.
// Textes ≥ 15 px (css/style.css). Les messages importants (erreur, action) restent ≥ 5 s ; un message qui
// propose une action (« Annuler » après une pose : 10 s) peut rester jusqu'à MAX_ACTION_MS.

import { el, typo } from './dom.js';

export const MAX_VISIBLE = 2;
export const MAX_INFO_MS = 7000;
export const MAX_ACTION_MS = 12000;
const KINDS = new Set(['info', 'success', 'warn', 'error', 'money']);

/** Durée d'affichage : 5 s au moins pour ce qui compte (erreur, action à toucher), 3 s pour une info (7 s au plus ; 12 s avec une action). */
export function durationOf(o, kind = o.kind || 'info') {
  const d = Math.min(o.onClick ? MAX_ACTION_MS : MAX_INFO_MS, o.duration || 3000);
  const important = !!o.onClick || kind === 'error' || kind === 'warn';
  return important ? Math.max(5000, d) : d;
}

export function createToasts(stack) {
  const recent = new Map(); // clé → { node, timer, forget }

  const liveToasts = () => [...stack.children].filter((n) => n.classList.contains('toast') && !n.classList.contains('is-leaving'));

  function dismiss(node) {
    if (!node.isConnected || node.classList.contains('is-leaving')) return;
    node.classList.add('is-leaving');
    setTimeout(() => node.remove(), 260);
  }

  /**
   * @param opts chaîne, ou { text, title?, kind = 'info' | 'success' | 'warn' | 'error' | 'money',
   *                           duration = 3000, onClick?, actionLabel = 'Voir', key? }
   * Renvoie le nœud du message.
   */
  function show(opts) {
    const o = typeof opts === 'string' ? { text: opts } : opts;
    const kind = KINDS.has(o.kind) ? o.kind : 'info';
    const key = o.key ? `key|${o.key}` : `${kind}|${o.title || ''}|${o.text}`;
    const duration = durationOf(o, kind);
    const prev = recent.get(key);
    if (prev && prev.node.isConnected && !prev.node.classList.contains('is-leaving')) {
      // Même message (ou même clé) : mise à jour et petit sursaut, pas d'empilement.
      if (o.key) {
        const t = prev.node.querySelector('.toast-text');
        if (t) t.textContent = typo(o.text);
        const h = prev.node.querySelector('.toast-title');
        if (h && o.title) h.textContent = typo(o.title);
      }
      clearTimeout(prev.timer);
      clearTimeout(prev.forget);
      prev.node.classList.remove('is-bump');
      void prev.node.offsetWidth; // relance l'animation
      prev.node.classList.add('is-bump');
      prev.timer = setTimeout(() => dismiss(prev.node), duration);
      prev.forget = setTimeout(() => { if (recent.get(key) === prev) recent.delete(key); }, duration + 400);
      return prev.node;
    }
    const go = o.onClick
      ? el(
          'button.btn.toast-go',
          {
            type: 'button',
            'aria-label': `${o.actionLabel || 'Voir'} : ${o.title || o.text}`,
            onclick: (e) => {
              e.stopPropagation();
              dismiss(node);
              try {
                o.onClick();
              } catch (err) {
                console.warn('Message :', err);
              }
            },
          },
          o.actionLabel || 'Voir',
        )
      : null;
    const node = el(
      `div.toast.toast--${kind}`,
      { role: kind === 'error' ? 'alert' : 'status' },
      el('div.toast-body', o.title ? el('strong.toast-title', o.title) : null, el('span.toast-text', o.text)),
      go,
    );
    if (o.key) node.dataset.key = String(o.key);
    stack.prepend(node);
    // Au plus MAX_VISIBLE messages : les plus anciens s'effacent (le nouveau reste toujours).
    const items = liveToasts();
    for (const v of items.slice(MAX_VISIBLE)) dismiss(v);
    const entry = { node, timer: setTimeout(() => dismiss(node), duration) };
    entry.forget = setTimeout(() => { if (recent.get(key) === entry) recent.delete(key); }, duration + 400);
    recent.set(key, entry);
    return node;
  }

  return {
    show,
    /** Retire un message affiché (nœud renvoyé par show). */
    hide(node) {
      if (node && node.nodeType === 1) dismiss(node);
    },
    clearAll() {
      for (const n of [...stack.children]) n.remove();
      for (const e of recent.values()) { clearTimeout(e.timer); clearTimeout(e.forget); }
      recent.clear();
    },
    stats: () => ({ visible: liveToasts().length }),
  };
}
