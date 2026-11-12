import { RULES } from './rules.js';
const PH = RULES.physics;
// Shared physics: frame-rate independent damping, mass-based impulses, body separation.
// All tuning numbers were authored at 60 fps; these helpers keep the same feel at 30, 90 or 120 fps.

// per-frame smoothing factor k (authored at 60 fps) -> correct factor for this dt
export const ap = (k, dt) => 1 - Math.pow(1 - k, dt * 60);
// per-frame friction multiplier f (authored at 60 fps) -> correct multiplier for this dt
export const dp = (f, dt) => Math.pow(f, dt * 60);

// mass: a soldier is lighter than Abhimanyu; maharathis scale with body size; heavy fighters (Brihadbala) more
export function massOf(e) {
  if (e._mass) return e._mass;
  if (e.isBoss) return (e._mass = Math.pow((e.r || 22) / 18, 2) * (e.heavy ? PH.mass.bossHeavy : PH.mass.bossBase));
  if (e.kind === 'abhimanyu' || e.kind === 'satyaki') return (e._mass = PH.mass.hero);
  return (e._mass = PH.mass.soldier);
}
// pinned bodies (fallen, bound, bowing, wheel-holding scripted beats) are not moved by pushes
const pinned = e => e.state === 'fallen' || e.state === 'bound' || e.state === 'pranam' || e.scriptPinned;

// knockback is kept as a separate impulse velocity so movement code cannot erase it in one frame
export function impulse(e, ax, ay, power) {
  if (!e || pinned(e) || !power) return;
  const m = massOf(e), d = Math.hypot(ax, ay) || 1;
  e.kx = (e.kx || 0) + ax / d * power / m; e.ky = (e.ky || 0) + ay / d * power / m;
  const sp = Math.hypot(e.kx, e.ky), cap = PH.impulseCap; if (sp > cap) { e.kx *= cap / sp; e.ky *= cap / sp; }
}
// integrate impulse: ground friction bleeds it off in ~0.4 s
export function integrateImpulse(e, dt) {
  if (!e.kx && !e.ky) return;
  e.x += e.kx * dt; e.y += e.ky * dt;
  const f = Math.exp(-PH.impulseFriction * dt); e.kx *= f; e.ky *= f;
  if (Math.abs(e.kx) < 4) e.kx = 0; if (Math.abs(e.ky) < 4) e.ky = 0;
}

// bodies cannot stand inside each other; the lighter one gives way more. Airborne heroes pass over.
export function separate(bodies) {
  const n = bodies.length;
  for (let i = 0; i < n; i++) {
    const a = bodies[i]; if ((a.z || 0) > 6) continue;
    for (let j = i + 1; j < n; j++) {
      const b = bodies[j]; if ((b.z || 0) > 6) continue;
      const dx = b.x - a.x, dy = b.y - a.y, min = (a.r || 16) + (b.r || 16) - 4;
      if (Math.abs(dx) > min || Math.abs(dy) > min) continue;
      const d = Math.hypot(dx, dy); if (d >= min) continue;
      const nx = d > 0.01 ? dx / d : 1, ny = d > 0.01 ? dy / d : 0, over = min - d;
      const pa = pinned(a), pb = pinned(b); if (pa && pb) continue;
      const ma = massOf(a), mb = massOf(b);
      let wa = pa ? 0 : pb ? 1 : mb / (ma + mb), wb = pb ? 0 : pa ? 1 : ma / (ma + mb);
      a.x -= nx * over * wa; a.y -= ny * over * wa; b.x += nx * over * wb; b.y += ny * over * wb;
    }
  }
}
