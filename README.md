# चक्रव्यूह — Rewriting the Epic

Day 13, Kurukshetra. Arjuna is away. Only sixteen-year-old Abhimanyu can breach Drona's Chakravyuha — but he was never taught the way out. This time, history changes: a friend enters as Satyaki.

A zero-install browser game. Vanilla JS + Canvas 2D, no build step, no backend, no accounts, no tracking. All art, music, sound and voice are generated procedurally in the browser (Web Audio + SpeechSynthesis).

**Play:** https://nikhilmodiofficial.github.io/chakravyooha/

## How it plays
- 7 rings, each a distinct boss fight (Dushasana → Shalya → Lakshmana → Karna → Brihadbala → Kripa & Ashwatthama → the six-maharathi siege). 30–40 min for a full run; progress checkpoints after every ring.
- Sword / bow / mace always in hand (J / K / L), each with a job: shields only break to the mace, Karna's kavach deflects arrows, incoming arrows can be cut with the sword, a maharathi's guard breaks to the mace. Arrows are limited (30; quivers drop from fallen archers).
- An astra unlocks only when the boss is at ≤ 50% HP; the astra you win in ring N is the one you fire in ring N+1 (Vayu → Agni → Varun → Naag → Bhoomi → Him).
- Health decays slowly (fatigue). Under 20%: विपत्ति.
- Ring 7 cannot be won alone. **मित्र स्मरण** generates a link; a friend opens it and drops in as Satyaki (WebRTC peer-to-peer, no server) — arrow-trap, healing mantra-chakra, the duel with Durmasena, then both shatter the core together. Hot-seat / solo-Satyaki fallbacks exist so nobody is ever stuck.

## Run locally
Any static server, e.g. `python3 -m http.server 8080` then open `http://localhost:8080/`.

## Structure
`index.html` · `css/style.css` · `js/` (config, entities, bosses, world, render, art, cinematic, ring7, coop, audio, voice, ui, save, share, main) · `vendor/peerjs.min.js` (PeerJS 1.5.4, vendored) · `docs/GDD.md`

## Lore notes
Boss order follows the Drona Parva encounters as closely as a boss-rush allows. Jayadratha stays outside the formation (where he was). Satyaki's entry and healing are the one deliberate liberty, given a single source (a siddhi from Agastya) so the rewrite stays internally consistent. Drona is never fought.
