// Aaj ka Vyooha: one ring, one twist, same for every player in India that day (IST). One counted attempt.
// Wordle's engine: a shared daily puzzle + a spoiler-free result that only makes sense next to your friends' results.
import { RINGS, BOSSES, RULES } from './config.js';
import { dailyNumber, pid } from './gtm.js';

// Ring order cycles through rings 1-6 (ring 7 is the story finale, never a daily).
const ORDER = [3, 0, 4, 1, 5, 2];
// Twists only touch systems the World already reads (mods) or the hero's starting state, so they are always enforced.
export const TWISTS = [
  { id: 'wounded', en: 'Wounded: start at 60% life', hi: 'घायल: 60% प्राण से शुरू', hero: h => { h.hp = h.maxHp * 0.6; } },
  { id: 'noAstra', en: 'No astra today', hi: 'आज कोई अस्त्र नहीं', hero: h => { h.astra = null; h.astraUsed = true; } },
  { id: 'swarm', en: 'Double the army', hi: 'दुगनी सेना', mods: m => { m.soldiersMult *= 1.7; } },
  { id: 'iron', en: 'Iron maharathi (+30% life)', hi: 'लौह महारथी (+30% प्राण)', mods: m => { m.bossHpMult *= 1.3; } },
  { id: 'glass', en: 'Every blow hurts more', hi: 'हर वार भारी', mods: m => { m.enemyDmgMult *= 1.35; } },
];

export function today() {
  const n = dailyNumber();
  const ring = ORDER[(n - 1) % ORDER.length];
  const twist = TWISTS[((n - 1) + Math.floor((n - 1) / ORDER.length) * 2) % TWISTS.length];
  return { n, ring, boss: RINGS[ring].boss, bossName: BOSSES[RINGS[ring].boss].name, twist };
}

// Neutral mods (no adaptive help or pressure) so everyone faces the same fight.
export function mods(d) {
  const M = RULES.adaptive.mercy, P = RULES.adaptive.pro;
  const m = {
    mercy: 0, pro: 0,
    soldiersMult: M.soldiersMult[0] * P.soldiersMult[0], bossHpMult: M.bossHpMult[0],
    enemyDamageTakenMult: P.enemyDamageTakenMult[0], enemyDmgMult: P.enemyDmgMult[0],
    shaktiAtStart: 0, extraHealDrops: 0, extraBigAstra: 0,
    lifeDrop: { belowPct: M.lifeDrop.belowPct, every: M.lifeDrop.everyNoMercy },
  };
  if (d.twist.mods) d.twist.mods(m);
  return m;
}

export function played(save, n) { return save.d.daily && save.d.daily.n === n ? save.d.daily : null; }

export function record(save, d, res) {
  const prev = save.d.daily;
  const streak = prev && prev.n === d.n - 1 ? (save.d.dailyStreak || 0) + 1 : 1;
  save.d.daily = { n: d.n, win: res.win, time: res.time, hp: res.hp, bossLeft: res.bossLeft };
  save.d.dailyStreak = streak; save.d.dailyBest = Math.max(save.d.dailyBest || 0, streak); save.write();
  return save.d.daily;
}

const BOSS_EN = { dushasana: 'Dushasana', shalya: 'Shalya', lakshmana: 'Lakshmana', karna: 'Karna', brihadbala: 'Brihadbala', kripa: 'Kripa' };
const bar = pct => { const n = Math.max(0, Math.min(5, Math.round(pct * 5))); return '▰'.repeat(n) + '▱'.repeat(5 - n); };
const mmss = t => { t = Math.max(0, Math.round(t || 0)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };

// Spoiler-free result: life bar for a win, boss bar for a loss. Roman Hinglish travels best in WhatsApp/Insta DMs.
export function shareText(d, r, streak, en) {
  const base = location.origin + location.pathname;
  const url = `${base}?play=daily&s=daily&utm_campaign=daily&ref=${pid()}`;
  const boss = BOSS_EN[d.boss] || d.bossName;
  const head = `Aaj ka Vyooha #${d.n} · ${boss} · ${d.twist.en}`;
  const body = r.win
    ? (en ? `Won in ${mmss(r.time)}  life ${bar(r.hp)}` : `Jeeta ${mmss(r.time)} me  praan ${bar(r.hp)}`)
    : (en ? `Fell. ${boss} kept ${Math.round(r.bossLeft * 100)}%  ${bar(r.bossLeft)}` : `Gira. ${boss} ka ${Math.round(r.bossLeft * 100)}% bacha  ${bar(r.bossLeft)}`);
  const tail = streak > 1 ? `  streak ${streak}` : '';
  return `${head}\n${body}${tail}\n${url}`;
}
