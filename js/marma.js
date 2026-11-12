// Marma — each maharathi's vital point. Rules (which marma, how much, when hints come) live in rules.js.
// Ordinary blows graze; a blow on the marma lands in full. The game never names the marma: players find it by trying.
import { RULES } from './rules.js';
import { angDiff } from './entities.js';

const M = RULES.marma;

// is this hit a strike on the boss's marma?
export function isMarmaHit(kind, b, world, hit) {
  if (!hit) return false;
  const o = hit.owner || null;
  switch (kind) {
    case 'riposte': return !!o && o._blockedBoss === b && world.time - (o._blockedAt || -99) < M.ripostWindow && hit.kind !== 'astra';
    case 'airGada': return !!hit.plunge;
    case 'charged': return hit.kind === 'arrow' && !!hit.charged;
    case 'interrupt': return (b.teleUntil || 0) > world.time || (b.move && b.move.name !== 'guard' && (b._ph || 0) < 0.45 && !!b.tele);
    case 'staggered': return hit.kind === 'gada' && ((b.stun || 0) > 0 || (b.bound || 0) > 0);
    case 'behind': { if (!o) return false; const a = Math.atan2(o.y - b.y, o.x - b.x); return Math.abs(angDiff(b.facing, a)) > M.behindArc; }
    default: return false;
  }
}

// lines: only the last of each set (the line when the marma is found) is used; the first two are kept for a future
// optional 'guide' mode and are never spoken in normal play. Each { who, hi, en }
export const MARMA_LINES = {
  dushasana: [
    { who: 'sanjaya', hi: 'राजन्, दुःशासन का हर वार उसे खुला छोड़ जाता है — जो उसे झेल ले, वही उत्तर दे सकता है।', en: 'O King, every blow of Dushasana leaves him open — only one who withstands it can answer it.' },
    { who: 'bhima', hi: 'ढाल पर उसका वार रोक, पुत्र — और उसी क्षण पलटवार कर!', en: 'Take his blow on the shield, son — and strike back that very instant!' },
    { who: 'sanjaya', hi: 'ढाल ने रोका, तलवार ने उत्तर दिया — दुःशासन मूर्छित!', en: 'The shield held, the sword answered — Dushasana falls senseless!' }],
  shalya: [
    { who: 'sanjaya', hi: 'मद्रराज की रक्षा दीवार-सी है... पर दीवार की छत नहीं होती।', en: 'The Madra king\'s guard is a wall... but a wall has no roof.' },
    { who: 'bhima', hi: 'ऊपर से, पुत्र! उछल, और गदा उसके सिर पर गिरा!', en: 'From above, son! Leap, and bring the gada down on him!' },
    { who: 'sanjaya', hi: 'आकाश से गिरी गदा — शल्य का रथ चूर!', en: 'A gada fell from the sky — Shalya\'s chariot is splinters!' }],
  lakshmana: [
    { who: 'sanjaya', hi: 'कुमार लक्ष्मण का कवच अधूरे बाणों पर हँसता है।', en: 'Prince Lakshmana\'s armour laughs at half-drawn arrows.' },
    { who: 'bhima', hi: 'डोरी कान तक खींच, पुत्र — जैसे तेरे पिता खींचते हैं!', en: 'Draw the string to your ear, son — the way your father does!' },
    { who: 'sanjaya', hi: 'पूरा खिंचा बाण — लक्ष्मण का कवच फटा!', en: 'A full-drawn arrow — Lakshmana\'s armour splits!' }],
  karna: [
    { who: 'sanjaya', hi: 'अंगराज को रोकना कठिन है — वह तभी खुला है जब धनुष ताने निशाना साधता है।', en: 'The king of Anga is hard to stop — he is open only while he stands taking aim.' },
    { who: 'bhima', hi: 'जब वह निशाना साधे, तभी झपट! उसे साँस भी मत लेने दे!', en: 'When he takes aim — that is when you lunge! Don\'t give him a breath!' },
    { who: 'sanjaya', hi: 'निशाना साधते कर्ण पर प्रहार — अंगराज लड़खड़ाया!', en: 'Struck mid-aim — the king of Anga staggers!' }],
  brihadbala: [
    { who: 'sanjaya', hi: 'कोसल का रथ रुकता नहीं... पर जब रुके, तो सँभलने में समय लेता है।', en: 'The Kosala chariot never stops... but when it does, it is slow to recover.' },
    { who: 'bhima', hi: 'उसका वेग ढाल पर रोक; जब वह चकराए — तब गदा!', en: 'Stop his rush on your shield; when he reels — then the gada!' },
    { who: 'sanjaya', hi: 'चकराए बृहद्बल पर गदा — कोसल का रथ पलटा!', en: 'The gada on a reeling Brihadbala — the Kosala chariot overturns!' }],
  kripa: [
    { who: 'sanjaya', hi: 'माया की परछाईं नहीं होती, राजन्। सच्चा अश्वत्थामा धरती पर छाया डालता है।', en: 'Illusions cast no shadow, O King. The true Ashwatthama throws one on the earth.' },
    { who: 'bhima', hi: 'जिसकी छाया है, उसके पीछे जा — सामने से वह अभेद्य है!', en: 'Find the one with a shadow and get behind him — from the front he cannot be broken!' },
    { who: 'sanjaya', hi: 'पीठ पर प्रहार — माया छँटी!', en: 'A blow to his back — the illusion shatters!' }],
};
