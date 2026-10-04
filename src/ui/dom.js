// Petits outils DOM partagés par l'interface (adaptés de Seve : aucune ressource, du code seulement).

/**
 * Crée un élément : el('div.card.is-open', { title: '…', onclick: fn, dataset: {…} }, enfants…)
 * Les enfants peuvent être des chaînes, des nœuds, des tableaux, null/false (ignorés).
 */
export function el(spec, attrs, ...children) {
  const [tag, ...classes] = spec.split('.');
  const node = document.createElement(tag || 'div');
  if (classes.length) node.className = classes.join(' ');
  if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) {
    children.unshift(attrs);
    attrs = null;
  }
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'dataset') Object.assign(node.dataset, v);
      else if (k === 'style' && typeof v === 'object') {
        // Variables CSS (« --sw ») : setProperty obligatoire ; propriétés ordinaires : affectation directe.
        for (const [prop, val] of Object.entries(v)) {
          if (prop.startsWith('--')) node.style.setProperty(prop, val);
          else node.style[prop] = val;
        }
      }
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else if (k === 'class') node.className += ` ${v}`;
      else if (k === 'html') node.innerHTML = v;
      else if (k in node && typeof v !== 'string') node[k] = v;
      else node.setAttribute(k, v === true ? '' : v);
    }
  }
  append(node, children);
  return node;
}

export function append(node, children) {
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(typo(String(c))));
  }
  return node;
}

const NBSP = ' ';

/**
 * Typographie française : espace insécable avant « : ; ! ? % » et à l'intérieur des guillemets,
 * pour qu'un signe ne se retrouve jamais seul en début de ligne. Appliquée à tout texte passé à el().
 */
export function typo(s) {
  if (!s || typeof s !== 'string') return s;
  return s
    .replace(/ ([:;!?%»])/g, `${NBSP}$1`)
    .replace(/« /g, `«${NBSP}`)
    .replace(/(\d) (mois|ans?|habitants?|cases?|pièces?)\b/g, `$1${NBSP}$2`);
}

/** Remplace le texte d'un nœud (avec la typographie française), sans toucher au DOM si rien ne change. */
export function setText(node, text) {
  const t = typo(String(text));
  if (node.textContent !== t) node.textContent = t;
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Nombre entier avec espace insécable pour les milliers (« 1 250 »). */
export function fmt(n) {
  const v = Math.round(Number(n) || 0);
  const s = String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return v < 0 ? `−${s}` : s;
}

/** Montant signé (« +12 », « −5 »). */
export function signed(n) {
  const v = Math.round(Number(n) || 0);
  return v > 0 ? `+${fmt(v)}` : fmt(v);
}

/** « 1 habitant », « 3 habitants ». */
export function plural(n, one, many = `${one}s`) {
  return `${fmt(n)}${NBSP}${Math.abs(n) > 1 ? many : one}`;
}

/** Décimal à la française (« 1,4 »). */
export function dec(n, digits = 1) {
  return Number(n).toFixed(digits).replace('.', ',');
}

export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

/** Réduit les animations si le joueur l'a demandé (option ou préférence du système). */
export function reducedMotion() {
  return document.documentElement.classList.contains('reduced-motion');
}
