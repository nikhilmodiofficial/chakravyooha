// Adaptive difficulty. Numbers live in rules.js (RULES.adaptive).
// mercy (0..3): rises with each fall on a ring; help arrives as blessings, never as "easy mode".
// pro (0..maxLevel): rises when a ring is cleared fast, healthy and without falling; the Vyooha quietly tightens.
import { RULES, RINGS } from './config.js';

const AD = RULES.adaptive;

export class Adaptive {
  constructor(save) { this.save = save; const d = save.d; if (!d.adapt) d.adapt = { pro: 0, deaths: {} }; this.d = d.adapt; }
  persist() { this.save.set('adapt', this.d); }
  mercy(ring) { return AD.enabled ? Math.min(3, this.d.deaths[ring] || 0) : 0; }
  pro() { return AD.enabled ? Math.min(AD.pro.maxLevel, this.d.pro || 0) : 0; }
  onDeath(ring) { this.d.deaths[ring] = (this.d.deaths[ring] || 0) + 1; this.d.pro = Math.max(0, (this.d.pro || 0) - 1); this.persist(); }
  onRingClear(ring, seconds, hpPct) {
    const fell = (this.d.deaths[ring] || 0) > 0, target = (RINGS[ring].minutes || 4) * 60;
    if (!fell && seconds < target * AD.pro.fastIfUnder && hpPct > AD.pro.healthyAbove) this.d.pro = Math.min(AD.pro.maxLevel, (this.d.pro || 0) + 1);
    else if (fell || hpPct < 0.25) this.d.pro = Math.max(0, (this.d.pro || 0) - 1);
    this.d.deaths[ring] = 0; this.persist();
  }
  reset() { this.d.pro = 0; this.d.deaths = {}; this.persist(); }
  // the modifiers a World applies for this ring
  mods(ring) {
    const m = this.mercy(ring), p = m > 0 ? 0 : this.pro(), M = AD.mercy, P = AD.pro;
    return {
      mercy: m, pro: p,
      soldiersMult: M.soldiersMult[m] * P.soldiersMult[p],
      bossHpMult: M.bossHpMult[m],
      enemyDamageTakenMult: P.enemyDamageTakenMult[p],
      enemyDmgMult: P.enemyDmgMult[p],
      shaktiAtStart: M.shaktiAtStart[m],
      extraHealDrops: M.extraHealDrops[m],
      extraBigAstra: M.extraBigAstra[m],
      lifeDrop: { belowPct: M.lifeDrop.belowPct, every: m > 0 ? M.lifeDrop.every : M.lifeDrop.everyNoMercy },
    };
  }
}
