import { INTRO, EPILOGUE, RING7, RING_LINES, BOSSES, HYPE } from '../js/config.js';
const lines = [];
const push = (id, who, text) => lines.push({ id, who, text: text.replace(/^[^:]{1,16}:\s*/, '').replace(/\([^)]*\)\s*/g, '').trim() });
INTRO.forEach((sc, si) => sc.lines.forEach((ln, li) => push('intro_' + si + '_' + li, ln.who, ln.text)));
for (let n = 1; n <= 7; n++) { if (RING_LINES[n].drona) push('ring' + n + '_drona', 'drona', RING_LINES[n].drona); if (RING_LINES[n].after) push('ring' + n + '_after', 'sanjaya', RING_LINES[n].after); }
for (const k in BOSSES) { push('boss_' + k + '_intro', k === 'karna2' ? 'karna' : (k === 'kripa' ? 'ashwatthama' : k), BOSSES[k].intro); push('boss_' + k + '_defeat', 'sanjaya', BOSSES[k].defeat); }
for (const k in RING7) RING7[k].forEach((ln, i) => { let who = ln.who; if (who === 'enemy') { const m = ln.text.match(/^([^:]{1,14}):/); who = m && m[1].includes('कर्ण') ? 'karna' : 'durmasena'; } push('r7_' + k + '_' + i, who, ln.text); });
EPILOGUE.forEach((sc, si) => sc.lines.forEach((ln, li) => push('epi_' + si + '_' + li, ln.who, ln.text)));
for (const k in HYPE) HYPE[k].lines.forEach((ln, i) => push('hype_' + k + '_' + i, ln.who, ln.text));
console.log(JSON.stringify(lines));
