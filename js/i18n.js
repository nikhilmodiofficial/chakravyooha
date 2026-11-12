// Language layer. Hindi is the source of truth in config.js; English is applied on top by mutating the same objects
// (so every module keeps reading config as-is). Key terms stay untranslated by design: Chakravyooha, Mitra Smaran, Vipatti,
// Astra names, Granth, Nabhi, Dwar.
import { RINGS, BOSSES, ASTRAS, INTRO, EPILOGUE, RING7, RING_LINES, CODEX, HYPE, CHARACTERS, CHAR_INFO, STORY, ASTRA_INFO } from './config.js';

let current = 'hi'; const backup = new Map();
const keep = (obj, k) => { const id = obj; if (!backup.has(id)) backup.set(id, {}); const b = backup.get(id); if (!(k in b)) b[k] = obj[k]; };
const set = (obj, k, v) => { if (v === undefined) return; keep(obj, k); obj[k] = v; };
const restore = () => { for (const [obj, b] of backup) for (const k in b) obj[k] = b[k]; };

const EN = {
  chars: { sanjaya: 'Sanjaya', abhimanyu: 'Abhimanyu', yudhishthira: 'Yudhishthira', bhima: 'Bhima', satyaki: 'Satyaki', drona: 'Drona', duryodhana: 'Duryodhana', jayadratha: 'Jayadratha', arjuna: 'Arjuna', krishna: 'Krishna', agastya: 'Rishi Agastya', enemy: 'Enemy' },
  rings: [['First Chakra', 'Outer rim'], ['Second Chakra', 'Gate of the Mace'], ['Third Chakra', 'Maze of Arrows'], ['Fourth Chakra', 'Gate of the Sun-born'], ['Fifth Chakra', 'Chariot Storm'], ['Sixth Chakra', 'Gate of Illusion'], ['Seventh Chakra', 'The Nabhi']],
  astras: { vayu: ['Vayu Astra', 'A whirlwind. Enemies are flung into the air.'], agni: ['Agni Astra', 'A wave of fire that keeps burning.'], varun: ['Varun Astra', 'A flood. Enemy arrows and speed are washed away.'], naag: ['Naag Astra', 'Serpent-bonds. The enemy is bound.'], bhoomi: ['Bhoomi Astra', 'The earth splits; chariot wheels jam.'], him: ['Him Astra', 'Frost-net. What it touches, freezes.'] },
  bosses: {
    dushasana: ['Dushasana', 'Dushasana: "Boy! You are Arjuna\'s son, so I will take you alive."', 'Dushasana fell unconscious. (In the Mahabharata too, Abhimanyu knocked him senseless.)'],
    shalya: ['Shalya', 'Shalya: "Taste the mace of Madra, prince!"', 'Shalya\'s chariot broke; he fell back. His brother stepped forward, and fell.'],
    lakshmana: ['Lakshmana', 'Lakshmana: "Abhimanyu! Today the Kaurava prince and the Pandava prince settle it."', 'Lakshmana defeated. Duryodhana\'s rage echoed through every ring.'],
    karna: ['Karna', 'Karna: "Every arrow of yours, my arrow will cut mid-air, prince. Come close, then I\'ll know you."', 'Karna, wounded, sat down in his chariot. Vrishasena drew him back.'],
    brihadbala: ['Brihadbala', 'Brihadbala: "The chariot of Kosala does not stop. Move, or be crushed!"', 'The king of Kosala\'s chariot overturned. (In the Mahabharata Abhimanyu killed him; here he falls.)'],
    kripa: ['Kripa + Ashwatthama', 'Ashwatthama: "Find the truth inside the illusion, son of Arjuna!" Kripa: "And survive my arrows."', 'The illusion cleared. Kripacharya lowered his bow — "This boy... would have been Drona\'s student."'],
    karna2: ['Karna', 'Karna: "Stop, son of Arjuna! Put the wheel down. The Sun-born challenges you with the bow — archer to archer."', 'Sanjaya: "The next arrow — and the Anga-king\'s bow split in two! Karna, wounded, sat in his chariot. After this day he never again called Abhimanyu a boy."'],
    durmasena: ['Durmasena', 'Durmasena: "For my father! With this mace, your head—"', 'Durmasena down. The mace that once wrote history lies in the dust.']
  },
  ringLines: {
    1: ['Drona: "Dushasana! I want him alive."', 'Sanjaya: "The first ring broke. Behind, in the shadows, Satyaki felled the first Vyooha-Nabhi — so the ring could never close again."'],
    2: ['Drona: "Shalya, stop his chariot with the mace."', 'Sanjaya: "The second Nabhi fell. For a moment the turning of the Vyooha stumbled — Drona saw it, but not the cause."'],
    3: ['Drona: "Lakshmana! You are Duryodhana\'s son — do not step back."', 'Sanjaya: "The third Nabhi. Abhimanyu was tiring — but not his arrows."'],
    4: ['Drona: "Karna! Now your bow is the gate of this ring."', 'Sanjaya: "Karna was wounded — and in that moment he told Drona: cut his bow from behind, from the front he cannot be beaten."'],
    5: ['Drona: "Brihadbala, crush him under the chariot."', 'Sanjaya: "The fifth Nabhi. The Vyooha now turned only by half. Kaurava generals looked at one another."'],
    6: ['Drona: "Ashwatthama, my son — weave the illusion. Kripa, the arrows."', 'Sanjaya: "The sixth ring broke. Vipatti sat on his shoulders — and in the Nabhi, six maharathis were waiting."'],
    7: ['Drona: "Now... all together."', '']
  },
  intro: [
    ['The Thirteenth Day — Kurukshetra', ['Dhritarashtra! The sun of the thirteenth day rose red as blood. Yesterday Drona had failed to take Yudhishthira captive.', 'Acharya! You gave your word. Why is Yudhishthira still free?', 'As long as Arjuna stands beside Yudhishthira, Duryodhana, no one can touch him. Draw Arjuna away — then watch.']],
    [null, ['The Samsaptakas of Trigarta stepped forward. Before the fire they swore an oath — kill Arjuna, or die.', 'They challenged Arjuna to battle in the south. And Arjuna... a Kshatriya cannot refuse a challenge.', 'Keshava, take the chariot south. Satyaki and Bhima guard Yudhishthira. I will return before dusk.']],
    [null, ['The moment Arjuna left, Drona built what Kurukshetra had never seen — the Chakravyooha. Seven turning rings. A maharathi in every ring, death at every gate.', 'The Vyooha turned, and the Pandava army was being cut before it like grass.']],
    [null, ['Who can break this Vyooha? Arjuna is far, Krishna with him, Pradyumna in Dwaraka.', 'Uncle! I know. Father told Mother this art while I was in her womb — I learned the way in... but not the way out. Mother fell asleep, and Father fell silent.', 'Do not worry about the way out, son! Break the gate; we come in right behind you. Me, Satyaki, Dhrishtadyumna — we will not let the gate close.', 'That is my word, Abhimanyu. You will not go alone.']],
    ['Satyaki remembers', ['In that moment Satyaki remembered a promise years old. Beyond the Vindhyas, in the ashram of Rishi Agastya, after twelve years of austerity —', 'Hero of the Vrishnis! I give you one siddhi — Sukshma-gati. You will be able to walk within shadow, and return life-breath to one in whom breath remains. But the condition is this —', 'Do not use it in war while dharma can still be protected by any other means. The day no other means remains — that day you will know.', '(to himself) Until today, that day had never come.']],
    [null, ['Abhimanyu\'s chariot struck the gate of the Vyooha. A boy of sixteen — and the gate opened. The Pandava army roared.', 'Halt! By Shiva\'s boon no Pandava passes this gate today. Today Jayadratha himself is the gate!', 'Bhima\'s mace, Yudhishthira\'s arrows — all useless against Jayadratha. The gate began to close behind Abhimanyu.', '(to himself) The boon is upon the Pandavas. I am no Pandava... and today no other means remains. Rishi — the day has come.', 'And Satyaki became a shadow. Beyond Jayadratha\'s sight, between the turning ranks, he slipped into the Vyooha — unseen by anyone.']],
    ['Now history is in your hands', ['The first ring... Dushasana\'s banner. Good. What I heard in the womb, today I write in blood.']]
  ],
  r7: {
    siegeLines: ['Six maharathis. Drona, Kripa, Karna, Ashwatthama, Brihadbala, Kritavarma — on one boy, all at once. The dharma of war died right here.', 'Karna: "Cut his bow from behind!"', 'The bowstring snapped. The charioteer fell. The wheels broke. Now only a sword... and a sixteen-year-old heart.'],
    fallLines: ['Durmasena came forward with his mace. Abhimanyu was on his knees. In history, this is where the story ends.', '(faintly) Uncle Bhima... you said... you were right behind...', 'But today is not history — you are writing it. Remember your friend.'],
    satyakiEntry: ['Abhimanyu! I am here — as promised, right behind you.', 'First I bind this mace-bearer. Bana-jaala!'],
    dronaRetreat: ['(quietly) Six upon one boy... and now this Vrishni comes alone. This is adharma. Kripa, Kritavarma — fall back. This duel is theirs.'],
    healLines: ['Agastya\'s second gift — Prana-sanchar. Rise, prince. Watch this duel; do not fight it.', 'Satyaki... how did you...? ...No matter. Today I am the witness.'],
    duelLines: ['Durmasena: "The net is broken! Now you, Yadava!"'],
    pashLines: ['Then — those who had stepped back returned. Kritavarma, Ashwatthama and Kripa threw a noose over Satyaki. Karna and Brihadbala closed on Abhimanyu again.', '(bound) Prince! Do not think of me — make your own way!', 'Abhimanyu had neither bow nor mace. Beside him lay the wheel of his broken chariot. (Vyasa says — at the end, this is what he lifted.)'],
    chakraLines: ['This wheel... Father\'s charioteer once said — the Sudarshana too is only a wheel.', 'And the sixteen-year-old lifted the chariot wheel like a shield — like Vasudeva himself.'],
    karnaLines: ['Lifting a fallen soldier\'s bow, the boy of sixteen stood before the king of Anga. Kurukshetra held its breath.', 'Karna: "Sadhu, putra, sadhu! Such incomparable skill at so small an age! You have proven, son, that you are the true heir to Arjuna\'s art of war."', 'King of Anga! These words from your lips — a greater reward to me than any astra. (bows) But the battle is not yet over.', 'See, O King! Even the enemy bows. That is the mark of a Mahayoddha — humility before victory.', 'Karna: "(wounded) Today the Sun watched his son lose — and was proud. Go, prince."', 'And Abhimanyu lifted that same wheel again — this time, to save someone.'],
    freeLines: ['Now you, Satyaki! I will clear the noose-bearers.', 'This is Arjuna\'s blood. Now both of us — to the Nabhi!'],
    coreLines: ['The Nabhi pillar! Freeze it with the Him Astra — I break it with the mace. Together!', 'The broken Nabhis of six rings collapsed at once. The Chakravyooha stopped turning. The rings... opened.']
  },
  epi: [[null, ['Dusk. Two warriors walked out through the broken rings. And behind them — the thousands of Pandava soldiers who would have charged in to save Abhimanyu and never returned.', '(the Paundra conch sounds) Hear me, Kurukshetra! Today Abhimanyu is the greatest maharathi of all!', 'In that moment a chariot came from the south. Having slain the Samsaptakas — Arjuna and Keshava.', 'Son... (embracing Abhimanyu) I never taught you the way out.', 'There was no need to teach it, Father. There was a friend behind me.', '(smiling, toward Satyaki) Agastya chose the right day, Satyaki.']]],
  hype: { streak: 'Mahayoddha!', cleanWave: 'Untouched!', parry: 'Pratighat!', dodge: 'Leap!', phase2: 'Son of Arjuna!', astra: 'Divyastra!', bossDown: 'Heir of the greatest archer!', vipatti: 'Vipatti', chakra: 'Ratha-chakra!' },
  codex: [
    ['The Art of the Vyooha', 'Drona Parva: on the thirteenth day Drona built the Chakravyooha. Abhimanyu knocked Dushasana unconscious — his charioteer carried him off the field.', 'Here too Dushasana falls unconscious — he does not die. In Vyasa, his end came later, at Bhima\'s hands.', 'Formation-craft was the war science of the Mahabharata — Krauncha, Makara, Garuda, Vajra, Chakra. Every dawn the commander chose a new shape; a strategy tradition a thousand years older than chess.'],
    ['King of Madra', 'Shalya was the maternal uncle of Nakula and Sahadeva, yet was tricked onto the Kaurava side. Abhimanyu\'s arrows knocked him unconscious; his brother stepped up and was killed.', 'Here Shalya\'s chariot breaks and he retreats — in the source too he did not die this day.', 'Madra lay in today\'s Punjab (around Sialkot). The geography of the epic stretches from Gandhara (Kandahar) to Pragjyotisha (Assam) — a whole subcontinent in one story.'],
    ['The Kaurava Prince', 'Lakshmana Kumara was Duryodhana\'s son. Abhimanyu killed him — and in that instant Duryodhana ordered six maharathis to attack together.', 'Here Lakshmana is defeated and retreats. We did not want to show one teenager killing another; the consequence is the same — Duryodhana\'s rage.', 'Abhimanyu was sixteen. His wife Uttara was pregnant. That son — Parikshit — became king of Hastinapura; it was to his son Janamejaya that Vaishampayana recited this entire Mahabharata. The story you are playing was first told to Abhimanyu\'s grandson.'],
    ['Son of the Sun', 'Karna was wounded by Abhimanyu\'s arrows. On Drona\'s advice Karna cut Abhimanyu\'s bow from behind — from the front he was unbeatable.', 'Karna\'s armour and earrings had already been given to Indra before the war (Vana Parva). So here Karna fights with no armour: he cuts your arrows out of the air with his own — for the sake of accuracy.', 'Karna\'s generosity — giving away the armour knowing Indra was deceiving him — is the hardest question in Indian ethics: is a promise greater than victory?'],
    ['King of Kosala', 'Brihadbala was king of Kosala (Ayodhya), of the Ikshvaku line — Rama\'s own dynasty. Abhimanyu killed him.', 'Here his chariot overturns and he falls. In this retelling we changed only the ending, never the warriors\' valour.', 'The Ramayana and the Mahabharata are tied by one dynastic thread — Brihadbala is the last famous king of Raghu\'s line to fight in the Mahabharata. Two epics, one history.'],
    ['The Immortals', 'Kripacharya was Drona\'s brother-in-law (brother of Kripi) and the first teacher of both Kauravas and Pandavas. Ashwatthama was Drona\'s son. Both shot at Abhimanyu.', 'Ashwatthama\'s "illusion" and Kripa\'s "truth-signal" are the game\'s invention — in the source both fought a straight arrow-duel.', 'Kripa and Ashwatthama are both counted among the seven Chiranjivis — tradition says they live still. The idea that the giver of knowledge does not die is at the root of Indian thought.'],
    ['Six Maharathis', 'Drona, Kripa, Karna, Ashwatthama, Brihadbala, Kritavarma — six maharathis on one unarmed boy. Bow cut, chariot broken, at the last he lifted a chariot wheel. Abhimanyu fell to the mace of Dushasana\'s son. That night Arjuna swore: before tomorrow\'s sunset, Jayadratha dies.', 'Here the story turns after the wheel is lifted — because a friend was behind him. Everything else — six maharathis, broken bow, the wheel — is Vyasa\'s.', 'The Adi Parva says Abhimanyu was the incarnation of Varcha, son of the Moon. The Moon set one condition — my son stays on earth only sixteen years. So Abhimanyu\'s story is not a tragedy but a foretold return. Today you challenged that condition.']
  ],
  charInfo: {
    abhimanyu: ['Saubhadra · son of Arjuna and Subhadra · age 16', 'Learned the way into the Chakravyooha in the womb — the way out was never finished. Husband of Uttara, father of Parikshit. Trained in Dwaraka by Krishna and Pradyumna. On the thirteenth day he was the only one who could break the Vyooha.', 'You. Sword, bow, mace — and at the end, a chariot wheel.'],
    satyaki: ['Yuyudhana · hero of the Vrishnis · Arjuna\'s student', 'Krishna\'s friend; learned archery from Arjuna. In the Mahabharata he tried to follow Abhimanyu in — Jayadratha stopped him. In this telling, Agastya\'s siddhi carries him inside.', 'Your friend (or you) — appears at Mitra Smaran.'],
    karna: ['King of Anga · son of the Sun · the giver', 'Kunti\'s eldest, insulted as a charioteer\'s son. Had already gifted his armour and earrings to Indra. Wounded by Abhimanyu; then, on Drona\'s word, cut his bow from behind.', 'Maharathi of the fourth chakra — and an archery duel in the Nabhi.'],
    drona: ['Acharya · Kaurava commander · architect of the Vyooha', 'Teacher of Kauravas and Pandavas alike. Arjuna his favourite; in Abhimanyu he saw Arjuna. The Chakravyooha was his design — and so was the order for six maharathis.', 'His voice at every ring. He does not fight.'],
    dushasana: ['Kaurava · Duryodhana\'s younger brother', 'The one who dragged Draupadi by her hair. Abhimanyu knocked him unconscious; Bhima killed him later.', 'First chakra — brawler.'],
    shalya: ['King of Madra · uncle of Nakula and Sahadeva', 'Tricked onto the Kaurava side; later Karna\'s charioteer. Famed with the mace.', 'Second chakra — mace duel.'],
    lakshmana: ['Lakshmana Kumara · son of Duryodhana', 'Abhimanyu\'s age. In the Mahabharata he died at Abhimanyu\'s hands — the spark of Duryodhana\'s fury.', 'Third chakra — archery.'],
    brihadbala: ['King of Kosala · of the Ikshvaku line', 'The last famous king of Rama\'s dynasty to fight in the Mahabharata. Abhimanyu killed him.', 'Fifth chakra — chariot storm.'],
    kripa: ['Kripacharya · clan teacher · immortal', 'Drona\'s brother-in-law, first teacher of both houses. After the war, teacher of Parikshit.', 'Sixth chakra — arrows that signal the truth.'],
    ashwatthama: ['Son of Drona · immortal', 'The gem on his brow, the curse of deathlessness. One of those who shot at Abhimanyu.', 'Sixth chakra — illusion.'],
    durmasena: ['Son of Dushasana', 'The mace that felled Abhimanyu in the Mahabharata. Later slain by Draupadi\'s sons on the day of Abhimanyu\'s rites.', 'The Nabhi — duel with Satyaki.'],
    yudhishthira: ['Dharmaraja · eldest Pandava', 'The one this entire Vyooha was built to capture. Gave Abhimanyu his word — "you will not go alone."', 'In the story.'],
    bhima: ['Vrikodara · the mace-bearer', 'First to try to follow Abhimanyu — Jayadratha stopped him. His conch: Paundra.', 'In the story — and your battle-cry.'],
    arjuna: ['Dhananjaya · the father', 'Went south to fight the Samsaptakas. Returned at dusk — in history, to his son\'s body; here, to his son.', 'Epilogue.'],
    krishna: ['Vasudeva · the charioteer', 'Subhadra\'s brother, Abhimanyu\'s uncle. The Sudarshana — which is, after all, a wheel.', 'Epilogue.'],
    jayadratha: ['King of Sindhu · Shiva\'s boon', 'Could hold all the Pandavas but Arjuna for one day — and did, on this day. The next day Arjuna killed him before sunset.', 'At the gate — in the story.'],
    agastya: ['Maharishi · who bowed the Vindhyas', 'One of the seven sages. In this telling, giver of Satyaki\'s Sukshma-gati and Prana-sanchar.', 'Satyaki\'s memory.'],
    sanjaya: ['The bard · divine sight', 'Granted divine sight by Vyasa, he narrated the whole war to Dhritarashtra. This game, too, is in his voice.', 'Narrator.']
  },
  story: [['One', 'The thirteenth day. Yesterday Drona failed to capture Yudhishthira — Arjuna was near. Today the Samsaptakas of Trigarta challenge Arjuna in the south; a Kshatriya cannot refuse. Arjuna and Krishna leave.'], ['Two', 'Drona builds the Chakravyooha — seven turning rings. A maharathi in every ring, death at every gate. The Pandava army is cut down like grass.'], ['Three', 'Yudhishthira asks: who will break it? Sixteen-year-old Abhimanyu says: I know the way in, not the way out. Bhima gives his word — we follow. Abhimanyu breaks the gate. Jayadratha, by Shiva\'s boon, holds everyone else at the gate.'], ['Four', 'Here the story turns. Satyaki — a Vrishni, not a Pandava — remembers an old siddhi from Agastya, whose condition was: only when no other means remains. He becomes a shadow and slips into the Vyooha.'], ['Five', 'Abhimanyu breaks ring after ring — Dushasana, Shalya, Lakshmana, Karna, Brihadbala, Kripa and Ashwatthama. Each ring gives him an astra. Behind him, unseen, Satyaki fells every ring\'s Vyooha-Nabhi — so the rings can never close again.'], ['Six', 'In the Nabhi, six maharathis at once. The bow is cut, the chariot breaks, Abhimanyu falls. In history this was the end. Here — Mitra Smaran. You call Satyaki.'], ['Seven', 'Satyaki binds Durmasena with the arrow-net, raises Abhimanyu with Prana-sanchar, wins the duel. Then the dice turn — Satyaki is noosed, Abhimanyu surrounded. Abhimanyu lifts the wheel of his broken chariot — exactly as Vyasa wrote.'], ['Eight', 'Karna challenges him — archer to archer. Mid-fight Abhimanyu\'s arrow breaks the wheel of Karna\'s chariot, and Karna says: sadhu, putra, sadhu. Abhimanyu bows — and the next arrow breaks Karna\'s bow.'], ['Nine', 'With the wheel he frees Satyaki. Together they shatter the Nabhi pillar; six broken Nabhis collapse at once; the Vyooha opens. At dusk Arjuna returns — and finds his son, not a body.']],
  astraInfo: { vayu: ['Pavan, lord of wind', 'First chakra — Dushasana', 'Second chakra — Shalya', 'The wind-weapon of Pavan, father of Bhima and Hanuman. Arjuna used it against the Gandharvas.'], agni: ['Agni, lord of fire', 'Second chakra — Shalya', 'Third chakra — Lakshmana', 'At the burning of Khandava, Agni gave Arjuna the Gandiva. The fire-weapon answers that debt.'], varun: ['Varuna, lord of waters', 'Third chakra — Lakshmana', 'Fourth chakra — Karna', 'The counter to fire — the Mahabharata pairs these two again and again.'], naag: ['The serpent-noose', 'Fourth chakra — Karna', 'Fifth chakra — Brihadbala', 'Indrajit bound Rama and Lakshmana with it. What is bound takes the deeper wound.'], bhoomi: ['The Earth', 'Fifth chakra — Brihadbala', 'Sixth chakra — Kripa & Ashwatthama', 'The ground splits, wheels sink. In the end it was the earth that held Karna\'s chariot wheel too.'], him: ['Frost', 'Sixth chakra — Kripa & Ashwatthama', 'The Nabhi — the pillar', 'What it touches, freezes. Freeze the Nabhi pillar — Satyaki\'s mace does the rest.'] },
  ui: {
    start: 'Begin', startSub: 'Be Abhimanyu', cont: 'Continue', newRun: 'New run', fromStart: 'from the start', callFriend: 'Call a friend now', callFriendSub: 'Co-op from ring one: friend = Satyaki',
    story: 'Katha', storySub: 'The whole story, before you play', chars: 'Characters', charsSub: 'Who stands in the Chakravyooha', astras: 'Astras', astrasSub: 'Six divine weapons and their order', granth: 'Granth', granthSub: 'Pages of history — they unlock as you play', howto: 'How to play', settings: 'Settings',
    back: 'Back', kicker: 'Mahabharata · Drona Parva · Retelling', tagline: 'Rewriting the Epic', blurb1: 'Day thirteen. Arjuna is far away. Only you can break the Vyooha — and you do not know the way out.', blurb2: 'One full run: 30–40 minutes. Progress is saved after every chakra.',
    foot: 'No login · No tracking · Everything runs in your browser', checkpoint: 'Checkpoint', time: 'time', astraCount: 'astras',
    music: 'Music & sound', voice: 'Voice (dialogue)', lang: 'Language', on: 'On', off: 'Off', hindi: 'हिन्दी', english: 'English', langNote: 'Key terms stay as they are: Chakravyooha, Mitra Smaran, Vipatti, Astra, Granth, Nabhi.',
    pause: 'Paused', resume: 'Resume', home: 'Home', homeSub: 'this ring\'s progress is lost', fell: 'Abhimanyu has fallen', fellBody: 'History would stop here — but this is not history.', retry: 'Try again', retrySub: 'from this ring', ringBroken: 'Chakra broken', astraGot: 'Astra won', rest: 'Rest', restSub: 'progress is saved',
    objWave: 'Clear the soldiers', objBoss: 'Maharathi: ', objBoss2: ' — weapons only until 50%', objAstra: ' ≤ 50% — fire the astra!', objKeep: ' ≤ 50% — keep striking', objGate: 'Gate open — go inward ↑', toastGate: 'The gate is open. Move inward — the next ring is deeper.', toastWave1: 'Enemy soldiers incoming', toastWave2: 'Second squad!', toastAstra: 'Astra ready — ', toastVip: 'Vipatti! Pick up astra-shards', toastNabhi: 'Vyooha-Nabhi destroyed — this ring can no longer close',
    hintKb: 'WASD move · Click / J strike · hold Right-click / K shield · Q switch weapon (1 2 3) · Space jump · E astra', hintTouch: 'Left thumb: move · Strike · Shield (hold) · Switch weapon · Jump',
    hp: 'arrows', bowBroken: '(bow broken)', ally: 'Ally', nextLine: 'Tap/Space: next line · Hold: skip',
    mitra: 'Mitra Smaran', mitraBody1: '"Uncle Bhima... you said... you were right behind..."', mitraBody2: 'This gate does not break alone. Satyaki is inside — call him.', mitraBody3: 'Satyaki\'s role: bind Durmasena with the arrow-net → raise Abhimanyu with the mantra-chakra → win the duel → shatter the Nabhi together.',
    sendLink: 'Send a friend the link', sendLinkSub: 'they become Satyaki on their own phone', sameScreen: 'Hand this screen to a friend', sameScreenSub: 'pass the phone / keyboard', selfSatyaki: 'Be Satyaki yourself', selfSatyakiSub: 'alone, if you must',
    waiting: 'Waiting…', waitingBody1: 'The moment your friend opens the link they drop in as Satyaki — no install, no login.', waitingBody2: 'Until then Abhimanyu is on his knees. Time is stopped.', whatsapp: 'Send on WhatsApp', copy: 'Copy link', copied: 'Link copied', linkFoot: 'Link is for this session only · direct phone-to-phone (P2P)',
    youAreSatyaki: 'You are Satyaki', yourName: 'Your name', enter: 'Enter the Vyooha', ownRun: 'Break your own Chakravyooha', ownRunSub: 'be Abhimanyu yourself',
    chapter: 'Chapter', readScene: 'Read the full scene', hideScene: 'Hide the scene', watchPrologue: 'Watch the prologue (cinematic)', watchHint: 'Tap = next line · hold = skip', page: 'Page', vyasaWrote: 'Vyasa wrote', whatChanged: 'What changed here', pride: 'Worth being proud of', unlocks: 'Unlocks when you break ', inGame: 'In the game: ', wonIn: 'Won in: ', firedIn: 'Fired in: ', voiceDevice: 'Dialogue voice: your device\'s voice (subtitles are always on).', voiceRec: ' recorded character voices', eraseQ: 'Erase checkpoint and astras?', erase: 'Erase progress', astraRule: 'One rule for the big astra: it wakes only when the maharathi is at half his life — and the astra you win in one chakra is the one you fire in the next. Between bosses, every kill charges Divya-shakti: when the ring is full, release a lesser form of your astra on the soldiers.', granthLead: 'Seven pages — one opens with every chakra. What Vyasa wrote, what we changed, and the one thing worth being proud of.',
    shakti: 'Divya-shakti', shaktiReady: 'Release! (E)', astraBig: 'Invoke astra! (E)', astraHint: 'big astra at ≤50%', tSword: 'Sword', tBow: 'Bow', tGada: 'Mace', tJump: 'Jump', tDash: 'Dash', tSkip: 'Skip', tAttack: 'Strike', tBlock: 'Shield', tSwitch: 'Switch', wSword: 'Sword', wBow: 'Bow', wGada: 'Mace',
    historyChanged: 'History has changed', share: 'Share', download: 'Download card', again: 'Again', best: 'best'
  }
};

export function lang() { return current; }
const HI_DATA = {
  story: [['अध्याय एक', 'तेरहवाँ दिन। कल द्रोण युधिष्ठिर को बंदी नहीं बना पाए — अर्जुन पास थे। आज त्रिगर्त के संशप्तक अर्जुन को दक्षिण में ललकारते हैं; क्षत्रिय मना नहीं कर सकता। अर्जुन और कृष्ण चले जाते हैं।'], ['अध्याय दो', 'द्रोण चक्रव्यूह रचते हैं — सात घूमती परतें। हर परत में एक महारथी, हर द्वार पर मृत्यु। पांडव सेना घास की तरह कटने लगती है।'], ['अध्याय तीन', 'युधिष्ठिर पूछते हैं: कौन तोड़ेगा? सोलह वर्ष का अभिमन्यु कहता है — प्रवेश जानता हूँ, निर्गमन नहीं। भीम वचन देते हैं — हम पीछे आएँगे। अभिमन्यु द्वार तोड़ता है; शिव-वरदान से जयद्रथ बाकी सबको द्वार पर रोक लेता है।'], ['अध्याय चार', 'यहीं कहानी मुड़ती है। सात्यकि — वृष्णि, पांडव नहीं — को अगस्त्य की पुरानी सिद्धि याद आती है, जिसकी शर्त थी: केवल तब, जब कोई और उपाय न रहे। वह छाया बनकर व्यूह में उतर जाता है।'], ['अध्याय पाँच', 'अभिमन्यु परत-दर-परत तोड़ता है — दुःशासन, शल्य, लक्ष्मण, कर्ण, बृहद्बल, कृप और अश्वत्थामा। हर परत एक अस्त्र देती है। पीछे, अदृश्य, सात्यकि हर परत की व्यूह-नाभि गिराता है — ताकि परतें फिर बंद न हों।'], ['अध्याय छह', 'नाभि में छह महारथी एक साथ। धनुष कटता है, रथ टूटता है, अभिमन्यु गिरता है। इतिहास में यही अंत था। यहाँ — मित्र स्मरण। तुम सात्यकि को पुकारते हो।'], ['अध्याय सात', 'सात्यकि बाण-जाल से दुर्मसेन को बाँधता है, प्राण-संचार से अभिमन्यु को उठाता है, द्वंद्व जीतता है। फिर पासा पलटता है — सात्यकि पाश में, अभिमन्यु घेरे में। अभिमन्यु टूटे रथ का पहिया उठाता है — ठीक जैसा व्यास ने लिखा।'], ['अध्याय आठ', 'कर्ण ललकारता है — धनुर्धर से धनुर्धर। युद्ध के बीच अभिमन्यु का बाण कर्ण के रथ का पहिया तोड़ देता है, और कर्ण कहता है: साधु पुत्र, साधु। अभिमन्यु प्रणाम करता है — और अगला बाण कर्ण का धनुष तोड़ देता है।'], ['अध्याय नौ', 'पहिये से वह सात्यकि को छुड़ाता है। दोनों मिलकर नाभि-स्तंभ तोड़ते हैं; छह टूटी नाभियाँ एक साथ ढहती हैं; व्यूह खुल जाता है। संध्या को अर्जुन लौटते हैं — और पाते हैं अपना पुत्र, शव नहीं।']],
  astraInfo: { vayu: ['पवन-देव'], agni: ['अग्नि-देव'], varun: ['वरुण-देव'], naag: ['नाग-पाश'], bhoomi: ['पृथ्वी'], him: ['हिम'] }
};
export function data(name) { return current === 'en' ? EN[name] : HI_DATA[name]; }
export function charInfo(k, bios) { if (current === 'en' && EN.charInfo[k]) { const [title, bio, role] = EN.charInfo[k]; return { title, bio, role }; } return bios[k]; }
export function astraLore(k, lore) { return current === 'en' && EN.astraInfo[k] ? EN.astraInfo[k][3] : lore[k]; }
export function astraDeity(k) { return current === 'en' ? (EN.astraInfo[k] || [''])[0] : HI_DATA.astraInfo[k][0]; }
export function setLang(l) {
  restore(); backup.clear(); current = l; if (l !== 'en') return;
  for (const k in EN.chars) set(CHARACTERS[k], 'name', EN.chars[k]);
  RINGS.forEach((r, i) => { set(r, 'name', EN.rings[i][0]); set(r, 'sub', EN.rings[i][1]); });
  for (const k in EN.astras) { set(ASTRAS[k], 'name', EN.astras[k][0]); set(ASTRAS[k], 'desc', EN.astras[k][1]); }
  for (const k in EN.bosses) { set(BOSSES[k], 'name', EN.bosses[k][0]); set(BOSSES[k], 'intro', EN.bosses[k][1]); set(BOSSES[k], 'defeat', EN.bosses[k][2]); }
  for (const n in EN.ringLines) { set(RING_LINES[n], 'drona', EN.ringLines[n][0]); set(RING_LINES[n], 'after', EN.ringLines[n][1]); }
  INTRO.forEach((sc, si) => { const e = EN.intro[si]; if (!e) return; if (e[0]) set(sc, 'title', e[0]); sc.lines.forEach((ln, li) => set(ln, 'text', e[1][li])); });
  EPILOGUE.forEach((sc, si) => { const e = EN.epi[si]; sc.lines.forEach((ln, li) => set(ln, 'text', e[1][li])); });
  for (const k in EN.r7) RING7[k].forEach((ln, i) => set(ln, 'text', EN.r7[k][i]));
  for (const k in EN.hype) set(HYPE[k], 'word', EN.hype[k]);
  const HL = { streak: ['See that? That is my brother\'s blood!', 'O King, that is no boy — a Mahayoddha is fighting.'], cleanWave: ['Not a single blow reached him.'], phase2: ['The maharathi staggers. Now is the moment for the astra.', '(to himself) He is... he is faster than Arjuna.'], astra: ['The sky trembled. For the first time the Kaurava army looked back.'], bossDown: ['Hear the Paundra, son! Forward!', 'One more ring — and one more line of history erased.'], vipatti: ['(gasping) Not yet... not yet.'], chakra: ['As if Vasudeva himself had raised the Sudarshana!'] };
  for (const k in HL) (HYPE[k].lines || []).forEach((ln, i) => HL[k][i] && set(ln, 'text', HL[k][i]));
  CODEX.forEach((c, i) => { const e = EN.codex[i]; set(c, 'title', e[0]); set(c, 'vyasa', e[1]); set(c, 'here', e[2]); set(c, 'pride', e[3]); });
  CHAR_INFO.forEach(c => { const e = EN.charInfo[c.key]; if (e) { set(c, 'title', e[0]); set(c, 'bio', e[1]); set(c, 'role', e[2]); } });
  STORY.forEach((p, i) => { set(p, 'h', EN.story[i][0]); set(p, 't', EN.story[i][1]); });
  for (const k in EN.astraInfo) { const a = ASTRA_INFO[k], e = EN.astraInfo[k]; set(a, 'deva', e[0]); set(a, 'earn', e[1]); set(a, 'use', e[2]); set(a, 'lore', e[3]); }
}
export const T = key => (current === 'en' ? EN.ui[key] : HI_UI[key]) ?? HI_UI[key] ?? key;
const HI_UI = {
  start: 'आरंभ', startSub: 'अभिमन्यु बनो', cont: 'आगे बढ़ो', newRun: 'नई दौड़', fromStart: 'शुरू से', callFriend: 'मित्र को अभी बुलाओ', callFriendSub: 'पहले चक्र से सह-खेल: मित्र = सात्यकि',
  story: 'कथा', storySub: 'खेलने से पहले पूरी कहानी', chars: 'पात्र', charsSub: 'चक्रव्यूह में कौन खड़ा है', astras: 'अस्त्र', astrasSub: 'छह दिव्यास्त्र और उनका क्रम', granth: 'ग्रंथ', granthSub: 'इतिहास के पृष्ठ — खेलते हुए खुलते हैं', howto: 'कैसे खेलें', settings: 'सेटिंग्स',
  back: 'वापस', kicker: 'महाभारत · द्रोण पर्व · पुनर्लेखन', tagline: 'Rewriting the Epic', blurb1: 'त्रयोदश दिवस। अर्जुन दूर हैं। सिर्फ़ तुम व्यूह तोड़ सकते हो — पर निकलना नहीं जानते।', blurb2: 'एक पूरी दौड़: 30–40 मिनट। हर चक्र के बाद प्रगति सुरक्षित रहती है।',
  foot: 'कोई लॉगिन नहीं · कोई ट्रैकिंग नहीं · सब कुछ ब्राउज़र में', checkpoint: 'चौकी', time: 'समय', astraCount: 'अस्त्र',
  music: 'संगीत और ध्वनि', voice: 'आवाज़ (संवाद)', lang: 'भाषा / Language', on: 'चालू', off: 'बंद', hindi: 'हिन्दी', english: 'English', langNote: 'मुख्य शब्द वैसे ही रहते हैं: Chakravyooha, Mitra Smaran, Vipatti, Astra, Granth, Nabhi.',
  pause: 'विराम', resume: 'जारी', home: 'मुख्य पृष्ठ', homeSub: 'इस चक्र की प्रगति नहीं बचेगी', fell: 'अभिमन्यु गिरा', fellBody: 'इतिहास यहीं रुकता — पर यह इतिहास नहीं है।', retry: 'पुनः प्रयास', retrySub: 'इसी चक्र से', ringBroken: 'चक्र टूटा', astraGot: 'अस्त्र प्राप्त', rest: 'विराम', restSub: 'प्रगति सुरक्षित है',
  objWave: 'सैनिकों को हटाओ', objBoss: 'महारथी: ', objBoss2: ' — पहले 50% तक शस्त्र से', objAstra: ' ≤ 50% — अस्त्र चलाओ!', objKeep: ' ≤ 50% — वार जारी रखो', objGate: 'द्वार खुला — भीतर बढ़ो ↑', toastGate: 'द्वार खुल गया। आगे बढ़ो — अगली परत भीतर है।', toastWave1: 'शत्रु-सैनिक आ रहे हैं', toastWave2: 'दूसरी टुकड़ी!', toastAstra: 'अस्त्र आह्वान उपलब्ध — ', toastVip: 'विपत्ति! अस्त्र-कण उठाओ', toastNabhi: 'व्यूह-नाभि ध्वस्त — परत अब बंद नहीं होगी',
  hintKb: 'WASD चलना · क्लिक / J वार · दायाँ-क्लिक / K दबाए रखो = ढाल · Q हथियार बदलो (1 2 3) · Space कूद · E अस्त्र', hintTouch: 'बायाँ अंगूठा: चलना · वार · ढाल (दबाए रखो) · हथियार बदलो · कूद',
  hp: 'बाण', bowBroken: '(धनुष टूटा)', ally: 'साथी', nextLine: 'टैप/Space: अगली पंक्ति · दबाए रखें: छोड़ें',
  mitra: 'मित्र स्मरण', mitraBody1: '"तात भीम... आपने कहा था... आप पीछे हैं..."', mitraBody2: 'अकेले यह द्वार नहीं टूटता। सात्यकि अंदर है — उसे पुकारो।', mitraBody3: 'सात्यकि की भूमिका: बाण-जाल से दुर्मसेन को बाँधो → मंत्र-चक्र से अभिमन्यु को उठाओ → द्वंद्व जीतो → साथ में नाभि तोड़ो।',
  sendLink: 'मित्र को लिंक भेजो', sendLinkSub: 'वह अपने फ़ोन से सात्यकि बनेगा', sameScreen: 'एक ही स्क्रीन पर मित्र को दो', sameScreenSub: 'फ़ोन/कीबोर्ड मित्र को थमाओ', selfSatyaki: 'स्वयं सात्यकि बनो', selfSatyakiSub: 'अकेले ही सही',
  waiting: 'प्रतीक्षा…', waitingBody1: 'मित्र लिंक खोलते ही सात्यकि के रूप में उतरेगा — बिना इंस्टॉल, बिना लॉगिन।', waitingBody2: 'तब तक अभिमन्यु घुटनों पर है। समय रुका है।', whatsapp: 'WhatsApp पर भेजो', copy: 'लिंक कॉपी', copied: 'लिंक कॉपी हो गया', linkFoot: 'लिंक सिर्फ़ इस सत्र के लिए है · सीधा फ़ोन-से-फ़ोन (P2P)',
  youAreSatyaki: 'तुम सात्यकि हो', yourName: 'तुम्हारा नाम', enter: 'अंदर उतरो', ownRun: 'अपना चक्रव्यूह तोड़ो', ownRunSub: 'खुद अभिमन्यु बनो',
  chapter: 'अध्याय', readScene: 'पूरा दृश्य पढ़ो', hideScene: 'दृश्य छिपाओ', watchPrologue: 'प्रस्तावना देखें (चलचित्र)', watchHint: 'टैप = अगली पंक्ति · दबाए रखें = छोड़ें', page: 'पृष्ठ', vyasaWrote: 'व्यास ने लिखा', whatChanged: 'यहाँ क्या बदला', pride: 'गर्व की बात', unlocks: 'खुलेगा: ', inGame: 'खेल में: ', wonIn: 'मिलता है: ', firedIn: 'चलता है: ', voiceDevice: 'संवाद की आवाज़: आपके डिवाइस की आवाज़ (उपशीर्षक हमेशा चालू)।', voiceRec: ' रिकॉर्डेड पात्र-आवाज़ें', eraseQ: 'चौकी और अस्त्र मिटा दें?', erase: 'प्रगति मिटाओ', astraRule: 'बड़े अस्त्र का एक नियम: वह तभी जागता है जब महारथी का प्राण आधा रह जाए — और जो अस्त्र एक चक्र में जीतो, वही अगले में चलता है। बीच में, हर शत्रु-वध दिव्य-शक्ति भरता है: वृत्त पूरा भरे तो सैनिकों पर अपने अस्त्र का छोटा रूप छोड़ो।', granthLead: 'सात पृष्ठ — हर चक्र के साथ एक खुलता है। व्यास ने क्या लिखा, हमने क्या बदला, और वह एक बात जिस पर गर्व हो।',
  shakti: 'दिव्य-शक्ति', shaktiReady: 'छोड़ो! (E)', astraBig: 'अस्त्र आह्वान! (E)', astraHint: 'बड़ा अस्त्र ≤50% पर', tSword: 'तलवार', tBow: 'धनुष', tGada: 'गदा', tJump: 'कूद', tDash: 'डैश', tSkip: 'छोड़ें', tAttack: 'वार', tBlock: 'ढाल', tSwitch: 'बदलो', wSword: 'तलवार', wBow: 'धनुष', wGada: 'गदा',
  historyChanged: 'इतिहास बदल गया', share: 'साझा करो', download: 'कार्ड डाउनलोड', again: 'फिर से', best: 'सर्वश्रेष्ठ'
};

// ---- runtime strings: Hindi fragments written inline in game code → English (longest match first) ----
const RT = {
  'भाई, मैं चक्रव्यूह के सातवें चक्र में घिर गया हूँ। दुर्मसेन गदा लेकर खड़ा है। इस लिंक पर टैप कर, सात्यकि बन, और मुझे बचा: ': 'Brother, I am trapped in the seventh ring of the Chakravyooha. Durmasena stands over me with his mace. Tap this link, become Satyaki, and save me: ',
  'मित्र लिंक खोलते ही खेल शुरू होगा। तुम अभिमन्यु (आगे), वह सात्यकि (पीछे — हर चक्र की व्यूह-नाभि गिराएगा)।': 'The game starts the moment your friend opens the link. You are Abhimanyu (in front); they are Satyaki (behind — bringing down each ring\'s Vyooha-core).',
  'सात्यकि की भूमिका: बाण-जाल से दुर्मसेन को बाँधो → मंत्र-चक्र से अभिमन्यु को उठाओ → द्वंद्व जीतो → साथ में नाभि तोड़ो।': 'Satyaki\'s part: bind Durmasena with the arrow-net → raise Abhimanyu through the mantra-chakra → win the duel → break the core together.',
  'वृष्णि-वीर, कृष्ण के सखा, अर्जुन के शिष्य। अगस्त्य की सिद्धि से तुम व्यूह के अंदर हो।': 'Hero of the Vrishnis, Krishna\'s friend, Arjuna\'s student. By Agastya\'s siddhi you are inside the Vyooha.',
  'अभिमन्यु घुटनों पर है। तुम्हारा काम: बाण-जाल → प्राण-संचार → द्वंद्व → नाभि-भंजन।': 'Abhimanyu is on his knees. Your task: arrow-net → Prana-sanchar → duel → break the core.',
  'मित्र लिंक खोलते ही सात्यकि के रूप में उतरेगा — बिना इंस्टॉल, बिना लॉगिन।': 'Your friend drops in as Satyaki the moment they open the link — no install, no login.',
  'धनुष उठाया! तरकश 36। कर्ण के बाण तलवार से काटो, पूरा खिंचा बाण चलाओ।': 'Bow taken up! Quiver 36. Cut Karna\'s arrows with the sword; loose fully drawn arrows.',
  'इतिहास में सात्यकि को यह अवसर नहीं मिला था। तुम्हें मिला।': 'In history Satyaki never got this chance. You did.',
  'शायद मित्र ने खेल बंद कर दिया, या नेटवर्क P2P रोक रहा है (': 'Maybe your friend closed the game, or the network is blocking P2P (',
  'मैंने सात्यकि बनकर अभिमन्यु को बचाया। तुम तोड़ सकते हो चक्रव्यूह?': 'I became Satyaki and saved Abhimanyu. Can you break the Chakravyooha?',
  'अकेले यह द्वार नहीं टूटता। सात्यकि अंदर है — उसे पुकारो।': 'This gate does not break alone. Satyaki is inside — call him.',
  'रथ-चक्र: वार = चक्र-घुमाव (चारों ओर धक्का) · बदलो = चक्र-प्रहार': 'Chariot wheel: Strike = wheel sweep (shoves all around) · Switch = wheel slam',
  'लिंक सिर्फ़ इस सत्र के लिए है · सीधा फ़ोन-से-फ़ोन (P2P)': 'The link works for this session only · direct phone-to-phone (P2P)',
  'चक्रव्यूह तोड़ने चल रहा हूँ। तू सात्यकि बन, मेरे पीछे आ: ': 'I\'m going to break the Chakravyooha. Be Satyaki and follow me: ',
  '"तात भीम... आपने कहा था... आप पीछे हैं..."': '"Uncle Bhima... you said... you were right behind me..."',
  'बाण-जाल: तीन चमकते बिंदुओं पर बाण मारो': 'Arrow-net: shoot the three glowing points',
  'सात्यकि को छुड़ाओ: तीनों पाश-धारियों पर चक्र-प्रहार': 'Free Satyaki: wheel-slam all three noose-holders',
  'अभिमन्यु गिरा है — मित्र तुम्हें बुला रहा है…': 'Abhimanyu has fallen — your friend is calling you…',
  'मित्र का संपर्क टूटा — सात्यकि अब तुम्हारे हाथ में': 'Lost your friend — Satyaki is in your hands now',
  'नाभि-स्तंभ के पास जाओ। अभिमन्यु: अस्त्र (E)': 'Go to the core pillar. Abhimanyu: Astra (E)',
  'नाभि-स्तंभ प्रकट! पास जाओ, E दबाओ।': 'The core pillar appears! Go close, press E.',
  'घेरा तोड़ो: चक्र से सबको पीछे धकेलो': 'Break the encirclement: shove them all back with the wheel',
  'दुर्मसेन की गदा उठी — पुनः प्रयास!': 'Durmasena\'s mace rises — try again!',
  'अभिमन्यु जीवित। हज़ारों सैनिक बचे।': 'Abhimanyu lives. Thousands of soldiers spared.',
  'तब तक अभिमन्यु घुटनों पर है। समय रुका है।': 'Until then Abhimanyu is on his knees. Time stands still.',
  'अब अपना चक्रव्यूह तोड़ो — अभिमन्यु बनकर।': 'Now break your own Chakravyooha — as Abhimanyu.',
  ' में। अभिमन्यु जीवित है। तुम तोड़ सकते हो?': '. Abhimanyu lives. Can you break it?',
  'घेरा टूटा। अब सात्यकि की ओर →': 'Encirclement broken. Now to Satyaki →',
  'टूटे रथ के पास जाओ — पहिया उठाओ': 'Go to the broken chariot — lift the wheel',
  'मित्र स्मरण · तुम्हें पुकारा गया है': 'Mitra Smaran · you have been called',
  'जुड़ गए। अभिमन्यु की प्रतीक्षा…': 'Connected. Waiting for Abhimanyu…',
  'छह महारथी। बचो... जितना हो सके।': 'Six maharathis. Survive... as long as you can.',
  ' — अगले चक्र में, शत्रु ≤ 50% पर।': ' — in the next ring, at enemy ≤ 50%.',
  'रथ-चक्र उठाओ — E / अस्त्र बटन': 'Lift the chariot wheel — E / Astra button',
  'अब तुम सात्यकि हो। वही नियंत्रण।': 'You are Satyaki now. Same controls.',
  'सात्यकि गिरा — द्वंद्व पुनः (0.5 s)': 'Satyaki fell — duel again (0.5 s)',
  'जाल टूट गया — पहले बाँधो!': 'The net broke — bind him first!',
  'प्राण-संचार: मंत्र-चक्र के ': 'Prana-sanchar: cross the mantra-chakra\'s ',
  ' बिंदु क्रम से पार करो  ⏳ ': ' points in order  ⏳ ',
  '%  (कुछ बाण वह हवा में काटेगा)': '%  (he will cut some arrows in the air)',
  'दुर्मसेन मुक्त! अब द्वंद्व।': 'Durmasena is free! Now the duel.',
  'मित्र के फ़ोन से सीधा संपर्क (P2P)': 'Direct link to your friend\'s phone (P2P)',
  'एक ही स्क्रीन पर मित्र को दो': 'Hand it to a friend on this screen',
  'वह अपने फ़ोन से सात्यकि बनेगा': 'They become Satyaki from their phone',
  'तुमने अभिमन्यु को बचाया': 'You saved Abhimanyu',
  'द्वंद्व: सात्यकि बनाम दुर्मसेन': 'Duel: Satyaki vs Durmasena',
  'धनुर्युद्ध — अंगराज कर्ण': 'Archery duel — Karna, King of Anga',
  'संकेत-सेवा से जुड़ रहे हैं': 'Connecting to the signalling service',
  'फ़ोन/कीबोर्ड मित्र को थमाओ': 'Pass the phone / keyboard to a friend',
  'सात्यकि: व्यूह-नाभि गिराओ!': 'Satyaki: bring down the Vyooha-core!',
  'रथ-चक्र फिर उठाओ — E': 'Lift the chariot wheel again — E',
  'कोई इंस्टॉल नहीं। सीधा खेल।': 'No install. Straight into the game.',
  'ऑनलाइन कक्ष नहीं बना (': 'Could not open an online room (',
  ')। एक ही स्क्रीन पर खेलो।': '). Play on one screen.',
  'ऑनलाइन कक्ष नहीं बना: ': 'Could not open an online room: ',
  'सप्तम चक्र · व्यूह-नाभि': 'Seventh ring · Vyooha-core',
  'रथ टूटा। गदा गिरी।': 'Chariot shattered. The mace falls.',
  'व्यूह-नाभि — अभिमन्यु': 'Vyooha-core — Abhimanyu',
  'अब फिर तुम अभिमन्यु हो।': 'You are Abhimanyu again.',
  'लिंक कॉपी हो गया': 'Link copied',
  'धनुर्युद्ध: कर्ण — ': 'Archery duel: Karna — ',
  'पहिये के पास लौटो': 'Return to the wheel',
  'युद्ध पुनः आरंभ!': 'The fight resumes!',
  'रथ का पहिया टूटा!': 'His chariot wheel breaks!',
  'धनुष की डोरी कटी!': 'Bowstring cut!',
  ' सात्यकि बनकर आया!': ' has come as Satyaki!',
  'अपना चक्रव्यूह तोड़ो': 'Break your own Chakravyooha',
  'मित्र की प्रतीक्षा': 'Waiting for your friend',
  'स्वयं सात्यकि बनो': 'Be Satyaki yourself',
  'मित्र को लिंक भेजो': 'Send your friend the link',
  'चक्रव्यूह टूटा — ': 'Chakravyooha broken — ',
  'मैंने चक्रव्यूह तोड़ा — ': 'I broke the Chakravyooha in ',
  'मैंने सात्यकि बनकर': 'As Satyaki I',
  'अभिमन्यु को बचाया': 'saved Abhimanyu',
  'संध्या · कुरुक्षेत्र': 'Dusk · Kurukshetra',
  'इतिहास बदल गया': 'History rewritten',
  'तुम सात्यकि हो': 'You are Satyaki',
  'खुद अभिमन्यु बनो': 'Be Abhimanyu yourself',
  'संपर्क नहीं हुआ': 'Could not connect',
  'कक्ष बन रहा है…': 'Opening a room…',
  'WhatsApp पर भेजो': 'Send on WhatsApp',
  ' टूटा। अगला: ': ' broken. Next: ',
  'नाभि ध्वस्त!': 'Core shattered!',
  'ग्रंथ-पृष्ठ ७': 'Granth page 7',
  'अंतिम पृष्ठ': 'Final page',
  'इसी स्क्रीन पर': 'On this screen',
  'अकेले ही सही': 'Alone, if it must be',
  'तुम्हारा नाम': 'Your name',
  'जुड़ रहे हैं…': 'Connecting…',
  'संपर्क टूटा': 'Connection lost',
  'फिर कोशिश': 'Try again',
  'अंदर उतरो': 'Step inside',
  'मुख्य पृष्ठ': 'Home',
  'कार्ड डाउनलोड': 'Download card',
  'साझा करो': 'Share',
  'सर्वश्रेष्ठ: ': 'best: ',
  'प्रतीक्षा…': 'Waiting…',
  'मित्र स्मरण': 'Mitra Smaran',
  'सप्तम चक्र': 'Seventh ring',
  'लिंक कॉपी': 'Copy link',
  'सह-खेल': 'Co-op',
  'महारथी: ': 'Maharathi: ',
  ' प्राण, तरकश भरा': ' life, quiver refilled',
  'रक्षक · ': 'Saviour · ',
  ' बार': ' times',
  'पीछे हटा!': 'falls back!',
  'ढाल टूटी!': 'Shield broken!',
  'पाश टूटा!': 'Noose broken!',
  'धनुष टूटा!': 'Bow broken!',
  'हिम-अस्त्र!': 'Hima-astra!',
  'रक्षा टूटी!': 'Guard broken!',
  'गदा-संघर्ष!': 'Mace clash!',
  'सटीक रोक!': 'Perfect block!',
  'बाण समाप्त': 'Out of arrows',
  'चक्र-प्रहार!': 'Wheel slam!',
  'चक्र-गदा': 'Mace whirl',
  'बाण कटा': 'Arrow cut',
  'प्रतिघात': 'Parry',
  'पराजित': 'defeated',
  'नाभि-स्तंभ': 'Core pillar',
  'व्यूह-नाभि': 'Vyooha-core',
  'कृपाचार्य': 'Kripacharya',
  'अश्वत्थामा': 'Ashwatthama',
  'बृहद्बल': 'Brihadbala',
  'कृतवर्मा': 'Kritavarma',
  'वृषसेन': 'Vrishasena',
  'दुर्मसेन': 'Durmasena',
  'अभिमन्यु': 'Abhimanyu',
  'सात्यकि': 'Satyaki',
  'रथ-चक्र': 'Chariot wheel',
  'अभेद्य': 'Unbreakable',
  'धक्का!': 'Shove!',
  'बद्ध!': 'Bound!',
  'क्रोध!': 'Fury!',
  'रक्षा': 'Guard',
  'द्रोण': 'Drona',
  'कर्ण': 'Karna',
  'कृप': 'Kripa',
  'गदा!': 'Mace!',
  'माया': 'Maya',
  'द्वार': 'Gate',
  'सत्य': 'Truth',
  'स्वयं': 'self',
  'मित्र': 'friend',
  'कॉपी': 'Copied',
  'रद्द': 'Cancel',
  'फिर से': 'Again',
  'आगे': 'Next',
  'रक्षक': 'Saviour',
  'समय: ': 'Time: ',
  ' बाण': ' arrows',
  'सात्यकि: ': 'Satyaki: ',
  'तुम पाश में बँधे हो — वार बार-बार दबाओ, बंधन ढीला करो': 'You are bound in the noose — tap Strike again and again to loosen it',
  'सात्यकि का बल!': 'Satyaki strains!',
  'पाश ढीला!': 'Noose loosens!',
  ' शेष)': ' left)',
  'सात्यकि: वार': 'Satyaki: Strike',
};
const RT_KEYS = Object.keys(RT).sort((a, b) => b.length - a.length);
const DEV = /[ऀ-ॿ]/;
// tr(): translate inline-Hindi runtime text when the game is in English; leaves everything else untouched
export function tr(s) {
  if (typeof s !== 'string' || lang() !== 'en' || !DEV.test(s)) return s;
  if (RT[s] !== undefined) return RT[s];
  let out = s; for (const k of RT_KEYS) if (out.includes(k)) out = out.split(k).join(RT[k]);
  return out;
}
