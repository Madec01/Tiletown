// Sauvegarde locale de la partie (localStorage, clé `tiletown.save`), adaptée de Seve (src/storage.js).
//
//   saveGame(game) → bool        à chaque tick de mois et après chaque pose / démolition / annulation
//   loadGame() → game | null     au démarrage (null : rien de sauvé, ou sauvegarde illisible)
//   clearGame()                  « ?new=1 » repart de zéro
//   savedAt() → ms | null        horodatage de la dernière sauvegarde
//   wantsNewGame(search) → bool  « ?new=1 » dans l'adresse
//
// Chaque accès est protégé (navigation privée, stockage plein ou désactivé) : en cas d'échec, le jeu
// continue sans sauvegarde et les lectures renvoient null. L'enveloppe écrite :
//   { schema: 1, savedAt, version: game.version, seed, month, money, state: serialize(game) }
// `createStorage` accepte un stockage et des (dé)sérialiseurs injectés : tests sous Node sans navigateur.

import { serialize as serializeGame, deserialize as deserializeGame } from './core/game.js';

export const SAVE_KEY = 'tiletown.save';
export const SAVE_SCHEMA = 1;

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

  function saveGame(game) {
    if (!game || typeof game !== 'object') return false;
    let state;
    try {
      state = serialize(game);
    } catch (err) {
      console.warn('Sauvegarde impossible :', err);
      return false;
    }
    return write({
      schema: SAVE_SCHEMA,
      savedAt: now(),
      version: game.version ?? null,
      seed: game.seed ?? null,
      month: game.month ?? 0,
      money: game.money ?? null,
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

  /** Métadonnées sans charger la partie : { savedAt, seed, month, money } ou null. */
  function meta() {
    const data = read();
    if (!data || !data.state) return null;
    return { savedAt: data.savedAt ?? null, seed: data.seed ?? null, month: data.month ?? 0, money: data.money ?? null, version: data.version ?? null };
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

const defaultStorage = createStorage();
export const saveGame = defaultStorage.saveGame;
export const loadGame = defaultStorage.loadGame;
export const clearGame = defaultStorage.clearGame;
export const savedAt = defaultStorage.savedAt;
export const saveMeta = defaultStorage.meta;
