// Demo mode for the clip recorder (chakravyooha-gtm/engine/clips.mjs).
//   ?demo=<scene>  skip menus, start the scene with a bot playing Abhimanyu
//   ?nohud=1       hide touch controls and hints
// Sets window.__demoDone = true when the scene's beat is over so the recorder can stop.
export const SCENES = {
  ring7_rescue: { ring: 6, max: 70, god: false },          // the siege and the fall (the moment before Satyaki)
  mitra_smaran: { ring: 6, max: 70, god: false },
  ring4_kavach: { ring: 3, max: 40, god: true, weapon: 'gada', bossHp: 0.35 },
  astra_vayu: { ring: 1, max: 35, god: true, bossHp: 0.3 },  // Shalya, Vayu astra at <=50%
  gate_jayadratha: { ring: 0, max: 30, god: true, bossHp: 0.35 },
  daily: { ring: 0, max: 30, god: true, bossHp: 0.35 },
};

export function demoScene() {
  const q = new URLSearchParams(location.search); const id = q.get('demo');
  if (!id || !SCENES[id]) return null;
  return { id, ...SCENES[id], nohud: q.get('nohud') === '1', t: 0, atkT: 0 };
}

const TAU = Math.PI * 2;
// A simple, watchable bot: close in, swing, roll sometimes, fire the astra the moment it is allowed.
export function botIntent(world, hero, demo, dt) {
  demo.t += dt; demo.atkT -= dt;
  const it = { mx: 0, my: 0 };
  if (!hero || !hero.alive) return it;
  if (world.phase === 'won' && world.arena.gate) {
    const g = world.arena.gate, dx = g.x - hero.x, dy = g.y - hero.y, d = Math.hypot(dx, dy) || 1; it.mx = dx / d; it.my = dy / d; return it;
  }
  const foes = world.enemies.filter(e => e.alive);
  const boss = world.boss && world.boss.alive ? world.boss : null;
  let tgt = null, best = Infinity;
  for (const e of foes) { const d = Math.hypot(e.x - hero.x, e.y - hero.y); if (d < best) { best = d; tgt = e; } }
  if (boss && (!tgt || best > 160)) { tgt = boss; best = Math.hypot(boss.x - hero.x, boss.y - hero.y); }
  if (!tgt) { it.mx = Math.cos(demo.t * 0.7) * 0.4; it.my = Math.sin(demo.t * 0.9) * 0.4; return it; }
  const ang = Math.atan2(tgt.y - hero.y, tgt.x - hero.x); it.aimAngle = ang;
  const want = demo.weapon && tgt === boss ? demo.weapon : (tgt.type === 'shield' && !tgt.shieldBroken ? 'gada' : 'sword');
  if (hero.weapon !== want) it.weaponSel = want;
  const reach = (tgt.r || 20) + 55;
  if (best > reach) { it.mx = Math.cos(ang); it.my = Math.sin(ang); }
  else { const side = ang + Math.PI / 2 * (Math.sin(demo.t * 0.8) > 0 ? 1 : -1); it.mx = Math.cos(side) * 0.25; it.my = Math.sin(side) * 0.25; }
  if (best < reach + 20 && demo.atkT <= 0) { it.attack = true; it.attackHeld = true; demo.atkT = 0.22; }
  if (boss && best < 140 && Math.random() < dt * 0.6) { it.dodge = true; it.mx = -Math.cos(ang); it.my = -Math.sin(ang); }
  if (world.canBigAstra && world.canBigAstra(hero)) { it.astra = true; it.act = true; }
  if (Math.abs(it.mx) + Math.abs(it.my) > 0 && !it.aimAngle) it.aimAngle = Math.atan2(it.my, it.mx) % TAU;
  return it;
}
