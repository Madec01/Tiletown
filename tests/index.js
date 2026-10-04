// Point d'entrée de `node --test tests/` : Node charge ce fichier comme module du dossier, et il importe
// chaque fichier *.test.js (comme dans Seve) ; un nouveau test n'a donc rien à déclarer ici.
// Un fichier qui échoue au chargement (import cassé, accès au DOM sous Node…) devient un test en échec
// qui porte son nom, sans empêcher les autres fichiers de s'exécuter.
import test from 'node:test';
import { readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
for (const file of readdirSync(dir).filter((f) => f.endsWith('.test.js')).sort()) {
  try {
    await import(pathToFileURL(`${dir}/${file}`).href);
  } catch (err) {
    test(`${file} : chargement du fichier de tests`, () => { throw err; });
  }
}
