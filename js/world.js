// Combat world for one ring: arena, waves, boss, hits, projectiles, pickups, particles, astra, decay.
import { RINGS, ASTRAS, WORLD } from './config.js';
import { Hero, Soldier, Projectile, Pickup, Particle, TAU, rnd, clamp } from './entities.js';
import { Boss } from './bosses.js';

export class World {
  constructor(ringIdx, heroes, audio, events) {
    this.ring = RINGS[ringIdx]; this.ringIdx = ringIdx; this.heroes = heroes; this.audio = audio; this.ev = events;
    this.arena = makeArena(ringIdx);
    this.enemies = []; this.boss = null; this.projectiles = []; this.hits = []; this.pickups = []; this.particles = []; this.floats = []; this.slashes = []; this.hazards = []; this.trails = [];
    this.phase = 'intro'; this.phaseT = 1.2; this.wave = 0; this.time = 0; this.shakeV = 0; this.slowmo = 1; this.slowT = 0;
    this.vipatti = false; this.astraFx = null; this.scripted = false; this.decayOn = true; this.nabhi = null;
    for (const h of heroes) { const sp = this.arena.spawn(); h.x = sp.x; h.y = sp.y; h.astra = this.ring.useAstra; h.astraUsed = false; }
    this.flash = 0; this.bossIntroT = 0;
  }
  // ---- spatial helpers
  inArena(x, y, pad = 0) { return this.arena.inside(x, y, pad); }
  clampToArena(e) { this.arena.clamp(e); }
  nearestHero(x, y) { let best = null, bd = 1e9; for (const h of this.heroes) if (h.alive && h.state !== 'bound' && h.state !== 'fallen') { const d = Math.hypot(h.x - x, h.y - y); if (d < bd) { bd = d; best = h; } } return best; }
  nearestEnemy(x, y, max = 1e9) { let best = null, bd = max; const all = this.boss && this.boss.alive ? [this.boss, ...this.enemies] : this.enemies; for (const e of all) if (e.alive) { const d = Math.hypot(e.x - x, e.y - y); if (d < bd) { bd = d; best = e; } } return best; }
  // ---- fx
  shake(v) { this.shakeV = Math.max(this.shakeV, v); }
  burst(x, y, color, n, spd, add = false) { for (let i = 0; i < n; i++) { const a = rnd(0, TAU), s = rnd(spd * 0.3, spd); this.particles.push(new Particle(x, y, Math.cos(a) * s, Math.sin(a) * s, color, rnd(0.3, 0.8), rnd(2, 5), 200, add)); } }
  blood(x, y, fromX, fromY, amt = 1) { const a = Math.atan2(y - fromY, x - fromX); const n = Math.round(6 * amt); for (let i = 0; i < n; i++) { const sp = rnd(80, 260) * amt, ang = a + rnd(-0.7, 0.7); this.particles.push(new Particle(x, y - 14, Math.cos(ang) * sp, Math.sin(ang) * sp - rnd(40, 160), i % 3 ? '#9a0f0f' : '#c41e1e', rnd(0.35, 0.8), rnd(1.5, 3.5), 520)); }
    if (!this.decals) this.decals = []; this.decals.push({ x: x + Math.cos(a) * 14, y: y + 10 + Math.sin(a) * 8, r: rnd(5, 9) * amt, a: rnd(0, Math.PI), life: 40, spots: [...Array(3)].map(() => [rnd(-12, 12) * amt, rnd(-6, 6), rnd(1, 2.5)]) }); if (this.decals.length > 140) this.decals.shift(); }
  floatText(x, y, text, color) { this.floats.push({ x, y, text, color, life: 1.1 }); }
  slash(h, i) { this.slashes.push({ x: h.x, y: h.y, a: h.aim, i, life: 0.16, r: h.cfg.sword.range, color: h.kind === 'satyaki' ? '#B4FFD0' : '#FFF4D6' }); }
  trail(e) { this.trails.push({ x: e.x, y: e.y, r: e.r, life: 0.3, color: e.team === 'pandava' ? '#F4C95D' : '#FF7A2A' }); }
  addHit(h) { h.life = h.life || 0.1; h.hitSet = new Set(); this.hits.push(h); }
  addProjectile(p) { this.projectiles.push(new Projectile(p)); }
  // ---- hype
  hype(key, strong = false) { this.ev.hype && this.ev.hype(key, strong); }
  // ---- events
  onEnemyDead(e) { for (const h of this.heroes) if (h.alive && h.kind === 'abhimanyu') h.shakti = Math.min(h.shaktiMax, (h.shakti || 0) + (e.clone ? 4 : 14)); this.burst(e.x, e.y, e.color, 14, 200); if (!e.clone && e.type === 'archer' && Math.random() < 0.7) this.pickups.push(new Pickup(e.x + 14, e.y, 'quiver')); else if (!e.clone && Math.random() < 0.35) this.pickups.push(new Pickup(e.x, e.y)); if (e.clone) { this.burst(e.x, e.y, '#8F6CFF', 16, 180, true); this.floatText(e.x, e.y - 30, 'माया', '#8F6CFF'); } if (e.name) this.floatText(e.x, e.y - 40, e.name + ' पराजित', '#F4C95D'); }
  hurtFlash = 0;
  onHeroDown(h) { this.audio.sfx('die'); this.shake(14); this.ev.heroDown && this.ev.heroDown(h); }
  onBossPhase2(b) { this.audio.sfx('unlock'); this.flash = 0.6; this.hype('phase2', true); this.ev.phase2 && this.ev.phase2(b); for (let i = 0; i < 2; i++) this.pickups.push(new Pickup(b.x + rnd(-60, 60), b.y + rnd(-60, 60))); this.pickups.push(new Pickup(b.x + rnd(-80, 80), b.y + 60, 'quiver')); }
  onBossDefeated(b) { this.burst(b.x, b.y, b.def.accent, 40, 320, true); this.shake(16); this.slowT = 1.6; this.phase = 'won'; this.phaseT = 16; this.audio.sfx('shatter'); this.hype('bossDown', true); this.arena.gateOpen = true; if (!this.scripted) for (const e of this.enemies) if (e.alive && !e.isBoss && !e.def) { e.hp = 0; e.alive = false; this.onEnemyDead(e); } this.ev.bossDefeated && this.ev.bossDefeated(b); }
  // ---- spawning
  spawnWave(n) { const types = this.ringIdx >= 2 ? ['melee', 'melee', 'archer', 'shield'] : this.ringIdx >= 1 ? ['melee', 'melee', 'shield'] : ['melee']; const scale = 1 + this.ringIdx * 0.12; for (let i = 0; i < n; i++) { const sp = this.arena.enemySpawn(i, n); const s = new Soldier(sp.x, sp.y, types[Math.floor(Math.random() * types.length)], scale); this.enemies.push(s); this.burst(s.x, s.y, '#D9A441', 6, 100); } }
  spawnBoss() { const g = this.arena.bossSpawn(); this.boss = new Boss(this.ring.boss, g.x, g.y, this); this.bossIntroT = 2.4; this.audio.sfx('rumble'); this.ev.bossIntro && this.ev.bossIntro(this.boss); }
  // ---- astra
  canBigAstra(h) { return !!h.astra && !h.astraUsed && this.boss && this.boss.alive && this.boss.phase === 2; }
  canAstra(h) { return !this.astraFx && h.kind === 'abhimanyu' && !this.scripted && (this.canBigAstra(h) || (h.shakti >= h.shaktiMax && (this.enemies.some(e => e.alive) || (this.boss && this.boss.alive)))); }
  useAstra(h) {
    if (!this.canAstra(h)) return false;
    if (!this.canBigAstra(h)) { // Divya-shakti: a lesser release of the astra, charged by battle; clears soldiers, nicks a maharathi
      const key = h.astra || 'vayu', A = ASTRAS[key]; h.shakti = 0; this.audio.sfx(key); this.slowT = 1.2; this.flash = 0.6; this.shake(12);
      const b = this.boss && this.boss.alive ? this.boss : null; this.astraFx = { key, t: 0, dur: 2.0, x: h.x, y: h.y, tx: b ? b.x : h.x, ty: b ? b.y : h.y - 120, color: A.color, glow: A.glow };
      for (const e of this.enemies) if (e.alive && !e.def) { e.hp = 0; e.alive = false; this.onEnemyDead(e); }
      if (b) setTimeout(() => { if (!b.alive) return; const dmg = Math.floor(b.maxHp * 0.06); b.hp = Math.max(1, b.hp - dmg); b.hurtT = 0.4; b.applyStatus({ stun: 1.2 }); this.floatText(b.x, b.y - 70, '-' + dmg, A.color); if (b.phase === 1 && b.hpPct <= 0.5) { b.phase = 2; this.onBossPhase2(b); } }, 700);
      this.hazards = []; this.hype('astra'); return true; }
    const key = h.astra, A = ASTRAS[key]; h.astraUsed = true; this.audio.sfx(key); this.slowT = 2.6; this.slowmo = 0.25; this.flash = 1; this.shake(18);
    this.astraFx = { key, t: 0, dur: 2.8, x: h.x, y: h.y, tx: this.boss.x, ty: this.boss.y, color: A.color, glow: A.glow };
    const b = this.boss; const dmg = Math.floor(b.maxHp * A.dmgPct);
    setTimeout(() => { if (!b.alive) return; b.hp = Math.max(1, b.hp - dmg); b.hurtT = 0.5; this.floatText(b.x, b.y - 70, '-' + dmg, A.color); b.applyStatus({ stun: A.stun, bind: A.bind, slow: A.slow, burn: A.burn }); if (b.hp <= 1) { b.hp = 1; } }, 900);
    for (const e of this.enemies) if (e.alive) { e.hp = 0; e.alive = false; this.onEnemyDead(e); }
    this.hazards = [];
    this.hype('astra', true); this.ev.astra && this.ev.astra(key); return true;
  }
  // ---- main update
  update(dt, intents) {
    if (this.slowT > 0) { this.slowT -= dt; this.slowmo = this.slowT > 0.4 ? 0.3 : 0.7; } else this.slowmo = 1;
    const sdt = dt * this.slowmo; this.time += sdt; this.flash = Math.max(0, this.flash - dt); this.shakeV *= 0.88;
    if (this.astraFx) { this.astraFx.t += dt; if (this.astraFx.t > this.astraFx.dur) this.astraFx = null; }
    // phase machine
    if (!this.scripted) {
      this.phaseT -= sdt;
      if (this.phase === 'intro' && this.phaseT <= 0) { this.phase = 'wave'; this.wave = 1; this._waveHp = this.heroes[0].hp; this.spawnWave(this.ring.waves[0]); this.ev.wave && this.ev.wave(1); }
      else if (this.phase === 'wave' && this.enemies.every(e => !e.alive)) { if (this.heroes[0] && this.heroes[0].hp >= (this._waveHp || 0) - 1) this.hype('cleanWave'); this._waveHp = this.heroes[0] ? this.heroes[0].hp : 0; if (this.wave === 1) { this.wave = 2; this.spawnWave(this.ring.waves[1]); this.ev.wave && this.ev.wave(2); } else { this.phase = 'boss'; this.spawnBoss(); } }
      else if (this.phase === 'boss' && this.boss && this.boss.alive && this.enemies.filter(e => e.alive && !e.clone).length < 2 && Math.random() < sdt * 0.08 && this.ring.boss !== 'karna') { this.spawnWave(1); }
    }
    this.bossIntroT = Math.max(0, this.bossIntroT - dt);
    // heroes
    for (const h of this.heroes) { h.streakT = (h.streakT || 0) - dt; if (h.streakT <= 0) h.streak = 0; }
    this.heroes.forEach((h, i) => { const it = intents[i] || { mx: 0, my: 0 }; if (this.bossIntroT > 0) { it.sword = it.gada = it.dodge = it.astra = false; it.bowHeld = false; } h.update(sdt, it, this); if (it.astra && h === this.heroes[0]) this.useAstra(h); });
    // passive decay (only Abhimanyu, only when fighting)
    if (this.decayOn && this.phase !== 'won' && this.phase !== 'intro' && this.heroes[0] && this.heroes[0].alive && this.heroes[0].kind === 'abhimanyu') { const h = this.heroes[0]; h.hp -= this.ring.decay * 0.5 * sdt; if (h.hp <= 0) { h.hp = 0; h.alive = false; h.state = 'dead'; this.onHeroDown(h); } }
    const vip = this.heroes[0] && this.heroes[0].alive && this.heroes[0].hp < this.heroes[0].maxHp * 0.2;
    if (vip !== this.vipatti) { this.vipatti = vip; this.audio.setVipatti(vip); if (vip) { this.audio.sfx('vipatti'); this.ev.vipatti && this.ev.vipatti(); } }
    // enemies & boss
    this.attackTokens = Math.min(3, 2 + Math.floor(this.ringIdx / 3)); this.attacking = this.enemies.filter(e => e.alive && (e.state === 'tele' || e.state === 'strike')).length;
    if (this.bossIntroT <= 0) { for (const e of this.enemies) e.update(sdt, this); if (this.boss && this.boss.alive) this.boss.update(sdt, this); }
    this.enemies = this.enemies.filter(e => e.alive);
    // projectiles
    for (const p of this.projectiles) { p.update(sdt, this); if (!p.alive) continue;
      if (p.team === 'kaurava') { for (const h of this.heroes) if (h.alive && !p.hitSet.has(h.id) && Math.hypot(h.x - p.x, h.y - p.y) < h.r + p.r) { p.hitSet.add(h.id); const hurt = h.takeDamage(p.dmg, this, p); if (hurt || h.blocking) { if (h.blocking || p.pierce-- <= 0) p.alive = false; } } }
      else { const all = this.boss && this.boss.alive ? [this.boss, ...this.enemies] : this.enemies; for (const e of all) if (e.alive && !p.hitSet.has(e.id) && Math.hypot(e.x - p.x, e.y - p.y) < e.r + p.r) { p.hitSet.add(e.id); e.takeDamage(p.dmg, this, p); p.owner.stats.hits++; if (p.pierce-- <= 0) { p.alive = false; break; } } } }
    this.projectiles = this.projectiles.filter(p => p.alive);
    // hits (melee hitboxes)
    for (const h of this.hits) { h.life -= sdt;
      if (h.team === 'pandava' && this.nabhi && this.nabhi.hp > 0 && h.owner.kind === 'satyaki' && !h.hitSet.has('nabhi') && Math.hypot(this.nabhi.x - h.x, this.nabhi.y - h.y) < h.r + 30) { h.hitSet.add('nabhi'); this.nabhi.hp -= h.dmg; this.burst(this.nabhi.x, this.nabhi.y - 60, '#E0B072', 10, 180); this.audio.sfx('gada'); if (this.nabhi.hp <= 0) { this.nabhi.hp = 0; this.shake(12); this.audio.sfx('shatter'); this.floatText(this.nabhi.x, this.nabhi.y - 120, 'नाभि ध्वस्त!', '#F4C95D'); this.ev.nabhi && this.ev.nabhi(); } }
      if (h.team === 'pandava') { const all = this.boss && this.boss.alive ? [this.boss, ...this.enemies] : this.enemies; for (const e of all) if (e.alive && !h.hitSet.has(e.id)) { const d = Math.hypot(e.x - h.x, e.y - h.y); if (d < e.r + h.r && (!h.ring || d > h.inner)) { h.hitSet.add(e.id); e.takeDamage(h.dmg, this, h); h.owner.stats.hits++; h.owner.stats.dmg += h.dmg; if (e.isBoss && h.owner.shakti !== undefined) h.owner.shakti = Math.min(h.owner.shaktiMax, h.owner.shakti + 2); h.owner.streak = (h.owner.streak || 0) + 1; h.owner.streakT = 2.5; if (h.owner.streak === 12) this.hype('streak'); } }
        if (h.parry) for (const p of this.projectiles) if (p.team === 'kaurava' && p.kind !== 'sun' && Math.hypot(p.x - h.x, p.y - h.y) < h.r + 10) { p.alive = false; this.burst(p.x, p.y, '#FFFFFF', 6, 140, true); this.audio.sfx('clash'); this.floatText(p.x, p.y - 10, 'प्रतिघात', '#FFFFFF'); this._parries = (this._parries || 0) + 1; if (this._parries % 5 === 0) this.hype('parry'); } }
      else { for (const hero of this.heroes) if (hero.alive && !h.hitSet.has(hero.id)) { const d = Math.hypot(hero.x - h.x, hero.y - h.y); if (d < hero.r + h.r && (!h.ring || d > h.inner)) { h.hitSet.add(hero.id); hero.takeDamage(h.dmg, this, h.owner); if (h.knock) { const a = Math.atan2(hero.y - h.owner.y, hero.x - h.owner.x); hero.vx += Math.cos(a) * h.knock; hero.vy += Math.sin(a) * h.knock; } } } } }
    this.hits = this.hits.filter(h => h.life > 0);
    for (const p of this.pickups) p.update(sdt, this); this.pickups = this.pickups.filter(p => p.alive);
    if (this.decals) { for (const d of this.decals) d.life -= sdt; this.decals = this.decals.filter(d => d.life > 0); }
    for (const p of this.particles) p.update(sdt); this.particles = this.particles.filter(p => p.life > 0); if (this.particles.length > 600) this.particles.splice(0, this.particles.length - 600);
    for (const f of this.floats) { f.life -= dt; f.y -= 30 * dt; } this.floats = this.floats.filter(f => f.life > 0);
    for (const s of this.slashes) s.life -= dt; this.slashes = this.slashes.filter(s => s.life > 0);
    for (const t of this.trails) t.life -= dt; this.trails = this.trails.filter(t => t.life > 0);
    if (this.phase === 'won' && !this.scripted) { this.phaseT -= dt; const h = this.heroes[0]; const nabhiPending = this.nabhi && this.nabhi.hp > 0; if ((this.arena.atGate && this.arena.atGate(h) && !nabhiPending) || this.phaseT <= 0) { this.phase = 'done'; this.ev.ringDone && this.ev.ringDone(); } }
  }
}


// ---- Arena geometry. Rings 1-6: a band of ground in front of ring N's wall, with the gate (dwar) ahead. Ring 7: the Nabhi itself (a circle).
export function makeArena(idx) {
  const cx = WORLD.w / 2, cy = WORLD.h / 2;
  if (idx >= 6) {
    const A = { kind: 'circle', cx, cy, r: 400, VC: { x: cx, y: cy }, D: 0, gateOpen: false, bbox: { minX: cx - 520, maxX: cx + 520, minY: cy - 520, maxY: cy + 520 } };
    A.inside = (x, y, pad = 0) => Math.hypot(x - cx, y - cy) < A.r + pad;
    A.clamp = e => { const dx = e.x - cx, dy = e.y - cy, d = Math.hypot(dx, dy), max = A.r - e.r; if (d > max) { e.x = cx + dx / d * max; e.y = cy + dy / d * max; } };
    A.spawn = () => ({ x: cx, y: cy + 250 }); A.bossSpawn = () => ({ x: cx, y: cy - 200 }); A.enemySpawn = () => { const a = rnd(-Math.PI, 0) - 0.3; return { x: cx + Math.cos(a) * (A.r - 30), y: cy + Math.sin(a) * (A.r - 30) }; };
    A.atGate = () => false; A.gate = { x: cx, y: cy - A.r }; return A;
  }
  const D = 980, Rin = D - 230, Rout = D + 230, span = 500 / D, gateHalf = 70 / Rin; const VC = { x: cx, y: cy - D };
  const A = { kind: 'band', cx, cy, r: 400, VC, D, Rin, Rout, span, gateHalf, gateOpen: false, gate: { x: cx, y: VC.y + Rin }, bbox: { minX: cx - Rout * Math.sin(span) - 80, maxX: cx + Rout * Math.sin(span) + 80, minY: VC.y + Rin * Math.cos(span) - 260, maxY: VC.y + Rout + 60 } };
  const polar = (x, y) => { const dx = x - VC.x, dy = y - VC.y; return { r: Math.hypot(dx, dy), a: Math.atan2(dy, dx) }; };
  A.inside = (x, y, pad = 0) => { const p = polar(x, y); const da = Math.abs(p.a - Math.PI / 2); if (A.gateOpen && da < gateHalf && p.r > Rin - 200) return p.r < Rout + pad; return p.r > Rin - pad && p.r < Rout + pad && da < span + pad / p.r; };
  A.clamp = e => { const p = polar(e.x, e.y); const da = p.a - Math.PI / 2; let r = p.r, a = p.a; const inGate = A.gateOpen && Math.abs(da) < gateHalf - e.r / Rin;
    const rMin = inGate ? Rin - 220 : Rin + e.r + 6, rMax = Rout - e.r; r = clamp(r, rMin, rMax);
    if (!inGate) { const lim = span - e.r / r; a = Math.PI / 2 + clamp(da, -lim, lim); } else if (r < Rin) { a = Math.PI / 2 + clamp(da, -(gateHalf - e.r / Rin), gateHalf - e.r / Rin); }
    e.x = VC.x + Math.cos(a) * r; e.y = VC.y + Math.sin(a) * r; };
  A.spawn = () => ({ x: cx, y: VC.y + Rout - 90 }); A.bossSpawn = () => ({ x: cx, y: VC.y + Rin + 90 });
  A.enemySpawn = (i, n) => { const side = i % 3; const a = side === 0 ? Math.PI / 2 + rnd(-gateHalf, gateHalf) : Math.PI / 2 + (side === 1 ? -1 : 1) * span * rnd(0.6, 0.95); const r = side === 0 ? Rin + 40 : rnd(Rin + 60, Rout - 60); return { x: VC.x + Math.cos(a) * r, y: VC.y + Math.sin(a) * r }; };
  A.atGate = h => h && Math.hypot(h.x - VC.x, h.y - VC.y) < Rin - 40;
  A.wallPoint = (da, dr = 0) => ({ x: VC.x + Math.cos(Math.PI / 2 + da) * (Rin + dr), y: VC.y + Math.sin(Math.PI / 2 + da) * (Rin + dr) });
  return A;
}
