// DOM UI layer: HUD, menus, subtitles, touch buttons. All text set via textContent (no HTML injection).
import { ASTRAS, RINGS } from './config.js';
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
    const pct = Math.max(0, hero.hp / hero.maxHp); this.hpFill.style.width = (pct * 100) + '%'; this.hpFill.classList.toggle('low', pct < 0.2); this.hpText.textContent = Math.ceil(hero.hp) + ' / ' + hero.maxHp + '   ·   बाण ' + hero.arrows + '/' + hero.maxArrows + (hero.weaponsBroken && hero.weaponsBroken.bow ? ' (धनुष टूटा)' : '');
    const b = world.boss; if (b && b.alive && world.bossIntroT <= 0) { this.bossBar.classList.remove('hidden'); this.bossFill.style.width = (b.hpPct * 100) + '%'; this.bossName.textContent = b.def.name; this.bossFill.classList.toggle('p2', b.phase === 2); } else this.bossBar.classList.add('hidden');
    const can = world.canAstra(hero); this.astraBtn.classList.toggle('hidden', !hero.astra); this.astraBtn.classList.toggle('ready', can); this.astraBtn.classList.toggle('used', !!hero.astraUsed);
    if (hero.astra) { const A = ASTRAS[hero.astra]; this.astraBtn.querySelector('.lbl').textContent = A.name; this.astraBtn.querySelector('.st').textContent = hero.astraUsed ? 'प्रयुक्त' : (can ? 'अस्त्र आह्वान!' : 'शत्रु ≤ 50% पर'); }
    const m = Math.floor(elapsed / 60), s = Math.floor(elapsed % 60); this.timer.textContent = m + ':' + (s < 10 ? '0' : '') + s;
    this.vip.classList.toggle('on', !!world.vipatti);
    if (p2) { this.p2.classList.remove('hidden'); this.p2Fill.style.width = (Math.max(0, p2.hp / p2.maxHp) * 100) + '%'; } else this.p2.classList.add('hidden');
  }
  setObjective(text) { this.objective.textContent = text || ''; }
  toast(text, ms = 2200) { const t = el('div', 'toast-item', text); this.toastEl.appendChild(t); setTimeout(() => t.classList.add('show'), 20); setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, ms); }
  // in-game dialogue banner (top)
  say(who, text, color, ms) { this.banner.classList.remove('hidden'); this.banner.querySelector('.who').textContent = who || ''; this.banner.querySelector('.txt').textContent = text; this.banner.querySelector('.who').style.color = color || '#F4C95D'; clearTimeout(this._bannerT); this._bannerT = setTimeout(() => this.banner.classList.add('hidden'), ms || Math.min(9000, 1800 + text.length * 50)); }
  hideBanner() { this.banner.classList.add('hidden'); }
  // cinematic
  showCinematic(on, seen) { this.cine.classList.toggle('hidden', !on); this.skipHint.textContent = seen ? 'छोड़ें: Space / टैप' : 'छोड़ने के लिए Space दबाए रखें'; }
  cineTitle(t) { $('cine-title').textContent = t; $('cine-title').classList.toggle('hidden', !t); }
  subtitle(who, text, color) { this.sub.classList.toggle('hidden', !text); this.sub.querySelector('.who').textContent = who; this.sub.querySelector('.who').style.color = color || '#F4C95D'; this.sub.querySelector('.txt').textContent = text; }
  skipProgress(p, seen) { this.skipBar.style.width = (p * 100) + '%'; }
  // menus: build dynamically. buttons: [{label, sub, onClick, cls}]
  showMenu(opts) {
    this.menu.innerHTML = ''; this.menu.classList.remove('hidden'); const box = el('div', 'menu-box ' + (opts.cls || ''));
    if (opts.kicker) box.appendChild(el('div', 'kicker', opts.kicker)); if (opts.title) box.appendChild(el('h1', 'title', opts.title)); if (opts.sub) box.appendChild(el('p', 'sub', opts.sub));
    if (opts.body) { for (const line of [].concat(opts.body)) box.appendChild(el('p', 'body', line)); }
    if (opts.custom) box.appendChild(opts.custom);
    const row = el('div', 'btn-row'); for (const b of opts.buttons || []) { const btn = el('button', 'btn ' + (b.cls || ''), ''); btn.appendChild(el('span', 'bl', b.label)); if (b.sub) btn.appendChild(el('span', 'bs', b.sub)); btn.addEventListener('click', () => b.onClick()); row.appendChild(btn); } box.appendChild(row);
    if (opts.foot) box.appendChild(el('div', 'foot', opts.foot)); this.menu.appendChild(box); return box;
  }
  hideMenu() { this.menu.classList.add('hidden'); this.menu.innerHTML = ''; }
  showControlsHint(isTouch) { this.toast(isTouch ? 'बायाँ अंगूठा: चलना · दायाँ: तलवार / धनुष (दबाए रखें) / गदा / छलांग' : 'WASD चलना · J तलवार · K धनुष (दबाए रखें) · L गदा · Space छलांग · U अस्त्र', 6000); }
}
