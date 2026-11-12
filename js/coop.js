// Co-op over WebRTC (PeerJS). Host = Abhimanyu's device, authoritative. Friend = Satyaki, sends inputs, receives snapshots.
// All inbound messages are schema-checked and rate-limited; names are length-capped. Nothing else leaves the device.
import { makeArena } from './world.js';
const ROOM_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';
export function makeRoom() { const a = new Uint8Array(10); crypto.getRandomValues(a); return 'cv' + Array.from(a, v => ROOM_CHARS[v % ROOM_CHARS.length]).join(''); }
export function joinLink(room) { const u = new URL(location.href); u.hash = 'join=' + room; return u.toString(); }
export function cleanName(n) { return String(n || '').replace(/[^\p{L}\p{N} _.-]/gu, '').slice(0, 18) || 'मित्र'; }
const num = (v, lo, hi) => typeof v === 'number' && isFinite(v) ? Math.max(lo, Math.min(hi, v)) : 0;
// one-shot presses are latched until the host consumes them; held buttons are plain state
export const ONE_SHOT = ['attack', 'switchW', 'jump', 'dodge', 'astra', 'act', 'sword', 'gada', 'bowPressed'];
export const HELD = ['attackHeld', 'block', 'bowHeld'];
const WEAPONS = ['sword', 'bow', 'gada'];
export function cleanIntent(i) { if (!i || typeof i !== 'object') return null; const o = { mx: num(i.mx, -1, 1), my: num(i.my, -1, 1), aimAngle: typeof i.aimAngle === 'number' && isFinite(i.aimAngle) ? i.aimAngle : undefined, weaponSel: WEAPONS.includes(i.weaponSel) ? i.weaponSel : undefined, drag: Array.isArray(i.drag) ? { x: num(i.drag[0], -1e4, 1e4), y: num(i.drag[1], -1e4, 1e4), down: !!i.drag[2] } : null }; for (const k of ONE_SHOT) o[k] = !!i[k]; for (const k of HELD) o[k] = !!i[k]; return o; }

async function loadPeer() {
  if (window.Peer) return window.Peer;
  await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'vendor/peerjs.min.js'; s.onload = res; s.onerror = () => rej(new Error('peerjs load failed')); document.head.appendChild(s); });
  return window.Peer;
}
const loadPeerLoose = loadPeer;

export class Host {
  constructor(onEvent) { this.on = onEvent; this.conn = null; this.peer = null; this.room = null; this.friendName = null; this.intent = null; this.lastIn = 0; this._msgCount = 0; this._msgWin = 0; this.ready = false; }
  async open() {
    const Peer = await loadPeerLoose(); this.room = makeRoom();
    this.peer = new Peer(this.room, { debug: 0 });
    await new Promise((res, rej) => { this.peer.on('open', res); this.peer.on('error', e => { if (!this.ready) rej(e); else this.on('error', e); }); setTimeout(() => rej(new Error('signalling timeout')), 12000); });
    this.ready = true;
    this.peer.on('connection', c => { if (this.conn) { c.close(); return; } this.conn = c; c.on('data', d => this._recv(d)); c.on('close', () => { this.conn = null; this.intent = null; this.on('left'); }); c.on('open', () => this.on('joined')); });
    return this.room;
  }
  _recv(d) {
    const now = performance.now(); if (now - this._msgWin > 1000) { this._msgWin = now; this._msgCount = 0; } if (++this._msgCount > 150) return; // rate limit
    if (!d || typeof d !== 'object') return;
    if (d.t === 'hello') { this.friendName = cleanName(d.name); this.on('hello', this.friendName); }
    else if (d.t === 'in') { const i = cleanIntent(d.i); if (i) { const prev = this.intent; if (prev) { for (const k of ONE_SHOT) i[k] = i[k] || prev[k]; if (!i.weaponSel) i.weaponSel = prev.weaponSel; } this.intent = i; this.lastIn = now; } }
  }
  send(msg) { if (this.conn && this.conn.open) { try { this.conn.send(msg); } catch (e) { } } }
  takeIntent() { const i = this.intent; if (!i) return null; const out = Object.assign({}, i); const rest = Object.assign({}, i, { weaponSel: undefined }); for (const k of ONE_SHOT) rest[k] = false; this.intent = rest; return out; }
  close() { try { this.conn && this.conn.close(); this.peer && this.peer.destroy(); } catch (e) { } }
}

export class Client {
  constructor(room, name, onEvent) { this.room = room; this.name = cleanName(name); this.on = onEvent; this.conn = null; this.peer = null; this.snap = null; this.open = false; }
  async connect() {
    const Peer = await loadPeerLoose(); this.peer = new Peer({ debug: 0 });
    await new Promise((res, rej) => { this.peer.on('open', res); this.peer.on('error', rej); setTimeout(() => rej(new Error('signalling timeout')), 12000); });
    this.conn = this.peer.connect(this.room, { reliable: false, serialization: 'json' });
    await new Promise((res, rej) => { this.conn.on('open', res); this.conn.on('error', rej); this.peer.on('error', rej); setTimeout(() => rej(new Error('host not found')), 15000); });
    this.open = true; this.conn.send({ t: 'hello', name: this.name });
    this.conn.on('data', d => { if (!d || typeof d !== 'object') return; if (d.t === 's') this.snap = d; else if (d.t === 'ev') this.on('ev', d); });
    this.conn.on('close', () => { this.open = false; this.on('closed'); });
  }
  sendIntent(i) { if (this.conn && this.conn.open) { try { const o = { mx: i.mx, my: i.my, aimAngle: i.aimAngle, weaponSel: i.weaponSel, drag: i.drag ? [i.drag.x, i.drag.y, i.drag.down] : null }; for (const k of ONE_SHOT) o[k] = !!i[k]; for (const k of HELD) o[k] = !!i[k]; this.conn.send({ t: 'in', i: o }); } catch (e) { } } }
  close() { try { this.conn && this.conn.close(); this.peer && this.peer.destroy(); } catch (e) { } }
}

// ---- snapshot (host -> client). Compact arrays.
export function snapshot(world, extra) {
  const H = h => [h.kind, +h.x.toFixed(1), +h.y.toFixed(1), +h.hp.toFixed(1), h.maxHp, +h.facing.toFixed(2), +h.aim.toFixed(2), h.state, h.charging ? 1 : 0, +h.charge.toFixed(2), h.alive ? 1 : 0, +h.walkT.toFixed(1), h.astra || '', h.astraUsed ? 1 : 0, +h.invuln.toFixed(2), +h.hurtT.toFixed(2), h.chakra ? 1 : 0, h.arrows, h.maxArrows, +(h.z || 0).toFixed(1), h.weapon || 'sword', h.blocking ? 1 : 0, h.shieldBroken ? 1 : 0];
  const E = e => [+e.x.toFixed(1), +e.y.toFixed(1), e.type, +e.facing.toFixed(2), +e.walkT.toFixed(1), e.state, e.color, e.clone ? 1 : 0, e.name || '', +e.hp.toFixed(0), e.maxHp, +e.stun.toFixed(1), e.hurtT > 0 ? 1 : 0, e.r];
  const b = world.boss && world.boss.alive ? world.boss : null;
  return { t: 's', ri: world.ringIdx, go: world.arena.gateOpen ? 1 : 0, ph: world.phase, bi: +world.bossIntroT.toFixed(2), vip: world.vipatti ? 1 : 0, fl: +world.flash.toFixed(2), sh: +world.shakeV.toFixed(1), sm: +world.slowmo.toFixed(2),
    h: world.heroes.map(H), e: world.enemies.map(E),
    b: b ? { k: b.key, x: +b.x.toFixed(1), y: +b.y.toFixed(1), hp: +b.hp.toFixed(0), mh: b.maxHp, f: +b.facing.toFixed(2), ph: b.phase, st: +b.stun.toFixed(1), bd: +b.bound.toFixed(1), g: b.guard ? 1 : 0, ht: b.hurtT > 0 ? 1 : 0, wt: +b.walkT.toFixed(1), tele: b.tele, kx: b.extras.kripa ? +b.extras.kripa.x.toFixed(0) : 0, ky: b.extras.kripa ? +b.extras.kripa.y.toFixed(0) : 0, gl: b.extras.glow || 0, rage: b.rage ? 1 : 0 } : null,
    p: world.projectiles.map(p => [+p.x.toFixed(0), +p.y.toFixed(0), +p.angle.toFixed(2), p.kind, p.team === 'pandava' ? 1 : 0, p.charged ? 1 : 0, +p.life.toFixed(1)]),
    pk: world.pickups.map(p => [+p.x.toFixed(0), +p.y.toFixed(0)]), hz: (world.hazards || []).map(h => [h.x, h.y, h.r, +h.life.toFixed(1)]),
    sl: world.slashes.filter(s => s.life > 0.14).map(s => [+s.x.toFixed(0), +s.y.toFixed(0), +s.a.toFixed(2), s.i, s.color]), ft: world.floats.filter(f => f.life > 1.05).map(f => [+f.x.toFixed(0), +f.y.toFixed(0), f.text, f.color]),
    ax: world.astraFx ? { key: world.astraFx.key, t: +world.astraFx.t.toFixed(2), dur: world.astraFx.dur, x: world.astraFx.x, y: world.astraFx.y, tx: world.astraFx.tx, ty: world.astraFx.ty, color: world.astraFx.color, glow: world.astraFx.glow } : null,
    nb: world.nabhi ? { x: world.nabhi.x, y: world.nabhi.y, hp: world.nabhi.hp, maxHp: world.nabhi.maxHp } : null, x: extra || null };
}

// Client-side proxy world that the Renderer can draw. Mutated from snapshots, with local particles/floats.
export function applySnapshot(pw, s, ringDefs, bossDefs, audio) {
  if (pw.ringIdx !== s.ri || !pw._arenaBuilt) { pw.ringIdx = s.ri; pw.arena = makeArena(s.ri); pw._arenaBuilt = true; } pw.arena.gateOpen = !!s.go; pw.ring = ringDefs[s.ri]; pw.phase = s.ph; pw.bossIntroT = s.bi; pw.vipatti = !!s.vip; pw.flash = s.fl; pw.shakeV = s.sh; pw.slowmo = s.sm; audio && audio.setVipatti(!!s.vip);
  pw.heroes = s.h.map(a => ({ kind: a[0], x: a[1], y: a[2], hp: a[3], maxHp: a[4], facing: a[5], aim: a[6], state: a[7], charging: !!a[8], charge: a[9], alive: !!a[10], walkT: a[11], astra: a[12] || null, astraUsed: !!a[13], invuln: a[14], hurtT: a[15], chakra: !!a[16], arrows: a[17], maxArrows: a[18], z: a[19] || 0, weapon: a[20] || 'sword', blocking: !!a[21], shieldBroken: !!a[22], weaponsBroken: {}, r: a[0] === 'satyaki' ? 21 : 20, vx: 0, vy: 0, cfg: { sword: { range: 70 } } }));
  pw.enemies = s.e.map(a => ({ x: a[0], y: a[1], type: a[2], facing: a[3], walkT: a[4], state: a[5], color: a[6], clone: !!a[7], name: a[8], hp: a[9], maxHp: a[10], stun: a[11], hurtT: a[12], r: a[13], alive: true }));
  pw.boss = s.b ? { isBoss: true, alive: true, key: s.b.k, def: bossDefs[s.b.k], x: s.b.x, y: s.b.y, hp: s.b.hp, maxHp: s.b.mh, hpPct: s.b.hp / s.b.mh, facing: s.b.f, phase: s.b.ph, stun: s.b.st, bound: s.b.bd, guard: !!s.b.g, hurtT: s.b.ht, walkT: s.b.wt, tele: s.b.tele, kavach: !!bossDefs[s.b.k].kavach, weapon: bossDefs[s.b.k].weapon, r: bossDefs[s.b.k].radius, extras: { kripa: { x: s.b.kx, y: s.b.ky }, glow: s.b.gl }, rage: !!s.b.rage } : null;
  pw.projectiles = s.p.map(a => ({ x: a[0], y: a[1], angle: a[2], kind: a[3], team: a[4] ? 'pandava' : 'kaurava', charged: !!a[5], life: a[6] }));
  pw.pickups = s.pk.map(a => ({ x: a[0], y: a[1] })); pw.hazards = s.hz.map(a => ({ x: a[0], y: a[1], r: a[2], life: a[3] }));
  for (const a of s.sl) if (!pw._seenSl.has(a.join())) { pw._seenSl.add(a.join()); pw.slashes.push({ x: a[0], y: a[1], a: a[2], i: a[3], life: 0.16, r: 70, color: a[4] }); }
  for (const a of s.ft) if (!pw._seenFt.has(a.join())) { pw._seenFt.add(a.join()); pw.floats.push({ x: a[0], y: a[1], text: a[2], color: a[3], life: 1.1 }); }
  if (pw._seenSl.size > 200) pw._seenSl.clear(); if (pw._seenFt.size > 200) pw._seenFt.clear();
  pw.astraFx = s.ax; pw.nabhi = s.nb; pw.extra = s.x;
}
export function makeProxyWorld(ring) { return { hurtFlash: 0, arena: { kind: 'circle', cx: 700, cy: 450, r: 400, VC: { x: 700, y: 450 }, gate: { x: 700, y: 50 }, bbox: { minX: 180, maxX: 1220, minY: -70, maxY: 970 } }, ring, ringIdx: 0, phase: 'intro', bossIntroT: 0, vipatti: false, flash: 0, shakeV: 0, slowmo: 1, heroes: [], enemies: [], boss: null, projectiles: [], pickups: [], hazards: [], slashes: [], floats: [], particles: [], trails: [], astraFx: null, nabhi: null, extra: null, _seenSl: new Set(), _seenFt: new Set(), canAstra() { return false; },
  tick(dt) { for (const s of this.slashes) s.life -= dt; this.slashes = this.slashes.filter(s => s.life > 0); for (const f of this.floats) { f.life -= dt; f.y -= 30 * dt; } this.floats = this.floats.filter(f => f.life > 0); this.shakeV *= 0.88; } }; }
