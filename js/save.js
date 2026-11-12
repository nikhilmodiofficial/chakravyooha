// Local progress. No accounts, no cookies, nothing leaves the device.
const KEY = 'chakravyooh.save.v1';
const DEF = () => ({ ring: 0, elapsed: 0, introSeen: false, astras: [], bestTime: null, savior: 0, wins: 0, name: '', mute: false, voice: true, runs: 0 });
export class Save {
  constructor() { this.d = DEF(); try { const raw = localStorage.getItem(KEY); if (raw) { const p = JSON.parse(raw); if (p && typeof p === 'object') this.d = Object.assign(DEF(), p); } } catch (e) { } }
  write() { try { localStorage.setItem(KEY, JSON.stringify(this.d)); } catch (e) { } }
  set(k, v) { this.d[k] = v; this.write(); }
  checkpoint(ring, elapsed, astras) { this.d.ring = ring; this.d.elapsed = elapsed; this.d.astras = astras; this.write(); }
  reset() { const keep = { introSeen: this.d.introSeen, bestTime: this.d.bestTime, savior: this.d.savior, wins: this.d.wins, name: this.d.name, mute: this.d.mute, voice: this.d.voice, runs: this.d.runs }; this.d = Object.assign(DEF(), keep); this.write(); }
}
