// Art module: painted warriors (in-game) and shadow-theatre silhouettes (cinematics). All vector, all procedural.
export const TAU = Math.PI * 2;

// ---------- in-game painted warrior ----------
// o: {x,y,s(scale ~1), facing, walkT, weapon:'sword'|'gada'|'bow'|'shield'|'dual', pal:{skin,cloth,armor,accent,hair}, hurt, cape, mukut:'prince'|'king'|'none', attack:0..1, aimUp}
export function drawWarrior(ctx, o) {
  const dir = Math.cos(o.facing) >= 0 ? 1 : -1; const s = o.s || 1; const p = o.pal; const hurt = !!o.hurt; const w = o.wounds || 0;
  const leg = Math.sin(o.walkT || 0); const bob = Math.abs(Math.cos(o.walkT || 0)) * 1.5; const hair = o.hair || (o.mukut === 'king' ? 'king' : o.mukut === 'sage' ? 'sage' : o.mukut === 'crest' ? 'crest' : o.mukut === 'prince' ? 'prince' : 'band');
  ctx.save(); ctx.translate(o.x, o.y + 4 * s); ctx.scale(dir * s * 1.04, s * 1.2); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const ink = 'rgba(12,8,14,0.92)'; const skin = hurt ? '#ffffff' : p.skin; const skinD = hurt ? '#ffffff' : shade(p.skin, -40); const skinL = hurt ? '#ffffff' : shade(p.skin, 28);
  const fill = (c, path, lw = 2) => { ctx.fillStyle = hurt ? '#fff' : c; ctx.beginPath(); path(); ctx.closePath(); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = lw; ctx.stroke(); };
  const limb = (x0, y0, x1, y1, wd, c) => { ctx.strokeStyle = ink; ctx.lineWidth = wd + 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.strokeStyle = c; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
  const muscle = (x, y, rx, ry, a) => { ctx.fillStyle = skinL; ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, a, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; };
  // scarf / cape behind
  if (o.scarf) { const fl = Math.sin((o.walkT || 0) * 0.7) * 5; ctx.fillStyle = hurt ? '#fff' : o.scarf; ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-8, -30 - bob); ctx.quadraticCurveTo(-30 - fl, -26, -40 - fl * 2, -6 + fl); ctx.quadraticCurveTo(-34 - fl, -4, -30 - fl, -2); ctx.quadraticCurveTo(-22, -14, -10, -22 - bob); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-6, -28 - bob); ctx.quadraticCurveTo(-24 - fl, -20, -36 - fl * 2, 6 + fl); ctx.lineTo(-30 - fl, 8 + fl); ctx.quadraticCurveTo(-20, -12, -8, -22 - bob); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  else if (o.cape) { ctx.fillStyle = hurt ? '#fff' : o.cape; ctx.beginPath(); ctx.moveTo(-12, -28 - bob); ctx.quadraticCurveTo(-28 - leg * 4, -10, -24 - leg * 6, 16); ctx.lineTo(-4, 10); ctx.closePath(); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.stroke(); }
  // legs (muscular)
  limb(-7, 6, -9 + leg * 7, 22, 7.5, skin); limb(7, 6, 9 - leg * 7, 22, 7.5, skin); muscle(-7, 10, 3, 5, 0.2); muscle(7, 10, 3, 5, -0.2);
  // anklets
  ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-12 + leg * 7, 19); ctx.lineTo(-6 + leg * 7, 19); ctx.moveTo(6 - leg * 7, 19); ctx.lineTo(12 - leg * 7, 19); ctx.stroke();
  // dhoti
  fill(p.cloth, () => { ctx.moveTo(-13, -5 - bob); ctx.lineTo(13, -5 - bob); ctx.lineTo(16, 12); ctx.lineTo(0, 9); ctx.lineTo(-16, 12); });
  ctx.strokeStyle = p.accent; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-14, 10); ctx.lineTo(0, 7); ctx.lineTo(14, 10); ctx.moveTo(-6, -4 - bob); ctx.quadraticCurveTo(-4, 4, -8, 10); ctx.stroke();
  // belt / kamarbandh
  fill(p.accent, () => { ctx.rect(-13, -7 - bob, 26, 4.5); }, 1.5); ctx.fillStyle = ink; ctx.fillRect(-2, -7 - bob, 4, 4.5);
  // torso: skin first (bare, muscular), then armor plate on top
  fill(skin, () => { ctx.moveTo(-16, -30 - bob); ctx.lineTo(16, -30 - bob); ctx.lineTo(13, -5 - bob); ctx.lineTo(-13, -5 - bob); });
  // pecs + abs
  muscle(-7, -24 - bob, 6, 4, 0.2); muscle(7, -24 - bob, 6, 4, -0.2); ctx.strokeStyle = skinD; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, -19 - bob); ctx.lineTo(0, -7 - bob); ctx.moveTo(-6, -16 - bob); ctx.lineTo(6, -16 - bob); ctx.moveTo(-6, -11 - bob); ctx.lineTo(6, -11 - bob); ctx.stroke();
  if (o.armorStyle !== 'none') {
    const g = ctx.createLinearGradient(-12, -30, 12, -6); g.addColorStop(0, shade(p.armor, 45)); g.addColorStop(0.5, p.armor); g.addColorStop(1, shade(p.armor, -50));
    ctx.fillStyle = hurt ? '#fff' : g; ctx.beginPath();
    if (o.armorStyle === 'kavach') { ctx.moveTo(-15, -29 - bob); ctx.lineTo(15, -29 - bob); ctx.lineTo(13, -6 - bob); ctx.lineTo(0, -3 - bob); ctx.lineTo(-13, -6 - bob); } // full breastplate
    else if (o.armorStyle === 'strap') { ctx.moveTo(-15, -29 - bob); ctx.lineTo(-7, -29 - bob); ctx.lineTo(8, -8 - bob); ctx.lineTo(8, -5 - bob); ctx.lineTo(-13, -5 - bob); ctx.lineTo(-13, -12 - bob); } // cross strap + side plate (bare chest look)
    else { ctx.moveTo(-15, -29 - bob); ctx.lineTo(15, -29 - bob); ctx.lineTo(12, -12 - bob); ctx.lineTo(0, -9 - bob); ctx.lineTo(-12, -12 - bob); } // half plate
    ctx.closePath(); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.stroke();
    if (o.armorStyle === 'kavach') { // sun motif
      ctx.strokeStyle = hurt ? '#fff' : shade(p.accent, 10); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -17 - bob, 5, 0, TAU); ctx.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 6.5, -17 - bob + Math.sin(a) * 6.5); ctx.lineTo(Math.cos(a) * 9.5, -17 - bob + Math.sin(a) * 9.5); ctx.stroke(); }
    } else { ctx.fillStyle = p.accent; ctx.beginPath(); ctx.moveTo(0, -24 - bob); ctx.lineTo(4, -18 - bob); ctx.lineTo(0, -12 - bob); ctx.lineTo(-4, -18 - bob); ctx.closePath(); ctx.fill(); }
  }
  // necklace
  ctx.strokeStyle = p.accent; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -33 - bob, 7, 0.3, Math.PI - 0.3); ctx.stroke();
  // shoulder pads
  fill(shade(p.armor, 20), () => { ctx.ellipse(-15, -29 - bob, 7, 4.5, 0.2, 0, TAU); }); fill(shade(p.armor, 20), () => { ctx.ellipse(15, -29 - bob, 7, 4.5, -0.2, 0, TAU); });
  // back arm (biceps)
  limb(-13, -26 - bob, -18 - leg * 3, -9 - bob, 6.5, skin); muscle(-15, -20 - bob, 3.6, 5, 0.4); ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-17, -16 - bob); ctx.lineTo(-13, -14 - bob); ctx.stroke();
  // neck + head
  ctx.fillStyle = skin; ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-4, -31 - bob); ctx.lineTo(-4, -36 - bob); ctx.lineTo(4, -36 - bob); ctx.lineTo(4, -31 - bob); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -41 - bob, 7.6, 8.2, 0, 0, TAU); ctx.fill(); ctx.stroke();
  // jaw shading, eye, brow (determined)
  ctx.fillStyle = skinD; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.ellipse(0, -36 - bob, 7, 4, 0, 0, Math.PI); ctx.fill(); ctx.globalAlpha = 1;
  ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(4, -41 - bob, 1.6, 1.1, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(1, -44.5 - bob); ctx.lineTo(7, -43.5 - bob); ctx.stroke();
  // hair / headgear
  const hc = hurt ? '#fff' : (p.hair || '#1a0f0a');
  if (hair === 'glory') { // Abhimanyu: swept-back voluminous hair, red band, tilak
    fill(hc, () => { ctx.moveTo(-9, -44 - bob); ctx.quadraticCurveTo(-6, -56 - bob, 4, -53 - bob); ctx.quadraticCurveTo(12, -52 - bob, 10, -44 - bob); ctx.quadraticCurveTo(14, -50 - bob, 11, -56 - bob); ctx.quadraticCurveTo(-2, -64 - bob, -14, -54 - bob); ctx.quadraticCurveTo(-20, -44 - bob, -16, -30 - bob); ctx.quadraticCurveTo(-13, -36 - bob, -10, -36 - bob); }, 1.5);
    ctx.fillStyle = hurt ? '#fff' : '#B5201E'; ctx.fillRect(-9, -47 - bob, 17, 3); ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.strokeRect(-9, -47 - bob, 17, 3); ctx.fillStyle = '#F4C95D'; ctx.beginPath(); ctx.arc(7, -45.5 - bob, 1.6, 0, TAU); ctx.fill();
    ctx.fillStyle = '#C0392B'; ctx.beginPath(); ctx.moveTo(4, -44 - bob); ctx.lineTo(5.3, -41 - bob); ctx.lineTo(4, -39.5 - bob); ctx.lineTo(2.7, -41 - bob); ctx.closePath(); ctx.fill();
  } else if (hair === 'tied') { // Satyaki: long hair tied back in a warrior knot, tilak
    fill(hc, () => { ctx.moveTo(-9, -45 - bob); ctx.quadraticCurveTo(0, -54 - bob, 9, -45 - bob); ctx.lineTo(8, -43 - bob); ctx.quadraticCurveTo(0, -48 - bob, -8, -43 - bob); }, 1.5);
    fill(hc, () => { ctx.ellipse(-11, -47 - bob, 5, 4, -0.5, 0, TAU); }, 1.5); fill(hc, () => { ctx.moveTo(-13, -45 - bob); ctx.quadraticCurveTo(-20, -34 - bob, -16, -24 - bob); ctx.lineTo(-13, -26 - bob); ctx.quadraticCurveTo(-15, -36 - bob, -11, -42 - bob); }, 1.2);
    ctx.strokeStyle = p.accent; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(-11, -47 - bob, 5, 0, TAU); ctx.stroke();
    ctx.strokeStyle = '#C0392B'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(4, -45 - bob); ctx.lineTo(4, -39.5 - bob); ctx.stroke();
  } else if (hair === 'rugged') { // Karna: loose shaggy hair hiding one ear; kundal on the visible ear
    fill(hc, () => { ctx.moveTo(-10, -46 - bob); ctx.quadraticCurveTo(-4, -56 - bob, 8, -52 - bob); ctx.quadraticCurveTo(13, -50 - bob, 11, -42 - bob); ctx.lineTo(13, -34 - bob); ctx.lineTo(9, -38 - bob); ctx.lineTo(10, -44 - bob); ctx.quadraticCurveTo(4, -49 - bob, -4, -46 - bob); ctx.lineTo(-7, -38 - bob); ctx.quadraticCurveTo(-13, -36 - bob, -14, -30 - bob); ctx.lineTo(-16, -40 - bob); }, 1.5);
  } else if (hair === 'king') { fill(p.armor, () => { ctx.moveTo(-10, -45 - bob); ctx.quadraticCurveTo(0, -56 - bob, 10, -45 - bob); ctx.lineTo(10, -42 - bob); ctx.lineTo(-10, -42 - bob); }); ctx.fillStyle = p.accent; ctx.fillRect(-10, -45 - bob, 20, 2.5); fill(p.accent, () => { ctx.moveTo(-8, -50 - bob); ctx.lineTo(-4, -62 - bob); ctx.lineTo(0, -52 - bob); ctx.lineTo(4, -64 - bob); ctx.lineTo(8, -50 - bob); }); }
  else if (hair === 'prince') { fill(hc, () => { ctx.moveTo(-9, -45 - bob); ctx.quadraticCurveTo(0, -55 - bob, 9, -45 - bob); ctx.lineTo(8, -43 - bob); ctx.quadraticCurveTo(0, -49 - bob, -8, -43 - bob); }, 1.5); ctx.fillStyle = p.accent; ctx.fillRect(-9, -47 - bob, 18, 2.5); fill(p.accent, () => { ctx.moveTo(-3, -49 - bob); ctx.lineTo(0, -62 - bob); ctx.lineTo(3, -49 - bob); }); }
  else if (hair === 'crest') { fill(p.armor, () => { ctx.moveTo(-10, -45 - bob); ctx.quadraticCurveTo(0, -56 - bob, 10, -45 - bob); ctx.lineTo(10, -42 - bob); ctx.lineTo(-10, -42 - bob); }); fill(p.accent, () => { ctx.moveTo(-2, -50 - bob); ctx.quadraticCurveTo(10, -72 - bob, 16, -52 - bob); ctx.lineTo(2, -48 - bob); }); }
  else if (hair === 'sage') { fill('#e8e0d0', () => { ctx.moveTo(-9, -45 - bob); ctx.quadraticCurveTo(0, -54 - bob, 9, -45 - bob); ctx.lineTo(9, -40 - bob); ctx.lineTo(-9, -40 - bob); }, 1.5); fill('#e8e0d0', () => { ctx.ellipse(0, -52 - bob, 5, 4, 0, 0, TAU); }, 1.2); fill('#e8e0d0', () => { ctx.moveTo(-5, -36 - bob); ctx.quadraticCurveTo(0, -24 - bob, 5, -36 - bob); }, 1); }
  else { fill(p.armor, () => { ctx.moveTo(-10, -45 - bob); ctx.quadraticCurveTo(0, -55 - bob, 10, -45 - bob); ctx.lineTo(10, -41 - bob); ctx.lineTo(-10, -41 - bob); }); ctx.fillStyle = p.accent; ctx.fillRect(-10, -45 - bob, 20, 2.2); }
  // front arm (biceps) + weapon
  const atk = o.attack || 0; const armA = o.weapon === 'bow' ? -0.1 : (-0.6 + atk * 1.4);
  ctx.save(); ctx.translate(13, -26 - bob); ctx.rotate(armA);
  limb(0, 0, 15, 9, 6.5, skin); muscle(6, 3, 4.5, 3.4, 0.5); ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(11, 5); ctx.lineTo(13, 10); ctx.stroke();
  ctx.translate(15, 9); drawWeapon(ctx, o.weapon, p, atk, o.charge || 0);
  ctx.restore();
  // wounds: cuts and bruises appear as HP drops
  if (w > 0.15) { ctx.strokeStyle = '#8a0f0f'; ctx.lineWidth = 1.3; const cuts = [[-4, -22, -1, -16], [6, -14, 9, -9], [-16, -12, -14, -8], [8, 2, 11, 7], [-9, -40, -7, -37], [5, -8, 8, -3]]; const n = Math.min(cuts.length, Math.ceil(w * cuts.length)); for (let i = 0; i < n; i++) { const c = cuts[i]; ctx.beginPath(); ctx.moveTo(c[0], c[1] - bob); ctx.lineTo(c[2], c[3] - bob); ctx.stroke(); } if (w > 0.5) { ctx.fillStyle = 'rgba(90,20,60,0.45)'; ctx.beginPath(); ctx.ellipse(-8, -18 - bob, 4, 3, 0.4, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(140,10,10,0.5)'; ctx.beginPath(); ctx.ellipse(10, 4, 3, 2, 0, 0, TAU); ctx.fill(); } }
  ctx.restore();
}
export function drawWeapon(ctx, w, p, atk = 0, charge = 0) {
  const ink = 'rgba(12,8,14,0.9)';
  if (w === 'sword' || w === 'dual') { ctx.rotate(-0.9 + atk * 1.6); ctx.fillStyle = '#e9e4d6'; ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -2.5); ctx.lineTo(30, -1); ctx.lineTo(34, 0); ctx.lineTo(30, 1); ctx.lineTo(0, 2.5); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = p.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, 6); ctx.stroke(); ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(-4, 0, 2.5, 0, TAU); ctx.fill(); }
  else if (w === 'gada') { ctx.rotate(-1.3 + atk * 1.8); ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(26, 0); ctx.stroke(); ctx.strokeStyle = '#7a5a36'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(26, 0); ctx.stroke(); const g = ctx.createRadialGradient(30, -3, 2, 32, 0, 12); g.addColorStop(0, '#d8cdb8'); g.addColorStop(1, '#5a4a3a'); ctx.fillStyle = g; ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(32, 0, 11, 0, TAU); ctx.fill(); ctx.stroke(); ctx.strokeStyle = p.accent; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(32, 0, 7, 0, TAU); ctx.stroke(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(32 + Math.cos(a) * 11, Math.sin(a) * 11, 2, 0, TAU); ctx.fill(); } }
  else if (w === 'chakra') { ctx.rotate(-0.3 + atk * 2.2); ctx.translate(14, -6); ctx.strokeStyle = ink; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#6b4a2b'; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.stroke(); ctx.strokeStyle = p.accent; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#8a6a46'; ctx.lineWidth = 3; for (let i = 0; i < 8; i++) { const an = i / 8 * TAU; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an) * 20, Math.sin(an) * 20); ctx.stroke(); } ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.stroke(); }
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
  for (let i = 0; i < 160; i++) { const r = 20 + rnd() * 90; const dark = rnd() < 0.55; const st = dark ? `rgba(20,10,8,${0.025 + rnd() * 0.035})` : `rgba(255,220,170,${0.02 + rnd() * 0.03})`; blot(rnd() * 512, rnd() * 512, r, r * (0.35 + rnd() * 0.6), rnd() * TAU, st); }
  for (let i = 0; i < 60; i++) { x.strokeStyle = `rgba(20,10,8,${0.06 + rnd() * 0.08})`; x.lineWidth = 1 + rnd() * 2; const sx = rnd() * 512, sy = rnd() * 512, dx = (rnd() - 0.5) * 50, dy = (rnd() - 0.5) * 50; for (const ox of [-512, 0, 512]) for (const oy of [-512, 0, 512]) { x.beginPath(); x.moveTo(sx + ox, sy + oy); x.lineTo(sx + ox + dx, sy + oy + dy); x.stroke(); } }
  return x.createPattern(c, 'repeat');
}
