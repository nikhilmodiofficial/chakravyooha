// Voice: pre-generated character clips (assets/voice/<id>.mp3, listed in assets/voice/manifest.json) when present,
// browser SpeechSynthesis otherwise (hi-IN / en-IN, pitch+rate per character). Every line also holds for a reading-time floor,
// so subtitles never flash past, even if TTS errors or is unavailable.
import { CHARACTERS } from './config.js';

export class Voice {
  constructor() {
    this.enabled = ('speechSynthesis' in window); this.muted = false; this.voice = null; this.voiceEn = null; this.lang = 'hi'; this.manifest = null; this.current = null; this._cancel = null;
    if (this.enabled) { this._pick(); window.speechSynthesis.onvoiceschanged = () => this._pick(); }
    fetch('assets/voice/manifest.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(m => { if (m && Array.isArray(m.clips)) { this.manifest = new Map(); for (const f of m.clips) this.manifest.set(f.replace(/\.[a-z0-9]+$/i, ''), f); } }).catch(() => { });
  }
  _pick() {
    const vs = window.speechSynthesis.getVoices(); if (!vs.length) return;
    const hi = vs.filter(v => /^hi/i.test(v.lang)); const en = vs.filter(v => /^en-IN/i.test(v.lang)).concat(vs.filter(v => /^en/i.test(v.lang)));
    this.voice = hi.find(v => /google|microsoft|natural|neural/i.test(v.name)) || hi[0] || null;
    this.voiceEn = en.find(v => /google|microsoft|natural|neural/i.test(v.name)) || en[0] || null;
  }
  readMs(text) { const n = text.replace(/\([^)]*\)/g, '').length; return Math.min(9000, 900 + n * (this.lang === 'hi' ? 44 : 36)); }
  stop() { if (this.enabled) window.speechSynthesis.cancel(); if (this.current) { try { this.current.pause(); } catch (e) { } this.current = null; } if (this._cancel) { this._cancel(); this._cancel = null; } }
  // Resolves when the line is "done": max(reading floor, audio end). Can be cut short via stop() (tap-to-advance).
  say(who, text, id) {
    const floor = this.readMs(text); const start = performance.now();
    return new Promise(resolve => {
      let done = false, timer = null; const finish = () => { if (done) return; done = true; clearTimeout(timer); if (this._cancel === now) this._cancel = null; resolve(); };
      const fin = () => { if (done || timer) return; const left = floor - (performance.now() - start); timer = setTimeout(finish, Math.max(0, left)); };
      const now = () => finish();
      this._cancel = now;
      if (this.muted) { setTimeout(fin, 0); return; }
      // 1) pre-generated clip
      const cid = id ? id + (this.lang === 'en' ? '.en' : '') : null;
      if (cid && this.manifest && this.manifest.has(cid)) {
        const a = new Audio('assets/voice/' + this.manifest.get(cid)); this.current = a; a.onended = fin; a.onerror = () => this._tts(who, text, fin); a.play().catch(() => this._tts(who, text, fin)); return;
      }
      this._tts(who, text, fin);
    });
  }
  _tts(who, text, fin) {
    const v = this.lang === 'en' ? this.voiceEn : this.voice;
    if (!this.enabled || !v) { setTimeout(fin, 0); return; }
    const clean = text.replace(/^[^:]{1,16}:\s*/, '').replace(/\([^)]*\)/g, '').trim(); if (!clean) { setTimeout(fin, 0); return; }
    const u = new SpeechSynthesisUtterance(clean); const c = CHARACTERS[who] || CHARACTERS.sanjaya;
    u.voice = v; u.lang = v.lang; u.pitch = c.pitch; u.rate = c.rate * (this.lang === 'en' ? 1 : 0.97); u.volume = 1;
    u.onend = fin; u.onerror = fin; // on error the reading-time floor still applies
    try { window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch (e) { fin(); }
    setTimeout(fin, this.readMs(text) + 6000); // hard safety
  }
}
