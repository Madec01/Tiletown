// Sauvegarde locale (localStorage), adaptée de Seve (src/storage.js). Deux clés distinctes :
//   `tiletown.save`    la partie en cours (monde, argent, mois) + son mode et, en carrière, son niveau
//   `tiletown.career`  la carrière (niveaux ouverts, étoiles, catalogue acquis, leçons vues)
// Perdre la partie en cours ne perd jamais la carrière, et inversement.
//
//   saveGame(game, { mode, levelId }) → bool   à chaque tick de mois et après chaque pose / démolition
//   loadGame() → game | null                   au démarrage (null : rien de sauvé, ou sauvegarde illisible)
//   clearGame()                                « ?new=1 » repart de zéro
//   meta() → { savedAt, seed, month, money, version, mode?, levelId? } | null
//   savedAt() → ms | null                      horodatage de la dernière sauvegarde
//   wantsNewGame(search) → bool                « ?new=1 » dans l'adresse
//   createCareerStorage() → { save(career), load(), clear(), has() }
//
// Chaque accès est protégé (navigation privée, stockage plein ou désactivé) : en cas d'échec, le jeu
// continue sans sauvegarde et les lectures renvoient null. L'enveloppe écrite :
//   { schema: 1, savedAt, version: game.version, seed, month, money, mode?, levelId?, state: serialize(game) }
// `createStorage` accepte un stockage et des (dé)sérialiseurs injectés : tests sous Node sans navigateur.

import { serialize as serializeGame, deserialize as deserializeGame } from './core/game.js';
import { serializeCareer as serializeCareerCore, deserializeCareer as deserializeCareerCore } from './core/career.js';

export const SAVE_KEY = 'tiletown.save';
export const CAREER_KEY = 'tiletown.career';
export const SAVE_SCHEMA = 1;
export const CAREER_SCHEMA = 1;
/** Modes de jeu (docs/ARCHITECTURE.md §11.3) : écran titre, carrière, bac à sable. */
export const MODES = Object.freeze(['title', 'career', 'sandbox']);

/** Mode valide ou null (une sauvegarde d'avant la carrière n'en porte pas : c'est un bac à sable). */
export function normalizeMode(mode) {
  return mode === 'career' || mode === 'sandbox' ? mode : null;
}

/** « ?new=1 » (ou « ?new ») : on repart de zéro. */
export function wantsNewGame(search) {
  const q = new URLSearchParams(search || '');
  if (!q.has('new')) return false;
  const v = q.get('new');
  return v === '' || v === '1' || v === 'true';
}

/**
 * Fabrique de stockage. `storage` : objet localStorage ou fonction qui le renvoie (lu à chaque accès :
 * sous Node il n'existe pas au chargement du module) ; `serialize` / `deserialize` : celles du cœur par défaut.
 */
export function createStorage({ storage = () => globalThis.localStorage, serialize = serializeGame, deserialize = deserializeGame, key = SAVE_KEY, now = () => Date.now() } = {}) {
  const store = () => {
    try {
      return typeof storage === 'function' ? storage() : storage;
    } catch {
      return null;
    }
  };

  function read() {
    try {
      const s = store();
      if (!s) return null;
      const raw = s.getItem(key);
      if (raw === null || raw === undefined) return null;
      const data = JSON.parse(raw);
      return data && typeof data === 'object' ? data : null;
    } catch {
      return null;
    }
  }

  function write(value) {
    try {
      const s = store();
      if (!s) return false;
      s.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function saveGame(game, { mode = null, levelId = null } = {}) {
    if (!game || typeof game !== 'object') return false;
    let state;
    try {
      state = serialize(game);
    } catch (err) {
      console.warn('Sauvegarde impossible :', err);
      return false;
    }
    const m = normalizeMode(mode);
    return write({
      schema: SAVE_SCHEMA,
      savedAt: now(),
      version: game.version ?? null,
      seed: game.seed ?? null,
      month: game.month ?? 0,
      money: game.money ?? null,
      ...(m ? { mode: m } : {}),
      ...(m === 'career' && levelId ? { levelId: String(levelId) } : {}),
      state,
    });
  }

  function loadGame() {
    const data = read();
    if (!data || !data.state || typeof data.state !== 'object') return null;
    try {
      const game = deserialize(data.state);
      return game && typeof game === 'object' ? game : null;
    } catch (err) {
      console.warn('Sauvegarde illisible, nouvelle partie :', err);
      return null;
    }
  }

  function clearGame() {
    try {
      store()?.removeItem(key);
    } catch {
      /* stockage indisponible */
    }
  }

  /**
   * Métadonnées sans charger la partie : { savedAt, seed, month, money, version } et, si la
   * sauvegarde en porte, { mode, levelId } (une sauvegarde d'avant la carrière n'en a pas).
   */
  function meta() {
    const data = read();
    if (!data || !data.state) return null;
    const mode = normalizeMode(data.mode);
    return {
      savedAt: data.savedAt ?? null,
      seed: data.seed ?? null,
      month: data.month ?? 0,
      money: data.money ?? null,
      version: data.version ?? null,
      ...(mode ? { mode } : {}),
      ...(mode === 'career' && data.levelId ? { levelId: String(data.levelId) } : {}),
    };
  }

  return {
    saveGame,
    loadGame,
    clearGame,
    meta,
    savedAt: () => meta()?.savedAt ?? null,
    hasSave: () => !!read()?.state,
    key,
  };
}

/**
 * Sauvegarde de la carrière (clé `tiletown.career`), séparée de la partie en cours : perdre l'une ne
 * perd jamais l'autre. Enveloppe : { schema: 1, savedAt, state: serializeCareer(career) }.
 */
export function createCareerStorage({ storage = () => globalThis.localStorage, serialize = serializeCareerCore, deserialize = deserializeCareerCore, key = CAREER_KEY, now = () => Date.now() } = {}) {
  const store = () => {
    try {
      return typeof storage === 'function' ? storage() : storage;
    } catch {
      return null;
    }
  };
  function read() {
    try {
      const s = store();
      if (!s) return null;
      const raw = s.getItem(key);
      if (raw === null || raw === undefined) return null;
      const data = JSON.parse(raw);
      return data && typeof data === 'object' ? data : null;
    } catch {
      return null;
    }
  }
  return {
    key,
    save(career) {
      if (!career || typeof career !== 'object') return false;
      try {
        const s = store();
        if (!s) return false;
        s.setItem(key, JSON.stringify({ schema: CAREER_SCHEMA, savedAt: now(), state: serialize(career) }));
        return true;
      } catch (err) {
        console.warn('Carrière non sauvegardée :', err);
        return false;
      }
    },
    load() {
      const data = read();
      if (!data || !data.state || typeof data.state !== 'object') return null;
      try {
        const career = deserialize(data.state);
        return career && typeof career === 'object' ? career : null;
      } catch (err) {
        console.warn('Carrière illisible, on repart du premier niveau :', err);
        return null;
      }
    },
    clear() {
      try {
        store()?.removeItem(key);
      } catch { /* stockage indisponible */ }
    },
    has: () => !!read()?.state,
    savedAt: () => read()?.savedAt ?? null,
  };
}

const defaultStorage = createStorage();
export const saveGame = defaultStorage.saveGame;
export const loadGame = defaultStorage.loadGame;
export const clearGame = defaultStorage.clearGame;
export const savedAt = defaultStorage.savedAt;
export const saveMeta = defaultStorage.meta;
