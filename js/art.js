// Art module: painted warriors (in-game) and shadow-theatre silhouettes (cinematics). All vector, all procedural.
export const TAU = Math.PI * 2;

// ---------- in-game painted warrior ----------
// o: {x,y,s(scale ~1), facing, walkT, weapon:'sword'|'gada'|'bow'|'shield'|'dual', pal:{skin,cloth,armor,accent,hair}, hurt, cape, mukut:'prince'|'king'|'none', attack:0..1, aimUp}
export function drawWarrior(ctx, o) {
  const dir = Math.cos(o.facing) >= 0 ? 1 : -1; const s = o.s || 1; const p = o.pal; const hurt = !!o.hurt;
  const leg = Math.sin(o.walkT || 0); const bob = Math.abs(Math.cos(o.walkT || 0)) * 1.5;
  ctx.save(); ctx.translate(o.x, o.y); ctx.scale(dir * s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const ink = 'rgba(12,8,14,0.9)';
  const fill = (c, path) => { ctx.fillStyle = hurt ? '#fff' : c; ctx.beginPath(); path(); ctx.closePath(); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.stroke(); };
  // cape (behind)
  if (o.cape) { ctx.fillStyle = hurt ? '#fff' : o.cape; ctx.beginPath(); ctx.moveTo(-10, -26 - bob); ctx.quadraticCurveTo(-26 - leg * 4, -10, -22 - leg * 6, 14); ctx.lineTo(-6, 10); ctx.closePath(); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.stroke(); }
  // legs
  ctx.strokeStyle = ink; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-6, 6); ctx.lineTo(-8 + leg * 7, 22); ctx.moveTo(6, 6); ctx.lineTo(8 - leg * 7, 22); ctx.stroke();
  ctx.strokeStyle = hurt ? '#fff' : p.skin; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-6, 6); ctx.lineTo(-8 + leg * 7, 22); ctx.moveTo(6, 6); ctx.lineTo(8 - leg * 7, 22); ctx.stroke();
  // dhoti
  fill(p.cloth, () => { ctx.moveTo(-12, -4 - bob); ctx.lineTo(12, -4 - bob); ctx.lineTo(15, 12); ctx.lineTo(0, 9); ctx.lineTo(-15, 12); });
  ctx.strokeStyle = p.accent; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-13, 10); ctx.lineTo(0, 7); ctx.lineTo(13, 10); ctx.stroke();
  // belt
  fill(p.accent, () => { ctx.rect(-12, -6 - bob, 24, 4); });
  // torso / armor with gradient
  const g = ctx.createLinearGradient(-12, -28, 12, 0); g.addColorStop(0, shade(p.armor, 35)); g.addColorStop(0.55, p.armor); g.addColorStop(1, shade(p.armor, -45));
  ctx.fillStyle = hurt ? '#fff' : g; ctx.beginPath(); ctx.moveTo(-14, -28 - bob); ctx.lineTo(14, -28 - bob); ctx.lineTo(12, -4 - bob); ctx.lineTo(-12, -4 - bob); ctx.closePath(); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.stroke();
  // chest ornament
  ctx.fillStyle = p.accent; ctx.beginPath(); ctx.moveTo(0, -20 - bob); ctx.lineTo(5, -14 - bob); ctx.lineTo(0, -8 - bob); ctx.lineTo(-5, -14 - bob); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = p.accent; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-13, -24 - bob); ctx.lineTo(13, -24 - bob); ctx.stroke();
  // shoulder pads
  fill(shade(p.armor, 20), () => { ctx.ellipse(-13, -27 - bob, 6, 4, 0, 0, TAU); }); fill(shade(p.armor, 20), () => { ctx.ellipse(13, -27 - bob, 6, 4, 0, 0, TAU); });
  // back arm (holds bow when bow)
  ctx.strokeStyle = ink; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-11, -24 - bob); ctx.lineTo(-15 - leg * 3, -8 - bob); ctx.stroke(); ctx.strokeStyle = hurt ? '#fff' : p.skin; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(-11, -24 - bob); ctx.lineTo(-15 - leg * 3, -8 - bob); ctx.stroke();
  // neck + head
  ctx.fillStyle = hurt ? '#fff' : p.skin; ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -37 - bob, 9, 0, TAU); ctx.fill(); ctx.stroke();
  // hair/helmet
  if (o.mukut === 'none') { ctx.fillStyle = p.hair || '#1a0f0a'; ctx.beginPath(); ctx.arc(0, -39 - bob, 9.5, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); }
  else { // helmet band + crown
    fill(p.armor, () => { ctx.moveTo(-10, -40 - bob); ctx.quadraticCurveTo(0, -52 - bob, 10, -40 - bob); ctx.lineTo(10, -37 - bob); ctx.lineTo(-10, -37 - bob); });
    ctx.fillStyle = p.accent; ctx.fillRect(-10, -40 - bob, 20, 2.5);
    if (o.mukut === 'king') { fill(p.accent, () => { ctx.moveTo(-8, -46 - bob); ctx.lineTo(-4, -58 - bob); ctx.lineTo(0, -48 - bob); ctx.lineTo(4, -60 - bob); ctx.lineTo(8, -46 - bob); }); }
    else if (o.mukut === 'prince') { fill(p.accent, () => { ctx.moveTo(-3, -48 - bob); ctx.lineTo(0, -62 - bob); ctx.lineTo(3, -48 - bob); }); }
    else if (o.mukut === 'crest') { fill(p.accent, () => { ctx.moveTo(-2, -48 - bob); ctx.quadraticCurveTo(10, -70 - bob, 16, -50 - bob); ctx.lineTo(2, -46 - bob); }); }
  }
  // face hint (eye)
  ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(4, -38 - bob, 1.3, 0, TAU); ctx.fill();
  // front arm + weapon
  const atk = o.attack || 0; const armA = o.weapon === 'bow' ? -0.1 : (-0.6 + atk * 1.4);
  ctx.save(); ctx.translate(11, -24 - bob); ctx.rotate(armA);
  ctx.strokeStyle = ink; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(14, 8); ctx.stroke(); ctx.strokeStyle = hurt ? '#fff' : p.skin; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(14, 8); ctx.stroke();
  ctx.translate(14, 8); drawWeapon(ctx, o.weapon, p, atk, o.charge || 0);
  ctx.restore();
  ctx.restore();
}
export function drawWeapon(ctx, w, p, atk = 0, charge = 0) {
  const ink = 'rgba(12,8,14,0.9)';
  if (w === 'sword' || w === 'dual') { ctx.rotate(-0.9 + atk * 1.6); ctx.fillStyle = '#e9e4d6'; ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -2.5); ctx.lineTo(30, -1); ctx.lineTo(34, 0); ctx.lineTo(30, 1); ctx.lineTo(0, 2.5); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = p.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, 6); ctx.stroke(); ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(-4, 0, 2.5, 0, TAU); ctx.fill(); }
  else if (w === 'gada') { ctx.rotate(-1.3 + atk * 1.8); ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(26, 0); ctx.stroke(); ctx.strokeStyle = '#7a5a36'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(26, 0); ctx.stroke(); const g = ctx.createRadialGradient(30, -3, 2, 32, 0, 12); g.addColorStop(0, '#d8cdb8'); g.addColorStop(1, '#5a4a3a'); ctx.fillStyle = g; ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(32, 0, 11, 0, TAU); ctx.fill(); ctx.stroke(); ctx.strokeStyle = p.accent; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(32, 0, 7, 0, TAU); ctx.stroke(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(32 + Math.cos(a) * 11, Math.sin(a) * 11, 2, 0, TAU); ctx.fill(); } }
  else if (w === 'bow') { ctx.rotate(0.2); ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(2, 0, 24, -1.35, 1.35); ctx.stroke(); ctx.strokeStyle = '#a0662e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(2, 0, 24, -1.35, 1.35); ctx.stroke(); ctx.strokeStyle = p.accent; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(2, 0, 24, -0.35, 0.35); ctx.stroke(); const pull = -4 - charge * 16; ctx.strokeStyle = '#f1e7d0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(2 + Math.cos(-1.35) * 24, Math.sin(-1.35) * 24); ctx.lineTo(pull, 0); ctx.lineTo(2 + Math.cos(1.35) * 24, Math.sin(1.35) * 24); ctx.stroke(); if (charge > 0) { ctx.strokeStyle = '#e8d9b0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pull, 0); ctx.lineTo(pull + 34, 0); ctx.stroke(); ctx.fillStyle = p.accent; ctx.beginPath(); ctx.moveTo(pull + 34, -3); ctx.lineTo(pull + 40, 0); ctx.lineTo(pull + 34, 3); ctx.fill(); } }
  else if (w === 'shield') { ctx.rotate(0.1); const g = ctx.createRadialGradient(4, -4, 2, 6, 0, 18); g.addColorStop(0, '#8a5a32'); g.addColorStop(1, '#3a2416'); ctx.fillStyle = g; ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(6, 0, 12, 18, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(6, 0, 8, 13, 0, 0, TAU); ctx.stroke(); ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(6, 0, 3, 0, TAU); ctx.fill(); ctx.strokeStyle = '#e9e4d6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(14, -8); ctx.lineTo(34, -18); ctx.stroke(); }
}
export function shade(hex, amt) { if (!hex || hex[0] !== '#') return hex; const n = parseInt(hex.slice(1), 16); const c = v => Math.max(0, Math.min(255, v)); return `rgb(${c((n >> 16) + amt)},${c(((n >> 8) & 255) + amt)},${c((n & 255) + amt)})`; }

// ---------- shadow-theatre silhouette (cinematic) ----------
// o: {x,y,h, weapon, mukut, rim (color), color (default near-black), pose:'stand'|'raise'|'kneel'|'bow', flip}
export function drawSilhouette(ctx, o) {
  const h = o.h; const u = h / 100; const col = o.color || '#0b0710'; const dir = o.flip ? -1 : 1;
  ctx.save(); ctx.translate(o.x, o.y); ctx.scale(dir * u, u);
  const path = () => {
    ctx.beginPath();
    // legs
    const kneel = o.pose === 'kneel';
    if (kneel) { ctx.moveTo(-16, 0); ctx.lineTo(-10, -22); ctx.lineTo(10, -22); ctx.lineTo(22, 0); ctx.lineTo(12, 0); ctx.lineTo(4, -12); ctx.lineTo(-6, 0); }
    else { ctx.moveTo(-14, 0); ctx.lineTo(-9, -30); ctx.lineTo(9, -30); ctx.lineTo(14, 0); ctx.lineTo(8, 0); ctx.lineTo(4, -20); ctx.lineTo(-4, -20); ctx.lineTo(-8, 0); }
    ctx.closePath(); ctx.fill();
    // dhoti + torso
    const top = kneel ? -22 : -30; ctx.beginPath(); ctx.moveTo(-15, top); ctx.lineTo(15, top); ctx.lineTo(13, top - 20); ctx.lineTo(16, top - 46); ctx.lineTo(10, top - 52); ctx.lineTo(-10, top - 52); ctx.lineTo(-16, top - 46); ctx.lineTo(-13, top - 20); ctx.closePath(); ctx.fill();
    // neck + head
    ctx.beginPath(); ctx.arc(0, top - 62, 9, 0, TAU); ctx.fill(); ctx.fillRect(-3, top - 56, 6, 6);
    // mukut
    const ht = top - 70; ctx.beginPath();
    if (o.mukut === 'king') { ctx.moveTo(-9, ht + 2); ctx.lineTo(-7, ht - 14); ctx.lineTo(-3, ht - 4); ctx.lineTo(0, ht - 20); ctx.lineTo(3, ht - 4); ctx.lineTo(7, ht - 14); ctx.lineTo(9, ht + 2); }
    else if (o.mukut === 'prince') { ctx.moveTo(-8, ht + 2); ctx.lineTo(-2, ht - 4); ctx.lineTo(0, ht - 22); ctx.lineTo(2, ht - 4); ctx.lineTo(8, ht + 2); }
    else if (o.mukut === 'sage') { ctx.moveTo(-8, ht + 2); ctx.quadraticCurveTo(0, ht - 16, 8, ht + 2); }
    else if (o.mukut === 'crest') { ctx.moveTo(-6, ht + 2); ctx.quadraticCurveTo(6, ht - 30, 18, ht - 10); ctx.lineTo(8, ht + 2); }
    else { ctx.moveTo(-9, ht + 4); ctx.quadraticCurveTo(0, ht - 6, 9, ht + 4); }
    ctx.closePath(); ctx.fill();
    // arms + weapon
    ctx.lineCap = 'round'; ctx.lineWidth = 7; const sh = top - 46;
    if (o.pose === 'raise') { ctx.beginPath(); ctx.moveTo(10, sh); ctx.lineTo(26, sh - 30); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-10, sh); ctx.lineTo(-18, sh + 24); ctx.stroke(); drawSilWeapon(ctx, o.weapon, 26, sh - 30, -1.2, ctx.fillStyle); }
    else if (o.pose === 'bow') { ctx.beginPath(); ctx.moveTo(10, sh); ctx.lineTo(34, sh + 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-10, sh); ctx.lineTo(8, sh + 4); ctx.stroke(); drawSilWeapon(ctx, 'bow', 34, sh + 2, 0, ctx.fillStyle); }
    else { ctx.beginPath(); ctx.moveTo(10, sh); ctx.lineTo(18, sh + 28); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-10, sh); ctx.lineTo(-16, sh + 26); ctx.stroke(); drawSilWeapon(ctx, o.weapon, 18, sh + 28, 0.3, ctx.fillStyle); }
  };
  if (o.rim) { ctx.save(); ctx.translate(2.5, -1); ctx.globalAlpha = 0.85; const rc = o.rim; ctx.fillStyle = rc; ctx.strokeStyle = rc; const keep = ctx.fillStyle; path(); ctx.restore(); }
  ctx.fillStyle = col; ctx.strokeStyle = col; path();
  ctx.restore();
}
function drawSilWeapon(ctx, w, x, y, rot, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col; ctx.strokeStyle = col;
  if (w === 'sword') { ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -46); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-7, -6); ctx.lineTo(7, -6); ctx.stroke(); }
  else if (w === 'gada') { ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -40); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -48, 13, 0, TAU); ctx.fill(); }
  else if (w === 'bow') { ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(0, 0, 34, -1.5, 1.5); ctx.stroke(); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(Math.cos(-1.5) * 34, Math.sin(-1.5) * 34); ctx.lineTo(-6, 0); ctx.lineTo(Math.cos(1.5) * 34, Math.sin(1.5) * 34); ctx.stroke(); }
  else if (w === 'spear') { ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, -80); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-5, -78); ctx.lineTo(0, -96); ctx.lineTo(5, -78); ctx.fill(); }
  else if (w === 'shankh') { ctx.beginPath(); ctx.ellipse(6, -8, 12, 7, -0.6, 0, TAU); ctx.fill(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(14, -14); ctx.lineTo(26, -26); ctx.stroke(); }
  ctx.restore();
}
export function drawChariotSil(ctx, x, y, u, col, flip) {
  ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -u : u, u); ctx.fillStyle = col; ctx.strokeStyle = col;
  ctx.fillRect(-40, -34, 60, 30); ctx.beginPath(); ctx.moveTo(-40, -34); ctx.lineTo(-44, -70); ctx.lineTo(-20, -60); ctx.lineTo(-40, -50); ctx.fill();
  ctx.beginPath(); ctx.arc(-20, 0, 16, 0, TAU); ctx.fill(); ctx.fillStyle = '#00000000';
  // horses
  for (const dy of [0, -8]) { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(60, -24 + dy, 34, 11, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(88, -30 + dy); ctx.lineTo(104, -44 + dy); ctx.lineTo(108, -30 + dy); ctx.lineTo(96, -20 + dy); ctx.fill(); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(40, -16 + dy); ctx.lineTo(34, 0); ctx.moveTo(78, -16 + dy); ctx.lineTo(86, 0); ctx.stroke(); }
  ctx.restore();
}
// painterly ground texture: offscreen canvas with blotches, returns pattern
export function makeGroundPattern(baseHex) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512; const x = c.getContext('2d'); x.fillStyle = baseHex; x.fillRect(0, 0, 512, 512);
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const blot = (bx, by, r, ry, a, st) => { x.fillStyle = st; for (const ox of [-512, 0, 512]) for (const oy of [-512, 0, 512]) { x.beginPath(); x.ellipse(bx + ox, by + oy, r, ry, a, 0, TAU); x.fill(); } };
  for (let i = 0; i < 380; i++) { const r = 10 + rnd() * 60; const dark = rnd() < 0.55; const st = dark ? `rgba(20,10,8,${0.05 + rnd() * 0.08})` : `rgba(255,220,170,${0.03 + rnd() * 0.05})`; blot(rnd() * 512, rnd() * 512, r, r * (0.35 + rnd() * 0.6), rnd() * TAU, st); }
  for (let i = 0; i < 90; i++) { x.strokeStyle = `rgba(20,10,8,${0.1 + rnd() * 0.12})`; x.lineWidth = 1 + rnd() * 2; const sx = rnd() * 512, sy = rnd() * 512, dx = (rnd() - 0.5) * 50, dy = (rnd() - 0.5) * 50; for (const ox of [-512, 0, 512]) for (const oy of [-512, 0, 512]) { x.beginPath(); x.moveTo(sx + ox, sy + oy); x.lineTo(sx + ox + dx, sy + oy + dy); x.stroke(); } }
  return x.createPattern(c, 'repeat');
}
