// Parties pures du rendu des acteurs : poses procédurales des pantins (`puppet-pose.js`, sans three.js),
// noms canoniques des pièces, hiérarchie.
import test from 'node:test';
import assert from 'node:assert/strict';
import { puppetPose, PUPPET_PARTS, ANIMS, canonicalPart, parentOf, partOrder, rootPart } from '../src/render3d/puppet-pose.js';

const STATES = ['idle', 'walk', 'run', 'fly', 'swim', 'hover', 'drive', 'dive'];
const DEG = Math.PI / 180;

test('puppetPose : toutes les animations × tous les états donnent des nombres finis, pour les pièces connues', () => {
  for (const anim of ANIMS) {
    for (const state of STATES) {
      for (const phase of [0, 0.25, 0.5, 0.75, 0.999, -0.3, 1.7]) {
        const pose = puppetPose(anim, state, phase, { turn: 0.7 });
        for (const [part, t] of Object.entries(pose)) {
          assert.ok(PUPPET_PARTS[anim].includes(part), `${anim}/${state} : pièce inattendue ${part}`);
          for (const k of ['rx', 'ry', 'rz', 'dx', 'dy', 'dz']) assert.ok(Number.isFinite(t[k]), `${anim}/${state}/${part}.${k}`);
          assert.ok(Math.abs(t.rx) <= Math.PI * 2.01 && Math.abs(t.dy) < 0.05);
        }
      }
    }
  }
});

test('puppetPose : bipède — jambes et bras en opposition (± 25°), tête fixe, rebond du corps, pas de balancement au repos', () => {
  const quarter = puppetPose('biped', 'walk', 0.25);
  assert.ok(Math.abs(quarter.LegL.rx - 25 * DEG) < 1e-9, 'jambe gauche à +25° au quart de cycle');
  assert.ok(Math.abs(quarter.LegR.rx + 25 * DEG) < 1e-9, 'jambe droite opposée');
  assert.ok(quarter.ArmL.rx * quarter.LegL.rx < 0, 'bras gauche opposé à la jambe gauche');
  assert.ok(quarter.ArmR.rx * quarter.ArmL.rx < 0, 'bras opposés entre eux');
  assert.equal(quarter.Head, undefined, 'tête fixe');
  const half = puppetPose('biped', 'walk', 0.75);
  assert.ok(Math.abs(half.LegL.rx + quarter.LegL.rx) < 1e-9, 'symétrie à un demi-cycle');
  assert.ok(puppetPose('biped', 'walk', 0.25).Body.dy > 0 && puppetPose('biped', 'walk', 0).Body.dy === 0, 'rebond ≥ 0, nul aux pas');
  const idle = puppetPose('biped', 'idle', 0.25);
  assert.equal(idle.LegL, undefined);
  assert.ok(Math.abs(idle.Body.dy) < 0.01);
  assert.ok(Math.abs(puppetPose('biped', 'run', 0.25).LegL.rx) > Math.abs(quarter.LegL.rx), 'la course amplifie');
});

test('puppetPose : quadrupède — pattes diagonales ensemble, tête qui hoche', () => {
  const p = puppetPose('quadruped', 'walk', 0.25);
  assert.ok(Math.abs(p.LegFL.rx - p.LegBR.rx) < 1e-9 && Math.abs(p.LegFR.rx - p.LegBL.rx) < 1e-9, 'diagonales synchrones');
  assert.ok(p.LegFL.rx * p.LegFR.rx < 0, 'diagonales opposées');
  const nods = [0, 0.125, 0.25, 0.375].map((ph) => puppetPose('quadruped', 'walk', ph).Head.rx);
  assert.ok(nods.some((v) => v > 0) && nods.some((v) => v <= 0), 'la tête hoche');
});

test('puppetPose : oiseaux — ailes ± 40° en vol ; voiliers ± 40° (± 55° en stationnaire) et roulis dans les virages', () => {
  const fly = puppetPose('bird', 'fly', 0.25);
  assert.ok(Math.abs(fly.WingL.rz - 40 * DEG) < 1e-9 && Math.abs(fly.WingR.rz + 40 * DEG) < 1e-9);
  assert.ok(Math.abs(puppetPose('bird', 'fly', 0.75).WingL.rz + 40 * DEG) < 1e-9, 'battement complet');
  const left = puppetPose('flyer', 'fly', 0.1, { turn: 1 });
  const right = puppetPose('flyer', 'fly', 0.1, { turn: -1 });
  assert.ok(left.Body.rz < 0 && right.Body.rz > 0, 'roulis opposé selon le virage');
  assert.ok(Math.abs(puppetPose('flyer', 'fly', 0.25).WingL.rz - 40 * DEG) < 1e-9);
  assert.ok(Math.abs(puppetPose('flyer', 'hover', 0.25).WingL.rz - 55 * DEG) < 1e-9, 'vol stationnaire plus ample');
  const wader = puppetPose('wader', 'idle', 0.5);
  assert.ok(wader.Neck && wader.Head, 'le héron étire le cou au repos');
  assert.ok(puppetPose('wader', 'fly', 0.25).LegL.rx > 1, 'pattes repliées en vol');
});

test('puppetPose : nageur et cycliste', () => {
  const swim = puppetPose('swimmer', 'swim', 0.3);
  assert.ok(swim.Body.ry !== 0 && swim.Tail.ry !== 0, 'ondulation du corps et de la queue');
  assert.ok(puppetPose('swimmer', 'dive', 0.3).Body.rx > 0, 'plongée : nez vers le bas');
  const wheel0 = puppetPose('wheeled', 'drive', 0).WheelF.rx;
  const wheel1 = puppetPose('wheeled', 'drive', 0.5).WheelF.rx;
  assert.ok(Math.abs((wheel1 - wheel0) - Math.PI) < 1e-9, 'une roue fait un demi-tour en un demi-cycle');
  const pedal = puppetPose('wheeled', 'drive', 0.25);
  assert.ok(pedal.LegL.rx * pedal.LegR.rx < 0, 'pédalage en opposition');
});

test('canonicalPart : noms de nœuds variés → pièces canoniques', () => {
  const cases = {
    Body: 'Body', body: 'Body', Hips: 'Body', Spine1: 'Body', torso: 'Body',
    Head: 'Head', head_01: 'Head', Neck: 'Neck',
    LeftUpLeg: 'LegL', 'leg.R': 'LegR', 'Leg_L': 'LegL', RightArm: 'ArmR', 'arm.L': 'ArmL',
    wing_r: 'WingR', WingL: 'WingL', 'Leg.BR': 'LegBR', FrontLeftLeg: 'LegFL', 'leg-fl': 'LegFL', hindLegRight: 'LegBR',
    Tail: 'Tail', 'wheel-front': 'WheelF', wheelBack: 'WheelB', Frame: 'Frame',
  };
  for (const [name, expected] of Object.entries(cases)) assert.equal(canonicalPart(name), expected, name);
  assert.equal(canonicalPart('Cube.003'), null);
  assert.equal(canonicalPart(''), null);
});

test('parentOf / partOrder : la tête suit le cou, le cycliste suit le cadre, parents avant enfants', () => {
  assert.equal(parentOf('Head', 'quadruped', ['Body', 'Neck', 'Head']), 'Neck');
  assert.equal(parentOf('Head', 'biped', ['Body', 'Head']), 'Body');
  assert.equal(parentOf('Body', 'biped', ['Body', 'Head']), null);
  assert.equal(parentOf('WheelF', 'wheeled', PUPPET_PARTS.wheeled), 'Frame');
  assert.equal(parentOf('Body', 'wheeled', PUPPET_PARTS.wheeled), 'Frame');
  assert.equal(parentOf('LegL', 'wheeled', PUPPET_PARTS.wheeled), 'Body');
  assert.equal(rootPart('wheeled'), 'Frame');
  for (const anim of ANIMS) {
    const order = partOrder(anim, PUPPET_PARTS[anim]);
    assert.equal(order.length, PUPPET_PARTS[anim].length);
    assert.equal(order[0], rootPart(anim));
    order.forEach((p, i) => {
      const parent = parentOf(p, anim, PUPPET_PARTS[anim]);
      if (parent) assert.ok(order.indexOf(parent) < i, `${anim} : ${parent} avant ${p}`);
    });
  }
});
