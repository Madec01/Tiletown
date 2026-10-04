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
const VERSION = 'ddd1a3fc9ef7';
// 64 fichiers, 1.70 Mo ; installés d'emblée (core) : 64 fichiers, 1.70 Mo
const PRECACHE = [
  ["index.html", '42663d20fd97eda1', 29128, 'core'],
  ["manifest.webmanifest", 'd781b7f56357c6a9', 1194, 'core'],
  ["dist/game.f15a9b737b.js", '9563d73400b8bb41', 748588, 'core'],
  ["dist/game.b8ae07dec7.css", 'b8ae07dec7b5ff95', 16354, 'core'],
  ["assets/fonts/Nunito-latin-ext.woff2", '2c8d792869818ecb', 35588, 'core'],
  ["assets/fonts/Nunito-latin.woff2", 'ba344451eab25b21', 39128, 'core'],
  ["assets/icons/apple-touch-icon.png", '89a7440dadb00696', 4356, 'core'],
  ["assets/icons/favicon-32.png", '5006ed0364df15df', 1320, 'core'],
  ["assets/icons/icon-192.png", 'f0e006b9bdc6b707', 6968, 'core'],
  ["assets/icons/icon-512.png", 'ff0465586546dded', 18767, 'core'],
  ["assets/icons/icon-maskable-192.png", '78fe1d888d171eae', 4581, 'core'],
  ["assets/icons/icon-maskable-512.png", '64571da0928dd936', 12807, 'core'],
  ["assets/icons/icon-monochrome-512.png", '34e7df917e687c83', 5857, 'core'],
  ["assets/models/bridge.glb", '001930e968f7eefd', 8016, 'core'],
  ["assets/models/building-small-a.glb", '4e68cad04f2d12ea', 18832, 'core'],
  ["assets/models/building-small-b.glb", '4f92dca36f49fc9e', 16808, 'core'],
  ["assets/models/building-tall-a.glb", 'fee56496a3a1fb9b', 24432, 'core'],
  ["assets/models/building-tall-b.glb", 'd9f4f5192af8b8a0', 43692, 'core'],
  ["assets/models/bus.glb", '455213785a7435bd', 28656, 'core'],
  ["assets/models/bush.glb", 'ec94ef3952ba4f6e', 4024, 'core'],
  ["assets/models/car-a.glb", 'f680d60696e3f483', 23436, 'core'],
  ["assets/models/car-b.glb", '2645aed420a990e0', 24160, 'core'],
  ["assets/models/clinic.glb", '6abcf67e913873a2', 12788, 'core'],
  ["assets/models/compost.glb", '36b07642199f5fe4', 24040, 'core'],
  ["assets/models/crop-corn.glb", '8fff89afb582bfa6', 15444, 'core'],
  ["assets/models/crop-wheat.glb", '3e7b22196980337b', 27432, 'core'],
  ["assets/models/factory-a.glb", 'e2c6a7d19f700896', 27856, 'core'],
  ["assets/models/factory-b.glb", '26588bb743101dcc', 22684, 'core'],
  ["assets/models/flowers.glb", '2830556365954e2b', 11936, 'core'],
  ["assets/models/house-a.glb", '6f4f0a5e4c64c3a4', 17888, 'core'],
  ["assets/models/house-b.glb", 'daeb472919507ffc', 16632, 'core'],
  ["assets/models/house-c.glb", '47a4da7c8af2fb7b', 13652, 'core'],
  ["assets/models/manifest.json", 'a7ae735e7c1f3323', 39818, 'core'],
  ["assets/models/market.glb", '2986605864d11520', 24036, 'core'],
  ["assets/models/office-a.glb", 'a1ae95ee0cb201c5', 34608, 'core'],
  ["assets/models/park.glb", '948dea911b9ff5ed', 29780, 'core'],
  ["assets/models/pine-a.glb", '822cadca3f8a68b5', 7032, 'core'],
  ["assets/models/pine-b.glb", 'ddd4bfb3518dc7e2', 4260, 'core'],
  ["assets/models/power-plant.glb", '9e1dbd9ae0a9b6dd', 18700, 'core'],
  ["assets/models/road-corner.glb", '4560193436eb11fb', 6232, 'core'],
  ["assets/models/road-cross.glb", '80802c84771ad612', 5348, 'core'],
  ["assets/models/road-crosswalk.glb", 'd2dbf10ca7e19bc0', 4972, 'core'],
  ["assets/models/road-edge-node-2.glb", '3bc23dbda52d0e8c', 3760, 'core'],
  ["assets/models/road-edge-node-3.glb", '88820965e4460ed9', 3808, 'core'],
  ["assets/models/road-edge-node-4.glb", '1aac8c12600a1fa5', 3956, 'core'],
  ["assets/models/road-edge-straight.glb", '8fa46ad74aaeb176', 5356, 'core'],
  ["assets/models/road-straight.glb", '980910ecdd858102', 4612, 'core'],
  ["assets/models/road-t.glb", '6a95e4bbb5b3dbce', 5064, 'core'],
  ["assets/models/rock-a.glb", '62ead34227c70f6b', 4432, 'core'],
  ["assets/models/rock-b.glb", 'fe4715e6e70e62cc', 5488, 'core'],
  ["assets/models/school.glb", 'f778a0c487080a2a', 17248, 'core'],
  ["assets/models/shop-a.glb", 'f23a336ce22ecb92', 27692, 'core'],
  ["assets/models/shop-b.glb", '6c434162ad07a455', 37820, 'core'],
  ["assets/models/solar.glb", '343329c2be4a43dd', 28336, 'core'],
  ["assets/models/townhall.glb", 'bdb8ec81b7e4afe1', 17084, 'core'],
  ["assets/models/tram-stop.glb", 'ab8d3bdfb222a335', 19548, 'core'],
  ["assets/models/tram.glb", '6db7d6692a6532d9', 26016, 'core'],
  ["assets/models/tree-a.glb", '05a293930e523251', 4760, 'core'],
  ["assets/models/tree-b.glb", '2fc229cf6f65f610', 5888, 'core'],
  ["assets/models/tree-c.glb", '11382f210cd8ee94', 3912, 'core'],
  ["assets/models/truck.glb", '1c19e9181baf571b', 23992, 'core'],
  ["assets/models/wastewater.glb", '828f751f42a0dd60', 24956, 'core'],
  ["assets/models/water-tower.glb", '01101f10c10d9c5d', 13216, 'core'],
  ["assets/models/wind-turbine.glb", '397b8abb2d3dd77a', 12056, 'core'],
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
