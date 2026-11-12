// Entities: Hero (Abhimanyu / Satyaki), Soldier, Boss base, Projectile, Pickup, Particle.
import { PLAYER, SATYAKI, RULES } from './config.js';
const SV = RULES.survival, SH = RULES.shield;
import { ap, dp, impulse, integrateImpulse } from './physics.js';

export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
export const rnd = (a, b) => a + Math.random() * (b - a);
let _id = 1;

export class Hero {
  constructor(kind, x, y) {
    this.id = _id++; this.kind = kind; // 'abhimanyu' | 'satyaki'
    this.cfg = kind === 'satyaki' ? SATYAKI : PLAYER;
    this.x = x; this.y = y; this.vx = 0; this.vy = 0; this.r = this.cfg.radius;
    this.hp = this.cfg.maxHp; this.maxHp = this.cfg.maxHp; this.facing = -Math.PI / 2; this.aim = this.facing;
    this.state = 'idle'; this.stateT = 0; this.cd = { sword: 0, bow: 0, gada: 0, dodge: 0, jump: 0 };
    this.combo = 0; this.comboT = 0; this.charge = 0; this.charging = false; this.invuln = 0; this.hurtT = 0;
    this.team = 'pandava'; this.alive = true; this.weaponsBroken = { bow: false, gada: false }; this.astra = null; this.astraUsed = false;
    this.stats = { hits: 0, dmg: 0, dodges: 0, shards: 0 }; this.chakra = false; this.arrows = this.cfg.arrows; this.maxArrows = this.cfg.arrows; this.weapon = 'sword'; this.blocking = false; this.blockT = 0; this.shieldBroken = false; this.shakti = 0; this.shaktiMax = RULES.shakti.max; this.regenWait = 0; this.z = 0; this.noArrowT = 0; this.lastAttackDir = this.facing; this.walkT = 0;
  }
  takeDamage(d, world, src, knock = 160) {
    if (!this.alive || this.invuln > 0 || this.state === 'dodge' || (this.state === 'jump' && this.z > 6)) return false;
    d *= SV.damageTaken * ((world.mods && world.mods.enemyDmgMult) || 1);
    if (this.blocking && src) { const a = src.vx !== undefined && (src.vx || src.vy) ? Math.atan2(-src.vy, -src.vx) : Math.atan2(src.y - this.y, src.x - this.x); if (Math.abs(angDiff(this.facing, a)) < SH.frontArc) { const perfect = this.blockT < SH.perfectWindow; world.audio.sfx('clash'); world.burst(this.x + Math.cos(this.facing) * 22, this.y - 14 + Math.sin(this.facing) * 22, '#FFE8A3', perfect ? 18 : 8, perfect ? 240 : 140, true);
      if (perfect) { world.floatText(this.x, this.y - 60, world.lang === 'en' ? 'Perfect block!' : 'सटीक रोक!', '#FFE8A3'); const o = src.owner && src.owner.alive ? src.owner : (src.alive ? src : null); if (o && o.team === 'kaurava') { if (o.isBoss) o.stun = Math.max(o.stun || 0, 0.9); else o.stun = Math.max(o.stun || 0, 1.3); } if (this.shakti !== undefined) this.shakti = Math.min(this.shaktiMax, this.shakti + SH.perfectShakti); this.invuln = 0.2; return false; }
      { const att = src.owner || src; if (att && att.isBoss) { this._blockedAt = world.time; this._blockedBoss = att; } } d *= SH.reduce; impulse(this, -Math.cos(this.facing), -Math.sin(this.facing), 60 + knock * 0.3); if (d < 0.5) return false; knock = 0; } }
    this.regenWait = SV.regenAfter; this.streak = 0; this.hp -= d; this.hurtT = 0.25; this.invuln = 0.35; world.audio.sfx('hurt'); world.shake(Math.min(12, d * 0.6)); world.hurtFlash = Math.min(1, 0.35 + d * 0.03); world.floatText(this.x, this.y - 56, '-' + Math.round(d), '#FF5A3B');
    world.blood(this.x, this.y, src ? src.x : this.x - Math.cos(this.facing) * 10, src ? src.y : this.y, 1);
    if (src && knock) { const dir = src.vx && src.vy !== undefined && !src.isBoss && src.kind ? [src.vx, src.vy] : [this.x - src.x, this.y - src.y]; impulse(this, dir[0], dir[1], knock); }
    if (this.hp <= 0) { this.hp = 0; this.alive = false; this.state = 'dead'; world.onHeroDown(this); }
    return true;
  }
  setWeapon(w, world) { if (this.weapon === w || (this.weaponsBroken && this.weaponsBroken[w])) return; this.weapon = w; this.charging = false; this.charge = 0; if (world) { world.audio.sfx('ui'); world.ev && world.ev.weapon && world.ev.weapon(this, w); } }
  heal(v) { this.hp = Math.min(this.maxHp, this.hp + v); }
  update(dt, intent, world) {
    if (!this.alive) return;
    if (this.state === 'fallen') { this.vx = this.vy = 0; this.charging = false; return; }
    if (this.state === 'pranam') { this.vx = this.vy = 0; this.charging = false; this.stateT -= dt; if (this.stateT <= 0) this.state = 'idle'; return; }
    for (const k in this.cd) this.cd[k] = Math.max(0, this.cd[k] - dt);
    this.regenWait -= dt; if (this.regenWait <= 0 && this.hp < this.maxHp * SV.regenCap && this.state !== 'fallen') this.hp = Math.min(this.maxHp * SV.regenCap, this.hp + SV.regenPerSec * dt);
    this.invuln = Math.max(0, this.invuln - dt); this.hurtT = Math.max(0, this.hurtT - dt); this.stateT -= dt; this.comboT -= dt;
    if (this.comboT <= 0) this.combo = 0;
    const c = this.cfg;
    // simplified scheme: attack/attackHeld + weapon switch -> per-weapon flags (old flags still work for co-op clients / bots)
    // holding the chariot wheel: Strike = wheel sweep, Switch = wheel slam (no weapon change)
    if (this.chakra && (intent.attack !== undefined || intent.switchW)) intent = Object.assign({}, intent, { sword: !!intent.attack, gada: !!intent.switchW, attack: undefined, attackHeld: undefined, switchW: false, weaponSel: undefined });
    if (intent.weaponSel && ['sword', 'bow', 'gada'].includes(intent.weaponSel)) this.setWeapon(intent.weaponSel, world);
    if (intent.switchW) { const order = ['sword', 'bow', 'gada'].filter(w => !(this.weaponsBroken && this.weaponsBroken[w])); const i = order.indexOf(this.weapon); this.setWeapon(order[(i + 1) % order.length] || 'sword', world); }
    if (this.weaponsBroken && this.weaponsBroken[this.weapon]) this.setWeapon('sword', world);
    if (intent.attack !== undefined || intent.attackHeld !== undefined) { const w = this.weapon; intent = Object.assign({}, intent, { sword: intent.sword || (w === 'sword' && (intent.attack || (RULES.controls.holdToRepeatMelee && intent.attackHeld))), gada: intent.gada || (w === 'gada' && (intent.attack || (RULES.controls.holdToRepeatMelee && intent.attackHeld))), /* hold Strike = keep swinging */ bowHeld: intent.bowHeld || (w === 'bow' && intent.attackHeld), bowPressed: intent.bowPressed || (w === 'bow' && intent.attack) }); }
    // aim
    if (intent.aimAngle !== undefined) this.aim = intent.aimAngle;
    else if (intent.mx || intent.my) this.aim = Math.atan2(intent.my, intent.mx);
    // auto-aim assist for bow
    if (intent.bowHeld || intent.bowPressed) { const t = world.nearestEnemy(this.x, this.y, 700); if (t) { const a = Math.atan2(t.y - this.y, t.x - this.x); if (Math.abs(angDiff(this.aim, a)) < 0.6 || !intent.aimAngle) this.aim = a; } }
    // melee auto-aim: with no mouse, swing at the nearest enemy in reach
    if ((intent.sword || intent.gada || intent.block) && intent.aimAngle === undefined) { const t = world.nearestEnemy(this.x, this.y, 240); if (t) this.aim = Math.atan2(t.y - this.y, t.x - this.x); }
    // dhaal (shield): hold to block the front; a block raised just in time staggers the attacker
    const canBlock = intent.block && !this.shieldBroken && !this.chakra && this.state !== 'jump' && this.state !== 'dodge' && this.state !== 'fallen';
    if (canBlock && !this.blocking) { this.blocking = true; this.blockT = 0; this.charging = false; this.charge = 0; } else if (!canBlock) this.blocking = false;
    if (this.blocking) { this.blockT += dt; this.facing = this.aim; }
    // movement
    const busy = this.state === 'gada' || this.state === 'sword' || this.state === 'stunned' || this.state === 'bound';
    let spd = c.speed * (this.blocking ? SH.moveSpeed : 1) * (this.charging ? 0.45 : 1) * (busy ? 0.25 : 1) * (this.slow > 0 ? 0.55 : 1);
    if (this.state === 'dodge') { this.vx = Math.cos(this.dodgeA) * c.dodge.speed; this.vy = Math.sin(this.dodgeA) * c.dodge.speed; if (this.stateT <= 0) this.state = 'idle'; }
    else if (this.state === 'jump') { const T = SV.jumpTime, k = 1 - Math.max(0, this.stateT) / T; this.z = 4 * SV.jumpHeight * k * (1 - k); /* ballistic arc: rise slows, fall speeds up */ this.vx = lerp(this.vx, (intent.mx || this.jumpDx) * c.speed * 1.5, ap(0.12, dt)); this.vy = lerp(this.vy, (intent.my || this.jumpDy) * c.speed * 1.5, ap(0.12, dt));
      if ((intent.gada || (intent.attack && this.weapon === 'gada')) && this.weapon === 'gada' && !this.weaponsBroken?.gada) this._plunge = true;
      if (this.stateT <= 0 && this._plunge) { this._plunge = false; this.state = 'idle'; this.z = 0; this.cd.gada = c.gada.cd; world.addHit({ owner: this, team: this.team, x: this.x + Math.cos(this.aim) * 30, y: this.y + Math.sin(this.aim) * 30, r: 95, dmg: c.gada.dmg * 1.2, knock: c.gada.knock + 80, life: 0.12, kind: 'gada', plunge: true }); world.shake(10); world.audio.sfx('gada'); world.burst(this.x, this.y, '#E0B072', 22, 260); }
      if (this.stateT <= 0) { this.state = 'idle'; this.z = 0; world.addHit({ owner: this, team: this.team, x: this.x, y: this.y, r: 70, dmg: SV.landingDmg, knock: SV.landingKnock, life: 0.1, kind: 'gada', ring: true, inner: 0 }); world.burst(this.x, this.y + 10, '#D9A441', 16, 200); world.audio.sfx('gada'); world.shake(5); } }
    else if (this.state === 'stunned' || this.state === 'bound') { this.vx *= dp(0.8, dt); this.vy *= dp(0.8, dt); if (this.stateT <= 0) this.state = 'idle'; }
    else {
      this.vx = lerp(this.vx, intent.mx * spd, ap(0.35, dt)); this.vy = lerp(this.vy, intent.my * spd, ap(0.35, dt));
      if ((intent.mx || intent.my) && !busy) { this.facing = Math.atan2(intent.my, intent.mx); this.walkT += dt * 9; }
      if (busy && this.stateT <= 0) this.state = 'idle';
      // actions
      if (this.blocking) { intent = Object.assign({}, intent, { sword: false, gada: false, bowHeld: false, bowPressed: false }); }
      if (intent.jump && this.cd.jump <= 0 && !this.chakra) { this.blocking = false; this.state = 'jump'; this.stateT = SV.jumpTime; this.cd.jump = 0.9; this.jumpDx = intent.mx || Math.cos(this.facing) * 0.6; this.jumpDy = intent.my || Math.sin(this.facing) * 0.6; this.charging = false; this.charge = 0; world.audio.sfx('dodge'); this.stats.dodges++; }
      else if (intent.dodge && this.cd.dodge <= 0) { this.state = 'dodge'; this.stateT = c.dodge.dur; this.cd.dodge = c.dodge.cd; this.dodgeA = (intent.mx || intent.my) ? Math.atan2(intent.my, intent.mx) : this.facing; this.charging = false; this.charge = 0; world.audio.sfx('dodge'); this.stats.dodges++; world.trail(this); }
      else if (this.chakra && intent.sword && this.cd.sword <= 0 && this.state === 'idle') { this.state = 'sword'; this.stateT = 0.3; this.cd.sword = 0.55; this.facing = this.aim; this.swingSide = 0; world.addHit({ owner: this, team: this.team, x: this.x, y: this.y, r: 120, dmg: 22, knock: 650, life: 0.12, parry: true, kind: 'chakra', ring: true, inner: 10, breakShield: true }); world.audio.sfx('gada'); world.audio.sfx('sword'); world.shake(6); world.slashes.push({ x: this.x, y: this.y, a: this.aim, i: 0, life: 0.2, r: 125, color: '#F4C95D', full: true }); }
      else if (this.chakra && intent.gada && this.cd.gada <= 0 && this.state === 'idle') { this.state = 'gada'; this.stateT = 0.7; this.cd.gada = 2.2; this.facing = this.aim; this._chakraSlam = 0.4; }
      else if (intent.gada && !this.weaponsBroken.gada && this.cd.gada <= 0 && this.state === 'idle' && !this.chakra) { this.state = 'gada'; this.stateT = c.gada.windup + 0.25; this.cd.gada = c.gada.cd; this.facing = this.aim; this._gadaPending = c.gada.windup; this.charging = false; }
      else if (!this.chakra && intent.sword && this.cd.sword <= 0 && (this.state === 'idle' || this.state === 'sword')) {
        const i = this.combo % c.sword.comboDmg.length; this.combo++; this.comboT = c.sword.comboWindow; this.cd.sword = c.sword.cd; this.state = 'sword'; this.stateT = 0.18; this.facing = this.aim; this.swingSide = i;
        world.addHit({ owner: this, team: this.team, x: this.x + Math.cos(this.aim) * c.sword.range * 0.55, y: this.y + Math.sin(this.aim) * c.sword.range * 0.55, r: c.sword.range * 0.8, dmg: c.sword.comboDmg[i], knock: i === c.sword.comboDmg.length - 1 ? 220 : 60, life: 0.1, parry: true, kind: 'sword' });
        world.audio.sfx('sword'); world.slash(this, i); this.charging = false; this.charge = 0;
      }
      if (!this.weaponsBroken.bow && !this.chakra && this.state === 'idle') {
        if (intent.bowHeld && this.cd.bow <= 0 && this.arrows <= 0) { this.noArrowT -= dt; if (this.noArrowT <= 0) { this.noArrowT = 1.5; world.floatText(this.x, this.y - 50, 'बाण समाप्त', '#FF7A2A'); world.audio.sfx('ui'); } }
        else if (intent.bowHeld && this.cd.bow <= 0) { if (!this.charging) { this.charging = true; this.charge = 0; world.audio.sfx('bowdraw'); } this.charge = Math.min(1, this.charge + dt / c.bow.chargeTime); this.facing = this.aim; if (this.charge >= 1 && this.arrows < 2) this.charge = 0.99; }
        else if (this.charging) { const ch = this.charge >= 1; this.arrows -= ch ? 2 : 1; world.addProjectile({ owner: this, team: this.team, x: this.x + Math.cos(this.aim) * 26, y: this.y + Math.sin(this.aim) * 26, vx: Math.cos(this.aim) * c.bow.speed * (ch ? 1.25 : 1), vy: Math.sin(this.aim) * c.bow.speed * (ch ? 1.25 : 1), dmg: ch ? c.bow.chargedDmg : c.bow.dmg, pierce: ch ? 2 : 0, life: 1.4, kind: 'arrow', charged: ch }); this.cd.bow = c.bow.cd; this.charging = false; this.charge = 0; world.audio.sfx('arrow'); }
      } else { this.charging = false; }
    }
    if (this._chakraSlam !== undefined) { this._chakraSlam -= dt; if (this._chakraSlam <= 0) { this._chakraSlam = undefined; world.addHit({ owner: this, team: this.team, x: this.x + Math.cos(this.facing) * 60, y: this.y + Math.sin(this.facing) * 60, r: 150, dmg: 55, knock: 1000, life: 0.15, kind: 'chakra', breakShield: true, parry: true }); world.audio.sfx('bhoomi'); world.shake(16); world.burst(this.x + Math.cos(this.facing) * 60, this.y + Math.sin(this.facing) * 60, '#F4C95D', 30, 320, true); world.floatText(this.x, this.y - 70, 'चक्र-प्रहार!', '#F4C95D'); } }
    if (this.state === 'gada' && this._gadaPending !== undefined) { this._gadaPending -= dt; if (this._gadaPending <= 0) { this._gadaPending = undefined; world.addHit({ owner: this, team: this.team, x: this.x + Math.cos(this.facing) * c.gada.range * 0.5, y: this.y + Math.sin(this.facing) * c.gada.range * 0.5, r: c.gada.range * 0.9, dmg: c.gada.dmg, knock: c.gada.knock, life: 0.12, kind: 'gada', breakShield: true, parry: true }); world.audio.sfx('gada'); world.shake(7); world.burst(this.x + Math.cos(this.facing) * 60, this.y + Math.sin(this.facing) * 60, '#E0B072', 14, 220); } }
    this.slow = Math.max(0, (this.slow || 0) - dt);
    this.x += this.vx * dt; this.y += this.vy * dt; integrateImpulse(this, dt); world.clampToArena(this);
  }
}

export class Soldier {
  constructor(x, y, type = 'melee', scale = 1) {
    this.id = _id++; this.x = x; this.y = y; this.vx = 0; this.vy = 0; this.r = 17; this.type = type; this.team = 'kaurava';
    this.maxHp = (type === 'archer' ? 26 : type === 'shield' ? 55 : 32) * scale; this.hp = this.maxHp; this.speed = type === 'archer' ? 120 : type === 'shield' ? 95 : 150;
    this.state = 'approach'; this.t = rnd(0.2, 1.2); this.facing = 0; this.alive = true; this.hurtT = 0; this.shield = type === 'shield'; this.walkT = rnd(0, 6); this.stun = 0; this.isBoss = false;
    this.tele = 0; this.color = type === 'archer' ? '#6B4D8A' : type === 'shield' ? '#5C4A2E' : '#7A2E2E';
  }
  takeDamage(d, world, hit) {
    if (!this.alive) return;
    if (this.shield && hit && !hit.breakShield && hit.kind !== 'astra') { const a = Math.atan2(hit.y - this.y, hit.x - this.x); if (Math.abs(angDiff(this.facing, a)) < 1.1) { world.audio.sfx('clash'); world.burst(this.x + Math.cos(a) * 16, this.y + Math.sin(a) * 16, '#FFE8A3', 6, 120); return; } }
    if (world.mods) d *= world.mods.enemyDamageTakenMult;
    this.hp -= d; this.hurtT = 0.2; world.blood(this.x, this.y, hit ? hit.x : this.x, hit ? hit.y : this.y + 10, hit && hit.kind === 'gada' ? 1.6 : 1); world.audio.sfx('hit');
    const AK = RULES.physics.arrowKnock; const kn = hit ? (hit.knock || (hit.kind === 'arrow' ? (hit.charged ? AK.soldierCharged : AK.soldier) : 0)) : 0; // arrows carry momentum too
    if (kn) { if (hit.kind === 'arrow' && hit.vx !== undefined) impulse(this, hit.vx, hit.vy, kn); else impulse(this, this.x - hit.x, this.y - hit.y, kn); }
    if (this.hp <= 0) { this.alive = false; world.onEnemyDead(this); }
  }
  update(dt, world) {
    if (!this.alive) return; this.hurtT = Math.max(0, this.hurtT - dt); this.stun = Math.max(0, this.stun - dt); this.t -= dt;
    const tgt = world.nearestHero(this.x, this.y); if (!tgt) return;
    const dx = tgt.x - this.x, dy = tgt.y - this.y, d = Math.hypot(dx, dy); const a = Math.atan2(dy, dx);
    if (this.stun > 0) { this.vx *= dp(0.85, dt); this.vy *= dp(0.85, dt); }
    else if (this.type === 'archer') {
      this.facing = a; const want = 300; const dir = d < want - 40 ? -1 : d > want + 40 ? 1 : 0; this.vx = lerp(this.vx, Math.cos(a) * dir * this.speed, ap(0.2, dt)); this.vy = lerp(this.vy, Math.sin(a) * dir * this.speed, ap(0.2, dt));
      if (this.t <= 0) { this.state = 'tele'; this.tele = 0.6; this.t = rnd(2.2, 3.4); }
      if (this.state === 'tele') { this.tele -= dt; this.vx *= dp(0.7, dt); this.vy *= dp(0.7, dt); if (this.tele <= 0) { this.state = 'approach'; world.addProjectile({ owner: this, team: 'kaurava', x: this.x, y: this.y, vx: Math.cos(a) * 420, vy: Math.sin(a) * 420, dmg: 5, life: 1.6, kind: 'arrow' }); world.audio.sfx('arrow'); } }
    } else {
      this.facing = a; this.walkT += dt * 8;
      if (this.state === 'approach') { const hasToken = (world.attacking || 0) < (world.attackTokens || 2); if (d > 52) { this.vx = lerp(this.vx, Math.cos(a) * this.speed, ap(0.2, dt)); this.vy = lerp(this.vy, Math.sin(a) * this.speed, ap(0.2, dt)); } else if (!hasToken && this.t <= 0) { const sa = a + Math.PI / 2 * (this.id % 2 ? 1 : -1); this.vx = lerp(this.vx, Math.cos(sa) * this.speed * 0.6, ap(0.2, dt)); this.vy = lerp(this.vy, Math.sin(sa) * this.speed * 0.6, ap(0.2, dt)); } else { this.vx *= dp(0.6, dt); this.vy *= dp(0.6, dt); if (this.t <= 0 && hasToken) { this.state = 'tele'; this.tele = this.shield ? 0.75 : 0.55; world.attacking = (world.attacking || 0) + 1; } } }
      else if (this.state === 'tele') { this.tele -= dt; this.vx *= dp(0.7, dt); this.vy *= dp(0.7, dt); if (this.tele <= 0) { this.state = 'strike'; this.tele = 0.22; this.t = rnd(1.3, 2.2); world.addHit({ owner: this, team: 'kaurava', x: this.x + Math.cos(a) * 34, y: this.y + Math.sin(a) * 34, r: 34, dmg: this.shield ? 10 : 6, knock: 120, life: 0.1, kind: 'sword' }); world.audio.sfx('sword'); } }
      else if (this.state === 'strike') { this.tele -= dt; this.vx *= dp(0.7, dt); this.vy *= dp(0.7, dt); if (this.tele <= 0) this.state = 'approach'; }
    }
    // separation
    this.x += this.vx * dt; this.y += this.vy * dt; this.vx *= dp(0.9, dt); this.vy *= dp(0.9, dt); integrateImpulse(this, dt); world.clampToArena(this);
  }
}

export class Projectile {
  constructor(p) { Object.assign(this, { pierce: 0, life: 1.5, r: 6, hitSet: new Set(), kind: 'arrow' }, p); this.id = _id++; this.alive = true; this.angle = Math.atan2(this.vy, this.vx); }
  update(dt, world) { this.life -= dt; this.x += this.vx * dt; this.y += this.vy * dt; if (this.life <= 0 || !world.inArena(this.x, this.y, 60)) this.alive = false; }
}

export class Pickup {
  constructor(x, y, kind = 'shard') { this.x = x; this.y = y; this.kind = kind; this.t = 0; this.alive = true; this.life = 16; this.vy = -60; this.id = _id++; }
  update(dt, world) { this.t += dt; this.life -= dt; this.vy += 120 * dt; if (this.vy > 0) this.vy = 0; this.y += this.vy * dt; if (this.life <= 0) this.alive = false;
    for (const h of world.heroes) if (h.alive && Math.hypot(h.x - this.x, h.y - this.y) < h.r + 16) { this.alive = false; world.audio.sfx('pickup');
      if (this.kind === 'quiver') { const n = Math.min(8, h.maxArrows - h.arrows); h.arrows += n; world.burst(this.x, this.y, '#e8d9b0', 10, 120); world.floatText(this.x, this.y - 20, '+' + n + ' बाण', '#e8d9b0'); }
      else { h.heal(h.cfg.shardHeal); h.stats.shards++; world.burst(this.x, this.y, '#F4C95D', 10, 120); world.floatText(this.x, this.y - 20, '+' + h.cfg.shardHeal, '#F4C95D'); } } }
}

export class Particle {
  constructor(x, y, vx, vy, color, life, size, grav = 0, add = false) { this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.color = color; this.life = life; this.maxLife = life; this.size = size; this.grav = grav; this.add = add; }
  update(dt) { this.life -= dt; if (this.landed) return; this.x += this.vx * dt; this.y += this.vy * dt; this.vy += this.grav * dt; const f = dp(0.97, dt); this.vx *= f; this.vy *= f;
    if (this.ground !== undefined && this.vy > 0 && this.y >= this.ground) { this.y = this.ground; this.vx = this.vy = 0; this.landed = true; this.life = Math.min(this.life, 0.6); } }
}
