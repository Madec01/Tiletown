import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBackStack } from '../src/ui/sheets.js';

test('retour téléphone : ouvrir une couche pendant une fermeture ne quitte jamais le jeu', () => {
  const listeners = new Map();
  let entries = 1, pending = 0, userBack = 0;
  const win = { addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  const history = { pushState: () => entries++, back: () => pending++ };
  const flush = () => { while (pending) { pending--; entries--; listeners.get('popstate')(); } };
  const back = createBackStack({ win, history, onBack: () => userBack++ });
  back.hold('sheet');
  back.release('sheet');
  back.hold('placement');
  assert.equal(entries, 2, 'attendre le retour en cours avant de réarmer');
  flush();
  assert.equal(entries, 2, 'une seule entrée pour la couche courante');
  back.release('placement');
  flush();
  assert.equal(entries, 1, 'la page de jeu reste dans l’historique');
  assert.equal(userBack, 0);
  back.hold('sheet');
  history.back();
  flush();
  assert.equal(userBack, 1, 'le vrai bouton Retour ferme la couche');
  assert.equal(back.held, 0);
  back.destroy();
});
