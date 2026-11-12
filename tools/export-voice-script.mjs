// Exports every spoken line to docs/voice-script.csv (id, character, voice direction, text) for clip generation.
import { INTRO, EPILOGUE, RING7, RING_LINES, BOSSES, CHARACTERS } from '../js/config.js';
import { writeFileSync } from 'node:fs';
const DIR = { sanjaya: 'Narrator. Deep, measured, reverent; a storyteller at a king\'s side.', abhimanyu: 'Sixteen, bright, fearless; voice cracks only in the fall scene.', yudhishthira: 'Calm, heavy with responsibility.', bhima: 'Booming, warm, impatient.', satyaki: 'Steady, loyal, soldierly; quiet intensity.', drona: 'Old teacher; authority, then regret.', duryodhana: 'Sharp, accusing, proud.', jayadratha: 'Smug, theatrical.', arjuna: 'Noble, controlled; breaks with emotion at the end.', krishna: 'Gentle, amused, all-knowing.', agastya: 'Ancient sage; slow, resonant.', enemy: 'Generic Kaurava warrior; harsh.' };
const rows = [['id', 'character', 'direction', 'text_hi']];
const push = (id, who, text) => rows.push([id, CHARACTERS[who] ? CHARACTERS[who].name + ' (' + who + ')' : who, DIR[who] || '', text.replace(/"/g, '""')]);
INTRO.forEach((sc, si) => sc.lines.forEach((ln, li) => push('intro_' + si + '_' + li, ln.who, ln.text)));
for (let n = 1; n <= 7; n++) { if (RING_LINES[n].drona) push('ring' + n + '_drona', 'drona', RING_LINES[n].drona); if (RING_LINES[n].after) push('ring' + n + '_after', 'sanjaya', RING_LINES[n].after); }
for (const k in BOSSES) { push('boss_' + k + '_intro', 'enemy', BOSSES[k].intro); push('boss_' + k + '_defeat', 'sanjaya', BOSSES[k].defeat); }
for (const k in RING7) RING7[k].forEach((ln, i) => push('r7_' + k + '_' + i, ln.who, ln.text));
EPILOGUE.forEach((sc, si) => sc.lines.forEach((ln, li) => push('epi_' + si + '_' + li, ln.who, ln.text)));
writeFileSync(new URL('../docs/voice-script.csv', import.meta.url), '﻿' + rows.map(r => r.map(c => '"' + c + '"').join(',')).join('\n'));
console.log(rows.length - 1, 'lines exported');
