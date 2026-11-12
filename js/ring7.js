// Ring 7: scripted siege (unwinnable) -> Mitra Smaran -> Satyaki phases A (Bana-jaala) B (Prana-sanchar) C (duel) D (core shatter).
import { RING7, CHARACTERS, BOSSES } from './config.js';
import { Hero, Soldier, Pickup as PickupRef, TAU, rnd, lerp } from './entities.js';
import { Boss } from './bosses.js';

const MAHARATHI = [
  { name: 'द्रोण', look: 'drona', color: '#D9A441', accent: '#FFFFFF', weapon: 'bow' }, { name: 'कृप', look: 'kripa', color: '#2E4A6B', accent: '#CFF4FF', weapon: 'bow' }, { name: 'कर्ण', look: 'karna', color: '#C98A2A', accent: '#FFE8A3', weapon: 'bow' },
  { name: 'अश्वत्थामा', look: 'ashwatthama', color: '#4A5A8B', accent: '#CFF4FF', weapon: 'sword' }, { name: 'बृहद्बल', look: 'brihadbala', color: '#6B4A2B', accent: '#E0B072', weapon: 'sword' }, { name: 'कृतवर्मा', look: 'kritavarma', color: '#5B3A6B', accent: '#8F6CFF', weapon: 'sword' }
];

class Maharathi extends Soldier {
  constructor(def, x, y, idx) { super(x, y, def.weapon === 'bow' ? 'archer' : 'melee', 1); this.def = def; this.look = def.look; this.color = def.color; this.name = def.name; this.r = 24; this.maxHp = 9999; this.hp = 9999; this.speed = 130; this.idx = idx; this.retreat = false; this.accent = def.accent; }
  takeDamage(d, world, hit) { this.hurtT = 0.1; world.burst(this.x, this.y, '#FFFFFF', 4, 100, true);
    if (hit && hit.kind === 'chakra') { this.pushed = (this.pushed || 0) + (hit.dmg >= 50 ? 2 : 1); const a = Math.atan2(this.y - hit.y, this.x - hit.x); this.vx += Math.cos(a) * hit.knock * 0.9; this.vy += Math.sin(a) * hit.knock * 0.9; this.stun = 0.8; world.audio.sfx('clash'); world.floatText(this.x, this.y - 50, this.pushed >= 2 ? this.name + ' पीछे हटा!' : 'धक्का!', '#F4C95D'); if (this.pushed >= 2) { this.retreat = true; if (this.ring7cb) this.ring7cb(this); } }
    else if (Math.random() < 0.15) world.floatText(this.x, this.y - 50, 'अभेद्य', '#FFFFFF'); }
  update(dt, world) {
    if (this.holding && !this.retreat) { this.stun = Math.max(0, this.stun - dt); this.x += this.vx * dt; this.y += this.vy * dt; this.vx *= 0.85; this.vy *= 0.85; this.x = lerp(this.x, this.homeX, 0.05); this.y = lerp(this.y, this.homeY, 0.05); const h = world.heroes[0]; this.facing = Math.atan2(h.y - this.y, h.x - this.x); this.hurtT = Math.max(0, this.hurtT - dt); return; }
    if (this.retreat) { const a = Math.atan2(this.y - world.arena.cy, this.x - world.arena.cx); const tx = world.arena.cx + Math.cos(a) * (world.arena.r - 40), ty = world.arena.cy + Math.sin(a) * (world.arena.r - 40); this.x = lerp(this.x, tx, 0.04); this.y = lerp(this.y, ty, 0.04); this.facing = Math.atan2(world.arena.cy - this.y, world.arena.cx - this.x); return; }
    super.update(dt, world);
  }
}

export class Ring7 {
  constructor(world, game) { this.w = world; this.g = game; this.stage = 'siege'; this.t = 0; this.evT = 0; this.lineIdx = 0; this.abhi = world.heroes[0]; this.satyaki = null; this.boss = null; this.anchors = []; this.nodes = []; this.timer = 0; this.coreReady = false; this.corePress = { a: false, s: false, t: 0 }; this.done = false;
    world.scripted = true; world.decayOn = false; world.phase = 'boss'; world.bossIntroT = 0; this.w.ring7 = this;
    // six maharathis
    MAHARATHI.forEach((d, i) => { const a = i / 6 * TAU - Math.PI / 2; const m = new Maharathi(d, world.arena.cx + Math.cos(a) * 300, world.arena.cy + Math.sin(a) * 300, i); world.enemies.push(m); });
    this.maharathis = world.enemies.slice();
    world.onHeroDown = h => { if (h === this.abhi && this.stage === 'siege') { h.alive = true; h.hp = 0; h.state = 'fallen'; this.fall(); } else if (h === this.satyaki) { this.satyakiDown(); } };
    this.g.ui.setObjective('छह महारथी। बचो... जितना हो सके।');
    this.speak(RING7.siegeLines[0]);
  }
  // which hero the local (non-host) player controls right now
  controlled() { return ['A', 'B', 'C'].includes(this.stage) ? 'satyaki' : 'abhimanyu'; }
  speak(line) { if (!line) return; const c = CHARACTERS[line.who]; const who = line.who === 'enemy' ? (line.text.match(/^([^:]{1,14}):/) || [])[1] || c.name : c.name; this.g.ui.say(who, line.text.replace(/^[^:]{1,14}:\s*/, ''), c.color); this.g.voice.say(line.who, line.text, line.id); this.g.netSay(line); }
  update(dt, intents) {
    this.t += dt; this.evT += dt;
    if (this.stage === 'siege') {
      // escalating scripted breakdown
      if (this.t > 14 && !this._e1) { this._e1 = true; this.speak(RING7.siegeLines[1]); }
      if (this.t > 22 && !this.abhi.weaponsBroken.bow) { this.abhi.weaponsBroken.bow = true; this.abhi.charging = false; this.g.ui.toast('धनुष की डोरी कटी!', 2500); this.w.audio.sfx('shatter'); this.w.shake(10); }
      if (this.t > 30 && !this.abhi.shieldBroken) { this.abhi.shieldBroken = true; this.abhi.blocking = false; this.g.ui.toast(document.documentElement.lang === 'en' ? 'The shield splits!' : 'ढाल टूटी!', 2500); this.w.audio.sfx('shatter'); this.w.shake(8); }
      if (this.t > 38 && !this.abhi.weaponsBroken.gada) { this.abhi.weaponsBroken.gada = true; this.g.ui.toast('रथ टूटा। गदा गिरी।', 2500); this.w.audio.sfx('rumble'); this.w.shake(10); this.speak(RING7.siegeLines[2]); }
      if (this.t > 30) this.abhi.hp -= dt * (this.t > 50 ? 4 : 1.5); // the siege is unwinnable by design
      if (this.abhi.hp <= 0 && this.abhi.state !== 'fallen') { this.abhi.hp = 0; this.abhi.state = 'fallen'; this.fall(); }
      for (const m of this.maharathis) m.speed = 130 + this.t * 1.5;
    }
    else if (this.stage === 'fallen') { /* waiting for Mitra Smaran */ this.abhi.state = 'fallen'; }
    else if (this.stage === 'A') {
      this.timer -= dt; this.g.ui.setObjective('बाण-जाल: तीन चमकते बिंदुओं पर बाण मारो  ' + this.anchors.filter(a => a.lit).length + '/3   ⏳ ' + Math.ceil(this.timer));
      for (const p of this.w.projectiles) if (p.team === 'pandava') for (const a of this.anchors) if (!a.lit && Math.hypot(p.x - a.x, p.y - a.y) < 34) { a.lit = true; p.alive = false; this.w.audio.sfx('bind'); this.w.burst(a.x, a.y, '#7FE3FF', 20, 200, true); this.w.floatText(a.x, a.y - 30, 'बद्ध!', '#7FE3FF'); }
      // Durmasena stalks Abhimanyu slowly
      const b = this.boss; const a = Math.atan2(this.abhi.y - b.y, this.abhi.x - b.x); b.facing = a; b.x += Math.cos(a) * 18 * dt; b.y += Math.sin(a) * 18 * dt;
      if (this.anchors.every(x => x.lit)) this.toB();
      else if (this.timer <= 0) { this.g.ui.toast('दुर्मसेन की गदा उठी — पुनः प्रयास!', 2200); this.resetA(); }
    }
    else if (this.stage === 'B') {
      this.timer -= dt; const next = this.nodes.find(n => !n.hit); this.g.ui.setObjective('प्राण-संचार: मंत्र-चक्र के ' + (8 - this.nodes.filter(n => n.hit).length) + ' बिंदु क्रम से पार करो  ⏳ ' + Math.ceil(this.timer));
      if (next && Math.hypot(this.satyaki.x - next.x, this.satyaki.y - next.y) < 30) { next.hit = true; this.w.audio.sfx('pickup'); this.w.burst(next.x, next.y, '#B4FFD0', 14, 160, true); this.abhi.hp = Math.min(this.abhi.maxHp * 0.5, this.abhi.hp + this.abhi.maxHp * 0.0625); }
      if (!next) this.toC(); else if (this.timer <= 0) { this.g.ui.toast('जाल टूट गया — पहले बाँधो!', 2200); this.resetA(); }
    }
    else if (this.stage === 'C') { this.abhi.x = lerp(this.abhi.x, this.w.arena.cx - 300, 0.03); this.abhi.y = lerp(this.abhi.y, this.w.arena.cy + 200, 0.03); this.abhi.invuln = 1; if (this.boss && !this.boss.alive && !this.coreReady) this.toW(); }
    else if (this.stage === 'W0') { // walk to the wreck and lift the wheel
      const wk = this.wreck; const near = Math.hypot(this.abhi.x - wk.x, this.abhi.y - wk.y) < 90; const ia = intents[0] || {};
      this.g.ui.setObjective(near ? 'रथ-चक्र उठाओ — E / अस्त्र बटन' : 'टूटे रथ के पास जाओ — पहिया उठाओ');
      if (near && (ia.astra || ia.act)) { this.abhi.chakra = true; this.abhi.hp = Math.max(this.abhi.hp, this.abhi.maxHp * 0.6); this.w.audio.sfx('unlock'); this.w.burst(wk.x, wk.y, '#F4C95D', 30, 260, true); this.w.flash = 0.5; this.stage = 'W1'; this.speak(RING7.chakraLines[0]); setTimeout(() => this.speak(RING7.chakraLines[1]), 4200); this.g.ui.toast('रथ-चक्र: वार = चक्र-घुमाव (चारों ओर धक्का) · बदलो = चक्र-प्रहार', 5000); }
      if (this.abhi.hp < this.abhi.maxHp * 0.15) this.abhi.hp = this.abhi.maxHp * 0.15; // scripted pressure, not a fail state
    }
    else if (this.stage === 'W1') { const left = this.encirclers.filter(m => !m.retreat).length + this.w.enemies.filter(e => e.alive && !e.def).length; this.g.ui.setObjective('घेरा तोड़ो: चक्र से सबको पीछे धकेलो  (' + left + ' शेष)'); if (left === 0) this.toK(); if (this.abhi.hp < this.abhi.maxHp * 0.1) this.abhi.hp = this.abhi.maxHp * 0.1; }
    else if (this.stage === 'K') {
      const b = this.boss; if (!b) return; this.g.ui.setObjective('धनुर्युद्ध: कर्ण — ' + Math.ceil(b.hpPct * 100) + '%  (कुछ बाण वह हवा में काटेगा)');
      if (this.abhi.arrows < 6 && !this._quiverT) { this._quiverT = 6; this.w.pickups.push(new PickupRef(this.abhi.x + 80, this.abhi.y, 'quiver')); } if (this._quiverT) { this._quiverT -= dt; if (this._quiverT <= 0) this._quiverT = 0; }
      if (!this._kBeat1 && b.hpPct <= 0.5) { this._kBeat1 = true; this.karnaWheelBeat(); }
      if (!this._kBeat2 && b.hpPct <= 0.15) { this._kBeat2 = true; this.karnaBowBreak(); }
      if (this.abhi.hp < this.abhi.maxHp * 0.12) this.abhi.hp = this.abhi.maxHp * 0.12;
    }
    else if (this.stage === 'W1b') { const wk = this.wreck; const near = Math.hypot(this.abhi.x - wk.x, this.abhi.y - wk.y) < 90; const ia = intents[0] || {}; this.g.ui.setObjective(near ? 'रथ-चक्र फिर उठाओ — E' : 'पहिये के पास लौटो'); if (near && (ia.astra || ia.act)) { this.abhi.chakra = true; this.abhi.weaponsBroken.bow = true; this.w.audio.sfx('unlock'); this.w.burst(wk.x, wk.y, '#F4C95D', 30, 260, true); this.speak(RING7.karnaLines[5]); this.toW2(); } }
    else if (this.stage === 'W2') { const left = this.pashHolders.filter(m => !m.retreat).length; this.g.ui.setObjective('सात्यकि को छुड़ाओ: तीनों पाश-धारियों पर चक्र-प्रहार  (' + left + ' शेष)'); this.satyaki.state = 'bound'; this.satyaki.invuln = 1; this.satyaki.x = lerp(this.satyaki.x, this.pashCenter.x, 0.1); this.satyaki.y = lerp(this.satyaki.y, this.pashCenter.y, 0.1); if (left === 0) this.toD(); if (this.abhi.hp < this.abhi.maxHp * 0.1) this.abhi.hp = this.abhi.maxHp * 0.1; }
    else if (this.stage === 'D') {
      const n = this.w.nabhi; const near = h => h && Math.hypot(h.x - n.x, h.y - n.y) < 110;
      const ia = intents[0] || {}, is = intents[1] || {};
      if (near(this.abhi) && (ia.astra || ia.act)) { this.corePress.a = true; this.corePress.t = 3; this.w.floatText(this.abhi.x, this.abhi.y - 50, 'हिम-अस्त्र!', '#CFF4FF'); }
      if (near(this.satyaki) && (is.astra || is.act || is.gada)) { this.corePress.s = true; this.corePress.t = 3; this.w.floatText(this.satyaki.x, this.satyaki.y - 50, 'गदा!', '#B4FFD0'); }
      if (this.g.coop.mode !== 'host') { this.satyaki.x = lerp(this.satyaki.x, n.x + 70, 0.04); this.satyaki.y = lerp(this.satyaki.y, n.y + 60, 0.04); if (this.corePress.a) this.corePress.s = true; } // solo/hot-seat: Satyaki walks in on his own; one press is both
      this.corePress.t -= dt; if (this.corePress.t <= 0) { this.corePress.a = this.corePress.s = false; }
      this.g.ui.setObjective('नाभि-स्तंभ के पास जाओ। अभिमन्यु: अस्त्र (E)  ' + (this.corePress.a ? '✓' : '…') + '   सात्यकि: वार  ' + (this.corePress.s ? '✓' : '…'));
      if (this.corePress.a && this.corePress.s && !this.done) this.shatter();
    }
    if (['W0', 'W1', 'K', 'W1b', 'W2'].includes(this.stage)) { this.satyaki.state = 'bound'; this.satyaki.invuln = 1; this.satyaki.stateT = 9; }
    const abhiActs = ['siege', 'W0', 'W1', 'K', 'W1b', 'W2', 'D'].includes(this.stage); if (!abhiActs) this.abhi.invuln = 1; if (this.stage === 'C') { this.abhi.vx = this.abhi.vy = 0; }
  }
  fall() { this.stage = 'fallen'; this.abhi.state = 'fallen'; this.w.slowT = 2.5; this.w.audio.playMusic('none'); this.w.audio.sfx('die'); this.w.shake(16); for (const m of this.maharathis) { m.retreat = true; } this.g.ui.setObjective(''); this.g.onFallen(); }
  // ---- Satyaki enters
  startCoop(satyaki) {
    this.satyaki = satyaki; satyaki.x = this.w.arena.cx; satyaki.y = this.w.arena.cy + 360; this.w.heroes.push(satyaki); this.w.decayOn = false;
    for (const m of this.maharathis) m.retreat = true;
    this.boss = new Boss('durmasena', this.w.arena.cx, this.w.arena.cy - 60, this.w); this.boss.invuln = true; this.boss.move = null; this.w.boss = this.boss; this.w.bossIntroT = 0;
    this.w.burst(satyaki.x, satyaki.y, '#5FD88A', 40, 300, true); this.w.audio.sfx('naag'); this.w.audio.playMusic('siege', 132);
    this.speak(RING7.satyakiEntry[0]); setTimeout(() => this.speak(RING7.satyakiEntry[1]), 3500);
    this.resetA();
  }
  resetA() { this.stage = 'A'; this.timer = 30; this.anchors = [0, 1, 2].map(i => { const a = i / 3 * TAU + 0.5; return { x: this.boss.x + Math.cos(a) * 95, y: this.boss.y + Math.sin(a) * 95, lit: false }; }); this.boss.x = this.w.arena.cx; this.boss.y = this.w.arena.cy - 60; this.boss.stun = 0; this.boss.bound = 0; this.boss.invuln = true; this.boss.move = null; this.abhi.x = this.w.arena.cx; this.abhi.y = this.w.arena.cy + 140; this.satyaki.hp = this.satyaki.maxHp; this.satyaki.alive = true; this.satyaki.state = 'idle'; this.w.extraDraw = this.anchorDraw(); }
  anchorDraw() { return [{ y: -1e9, custom: (ctx, t) => { for (const a of this.anchors) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a.lit ? 0.9 : 0.5 + 0.4 * Math.sin(t * 6); ctx.strokeStyle = a.lit ? '#7FE3FF' : '#FFFFFF'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(a.x, a.y, 24 + Math.sin(t * 4) * 3, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(a.x, a.y, 6, 0, TAU); ctx.fillStyle = ctx.strokeStyle; ctx.fill(); ctx.restore(); } if (this.anchors.some(a => a.lit)) { ctx.save(); ctx.strokeStyle = '#7FE3FF'; ctx.lineWidth = 2; ctx.globalAlpha = 0.8; const lit = this.anchors.filter(a => a.lit); for (let i = 0; i < lit.length; i++) for (let j = i + 1; j < lit.length; j++) { ctx.beginPath(); ctx.moveTo(lit[i].x, lit[i].y); for (let k = 1; k <= 8; k++) { const u = k / 8; ctx.lineTo(lerp(lit[i].x, lit[j].x, u) + rnd(-6, 6), lerp(lit[i].y, lit[j].y, u) + rnd(-6, 6)); } ctx.stroke(); } ctx.restore(); } for (const n of this.nodes) { if (n.hit) continue; const first = this.nodes.find(x => !x.hit) === n; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = first ? 0.9 : 0.35; ctx.fillStyle = first ? '#B4FFD0' : '#5FD88A'; ctx.beginPath(); ctx.arc(n.x, n.y, first ? 14 + Math.sin(t * 8) * 3 : 9, 0, TAU); ctx.fill(); ctx.font = '14px serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(n.i + 1, n.x, n.y + 5); ctx.restore(); } } }]; }
  toB() { this.stage = 'B'; this.timer = 22; this.boss.bound = 99; this.boss.invuln = true; this.w.audio.sfx('bind'); this.w.flash = 0.6; this.speak(RING7.dronaRetreat[0]); setTimeout(() => this.speak(RING7.healLines[0]), 5000);
    this.nodes = [...Array(8)].map((_, i) => { const a = i / 8 * TAU - Math.PI / 2; return { i, x: this.abhi.x + Math.cos(a) * 90, y: this.abhi.y + Math.sin(a) * 90, hit: false }; }); }
  toC() { this.stage = 'C'; this.nodes = []; this.anchors = []; this.w.extraDraw = null; this.abhi.hp = Math.max(this.abhi.hp, this.abhi.maxHp * 0.5); this.abhi.state = 'idle'; this.w.audio.sfx('heal'); this.w.burst(this.abhi.x, this.abhi.y, '#B4FFD0', 30, 220, true); this.speak(RING7.healLines[1]);
    setTimeout(() => { this.boss.bound = 0; this.boss.invuln = false; this.boss.stun = 0.5; this.w.audio.sfx('shatter'); this.w.shake(12); this.speak(RING7.duelLines[0]); this.g.ui.setObjective('द्वंद्व: सात्यकि बनाम दुर्मसेन'); this.g.ui.toast('दुर्मसेन मुक्त! अब द्वंद्व।', 2500); }, 4000); }
  satyakiDown() { if (this.stage !== 'C') return; this.w.audio.sfx('die'); this.g.ui.toast('सात्यकि गिरा — द्वंद्व पुनः (0.5 s)', 1800); setTimeout(() => { this.satyaki.hp = this.satyaki.maxHp; this.satyaki.alive = true; this.satyaki.state = 'idle'; this.satyaki.x = this.w.arena.cx; this.satyaki.y = this.w.arena.cy + 300; this.boss.hp = Math.min(this.boss.maxHp, this.boss.hp + this.boss.maxHp * 0.25); this.boss.rage = false; this.boss.move = null; }, 500); }
  toW() { this.stage = 'W0'; this.g.ui.setRing(this.g.ring7 ? { name: 'सप्तम चक्र', sub: 'व्यूह-नाभि — अभिमन्यु' } : { name: '', sub: '' }); this.g.ui.toast('अब फिर तुम अभिमन्यु हो।', 2500); this.w.extraDraw = null; this.abhi.state = 'idle'; this.abhi.invuln = 0; this.w.audio.sfx('rumble'); this.speak(RING7.pashLines[0]); setTimeout(() => this.speak(RING7.pashLines[1]), 4500); setTimeout(() => this.speak(RING7.pashLines[2]), 8500);
    const A = this.w.arena; this.pashCenter = { x: A.cx + 230, y: A.cy - 110 }; this.satyaki.state = 'bound'; this.satyaki.x = this.pashCenter.x; this.satyaki.y = this.pashCenter.y;
    this.pashHolders = this.maharathis.filter(m => ['कृतवर्मा', 'अश्वत्थामा', 'कृप'].includes(m.name)); this.encirclers = this.maharathis.filter(m => ['कर्ण', 'बृहद्बल'].includes(m.name)); const drona = this.maharathis.find(m => m.name === 'द्रोण'); if (drona) { drona.retreat = true; }
    this.pashHolders.forEach((m, i) => { const a = i / 3 * TAU - Math.PI / 2; m.retreat = false; m.holding = true; m.pushed = 0; m.x = this.pashCenter.x + Math.cos(a) * 110; m.y = this.pashCenter.y + Math.sin(a) * 110; m.homeX = m.x; m.homeY = m.y; m.ring7cb = () => { this.w.audio.sfx('shatter'); this.w.floatText(this.satyaki.x, this.satyaki.y - 60, 'पाश टूटा!', '#B4FFD0'); }; });
    this.encirclers.forEach((m, i) => { m.retreat = false; m.pushed = 0; m.speed = 160; m.x = this.abhi.x + (i ? 140 : -140); m.y = this.abhi.y - 60; });
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; const s = new Soldier(this.abhi.x + Math.cos(a) * 170, this.abhi.y + Math.sin(a) * 170, i % 3 === 0 ? 'shield' : 'melee', 1.4); this.w.enemies.push(s); }
    this.wreck = { x: this.abhi.x - 60, y: this.abhi.y + 120, r: 90 }; this.w.arena.clamp(this.wreck); this.abhi.weaponsBroken = { bow: true, gada: true };
    this.w.extraDraw = this.wDraw(); }
  toK() { this.stage = 'K'; this.abhi.chakra = false; this.abhi.weaponsBroken = { bow: false, gada: true }; this.abhi.arrows = 36; this.w.extraDraw = this.wDraw();
    this.boss = new Boss('karna2', this.w.arena.cx, this.w.arena.cy - 220, this.w); this.w.boss = this.boss; this.w.bossIntroT = 2.6; this.w.audio.sfx('rumble'); this.w.audio.playMusic('boss', 126);
    const kd = this.boss.def; this.g.sayRaw(kd.intro, kd.accent, 'boss_karna2_intro'); setTimeout(() => this.speak(RING7.karnaLines[0]), 5200);
    this.g.ui.toast('धनुष उठाया! तरकश 36। कर्ण के बाण तलवार से काटो, पूरा खिंचा बाण चलाओ।', 5000); this.g.ui.setRing({ name: 'सप्तम चक्र', sub: 'धनुर्युद्ध — अंगराज कर्ण' }); }
  karnaWheelBeat() { const b = this.boss; b.stun = 9; b.move = null; b.tele = null; this.w.slowT = 1.5; this.w.flash = 0.7; this.w.audio.sfx('shatter'); this.w.shake(14); this.w.burst(b.x + 40, b.y + 20, '#E0B072', 40, 300); this.w.floatText(b.x, b.y - 80, 'रथ का पहिया टूटा!', '#F4C95D'); this.abhi.invuln = 9; this.abhi.state = 'pranam'; this.abhi.stateT = 8.5;
    setTimeout(() => this.speak(RING7.karnaLines[1]), 900); setTimeout(() => this.speak(RING7.karnaLines[2]), 7400); setTimeout(() => { this.speak(RING7.karnaLines[3]); this.abhi.state = 'idle'; this.abhi.invuln = 0.5; this.g.ui.toast('युद्ध पुनः आरंभ!', 2000); }, 12500); b.stun = 13; }
  karnaBowBreak() { const b = this.boss; b.invuln = true; b.stun = 99; b.move = null; b.tele = null; this.w.slowT = 1.6; this.w.flash = 0.6; this.w.audio.sfx('shatter'); this.w.shake(12); this.w.burst(b.x, b.y - 20, '#FFE8A3', 40, 320, true); this.w.floatText(b.x, b.y - 80, 'धनुष टूटा!', '#F4C95D');
    this.g.sayRaw(b.def.defeat, '#F1E7D0', 'boss_karna2_defeat'); setTimeout(() => this.speak(RING7.karnaLines[4]), 6500);
    setTimeout(() => { b.alive = false; b.defeated = true; this.w.boss = null; this.w.burst(b.x, b.y, '#FFE8A3', 20, 200, true); this.stage = 'W1b'; this.wreck = { x: this.abhi.x + 60, y: this.abhi.y + 110, r: 90 }; this.w.arena.clamp(this.wreck); this.g.ui.setRing({ name: 'सप्तम चक्र', sub: 'व्यूह-नाभि — अभिमन्यु' }); }, 11000); }
  toW2() { this.stage = 'W2'; this.w.audio.sfx('unlock'); this.speak(RING7.freeLines[0]); this.g.ui.toast('घेरा टूटा। अब सात्यकि की ओर →', 2500); }
  wDraw() { return [{ y: -1e9, custom: (ctx, t) => {
    // wreck (Abhimanyu's broken chariot) with the loose wheel glowing until lifted
    const wk = this.wreck; ctx.save(); ctx.translate(wk.x, wk.y); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, 10, 60, 18, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#3a2416'; ctx.save(); ctx.rotate(-0.4); ctx.fillRect(-40, -26, 70, 36); ctx.strokeStyle = '#D9A441'; ctx.lineWidth = 2; ctx.strokeRect(-40, -26, 70, 36); ctx.restore(); ctx.fillStyle = '#C9922A'; ctx.beginPath(); ctx.moveTo(26, -40); ctx.lineTo(26, -90); ctx.lineTo(60, -78); ctx.lineTo(26, -66); ctx.fill();
      if (!this.abhi.chakra) { ctx.save(); ctx.translate(-50, 6); ctx.rotate(t * 0.3); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 44); g.addColorStop(0, 'rgba(244,201,93,0.5)'); g.addColorStop(1, 'rgba(244,201,93,0)'); ctx.fillStyle = g; ctx.fillRect(-44, -44, 88, 88); ctx.restore(); ctx.save(); ctx.translate(-50, 6); ctx.rotate(0.3); ctx.strokeStyle = '#6b4a2b'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 24, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#F4C95D'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.strokeStyle = '#8a6a46'; ctx.lineWidth = 3; for (let i = 0; i < 8; i++) { const an = i / 8 * TAU; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an) * 22, Math.sin(an) * 22); ctx.stroke(); } ctx.restore(); ctx.font = '13px "Mukta", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#F4C95D'; ctx.fillText('रथ-चक्र', -50, 48); }
      ctx.restore();
    // pash ropes from holders to Satyaki
    if (this.stage === 'W0' || this.stage === 'W1' || this.stage === 'W2') for (const m of this.pashHolders) if (!m.retreat) { ctx.save(); ctx.strokeStyle = '#B088FF'; ctx.lineWidth = 3; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.moveTo(m.x, m.y - 10); const mx = (m.x + this.satyaki.x) / 2, my = (m.y + this.satyaki.y) / 2 + 20 + Math.sin(t * 5) * 4; ctx.quadraticCurveTo(mx, my, this.satyaki.x, this.satyaki.y - 10); ctx.stroke(); ctx.restore(); }
  } }]; }
  toD() { this.stage = 'D'; this.abhi.chakra = false; this.satyaki.state = 'idle'; this.satyaki.invuln = 0; this.w.extraDraw = null; for (const m of this.maharathis) m.retreat = true; for (const e of this.w.enemies) if (e.alive && !e.def) { e.hp = 0; e.alive = false; } this.speak(RING7.freeLines[1]); this.w.burst(this.satyaki.x, this.satyaki.y, '#B4FFD0', 30, 240, true); this.w.audio.sfx('heal'); this.coreReady = true; this.w.phase = 'boss'; this.w.nabhi = { x: this.w.arena.cx, y: this.w.arena.cy - 40, hp: 1, maxHp: 1 }; this.abhi.astra = 'him'; this.abhi.astraUsed = false; setTimeout(() => { this.w.audio.sfx('unlock'); this.speak(RING7.coreLines[0]); this.g.ui.toast('नाभि-स्तंभ प्रकट! पास जाओ, E दबाओ।', 3000); }, 3500); }
  shatter() { this.done = true; this.w.astraFx = { key: 'him', t: 0, dur: 3, x: this.abhi.x, y: this.abhi.y, tx: this.w.nabhi.x, ty: this.w.nabhi.y, color: '#CFF4FF', glow: '#FFFFFF' }; this.w.audio.sfx('him'); this.w.slowT = 2.5; this.w.flash = 1;
    setTimeout(() => { this.w.audio.sfx('shatter'); this.w.audio.sfx('rumble'); this.w.shake(30); this.w.nabhi.hp = 0; this.w.burst(this.w.nabhi.x, this.w.nabhi.y - 60, '#FFFFFF', 80, 400, true); this.speak(RING7.coreLines[1]); }, 1800);
    setTimeout(() => this.g.onVictory(), 6500); }
}
