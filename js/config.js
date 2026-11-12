// Chakravyooh — central data: palette, rings, bosses, astras, dialogues.
// Everything that a designer would tune lives here.

export const PALETTE = {
  terracotta: '#B5472D', ochre: '#D9A441', indigo: '#1B1F3B', bone: '#F1E7D0',
  gold: '#F4C95D', blood: '#7A1E1E', ink: '#0B0C14', smoke: '#3A3F5C',
  cyan: '#7FE3FF', green: '#5FD88A', violet: '#8F6CFF', frost: '#CFF4FF', ember: '#FF7A2A'
};

export const WORLD = { w: 1400, h: 900 };

// One look per character, used by BOTH the in-game renderer and the cinematic silhouettes (rim colour) so nobody changes clothes between scenes.
export const LOOK = {
  abhimanyu:  { armor: '#C9922A', accent: '#F4C95D', cloth: '#2E4A8B', cape: '#8B1E1E', mukut: 'prince', rim: '#F4C95D', skin: '#d4976a' },
  satyaki:    { armor: '#1F6B4A', accent: '#C8D6D0', cloth: '#1a2a22', cape: '#0f3a2a', mukut: 'crest',  rim: '#9FFFC0', skin: '#c98a5a' },
  yudhishthira:{ armor: '#3A5A9B', accent: '#CFF4FF', cloth: '#1f2a4a', cape: '#F1E7D0', mukut: 'king', rim: '#CFF4FF', skin: '#d4976a' },
  bhima:      { armor: '#8B3A1A', accent: '#FF9A4A', cloth: '#3a1a10', cape: '#5a1a0a', mukut: 'king', rim: '#FF9A4A', skin: '#b87a52' },
  arjuna:     { armor: '#2E6E8B', accent: '#7FE3FF', cloth: '#1a2a3a', cape: '#F1E7D0', mukut: 'king', rim: '#7FE3FF', skin: '#c98a5a' },
  krishna:    { armor: '#2A3A8B', accent: '#F4C95D', cloth: '#F4C95D', cape: '#F4C95D', mukut: 'crest', rim: '#9FD3FF', skin: '#5a6aa0' },
  drona:      { armor: '#D9A441', accent: '#FFFFFF', cloth: '#F1E7D0', cape: '#F1E7D0', mukut: 'sage', rim: '#FFE8A3', skin: '#c98a5a' },
  duryodhana: { armor: '#B5472D', accent: '#F4C95D', cloth: '#3a1a10', cape: '#2a0a0a', mukut: 'king', rim: '#FF7A2A', skin: '#b87a52' },
  jayadratha: { armor: '#4a2a6b', accent: '#8F6CFF', cloth: '#2a1a3a', cape: '#1a0a2a', mukut: 'king', rim: '#B088FF', skin: '#b87a52' },
  agastya:    { armor: '#E0B072', accent: '#FFFFFF', cloth: '#E0B072', cape: null, mukut: 'sage', rim: '#FFD090', skin: '#b87a52' },
  karna:      { armor: '#C98A2A', accent: '#FFE8A3', cloth: '#3a2a10', cape: '#5a3a10', mukut: 'king', rim: '#FFE8A3', skin: '#d4976a' },
  dushasana:  { armor: '#8B2E2E', accent: '#F4C95D', cloth: '#3a1010', cape: '#4a0a0a', mukut: 'king', rim: '#FF5A3B', skin: '#b87a52' },
  shalya:     { armor: '#5B4A8A', accent: '#D9A441', cloth: '#2a2040', cape: '#1a1030', mukut: 'king', rim: '#B088FF', skin: '#b87a52' },
  lakshmana:  { armor: '#2E6E8B', accent: '#F1E7D0', cloth: '#1a3040', cape: '#0a2030', mukut: 'prince', rim: '#7FE3FF', skin: '#d4976a' },
  brihadbala: { armor: '#6B4A2B', accent: '#E0B072', cloth: '#3a2a1a', cape: '#2a1a0a', mukut: 'king', rim: '#E0B072', skin: '#b87a52' },
  kripa:      { armor: '#2E4A6B', accent: '#CFF4FF', cloth: '#F1E7D0', cape: '#1a2a3a', mukut: 'sage', rim: '#CFF4FF', skin: '#c98a5a' },
  ashwatthama:{ armor: '#4A5A8B', accent: '#CFF4FF', cloth: '#2a3050', cape: '#1a2040', mukut: 'crest', rim: '#8F6CFF', skin: '#c98a5a' },
  kritavarma: { armor: '#5B3A6B', accent: '#8F6CFF', cloth: '#2a1a30', cape: '#1a0a20', mukut: 'king', rim: '#8F6CFF', skin: '#b87a52' },
  durmasena:  { armor: '#3A1F2A', accent: '#FF3B3B', cloth: '#1a0a10', cape: '#2a0a0a', mukut: 'prince', rim: '#FF3B3B', skin: '#b87a52' },
  soldier:    { armor: '#7A2E2E', accent: '#D9A441', cloth: '#4a1e1e', cape: null, mukut: 'band', rim: '#D9A441', skin: '#b87a52' },
  archer:     { armor: '#6B4D8A', accent: '#D9A441', cloth: '#3a2a4a', cape: null, mukut: 'band', rim: '#D9A441', skin: '#b87a52' },
  shield:     { armor: '#5C4A2E', accent: '#D9A441', cloth: '#3a2a1a', cape: null, mukut: 'band', rim: '#D9A441', skin: '#b87a52' }
};

export const PLAYER = {
  maxHp: 100, speed: 250, radius: 20,
  sword: { dmg: 9, arc: 1.3, range: 70, cd: 0.22, comboWindow: 0.55, comboDmg: [9, 10, 16] },
  bow:   { dmg: 12, chargedDmg: 26, speed: 760, cd: 0.38, chargeTime: 0.7 },
  gada:  { dmg: 30, arc: 1.7, range: 90, cd: 0.9, windup: 0.32, knock: 420 },
  dodge: { dur: 0.38, speed: 620, cd: 0.75 },
  shardHeal: 8
};

export const SATYAKI = {
  maxHp: 130, speed: 265, radius: 21,
  sword: { dmg: 8, arc: 1.4, range: 72, cd: 0.17, comboWindow: 0.5, comboDmg: [8, 8, 9, 15] },
  bow:   { dmg: 14, chargedDmg: 30, speed: 800, cd: 0.34, chargeTime: 0.6 },
  gada:  { dmg: 40, arc: 1.9, range: 100, cd: 1.0, windup: 0.36, knock: 520 },
  dodge: { dur: 0.36, speed: 650, cd: 0.7 },
  shardHeal: 10
};

export const ASTRAS = {
  vayu:   { name: 'वायु अस्त्र',  en: 'Vayu Astra',   color: '#CFF4FF', glow: '#7FE3FF', dmgPct: 0.25, stun: 2.2, desc: 'प्रचंड चक्रवात — शत्रु हवा में उछलते हैं।' },
  agni:   { name: 'अग्नि अस्त्र',  en: 'Agni Astra',   color: '#FF7A2A', glow: '#FFC46B', dmgPct: 0.30, burn: 4,  desc: 'अग्नि-लहर — जलन का प्रहार।' },
  varun:  { name: 'वरुण अस्त्र',  en: 'Varun Astra',  color: '#4FA3FF', glow: '#9FD3FF', dmgPct: 0.30, slow: 4,  desc: 'जल-प्रवाह — शत्रु के बाण और गति धुल जाते हैं।' },
  naag:   { name: 'नाग अस्त्र',   en: 'Naag Astra',   color: '#5FD88A', glow: '#B4FFD0', dmgPct: 0.25, bind: 4,  desc: 'सर्प-पाश — शत्रु बंध जाता है।' },
  bhoomi: { name: 'भूमि अस्त्र',  en: 'Bhoomi Astra', color: '#A9743A', glow: '#E0B072', dmgPct: 0.35, stun: 1.5, desc: 'धरती फटती है — रथ के पहिये जाम।' },
  him:    { name: 'हिम अस्त्र',   en: 'Him Astra',    color: '#CFF4FF', glow: '#FFFFFF', dmgPct: 0.0,  desc: 'हिम-जाल — जो छूता है, जम जाता है।' }
};

// Ring definitions. decay = HP/sec passive drain. minutes = target duration (tuning only).
export const RINGS = [
  { id: 1, name: 'प्रथम चक्र', sub: 'बाह्य परिधि', boss: 'dushasana', useAstra: null,     earnAstra: 'vayu',   decay: 0.18, waves: [5, 7],  bpm: 84,  sky: ['#E9B35A', '#B5472D', '#2B1E2F'], ground: '#8C5A32', light: 0.0, minutes: 3 },
  { id: 2, name: 'द्वितीय चक्र', sub: 'गदा-द्वार', boss: 'shalya',    useAstra: 'vayu',   earnAstra: 'agni',   decay: 0.25, waves: [6, 8],  bpm: 90,  sky: ['#D99A48', '#9E3B2A', '#261B2F'], ground: '#80522F', light: 0.1, minutes: 4 },
  { id: 3, name: 'तृतीय चक्र', sub: 'बाण-भूलभुलैया', boss: 'lakshmana', useAstra: 'agni',   earnAstra: 'varun',  decay: 0.32, waves: [6, 9],  bpm: 96,  sky: ['#C98540', '#7E3028', '#211A30'], ground: '#73492D', light: 0.2, minutes: 4 },
  { id: 4, name: 'चतुर्थ चक्र', sub: 'सूर्यपुत्र का द्वार', boss: 'karna', useAstra: 'varun',  earnAstra: 'naag',   decay: 0.42,  waves: [7, 9],  bpm: 104, sky: ['#B06B3A', '#5E2630', '#1B1A33'], ground: '#64412C', light: 0.35, minutes: 5 },
  { id: 5, name: 'पंचम चक्र', sub: 'रथ-आँधी', boss: 'brihadbala', useAstra: 'naag',  earnAstra: 'bhoomi', decay: 0.52, waves: [8, 10], bpm: 112, sky: ['#8E5438', '#442036', '#171A36'], ground: '#563A2B', light: 0.5, minutes: 5 },
  { id: 6, name: 'षष्ठ चक्र', sub: 'माया-द्वार', boss: 'kripa',    useAstra: 'bhoomi', earnAstra: 'him',    decay: 0.65,  waves: [8, 10], bpm: 120, sky: ['#5E3A44', '#2A1C3F', '#121636'], ground: '#48322C', light: 0.7, minutes: 6 },
  { id: 7, name: 'सप्तम चक्र', sub: 'व्यूह-नाभि', boss: 'siege',    useAstra: 'him',    earnAstra: null,     decay: 0.0,  waves: [0, 0],  bpm: 132, sky: ['#3A2A4C', '#1B1F3B', '#0B0C14'], ground: '#3B2C2C', light: 0.9, minutes: 8 }
];

export const BOSSES = {
  // colours resolve from LOOK[look] at load (see bottom)
  dushasana:  { name: 'दुःशासन', en: 'Dushasana', hp: 420, look: 'dushasana', radius: 26, speed: 190, weapon: 'sword',
                intro: 'दुःशासन: "बालक! तू अर्जुन-पुत्र है, इसलिए तुझे जीवित पकड़ूँगा।"',
                defeat: 'दुःशासन मूर्छित होकर गिरा। (महाभारत में भी अभिमन्यु ने उसे मूर्छित किया था।)' },
  shalya:     { name: 'शल्य', en: 'Shalya', hp: 560, look: 'shalya', radius: 28, speed: 150, weapon: 'gada',
                intro: 'शल्य: "मद्रराज की गदा का स्वाद चखो, कुमार!"',
                defeat: 'शल्य का रथ टूटा, वह पीछे हटा। उसका भाई आगे बढ़ा और गिरा।' },
  lakshmana:  { name: 'लक्ष्मण', en: 'Lakshmana (Duryodhana-putra)', hp: 520, look: 'lakshmana', radius: 24, speed: 210, weapon: 'bow',
                intro: 'लक्ष्मण: "अभिमन्यु! आज कौरव-कुमार और पांडव-कुमार का निर्णय होगा।"',
                defeat: 'लक्ष्मण परास्त। दुर्योधन का क्रोध व्यूह की हर परत में गूँजा।' },
  karna:      { name: 'कर्ण', en: 'Karna', hp: 700, look: 'karna', radius: 28, speed: 175, weapon: 'bow', kavach: true,
                intro: 'कर्ण: "तुम्हारा हर बाण मेरा बाण हवा में काटेगा, कुमार। पास आओ, तब जानूँ।"',
                defeat: 'कर्ण घायल होकर रथ पर बैठ गया। वृषसेन उसे पीछे ले गया।' },
  brihadbala: { name: 'बृहद्बल', en: 'Brihadbala (Kosala)', hp: 760, look: 'brihadbala', radius: 34, speed: 240, weapon: 'chariot',
                intro: 'बृहद्बल: "कोसल का रथ रुकता नहीं — हट जाओ या कुचले जाओ!"',
                defeat: 'कोसल-नरेश का रथ पलटा। (महाभारत में अभिमन्यु ने उसे मारा था; यहाँ वह गिरा।)' },
  kripa:      { name: 'कृप + अश्वत्थामा', en: 'Kripa & Ashwatthama', hp: 820, look: 'ashwatthama', radius: 26, speed: 200, weapon: 'maya',
                intro: 'अश्वत्थामा: "माया में सत्य ढूँढो, अर्जुन-पुत्र!" कृप: "और मेरे बाणों से बचो।"',
                defeat: 'माया छँटी। कृपाचार्य ने धनुष झुकाया — "यह बालक... द्रोण का शिष्य होता।"' },
  durmasena:  { name: 'दुर्मसेन', en: 'Durmasena (Dushasana-putra)', hp: 900, look: 'durmasena', radius: 30, speed: 200, weapon: 'gada',
                intro: 'दुर्मसेन: "पिता का बदला! गदा से तेरा सिर..."',
                defeat: 'दुर्मसेन धराशायी। जिस गदा से इतिहास लिखा गया था, वह आज मिट्टी में है।' }
};

export const CHARACTERS = {
  sanjaya:     { name: 'संजय', pitch: 0.95, rate: 0.92, color: '#F1E7D0' },
  abhimanyu:   { name: 'अभिमन्यु', pitch: 1.2, rate: 1.02, color: '#F4C95D' },
  yudhishthira:{ name: 'युधिष्ठिर', pitch: 0.9, rate: 0.9, color: '#CFF4FF' },
  bhima:       { name: 'भीम', pitch: 0.6, rate: 0.95, color: '#FF7A2A' },
  satyaki:     { name: 'सात्यकि', pitch: 0.85, rate: 1.0, color: '#5FD88A' },
  drona:       { name: 'द्रोण', pitch: 0.7, rate: 0.88, color: '#D9A441' },
  duryodhana:  { name: 'दुर्योधन', pitch: 0.75, rate: 1.05, color: '#B5472D' },
  jayadratha:  { name: 'जयद्रथ', pitch: 0.8, rate: 1.0, color: '#8F6CFF' },
  arjuna:      { name: 'अर्जुन', pitch: 0.9, rate: 0.95, color: '#7FE3FF' },
  krishna:     { name: 'श्रीकृष्ण', pitch: 1.0, rate: 0.9, color: '#9FD3FF' },
  agastya:     { name: 'महर्षि अगस्त्य', pitch: 0.65, rate: 0.85, color: '#E0B072' },
  enemy:       { name: 'शत्रु', pitch: 0.7, rate: 1.0, color: '#FF3B3B' }
};

// Intro cinematic — scene list. Each scene: bg style, lines [{who, text}], duration auto from lines.
export const INTRO = [
  { bg: 'dawn', title: 'त्रयोदश दिवस — कुरुक्षेत्र', lines: [
    { who: 'sanjaya', text: 'धृतराष्ट्र! तेरहवें दिन का सूर्य लहू-सा लाल उगा। कल द्रोण, युधिष्ठिर को बंदी बनाने में विफल रहे थे।' },
    { who: 'duryodhana', text: 'आचार्य! आपने वचन दिया था। युधिष्ठिर अब तक मुक्त क्यों है?' },
    { who: 'drona', text: 'जब तक अर्जुन युधिष्ठिर के पास है, दुर्योधन, कोई उसे छू नहीं सकता। अर्जुन को दूर करो — फिर देखो।' }
  ]},
  { bg: 'camp_kaurava', lines: [
    { who: 'sanjaya', text: 'त्रिगर्त के संशप्तक आगे आए। उन्होंने अग्नि के सामने शपथ ली — अर्जुन को मारेंगे, या मरेंगे।' },
    { who: 'sanjaya', text: 'उन्होंने अर्जुन को दक्षिण दिशा में युद्ध के लिए ललकारा। और अर्जुन... क्षत्रिय ललकार को टाल नहीं सकता।' },
    { who: 'arjuna', text: 'केशव, रथ दक्षिण की ओर लो। युधिष्ठिर की रक्षा के लिए सात्यकि और भीम हैं। मैं संध्या से पहले लौटूँगा।' }
  ]},
  { bg: 'vyuha', lines: [
    { who: 'sanjaya', text: 'अर्जुन के जाते ही द्रोण ने वह रचा जो कुरुक्षेत्र ने पहले नहीं देखा था — चक्रव्यूह। सात घूमती हुई परतें। हर परत में एक महारथी, हर द्वार पर मृत्यु।' },
    { who: 'sanjaya', text: 'व्यूह घूमता था, और पांडव सेना उसके सामने घास की तरह कटती जा रही थी।' }
  ]},
  { bg: 'camp_pandava', lines: [
    { who: 'yudhishthira', text: 'इस व्यूह को कौन तोड़ सकता है? अर्जुन दूर हैं, कृष्ण उनके साथ, प्रद्युम्न द्वारका में।' },
    { who: 'abhimanyu', text: 'तात! मैं जानता हूँ। पिता ने माता को गर्भ में यह विद्या सुनाई थी — मैंने प्रवेश सीखा... पर निर्गमन नहीं। माता सो गई थीं, और पिता चुप हो गए थे।' },
    { who: 'bhima', text: 'निर्गमन की चिंता मत कर, पुत्र! तू द्वार तोड़, हम तेरे पीछे घुसेंगे। मैं, सात्यकि, धृष्टद्युम्न — द्वार बंद नहीं होने देंगे।' },
    { who: 'yudhishthira', text: 'यह मेरा वचन है, अभिमन्यु। तू अकेला नहीं जाएगा।' }
  ]},
  { bg: 'satyaki_memory', title: 'सात्यकि का स्मरण', lines: [
    { who: 'sanjaya', text: 'उसी क्षण, सात्यकि को वर्षों पुराना एक वचन याद आया। विंध्य के पार, महर्षि अगस्त्य के आश्रम में बारह वर्ष की तपस्या के बाद —' },
    { who: 'agastya', text: 'वृष्णि-वीर! तुझे एक सिद्धि देता हूँ — सूक्ष्म-गति। छाया में चल सकेगा, और जिसमें प्राण शेष हो उसमें प्राण लौटा सकेगा। पर शर्त यह है —' },
    { who: 'agastya', text: 'इसे युद्ध में तब तक प्रयोग न करना जब तक धर्म की रक्षा किसी और उपाय से संभव हो। जिस दिन कोई और उपाय न रहे — उस दिन तू जानेगा।' },
    { who: 'satyaki', text: '(स्वयं से) आज तक वह दिन नहीं आया था।' }
  ]},
  { bg: 'gate', lines: [
    { who: 'sanjaya', text: 'अभिमन्यु का रथ व्यूह के द्वार पर टूट पड़ा। सोलह वर्ष का बालक — और द्वार खुल गया। पांडव-सेना ने जयघोष किया।' },
    { who: 'jayadratha', text: 'रुको! शिव के वरदान से आज इस द्वार पर कोई पांडव नहीं जाएगा। आज जयद्रथ ही द्वार है!' },
    { who: 'sanjaya', text: 'भीम की गदा, युधिष्ठिर के बाण — सब जयद्रथ पर व्यर्थ। द्वार अभिमन्यु के पीछे बंद होने लगा।' },
    { who: 'satyaki', text: '(स्वयं से) वरदान पांडवों पर है। मैं पांडव नहीं हूँ... और आज कोई और उपाय नहीं बचा। महर्षि — वह दिन आ गया।' },
    { who: 'sanjaya', text: 'और सात्यकि छाया बन गया। जयद्रथ की दृष्टि से परे, घूमती परत के बीच से, वह व्यूह में उतर गया — बिना किसी के जाने।' }
  ]},
  { bg: 'inside', title: 'अब इतिहास तुम्हारे हाथ में है', lines: [
    { who: 'abhimanyu', text: 'पहली परत... दुःशासन का ध्वज। ठीक है। जो गर्भ में सुना था, वह आज रक्त में लिखूँगा।' }
  ]}
];

export const RING_LINES = {
  1: { drona: 'द्रोण: "दुःशासन! उसे जीवित चाहिए।"', after: 'संजय: "पहली परत टूटी। पीछे, छाया में, सात्यकि ने पहली व्यूह-नाभि गिरा दी — ताकि परत फिर बंद न हो।"' },
  2: { drona: 'द्रोण: "शल्य, गदा से उसका रथ रोको।"', after: 'संजय: "दूसरी नाभि गिरी। व्यूह का घूमना एक पल को लड़खड़ाया — द्रोण ने देखा, पर कारण नहीं समझा।"' },
  3: { drona: 'द्रोण: "लक्ष्मण! दुर्योधन का पुत्र होकर पीछे मत हटना।"', after: 'संजय: "तीसरी नाभि। अभिमन्यु थक रहा था — पर उसके बाण नहीं।"' },
  4: { drona: 'द्रोण: "कर्ण! अब तुम्हारा कवच ही इस परत का द्वार है।"', after: 'संजय: "कर्ण घायल हुआ — और उसी क्षण उसने द्रोण से कहा: इसका धनुष पीछे से काटो, सामने से यह अजेय है।"' },
  5: { drona: 'द्रोण: "बृहद्बल, रथ से कुचलो।"', after: 'संजय: "पाँचवीं नाभि। अब व्यूह आधा ही घूमता था। कौरव सेनापति एक-दूसरे को देख रहे थे।"' },
  6: { drona: 'द्रोण: "अश्वत्थामा, पुत्र — माया रचो। कृप, तुम बाण।"', after: 'संजय: "छठी परत टूटी। विपत्ति सिर पर थी — और नाभि में छह महारथी प्रतीक्षा कर रहे थे।"' },
  7: { drona: 'द्रोण: "अब... सब एक साथ।"', after: '' }
};

// ग्रंथ-पृष्ठ — one manuscript page per ring: what Vyasa wrote, what this retelling changed, and one detail worth being proud of.
export const CODEX = [
  { title: 'व्यूह-विद्या', vyasa: 'द्रोण पर्व: तेरहवें दिन द्रोण ने चक्रव्यूह रचा। अभिमन्यु ने दुःशासन को मूर्छित किया — उसका सारथी उसे रणभूमि से बाहर ले गया।', here: 'यहाँ भी दुःशासन मूर्छित होकर गिरता है — मरता नहीं। व्यास के अनुसार उसका अंत बाद में भीम के हाथों हुआ।', pride: 'व्यूह-रचना महाभारत की युद्धकला थी — क्रौंच, मकर, गरुड़, वज्र, चक्र। हर सुबह सेनापति नई रचना चुनता था; यह शतरंज से हज़ार साल पुराना रणनीति-शास्त्र है।' },
  { title: 'मद्रराज', vyasa: 'शल्य नकुल-सहदेव के मामा थे, फिर भी छल से कौरव-पक्ष में लाए गए। अभिमन्यु के बाणों से शल्य मूर्छित हुए; उनका भाई आगे बढ़ा और मारा गया।', here: 'यहाँ शल्य का रथ टूटता है और वे पीछे हटते हैं — मूल में भी वे इस दिन नहीं मरे।', pride: 'मद्र देश आज के पंजाब (स्यालकोट क्षेत्र) में था। महाभारत का भूगोल गांधार (कंधार) से प्राग्ज्योतिष (असम) तक फैला है — एक ही कथा में पूरा उपमहाद्वीप।' },
  { title: 'कौरव-कुमार', vyasa: 'लक्ष्मण कुमार दुर्योधन का पुत्र था। अभिमन्यु ने उसे मार डाला — और उसी क्षण दुर्योधन ने छह महारथियों को एक साथ आदेश दिया।', here: 'यहाँ लक्ष्मण परास्त होकर पीछे हटता है। हम एक किशोर के हाथों दूसरे किशोर की मृत्यु नहीं दिखाना चाहते थे; परिणाम वही — दुर्योधन का क्रोध।', pride: 'अभिमन्यु सोलह वर्ष का था। उसकी पत्नी उत्तरा गर्भवती थी। वह पुत्र — परीक्षित — हस्तिनापुर का राजा बना; उसी के पुत्र जनमेजय को वैशम्पायन ने यह पूरी महाभारत सुनाई। जो कथा तुम खेल रहे हो, वह अभिमन्यु के पोते को सुनाई गई थी।' },
  { title: 'सूर्यपुत्र', vyasa: 'कर्ण अभिमन्यु के बाणों से घायल हुआ। द्रोण के कहने पर कर्ण ने पीछे से अभिमन्यु का धनुष काटा — सामने से वह अजेय था।', here: 'कर्ण का कवच-कुंडल युद्ध से पहले ही इंद्र को दान हो चुका था (वन पर्व)। इसलिए यहाँ कर्ण "कवच" से नहीं, अपने बाणों से तुम्हारे बाण हवा में काटता है — इतिहास की शुद्धता के लिए।', pride: 'कर्ण की दानवीरता — जानते हुए कि इंद्र छल कर रहे हैं, फिर भी कवच-कुंडल दे देना — भारतीय नैतिकता का सबसे जटिल प्रश्न है: वचन बड़ा, या विजय?' },
  { title: 'कोसल-नरेश', vyasa: 'बृहद्बल कोसल (अयोध्या) के राजा थे, इक्ष्वाकु-वंश के — श्रीराम के कुल के। अभिमन्यु ने उन्हें मार डाला।', here: 'यहाँ उनका रथ पलटता है और वे गिरते हैं। हमने इस पुनर्लेखन में केवल कहानी का अंत बदला है, योद्धाओं की वीरता नहीं।', pride: 'रामायण और महाभारत एक ही वंश-सूत्र से जुड़े हैं — बृहद्बल रघुकुल का वह अंतिम प्रसिद्ध राजा है जो महाभारत में लड़ा। दो महाकाव्य, एक इतिहास।' },
  { title: 'चिरंजीवी', vyasa: 'कृपाचार्य द्रोण के साले (कृपी के भाई) थे और कौरव-पांडव दोनों के पहले गुरु। अश्वत्थामा द्रोण का पुत्र। दोनों ने अभिमन्यु पर बाण चलाए।', here: 'अश्वत्थामा की "माया" और कृप का "सत्य-संकेत" खेल की रचना है — मूल में दोनों सीधे बाण-युद्ध में थे।', pride: 'कृप और अश्वत्थामा दोनों सात चिरंजीवियों में गिने जाते हैं — परंपरा कहती है वे आज भी हैं। गुरु-परंपरा की यह कल्पना — कि ज्ञान देने वाला मरता नहीं — भारतीय चिंतन का मूल है।' },
  { title: 'षट्-महारथी', vyasa: 'द्रोण, कृप, कर्ण, अश्वत्थामा, बृहद्बल, कृतवर्मा — छह महारथी एक निहत्थे बालक पर। धनुष कटा, रथ टूटा, अंत में उसने रथ का पहिया उठाया। दुःशासन-पुत्र की गदा से अभिमन्यु गिरा। उसी रात अर्जुन ने प्रतिज्ञा की — कल सूर्यास्त से पहले जयद्रथ-वध।', here: 'यहाँ पहिया उठाने के बाद कहानी मुड़ती है — क्योंकि एक मित्र पीछे था। बाकी सब — छह महारथी, टूटा धनुष, पहिया — व्यास का है।', pride: 'आदि पर्व कहता है: अभिमन्यु चंद्रमा के पुत्र वर्चा का अवतार था। चंद्र ने शर्त रखी थी — मेरा पुत्र पृथ्वी पर केवल सोलह वर्ष रहेगा। इसलिए अभिमन्यु की कथा दुखांत नहीं, पूर्वनिर्धारित वापसी है। आज तुमने उस शर्त को चुनौती दी।' }
];

export const RING7 = {
  siegeLines: [
    { who: 'sanjaya', text: 'छह महारथी। द्रोण, कृप, कर्ण, अश्वत्थामा, बृहद्बल, कृतवर्मा — एक बालक पर, एक साथ। युद्ध-धर्म यहीं मरा।' },
    { who: 'enemy', text: 'कर्ण: "पीछे से उसका धनुष काटो!"' },
    { who: 'sanjaya', text: 'धनुष की डोरी कटी। सारथी गिरा। रथ के पहिये टूटे। अब केवल तलवार... और सोलह वर्ष का हृदय।' }
  ],
  fallLines: [
    { who: 'sanjaya', text: 'दुर्मसेन गदा लेकर बढ़ा। अभिमन्यु घुटनों पर था। इतिहास में, यहीं कहानी समाप्त होती है।' },
    { who: 'abhimanyu', text: '(धीमे) तात भीम... आपने कहा था... आप पीछे हैं...' },
    { who: 'sanjaya', text: 'पर आज इतिहास नहीं — तुम लिख रहे हो। मित्र का स्मरण करो।' }
  ],
  satyakiEntry: [
    { who: 'satyaki', text: 'अभिमन्यु! मैं यहाँ हूँ — वचन के अनुसार, तुम्हारे पीछे।' },
    { who: 'satyaki', text: 'पहले इस गदाधारी को बाँधता हूँ। बाण-जाल!' }
  ],
  dronaRetreat: [
    { who: 'drona', text: '(धीमे) एक बालक पर छह... और अब यह वृष्णि अकेला आया है। यह अधर्म है। कृप, कृतवर्मा — पीछे हटो। यह द्वंद्व उनका है।' }
  ],
  healLines: [
    { who: 'satyaki', text: 'अगस्त्य का दूसरा वरदान — प्राण-संचार। उठो, कुमार। यह द्वंद्व देखो, लड़ो मत।' },
    { who: 'abhimanyu', text: 'सात्यकि... आप कैसे...? ...कोई बात नहीं। आज मैं दर्शक हूँ।' }
  ],
  duelLines: [
    { who: 'enemy', text: 'दुर्मसेन: "जाल टूटा! अब तू, यादव!"' }
  ],
  pashLines: [
    { who: 'sanjaya', text: 'तभी — जो पीछे हटे थे, वे लौटे। कृतवर्मा, अश्वत्थामा और कृप ने सात्यकि पर पाश फेंका। कर्ण और बृहद्बल ने अभिमन्यु को फिर घेरा।' },
    { who: 'satyaki', text: '(बँधे हुए) कुमार! मेरी चिंता मत करो — अपना रास्ता बनाओ!' },
    { who: 'sanjaya', text: 'अभिमन्यु के पास न धनुष था, न गदा। पास पड़ा था उसके टूटे रथ का पहिया। (व्यास कहते हैं — अंत में उसने यही उठाया था।)' }
  ],
  chakraLines: [
    { who: 'abhimanyu', text: 'यह पहिया... पिता के सारथी ने कहा था — सुदर्शन भी तो चक्र ही है।' },
    { who: 'sanjaya', text: 'और सोलह वर्ष के बालक ने रथ का पहिया ढाल की तरह उठाया — जैसे स्वयं वासुदेव।' }
  ],
  freeLines: [
    { who: 'abhimanyu', text: 'अब आप, सात्यकि! पाश-धारियों को हटाता हूँ।' },
    { who: 'satyaki', text: 'यही अर्जुन का रक्त है। अब दोनों — नाभि की ओर!' }
  ],
  coreLines: [
    { who: 'satyaki', text: 'नाभि-स्तंभ! हिम-अस्त्र से इसे जमाओ — मैं गदा से तोड़ता हूँ। साथ में!' },
    { who: 'sanjaya', text: 'छह परतों की टूटी हुई नाभियाँ एक साथ ढह गईं। चक्रव्यूह ने घूमना बंद कर दिया। परतें... खुल गईं।' }
  ]
};

export const EPILOGUE = [
  { bg: 'sunset', lines: [
    { who: 'sanjaya', text: 'संध्या। व्यूह की टूटी परतों से दो योद्धा बाहर निकले। और उनके पीछे — वह हज़ारों पांडव सैनिक, जो अभिमन्यु को बचाने घुसते और कभी न लौटते।' },
    { who: 'bhima', text: '(पौण्ड्र शंख का नाद) कुरुक्षेत्र सुन ले! आज अभिमन्यु सबसे बड़ा महारथी है!' },
    { who: 'sanjaya', text: 'उसी क्षण दक्षिण से एक रथ आया। संशप्तकों का संहार करके — अर्जुन और केशव।' },
    { who: 'arjuna', text: 'पुत्र... (अभिमन्यु को गले लगाते हुए) मैंने निर्गमन नहीं सिखाया था।' },
    { who: 'abhimanyu', text: 'सिखाने की आवश्यकता नहीं थी, पिता। मेरे पीछे एक मित्र था।' },
    { who: 'krishna', text: '(मुस्कुराते हुए, सात्यकि की ओर) अगस्त्य ने ठीक दिन चुना, सात्यकि।' }
  ]}
];

for (const k in BOSSES) { const L = LOOK[BOSSES[k].look]; BOSSES[k].color = L.armor; BOSSES[k].accent = L.accent; }
