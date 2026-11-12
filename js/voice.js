// Voice via browser SpeechSynthesis (hi-IN preferred). Subtitles are always the source of truth.
import { CHARACTERS } from './config.js';

export class Voice {
  constructor() {
    this.enabled = ('speechSynthesis' in window); this.muted = false; this.voice = null; this.ready = false;
    if (this.enabled) { this._pick(); window.speechSynthesis.onvoiceschanged = () => this._pick(); }
  }
  _pick() {
    const vs = window.speechSynthesis.getVoices(); if (!vs.length) return;
    const hi = vs.filter(v => /^hi/i.test(v.lang));
    this.voice = hi.find(v => /google|microsoft|natural/i.test(v.name)) || hi[0] || vs.find(v => /^en-IN/i.test(v.lang)) || null;
    this.ready = true;
  }
  stop() { if (this.enabled) window.speechSynthesis.cancel(); }
  // returns a promise that resolves when speech ends (or after fallback timeout)
  say(who, text) {
    const fallbackMs = Math.min(9000, 1400 + text.length * 55);
    if (!this.enabled || this.muted || !this.voice) return new Promise(r => setTimeout(r, fallbackMs));
    return new Promise(resolve => {
      const clean = text.replace(/^[^:]{1,14}:\s*/, '').replace(/\([^)]*\)/g, '').trim();
      if (!clean) return resolve();
      const u = new SpeechSynthesisUtterance(clean); const c = CHARACTERS[who] || CHARACTERS.sanjaya;
      u.voice = this.voice; u.lang = this.voice.lang; u.pitch = c.pitch; u.rate = c.rate; u.volume = 1;
      let done = false; const fin = () => { if (!done) { done = true; resolve(); } };
      u.onend = fin; u.onerror = fin; setTimeout(fin, fallbackMs + 4000);
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    });
  }
}
