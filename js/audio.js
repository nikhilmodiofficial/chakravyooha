// Procedural audio: tanpura drone, nagada/dhol loop, heartbeat, shankh, SFX. Zero external assets.
export class AudioEngine {
  constructor() {
    this.ctx = null; this.master = null; this.musicGain = null; this.sfxGain = null;
    this.bpm = 90; this.mode = 'none'; this.enabled = true;
    this._timer = null; this._nextBeat = 0; this._beatIdx = 0;
    this.drone = null; this.heart = null; this.lowpass = null;
    this.vipatti = false;
  }
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) { this.enabled = false; return; }
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.9;
    this.lowpass = this.ctx.createBiquadFilter(); this.lowpass.type = 'lowpass'; this.lowpass.frequency.value = 18000;
    this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = 0.55;
    this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = 0.9;
    this.musicGain.connect(this.lowpass); this.lowpass.connect(this.master);
    this.sfxGain.connect(this.master); this.master.connect(this.ctx.destination);
    this._noise = this._makeNoise();
  }
  _makeNoise() {
    const len = this.ctx.sampleRate * 2, buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; return buf;
  }
  setMute(m) { if (this.master) this.master.gain.value = m ? 0 : 0.9; }

  // ---------- MUSIC ----------
  playMusic(mode, bpm) {
    if (!this.ctx) return; this.mode = mode; this.bpm = bpm || this.bpm;
    this.stopDrone();
    if (mode === 'none') { this.stopLoop(); return; }
    this.startDrone(mode);
    this.startLoop();
  }
  startDrone(mode) {
    const c = this.ctx, g = c.createGain(); g.gain.value = 0;
    const root = mode === 'epilogue' ? 146.8 : (mode === 'menu' ? 130.8 : 110); // D3, C3, A2
    const freqs = mode === 'siege' ? [root, root * 1.0595, root * 1.5] : [root, root * 1.5, root * 2, root * 3];
    const oscs = freqs.map((f, i) => {
      const o = c.createOscillator(); o.type = i % 2 ? 'triangle' : 'sawtooth'; o.frequency.value = f;
      const og = c.createGain(); og.gain.value = 0.18 / (i + 1);
      const lfo = c.createOscillator(); lfo.frequency.value = 0.08 + i * 0.05; const lg = c.createGain(); lg.gain.value = 1.2;
      lfo.connect(lg); lg.connect(o.detune); lfo.start();
      o.connect(og); og.connect(g); o.start(); return { o, lfo };
    });
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = mode === 'siege' ? 500 : 900; f.Q.value = 2;
    g.connect(f); f.connect(this.musicGain);
    g.gain.linearRampToValueAtTime(mode === 'cinematic' ? 0.5 : 0.35, c.currentTime + 2.5);
    this.drone = { g, oscs };
  }
  stopDrone() {
    if (!this.drone) return; const d = this.drone, t = this.ctx.currentTime;
    d.g.gain.cancelScheduledValues(t); d.g.gain.setValueAtTime(d.g.gain.value, t); d.g.gain.linearRampToValueAtTime(0, t + 1.2);
    setTimeout(() => d.oscs.forEach(x => { try { x.o.stop(); x.lfo.stop(); } catch (e) { } }), 1400); this.drone = null;
  }
  startLoop() {
    this.stopLoop(); if (this.mode === 'cinematic' || this.mode === 'menu' || this.mode === 'epilogue') { if (this.mode !== 'epilogue') return; }
    this._nextBeat = this.ctx.currentTime + 0.1; this._beatIdx = 0;
    this._timer = setInterval(() => this._schedule(), 60);
  }
  stopLoop() { if (this._timer) clearInterval(this._timer); this._timer = null; }
  _schedule() {
    const spb = 60 / this.bpm / 2; // 8th notes
    while (this._nextBeat < this.ctx.currentTime + 0.25) {
      this._beat(this._beatIdx, this._nextBeat); this._nextBeat += spb; this._beatIdx++;
    }
  }
  _beat(i, t) {
    const s = i % 16; const intense = this.mode === 'siege' || this.mode === 'boss';
    if (this.vipatti) { if (s === 0 || s === 3) this.heartbeat(t, s === 0 ? 1 : 0.6); if (s === 8) this.heartbeat(t, 0.7); return; }
    if (this.mode === 'epilogue') { if (s === 0) this.bell(t, 0.3); if (s === 8) this.bell(t, 0.18, 1.5); return; }
    // dhol pattern: dha . . dhin . na . dha | tin . . dhin . na dha .
    const dha = [0, 7, 14], dhin = [3, 11], na = [5, 13], tin = [8, 10, 12];
    if (dha.includes(s)) this.drum(t, 'dha', 1);
    if (dhin.includes(s)) this.drum(t, 'dhin', 0.8);
    if (na.includes(s)) this.drum(t, 'na', 0.5);
    if (intense && tin.includes(s)) this.drum(t, 'na', 0.35);
    if (intense && (s % 4 === 2)) this.drum(t, 'tik', 0.3);
    if (this.mode === 'siege' && s % 8 === 0) this.brass(t);
  }
  drum(t, kind, vol) {
    const c = this.ctx, g = c.createGain(); g.connect(this.musicGain);
    if (kind === 'dha' || kind === 'dhin') {
      const o = c.createOscillator(); o.type = 'sine'; const f0 = kind === 'dha' ? 150 : 210;
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 0.4, t + 0.25);
      g.gain.setValueAtTime(vol * 0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.connect(g); o.start(t); o.stop(t + 0.4);
    }
    const n = c.createBufferSource(); n.buffer = this._noise; const f = c.createBiquadFilter();
    f.type = kind === 'tik' ? 'highpass' : 'bandpass'; f.frequency.value = kind === 'na' ? 2400 : (kind === 'tik' ? 6000 : 900); f.Q.value = 1.5;
    const ng = c.createGain(); ng.gain.setValueAtTime(vol * (kind === 'na' ? 0.35 : 0.2), t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    n.connect(f); f.connect(ng); ng.connect(this.musicGain); n.start(t); n.stop(t + 0.1);
  }
  heartbeat(t, vol) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(60, t); o.frequency.exponentialRampToValueAtTime(35, t + 0.3);
    g.gain.setValueAtTime(vol * 0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(g); g.connect(this.musicGain); o.start(t); o.stop(t + 0.4);
  }
  bell(t, vol, mul = 1) {
    const c = this.ctx; [1, 2.76, 5.4].forEach((r, i) => {
      const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = 293.66 * mul * r;
      g.gain.setValueAtTime(vol / (i + 1), t); g.gain.exponentialRampToValueAtTime(0.001, t + 2.5 - i * 0.5);
      o.connect(g); g.connect(this.musicGain); o.start(t); o.stop(t + 3);
    });
  }
  brass(t) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(110, t); o.frequency.linearRampToValueAtTime(116, t + 0.6);
    f.type = 'lowpass'; f.frequency.setValueAtTime(300, t); f.frequency.linearRampToValueAtTime(1400, t + 0.5);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.15); g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    o.connect(f); f.connect(g); g.connect(this.musicGain); o.start(t); o.stop(t + 1);
  }
  setVipatti(on) {
    if (!this.ctx) return; if (this.vipatti === on) return; this.vipatti = on;
    const t = this.ctx.currentTime; this.lowpass.frequency.cancelScheduledValues(t);
    this.lowpass.frequency.linearRampToValueAtTime(on ? 700 : 18000, t + 0.8);
  }

  // ---------- SFX ----------
  _env(g, t, a, d, peak) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  noiseBurst(t, dur, freq, q, vol, type = 'bandpass') {
    const c = this.ctx, n = c.createBufferSource(); n.buffer = this._noise; const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain(); this._env(g, t, 0.005, dur, vol); n.connect(f); f.connect(g); g.connect(this.sfxGain); n.start(t); n.stop(t + dur + 0.05);
  }
  tone(t, f0, f1, dur, vol, type = 'sine') {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    this._env(g, t, 0.005, dur, vol); o.connect(g); g.connect(this.sfxGain); o.start(t); o.stop(t + dur + 0.05);
  }
  sfx(name) {
    if (!this.ctx || !this.enabled) return; const t = this.ctx.currentTime;
    switch (name) {
      case 'sword': this.noiseBurst(t, 0.12, 3500, 1.2, 0.35, 'highpass'); this.tone(t, 2200, 900, 0.08, 0.08, 'triangle'); break;
      case 'clash': this.noiseBurst(t, 0.18, 4200, 3, 0.4); this.tone(t, 3100, 2600, 0.35, 0.18, 'triangle'); this.tone(t, 1250, 1200, 0.5, 0.1, 'sine'); break;
      case 'hit': this.noiseBurst(t, 0.1, 700, 1, 0.45); this.tone(t, 180, 60, 0.12, 0.3); break;
      case 'hurt': this.noiseBurst(t, 0.15, 400, 1, 0.5); this.tone(t, 140, 50, 0.25, 0.4); break;
      case 'arrow': this.noiseBurst(t, 0.22, 1800, 0.8, 0.3, 'bandpass'); this.tone(t, 900, 300, 0.2, 0.06, 'sine'); break;
      case 'bowdraw': this.noiseBurst(t, 0.3, 300, 0.7, 0.12, 'lowpass'); this.tone(t, 120, 260, 0.35, 0.08, 'triangle'); break;
      case 'gada': this.tone(t, 90, 30, 0.35, 0.7); this.noiseBurst(t, 0.3, 250, 0.8, 0.5, 'lowpass'); break;
      case 'dodge': this.noiseBurst(t, 0.18, 1200, 0.6, 0.18, 'bandpass'); break;
      case 'pickup': this.tone(t, 880, 1320, 0.12, 0.2); this.tone(t + 0.1, 1320, 1760, 0.15, 0.18); break;
      case 'die': this.tone(t, 200, 40, 0.6, 0.5, 'sawtooth'); this.noiseBurst(t, 0.5, 300, 0.5, 0.4, 'lowpass'); break;
      case 'ui': this.tone(t, 660, 990, 0.08, 0.12, 'triangle'); break;
      case 'unlock': [0, 0.12, 0.24, 0.36].forEach((d, i) => this.tone(t + d, 440 * Math.pow(1.26, i), 440 * Math.pow(1.26, i), 0.3, 0.2)); break;
      case 'shankh': { const o = this.ctx.createOscillator(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(196, t); o.frequency.linearRampToValueAtTime(205, t + 2.5);
        f.type = 'bandpass'; f.frequency.value = 800; f.Q.value = 4; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.5); g.gain.setValueAtTime(0.5, t + 2.4); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.6);
        o.connect(f); f.connect(g); g.connect(this.sfxGain); o.start(t); o.stop(t + 3.7); this.tone(t, 392, 410, 3.2, 0.12, 'triangle'); break; }
      case 'vayu': this.noiseBurst(t, 1.6, 900, 0.4, 0.6, 'bandpass'); this.tone(t, 300, 1800, 1.5, 0.15, 'sine'); break;
      case 'agni': this.noiseBurst(t, 1.4, 500, 0.3, 0.7, 'lowpass'); this.tone(t, 80, 40, 1.2, 0.5, 'sawtooth'); this.noiseBurst(t + 0.2, 1.2, 4000, 0.5, 0.25, 'highpass'); break;
      case 'varun': this.noiseBurst(t, 1.8, 1200, 0.3, 0.5, 'lowpass'); this.tone(t, 500, 150, 1.4, 0.2, 'sine'); break;
      case 'naag': this.noiseBurst(t, 1.2, 6000, 2, 0.35, 'highpass'); this.tone(t, 220, 660, 0.9, 0.25, 'triangle'); this.tone(t + 0.4, 660, 220, 0.9, 0.2, 'triangle'); break;
      case 'bhoomi': this.tone(t, 60, 25, 1.4, 0.9); this.noiseBurst(t, 1.3, 150, 0.6, 0.7, 'lowpass'); this.noiseBurst(t + 0.3, 0.6, 2500, 1, 0.3); break;
      case 'him': this.tone(t, 1800, 4200, 1.3, 0.2, 'sine'); this.noiseBurst(t, 1.5, 7000, 1.5, 0.3, 'highpass'); this.tone(t + 0.8, 3000, 200, 0.6, 0.25, 'triangle'); break;
      case 'bind': this.tone(t, 1200, 300, 0.6, 0.3, 'square'); this.noiseBurst(t, 0.6, 3000, 2, 0.3); break;
      case 'heal': [0, 0.2, 0.4, 0.6, 0.8].forEach((d, i) => this.tone(t + d, 523 * Math.pow(1.122, i), 523 * Math.pow(1.122, i), 0.5, 0.15)); break;
      case 'shatter': this.noiseBurst(t, 0.8, 5000, 1, 0.6, 'highpass'); this.tone(t, 2400, 200, 0.5, 0.3, 'triangle'); this.tone(t + 0.1, 70, 30, 1.2, 0.8); break;
      case 'rumble': this.tone(t, 50, 40, 2.5, 0.6); this.noiseBurst(t, 2.5, 120, 0.5, 0.5, 'lowpass'); break;
      case 'vipatti': this.tone(t, 150, 60, 1.0, 0.5, 'sawtooth'); break;
    }
  }
}
