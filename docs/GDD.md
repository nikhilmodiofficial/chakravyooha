# Chakravyooha — Rewriting the Epic
## Game Design Document v1.0 (corrected from brainstorm of 10–11 Nov 2026)

---

## 0. Brainstorm me jo galat tha, aur kya fix kiya

Pehle uncomfortable truth: brainstorm ka apna research (45–90 sec sessions, zero friction, instant restart) aur final decision (30–45 min mandatory run + 7th gate pe friend-gated finish) ek doosre ke khilaaf hain. Agar friend nahi aaya to player 30 min invest karke phansa rehta hai — ye rage-quit hai, virality nahi. Fix neeche.

| # | Flaw in brainstorm | Fix in this GDD | Tag |
|---|---|---|---|
| 1 | 30–45 min single sitting, koi checkpoint nahi | Har ring ke baad auto-checkpoint (localStorage). Band karke wapas aao, wahi ring se resume. Full run 30–40 min, lekin har ring 3–6 min ka self-contained session hai. | [Certain] design fix |
| 2 | 7th gate sirf friend se khulta hai; friend na aaye to dead end | Mitra Smaran ke 3 raste: (a) online link — dost apne phone se Satyaki banta hai, (b) hot-seat — same screen pe dost ko phone do, (c) 90 sec wait ke baad "Satyaki ki bhoomika khud nibhao". (a) viral path hai, (b)(c) finishability guarantee. | [Certain] |
| 3 | "Yudhishthira kehte hain sirf 4 log vyooha tod sakte hain: Arjuna, Krishna, Pradyumna, Abhimanyu" | Drona Parva me Abhimanyu khud kehta hai: pravesh jaanta hoon, nirgaman nahi; Arjuna/Krishna/Pradyumna pravesh+nirgaman dono jaante hain. Game me yahi line use hoti hai. | [Likely] (Drona Parva, Abhimanyu-vadha section; exact adhyaya numbering edition pe depend karti hai) |
| 4 | Satyaki = "Ayurveda/Shalya-tantra ka vidwan" | Vyasa text me aisa koi reference nahi. Fiction hai to fiction ko ek hi source do: Agastya se mili ek hi siddhi — Sukshma-gati (chhaya me chalna) + Prana-sanchar (prana lautana). Ek tapasya, do phal. Loophole kam. | [Guessing] on the healing claim being canon → removed |
| 5 | Ring bosses: Durmukha, Dushasan, Kripa, Ashwatthama, Shakuni, Karna, Jayadratha | Canon me Jayadratha vyooha ke BAHAR gate pe tha (Pandavon ko rokne), andar nahi. Shakuni ne Abhimanyu se duel nahi kiya. Canon ke hisaab se Abhimanyu ne andar inse lada: Dushasana (behosh kiya), Shalya, Lakshmana (Duryodhana-putra), Karna/Vrishasena, Brihadbala, Kripa, Ashwatthama, aur ant me 6 maharathi ek saath + Dushasana-putra ka gada-prahaar. Ring order isi pe banayi. | [Likely] |
| 6 | Jayadratha ka boon = "4 Pandavon ko rokega" | Boon: Arjuna ko chhodkar baaki Pandavon ko ek din rok sakta hai. Satyaki Pandava nahi — boon uspe lagu nahi. Lekin canon me Satyaki bhi us jhund me tha jo ruka. Isliye uski entry ke liye siddhi zaroori hai (fix 4). | [Likely] |
| 7 | 3D cel-shaded Raji-style | Browser + zero-install + ek hi developer: 2D stylised Canvas (Raji ki palette aur Avatar-style elemental VFX). 3D ka vaada nahi, pehle web pe prove karo. | [Certain] scope call |
| 8 | Real-time co-op "backend" undefined | Peer-to-peer (WebRTC via PeerJS public signalling) — static hosting pe chal jaata hai, koi server nahi. Host (Abhimanyu) authoritative; friend inputs bhejta hai, host state bhejta hai. | [Likely] reliability; agar signalling flaky nikla to Cloudflare Durable Object relay plan B (code ready rakha hai) |
| 9 | Nash matrix / "P=0.5 dopamine" | Decorative math tha. Game me actual use: boss AI har 3–5 sec me attack-mode randomly choose karta hai (melee press / ranged volley / guard) ~50/50 — player ko pattern nahi milta. Itna hi kaafi hai. | [Certain] |

---

## 1. Pitch (ek line)

Day 13, Kurukshetra. Arjuna door hai. Sirf 16 saal ka Abhimanyu Chakravyooha tod sakta hai — lekin bahar nikalna nahi jaanta. Is baar itihaas badlega: ek mitra andar aayega.

Genre: 2D top-down action, boss-rush with waves. Platform: browser (desktop + mobile portrait/landscape), zero install. Run: 30–40 min full, ring-wise 3–6 min.

---

## 2. Story Bible (loophole-free version)

### 2.1 Timeline, Day 13

1. Subah: Duryodhana Drona pe dabaav — "Yudhishthira ko pakdo". Drona: "Jab tak Arjuna paas hai, asambhav."
2. Samsaptaka (Trigarta) Arjuna ko dakshin disha me chunauti dete hain; Arjuna aur Krishna chale jaate hain.
3. Drona Chakravyooha rachta hai — ghoomta hua 7-stariya vyooha. Pandava sena pichhadne lagti hai.
4. Yudhishthira: "Is vyooha ko kaun tod sakta hai?" Abhimanyu: "Pravesh jaanta hoon, Pita se garbh me suna tha. Nirgaman nahi jaanta." Yudhishthira: "Tum pravesh karo, hum sab tumhare peeche ghusenge, dwar band nahi hone denge." Bhima, Satyaki, Dhrishtadyumna haami bharte hain.
5. Abhimanyu dwar todta hai, andar ghusta hai. Jayadratha (Shiva-vardaan) dwar pe Pandavon ko rok leta hai.
6. (Rewrite yahin se) Satyaki Jayadratha se ladne ki bajaye ek pal ko peeche hatata hai, Agastya-siddhi "Sukshma-gati" jagata hai aur chhaya ban kar vyooha ki pehli parat me pravesh kar leta hai. Vardaan Pandavon pe tha, Satyaki Vrishni hai; aur siddhi usne kabhi yuddha me use nahi ki thi kyunki Agastya ka pratibandh tha: "sirf jab dharma ki raksha kisi aur upaay se sambhav na ho." Aaj wo sharat poori hui.
7. Andar Abhimanyu ek ke baad ek parat todta hai. Satyaki peeche-peeche har parat ki "Vyooha-Nabhi" (ghoomne ka dhuri — ek senapati + dhwaj-stambh) girata hai, taaki parat wapas band na ho sake. Yahi kaam Bhima/Yudhishthira ko bahar se karna tha.
8. 7vi parat: chhe maharathi (Drona, Kripa, Karna, Ashwatthama, Brihadbala, Kritavarma) ek saath — yuddha-niyam tod kar. Abhimanyu ka dhanush, rath, sarathi sab khatam. Wo girta hai. Dushasana-putra Durmasena gada lekar aage badhta hai (canon me yahi prahaar ghaatak tha).
9. Mitra Smaran: Abhimanyu ko Satyaki ka vachan yaad aata hai ("main tumhare peeche hoon"). Satyaki pahunchta hai: Bana-jaala se Durmasena ko baandhta hai, Prana-sanchar se Abhimanyu ko uthata hai, Durmasena jaal todta hai, Satyaki dvandva jeetta hai.
10. Dono milkar Nabhi-stambh todte hain. Satyaki ne 6 parton ki nabhi pehle hi tod rakhi thi — vyooha ghoomna band, parten khul jaati hain. Bahar nikalne ka rasta ab "nirgaman vidya" nahi, toota hua vyooha hai. (Loophole close: exit kaise pata chala? Pata nahi chala — exit bana diya.)
11. Sandhya. Pandava sena jo andar ghus kar marti, wo bachi. Bhima Paundra shankh phoonkta hai. Arjuna-Krishna lautte hain. Arjuna putra ko gale lagata hai.

### 2.2 Why Drona isn't a boss
Drona canon me Abhimanyu ki prashansa karta hai aur use maarna nahi chahta; wo vyooha ka architect hai, dwandva-yoddha nahi. Game me Drona narrator-antagonist hai: har ring pe uski ek line aati hai (voice), aur ring 7 me wo gher me shaamil hai lekin Satyaki ke jaal ke baad peeche hat jaata hai ("Yeh adharma hai, main isme nahi"). Isse Drona ka character bhi bachta hai aur 7th gate ka logic bhi.

---

## 3. Core Loop

```
[Ring N enter] -> Wave 1 (sainik) -> Wave 2 -> Boss Phase 1 (100->50%, sirf shastra)
-> Boss Phase 2 (<=50%: "अस्त्र आह्वान" unlock, pichhli ring ka astra use)
-> Boss defeated -> Astra reward + checkpoint -> cutscene line -> Ring N+1
```

- Health decay: har ring me passive drain (ring 1: 0.4 HP/s ... ring 6: 1.2 HP/s). Reason: thakaan, ghaav, rath ki tooti dhuri.
- Astra-kan (shards): har enemy 35% chance pe ek glowing kan girata hai; pick = +8 HP. Boss hit milestones pe guaranteed drop.
- Vipatti: HP < 20% → screen desaturate, red Devanagari "विपत्ति" pulse, music drops to heartbeat + low drone.
- Death (ring 1–6): "Punah Prayas" instant restart of same ring (0.5 s). Ring 7 me death nahi — scripted fall → Mitra Smaran.

### 3.1 Weapons (Abhimanyu)
| Input | Weapon | Role |
|---|---|---|
| J / tap A | Khadga (sword) | 3-hit combo, fast, low dmg |
| K / hold B | Dhanush (bow) | hold to aim, release = arrow; charged arrow pierces |
| L / tap C | Gada (mace) | slow, heavy, knockback, breaks shields |
| Space / tap D | Dodge roll | 0.4 s i-frames |
| U / Astra button | Astra | sirf boss ≤50% pe; ek baar per ring |

### 3.2 Astra chain (user ke order me)
| Ring | Boss | Use astra | Earn astra |
|---|---|---|---|
| 1 | Dushasana | — | Vayu |
| 2 | Shalya | Vayu | Agni |
| 3 | Lakshmana | Agni | Varun |
| 4 | Karna + Vrishasena | Varun | Naag |
| 5 | Brihadbala | Naag | Bhoomi |
| 6 | Kripa + Ashwatthama | Bhoomi | Him |
| 7 | Shat-maharathi gher + Durmasena | Him (Satyaki ke saath, core shatter) | — |

Astra effects (all AoE, big VFX, 2.5 s cinematic slow-mo):
- Vayu: whirlwind, sab enemies uchhalte hain, boss 25% dmg + 2 s stun.
- Agni: fire wave, burn DoT, boss 30%.
- Varun: water torrent, boss projectiles wash, boss 30% + slow.
- Naag: serpents bind — boss 4 s bound + 25%.
- Bhoomi: earth pillars, boss chariot jam, 35%.
- Him: freeze — ring 7 core pillar shatter (scripted).

### 3.3 Boss design (each distinct)
1. Dushasana — brawler. Charges, 2-hit sword, shield bash. Teaches dodge + combo. 3 min.
2. Shalya — gada duel. Slow telegraphed slams with ground shock; must dodge then punish. Teaches gada clash (gada vs gada parry window). 4 min.
3. Lakshmana — archer. Keeps distance, fan volleys; player must parry arrows with sword (timed) or close gap with roll. Teaches bow + parry. 4 min.
4. Karna + Vrishasena — two-body fight. Vrishasena harasses, Karna's Kavach makes arrows bounce (bow useless on Karna, must melee/gada). Karna leaves at 50% when Varun douses (lore: Karna dmg from Abhimanyu, retreats). 5 min.
5. Brihadbala — charging war-elephant style chariot. Arena hazards (burning chariots). Teaches positioning. 5 min.
6. Kripa + Ashwatthama — illusion clones (Ashwatthama maya); real one glows briefly when Kripa fires. Vipatti ring: decay high. 6 min.
7. Shat-maharathi — unwinnable scripted siege: 60–90 s survive, weapons break one by one (bow string snaps, chariot gone, sword only). Then fall. Mitra Smaran.

### 3.4 Ring 7 co-op script (Satyaki = friend)
- Phase A Bana-jaala (20 s): friend aims and fires 3 arrows into 3 glowing anchor points around Durmasena → lightning cage. Miss = retry, no fail.
- Phase B Prana-sanchar (15 s): trace a mandala path (drag) — Abhimanyu HP 0→50%. Abhimanyu stands, watches.
- Phase C Dvandva (90–120 s): Satyaki vs Durmasena (gada boss, 3 phases). Satyaki kit: dual sword fast combo, gada heavy, bow. Satyaki HP full. On fail: 0.5 s restart Phase C only.
- Phase D Core shatter: both press/tap together (hot-seat: same button; online: both players press within 3 s) → Him Astra + gada → pillar shatters → chain collapse cinematic.
- Drona line after Phase A: "Yeh adharma hai..." — six maharathis fall back behind the cage.

### 3.5 Co-op from start (optional)
Start screen pe "Mitra ko abhi bulao" → friend joins Ring 1 as Satyaki, rear role: har ring me 1 Vyooha-Nabhi (stambh + senapati) girana hai while Abhimanyu fights boss. Agar Nabhi nahi giri to ring ke end pe Satyaki ko 30 s "Nabhi-bhanjan" solo mini-fight. Satyaki ka rear-kaam hi Ring 7 ke exit ka logic hai, to game isse "optional" nahi, "pre-done by NPC Satyaki" treat karta hai jab friend nahi hai (cutscene me dikhta hai).

---

## 4. Virality / Network design

- Mitra Smaran link: `#join=<room>` — opens straight into Satyaki's Phase A with a 10 s "Tum Satyaki ho" card. Friend ko pehle apna run nahi karna padta.
- Friend finish karte hi: "Tumne Abhimanyu bachaya. Ab apna Chakravyooha todo" → ek tap pe apna run (K-loop).
- Share card (end): canvas-rendered PNG "Chakravyooha toota — 38:12 — Satyaki: <naam>" for WhatsApp/Instagram via Web Share API.
- Savior badge local profile pe.
- Koi login nahi. Analytics sirf cookieless aggregate counts (GoatCounter beacon, `js/gtm.js`): ring start/clear, run complete, Mitra link, friend join, share, daily start/share. Koi ID, koi personal data nahi; `<meta name="gc-site">` hata do to band. (v1 me "koi analytics nahi" tha; GTM ke level-gates ke liye 13 Nov ko badla.)

### 4.1 Aaj ka Vyooha (daily mode, added 13 Nov 2026)

Wordle ka asli engine share grid nahi, "roz ek puzzle, sabke liye same" tha. Poora 30-40 min ka run roz share karne layak nahi hota; isliye ek 3-min daily layer.

- Roz (IST date) ek ring (1-6 rotate, 7 kabhi nahi) + ek twist. Launch #1 = 18 Nov 2026. Seed: `ORDER = [4,1,5,2,6,3]` (ring no.), twist index `((n-1) + floor((n-1)/6)*2) % 5`.
- Twists (sirf wo systems jo World already padhta hai, taaki hamesha enforce ho): Wounded (60% praan), No astra, Double army, Iron maharathi (+30% boss life), Every blow hurts more.
- Sabke liye neutral difficulty (adaptive mercy/pro off). Din ka pehla try hi count; baad me "abhyas" (practice), result nahi badalta. Streak.
- Result: spoiler-free text, WhatsApp/Insta DM me chalne wala: `Aaj ka Vyooha #5 · Karna · No astra today / Jeeta 2:14 me  praan ▰▰▰▱▱  streak 3 / <link ?play=daily>`. Haar pe boss ka bacha hua bar.
- Link `?play=daily` seedha aaj ke challenge me le jaata hai. Home pe "Aaj ka Vyooha #N" button.
- Do loops alag: daily share = naye players (Wordle loop), Ring 7 Mitra Smaran = dost (K-loop).

### 4.2 Demo mode (clip recorder ke liye)

`?demo=<scene>&nohud=1`: menus skip, bot Abhimanyu khelta hai, HUD/touch chhupte hain, `window.__demoDone` scene khatam hone pe. Scenes: ring7_rescue, mitra_smaran, ring4_kavach, astra_vayu, gate_jayadratha, daily. GTM engine ka `engine/clips.mjs` isse faceless 9:16 Reels banata hai.

---

## 5. Art direction

Raji palette: terracotta #B5472D, ochre #D9A441, deep indigo #1B1F3B, bone #F1E7D0, gold #F4C95D, blood #7A1E1E. Outer rings warm golden dust; inner rings indigo-violet with torch light. HUD: brass mandala frame, Devanagari headings (Tiro Devanagari / Noto Serif Devanagari via Google Fonts, fallback system). Characters: vector silhouettes with 3-tone shading, distinct colour per boss, weapon trails. Astras: Avatar-style elemental ribbons (additive blending). Everything procedurally drawn on Canvas — koi external image asset nahi (load < 1.5 s, no copyright risk). Exception: `assets/img/og.jpg` (link preview, gameplay screenshot se bana).

## 6. Audio direction (sab procedural, Web Audio API)

- Music: tanpura drone (Sa–Pa) + dhol/nagada loop; tempo per ring 84 → 132 BPM; Vipatti = heartbeat + sub drone; Ring 7 = tabla taal faster + brass swell; Epilogue = shankh + raag-Bhairavi-ish pad.
- SFX: sword (noise burst + metallic ring), arrow (filtered whoosh), gada (low thud + crunch), hit, astra (per element), shankh (formant saw), chariot rumble.
- Voice: browser SpeechSynthesis, prefers hi-IN voice; male deeper pitch for Drona/Bhima, youthful for Abhimanyu, steady for Satyaki, gentle for Yudhishthira. Subtitles always on (voice availability varies by device — [Certain]). Narrator = "Sanjaya" (sensible: he is the canonical narrator).

## 7. Tech

- Vanilla ES modules + Canvas 2D. No build step, no framework. Static hosting (GitHub Pages / Cloudflare Pages).
- Files: index.html, css/, js/{main,engine,input,render,audio,voice,dialogue,cinematic,combat,entities,bosses,astras,coop,ui,save,share}.js
- P2P: PeerJS (CDN, pinned version) — host authoritative, 20 Hz state, friend inputs 30 Hz.
- Save: localStorage (ring, astras, time, savior badge). No cookies.
- Security: CSP (self + peerjs cdn + fonts), no eval, no innerHTML from untrusted strings, room codes 10-char random, host validates all peer messages (schema + rate limit), friend name sanitised and length-capped.
- Performance budget: 60 fps on mid Android (Chrome), ≤ 300 entities, offscreen particles culled.

## 8. Build order
1. Engine + Ring 1 playable → 2. all 7 bosses → 3. astras → 4. cinematic + voice + music → 5. co-op → 6. share + save → 7. test on Brave desktop + Android → 8. semgrep + header audit → 9. deploy.
