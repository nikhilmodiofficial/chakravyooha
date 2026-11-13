// gtm.js — Chakravyooha in-game growth layer (drop into js/ and import from main.js)
// Zero dependencies. No PII leaves the device. Analytics is cookieless + aggregate (GoatCounter),
// sent as a plain beacon (no third-party script, so the CSP stays script-src 'self').
// Off unless index.html has <meta name="gc-site" content="<your goatcounter code>">.
//
// Usage (main.js):
//   import * as gtm from './gtm.js';
//   gtm.init({ baseUrl: 'https://nikhilmodiofficial.github.io/chakravyooha/' });
//   gtm.track('ring_start', { ring: 1 });            // on ring enter
//   gtm.track('ring_clear', { ring: 1 });            // on boss defeated
//   const link = gtm.mitraLink(roomCode);            // when Mitra Smaran link is created
//   gtm.onFriendJoined();                            // on the friend's device, after #join is parsed
//   gtm.share({ ringsCleared: 7, timeSec: 2292, satyakiName: 'Ravi' }); // end screen button

const LS_KEY = 'cv_gtm_v1';
const TOTAL_RINGS = 7;
const LAUNCH_DAY = Date.UTC(2026, 10, 18); // day #1 of "Aaj ka Vyooha" daily challenge (18 Nov 2026, IST date)

let cfg = { baseUrl: location.origin + location.pathname, debug: false };
let state = null;

function load() {
  try { state = JSON.parse(localStorage.getItem(LS_KEY)) || null; } catch { state = null; }
  if (!state) state = { pid: rid(8), firstTouch: null, firstSeen: Date.now(), runs: 0, sentEvents: {} };
}
function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* private mode */ } }

function rid(n) {
  const a = 'abcdefghjkmnpqrstuvwxyz23456789';
  const buf = new Uint8Array(n); crypto.getRandomValues(buf);
  return Array.from(buf, b => a[b % a.length]).join('');
}
const clean = (s, max = 24) => String(s || '').replace(/[^\p{L}\p{N} ._-]/gu, '').trim().slice(0, max);

// ---------- attribution ----------
function parseTouch() {
  const q = new URLSearchParams(location.search);
  const h = new URLSearchParams(location.hash.replace(/^#/, ''));
  const touch = {
    src: clean(q.get('utm_source') || q.get('s') || (h.get('join') ? 'mitra' : '') || (document.referrer ? hostOf(document.referrer) : 'direct'), 32),
    camp: clean(q.get('utm_campaign') || '', 40),
    ref: clean(q.get('ref') || h.get('from') || '', 12), // inviter's anonymous pid
    at: Date.now()
  };
  return touch;
}
function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return 'unknown'; } }

export function init(opts = {}) {
  cfg = { ...cfg, ...opts };
  load();
  const touch = parseTouch();
  if (!state.firstTouch) {
    state.firstTouch = touch;
    save();
    track('first_visit', { src: touch.src });
    if (touch.ref) track('referred_visit', { src: touch.src });
  }
  track('visit', { src: touch.src });
  return state.pid;
}

// ---------- analytics (cookieless, aggregate) ----------
// Event path format "evt/<name>" or "evt/<name>/<detail>" so the engine can build a funnel.
// once=true events are only counted once per device (gives "unique players" without IDs).
const ONCE = new Set(['first_visit', 'referred_visit', 'ring_start/1', 'ring_clear/1', 'run_complete', 'mitra_join', 'share']);

export function track(name, meta = {}) {
  if (!state) load();
  const detail = meta.ring ? `/${meta.ring}` : (meta.src ? `/${meta.src}` : '');
  const key = name + (meta.ring ? `/${meta.ring}` : '');
  if (ONCE.has(key) || ONCE.has(name)) {
    if (state.sentEvents[key]) return;
    state.sentEvents[key] = 1; save();
  }
  const path = `evt/${name}${detail}`;
  if (cfg.debug) console.log('[gtm]', path);
  beacon(path, name);
}

function beacon(path, title) {
  try {
    const site = (document.querySelector('meta[name="gc-site"]') || {}).content;
    if (!site || navigator.webdriver && !cfg.allowBot) return;
    const q = new URLSearchParams({ p: path, t: title, e: 'true', s: `${screen.width},${screen.height},${devicePixelRatio || 1}`, rnd: rid(6) });
    fetch(`https://${site}.goatcounter.com/count?${q}`, { mode: 'no-cors', keepalive: true, credentials: 'omit', referrerPolicy: 'no-referrer' }).catch(() => {});
  } catch { /* never break the game for analytics */ }
}

// ---------- Mitra Smaran (the K-factor loop) ----------
export function mitraLink(room) {
  const url = `${cfg.baseUrl}?s=mitra&ref=${state.pid}#join=${encodeURIComponent(room)}&from=${state.pid}`;
  track('mitra_link_created');
  return url;
}
// Decorate the game's own join link (keeps its #join=cv... format, adds attribution).
export function tagJoinLink(link) {
  try {
    const u = new URL(link, location.href);
    u.searchParams.set('s', 'mitra'); u.searchParams.set('ref', state.pid);
    u.hash = u.hash + (u.hash.includes('from=') ? '' : `&from=${state.pid}`);
    return u.toString();
  } catch { return link; }
}
export const pid = () => (state ? state.pid : '');
export function mitraMessage(room, playerName = '') {
  const who = clean(playerName) || 'Abhimanyu';
  return `${who} Chakravyooha ke 7ve dwar pe gir gaya hai. Satyaki sirf tum ho.\n` +
         `Is link pe aao, 3 baan chalao, usse bachao (2 min, koi install nahi):\n${mitraLink(room)}`;
}
export function onFriendJoined() { track('mitra_join'); }
export function onFriendSaved() { track('mitra_saved'); }

// ---------- spoiler-free share (Wordle-style artifact) ----------
// Day number in IST so every Indian player shares the same puzzle day.
export function istDay(d = new Date()) { const t = new Date(d.getTime() + 5.5 * 3600e3); return Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()); }
export function dailyNumber(d = new Date()) { return Math.max(1, Math.floor((istDay(d) - LAUNCH_DAY) / 864e5) + 1); }
function bar(n) { return '▰'.repeat(n) + '▱'.repeat(Math.max(0, TOTAL_RINGS - n)); }
function mmss(t) { t = Math.max(0, Math.round(t || 0)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; }

export function shareText({ ringsCleared = 0, timeSec = 0, satyakiName = '', daily = false } = {}) {
  const head = daily ? `Aaj ka Vyooha #${dailyNumber()}` : 'Chakravyooha';
  const line2 = ringsCleared >= TOTAL_RINGS
    ? (satyakiName ? `Satyaki: ${clean(satyakiName)}. Abhimanyu zinda lauta.` : 'Abhimanyu zinda lauta.')
    : `Ring ${ringsCleared + 1} pe gira. Kya tum aage jaa paoge?`;
  const url = `${cfg.baseUrl}?s=share&ref=${state.pid}${daily ? '&utm_campaign=daily' : ''}`;
  return `${head}  ${ringsCleared}/${TOTAL_RINGS} ${bar(ringsCleared)}  ${mmss(timeSec)}\n${line2}\n${url}`;
}

export async function share(result = {}, canvas = null) {
  const text = shareText(result);
  track('share');
  try {
    if (canvas && navigator.canShare) {
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      const file = new File([blob], 'chakravyooha.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) { await navigator.share({ text, files: [file] }); return 'native-image'; }
    }
    if (navigator.share) { await navigator.share({ text }); return 'native'; }
  } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
  try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  return 'whatsapp';
}

export function runCompleted() { state.runs++; save(); track('run_complete'); }
export function firstTouch() { if (!state) load(); return state.firstTouch; }
