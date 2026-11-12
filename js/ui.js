// DOM UI layer: HUD, menus, subtitles, touch buttons. All text set via textContent (no HTML injection).
import { ASTRAS, RINGS } from './config.js';
import { T, tr } from './i18n.js';
const $ = id => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

export class UI {
  constructor() {
    this.hud = $('hud'); this.menu = $('menu'); this.sub = $('subtitle'); this.cine = $('cine'); this.toastEl = $('toast'); this.banner = $('banner'); this.vip = $('vipatti');
    this.hpFill = $('hp-fill'); this.hpText = $('hp-text'); this.bossBar = $('boss-bar'); this.bossFill = $('boss-fill'); this.bossName = $('boss-name'); this.ringName = $('ring-name'); this.ringSub = $('ring-sub'); this.astraBtn = $('btn-astra'); this.timer = $('timer'); this.objective = $('objective');
    this.p2 = $('p2'); this.p2Fill = $('p2-fill'); this.skipBar = $('skip-fill'); this.skipHint = $('skip-hint');
    this._bannerT = null;
  }
  showHud(on) { this.hud.classList.toggle('hidden', !on); }
  setRing(ring, role) { this.ringName.textContent = ring.name; this.ringSub.textContent = ring.sub + (role === 'satyaki' ? ' — सात्यकि' : ''); }
  updateHud(world, hero, elapsed, p2) {
    const pct = Math.max(0, hero.hp / hero.maxHp); this.hpFill.style.width = (pct * 100) + '%'; this.hpFill.classList.toggle('low', pct < 0.2); this.hpText.textContent = Math.ceil(hero.hp) + ' / ' + hero.maxHp + '   ·   ' + T('hp') + ' ' + hero.arrows + '/' + hero.maxArrows + (hero.weaponsBroken && hero.weaponsBroken.bow ? ' ' + T('bowBroken') : '');
    const b = world.boss; if (b && b.alive && world.bossIntroT <= 0) { this.bossBar.classList.remove('hidden'); this.bossFill.style.width = (b.hpPct * 100) + '%'; this.bossName.textContent = b.def.name; this.bossFill.classList.toggle('p2', b.phase === 2); } else this.bossBar.classList.add('hidden');
    this.updateWeapons(hero);
    const show = hero.kind === 'abhimanyu' && !world.scripted && hero.shakti !== undefined; this.astraBtn.classList.toggle('hidden', !show);
    if (show) { const can = world.canAstra(hero), big = world.canBigAstra && world.canBigAstra(hero); const A = ASTRAS[hero.astra || 'vayu']; const p = Math.min(1, (hero.shakti || 0) / hero.shaktiMax);
      this.astraBtn.style.setProperty('--p', (big ? 1 : p).toFixed(3)); this.astraBtn.style.setProperty('--c', A.glow); this.astraBtn.classList.toggle('ready', can); this.astraBtn.classList.toggle('big', !!big);
      this.astraBtn.querySelector('.lbl').textContent = big ? A.name : T('shakti'); this.astraBtn.querySelector('.st').textContent = big ? T('astraBig') : (can ? T('shaktiReady') : Math.round(p * 100) + '%' + (hero.astra && !hero.astraUsed && world.boss && world.boss.alive ? ' · ' + T('astraHint') : '')); }
    const m = Math.floor(elapsed / 60), s = Math.floor(elapsed % 60); this.timer.textContent = m + ':' + (s < 10 ? '0' : '') + s;
    this.vip.classList.toggle('on', !!world.vipatti);
    if (p2) { this.p2.classList.remove('hidden'); this.p2Fill.style.width = (Math.max(0, p2.hp / p2.maxHp) * 100) + '%'; } else this.p2.classList.add('hidden');
  }
  hypeWord(text, strong) { const el = document.getElementById('hype'); el.textContent = text; el.classList.remove('show', 'strong'); void el.offsetWidth; el.classList.add('show'); if (strong) el.classList.add('strong'); clearTimeout(this._hypeT); this._hypeT = setTimeout(() => el.classList.remove('show'), strong ? 2600 : 1600); }
  setObjective(text) { this.objective.textContent = tr(text || ''); }
  toast(text, ms = 2200) { const t = el('div', 'toast-item', tr(text)); this.toastEl.appendChild(t); setTimeout(() => t.classList.add('show'), 20); setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, ms); }
  // in-game dialogue banner (top)
  say(who, text, color, ms) { this.banner.classList.remove('hidden'); this.banner.querySelector('.who').textContent = who || ''; this.banner.querySelector('.txt').textContent = text; this.banner.querySelector('.who').style.color = color || '#F4C95D'; clearTimeout(this._bannerT); this._bannerT = setTimeout(() => this.banner.classList.add('hidden'), ms || Math.min(9000, 1800 + text.length * 50)); }
  hideBanner() { this.banner.classList.add('hidden'); }
  // cinematic
  showCinematic(on, seen) { this.cine.classList.toggle('hidden', !on); this.skipHint.textContent = T('nextLine'); }
  cineTitle(t) { $('cine-title').textContent = t; $('cine-title').classList.toggle('hidden', !t); }
  subtitle(who, text, color) { this.sub.classList.toggle('hidden', !text); this.sub.querySelector('.who').textContent = who; this.sub.querySelector('.who').style.color = color || '#F4C95D'; this.sub.querySelector('.txt').textContent = text; }
  skipProgress(p, seen) { this.skipBar.style.width = (p * 100) + '%'; }
  // menus: build dynamically. buttons: [{label, sub, onClick, cls}]
  showMenu(opts) {
    this.menu.innerHTML = ''; this.menu.className = ''; const box = el('div', 'menu-box ' + (opts.cls || ''));
    if (opts.kicker) box.appendChild(el('div', 'kicker', tr(opts.kicker))); if (opts.title) box.appendChild(el('h1', 'title', tr(opts.title))); if (opts.sub) box.appendChild(el('p', 'sub', tr(opts.sub)));
    if (opts.body) { for (const line of [].concat(opts.body)) box.appendChild(el('p', 'body', tr(line))); }
    if (opts.custom) box.appendChild(opts.custom);
    const row = el('div', 'btn-row'); for (const b of opts.buttons || []) { const btn = el('button', 'btn ' + (b.cls || ''), ''); btn.appendChild(el('span', 'bl', tr(b.label))); if (b.sub) btn.appendChild(el('span', 'bs', tr(b.sub))); btn.addEventListener('click', () => b.onClick()); row.appendChild(btn); } box.appendChild(row);
    if (opts.foot) box.appendChild(el('div', 'foot', tr(opts.foot))); this.menu.appendChild(box); return box;
  }
  bossCard(b) { const c = document.getElementById('bosscard'); if (!c) return; c.innerHTML = ''; if (window.__portrait) c.appendChild(window.__portrait(b.def.look || b.key, 88, 110)); const t = document.createElement('div'); t.className = 'bc-t'; const n = document.createElement('div'); n.className = 'bc-n'; n.textContent = b.def.name; const s = document.createElement('div'); s.className = 'bc-s'; s.textContent = (window.__bios && window.__bios[b.def.look] && window.__bios[b.def.look].title) || b.def.en || ''; t.append(n, s); c.appendChild(t); c.classList.remove('hidden', 'show'); void c.offsetWidth; c.classList.add('show'); clearTimeout(this._bcT); this._bcT = setTimeout(() => c.classList.add('hidden'), 3200); }
  localizeTouch() { const L = { attack: T('tAttack'), block: T('tBlock'), switch: T('tSwitch'), jump: T('tJump'), skip: T('tSkip') }; for (const k in L) { const e = document.getElementById('btn-' + k); if (e) e.textContent = L[k]; } }
  initWeapons(drawWeapon) { if (this._wInit) return; this._wInit = true; for (const slot of document.querySelectorAll('#weapons .wslot')) { const cv = slot.querySelector('canvas'); const x = cv.getContext('2d'); x.translate(30, 40); x.scale(1.25, 1.25); if (slot.classList.contains('shield')) { x.translate(10, -6); x.fillStyle = '#5a3a22'; x.strokeStyle = '#F4C95D'; x.lineWidth = 2; x.beginPath(); x.arc(0, 0, 14, 0, Math.PI * 2); x.fill(); x.stroke(); x.beginPath(); x.arc(0, 0, 8, 0, Math.PI * 2); x.stroke(); x.fillStyle = '#F4C95D'; for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.785; x.beginPath(); x.arc(Math.cos(a) * 11, Math.sin(a) * 11, 1.6, 0, Math.PI * 2); x.fill(); } } else drawWeapon(x, slot.dataset.w, { accent: '#F4C95D' }, 0.5, 0.6); } }
  updateWeapons(hero) { const el = document.getElementById('weapons'); if (!el) return; const show = !!hero && !hero.chakra; el.classList.toggle('hidden', !show); if (!show) return; for (const slot of el.querySelectorAll('.wslot')) { const w = slot.dataset.w; if (w) { slot.classList.toggle('on', hero.weapon === w); slot.classList.toggle('broken', !!(hero.weaponsBroken && hero.weaponsBroken[w])); } else { slot.classList.toggle('on', !!hero.blocking); slot.classList.toggle('broken', !!hero.shieldBroken); } } }
  hideMenu() { this.menu.classList.add('hidden'); this.menu.innerHTML = ''; }
  showControlsHint(isTouch) { this.toast(isTouch ? T('hintTouch') : T('hintKb'), 7000); }
}
