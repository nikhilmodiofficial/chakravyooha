// Home experience (#home): key-art hero + column with Play, Katha, Characters, Astras, Granth, How to play, Settings.
import { RINGS, BOSSES, ASTRAS, CHARACTERS, CODEX, CHAR_BIOS, ASTRA_LORE, INTRO, EPILOGUE, RING7, RING_LINES, LOOK } from './config.js';
import { T, lang } from './i18n.js';
import { drawWarrior, drawWeapon } from './art.js';
import { fmtTime } from './share.js';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined && text !== null) e.textContent = text; return e; };
const img = (name, onFail) => { const i = new Image(); i.alt = ''; i.loading = 'lazy'; i.src = 'assets/img/' + name + '.jpg'; i.onerror = () => { const f = onFail && onFail(); if (f) i.replaceWith(f); else i.remove(); }; return i; };
export const portraitCanvas = (key, w = 120, h = 160) => { const c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2; const x = c.getContext('2d'); x.scale(2, 2); const L = LOOK[key] || LOOK.soldier; const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1B1F3B'); g.addColorStop(1, '#3a2416'); x.fillStyle = g; x.fillRect(0, 0, w, h); drawWarrior(x, { x: w / 2, y: h * 0.74, s: Math.min(w, h) / 62, facing: 0, walkT: 0, weapon: ['karna', 'lakshmana', 'drona', 'kripa', 'arjuna', 'archer'].includes(key) ? 'bow' : ['shalya', 'durmasena', 'bhima'].includes(key) ? 'gada' : 'sword', pal: { skin: L.skin, cloth: L.cloth, armor: L.armor, accent: L.accent, hair: L.hairColor || '#1a0f0a' }, cape: L.cape, scarf: L.scarf, hair: L.hair, armorStyle: L.armorStyle, mukut: L.mukut, attack: 0.15 }); return c; };

export class Home {
  constructor(game) { this.g = game; this.root = document.getElementById('home'); this.page = null; }
  hide() { this.root.classList.add('hidden'); this.root.innerHTML = ''; }
  show(page) { this.root.classList.remove('hidden'); this.render(page || null); }
  render(page) {
    this.page = page; this.root.innerHTML = ''; const hm = el('div', 'hm');
    const hero = el('div', 'hm-hero'); hero.appendChild(img('keyart')); hero.appendChild(el('div', 'hm-hero-shade'));
    const brand = el('div', 'hm-brand'); brand.appendChild(el('div', 'kicker', T('kicker'))); brand.appendChild(el('h1', 'hm-title', 'चक्रव्यूह')); brand.appendChild(el('div', 'hm-tag', T('tagline'))); hero.appendChild(brand); hm.appendChild(hero);
    const col = el('div', 'hm-col'); const top = el('div', 'hm-topbar'); const lg = el('button', 'hm-lang', lang() === 'en' ? 'हिन्दी' : 'EN'); lg.onclick = () => { this.g.gesture(); this.g.setLanguage(lang() === 'en' ? 'hi' : 'en'); this.render(this.page); }; top.appendChild(lg); col.appendChild(top);
    if (!page) this.menu(col); else { const head = el('div', 'hm-sechead'); const back = el('button', 'hm-back', '‹ ' + T('back')); back.onclick = () => { this.g.audio.sfx('ui'); this.render(null); }; head.appendChild(back); head.appendChild(el('h2', 'hm-h2', this.pageTitle(page))); col.appendChild(head); const body = el('div', 'hm-body'); this[page](body); col.appendChild(body); }
    hm.appendChild(col); this.root.appendChild(hm);
  }
  pageTitle(p) { return { story: T('story'), characters: T('chars'), astras: T('astras'), granth: T('granth'), howto: T('howto'), settings: T('settings') }[p] || ''; }
  menu(col) {
    const s = this.g.save.d; const cont = s.ring > 0;
    col.appendChild(el('p', 'hm-blurb', T('blurb1'))); col.appendChild(el('p', 'hm-blurb dim', T('blurb2')));
    const play = el('button', 'hm-play'); play.appendChild(el('div', 'pl', cont ? T('cont') : T('start'))); play.appendChild(el('div', 'ps', cont ? `${T('checkpoint')}: ${RINGS[s.ring].name} · ${fmtTime(s.elapsed)} · ${s.astras.length} ${T('astraCount')}` : T('startSub'))); play.onclick = () => { this.g.gesture(); this.g.startRun(cont ? s.ring : 0); }; col.appendChild(play);
    const row = el('div', 'hm-row'); if (cont) { const nr = el('button', 'hm-nav'); nr.appendChild(el('div', 'nl', T('newRun'))); nr.appendChild(el('div', 'ns', T('fromStart'))); nr.onclick = () => { this.g.gesture(); this.g.save.reset(); this.g.startRun(0); }; row.appendChild(nr); }
    const cf = el('button', 'hm-nav'); cf.appendChild(el('div', 'nl', T('callFriend'))); cf.appendChild(el('div', 'ns', T('callFriendSub'))); cf.onclick = () => { this.g.gesture(); this.g.hostFromStart(); }; row.appendChild(cf); col.appendChild(row);
    const grid = el('div', 'hm-grid');
    for (const [k, page, label, sub] of [['story', 'story', T('story'), T('storySub')], ['chars', 'characters', T('chars'), T('charsSub')], ['astras', 'astras', T('astras'), T('astrasSub')], ['granth', 'granth', T('granth'), T('granthSub')], ['howto', 'howto', T('howto'), ''], ['settings', 'settings', T('settings'), '']]) { const t = el('button', 'hm-nav tile ' + k); t.appendChild(el('div', 'nl', label)); if (sub) t.appendChild(el('div', 'ns', sub)); t.onclick = () => { this.g.gesture(); this.g.audio.sfx('ui'); this.render(page); }; grid.appendChild(t); }
    col.appendChild(grid); col.appendChild(el('div', 'hm-foot', T('foot')));
  }
  line(who, text) { const c = CHARACTERS[who] || CHARACTERS.sanjaya; const m = text.match(/^([^:]{1,16}):\s*(.*)$/s); const name = who === 'enemy' && m ? m[1] : c.name; const body = m && (who === 'enemy' || m[1] === c.name) ? m[2] : text; const p = el('p'); const n = el('span', 'dl-who', name + ': '); n.style.color = c.color; p.appendChild(n); p.appendChild(el('span', null, body)); return p; }
  // ---------- STORY ----------
  story(b) {
    const hi = lang() !== 'en';
    const watch = el('button', 'hm-nav wide'); watch.appendChild(el('div', 'nl', hi ? 'प्रस्तावना देखें (चलचित्र)' : 'Watch the prologue (cinematic)')); watch.appendChild(el('div', 'ns', hi ? 'टैप = अगली पंक्ति · दबाए रखें = छोड़ें' : 'Tap = next line · hold = skip')); watch.onclick = async () => { this.g.gesture(); this.hide(); this.g.state = 'cine'; this.g.audio.playMusic('cinematic', 84); await this.g.cine.play(INTRO, { seenBefore: true, idPrefix: 'intro' }); this.g.audio.playMusic('menu', 84); this.g.state = 'title'; this.show('story'); }; b.appendChild(watch);
    const card = (num, imgName, fallbackKey, title, lines) => { const c = el('div', 'story-card'); c.appendChild(img(imgName, fallbackKey ? () => portraitCanvas(fallbackKey, 180, 180) : null)); const t = el('div', 'story-text'); t.appendChild(el('div', 'story-num', num)); t.appendChild(el('h3', null, title)); for (const [w, tx] of lines) if (tx) t.appendChild(this.line(w, tx)); c.appendChild(t); b.appendChild(c); };
    card(hi ? 'प्रस्तावना' : 'Prologue', 'bg_dawn', null, hi ? 'त्रयोदश दिवस' : 'The Thirteenth Day', INTRO.flatMap(sc => sc.lines.map(l => [l.who, l.text])));
    RINGS.slice(0, 6).forEach((r, i) => card(r.name, BOSSES[r.boss].look, BOSSES[r.boss].look, r.sub + ' — ' + BOSSES[r.boss].name, [['drona', RING_LINES[i + 1].drona], ['enemy', BOSSES[r.boss].intro], ['sanjaya', BOSSES[r.boss].defeat], ['sanjaya', RING_LINES[i + 1].after]]));
    const r7 = []; for (const k of ['siegeLines', 'fallLines', 'satyakiEntry', 'dronaRetreat', 'healLines', 'duelLines', 'pashLines', 'chakraLines', 'karnaLines', 'freeLines', 'coreLines']) for (const ln of RING7[k]) r7.push([ln.who, ln.text]);
    card(RINGS[6].name, 'bg_siege', null, hi ? 'व्यूह-नाभि — मित्र स्मरण' : 'The Nabhi — Mitra Smaran', r7);
    card(hi ? 'उपसंहार' : 'Epilogue', 'bg_sunset', null, hi ? 'संध्या' : 'Dusk', EPILOGUE.flatMap(sc => sc.lines.map(l => [l.who, l.text])));
  }
  // ---------- CHARACTERS ----------
  characters(b) {
    const grid = el('div', 'char-grid'); const order = ['abhimanyu', 'satyaki', 'karna', 'drona', 'dushasana', 'shalya', 'lakshmana', 'brihadbala', 'kripa', 'ashwatthama', 'durmasena', 'yudhishthira', 'bhima', 'arjuna', 'krishna', 'jayadratha', 'agastya', 'duryodhana'];
    for (const k of order) { const bio = CHAR_BIOS[k]; const nm = (BOSSES[k] && BOSSES[k].name) || (CHARACTERS[k] && CHARACTERS[k].name) || k; const card = el('div', 'char-card'); const pw = el('div', 'portrait'); pw.appendChild(img(k, () => portraitCanvas(k))); card.appendChild(pw); const t = el('div', 'char-text'); t.appendChild(el('div', 'char-name', nm)); t.appendChild(el('div', 'char-title', bio.title)); t.appendChild(el('p', 'char-bio', bio.bio)); t.appendChild(el('div', 'char-role', (lang() === 'en' ? 'In the game: ' : 'खेल में: ') + bio.role)); card.appendChild(t); grid.appendChild(card); }
    b.appendChild(grid);
  }
  // ---------- ASTRAS ----------
  astras(b) {
    const hi = lang() !== 'en'; b.appendChild(el('p', 'hm-blurb', hi ? 'नियम एक ही है: अस्त्र तभी जागता है जब महारथी का प्राण आधा रह जाए। जो अस्त्र एक चक्र में जीतो, वही अगले में चलता है।' : 'One rule: an astra wakes only when the maharathi is at half his life. The astra you win in one chakra is the one you fire in the next.'));
    const chain = el('div', 'astra-chain'); const keys = ['vayu', 'agni', 'varun', 'naag', 'bhoomi', 'him']; keys.forEach((k, i) => { const ch = el('span', 'chip', ASTRAS[k].name); ch.style.setProperty('--c', ASTRAS[k].glow); chain.appendChild(ch); if (i < 5) chain.appendChild(el('span', 'arrow', '→')); }); b.appendChild(chain);
    for (const k of keys) { const A = ASTRAS[k]; const card = el('div', 'astra-card2'); card.style.setProperty('--c', A.glow); const ic = el('div', 'astra-icon'); const cv = document.createElement('canvas'); cv.width = 240; cv.height = 240; ic.appendChild(cv); this.astraPreview(cv, k); card.appendChild(ic);
      const t = el('div'); t.appendChild(el('div', 'astra-name', A.name)); const earn = RINGS.find(r => r.earnAstra === k), use = RINGS.find(r => r.useAstra === k); t.appendChild(el('div', 'astra-deva', (hi ? 'मिलता है: ' : 'Won in: ') + (earn ? earn.name : '—') + '  ·  ' + (hi ? 'चलता है: ' : 'Fired in: ') + (use ? use.name + (BOSSES[use.boss] ? ' (' + BOSSES[use.boss].name + ')' : '') : '—'))); t.appendChild(el('p', 'astra-desc', A.desc)); t.appendChild(el('p', 'astra-lore', ASTRA_LORE[k])); card.appendChild(t); b.appendChild(card); }
  }
  astraPreview(c, key) { const x = c.getContext('2d'); let t = 0; const W = c.width, H = c.height, cx = W / 2, cy = H / 2; const draw = () => { if (!c.isConnected) return; t += 0.03; x.fillStyle = '#0B0C14'; x.fillRect(0, 0, W, H); x.save(); x.globalCompositeOperation = 'lighter';
      if (key === 'vayu') for (let i = 0; i < 16; i++) { const a = i * 0.4 + t * 3; x.strokeStyle = i % 2 ? '#CFF4FF' : '#fff'; x.globalAlpha = 0.5; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, 10 + i * 6, a, a + 1); x.stroke(); }
      else if (key === 'agni') for (let i = 0; i < 20; i++) { const ph = (t * 0.7 + i * 0.137) % 1; x.globalAlpha = 1 - ph; x.fillStyle = i % 3 ? '#FF7A2A' : '#FFC46B'; x.beginPath(); x.arc(cx + Math.sin(i * 2.1 + t) * 60, cy + 70 - ph * 160, 16 - ph * 12, 0, Math.PI * 2); x.fill(); }
      else if (key === 'varun') for (let i = 0; i < 12; i++) { const ph = (t * 0.8 + i * 0.09) % 1; x.globalAlpha = 0.6 * (1 - ph); x.strokeStyle = i % 2 ? '#4FA3FF' : '#CFF4FF'; x.lineWidth = 8; x.beginPath(); x.moveTo(20 + i * 18, -10 + ph * 260); x.quadraticCurveTo(40 + i * 18, 30 + ph * 260, 20 + i * 18, 60 + ph * 260); x.stroke(); }
      else if (key === 'naag') for (let s = 0; s < 3; s++) { x.globalAlpha = 0.9; x.strokeStyle = s % 2 ? '#5FD88A' : '#B4FFD0'; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40; const px = 20 + u * 200, py = cy + Math.sin(u * 9 + t * 4 + s * 2) * 34 + (s - 1) * 30; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
      else if (key === 'bhoomi') for (let i = 0; i < 8; i++) { const h = 50 + Math.abs(Math.sin(t * 1.3 + i)) * 100; x.globalAlpha = 0.9; x.fillStyle = '#A9743A'; x.beginPath(); x.moveTo(10 + i * 28, H); x.lineTo(18 + i * 28, H - h); x.lineTo(28 + i * 28, H - h - 8); x.lineTo(36 + i * 28, H); x.fill(); x.strokeStyle = '#E0B072'; x.lineWidth = 1.5; x.stroke(); }
      else for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * 0.3; const len = 60 + Math.sin(t * 2 + i) * 14; x.globalAlpha = 0.9; x.strokeStyle = i % 2 ? '#CFF4FF' : '#fff'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); x.stroke(); for (let j = 1; j < 3; j++) { const bx = cx + Math.cos(a) * len * j / 3, by = cy + Math.sin(a) * len * j / 3; x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + Math.cos(a + 0.6) * 14, by + Math.sin(a + 0.6) * 14); x.moveTo(bx, by); x.lineTo(bx + Math.cos(a - 0.6) * 14, by + Math.sin(a - 0.6) * 14); x.stroke(); } }
      x.restore(); requestAnimationFrame(draw); }; draw(); }
  // ---------- GRANTH ----------
  granth(b) {
    const unlocked = Math.max(this.g.save.d.ring, this.g.save.d.wins > 0 ? 7 : 0); const hi = lang() !== 'en';
    b.appendChild(el('p', 'hm-blurb', hi ? 'सात पृष्ठ — हर चक्र के साथ एक खुलता है। व्यास ने क्या लिखा, हमने क्या बदला, और वह एक बात जिस पर गर्व हो।' : 'Seven pages — one opens with every chakra. What Vyasa wrote, what we changed, and the one thing worth being proud of.'));
    CODEX.forEach((c, i) => { const pg = this.g.codexPage(i); pg.classList.add('static'); if (i >= unlocked) { pg.classList.add('locked'); pg.appendChild(el('div', 'lock', hi ? `${RINGS[i].name} तोड़ने पर खुलेगा` : `Unlocks when you break ${RINGS[i].name}`)); } b.appendChild(pg); });
  }
  // ---------- HOW TO ----------
  howto(b) {
    const hi = lang() !== 'en';
    const schemes = el('div', 'how-schemes');
    const scheme = (title, keys) => { const s = el('div', 'scheme'); s.appendChild(el('div', 'scheme-h', title)); const ks = el('div', 'keys'); for (const [k, l] of keys) { ks.appendChild(el('span', 'key', k)); ks.appendChild(el('span', 'how-d', l)); } s.appendChild(ks); return s; };
    schemes.appendChild(scheme(hi ? 'कीबोर्ड + माउस' : 'Keyboard + mouse', [['WASD', hi ? 'चलना' : 'move'], [hi ? 'माउस' : 'Mouse', hi ? 'निशाना' : 'aim'], ['LMB', hi ? 'तलवार' : 'sword'], ['RMB ⏺', hi ? 'धनुष (दबाए रखें)' : 'bow (hold)'], ['Q', hi ? 'गदा' : 'mace'], ['Space', hi ? 'छलांग' : 'dodge'], ['E', hi ? 'अस्त्र' : 'astra'], ['Esc', hi ? 'विराम' : 'pause']]));
    schemes.appendChild(scheme(hi ? 'गेमपैड (Xbox)' : 'Gamepad (Xbox)', [['L-stick', hi ? 'चलना' : 'move'], ['R-stick', hi ? 'निशाना' : 'aim'], ['X', hi ? 'तलवार' : 'sword'], ['RT', hi ? 'धनुष' : 'bow'], ['Y', hi ? 'गदा' : 'mace'], ['A', hi ? 'छलांग' : 'dodge'], ['B', hi ? 'अस्त्र' : 'astra'], ['Start', hi ? 'विराम' : 'pause']]));
    const ph = el('div', 'scheme'); ph.appendChild(el('div', 'scheme-h', hi ? 'मोबाइल' : 'Mobile')); const mock = el('div', 'phone-mock'); mock.appendChild(el('div', 'pm-stick')); const pb = el('div', 'pm-btns'); for (const l of [hi ? 'धनुष' : 'Bow', hi ? 'अस्त्र' : 'Astra', hi ? 'गदा' : 'Mace', hi ? 'तलवार' : 'Sword', '', hi ? 'छलांग' : 'Dodge']) pb.appendChild(el('div', 'pm-b', l)); mock.appendChild(pb); ph.appendChild(mock); ph.appendChild(el('div', 'how-d', hi ? 'बाएँ कहीं भी छूकर घसीटो = चलना · निशाना अपने आप नज़दीकी शत्रु पर' : 'Touch-drag anywhere left = move · aim snaps to the nearest enemy')); schemes.appendChild(ph);
    b.appendChild(schemes);
    const wg = el('div', 'how-weapons'); const W = [['sword', hi ? 'तलवार' : 'Sword', 'LMB · J', hi ? 'तेज़ 3-हिट कॉम्बो। आते बाण काटती है (प्रतिघात)। ढाल पर बेकार।' : 'Fast 3-hit combo. Cuts incoming arrows (Pratighat). Useless on shields.'], ['bow', hi ? 'धनुष' : 'Bow', 'RMB hold · K', hi ? 'दबाए रखो, छोड़ो। पूरा खिंचा बाण भेदता है (2 बाण)। तरकश 30 — गिरे धनुर्धरों से भरता है। कर्ण कई बाण हवा में काट देता है।' : 'Hold, release. Full draw pierces (costs 2). Quiver 30 — refills from fallen archers. Karna cuts many arrows mid-air.'], ['gada', hi ? 'गदा' : 'Mace', 'Q · L', hi ? 'धीमी, भारी। ढाल और महारथी की रक्षा तोड़ती है, पीछे धकेलती है। शल्य की उठती गदा पर मारो — गदा-संघर्ष।' : 'Slow, heavy. Breaks shields and a maharathi\'s guard, knocks back. Hit Shalya\'s rising mace — clash.'], ['chakra', hi ? 'रथ-चक्र' : 'Chariot wheel', hi ? 'सप्तम चक्र' : 'Seventh chakra', hi ? 'चारों ओर धक्का; चक्र-प्रहार से घेरा और पाश टूटते हैं।' : 'Pushes all around; the chakra-strike breaks the encirclement and the noose.']];
    for (const [k, n, keys, d] of W) { const c = el('div', 'how-w'); const cv = document.createElement('canvas'); cv.width = 140; cv.height = 100; const x = cv.getContext('2d'); x.translate(46, 60); x.scale(1.7, 1.7); drawWeapon(x, k, { accent: '#F4C95D' }, 0.4, 0.8); c.appendChild(cv); const t = el('div'); t.appendChild(el('div', 'how-n', n)); t.appendChild(el('div', 'how-k', keys)); t.appendChild(el('p', 'how-d', d)); c.appendChild(t); wg.appendChild(c); }
    b.appendChild(wg);
    const rules = el('div', 'how-rules'); const R = hi ? [['अस्त्र', 'महारथी ≤ 50% पर ही जागता है। एक बार प्रति चक्र। बटन चमकेगा।'], ['प्राण-क्षय', 'थकान से प्राण धीरे-धीरे घटता है। गिरे शत्रुओं के अस्त्र-कण उठाओ (+12)।'], ['विपत्ति', '20% से नीचे दुनिया धुंधली और लाल — यह हार नहीं, चेतावनी है।'], ['छलांग', 'Space — 0.4 सेकंड अभेद्य। लाल क्षेत्र दिखे तो छलांग।'], ['द्वार', 'महारथी गिरते ही सामने का द्वार खुलता है — भीतर बढ़ो।'], ['मित्र स्मरण', 'सातवाँ द्वार अकेले नहीं टूटता। लिंक भेजो, या फ़ोन थमाओ।']] : [['Astra', 'Wakes only at maharathi ≤ 50%. Once per chakra. The button glows.'], ['Fatigue', 'Life drains slowly. Pick up astra-shards from fallen enemies (+12).'], ['Vipatti', 'Below 20% the world goes grey and red — a warning, not a loss.'], ['Dodge', 'Space — 0.4 s invulnerable. See red ground, leap.'], ['Dwar', 'The gate ahead opens the moment the maharathi falls — move inward.'], ['Mitra Smaran', 'The seventh gate does not break alone. Send the link, or hand over the phone.']];
    for (const [n, d] of R) { const c = el('div', 'rule'); c.appendChild(el('div', 'rule-h', n)); c.appendChild(el('div', 'how-d', d)); rules.appendChild(c); } b.appendChild(rules);
  }
  // ---------- SETTINGS ----------
  settings(b) {
    const s = this.g.save.d;
    const toggle = (label, val, onChange) => { const r = el('button', 'set-row'); r.appendChild(el('span', 'set-l', label)); const sw = el('span', 'switch' + (val ? ' on' : '')); sw.appendChild(el('span', 'knob')); r.appendChild(sw); r.appendChild(el('span', 'set-v', val ? T('on') : T('off'))); r.onclick = () => { this.g.gesture(); onChange(!val); this.render('settings'); }; b.appendChild(r); };
    toggle(T('music'), !s.mute, v => { s.mute = !v; this.g.save.write(); this.g.audio.setMute(!v); if (v) this.g.audio.sfx('unlock'); });
    toggle(T('voice'), !!s.voice, v => { s.voice = v; this.g.save.write(); this.g.voice.muted = !v; if (v) this.g.voice.say('sanjaya', lang() === 'en' ? 'Hear me, O King.' : 'सुनो, राजन्।', null); });
    const lr = el('div', 'set-row static'); lr.appendChild(el('span', 'set-l', T('lang'))); const seg = el('div', 'seg'); for (const [v, l] of [['hi', T('hindi')], ['en', T('english')]]) { const o = el('button', 'seg-b' + (lang() === v ? ' on' : ''), l); o.onclick = () => { this.g.gesture(); this.g.setLanguage(v); this.render('settings'); }; seg.appendChild(o); } lr.appendChild(seg); b.appendChild(lr);
    b.appendChild(el('p', 'hm-blurb dim', T('langNote')));
    const v = this.g.voice; b.appendChild(el('p', 'hm-blurb dim', (lang() === 'en' ? 'Voice engine: ' : 'आवाज़: ') + (v.manifest && v.manifest.size ? v.manifest.size + (lang() === 'en' ? ' recorded character clips' : ' रिकॉर्डेड पात्र-आवाज़ें') + ' · ' : '') + (v.voice ? v.voice.name + ' (' + v.voice.lang + ')' : (lang() === 'en' ? 'no Hindi system voice on this device' : 'इस डिवाइस पर हिन्दी सिस्टम-आवाज़ नहीं'))));
    const danger = el('button', 'hm-nav wide danger'); danger.appendChild(el('div', 'nl', lang() === 'en' ? 'Erase progress' : 'प्रगति मिटाओ')); danger.onclick = () => { if (confirm(lang() === 'en' ? 'Erase checkpoint and astras?' : 'चौकी और अस्त्र मिटा दें?')) { this.g.save.reset(); this.render('settings'); } }; b.appendChild(danger);
  }
}
