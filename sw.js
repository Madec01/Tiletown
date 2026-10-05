// Service worker de Tiletown : tout le jeu hors ligne, sans jamais mélanger deux versions (adapté de Seve).
//
// Le jeu publié est construit par tools/build.js : UN fichier JavaScript (module ES, three.js inclus) et UN
// fichier CSS dont le nom contient l'empreinte du contenu (dist/game.<empreinte>.js / .css), et des
// ressources (modèles GLB, polices, icônes) appelées avec « ?v=<empreinte> ». Une page index.html, quelle
// que soit sa version, ne désigne donc que des fichiers qui lui correspondent exactement : c'est ce qui
// rend les choix ci-dessous sûrs.
//
// - Précache : la liste PRECACHE (générée par tools/build.js, avec une empreinte par fichier).
//   Les entrées sont rangées sous la clé « chemin?__rev=<empreinte> » dans un cache unique : d'une
//   version à l'autre, seuls les fichiers modifiés sont retéléchargés. Chaque fichier téléchargé est
//   vérifié (SHA-256) : si le CDN sert encore l'ancienne version, l'installation échoue proprement
//   et sera retentée plus tard.
//     « core » (page, paquet JS/CSS, polices, icônes, manifeste, modèles 3D) : téléchargé à l'installation ;
//     « lazy » (sons, à venir) : rangé au premier usage ; vérifié de la même façon.
// - Requêtes :
//     navigation (index.html, ?…)  → RÉSEAU D'ABORD (revalidé, jamais une vieille copie du cache
//                                     HTTP), délai de 5 s ; hors ligne ou réseau trop lent → page de
//                                     la version installée (cohérente avec son précache) ;
//     fichiers précachés           → cache d'abord ; si l'adresse porte « ?v=<empreinte> » et
//                                     qu'elle ne correspond pas à la version en cache → réseau ;
//     requêtes « Range » (audio)   → réponse 206 construite à partir du fichier complet en cache ;
//     autres requêtes du même site → réseau d'abord, cache en secours ;
//     autres sites                 → non interceptées.
// - Mise à jour : le nouveau service worker s'active tout de suite (skipWaiting) : tout le code du
//   jeu est dans un seul fichier déjà exécuté, aucune page ouverte ne peut donc charger un morceau
//   de code d'une autre version. La page compare sa version à celle du service worker
//   (src/pwa.js) et propose « Nouvelle version disponible — Recharger » si elle est plus ancienne.
//   À l'activation, les entrées obsolètes et les anciens caches sont supprimés.
//
// Toutes les adresses sont relatives à l'emplacement de ce fichier : le jeu fonctionne aussi dans
// un sous-dossier (GitHub Pages : https://madec01.github.io/tiletown/).

// <precache> — bloc généré par tools/build.js : ne pas modifier à la main
const VERSION = 'db60ef727f2b';
// 99 fichiers, 3.01 Mo ; installés d'emblée (core) : 99 fichiers, 3.01 Mo
const PRECACHE = [
  ["index.html", 'c061ec810a8060fc', 30114, 'core'],
  ["manifest.webmanifest", 'd781b7f56357c6a9', 1194, 'core'],
  ["dist/game.f6b12ae2d8.js", '1d5cc69c97f23c07', 1011807, 'core'],
  ["dist/game.1e639b33dd.css", '1e639b33dd59554f', 41162, 'core'],
  ["assets/fonts/Nunito-latin-ext.woff2", '2c8d792869818ecb', 35588, 'core'],
  ["assets/fonts/Nunito-latin.woff2", 'ba344451eab25b21', 39128, 'core'],
  ["assets/icons/apple-touch-icon.png", '89a7440dadb00696', 4356, 'core'],
  ["assets/icons/favicon-32.png", '5006ed0364df15df', 1320, 'core'],
  ["assets/icons/icon-192.png", 'f0e006b9bdc6b707', 6968, 'core'],
  ["assets/icons/icon-512.png", 'ff0465586546dded', 18767, 'core'],
  ["assets/icons/icon-maskable-192.png", '78fe1d888d171eae', 4581, 'core'],
  ["assets/icons/icon-maskable-512.png", '64571da0928dd936', 12807, 'core'],
  ["assets/icons/icon-monochrome-512.png", '34e7df917e687c83', 5857, 'core'],
  ["assets/models/bee.glb", 'f3a7a189dfcfd6cb', 56864, 'core'],
  ["assets/models/bridge.glb", 'd084e39c00f6dbec', 5676, 'core'],
  ["assets/models/building-small-a.glb", '359a212d5ddb37d5', 17512, 'core'],
  ["assets/models/building-small-b.glb", '0aa48f2589210960', 13660, 'core'],
  ["assets/models/building-small-c.glb", '35b85661347f6b4a', 17468, 'core'],
  ["assets/models/building-tall-a.glb", '8d98270006d72d51', 22200, 'core'],
  ["assets/models/building-tall-b.glb", 'dec1f201c9caf2dc', 36868, 'core'],
  ["assets/models/building-tall-c.glb", 'f59134775326b86f', 22256, 'core'],
  ["assets/models/bus.glb", 'ca13614e781d9e99', 23800, 'core'],
  ["assets/models/bush.glb", '7e067aab832056cf', 3172, 'core'],
  ["assets/models/car-a.glb", 'cf8b4d317235c3fb', 19424, 'core'],
  ["assets/models/car-b.glb", '1ef4ad3ae889a997', 20076, 'core'],
  ["assets/models/citizen-a.glb", '630a156dfbadff92', 11284, 'core'],
  ["assets/models/citizen-b.glb", 'af5c9ae3a81785f5', 11288, 'core'],
  ["assets/models/citizen-c.glb", 'c924f4dd91d65893', 11432, 'core'],
  ["assets/models/clinic.glb", '29322583b7b1631b', 7284, 'core'],
  ["assets/models/compost.glb", '73d5d90ca4bbd359', 17684, 'core'],
  ["assets/models/cow.glb", '6f733876b4fb0eff', 228040, 'core'],
  ["assets/models/crop-corn.glb", 'f5f1c1f1a7f448a0', 14656, 'core'],
  ["assets/models/crop-wheat.glb", '9893a8cfb5b70839', 26600, 'core'],
  ["assets/models/cyclist.glb", '34367742f2c920f2', 36648, 'core'],
  ["assets/models/deer.glb", '6413ca117dfe7481', 219588, 'core'],
  ["assets/models/duck.glb", '317c1381c8132575', 59636, 'core'],
  ["assets/models/factory-a.glb", 'de2117d0d3392273', 23460, 'core'],
  ["assets/models/factory-b.glb", '58d17d4c777baa9e', 19260, 'core'],
  ["assets/models/factory-c.glb", 'b46ee481bbf6d345', 13424, 'core'],
  ["assets/models/flowers.glb", 'd2b1d794852ecc2d', 8140, 'core'],
  ["assets/models/fox.glb", 'c6a4b1ba533ffc30', 242552, 'core'],
  ["assets/models/grass-tuft-a.glb", 'bc5dab3550acddd0', 3528, 'core'],
  ["assets/models/grass-tuft-b.glb", '34699f08d7ac4849', 3240, 'core'],
  ["assets/models/heron.glb", 'c410b77ecb109021', 22312, 'core'],
  ["assets/models/house-a.glb", '9a81150c9159f94b', 16832, 'core'],
  ["assets/models/house-b.glb", '8d238b7600a15988', 15312, 'core'],
  ["assets/models/house-c.glb", 'b3f5bdc571deb4be', 11748, 'core'],
  ["assets/models/house-d.glb", '439de078d5a263d7', 18024, 'core'],
  ["assets/models/house-e.glb", '7b2d116a3fe1656a', 14192, 'core'],
  ["assets/models/house-f.glb", '6858fcf2ae15898b', 23924, 'core'],
  ["assets/models/manifest.json", 'a658ccf6eff294f8', 85867, 'core'],
  ["assets/models/market.glb", 'b99189bcb23fa28f', 18096, 'core'],
  ["assets/models/office-a.glb", '5454d3dd3c937463', 31320, 'core'],
  ["assets/models/office-b.glb", '8cad03050d60634f', 37528, 'core'],
  ["assets/models/otter.glb", '0792002d9dd36ea7', 19308, 'core'],
  ["assets/models/owl.glb", 'ff7e89c7ead4003f', 56900, 'core'],
  ["assets/models/park.glb", '7b336ae9eb3f7e1f', 17904, 'core'],
  ["assets/models/pine-a.glb", 'aa3413b57fb089ab', 4020, 'core'],
  ["assets/models/pine-b.glb", '449f2a480bbee35a', 4408, 'core'],
  ["assets/models/pine-l.glb", 'bbb156b26be2b853', 4404, 'core'],
  ["assets/models/pine-m.glb", '08c863adcba857c4', 4020, 'core'],
  ["assets/models/pine-s.glb", 'b511a724ba172970', 3708, 'core'],
  ["assets/models/power-plant.glb", 'ed66ce50778f315a', 14916, 'core'],
  ["assets/models/road-corner.glb", 'b9bdaebc7189239c', 4360, 'core'],
  ["assets/models/road-cross.glb", 'dac9f63f8e9e5238', 3376, 'core'],
  ["assets/models/road-crosswalk.glb", 'f08067c83d77414a', 2872, 'core'],
  ["assets/models/road-edge-node-2.glb", 'd02e65b618e336aa', 2772, 'core'],
  ["assets/models/road-edge-node-3.glb", '8c4cecf02d7eeccd', 2812, 'core'],
  ["assets/models/road-edge-node-4.glb", '9822fe1b3ffde97a', 3000, 'core'],
  ["assets/models/road-edge-straight.glb", '85f5abafe44cb076', 3264, 'core'],
  ["assets/models/road-straight.glb", '3bd85a3df604aaab', 2656, 'core'],
  ["assets/models/road-t.glb", 'c64ec46b60b01c39', 3104, 'core'],
  ["assets/models/rock-a.glb", '1701e78450e9cc0b', 3604, 'core'],
  ["assets/models/rock-b.glb", '48171a0c0238f2f7', 3608, 'core'],
  ["assets/models/sapling.glb", '2c7c5f152eabdad6', 2916, 'core'],
  ["assets/models/school.glb", '495cb82f31b50269', 10596, 'core'],
  ["assets/models/shop-a.glb", '6eca1591fdc83a2d', 24280, 'core'],
  ["assets/models/shop-b.glb", '515da893902a1331', 31424, 'core'],
  ["assets/models/shop-c.glb", '5e9531dafb5db178', 16080, 'core'],
  ["assets/models/shrub-a.glb", '3729b447dc2efbe8', 3180, 'core'],
  ["assets/models/shrub-b.glb", '9229483769226a4b', 3452, 'core'],
  ["assets/models/solar.glb", '823b796aac8c477b', 23996, 'core'],
  ["assets/models/swallow.glb", '5d146673e104c889', 17784, 'core'],
  ["assets/models/townhall.glb", 'fa851004355d98cc', 10376, 'core'],
  ["assets/models/tram-stop.glb", 'a13495f4b514ba85', 9312, 'core'],
  ["assets/models/tram.glb", '5e7ddc45a793a435', 21240, 'core'],
  ["assets/models/tree-a.glb", 'd5a3474b83938c79', 4004, 'core'],
  ["assets/models/tree-b.glb", '03ea122e8dcc99e5', 3768, 'core'],
  ["assets/models/tree-c.glb", '261d47ac12185894', 4428, 'core'],
  ["assets/models/tree-round-l.glb", '690b6b64f84eef08', 4456, 'core'],
  ["assets/models/tree-round-m.glb", 'd5f8372075192856', 4044, 'core'],
  ["assets/models/tree-round-s.glb", '7d7e5b367a6de15c', 3536, 'core'],
  ["assets/models/tree-tall-l.glb", '50dc21b6f27d0160', 4036, 'core'],
  ["assets/models/tree-tall-m.glb", '3996cfc98be177ea', 3768, 'core'],
  ["assets/models/tree-tall-s.glb", 'b46ed422f096c5de', 3512, 'core'],
  ["assets/models/truck.glb", 'f16eb19fadac1ac3', 19756, 'core'],
  ["assets/models/wastewater.glb", '849a7a209c0e25f3', 17404, 'core'],
  ["assets/models/water-tower.glb", '1e0a52d70b358f12', 10408, 'core'],
  ["assets/models/wind-turbine.glb", 'b8f3d97fc42f273a', 9452, 'core'],
];
// </precache>

const CACHE = 'tiletown-precache-v1';   // fichiers versionnés (entrées « ?__rev= »)
const RUNTIME = 'tiletown-runtime-v1';  // copies des autres requêtes du même site (secours hors ligne)
const KEEP = new Set([CACHE, RUNTIME]);
const CONCURRENCY = 6;
const RETRIES = 3;
const NAVIGATION_TIMEOUT = 5000; // ms avant de servir la page de la version installée

const BASE = new URL('./', self.location).href; // racine du jeu (…/tiletown/)
const INDEX_URL = new URL('index.html', BASE).href;

// chemin absolu (sans requête) → { key, hash, lazy }
const ENTRIES = new Map(
  PRECACHE.map(([path, hash, , kind]) => {
    const url = new URL(path, BASE).href;
    return [url, { key: `${url}?__rev=${hash}`, hash, path, lazy: kind === 'lazy' }];
  }),
);
const WANTED_KEYS = new Set([...ENTRIES.values()].map((e) => e.key));

// ---------------------------------------------------------------------------------------------
// Vérification des fichiers téléchargés.

async function sha16(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return [...new Uint8Array(digest, 0, 8)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function storedResponse(body, type) {
  const headers = new Headers();
  headers.set('Content-Type', type || 'application/octet-stream');
  headers.set('Content-Length', String(body.byteLength));
  headers.set('Accept-Ranges', 'bytes');
  return new Response(body, { status: 200, statusText: 'OK', headers });
}

async function fetchVerified(url, hash) {
  let lastError;
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      // 1er essai : on contourne le cache HTTP du navigateur ; ensuite : on contourne aussi le CDN.
      const target = attempt === 0 ? url : `${url}?__rev=${hash}&__try=${attempt}`;
      const res = await fetch(target, { cache: 'reload', credentials: 'same-origin' });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      const body = await res.arrayBuffer();
      const got = await sha16(body);
      if (got !== hash) throw new Error(`empreinte inattendue pour ${url} (${got} ≠ ${hash})`);
      return storedResponse(body, res.headers.get('Content-Type'));
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

// ---------------------------------------------------------------------------------------------
// Installation : téléchargement (vérifié) des fichiers « core » qui ne sont pas encore en cache.

async function precache() {
  const cache = await caches.open(CACHE);
  const present = new Set((await cache.keys()).map((r) => r.url));
  const todo = [...ENTRIES.entries()].filter(([, e]) => !e.lazy && !present.has(e.key));
  let next = 0;
  let failure = null;
  async function worker() {
    while (next < todo.length && !failure) {
      const [url, e] = todo[next++];
      try {
        await cache.put(e.key, await fetchVerified(url, e.hash));
      } catch (err) {
        failure = err;
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  if (failure) throw failure; // l'installation échoue ; les fichiers déjà rangés restent pour la prochaine fois
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

// ---------------------------------------------------------------------------------------------
// Activation : ménage (entrées d'anciennes versions, anciens caches), puis prise de contrôle.

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('tiletown-') && !KEEP.has(name)) await caches.delete(name);
    }
    const cache = await caches.open(CACHE);
    for (const req of await cache.keys()) {
      if (!WANTED_KEYS.has(req.url)) await cache.delete(req);
    }
    await caches.delete(RUNTIME); // copies de l'ancienne version : inutiles
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.disable(); } catch { /* sans importance */ }
    }
    await self.clients.claim();
  })());
});

// ---------------------------------------------------------------------------------------------
// Messages de la page.

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') self.skipWaiting();
  else if (data.type === 'GET_VERSION' && event.ports && event.ports[0]) {
    event.ports[0].postMessage({ version: VERSION, files: PRECACHE.length });
  }
});

// ---------------------------------------------------------------------------------------------
// Requêtes.

/** Réponse partielle (206) construite à partir d'une réponse complète, pour un en-tête Range. */
async function rangeResponse(full, rangeHeader) {
  const buf = await full.arrayBuffer();
  const size = buf.byteLength;
  const m = /^bytes=(\d*)-(\d*)$/.exec((rangeHeader || '').trim());
  let start;
  let end;
  if (m && (m[1] !== '' || m[2] !== '')) {
    if (m[1] === '') { // suffixe : les N derniers octets
      start = Math.max(0, size - Number(m[2]));
      end = size - 1;
    } else {
      start = Number(m[1]);
      end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
    }
  }
  const type = full.headers.get('Content-Type') || 'application/octet-stream';
  if (start === undefined || start >= size || end < start) {
    return new Response(null, { status: 416, statusText: 'Range Not Satisfiable', headers: { 'Content-Range': `bytes */${size}` } });
  }
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': type,
      'Content-Length': String(end - start + 1),
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
    },
  });
}

async function fromPrecache(url) {
  const e = ENTRIES.get(url);
  if (!e) return undefined;
  const cache = await caches.open(CACHE);
  return cache.match(e.key);
}

/**
 * Page du jeu : réseau d'abord (revalidé auprès du serveur : jamais une vieille copie du cache
 * HTTP), puis, hors ligne ou au bout de NAVIGATION_TIMEOUT, la page de la version installée.
 * Les deux sont cohérentes : chaque index.html ne désigne que des fichiers à empreinte.
 */
async function handleNavigation(request) {
  const network = fetch(request.url, { cache: 'no-cache', credentials: 'same-origin' }).then((res) => {
    if (res.redirected) return Response.redirect(res.url, 302);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  });
  const fallback = async () => (await fromPrecache(INDEX_URL)) || (await caches.match(request, { cacheName: RUNTIME, ignoreSearch: true }));
  let timer;
  const slow = new Promise((resolve) => { timer = setTimeout(resolve, NAVIGATION_TIMEOUT, 'slow'); });
  try {
    const first = await Promise.race([network, slow]);
    if (first !== 'slow') return first;
    const cached = await fallback();
    return cached || (await network);
  } catch (err) {
    const cached = await fallback();
    if (cached) return cached;
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Télécharge un fichier « lazy » et le range s'il est bien celui de cette version. */
async function fetchAndStore(request, e) {
  const res = await fetch(request.url, { credentials: 'same-origin' });
  if (!res.ok || res.status !== 200) return res;
  const body = await res.arrayBuffer();
  const type = res.headers.get('Content-Type');
  if ((await sha16(body)) === e.hash) {
    const copy = storedResponse(body.slice(0), type);
    caches.open(CACHE).then((c) => c.put(e.key, copy)).catch(() => {});
  }
  return storedResponse(body, type);
}

async function handlePrecached(request, url, e) {
  const cached = await fromPrecache(url);
  let res = cached;
  if (!res) res = e.lazy ? await fetchAndStore(request, e) : await fetch(request);
  const range = request.headers.get('Range');
  return range && res.status === 200 ? rangeResponse(res, range) : res;
}

async function handleRuntime(request) {
  try {
    const res = await fetch(request);
    if (res.ok && res.status === 200 && res.type === 'basic') {
      const copy = res.clone();
      caches.open(RUNTIME).then((c) => c.put(request, copy)).catch(() => {});
    }
    return res;
  } catch (err) {
    const cached = await caches.match(request, { cacheName: RUNTIME });
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(BASE)) return; // autre site / hors du jeu

  if (request.mode === 'navigate') {
    // Seules les pages du jeu (racine ou index.html) : un autre fichier HTML (dev.html, outils)
    // passe par le réseau.
    const path = url.pathname.slice(new URL(BASE).pathname.length);
    if (path === '' || path === 'index.html') {
      event.respondWith(handleNavigation(request));
      return;
    }
  }

  const clean = url.origin + url.pathname; // sans « ?… » ni « #… »
  const e = ENTRIES.get(clean);
  if (e) {
    // « ?v=<empreinte> » d'une autre version (page plus récente ou plus ancienne que ce service
    // worker) : on ne sert pas notre copie, c'est le réseau qui répond.
    const v = url.searchParams.get('v');
    if (v && !e.hash.startsWith(v)) {
      event.respondWith(fetch(request));
      return;
    }
    // Autres paramètres (« ?r= » d'un nouvel essai du chargeur, « ?__rev= »…) : réseau aussi.
    if ([...url.searchParams.keys()].some((k) => k !== 'v')) return;
    event.respondWith(handlePrecached(request, clean, e));
    return;
  }
  event.respondWith(handleRuntime(request));
});
