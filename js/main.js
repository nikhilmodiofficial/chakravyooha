// Chakravyooha — orchestration: states, menus, co-op wiring, loop.
import { RINGS, ASTRAS, BOSSES, CHARACTERS, INTRO, RING_LINES, EPILOGUE, RING7, CODEX, HYPE } from './config.js';
import { Hero } from './entities.js';
import { World } from './world.js';
import { Renderer } from './render.js';
import { Input } from './input.js';
import { AudioEngine } from './audio.js';
import { Voice } from './voice.js';
import { UI } from './ui.js';
import { Cinematic, wait } from './cinematic.js';
import { Ring7 } from './ring7.js';
import { Save } from './save.js';
import { Host, Client, joinLink, snapshot, applySnapshot, makeProxyWorld, cleanName } from './coop.js';
import { renderCard, shareCard, downloadCard, whatsappLink, fmtTime } from './share.js';
import { Home, portraitCanvas } from './home.js';
import { drawWeapon } from './art.js';
import { T, lang, setLang, tr } from './i18n.js';
// canvas text written inline in Hindi (names, gate labels, float text, share card) follows the chosen language
{ const P = CanvasRenderingContext2D.prototype; for (const f of ['fillText', 'strokeText', 'measureText']) { const o = P[f]; P[f] = function (t, ...a) { return o.call(this, tr(t), ...a); }; } }
import { CHAR_BIOS } from './config.js';
window.__T = T; window.__bios = CHAR_BIOS; window.__portrait = (k, w, h) => portraitCanvas(k, w, h);

class Game {
  constructor() {
    this.canvas = document.getElementById('game'); this.ui = new UI(); this.r = new Renderer(this.canvas); this.input = new Input(this.canvas); this.audio = new AudioEngine(); this.voice = new Voice(); this.save = new Save(); this.cine = new Cinematic(this.r, this.voice, this.audio, this.ui);
    this.state = 'title'; this.world = null; this.ring7 = null; this.elapsed = 0; this.ringIdx = 0; this.abhi = null; this.satyaki = null; this.coop = { mode: 'none', host: null, client: null, friend: null }; this.proxy = null; this.last = performance.now(); this.t = 0; this.netT = 0; this.waitT = 0;
    this.voice.muted = !this.save.d.voice; this.audio.setMute(!!this.save.d.mute); this.home = new Home(this); this.ui.initWeapons(drawWeapon); this.setLanguage(this.save.d.langChosen && this.save.d.lang ? this.save.d.lang : 'en');
    this.bindTouch(); window.addEventListener('beforeunload', () => { if (this.coop.host) this.coop.host.close(); if (this.coop.client) this.coop.client.close(); });
    const m = location.hash.match(/join=(cv[a-z0-9]{10})/); if (m) this.clientFlow(m[1]); else this.title();
    requestAnimationFrame(t => this.loop(t));
  }
  bindTouch() { const b = document.getElementById('touch'); b.classList.toggle('hidden', !this.input.isTouch); for (const n of ['attack', 'block', 'switch', 'jump', 'astra', 'skip']) { const e = document.getElementById('btn-' + n); if (e) this.input.bindButton(e, n); } }
  gesture() { this.audio.init(); }
  netSay(line) { if (this.coop.host) this.coop.host.send({ t: 'ev', k: 'say', who: line.who, text: line.text }); }
  sayLine(line) { if (!line) return; const c = CHARACTERS[line.who]; this.ui.say(c.name, line.text, c.color); this.voice.say(line.who, line.text, line.id); this.netSay(line); }
  sayRaw(text, color, id) { const i = text.indexOf(':'); const who = i > 0 && i < 14 ? text.slice(0, i) : ''; this.ui.say(who, i > 0 && i < 14 ? text.slice(i + 1).trim() : text, color); const key = Object.keys(CHARACTERS).find(k => CHARACTERS[k].name === who) || (who ? 'enemy' : 'sanjaya'); this.voice.say(key, text, id); if (this.coop.host) this.coop.host.send({ t: 'ev', k: 'say', who: key, text }); }

  // ---------- TITLE ----------
  title() { this.state = 'title'; this.ui.showHud(false); this.ui.hideMenu(); this.audio.playMusic('menu', 84); this.voice.stop(); this.home.show(null); }
  setLanguage(l, explicit) { setLang(l); this.voice.lang = l; this.save.d.lang = l; if (explicit) this.save.d.langChosen = true; this.save.write(); document.documentElement.lang = l; if (this.ui) this.ui.localizeTouch(); }
  introScenes() { return INTRO; }
  // ---------- RUN ----------
  async startRun(ringIdx) {
    this.ui.hideMenu(); this.home.hide(); this.ringIdx = ringIdx; this.elapsed = ringIdx === 0 ? 0 : this.save.d.elapsed; this.save.d.runs++; this.save.write();
    this.abhi = new Hero('abhimanyu', 0, 0); this.abhi.name = 'अभिमन्यु';
    if (ringIdx === 0) { this.state = 'cine'; this.audio.playMusic('cinematic', 84); await this.cine.play(INTRO, { seenBefore: this.save.d.introSeen, idPrefix: 'intro' }); this.save.set('introSeen', true); }
    this.startRing(ringIdx);
  }
  startRing(idx) {
    this.ringIdx = idx; this.ui.hideMenu(); this.home.hide(); this.ui.showHud(true); this.voice.stop();
    const heroes = [this.abhi]; if (this.coop.mode === 'host' && this.coop.friend && idx < 6) { if (!this.satyaki) { this.satyaki = new Hero('satyaki', 0, 0); this.satyaki.name = 'सात्यकि'; } this.satyaki.hp = this.satyaki.maxHp; this.satyaki.alive = true; this.satyaki.state = 'idle'; heroes.push(this.satyaki); }
    const before = this.abhi.hp; this.abhi.hp = idx === 0 ? this.abhi.maxHp : Math.min(this.abhi.maxHp, Math.max(this.abhi.hp + this.abhi.maxHp * 0.4, this.abhi.maxHp * 0.75)); this._gateHeal = Math.round(this.abhi.hp - before); this.abhi.alive = true; this.abhi.state = 'idle'; this.abhi.weaponsBroken = { bow: false, gada: false }; this.abhi.arrows = this.abhi.maxArrows; this.abhi.shieldBroken = false; this.abhi.blocking = false; this.abhi.weapon = 'sword'; this.abhi.shakti = this.abhi.shakti || 0;
    const ring = RINGS[idx]; this.ui.setRing(ring);
    this.world = new World(idx, heroes, this.audio, {
      wave: n => { this.ui.toast(n === 1 ? T('toastWave1') : T('toastWave2'), 1800); this.ui.setObjective(T('objWave')); },
      bossIntro: b => { this.ui.setObjective(T('objBoss') + b.def.name + T('objBoss2')); this.ui.bossCard(b); this.sayRaw(b.def.intro, b.def.accent, 'boss_' + b.key + '_intro'); this.audio.playMusic('boss', ring.bpm + 8); if (this.coop.host) this.coop.host.send({ t: 'ev', k: 'obj', text: 'महारथी: ' + b.def.name }); },
      phase2: b => { if (this.abhi.astra) { this.ui.toast(T('toastAstra') + ASTRAS[this.abhi.astra].name + ' (E)', 3000); this.ui.setObjective(b.def.name + T('objAstra')); } else this.ui.setObjective(b.def.name + T('objKeep')); },
      heroDown: h => { if (h === this.abhi) this.onDeath(); },
      bossDefeated: b => { this.sayRaw(b.def.defeat, '#F1E7D0', 'boss_' + b.key + '_defeat'); if (this.world.nabhi && this.world.nabhi.hp > 0) this.ui.setObjective('सात्यकि: व्यूह-नाभि गिराओ!'); else this.ui.setObjective(T('objGate')); this.ui.toast(T('toastGate'), 3000); },
      ringDone: () => this.onRingDone(),
      vipatti: () => { this.ui.toast(T('toastVip'), 2200); this.hype('vipatti', true); },
      nabhi: () => { this.ui.toast(T('toastNabhi'), 2500); },
      hype: (key, strong) => this.hype(key, strong)
    });
    if (heroes.length > 1 && this.world.arena.wallPoint) { const wp = this.world.arena.wallPoint(-0.36, 70); this.world.nabhi = { x: wp.x, y: wp.y, hp: 160 + idx * 40, maxHp: 160 + idx * 40 }; }
    this.ring7 = null; if (idx === 6) { this.ring7 = new Ring7(this.world, this); this.audio.playMusic('siege', 132); }
    else { this.audio.playMusic('ring', ring.bpm); setTimeout(() => this.sayRaw(RING_LINES[idx + 1].drona, '#D9A441', 'ring' + (idx + 1) + '_drona'), 900); this.ui.setObjective(''); }
    this.state = 'ring'; if (idx === 0 || this.save.d.runs <= 1) this.ui.showControlsHint(this.input.isTouch);
    this.ui.toast(ring.name + ' — ' + ring.sub + (idx > 0 && this._gateHeal > 0 ? (lang() === 'en' ? '  ·  +' + this._gateHeal + ' life, quiver refilled' : '  ·  +' + this._gateHeal + ' प्राण, तरकश भरा') : ''), 3200);
  }
  onDeath() {
    this.state = 'dead'; this.audio.playMusic('none'); const ring = RINGS[this.ringIdx];
    setTimeout(() => this.ui.showMenu({ kicker: ring.name, title: T('fell'), body: [T('fellBody'), this.abhi.stats.hits + ' ⚔ · ' + this.abhi.stats.dodges + ' ↷'], buttons: [{ label: T('retry'), sub: T('retrySub'), cls: 'primary', onClick: () => { this.abhi.hp = this.abhi.maxHp; this.startRing(this.ringIdx); } }, { label: T('home'), onClick: () => this.title() }] }), 900);
  }
  onRingDone() {
    const ring = RINGS[this.ringIdx]; const earned = ring.earnAstra; const astras = this.save.d.astras.slice(); if (earned && !astras.includes(earned)) astras.push(earned);
    this.save.checkpoint(this.ringIdx + 1, this.elapsed, astras); this.state = 'clear'; this.audio.playMusic('menu', 84); this.audio.sfx('unlock');
    const A = earned ? ASTRAS[earned] : null; const after = RING_LINES[this.ringIdx + 1].after; const nextRing = RINGS[this.ringIdx + 1];
    this.sayRaw(after, '#F1E7D0', 'ring' + (this.ringIdx + 1) + '_after');
    const custom = document.createElement('div'); custom.className = 'astra-card'; if (A) { custom.style.setProperty('--c', A.color); const n = document.createElement('div'); n.className = 'an'; n.textContent = A.name; const d = document.createElement('div'); d.className = 'ad'; d.textContent = A.desc + ' — अगले चक्र में, शत्रु ≤ 50% पर।'; custom.append(n, d); }
    const wrap = document.createElement('div'); if (A) wrap.appendChild(custom); wrap.appendChild(this.codexPage(this.ringIdx));
    this.ui.showMenu({ kicker: ring.name + ' · ' + T('ringBroken') + ' · ' + fmtTime(this.elapsed), title: A ? T('astraGot') : T('ringBroken'), custom: wrap, body: [after.replace(/^(संजय|Sanjaya):\s*/, '')], buttons: [{ label: nextRing.name, sub: nextRing.sub + ' — ' + BOSSES[nextRing.boss].name, cls: 'primary', onClick: () => { this.abhi.astra = nextRing.useAstra; this.startRing(this.ringIdx + 1); } }, { label: T('rest'), sub: T('restSub'), onClick: () => this.title() }] });
    if (this.coop.host) this.coop.host.send({ t: 'ev', k: 'toast', text: ring.name + ' टूटा। अगला: ' + nextRing.name });
  }
  hype(key, strong) { const H = HYPE[key]; if (!H) return; const now = performance.now(); if (!strong && now - (this._hypeT || 0) < 9000) return; this._hypeT = now; this.ui.hypeWord(H.word, strong); this.audio.sfx(strong ? 'unlock' : 'ui');
    if (H.lines.length && (strong || Math.random() < 0.6) && now - (this._hypeVoiceT || 0) > 14000) { this._hypeVoiceT = now; const ln = H.lines[Math.floor(Math.random() * H.lines.length)]; setTimeout(() => this.sayLine(Object.assign({ id: 'hype_' + key + '_' + H.lines.indexOf(ln) }, ln)), 500); } }
  codexPage(i) { const c = CODEX[i]; const d = document.createElement('div'); d.className = 'codex'; const h = document.createElement('div'); h.className = 'ch'; h.textContent = T('granth') + ' · ' + T('page') + ' ' + (i + 1) + ' · ' + c.title; d.appendChild(h); for (const [k, v] of [[T('vyasaWrote'), c.vyasa], [T('whatChanged'), c.here], [T('pride'), c.pride]]) { const row = document.createElement('div'); row.className = 'cr'; const kk = document.createElement('div'); kk.className = 'ck'; kk.textContent = k; const vv = document.createElement('div'); vv.className = 'cv'; vv.textContent = v; row.append(kk, vv); d.appendChild(row); } return d; }
  pause() { if (this.state !== 'ring') return; this.state = 'pause'; this.ui.showMenu({ title: T('pause'), body: [RINGS[this.ringIdx].name + ' · ' + fmtTime(this.elapsed)], buttons: [{ label: T('resume'), cls: 'primary', onClick: () => { this.ui.hideMenu(); this.state = 'ring'; } }, { label: lang() === 'en' ? 'हिन्दी' : 'English', sub: T('lang'), onClick: () => { this.setLanguage(lang() === 'en' ? 'hi' : 'en', true); this.ui.setRing(RINGS[this.ringIdx]); this.ui.hideMenu(); this.state = 'ring'; } }, { label: T('home'), sub: T('homeSub'), onClick: () => { this.coopClose(); this.title(); } }] }); }

  // ---------- RING 7: MITRA SMARAN ----------
  onFallen() {
    this.state = 'fallen'; const lines = RING7.fallLines; let i = 0; const next = () => { if (i < lines.length) { this.sayLine(lines[i++]); setTimeout(next, 4200); } else this.mitraMenu(); }; setTimeout(next, 1500);
  }
  mitraMenu(waiting) {
    this.state = 'fallen'; this.audio.sfx('unlock');
    const buttons = [];
    if (this.coop.mode === 'host' && this.coop.friend) { this.ui.hideMenu(); this.beginCoop('remote'); return; }
    if (waiting && this.coop.host) {
      const link = joinLink(this.coop.host.room); const box = document.createElement('div'); box.className = 'linkbox'; const inp = document.createElement('input'); inp.readOnly = true; inp.value = link; box.appendChild(inp);
      buttons.push({ label: 'WhatsApp पर भेजो', cls: 'primary', onClick: () => window.open(whatsappLink('भाई, मैं चक्रव्यूह के सातवें चक्र में घिर गया हूँ। दुर्मसेन गदा लेकर खड़ा है। इस लिंक पर टैप कर, सात्यकि बन, और मुझे बचा: ' + link), '_blank', 'noopener') });
      buttons.push({ label: 'लिंक कॉपी', onClick: () => { navigator.clipboard && navigator.clipboard.writeText(link); this.ui.toast('लिंक कॉपी हो गया'); } });
      buttons.push({ label: 'स्वयं सात्यकि बनो', sub: 'इसी स्क्रीन पर', onClick: () => this.beginCoop('hotseat') });
      this.ui.showMenu({ kicker: 'मित्र स्मरण', title: 'प्रतीक्षा…', body: ['मित्र लिंक खोलते ही सात्यकि के रूप में उतरेगा — बिना इंस्टॉल, बिना लॉगिन।', 'तब तक अभिमन्यु घुटनों पर है। समय रुका है।'], custom: box, buttons, foot: 'लिंक सिर्फ़ इस सत्र के लिए है · सीधा फ़ोन-से-फ़ोन (P2P)' });
      return;
    }
    buttons.push({ label: 'मित्र को लिंक भेजो', sub: 'वह अपने फ़ोन से सात्यकि बनेगा', cls: 'primary', onClick: async () => { this.ui.showMenu({ title: 'कक्ष बन रहा है…', body: ['संकेत-सेवा से जुड़ रहे हैं'] }); try { await this.openHost(); this.mitraMenu(true); } catch (e) { this.ui.toast('ऑनलाइन कक्ष नहीं बना (' + (e.message || 'network') + ')। एक ही स्क्रीन पर खेलो।', 4000); this.mitraMenu(false); } } });
    buttons.push({ label: 'एक ही स्क्रीन पर मित्र को दो', sub: 'फ़ोन/कीबोर्ड मित्र को थमाओ', onClick: () => this.beginCoop('hotseat') });
    buttons.push({ label: 'स्वयं सात्यकि बनो', sub: 'अकेले ही सही', onClick: () => this.beginCoop('hotseat') });
    this.ui.showMenu({ kicker: 'सप्तम चक्र · व्यूह-नाभि', title: 'मित्र स्मरण', body: ['"तात भीम... आपने कहा था... आप पीछे हैं..."', 'अकेले यह द्वार नहीं टूटता। सात्यकि अंदर है — उसे पुकारो।', 'सात्यकि की भूमिका: बाण-जाल से दुर्मसेन को बाँधो → मंत्र-चक्र से अभिमन्यु को उठाओ → द्वंद्व जीतो → साथ में नाभि तोड़ो।'], buttons });
  }
  async openHost() { if (this.coop.host) return; const h = new Host((ev, data) => { if (ev === 'hello') { this.coop.friend = data; this.ui.toast(data + ' सात्यकि बनकर आया!', 3000); if (this.state === 'fallen') { this.ui.hideMenu(); this.beginCoop('remote'); } else if (this.state === 'hostwait') { this.ui.hideMenu(); this.startRun(0); } } else if (ev === 'left') { this.ui.toast('मित्र का संपर्क टूटा — सात्यकि अब तुम्हारे हाथ में', 3500); this.coop.mode = 'hotseat'; this.coop.friend = null; } }); await h.open(); this.coop.host = h; this.coop.mode = 'host'; }
  async hostFromStart() { this.home.hide(); this.ui.showMenu({ title: 'कक्ष बन रहा है…' }); try { await this.openHost(); } catch (e) { this.ui.toast('ऑनलाइन कक्ष नहीं बना: ' + (e.message || 'network'), 4000); return this.title(); } this.state = 'hostwait'; const link = joinLink(this.coop.host.room); const box = document.createElement('div'); box.className = 'linkbox'; const inp = document.createElement('input'); inp.readOnly = true; inp.value = link; box.appendChild(inp);
    this.ui.showMenu({ kicker: 'सह-खेल', title: 'मित्र की प्रतीक्षा', body: ['मित्र लिंक खोलते ही खेल शुरू होगा। तुम अभिमन्यु (आगे), वह सात्यकि (पीछे — हर चक्र की व्यूह-नाभि गिराएगा)।'], custom: box, buttons: [{ label: 'WhatsApp पर भेजो', cls: 'primary', onClick: () => window.open(whatsappLink('चक्रव्यूह तोड़ने चल रहा हूँ। तू सात्यकि बन, मेरे पीछे आ: ' + link), '_blank', 'noopener') }, { label: 'लिंक कॉपी', onClick: () => { navigator.clipboard && navigator.clipboard.writeText(link); this.ui.toast('कॉपी'); } }, { label: 'रद्द', onClick: () => { this.coopClose(); this.title(); } }] }); }
  coopClose() { if (this.coop.host) this.coop.host.close(); this.coop = { mode: 'none', host: null, client: null, friend: null }; this.satyaki = null; }
  beginCoop(mode) {
    this.ui.hideMenu(); this.state = 'ring'; if (mode === 'hotseat') { this.coop.mode = 'hotseat'; if (this.coop.host) { this.coop.host.close(); this.coop.host = null; } }
    if (!this.satyaki) { this.satyaki = new Hero('satyaki', 0, 0); this.satyaki.name = 'सात्यकि'; }
    this.ui.setRing(RINGS[6], 'satyaki'); this.ring7.startCoop(this.satyaki);
    if (mode === 'hotseat') this.ui.toast('अब तुम सात्यकि हो। वही नियंत्रण।', 3500);
    if (this.coop.host) this.coop.host.send({ t: 'ev', k: 'obj', text: 'बाण-जाल: तीन चमकते बिंदुओं पर बाण मारो' });
  }
  async onVictory() {
    this.state = 'cine'; this.ui.showHud(false); const s = this.save.d; s.wins++; if (!s.bestTime || this.elapsed < s.bestTime) s.bestTime = this.elapsed; s.ring = 0; s.astras = []; this.save.write();
    if (this.coop.host) this.coop.host.send({ t: 'ev', k: 'end', time: fmtTime(this.elapsed) });
    this.audio.playMusic('epilogue', 72); this.audio.sfx('shankh'); await this.cine.play(EPILOGUE, { seenBefore: s.wins > 1, idPrefix: 'epi' }); this.ui.showMenu({ kicker: 'अंतिम पृष्ठ', title: 'ग्रंथ-पृष्ठ ७', custom: this.codexPage(6), buttons: [{ label: 'आगे', cls: 'primary', onClick: () => this.endMenu() }] });
  }
  endMenu() {
    this.state = 'end'; const url = location.origin + location.pathname; const friend = this.coop.friend || (this.coop.mode === 'hotseat' ? 'स्वयं' : 'मित्र');
    const card = renderCard({ title: 'इतिहास बदल गया', line1: 'चक्रव्यूह टूटा — ' + fmtTime(this.elapsed), line2: 'सात्यकि: ' + friend, line3: 'अभिमन्यु जीवित। हज़ारों सैनिक बचे।', url });
    const img = document.createElement('img'); img.src = card.toDataURL('image/png'); img.className = 'cardimg'; img.alt = 'share card';
    this.ui.showMenu({ kicker: 'संध्या · कुरुक्षेत्र', title: 'इतिहास बदल गया', custom: img, body: ['समय: ' + fmtTime(this.elapsed) + (this.save.d.bestTime ? ' · सर्वश्रेष्ठ: ' + fmtTime(this.save.d.bestTime) : '')], buttons: [{ label: 'साझा करो', cls: 'primary', onClick: () => shareCard(card, 'मैंने चक्रव्यूह तोड़ा — ' + fmtTime(this.elapsed) + ' में। अभिमन्यु जीवित है। तुम तोड़ सकते हो?', url) }, { label: 'कार्ड डाउनलोड', onClick: () => downloadCard(card) }, { label: 'फिर से', onClick: () => { this.coopClose(); this.startRun(0); } }, { label: 'मुख्य पृष्ठ', onClick: () => { this.coopClose(); this.title(); } }] });
  }

  // ---------- CLIENT (friend as Satyaki) ----------
  clientFlow(room) {
    this.state = 'client-name'; this.ui.showHud(false); this.home.hide(); const box = document.createElement('div'); box.className = 'linkbox'; const inp = document.createElement('input'); inp.maxLength = 18; inp.placeholder = 'तुम्हारा नाम'; inp.value = this.save.d.name || ''; box.appendChild(inp);
    this.ui.showMenu({ kicker: 'मित्र स्मरण · तुम्हें पुकारा गया है', title: 'तुम सात्यकि हो', body: ['वृष्णि-वीर, कृष्ण के सखा, अर्जुन के शिष्य। अगस्त्य की सिद्धि से तुम व्यूह के अंदर हो।', 'अभिमन्यु घुटनों पर है। तुम्हारा काम: बाण-जाल → प्राण-संचार → द्वंद्व → नाभि-भंजन।', 'कोई इंस्टॉल नहीं। सीधा खेल।'], custom: box, buttons: [{ label: 'अंदर उतरो', cls: 'primary', onClick: async () => { this.gesture(); const name = cleanName(inp.value); this.save.set('name', name); this.ui.showMenu({ title: 'जुड़ रहे हैं…', body: ['मित्र के फ़ोन से सीधा संपर्क (P2P)'] }); try { await this.connectClient(room, name); } catch (e) { this.ui.showMenu({ title: 'संपर्क नहीं हुआ', body: ['शायद मित्र ने खेल बंद कर दिया, या नेटवर्क P2P रोक रहा है (' + (e.message || 'error') + ')।'], buttons: [{ label: 'फिर कोशिश', cls: 'primary', onClick: () => this.clientFlow(room) }, { label: 'अपना चक्रव्यूह तोड़ो', onClick: () => { location.hash = ''; location.reload(); } }] }); } } }, { label: 'अपना चक्रव्यूह तोड़ो', sub: 'खुद अभिमन्यु बनो', onClick: () => { location.hash = ''; location.reload(); } }] });
  }
  async connectClient(room, name) {
    const c = new Client(room, name, (ev, d) => { if (ev === 'ev') this.clientEvent(d); else if (ev === 'closed') { this.ui.toast('संपर्क टूटा', 3000); this.ui.showMenu({ title: 'संपर्क टूटा', buttons: [{ label: 'अपना चक्रव्यूह तोड़ो', cls: 'primary', onClick: () => { location.hash = ''; location.reload(); } }] }); } });
    await c.connect(); this.coop.client = c; this.coop.mode = 'client'; this.proxy = makeProxyWorld(RINGS[6]); this.ui.hideMenu(); this.ui.showHud(true); this.ui.setRing(RINGS[6], 'satyaki'); this.state = 'client'; this.audio.playMusic('siege', 132); this.ui.showControlsHint(this.input.isTouch); this.ui.toast('जुड़ गए। अभिमन्यु की प्रतीक्षा…', 2500);
  }
  clientEvent(d) {
    if (d.k === 'say') { const c = CHARACTERS[d.who] || CHARACTERS.sanjaya; const text = String(d.text).slice(0, 400); this.ui.say(c.name, text, c.color); this.voice.say(d.who in CHARACTERS ? d.who : 'sanjaya', text); }
    else if (d.k === 'toast') this.ui.toast(String(d.text).slice(0, 200), 3000);
    else if (d.k === 'obj') this.ui.setObjective(String(d.text).slice(0, 200));
    else if (d.k === 'end') { this.state = 'client-end'; this.audio.playMusic('epilogue', 72); this.audio.sfx('shankh'); const url = location.origin + location.pathname; this.save.d.savior++; this.save.write(); this.ui.showMenu({ kicker: 'रक्षक · ' + (this.save.d.savior) + ' बार', title: 'तुमने अभिमन्यु को बचाया', body: ['चक्रव्यूह टूटा — ' + String(d.time || '').slice(0, 10), 'इतिहास में सात्यकि को यह अवसर नहीं मिला था। तुम्हें मिला।', 'अब अपना चक्रव्यूह तोड़ो — अभिमन्यु बनकर।'], buttons: [{ label: 'अपना चक्रव्यूह तोड़ो', cls: 'primary', onClick: () => { location.hash = ''; location.reload(); } }, { label: 'साझा करो', onClick: () => shareCard(renderCard({ title: 'रक्षक', line1: 'मैंने सात्यकि बनकर', line2: 'अभिमन्यु को बचाया', line3: 'चक्रव्यूह — Rewriting the Epic', url }), 'मैंने सात्यकि बनकर अभिमन्यु को बचाया। तुम तोड़ सकते हो चक्रव्यूह?', url) }] }); }
  }

  // ---------- LOOP ----------
  loop(now) {
    requestAnimationFrame(t => this.loop(t)); let dt = Math.min(0.05, (now - this.last) / 1000); this.last = now; this.t += dt;
    const intent = this.input.read();
    if (this.state === 'cine') { this.cine.update(dt, this.input); this.cine.draw(); return; }
    if (this.state === 'client') { this.clientTick(dt, intent); return; }
    if (this.state === 'title') { this.drawIdle(); return; }
    if (this.state === 'client-end' || this.state === 'client-name') { if (this.proxy) { this.proxy.tick(dt); this.r.draw(this.proxy, this.t, this.proxy.heroes[1]); } else this.drawIdle(); return; }
    if (!this.world) { this.drawIdle(); return; }
    if (this.state === 'ring') {
      if (intent.pause) { this.pause(); return; }
      if (intent.mouseFresh) { const w = this.r.screenToWorld(this.input.mouse.x * this.r.w, this.input.mouse.y * this.r.h); const h = this.activeHero(); intent.aimAngle = Math.atan2(w.y - h.y, w.x - h.x); }
      const intents = this.buildIntents(intent);
      this.world.update(dt, intents); if (this.ring7) this.ring7.update(dt, intents);
      if (this.world.phase !== 'intro' && this.world.phase !== 'done') this.elapsed += dt;
      this.netT += dt; if (this.coop.host && this.netT > 0.05) { this.netT = 0; this.coop.host.send(snapshot(this.world, { stage: this.ring7 ? this.ring7.stage : null, obj: this.ui.objective.textContent })); }
      if (this.coop.host && this.coop.host.intent && performance.now() - this.coop.host.lastIn > 6000 && this.satyaki) { /* idle friend: nothing */ }
    } else if (this.state === 'fallen' || this.state === 'hostwait') { this.world.update(dt, [{ mx: 0, my: 0 }, { mx: 0, my: 0 }]); if (this.ring7) this.ring7.update(dt, [{}, {}]); this.netT += dt; if (this.coop.host && this.netT > 0.1) { this.netT = 0; this.coop.host.send(snapshot(this.world, { stage: 'fallen' })); } }
    this.r.draw(this.world, this.t, this.activeHero());
    this.ui.updateHud(this.world, this.activeHero(), this.elapsed, this.satyaki && this.world.heroes.includes(this.satyaki) && this.activeHero() !== this.satyaki ? this.satyaki : (this.activeHero() === this.satyaki ? this.abhi : null));
  }
  activeHero() { if (this.ring7 && this.satyaki && this.coop.mode !== 'host' && this.ring7.controlled() === 'satyaki') return this.satyaki; return this.abhi; }
  buildIntents(local) {
    const empty = { mx: 0, my: 0 }; const still = { mx: 0, my: 0 };
    if (this.ring7 && this.satyaki && this.world.heroes.includes(this.satyaki)) {
      const satTurn = this.ring7.controlled() === 'satyaki';
      if (this.coop.mode === 'host') { const ri = this.coop.host.takeIntent() || empty; return [satTurn ? Object.assign({}, still, { astra: local.astra, act: local.astra }) : Object.assign({}, local, { act: local.astra }), ri]; }
      return satTurn ? [Object.assign({}, still, { astra: local.astra, act: local.astra }), local] : [Object.assign({}, local, { act: local.astra }), still];
    }
    if (this.coop.mode === 'host' && this.world.heroes.length > 1) return [local, this.coop.host.takeIntent() || empty];
    return [local];
  }
  clientTick(dt, intent) {
    const c = this.coop.client; if (!c) return; const p = this.proxy; p.tick(dt);
    if (c.snap) { applySnapshot(p, c.snap, RINGS, BOSSES, this.audio); c.snap = null; }
    const me = p.heroes[1] || p.heroes[0]; if (me && intent.mouseFresh) { const w = this.r.screenToWorld(this.input.mouse.x * this.r.w, this.input.mouse.y * this.r.h); intent.aimAngle = Math.atan2(w.y - me.y, w.x - me.x); }
    intent.act = intent.astra; this.netT += dt; if (this.netT > 0.033) { this.netT = 0; c.sendIntent(intent); }
    if (p.extra && p.extra.obj !== undefined && p.extra.obj !== this._lastObj) { this._lastObj = p.extra.obj; this.ui.setObjective(p.extra.obj); }
    this.r.draw(p, this.t, me); if (me) this.ui.updateHud(p, me, 0, p.heroes[0] && p.heroes[0] !== me ? p.heroes[0] : null);
    if (p.extra && p.extra.stage === 'fallen') this.ui.setObjective('अभिमन्यु गिरा है — मित्र तुम्हें बुला रहा है…');
  }
  drawIdle() { const ctx = this.r.ctx, W = this.r.w, H = this.r.h; const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1B1F3B'); g.addColorStop(0.6, '#7A1E1E'); g.addColorStop(1, '#D9A441'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.translate(W / 2, H * 0.6); for (let i = 0; i < 7; i++) { const rr = Math.min(W, H) * (0.08 + i * 0.07); ctx.save(); ctx.rotate(this.t * 0.08 * (i % 2 ? -1 : 1)); ctx.strokeStyle = `rgba(244,201,93,${0.45 - i * 0.05})`; ctx.lineWidth = 2; ctx.setLineDash([18, 12]); ctx.beginPath(); ctx.ellipse(0, 0, rr, rr * 0.5, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); } ctx.restore(); const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.7)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); }
}
window.addEventListener('DOMContentLoaded', () => { window.__game = new Game(); });
