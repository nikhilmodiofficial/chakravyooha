// Boss AI. Each boss is a move-set; think() picks a move (~50/50 between pressure/ranged families) so no fixed pattern emerges.
import { BOSSES, RULES } from './config.js';
import { isMarmaHit } from './marma.js';
import { Soldier, angDiff, lerp, rnd, TAU } from './entities.js';
import { ap, dp, impulse, integrateImpulse } from './physics.js';
let _id = 5000;

export class Boss {
  constructor(key, x, y, world) {
    const d = BOSSES[key]; this.key = key; this.def = d; this.id = _id++; this.isBoss = true; this.team = 'kaurava';
    this.x = x; this.y = y; this.vx = 0; this.vy = 0; this.r = d.radius; const hpMul = (world && world.mods && world.mods.bossHpMult) || 1; this.maxHp = Math.round(d.hp * hpMul); this.hp = this.maxHp; this.marma = RULES.marma.bosses[key] || null; this.marmaFound = false; this.speed = d.speed; this.facing = Math.PI / 2;
    this.alive = true; this.hurtT = 0; this.stun = 0; this.bound = 0; this.slow = 0; this.burn = 0; this.guard = false; this.kavach = !!d.kavach;
    this.move = null; this.moveT = 0; this.idleT = 0.8; this.tele = null; this.world = world; this.phase = 1; this.walkT = 0; this.weapon = d.weapon;
    this.extras = {}; this.rage = false; this.invuln = false; this.defeated = false;
    this.moves = MOVESETS[key](this);
    if (this.moves.init) this.moves.init(this, world);
  }
  get hpPct() { return this.hp / this.maxHp; }
  takeDamage(d, world, hit) {
    if (!this.alive || this.invuln) return;
    if (this.def.arrowCut && hit && hit.kind === 'arrow' && Math.random() < this.def.arrowCut) { world.audio.sfx('clash'); world.burst(hit.x, hit.y, '#FFE8A3', 8, 160, true); world.floatText(hit.x, hit.y - 20, 'बाण कटा', '#FFE8A3'); return; }
    if (this.kavach && hit && hit.kind === 'arrow') { world.audio.sfx('clash'); world.burst(hit.x, hit.y, '#FFE8A3', 8, 160, true); world.floatText(hit.x, hit.y - 20, 'बाण कटा', '#FFE8A3'); world.addProjectile({ owner: this, team: 'kaurava', x: hit.x, y: hit.y, vx: -hit.vx * 0.5, vy: -hit.vy * 0.5, dmg: 4, life: 0.5, kind: 'arrow' }); return; }
    if (this.guard && hit && hit.kind === 'sword') { world.audio.sfx('clash'); world.burst(hit.x, hit.y, '#FFFFFF', 8, 160, true); return; }
    if (this.guard && hit && hit.kind === 'gada') { this.guard = false; this.move = null; this.stun = Math.max(this.stun, 1.0); world.audio.sfx('clash'); world.floatText(this.x, this.y - 60, 'रक्षा टूटी!', '#FFFFFF'); world.burst(this.x, this.y - 10, '#FFFFFF', 14, 220, true); }
    if (this.moves.onHit && this.moves.onHit(this, world, hit, d) === false) return;
    if (this.bound > 0) d *= 1.3;
    if (world.mods) d *= world.mods.enemyDamageTakenMult;
    // marma: ordinary blows graze and cannot finish him; only his vital point lands in full
    if (this.marma && !world.scripted && hit && hit.kind !== 'astra') {
      const MR = RULES.marma, floor = this.maxHp * MR.floorPct;
      if (isMarmaHit(this.marma, this, world, hit)) { d *= MR.hitMult; this.stun = Math.max(this.stun, MR.hitStun); this.move = null; if (world.onMarma) world.onMarma(this, hit); }
      else { d *= MR.grazeMult; if (this.hp - d < floor) { d = Math.max(0, this.hp - floor); if (d < 0.5 && world.onGraze) world.onGraze(this, hit); } }
    }
    if (this.def.noKill) d = Math.min(d, Math.max(0, this.hp - this.maxHp * this.def.noKill));
    this.hp -= d; this.hurtT = 0.2; world.blood(this.x, this.y, hit ? hit.x : this.x, hit ? hit.y : this.y + 10, hit && (hit.kind === 'gada' || hit.kind === 'chakra') ? 1.6 : 1); world.audio.sfx('hit'); world.shake(2);
    const AK = RULES.physics.arrowKnock; const kn = hit ? (hit.knock || (hit.kind === 'arrow' ? (hit.charged ? AK.bossCharged : AK.boss) : 0)) : 0; // mass decides how far a maharathi gives
    if (kn && !this.guard) { if (hit.kind === 'arrow' && hit.vx !== undefined) impulse(this, hit.vx, hit.vy, kn); else impulse(this, this.x - hit.x, this.y - hit.y, kn); }
    if (this.phase === 1 && this.hpPct <= RULES.shakti.bigAstraAt) { this.phase = 2; world.onBossPhase2(this); }
    if (this.hp <= 0) { this.hp = 0; this.alive = false; this.defeated = true; world.onBossDefeated(this); }
  }
  applyStatus(s) { if (s.stun) this.stun = Math.max(this.stun, s.stun); if (s.bind) this.bound = Math.max(this.bound, s.bind); if (s.slow) this.slow = Math.max(this.slow, s.slow); if (s.burn) this.burn = Math.max(this.burn, s.burn); this.move = null; this.tele = null; }
  update(dt, world) {
    if (!this.alive) return; this.hurtT = Math.max(0, this.hurtT - dt); this.walkT += dt * 7;
    if (this.burn > 0) { this.burn -= dt; this._burnT = (this._burnT || 0) - dt; if (this._burnT <= 0) { this._burnT = 0.5; this.hp = Math.max(1, this.hp - this.maxHp * 0.01); this.hurtT = 0.1; world.burst(this.x + rnd(-20, 20), this.y + rnd(-20, 20), '#FF7A2A', 3, 80, true); } }
    const tgt = world.nearestHero(this.x, this.y); this.target = tgt;
    if (this.stun > 0 || this.bound > 0) { this.stun = Math.max(0, this.stun - dt); this.bound = Math.max(0, this.bound - dt); this.vx *= dp(0.85, dt); this.vy *= dp(0.85, dt); this.guard = false; }
    else if (tgt) {
      if (this.move) { this.moveT -= dt; this.move.update(this, world, dt, tgt); if (this.moveT <= 0) { if (this.move.end) this.move.end(this, world); this.move = null; this.idleT = this.rage ? rnd(0.3, 0.7) : rnd(0.6, 1.3); } }
      else { this.idleT -= dt; this.moves.idle(this, world, dt, tgt); if (this.idleT <= 0) this.think(world, tgt); }
    }
    this.slow = Math.max(0, this.slow - dt);
    this.x += this.vx * dt * (this.slow > 0 ? 0.5 : 1); this.y += this.vy * dt * (this.slow > 0 ? 0.5 : 1); this.vx *= dp(0.9, dt); this.vy *= dp(0.9, dt); integrateImpulse(this, dt); world.clampToArena(this);
    if (this.moves.tick) this.moves.tick(this, world, dt, tgt);
  }
  think(world, tgt) {
    const list = this.moves.pick(this, world, tgt); const m = list[Math.floor(Math.random() * list.length)];
    this.move = m; this.moveT = m.dur; m.start(this, world, tgt);
  }
  faceTarget(tgt) { if (tgt) this.facing = Math.atan2(tgt.y - this.y, tgt.x - this.x); }
  moveToward(tgt, spd, dt, keep = 0) { const dx = tgt.x - this.x, dy = tgt.y - this.y, d = Math.hypot(dx, dy) || 1; const dir = d > keep ? 1 : -1; this.vx = lerp(this.vx, dx / d * spd * dir, ap(0.2, dt)); this.vy = lerp(this.vy, dy / d * spd * dir, ap(0.2, dt)); }
  strafe(tgt, spd, dt) { const a = Math.atan2(tgt.y - this.y, tgt.x - this.x) + Math.PI / 2 * (this._strafeDir || 1); this.vx = lerp(this.vx, Math.cos(a) * spd, ap(0.15, dt)); this.vy = lerp(this.vy, Math.sin(a) * spd, ap(0.15, dt)); if (Math.random() < dt * 0.4) this._strafeDir = -(this._strafeDir || 1); }
}

// helpers to build moves
const telegraph = (b, world, shape) => { b.tele = shape; b.teleUntil = world.time + (shape.t || 0.4); };
const melee = (b, world, dmg, range, knock, kind = 'sword') => { world.addHit({ owner: b, team: 'kaurava', x: b.x + Math.cos(b.facing) * range * 0.55, y: b.y + Math.sin(b.facing) * range * 0.55, r: range * 0.75, dmg, knock, life: 0.12, kind }); world.audio.sfx(kind === 'gada' ? 'gada' : 'sword'); };
const shoot = (b, world, angle, speed, dmg, kind = 'arrow', extra = {}) => world.addProjectile(Object.assign({ owner: b, team: 'kaurava', x: b.x + Math.cos(angle) * 30, y: b.y + Math.sin(angle) * 30, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, dmg, life: 2.2, kind }, extra));

const MOVESETS = {
  // ---- Ring 1: Dushasana — brawler. Teaches dodge timing and combo punish.
  dushasana: b => ({
    idle: (b, w, dt, t) => { b.faceTarget(t); b.moveToward(t, b.speed, dt, 70); },
    pick: (b, w, t) => { const d = Math.hypot(t.x - b.x, t.y - b.y); return d < 120 ? [M.combo2, M.bash, M.guard] : [M.charge, M.charge, M.combo2]; }
  }),
  // ---- Ring 2: Shalya — gada duel. Heavy telegraphs; gada-vs-gada parry during windup stuns him.
  shalya: b => ({
    init: b => { b.heavy = true; },
    idle: (b, w, dt, t) => { b.faceTarget(t); b.moveToward(t, b.speed, dt, 90); },
    pick: (b, w, t) => { const d = Math.hypot(t.x - b.x, t.y - b.y); return d < 150 ? [M.slam, M.sweep, M.stomp] : [M.stomp, M.lunge, M.slam]; },
    onHit: (b, w, hit) => { if (hit && hit.kind === 'gada' && b.move && b.move.name === 'slam' && b.tele) { b.move = null; b.tele = null; b.stun = 1.4; w.audio.sfx('clash'); w.shake(8); w.floatText(b.x, b.y - 60, 'गदा-संघर्ष!', '#FFFFFF'); w.burst(b.x, b.y - 20, '#FFFFFF', 16, 260, true); } return true; }
  }),
  // ---- Ring 3: Lakshmana — archer. Keeps distance, fans, rapid shots. Sword parries arrows.
  lakshmana: b => ({
    idle: (b, w, dt, t) => { b.faceTarget(t); const d = Math.hypot(t.x - b.x, t.y - b.y); if (d < 260) b.moveToward(t, b.speed, dt, 320); else b.strafe(t, b.speed * 0.6, dt); },
    pick: (b, w, t) => { const d = Math.hypot(t.x - b.x, t.y - b.y); return d < 150 ? [M.retreatDash, M.retreatDash, M.rapid] : [M.fan, M.rapid, M.trapArrows, M.fan]; }
  }),
  // ---- Ring 4: Karna — kavach (arrows bounce). Vrishasena harasses as archer minion.
  karna: b => ({
    init: (b, w) => { b.extras.vrish = null; b.extras.spawnT = 2; },
    idle: (b, w, dt, t) => { b.faceTarget(t); const d = Math.hypot(t.x - b.x, t.y - b.y); if (d < 200) b.strafe(t, b.speed * 0.7, dt); else b.moveToward(t, b.speed * 0.8, dt, 240); },
    pick: (b, w, t) => { const d = Math.hypot(t.x - b.x, t.y - b.y); return d < 140 ? [M.combo2, M.retreatDash, M.sunArrow] : [M.storm, M.sunArrow, M.fan, M.storm]; },
    tick: (b, w, dt) => { const v = b.extras.vrish; if (!v || !v.alive) { b.extras.spawnT -= dt; if (b.extras.spawnT <= 0) { const s = new Soldier(b.x + rnd(-120, 120), b.y + rnd(-120, 120), 'archer', 3); s.color = '#C98A2A'; s.name = 'वृषसेन'; s.r = 20; w.enemies.push(s); b.extras.vrish = s; b.extras.spawnT = 14; } } }
  }),
  // ---- Ring 5: Brihadbala — war-chariot. Line charges, leaves burning wrecks as hazards.
  brihadbala: b => ({
    init: (b, w) => { b.heavy = true; w.hazards = []; },
    idle: (b, w, dt, t) => { b.faceTarget(t); b.strafe(t, b.speed * 0.5, dt); },
    pick: (b, w, t) => [M.chariotCharge, M.chariotCharge, M.ram, M.volleyCircle],
    tick: (b, w, dt) => { for (const h of w.hazards) { h.life -= dt; for (const hero of w.heroes) if (hero.alive && Math.hypot(hero.x - h.x, hero.y - h.y) < h.r + hero.r) { hero._hazT = (hero._hazT || 0) - dt; if (hero._hazT <= 0) { hero._hazT = 0.8; hero.takeDamage(5, w, null); } } } w.hazards = w.hazards.filter(h => h.life > 0); }
  }),
  // ---- Ring 6: Kripa + Ashwatthama — maya clones; real one glows when Kripa shoots.
  kripa: b => ({
    init: (b, w) => { b.extras.clones = []; b.extras.cloneT = 1; b.extras.kripaT = 3; b.extras.glow = 0; b.extras.kripa = { x: 0, y: 0 }; },
    idle: (b, w, dt, t) => { b.faceTarget(t); b.moveToward(t, b.speed, dt, 80); },
    pick: (b, w, t) => { const d = Math.hypot(t.x - b.x, t.y - b.y); return d < 120 ? [M.combo2, M.mayaBlink, M.guard] : [M.charge, M.mayaBlink, M.combo2]; },
    tick: (b, w, dt, t) => {
      if (!t) return; b.extras.glow = Math.max(0, b.extras.glow - dt);
      // Kripa stands at arena edge opposite the hero and fires every ~3s; the shot reveals the real Ashwatthama.
      const k = b.extras.kripa; if (w.arena.wallPoint) { const side = t.x < w.arena.cx ? 1 : -1; const wp = w.arena.wallPoint(side * 0.22, -10); k.x = wp.x; k.y = wp.y; } else { const a = Math.atan2(w.arena.cy - t.y, w.arena.cx - t.x); k.x = w.arena.cx + Math.cos(a) * (w.arena.r - 40); k.y = w.arena.cy + Math.sin(a) * (w.arena.r - 40); }
      b.extras.kripaT -= dt; if (b.extras.kripaT <= 0) { b.extras.kripaT = b.phase === 2 ? 2.2 : 3.2; const ang = Math.atan2(t.y - k.y, t.x - k.x); for (let i = -1; i <= 1; i++) w.addProjectile({ owner: b, team: 'kaurava', x: k.x, y: k.y, vx: Math.cos(ang + i * 0.12) * 460, vy: Math.sin(ang + i * 0.12) * 460, dmg: 8, life: 2.4, kind: 'arrow' }); w.audio.sfx('arrow'); b.extras.glow = 1.2; w.floatText(k.x, k.y - 40, 'कृप', '#CFF4FF'); }
      // clones
      b.extras.clones = b.extras.clones.filter(c => c.alive); b.extras.cloneT -= dt;
      if (b.extras.clones.length < (b.phase === 2 ? 3 : 2) && b.extras.cloneT <= 0) { b.extras.cloneT = 4; const c = new Soldier(b.x + rnd(-90, 90), b.y + rnd(-90, 90), 'melee', 0.6); c.color = b.def.color; c.r = b.r; c.clone = true; c.speed = b.speed; c.maxHp = c.hp = 1; w.enemies.push(c); b.extras.clones.push(c); w.burst(c.x, c.y, '#8F6CFF', 12, 140, true); }
    }
  }),
  // ---- Ring 7 archery duel: Karna (bow only, cuts some arrows mid-air, keeps distance)
  karna2: b => ({
    idle: (b, w, dt, t) => { b.faceTarget(t); const d = Math.hypot(t.x - b.x, t.y - b.y); if (d < 230) b.moveToward(t, b.speed, dt, 300); else b.strafe(t, b.speed * 0.6, dt); },
    pick: (b, w, t) => { const d = Math.hypot(t.x - b.x, t.y - b.y); return d < 160 ? [M.retreatDash, M.retreatDash, M.fan] : [M.storm, M.sunArrow, M.fan, M.rapid, M.trapArrows]; }
  }),
  // ---- Ring 7 duel: Durmasena — gada brute with rage.
  durmasena: b => ({
    init: b => { b.heavy = true; },
    idle: (b, w, dt, t) => { b.faceTarget(t); b.moveToward(t, b.speed * (b.rage ? 1.3 : 1), dt, 80); },
    pick: (b, w, t) => { const d = Math.hypot(t.x - b.x, t.y - b.y); if (b.hpPct < 0.3 && !b.rage) { b.rage = true; w.floatText(b.x, b.y - 70, 'क्रोध!', '#FF3B3B'); w.audio.sfx('vipatti'); } return d < 150 ? [M.slam, M.spin, M.sweep] : [M.lunge, M.stomp, M.slam]; }
  })
};

const M = {
  charge: { name: 'charge', dur: 1.3, start: (b, w, t) => { b.faceTarget(t); b._ph = 0; telegraph(b, w, { kind: 'line', len: 260, w: 50, t: 0.45 }); }, update: (b, w, dt, t) => { b._ph += dt; if (b._ph < 0.45) { b.faceTarget(t); b.vx *= dp(0.5, dt); b.vy *= dp(0.5, dt); } else if (b._ph < 0.85) { b.tele = null; b.vx = Math.cos(b.facing) * 640; b.vy = Math.sin(b.facing) * 640; if (!b._hitDone) { b._hitDone = true; } const d = Math.hypot(t.x - b.x, t.y - b.y); if (d < b.r + t.r + 10 && !b._struck) { b._struck = true; melee(b, w, 14, 90, 300); } } else { b.vx *= dp(0.7, dt); b.vy *= dp(0.7, dt); } }, end: b => { b._struck = false; b._hitDone = false; } },
  combo2: { name: 'combo2', dur: 1.1, start: (b, w, t) => { b.faceTarget(t); b._ph = 0; b._n = 0; telegraph(b, w, { kind: 'arc', r: 90, t: 0.4 }); }, update: (b, w, dt, t) => { b._ph += dt; b.vx *= dp(0.8, dt); b.vy *= dp(0.8, dt); if (b._ph > 0.4 && b._n === 0) { b._n = 1; b.tele = null; melee(b, w, 10, 95, 120); } if (b._ph > 0.75 && b._n === 1) { b._n = 2; b.faceTarget(t); melee(b, w, 12, 95, 200); } } },
  bash: { name: 'bash', dur: 1.0, start: (b, w, t) => { b.faceTarget(t); b._ph = 0; telegraph(b, w, { kind: 'arc', r: 110, t: 0.55, color: '#FFE8A3' }); }, update: (b, w, dt, t) => { b._ph += dt; b.vx *= dp(0.8, dt); b.vy *= dp(0.8, dt); if (b._ph > 0.55 && !b._d) { b._d = true; b.tele = null; melee(b, w, 8, 115, 480, 'gada'); w.shake(6); } }, end: b => { b._d = false; } },
  guard: { name: 'guard', dur: 1.4, start: (b, w) => { b.guard = true; w.floatText(b.x, b.y - 50, 'रक्षा', '#FFFFFF'); }, update: (b, w, dt, t) => { b.faceTarget(t); b.vx *= dp(0.8, dt); b.vy *= dp(0.8, dt); }, end: b => { b.guard = false; } },
  slam: { name: 'slam', dur: 1.5, start: (b, w, t) => { b.faceTarget(t); b._ph = 0; telegraph(b, w, { kind: 'circle', r: 150, t: 0.9, color: '#E0B072' }); }, update: (b, w, dt, t) => { b._ph += dt; b.vx *= dp(0.85, dt); b.vy *= dp(0.85, dt); if (b._ph < 0.5) b.faceTarget(t); if (b._ph > 0.9 && !b._d) { b._d = true; b.tele = null; w.addHit({ owner: b, team: 'kaurava', x: b.x + Math.cos(b.facing) * 70, y: b.y + Math.sin(b.facing) * 70, r: 110, dmg: 22, knock: 380, life: 0.15, kind: 'gada' }); w.audio.sfx('gada'); w.shake(12); w.burst(b.x + Math.cos(b.facing) * 70, b.y + Math.sin(b.facing) * 70, '#E0B072', 24, 260); } }, end: b => { b._d = false; } },
  sweep: { name: 'sweep', dur: 1.2, start: (b, w, t) => { b.faceTarget(t); b._ph = 0; telegraph(b, w, { kind: 'arc', r: 130, t: 0.6, wide: true }); }, update: (b, w, dt, t) => { b._ph += dt; b.vx *= dp(0.85, dt); b.vy *= dp(0.85, dt); if (b._ph > 0.6 && !b._d) { b._d = true; b.tele = null; w.addHit({ owner: b, team: 'kaurava', x: b.x, y: b.y, r: 130, dmg: 16, knock: 300, life: 0.15, kind: 'gada', ring: true, inner: 40 }); w.audio.sfx('gada'); w.shake(8); } }, end: b => { b._d = false; } },
  stomp: { name: 'stomp', dur: 1.3, start: (b, w, t) => { b._ph = 0; telegraph(b, w, { kind: 'circle', r: 80, t: 0.7, color: '#A9743A' }); }, update: (b, w, dt, t) => { b._ph += dt; b.vx *= dp(0.8, dt); b.vy *= dp(0.8, dt); if (b._ph > 0.7 && !b._d) { b._d = true; b.tele = null; w.audio.sfx('bhoomi'); w.shake(10); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; shoot(b, w, a, 260, 9, 'shock', { life: 1.4, r: 14 }); } } }, end: b => { b._d = false; } },
  lunge: { name: 'lunge', dur: 1.0, start: (b, w, t) => { b.faceTarget(t); b._ph = 0; telegraph(b, w, { kind: 'line', len: 200, w: 60, t: 0.4 }); }, update: (b, w, dt, t) => { b._ph += dt; if (b._ph < 0.4) { b.faceTarget(t); b.vx *= dp(0.5, dt); b.vy *= dp(0.5, dt); } else if (b._ph < 0.7) { b.tele = null; b.vx = Math.cos(b.facing) * 560; b.vy = Math.sin(b.facing) * 560; if (!b._d) { b._d = true; } } else if (!b._s) { b._s = true; melee(b, w, 18, 110, 300, 'gada'); } }, end: b => { b._d = false; b._s = false; } },
  spin: { name: 'spin', dur: 2.2, start: (b, w, t) => { b._ph = 0; b._hitT = 0; w.floatText(b.x, b.y - 60, 'चक्र-गदा', '#FF3B3B'); }, update: (b, w, dt, t) => { b._ph += dt; b.facing += dt * 9; b.moveToward(t, b.speed * 0.8, dt, 0); b._hitT -= dt; if (b._hitT <= 0 && b._ph > 0.3) { b._hitT = 0.3; w.addHit({ owner: b, team: 'kaurava', x: b.x, y: b.y, r: 95, dmg: 9, knock: 240, life: 0.1, kind: 'gada', ring: true, inner: 30 }); w.audio.sfx('sword'); } } },
  fan: { name: 'fan', dur: 1.0, start: (b, w, t) => { b.faceTarget(t); b._ph = 0; telegraph(b, w, { kind: 'aim', t: 0.45 }); }, update: (b, w, dt, t) => { b._ph += dt; b.vx *= dp(0.8, dt); b.vy *= dp(0.8, dt); if (b._ph < 0.45) b.faceTarget(t); if (b._ph > 0.45 && !b._d) { b._d = true; b.tele = null; for (let i = -2; i <= 2; i++) shoot(b, w, b.facing + i * 0.17, 440, 8); w.audio.sfx('arrow'); } }, end: b => { b._d = false; } },
  rapid: { name: 'rapid', dur: 1.6, start: (b, w, t) => { b._ph = 0; b._n = 0; }, update: (b, w, dt, t) => { b._ph += dt; b.faceTarget(t); b.vx *= dp(0.9, dt); b.vy *= dp(0.9, dt); if (b._ph > 0.3 + b._n * 0.22 && b._n < 5) { b._n++; shoot(b, w, b.facing + rnd(-0.05, 0.05), 520, 7); w.audio.sfx('arrow'); } } },
  trapArrows: { name: 'trap', dur: 1.2, start: (b, w, t) => { b.faceTarget(t); b._d = false; b._ph = 0; }, update: (b, w, dt, t) => { b._ph += dt; if (b._ph > 0.4 && !b._d) { b._d = true; for (let i = 0; i < 8; i++) { const a = Math.atan2(t.y - b.y, t.x - b.x) + (i - 3.5) * 0.25; shoot(b, w, a, 180, 10, 'arrow', { life: 3.5, slowArrow: true }); } w.audio.sfx('arrow'); } } },
  retreatDash: { name: 'retreat', dur: 0.6, start: (b, w, t) => { const a = Math.atan2(b.y - t.y, b.x - t.x); b.vx = Math.cos(a) * 700; b.vy = Math.sin(a) * 700; b.facing = a + Math.PI; w.trail(b); }, update: (b, w, dt, t) => { b.faceTarget(t); } },
  storm: { name: 'storm', dur: 2.0, start: (b, w, t) => { b._ph = 0; b._n = 0; telegraph(b, w, { kind: 'aim', t: 0.5, color: '#FFE8A3' }); }, update: (b, w, dt, t) => { b._ph += dt; b.vx *= dp(0.9, dt); b.vy *= dp(0.9, dt); b.faceTarget(t); if (b._ph > 0.5) { b.tele = null; if (b._ph > 0.5 + b._n * 0.14 && b._n < 9) { b._n++; shoot(b, w, b.facing + rnd(-0.25, 0.25), 560, 7, 'arrow', { life: 1.8 }); if (b._n % 2) w.audio.sfx('arrow'); } } } },
  sunArrow: { name: 'sun', dur: 1.4, start: (b, w, t) => { b.faceTarget(t); b._ph = 0; b._d = false; telegraph(b, w, { kind: 'line', len: 900, w: 36, t: 0.8, color: '#FFE8A3' }); }, update: (b, w, dt, t) => { b._ph += dt; b.vx *= dp(0.8, dt); b.vy *= dp(0.8, dt); if (b._ph < 0.5) b.faceTarget(t); if (b._ph > 0.8 && !b._d) { b._d = true; b.tele = null; shoot(b, w, b.facing, 900, 26, 'sun', { life: 1.6, r: 12, pierce: 9 }); w.audio.sfx('agni'); w.shake(6); } } },
  chariotCharge: { name: 'chariot', dur: 2.2, start: (b, w, t) => { b.faceTarget(t); b._ph = 0; b._struck = false; telegraph(b, w, { kind: 'line', len: 1200, w: 90, t: 0.8, color: '#E0B072' }); w.audio.sfx('rumble'); }, update: (b, w, dt, t) => { b._ph += dt; if (b._ph < 0.8) { b.faceTarget(t); b.vx *= dp(0.6, dt); b.vy *= dp(0.6, dt); } else if (b._ph < 1.7) { b.tele = null; b.vx = Math.cos(b.facing) * 720; b.vy = Math.sin(b.facing) * 720; w.shake(3); if (Math.random() < 0.5) w.burst(b.x - Math.cos(b.facing) * 30, b.y - Math.sin(b.facing) * 30, '#D9A441', 2, 60); for (const h of w.heroes) if (h.alive && Math.hypot(h.x - b.x, h.y - b.y) < b.r + h.r + 6 && !b._struck) { b._struck = true; h.takeDamage(15, w, b); } } else { b.vx *= dp(0.7, dt); b.vy *= dp(0.7, dt); if (!b._wreck) { b._wreck = true; w.hazards.push({ x: b.x - Math.cos(b.facing) * 120, y: b.y - Math.sin(b.facing) * 120, r: 48, life: 12 }); } } }, end: b => { b._wreck = false; } },
  ram: { name: 'ram', dur: 1.2, start: (b, w, t) => { b.faceTarget(t); b._ph = 0; telegraph(b, w, { kind: 'arc', r: 140, t: 0.5, color: '#E0B072' }); }, update: (b, w, dt, t) => { b._ph += dt; b.vx *= dp(0.8, dt); b.vy *= dp(0.8, dt); if (b._ph > 0.5 && !b._d) { b._d = true; b.tele = null; w.addHit({ owner: b, team: 'kaurava', x: b.x + Math.cos(b.facing) * 60, y: b.y + Math.sin(b.facing) * 60, r: 120, dmg: 18, knock: 520, life: 0.15, kind: 'gada' }); w.audio.sfx('gada'); w.shake(9); } }, end: b => { b._d = false; } },
  volleyCircle: { name: 'volley', dur: 2.4, start: (b, w, t) => { b._ph = 0; b._n = 0; }, update: (b, w, dt, t) => { b._ph += dt; b.strafe(t, b.speed, dt); b.faceTarget(t); if (b._ph > 0.2 + b._n * 0.35 && b._n < 6) { b._n++; shoot(b, w, b.facing + rnd(-0.1, 0.1), 500, 8); w.audio.sfx('arrow'); } } },
  mayaBlink: { name: 'maya', dur: 0.9, start: (b, w, t) => { w.burst(b.x, b.y, '#8F6CFF', 20, 200, true); const a = rnd(0, TAU); const d = rnd(120, 220); b.x = t.x + Math.cos(a) * d; b.y = t.y + Math.sin(a) * d; w.clampToArena(b); w.burst(b.x, b.y, '#8F6CFF', 20, 200, true); w.audio.sfx('naag'); for (const c of b.extras.clones) if (c.alive) { const a2 = rnd(0, TAU); c.x = t.x + Math.cos(a2) * d; c.y = t.y + Math.sin(a2) * d; w.burst(c.x, c.y, '#8F6CFF', 10, 150, true); } }, update: (b, w, dt, t) => { b.faceTarget(t); } }
};
