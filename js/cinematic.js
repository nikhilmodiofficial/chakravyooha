// Cinematic player: painterly procedural scenes + subtitles + voice. Hold-to-skip (1.5s), one-tap after first viewing.
import { CHARACTERS, PALETTE } from './config.js';
import { TAU, lerp, clamp } from './entities.js';
import { drawSilhouette, drawChariotSil } from './art.js';

export class Cinematic {
  constructor(renderer, voice, audio, ui) { this.r = renderer; this.voice = voice; this.audio = audio; this.ui = ui; this.active = false; this.imgs = {};
    const map = { dawn: 'bg_dawn', camp_kaurava: 'bg_kaurava', vyuha: 'bg_vyuha', camp_pandava: 'bg_pandava', satyaki_memory: 'bg_ashram', gate: 'bg_gate', inside: 'bg_inside', sunset: 'bg_sunset', siege: 'bg_siege', collapse: 'bg_collapse' };
    for (const k in map) { const im = new Image(); im.src = 'assets/img/' + map[k] + '.jpg'; im.onerror = () => { im.failed = true; }; this.imgs[k] = im; } }
  async play(scenes, opts = {}) {
    this.active = true; this.scenes = scenes; this.si = 0; this.li = 0; this.t = 0; this.skipped = false; this.opts = opts; this.line = null; this.holdT = 0;
    this.ui.showCinematic(true, opts.seenBefore);
    const skipP = new Promise(res => { this._resolveSkip = res; });
    for (let s = 0; s < scenes.length && !this.skipped; s++) {
      this.si = s; this.sceneT = 0; const sc = scenes[s];
      if (sc.title) this.ui.cineTitle(sc.title); else this.ui.cineTitle('');
      for (let l = 0; l < sc.lines.length && !this.skipped; l++) {
        const ln = sc.lines[l]; this.line = ln; this.ui.subtitle(CHARACTERS[ln.who].name, ln.text, CHARACTERS[ln.who].color);
        const id = (opts.idPrefix || 'cine') + '_' + s + '_' + l;
        await Promise.race([this.voice.say(ln.who, ln.text, id), skipP]); if (this.skipped) break; await Promise.race([wait(420), skipP]);
      }
    }
    this.voice.stop(); this.ui.subtitle('', ''); this.ui.showCinematic(false); this.active = false; this.line = null;
  }
  skip() { this.skipped = true; this.voice.stop(); if (this._resolveSkip) this._resolveSkip(); }
  advance() { this.voice.stop(); } // ends the current line early; play() moves to the next
  update(dt, input) {
    this.t += dt; this.sceneT = (this.sceneT || 0) + dt;
    const down = input.anyHeld() || input.held('escape');
    if (down) { this.holdT += dt; this._wasDown = true; }
    else { if (this._wasDown && this.holdT > 0.02 && this.holdT < 0.45 && !this.skipped) this.advance(); this._wasDown = false; this.holdT = 0; }
    const need = 1.2; this.ui.skipProgress(clamp(this.holdT / need, 0, 1), this.opts.seenBefore);
    if (this.holdT >= need) { this.holdT = 0; this._wasDown = false; this.skip(); }
  }
  draw() {
    if (!this.active) return; const ctx = this.r.ctx, W = this.r.w, H = this.r.h, t = this.t, sc = this.scenes[this.si]; const bg = sc.bg; const k = Math.min(1, this.sceneT / 1.2);
    ctx.save(); ctx.globalAlpha = 1;
    const bim = this.imgs[bg]; const hasImg = bim && bim.complete && bim.naturalWidth > 0 && !bim.failed;
    if (hasImg) { const sc = Math.max(W / bim.naturalWidth, H / bim.naturalHeight) * (1.04 + Math.min(0.08, this.sceneT * 0.004)); const dw = bim.naturalWidth * sc, dh = bim.naturalHeight * sc; ctx.drawImage(bim, (W - dw) / 2 - this.sceneT * 1.5, (H - dh) / 2, dw, dh); const g = ctx.createLinearGradient(0, H * 0.45, 0, H); g.addColorStop(0, 'rgba(5,3,10,0)'); g.addColorStop(1, 'rgba(5,3,10,0.85)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); const g2 = ctx.createLinearGradient(0, 0, 0, H * 0.3); g2.addColorStop(0, 'rgba(5,3,10,0.6)'); g2.addColorStop(1, 'rgba(5,3,10,0)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H); }
    const sky = (c0, c1, c2) => { if (hasImg) return; const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c0); g.addColorStop(0.55, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
    const sun = (x, y, r, c) => { if (hasImg) return; const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 3); g.addColorStop(0, c); g.addColorStop(0.3, c.replace(')', ',0.5)').replace('rgb', 'rgba')); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
    const ground = (c, y) => { if (hasImg) return; ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, y); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, y + Math.sin(x * 0.01 + 1) * 12 + Math.sin(x * 0.03) * 5); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill(); };
    const army = (y, n, c, h, flip = 1, sway = 1) => { for (let i = 0; i < n; i++) { const x = (i / n) * W * 1.1 - W * 0.05 + Math.sin(i * 7.3) * 20; const b = Math.sin(t * 1.5 + i) * 2 * sway; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y - h + b, h * 0.18, 0, TAU); ctx.fill(); ctx.fillRect(x - h * 0.16, y - h * 0.8 + b, h * 0.32, h * 0.8); ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + h * 0.2 * flip, y); ctx.lineTo(x + h * 0.2 * flip, y - h * 1.7); ctx.stroke(); } };
    const figure = (x, y, h, c, acc, pose = 0, weapon = 'sword', mukut = 'band', flip = false) => drawSilhouette(ctx, { x, y, h, color: '#0b0710', rim: acc, pose: pose === 1 ? 'raise' : pose === 2 ? 'kneel' : pose === 3 ? 'bow' : 'stand', weapon, mukut, flip });
    const hills = (y, c, amp, ph) => { if (hasImg) return; ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, y); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, y + Math.sin(x * 0.004 + ph) * amp + Math.sin(x * 0.011 + ph * 2) * amp * 0.4); ctx.lineTo(W, H); ctx.fill(); };
    const rays = (x, y, c) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.22 + Math.sin(t * 0.3 + i) * 0.03; ctx.fillStyle = c; ctx.globalAlpha = 0.05 + 0.03 * Math.sin(t + i); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a - 0.05) * H * 1.6, y + Math.sin(a - 0.05) * H * 1.6); ctx.lineTo(x + Math.cos(a + 0.05) * H * 1.6, y + Math.sin(a + 0.05) * H * 1.6); ctx.fill(); } ctx.restore(); };
    const armySil = (y, n, h, flip, c = '#0b0710') => { for (let i = 0; i < n; i++) { const x = (i / n) * W * 1.1 - W * 0.05 + Math.sin(i * 7.3) * 14; drawSilhouette(ctx, { x, y: y + Math.sin(i * 3.1) * 6, h: h * (0.9 + (i % 3) * 0.06), color: c, pose: 'stand', weapon: i % 4 === 0 ? 'bow' : 'spear', mukut: 'band', flip }); } };
    const dust = (c) => { ctx.fillStyle = c; for (let i = 0; i < 60; i++) { const x = (i * 97 + t * (20 + i % 5 * 8)) % W, y = (i * 53) % H + Math.sin(t + i) * 10; ctx.globalAlpha = 0.3 + 0.3 * Math.sin(t * 2 + i); ctx.beginPath(); ctx.arc(x, y, 1.5 + i % 3, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; };
    const vyuha = (cx, cy, R, rot) => { if (hasImg && bg !== 'collapse') return; for (let i = 0; i < 7; i++) { const rr = R * (0.25 + i * 0.125); ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot * (i % 2 ? -1 : 1) * (1 + i * 0.1)); ctx.strokeStyle = `rgba(244,201,93,${0.9 - i * 0.1})`; ctx.lineWidth = 2; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.ellipse(0, 0, rr, rr * 0.45, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]); const n = 20 + i * 8; for (let k = 0; k < n; k++) { const a = k / n * TAU; ctx.fillStyle = 'rgba(20,14,28,0.9)'; ctx.beginPath(); ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr * 0.45 - 4, 3, 0, TAU); ctx.fill(); ctx.fillRect(Math.cos(a) * rr - 2, Math.sin(a) * rr * 0.45 - 2, 4, 8); } ctx.restore(); } };

    const G = '#F4C95D', O = '#FF9A4A';
    if (bg === 'dawn') { sky('#1a0f22', '#8a2f22', '#f0a04a'); sun(W * 0.5, H * 0.58, 70, 'rgb(255,110,60)'); rays(W * 0.5, H * 0.58, '#ffb070'); hills(H * 0.6, '#3a1a1c', 18, 1); hills(H * 0.68, '#1f0d12', 12, 3); armySil(H * 0.78, 34, 120, false); armySil(H * 0.9, 26, 150, false, '#06030a'); dust('rgba(255,200,120,0.5)'); }
    else if (bg === 'camp_kaurava') { sky('#0b0c14', '#1B1F3B', '#5a2a22'); for (let i = 0; i < 4; i++) { const x = W * (0.15 + i * 0.23); const fl = 0.7 + Math.sin(t * 9 + i) * 0.3; const g = ctx.createRadialGradient(x, H * 0.62, 5, x, H * 0.62, 220 * fl); g.addColorStop(0, 'rgba(255,170,60,0.55)'); g.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); } hills(H * 0.66, '#140a10', 10, 2); figure(W * 0.28, H * 0.9, 230, '#0b0710', O, 0, 'gada', 'king'); figure(W * 0.5, H * 0.92, 250, '#0b0710', G, 1, 'bow', 'sage'); figure(W * 0.72, H * 0.9, 225, '#0b0710', O, 0, 'sword', 'king', true); dust('rgba(255,160,80,0.4)'); }
    else if (bg === 'vyuha') { sky('#0b0c14', '#3a1c2c', '#c0703a'); sun(W * 0.8, H * 0.18, 44, 'rgb(255,210,140)'); hills(H * 0.42, '#2a1418', 14, 0.5); ground('#3a2416', H * 0.5); vyuha(W * 0.5, H * 0.66, Math.min(W, H * 1.7) * 0.46, t * 0.15); armySil(H * 0.98, 30, 120, false, '#06030a'); dust('rgba(244,201,93,0.5)'); }
    else if (bg === 'camp_pandava') { sky('#0b0c14', '#1B1F3B', '#4a4a6a'); ctx.fillStyle = '#d8c8a8'; ctx.beginPath(); ctx.moveTo(W * 0.5, H * 0.1); ctx.lineTo(W * 1.0, H * 0.66); ctx.lineTo(W * 0.0, H * 0.66); ctx.fill(); ctx.fillStyle = '#2E4A8B'; ctx.beginPath(); ctx.moveTo(W * 0.5, H * 0.1); ctx.lineTo(W * 0.56, H * 0.66); ctx.lineTo(W * 0.44, H * 0.66); ctx.fill(); const g = ctx.createRadialGradient(W * 0.5, H * 0.7, 10, W * 0.5, H * 0.7, 400); g.addColorStop(0, 'rgba(255,180,80,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); hills(H * 0.68, '#120c14', 8, 1); figure(W * 0.2, H * 0.92, 240, '#0b0710', '#CFF4FF', 0, 'sword', 'king'); figure(W * 0.38, H * 0.94, 275, '#0b0710', O, 0, 'gada', 'king'); figure(W * 0.58, H * 0.92, 190, '#0b0710', G, 1, 'bow', 'prince', true); figure(W * 0.78, H * 0.92, 240, '#0b0710', '#9FFFC0', 0, 'sword', 'crest', true); }
    else if (bg === 'satyaki_memory') { sky('#05040c', '#0f1a2a', '#1f3a34'); for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.5 * Math.abs(Math.sin(t * 0.7 + i))})`; ctx.beginPath(); ctx.arc((i * 131) % W, (i * 71) % (H * 0.55), 1.3, 0, TAU); ctx.fill(); } hills(H * 0.5, '#0a1512', 30, 2); hills(H * 0.6, '#06100c', 20, 5); const fx = W * 0.5, fy = H * 0.72; const g = ctx.createRadialGradient(fx, fy, 4, fx, fy, 300); g.addColorStop(0, `rgba(255,170,60,${0.5 + Math.sin(t * 7) * 0.1})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.ellipse(fx, fy - 10, 10, 18 + Math.sin(t * 12) * 3, 0, 0, TAU); ctx.fill(); figure(W * 0.34, H * 0.9, 230, '#0b0710', '#9FFFC0', 2, 'sword', 'crest'); figure(W * 0.66, H * 0.9, 270, '#0b0710', O, 1, 'none', 'sage', true); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#B4FFD0'; ctx.lineWidth = 2; ctx.globalAlpha = 0.25 + 0.2 * Math.sin(t * 2); ctx.beginPath(); ctx.arc(W * 0.34, H * 0.72, 70 + Math.sin(t) * 6, 0, TAU); ctx.stroke(); ctx.restore(); }
    else if (bg === 'gate') { sky('#0b0c14', '#5a2a22', '#e0a050'); sun(W * 0.5, H * 0.3, 50, 'rgb(255,200,120)'); rays(W * 0.5, H * 0.3, '#ffd090'); vyuha(W * 0.5, H * 0.38, Math.min(W, H * 1.7) * 0.5, t * 0.2); hills(H * 0.6, '#2a1418', 10, 1); armySil(H * 0.98, 36, 130, false, '#06030a'); drawChariotSil(ctx, W * 0.5, H * 0.72, 1.1, '#0b0710', false); figure(W * 0.47, H * 0.72 - 30, 150, '#0b0710', G, 3, 'bow', 'prince'); figure(W * 0.5, H * 0.9, 230, '#0b0710', '#B088FF', 1, 'gada', 'king'); ctx.save(); ctx.globalAlpha = 0.45; figure(W * 0.16, H * 0.88, 210, '#0b0710', '#9FFFC0', 0, 'sword', 'crest'); ctx.restore(); dust('rgba(244,201,93,0.5)'); }
    else if (bg === 'inside') { sky('#0b0c14', '#2B1E2F', '#8C5A32'); hills(H * 0.55, '#2a1810', 10, 2); armySil(H * 0.66, 40, 110, false, '#0d0810'); armySil(H * 0.62, 44, 100, true, '#120c10'); figure(W * 0.5, H * 0.95, 280, '#0b0710', G, 1, 'sword', 'prince'); dust('rgba(255,200,120,0.5)'); }
    else if (bg === 'sunset') { sky('#1a0f22', '#8a2f22', '#f0a04a'); sun(W * 0.5, H * 0.62, 80, 'rgb(255,120,60)'); rays(W * 0.5, H * 0.62, '#ffb070'); hills(H * 0.64, '#3a1a1c', 16, 1); hills(H * 0.72, '#1f0d12', 10, 3); armySil(H * 0.8, 40, 110, false, '#0d0810'); figure(W * 0.46, H * 0.95, 230, '#0b0710', G, 0, 'sword', 'prince'); figure(W * 0.56, H * 0.95, 245, '#0b0710', '#9FFFC0', 0, 'sword', 'crest', true); figure(W * 0.27, H * 0.96, 290, '#0b0710', O, 1, 'shankh', 'king'); drawChariotSil(ctx, W * 0.8, H * 0.93, 1.0, '#0b0710', true); figure(W * 0.82, H * 0.93 - 30, 150, '#0b0710', '#7FE3FF', 3, 'bow', 'king', true); dust('rgba(255,200,120,0.5)'); }
    else if (bg === 'siege') { sky('#05040a', '#1B1F3B', '#3B2C2C'); hills(H * 0.6, '#1a1014', 8, 1); const cx = W / 2, cy = H * 0.9; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t * 0.05; figure(cx + Math.cos(a) * W * 0.3, cy + Math.sin(a) * H * 0.1 - 40, 230, '#0b0710', '#FF5A3B', i % 2 ? 1 : 3, i % 2 ? 'sword' : 'bow', 'king', Math.cos(a) < 0); } figure(cx, cy, 190, '#0b0710', G, 2, 'sword', 'prince'); }
    else if (bg === 'collapse') { sky('#0b0c14', '#3A2A4C', '#D9A441'); hills(H * 0.5, '#2a1418', 10, 1); vyuha(W * 0.5, H * 0.5, Math.min(W, H * 1.7) * 0.5, t * 0.6); ctx.fillStyle = `rgba(255,240,200,${0.3 + 0.3 * Math.sin(t * 10)})`; ctx.fillRect(0, 0, W, H); }
    // film grain + bars + fade-in
    ctx.fillStyle = `rgba(0,0,0,${1 - k})`; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H * 0.09); ctx.fillRect(0, H * 0.91, W, H * 0.09);
    ctx.restore();
  }
}
export const wait = ms => new Promise(r => setTimeout(r, ms));
