// Pictogrammes d'interface : tracés Lucide (ISC), voir CREDITS.md.
const paths = {
  house:
    '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 2 17 2c2 4 3 7 3 10a8 8 0 0 1-9 8Z"/><path d="M2 22c0-6 5-11 12-14"/>',
  people:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/><circle cx="9" cy="7" r="4"/>',
  smile:
    '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M15 8h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9m3-10v12"/>',
  shop: '<path d="M3 9h18l-2-6H5L3 9Zm1 4v8h16v-8M9 21v-8h6v8M3 9v2a3 3 0 0 0 6 0V9m0 2a3 3 0 0 0 6 0V9m0 2a3 3 0 0 0 6 0V9"/>',
  heart:
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  bolt: '<path d="m13 2-10 12h8l-1 8 11-12h-8l1-8Z"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
  hammer:
    '<path d="m15 12-8.4 8.4a2 2 0 0 1-2.8-2.8L12 9m-3-4 4-3 8 8-3 4-9-9Z"/>',
  gear: '<path d="m9 3 1-1h4l1 1v2l2 1 2-1 2 3-1 2v3l1 2-2 3-2-1-2 1v3h-6v-3l-2-1-2 1-2-3 1-2v-3L3 8l2-3 2 1 2-1V3Z"/><circle cx="12" cy="11" r="3"/>',
  sound:
    '<path d="m11 5-6 4H2v6h3l6 4V5Zm4 3a5 5 0 0 1 0 8m3-11a9 9 0 0 1 0 14"/>',
  mute: '<path d="m11 5-6 4H2v6h3l6 4V5Zm6 4 5 6m0-6-5 6"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6 6-2Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  book: '<path d="M12 6v15m0-15C9 3 5 3 2 4v16c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-7-1-10 2Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  flag: '<path d="M4 22V3c4-3 9 3 16 0v11c-7 3-12-3-16 0"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  play: '<path d="m7 4 14 8-14 8V4Z"/>',
};
export function icon(name, className = "") {
  const node = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  for (const [key, value] of Object.entries({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "1.7",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
    class: `icon ${className}`,
  }))
    node.setAttribute(key, value);
  node.innerHTML = paths[name] || paths.leaf;
  return node;
}
