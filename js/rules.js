// ============================================================================================
//  RULES — every gameplay number and mechanic lives here.
//  Change a value in this file and the game follows; no other file needs editing for tuning.
//  (Story text, dialogue and character looks live in config.js; this file is only "how the game plays".)
//  Time is in seconds, distance in world pixels, speed in px/s, damage in life points.
// ============================================================================================

export const RULES = {

  // ---------- Abhimanyu ----------
  player: {
    maxHp: 150, speed: 255, radius: 20,
    sword: { dmg: 9, arc: 1.3, range: 70, cd: 0.22, comboWindow: 0.55, comboDmg: [9, 10, 16] },
    bow:   { dmg: 12, chargedDmg: 26, speed: 760, cd: 0.38, chargeTime: 0.7 },
    gada:  { dmg: 30, arc: 1.7, range: 90, cd: 0.9, windup: 0.32, knock: 420 },
    dodge: { dur: 0.38, speed: 620, cd: 0.75 },
    shardHeal: 12,              // life from a glowing shard dropped by soldiers
    arrows: 45,                 // quiver size (refilled at every gate)
  },

  // ---------- Satyaki ----------
  satyaki: {
    maxHp: 180, speed: 265, radius: 21,
    sword: { dmg: 8, arc: 1.4, range: 72, cd: 0.17, comboWindow: 0.5, comboDmg: [8, 8, 9, 15] },
    bow:   { dmg: 14, chargedDmg: 30, speed: 800, cd: 0.34, chargeTime: 0.6 },
    gada:  { dmg: 40, arc: 1.9, range: 100, cd: 1.0, windup: 0.36, knock: 520 },
    dodge: { dur: 0.36, speed: 650, cd: 0.7 },
    shardHeal: 14,
    arrows: 55,
    strugglePerLoosen: 7,       // co-op: Strike taps while bound that loosen one noose-holder
  },

  // ---------- Survival ----------
  survival: {
    damageTaken: 0.6,           // every incoming hit is multiplied by this
    regenPerSec: 3, regenAfter: 4, regenCap: 0.6,   // life regrows when unhurt for regenAfter s, up to 60% of max
    gateHeal: 0.4, gateFloor: 0.75,                  // at each gate: +40% of max life, and at least 75%
    decayScale: 0.5,            // the Vyooha slowly wears you down (each ring's decay × this)
    jumpHeight: 70, jumpTime: 0.62, landingDmg: 6, landingKnock: 380,
  },

  // ---------- Shield (dhaal) ----------
  shield: {
    frontArc: 1.15,             // radians either side of facing that the shield covers
    reduce: 0.15,               // a blocked hit deals 15%
    perfectWindow: 0.22,        // raise the shield this soon before a hit = perfect block (no damage, enemy staggers)
    perfectShakti: 6,
    moveSpeed: 0.45,            // walking speed while shield is up
  },

  // ---------- Divya-shakti (astra meter) ----------
  shakti: {
    max: 100, perKill: 14, perCloneKill: 4,
    lesserBossDmgPct: 0.06,     // a Divya-shakti release chips 6% of a maharathi's life and stuns
    bigAstraAt: 0.5,            // the full astra unlocks when a maharathi falls to 50%
  },

  // ---------- Marma: each maharathi's vital point ----------
  // Ordinary blows only graze a maharathi (grazeMult) and cannot bring him below floorPct of his life.
  // Only a strike on his marma does full damage and can finish him. The game never states the marma outright:
  // the player discovers it by trying things; no hints are given. When it lands, the word "Marma!" rings out.
  marma: {
    grazeMult: 0.4, floorPct: 0.2, hitMult: 1.6, hitStun: 0.8,
    ripostWindow: 1.6,          // 'riposte': strike within this many seconds after shielding his blow
    behindArc: 1.9,             // 'behind': radians off his facing that count as his back
    bosses: {
      dushasana:  'riposte',    // block his blow with the dhaal, then strike back at once
      shalya:     'airGada',    // leap and bring the gada down on him (Strike while in the air with the gada)
      lakshmana:  'charged',    // a fully drawn arrow
      karna:      'interrupt',  // strike while he is drawing / winding up
      brihadbala: 'staggered',  // the gada, while he is dazed (after a perfect block or his charge)
      kripa:      'behind',     // the true Ashwatthama casts a shadow; strike him from behind
    },
  },

  // ---------- Adaptive difficulty ----------
  // Struggling players get help disguised as blessings; strong players get a tougher Vyooha. Never announced as "easy mode".
  adaptive: {
    enabled: true,
    // help when struggling (each death on a ring raises 'mercy' for that ring, up to 3)
    mercy: {
      shaktiAtStart: [0, 40, 70, 100],   // Divya-shakti on retry, by mercy level
      soldiersMult: [1, 0.9, 0.8, 0.7],
      bossHpMult: [1, 0.92, 0.85, 0.78],
      extraHealDrops: [0, 0.15, 0.25, 0.35],  // added chance a soldier drops a healing shard
      extraBigAstra: [0, 0, 1, 1],       // after 2 falls on a ring, the full astra can be loosed twice there
      lifeDrop: { belowPct: 0.2, every: 14, everyNoMercy: 30 }, // in vipatti a healing prasad appears near you (every 14 s after a fall, every 30 s otherwise)
    },
    // pressure when the player is cruising (cleared last ring fast, high life, no death)
    pro: {
      maxLevel: 2,
      fastIfUnder: 0.8,           // cleared in < 80% of the ring's target minutes
      healthyAbove: 0.65,         // and finished with > 65% life
      enemyDamageTakenMult: [1, 0.85, 0.8],  // level 2: maharathi life drains 20% slower
      soldiersMult: [1, 1.1, 1.2],           // level 2: 20% more soldiers
      enemyDmgMult: [1, 1.05, 1.1],
    },
  },

  // ---------- Physics ----------
  physics: {
    impulseFriction: 7,         // how fast knockback bleeds off (higher = stops sooner)
    impulseCap: 900,
    mass: { hero: 1, soldier: 0.75, bossBase: 1.5, bossHeavy: 2.2 },
    arrowKnock: { soldier: 130, soldierCharged: 260, boss: 60, bossCharged: 200 },
    stuckArrowLife: 7,
  },

  // ---------- Touch controls ----------
  controls: {
    stickRadius: 58, stickDeadZone: 0.14, stickFollow: 1.35,  // floating joystick
    holdToRepeatMelee: true,    // holding Strike keeps swinging sword / gada
  },
};
