// Poses procédurales des pantins (docs/ARCHITECTURE.md §8.2-8.3). Module PUR (aucun three.js) :
// `puppetPose(anim, state, phase, extra)` rend, pour chaque pièce qui bouge, une rotation d'Euler XYZ
// (radians) et un petit déplacement (unités) appliqués AU PIVOT de la pièce. Le rendu compose ensuite
// M(pièce) = M(parent) · pivot · T(dx, dy, dz) · R(rx, ry, rz).
//
// Repère d'une pièce : le modèle regarde +Z ; X à sa gauche… non : X = sa droite vue de face (+X est),
// Y vers le haut. Une rotation rx balance une patte d'avant en arrière, rz bat une aile (étendue le long
// de X), ry tourne une tête ou agite une queue.
//
// Pièces canoniques (clés du manifeste `parts` ou noms de nœuds, insensibles à la casse) :
//   Body, Neck, Head, ArmL, ArmR, LegL, LegR, LegFL, LegFR, LegBL, LegBR, WingL, WingR, Tail,
//   Frame, WheelF, WheelB. La racine est Body (Frame pour `wheeled`).

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

/** Animations procédurales connues. */
export const ANIMS = Object.freeze(['biped', 'quadruped', 'bird', 'flyer', 'wader', 'swimmer', 'wheeled', 'vehicle']);

/** Pièces attendues par animation (le pantin de repli les fournit toutes ; un GLB peut en omettre). */
export const PUPPET_PARTS = Object.freeze({
  biped: ['Body', 'Head', 'ArmL', 'ArmR', 'LegL', 'LegR'],
  quadruped: ['Body', 'Neck', 'Head', 'LegFL', 'LegFR', 'LegBL', 'LegBR', 'Tail'],
  bird: ['Body', 'Head', 'WingL', 'WingR', 'LegL', 'LegR', 'Tail'],
  flyer: ['Body', 'Head', 'WingL', 'WingR', 'Tail'],
  wader: ['Body', 'Neck', 'Head', 'LegL', 'LegR', 'WingL', 'WingR'],
  swimmer: ['Body', 'Head', 'Tail'],
  wheeled: ['Frame', 'WheelF', 'WheelB', 'Body', 'Head', 'LegL', 'LegR'],
  vehicle: ['Body'],
});

export const ALL_PARTS = Object.freeze(Array.from(new Set(Object.values(PUPPET_PARTS).flat())));

/** Pièce racine d'une animation. */
export function rootPart(anim) {
  return anim === 'wheeled' ? 'Frame' : 'Body';
}

/**
 * Parent d'une pièce dans la hiérarchie canonique, parmi les pièces disponibles (`available`, liste de
 * noms canoniques). La tête suit le cou s'il existe ; sur un vélo, le cycliste (Body) suit le cadre.
 */
export function parentOf(part, anim, available) {
  const has = (p) => available.includes(p);
  const root = rootPart(anim);
  if (part === root) return null;
  if (part === 'Head') return has('Neck') ? 'Neck' : (has('Body') ? 'Body' : root);
  if (anim === 'wheeled') {
    if (part === 'WheelF' || part === 'WheelB' || part === 'Body') return 'Frame';
    return has('Body') ? 'Body' : 'Frame';
  }
  return has('Body') ? 'Body' : root;
}

/** Ordre de composition : les parents avant leurs enfants. */
export function partOrder(anim, available) {
  const root = rootPart(anim);
  const out = [];
  const pending = available.filter((p) => p !== root);
  if (available.includes(root)) out.push(root);
  let guard = 0;
  while (pending.length && guard++ < 50) {
    for (let i = pending.length - 1; i >= 0; i--) {
      const parent = parentOf(pending[i], anim, available);
      if (parent === null || out.includes(parent) || !available.includes(parent)) { out.push(pending[i]); pending.splice(i, 1); }
    }
  }
  return out.concat(pending);
}

/**
 * Nom canonique d'une pièce d'après un nom de nœud ou une clé de manifeste (« leg.L », « LeftUpLeg »,
 * « wing_r », « hips », « head »…), ou null si rien ne correspond.
 */
export function canonicalPart(name) {
  if (!name) return null;
  const raw = String(name);
  const exact = ALL_PARTS.find((p) => p.toLowerCase() === raw.toLowerCase());
  if (exact) return exact;
  const s = raw.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const words = s.split(' ');
  const has = (re) => re.test(s);
  // Suffixes combinés « fl », « br »… (« Leg.BR » → patte arrière droite).
  const combo = words.find((w) => /^(f|b)(l|r)$/.test(w));
  const sideOf = () => {
    if (combo) return combo[1].toUpperCase();
    if (has(/\b(left|l)\b/) || /(^|[^a-z])l$/.test(s) || /left/.test(s)) return 'L';
    if (has(/\b(right|r)\b/) || /(^|[^a-z])r$/.test(s) || /right/.test(s)) return 'R';
    return null;
  };
  const endOf = () => {
    if (combo) return combo[0].toUpperCase();
    if (has(/front|fore|\bf\b|avant/)) return 'F';
    if (has(/back|hind|rear|\bb\b|arriere/)) return 'B';
    return null;
  };
  if (has(/wheel|roue/)) { const e = endOf(); return e ? `Wheel${e}` : 'WheelF'; }
  if (has(/frame|cadre|bike|velo/)) return 'Frame';
  if (has(/head|tete|skull|face|beak|bec/)) return 'Head';
  if (has(/neck|cou\b/)) return 'Neck';
  if (has(/tail|queue/)) return 'Tail';
  if (has(/wing|aile/)) { const side = sideOf(); return side ? `Wing${side}` : null; }
  if (has(/arm|bras|hand|main|shoulder|epaule/)) { const side = sideOf(); return side ? `Arm${side}` : null; }
  if (has(/leg|jambe|patte|paw|foot|pied|thigh|cuisse|shin|knee/)) {
    const side = sideOf();
    const end = endOf();
    if (!side) return null;
    return end ? `Leg${end}${side}` : `Leg${side}`;
  }
  if (has(/body|corps|torso|hips|pelvis|spine|chest|root|trunk/) || words.length === 0) return 'Body';
  return null;
}

// ---------------------------------------------------------------------------------------------
// Poses.

function pose(out, part, rx = 0, ry = 0, rz = 0, dx = 0, dy = 0, dz = 0) {
  out[part] = { rx, ry, rz, dx, dy, dz };
}

/** Rebond du corps deux fois par cycle (toujours ≥ 0). */
function bounce(theta, amount) {
  return amount * (0.5 - 0.5 * Math.cos(2 * theta));
}

const MOVING = new Set(['walk', 'run', 'swim', 'drive']);

/**
 * Pose d'un pantin.
 * @param {string} anim  biped | quadruped | bird | flyer | wader | swimmer | wheeled | vehicle
 * @param {string} state idle | walk | run | fly | swim | hover | drive | dive
 * @param {number} phase 0..1
 * @param {{ turn?: number, time?: number }} [extra] turn : vitesse de virage normalisée (−1..1) pour le roulis
 * @returns {Object<string, { rx, ry, rz, dx, dy, dz }>} transformations par pièce (pièces absentes = identité)
 */
export function puppetPose(anim, state, phase, extra = {}) {
  const p = ((Number(phase) || 0) % 1 + 1) % 1;
  const theta = p * TAU;
  const s = Math.sin(theta);
  const c = Math.cos(theta);
  const turn = Math.max(-1, Math.min(1, Number(extra.turn) || 0));
  const out = {};
  switch (anim) {
    case 'biped': {
      if (state === 'walk' || state === 'run') {
        const a = (state === 'run' ? 35 : 25) * DEG;
        pose(out, 'LegL', a * s);
        pose(out, 'LegR', -a * s);
        pose(out, 'ArmL', -0.8 * a * s);
        pose(out, 'ArmR', 0.8 * a * s);
        pose(out, 'Body', state === 'run' ? 6 * DEG : 0, 0, 0, 0, bounce(theta, state === 'run' ? 0.016 : 0.01));
      } else {
        // Respiration légère, bras au repos.
        pose(out, 'Body', 0, 0, 0, 0, 0.003 * s);
        pose(out, 'ArmL', 0, 0, 3 * DEG * s);
        pose(out, 'ArmR', 0, 0, -3 * DEG * s);
      }
      break;
    }
    case 'quadruped': {
      if (state === 'walk' || state === 'run') {
        const a = (state === 'run' ? 32 : 20) * DEG;
        pose(out, 'LegFL', a * s);
        pose(out, 'LegBR', a * s);
        pose(out, 'LegFR', -a * s);
        pose(out, 'LegBL', -a * s);
        pose(out, 'Head', 6 * DEG * Math.sin(2 * theta));
        pose(out, 'Neck', 3 * DEG * Math.sin(2 * theta));
        pose(out, 'Tail', 0, 12 * DEG * s);
        pose(out, 'Body', state === 'run' ? 5 * DEG * c : 0, 0, 0, 0, bounce(theta, state === 'run' ? 0.02 : 0.006));
      } else {
        pose(out, 'Head', 4 * DEG * s, 10 * DEG * Math.sin(theta * 0.5));
        pose(out, 'Tail', 0, 15 * DEG * s);
        pose(out, 'Body', 0, 0, 0, 0, 0.002 * s);
      }
      break;
    }
    case 'bird': {
      if (state === 'fly') {
        const a = 40 * DEG * s;
        pose(out, 'WingL', 0, 0, a);
        pose(out, 'WingR', 0, 0, -a);
        pose(out, 'LegL', 60 * DEG);
        pose(out, 'LegR', 60 * DEG);
        pose(out, 'Body', -8 * DEG, 0, -25 * DEG * turn, 0, 0.01 * s);
      } else if (state === 'walk' || state === 'run') {
        const a = 25 * DEG;
        pose(out, 'LegL', a * s);
        pose(out, 'LegR', -a * s);
        pose(out, 'Body', 0, 0, 5 * DEG * s, 0, bounce(theta, 0.004));
        pose(out, 'Head', 8 * DEG * Math.sin(2 * theta));
        pose(out, 'Tail', 0, 8 * DEG * s);
      } else if (state === 'swim') {
        // Canard : léger tangage et roulis, pattes cachées sous l'eau.
        pose(out, 'Body', 3 * DEG * s, 0, 2 * DEG * c, 0, 0.003 * s);
        pose(out, 'Head', 4 * DEG * Math.sin(theta * 0.5), 15 * DEG * Math.sin(theta * 0.25));
        pose(out, 'Tail', 0, 6 * DEG * s);
      } else {
        // Chouette perchée : la tête tourne lentement, le corps respire.
        pose(out, 'Head', 0, 35 * DEG * Math.sin(theta * 0.5), 0);
        pose(out, 'Body', 0, 0, 0, 0, 0.002 * s);
        pose(out, 'WingL', 0, 0, 2 * DEG * s);
        pose(out, 'WingR', 0, 0, -2 * DEG * s);
      }
      break;
    }
    case 'flyer': {
      // Vol : ± 40° ; vol stationnaire (abeille) : ± 55°.
      const a = (state === 'hover' ? 55 : 40) * DEG * s;
      pose(out, 'WingL', 0, 0, a);
      pose(out, 'WingR', 0, 0, -a);
      pose(out, 'Body', state === 'hover' ? 10 * DEG : -5 * DEG, 0, -35 * DEG * turn, 0, 0.004 * s);
      pose(out, 'Tail', 0, 8 * DEG * turn, 0);
      break;
    }
    case 'wader': {
      if (state === 'fly') {
        const a = 40 * DEG * s;
        pose(out, 'WingL', 0, 0, a);
        pose(out, 'WingR', 0, 0, -a);
        pose(out, 'LegL', 70 * DEG);
        pose(out, 'LegR', 70 * DEG);
        pose(out, 'Neck', 20 * DEG);
        pose(out, 'Head', -20 * DEG);
        pose(out, 'Body', -10 * DEG, 0, -20 * DEG * turn, 0, 0.01 * s);
      } else if (state === 'walk') {
        const a = 30 * DEG;
        pose(out, 'LegL', a * s);
        pose(out, 'LegR', -a * s);
        pose(out, 'Neck', 10 * DEG + 6 * DEG * Math.sin(2 * theta));
        pose(out, 'Head', -6 * DEG * Math.sin(2 * theta));
        pose(out, 'Body', 0, 0, 0, 0, bounce(theta, 0.004));
      } else {
        // Idle long : le cou s'étire et se replie, la tête compense pour rester horizontale.
        const stretch = 12 * DEG * Math.sin(theta * 0.5);
        pose(out, 'Neck', stretch);
        pose(out, 'Head', -stretch + 5 * DEG * Math.sin(theta * 0.25), 10 * DEG * Math.sin(theta * 0.3));
        pose(out, 'Body', 0, 0, 0, 0, 0.002 * s);
      }
      break;
    }
    case 'swimmer': {
      if (state === 'dive') {
        pose(out, 'Body', 30 * DEG, 6 * DEG * s);
        pose(out, 'Tail', 0, 25 * DEG * s);
        pose(out, 'Head', 10 * DEG);
      } else if (state === 'swim') {
        pose(out, 'Body', 2 * DEG * c, 6 * DEG * s, 0, 0, 0.003 * c);
        pose(out, 'Tail', 0, 30 * DEG * Math.sin(theta - 1.2));
        pose(out, 'Head', 0, -5 * DEG * s);
      } else {
        pose(out, 'Tail', 0, 10 * DEG * s);
        pose(out, 'Head', 4 * DEG * Math.sin(theta * 0.5), 12 * DEG * Math.sin(theta * 0.3));
      }
      break;
    }
    case 'wheeled': {
      // Roues : un tour par cycle ; pédalage des jambes en opposition.
      pose(out, 'WheelF', theta);
      pose(out, 'WheelB', theta);
      if (MOVING.has(state)) {
        pose(out, 'LegL', 35 * DEG * s, 0, 0, 0, 0.012 * c);
        pose(out, 'LegR', -35 * DEG * s, 0, 0, 0, -0.012 * c);
        pose(out, 'Body', 8 * DEG, 0, 0, 0, 0.002 * Math.sin(2 * theta));
        pose(out, 'Frame', 0, 0, -8 * DEG * turn);
      } else {
        pose(out, 'Body', 4 * DEG);
      }
      break;
    }
    case 'vehicle':
    default: {
      // Rigide : léger tangage au freinage simulé par `extra.turn` (roulis dans les virages).
      pose(out, 'Body', 0, 0, -3 * DEG * turn);
    }
  }
  return out;
}
