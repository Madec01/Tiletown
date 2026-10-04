// Générateur pseudo-aléatoire à graine (mulberry32), sans aucun état global.
// Adapté de `src/core/rng.js` de Seve : la même graine donne toujours la même suite de nombres,
// ce qui rend la vallée reproductible (défi du jour à graine partagée) et les tests déterministes.
//
// Chaque générateur est fermé sur son propre état ; `fork(label)` dérive un flux indépendant
// (rivière, forêts, ville…) qui ne dépend pas du nombre de tirages déjà faits sur le parent.

/** Mélange une graine quelconque (nombre ou texte) et un sel en entier 32 bits non signé (FNV-1a). */
export function hashSeed(seed, salt = '') {
  const text = `${seed}|${salt}`;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  // L'état 0 est valide pour mulberry32, mais on préfère une graine « active ».
  return h === 0 ? 0x9e3779b9 : h;
}

/**
 * Crée un générateur déterministe.
 * @param {number|string} seed graine d'origine
 * @param {string} [salt]      chemin de dérivation (utilisé par `fork`)
 * @returns {{ seed, salt, next, int, range, chance, pick, shuffle, fork, state }}
 */
export function createRng(seed, salt = '') {
  let state = hashSeed(seed, salt);

  /** Flottant uniforme dans [0, 1) ; fait avancer l'état. */
  function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    seed,
    salt,
    next,
    /** Entier dans [min, max], bornes incluses. */
    int(min, max) {
      if (max < min) [min, max] = [max, min];
      return min + Math.floor(next() * (max - min + 1));
    },
    /** Flottant uniforme dans [min, max). */
    range(min, max) {
      return min + next() * (max - min);
    },
    /** Vrai avec la probabilité p. */
    chance(p) {
      return next() < p;
    },
    /** Un élément du tableau (undefined si vide). */
    pick(array) {
      if (!array || array.length === 0) return undefined;
      return array[Math.floor(next() * array.length)];
    },
    /** Copie mélangée du tableau (Fisher-Yates) ; le tableau d'origine n'est pas modifié. */
    shuffle(array) {
      const a = Array.from(array);
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        const tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
      }
      return a;
    },
    /**
     * Flux dérivé, indépendant des tirages déjà faits : deux `fork('river')` sur le même parent
     * donnent la même suite. Sert à isoler les sous-systèmes (rivière, forêts, ville…).
     */
    fork(label) {
      return createRng(seed, `${salt}/${label}`);
    },
    /** État interne courant (entier 32 bits), utile pour le débogage ou une sauvegarde. */
    state() {
      return state;
    },
  };
}
