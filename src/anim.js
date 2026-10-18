/** 呈現層動畫：主 B 分鏡；結局 C 香／定格；調查窺閣；關卡轉換。 */

const FULL_MS = 60000;

/** beats: 起→轉→再轉→收。每拍可帶 center／row／mood；shake 為 1／2 震動強度。 */
const CLIPS = {
  door: {
    sound: "door",
    shake: 1,
    beats: [
      { center: "door_0", mood: "ash", ms: 800 },
      { center: "door_1", mood: null, ms: 700 },
      { center: "door_2", mood: "ash", ms: 900 },
      { center: "wall", mood: "void", ms: 1400 }
    ]
  },
  wolf: {
    sound: "fire",
    shake: 2,
    beats: [
      { center: "fx_fire_0", row: [], mood: "ember", ms: 900 },
      { center: "fx_fire_1", row: ["baihu"], mood: "ember", ms: 1100 },
      { center: "baihu", row: ["fx_fire_1"], mood: "ash", ms: 1400 },
      { center: "baihu", row: [], mood: "void", ms: 2000 }
    ]
  },
  flee: {
    sound: "gate",
    beats: [
      { center: "fx_gate_0", row: [], mood: "mist", ms: 900 },
      { center: "fx_gate_1", row: [], mood: "mist", ms: 1000 },
      { center: "qinglong", row: ["fx_gate_1"], mood: "cool", ms: 1400 },
      { center: "qinglong", row: [], mood: "void", ms: 1800 }
    ]
  },
  sever: {
    sound: "soft",
    beats: [
      { center: "fx_pill", row: [], mood: "cool", ms: 900 },
      { center: "pill", row: [], mood: "dawn", ms: 1000 },
      { center: "pill", row: ["elder"], mood: "cool", ms: 1400 },
      { center: "elder", row: ["pill"], mood: "void", ms: 1800 }
    ]
  },
  ember: {
    sound: "chain",
    beats: [
      { center: "fx_ember", row: ["chains"], mood: "dawn", ms: 900 },
      { center: "chains", row: ["qinglong"], mood: "dawn", ms: 1000 },
      { center: "elder", row: ["qinglong"], mood: "mist", ms: 1500 },
      { center: "elder", row: ["qinglong"], mood: "void", ms: 1800 }
    ]
  },
  buried: {
    sound: "ruin",
    shake: 2,
    beats: [
      { center: "fuse_1", row: [], mood: "ash", ms: 900 },
      { center: "fuse_2", row: [], mood: "ash", ms: 1000 },
      { center: "fx_ruin_0", row: ["fuse_3"], mood: "void", ms: 1400 },
      { center: "fx_ruin_1", row: [], mood: "void", ms: 1200 },
      { center: "sky", row: [], mood: "void", ms: 2200 }
    ]
  },
  wolfSky: {
    sound: "soft",
    beats: [
      { center: "baihu", row: [], mood: "void", ms: 1000 },
      { center: "sky", row: [], mood: "void", ms: 1400 },
      { center: "sky", row: [], mood: "void", ms: 2400 }
    ]
  },
  fleeSky: {
    sound: "soft",
    beats: [
      { center: "qinglong", row: [], mood: "void", ms: 1000 },
      { center: "sky", row: [], mood: "void", ms: 1400 },
      { center: "sky", row: [], mood: "void", ms: 2400 }
    ]
  },
  severSky: {
    sound: "soft",
    beats: [
      { center: "pill", row: ["elder"], mood: "void", ms: 1000 },
      { center: "sky", row: [], mood: "void", ms: 1400 },
      { center: "sky", row: [], mood: "void", ms: 2400 }
    ]
  },
  emberSky: {
    sound: "soft",
    beats: [
      { center: "elder", row: ["qinglong"], mood: "void", ms: 1100 },
      { center: "sky", row: [], mood: "void", ms: 1400 },
      { center: "sky", row: [], mood: "void", ms: 2400 }
    ]
  },
  buriedSky: {
    sound: "fuse",
    beats: [
      { center: "fuse_3", row: [], mood: "void", ms: 1100 },
      { center: "sky", row: [], mood: "void", ms: 1500 },
      { center: "sky", row: [], mood: "void", ms: 2600 }
    ]
  },

  // —— 進關 ——
  enter1: {
    sound: "door",
    beats: [
      { center: "door_1", row: [], mood: "ash", ms: 800 },
      { center: "wall", row: [], mood: null, ms: 700 },
      { center: "wall", row: ["compass"], mood: "dawn", ms: 1100 },
      { center: "wall", row: ["poem"], mood: "cool", ms: 1200 }
    ]
  },
  enter2: {
    sound: "soft",
    beats: [
      { center: "wall", row: ["needle"], mood: null, ms: 800 },
      { center: "bronze", row: [], mood: "ash", ms: 900 },
      { center: "bronze", row: ["needle"], mood: null, ms: 1100 },
      { center: "bronze", row: ["needle"], mood: "cool", ms: 1100 }
    ]
  },
  enter3: {
    sound: "soft",
    beats: [
      { center: "bronze", row: [], mood: "ash", ms: 700 },
      { center: "tiles", row: [], mood: null, ms: 800 },
      { center: "tiles", row: ["wood", "earth"], mood: "dawn", ms: 1100 },
      { center: "tiles", row: ["water", "fire"], mood: "ember", ms: 1100 }
    ]
  },
  enter4: {
    sound: "wood",
    beats: [
      { center: "tiles", row: [], mood: null, ms: 700 },
      { center: "board", row: [], mood: "ash", ms: 900 },
      { center: "board", row: [], mood: null, ms: 1100 },
      { center: "board", row: [], mood: "cool", ms: 1100 }
    ]
  },
  enter5: {
    sound: "soft",
    beats: [
      { center: "board", row: ["letter", "scale"], mood: null, ms: 800 },
      { center: "shelf", row: [], mood: "ash", ms: 900 },
      { center: "shelf", row: ["scroll"], mood: null, ms: 1100 },
      { center: "shelf", row: ["scroll", "hongre"], mood: "dawn", ms: 1100 }
    ]
  },
  enter6: {
    sound: "door",
    beats: [
      { center: "bowl", row: [], mood: "ash", ms: 800 },
      { center: "screen", row: [], mood: null, ms: 900 },
      { center: "screen", row: ["blade"], mood: "mist", ms: 1200 },
      { center: "screen", row: ["blade"], mood: "void", ms: 1200 }
    ]
  },
  enter7: {
    sound: "soft",
    shake: 1,
    beats: [
      { center: "door_2", row: [], mood: "ash", ms: 900 },
      { center: "door_3", row: ["fuse_0"], mood: "ash", ms: 1000 },
      { center: "elder", row: ["chains"], mood: "ash", ms: 1400 },
      { center: "elder", row: ["baihu", "qinglong"], mood: "void", ms: 1600 }
    ]
  },

  // —— 過關 ——
  clear1: {
    sound: "soft",
    beats: [
      { center: "wall", row: ["zhen", "dui", "kan"], mood: "dawn", ms: 800 },
      { center: "door_0", row: ["zhen", "dui", "kan"], mood: null, ms: 1000 },
      { center: "door_0", row: ["needle"], mood: "dawn", ms: 1200 },
      { center: "wall", row: ["needle"], mood: "cool", ms: 1100 }
    ]
  },
  clear2: {
    sound: "needle",
    beats: [
      { center: "bronze", row: ["needle"], mood: null, ms: 800 },
      { center: "bronze", row: ["needle"], mood: "cool", ms: 1100 },
      { center: "bronze", row: [], mood: "ash", ms: 1000 },
      { center: "tiles", row: [], mood: "ash", ms: 1100 }
    ]
  },
  clear3: {
    sound: "soft",
    beats: [
      { center: "tiles", row: ["wood", "earth", "water", "fire"], mood: "dawn", ms: 900 },
      { center: "tiles", row: ["metal"], mood: "ember", ms: 1000 },
      { center: "tiles", row: [], mood: "ash", ms: 900 },
      { center: "board", row: [], mood: null, ms: 1200 }
    ]
  },
  board: {
    sound: "wood",
    beats: [
      { center: "board", row: [], mood: null, ms: 800 },
      { center: "board_open", row: [], mood: "dawn", ms: 1100 },
      { center: "board_open", row: ["letter"], mood: null, ms: 1300 },
      { center: "letter", row: ["scale"], mood: "cool", ms: 1300 }
    ]
  },
  brew: {
    sound: "soft",
    beats: [
      { center: "bowl", row: ["xuelian"], mood: null, ms: 800 },
      { center: "bowl_aside", row: ["xuelian"], mood: "dawn", ms: 1100 },
      { center: "pill", row: ["bowl_aside"], mood: "dawn", ms: 1200 },
      { center: "bowl", row: ["pill"], mood: "cool", ms: 1200 }
    ]
  },
  brewNone: {
    sound: "crack",
    shake: 1,
    beats: [
      { center: "bowl", row: [], mood: null, ms: 800 },
      { center: "bowl_aside", row: [], mood: "ash", ms: 1000 },
      { center: "bowl", row: [], mood: "ember", ms: 1000 },
      { center: "bowl", row: [], mood: "ash", ms: 1100 }
    ]
  },
  clear6: {
    sound: "door",
    beats: [
      { center: "screen", row: [], mood: null, ms: 800 },
      { center: "door_1", row: ["blade"], mood: "mist", ms: 1100 },
      { center: "door_2", row: ["blade"], mood: "ash", ms: 1200 },
      { center: "door_3", row: ["fuse_0"], mood: "void", ms: 1400 }
    ]
  },

  // —— 解謎成功（短慶祝）——
  bagua: {
    sound: "soft",
    beats: [
      { center: "wall", row: ["zhen", "dui", "kan"], mood: null, ms: 800 },
      { center: "door_0", row: ["zhen", "dui", "kan"], mood: "dawn", ms: 1000 },
      { center: "door_0", row: ["needle"], mood: null, ms: 1100 },
      { center: "wall", row: ["needle"], mood: "cool", ms: 1100 }
    ]
  },
  needle: {
    sound: "needle",
    beats: [
      { center: "bronze", row: [], mood: null, ms: 700 },
      { center: "needle", row: [], mood: "cool", ms: 900 },
      { center: "bronze", row: ["needle"], mood: null, ms: 1200 },
      { center: "bronze", row: ["needle"], mood: "cool", ms: 1100 }
    ]
  },
  wuxing: {
    sound: "soft",
    beats: [
      { center: "tiles", row: ["wood", "earth"], mood: null, ms: 800 },
      { center: "tiles", row: ["water", "fire"], mood: "dawn", ms: 1000 },
      { center: "tiles", row: ["wood", "earth", "water", "fire"], mood: "ember", ms: 1100 },
      { center: "tiles", row: ["wood", "earth", "water", "fire"], mood: "cool", ms: 1100 }
    ]
  },
  sword: {
    sound: "soft",
    beats: [
      { center: "screen", row: [], mood: null, ms: 800 },
      { center: "screen", row: ["blade"], mood: "mist", ms: 1100 },
      { center: "door_1", row: ["blade"], mood: "ash", ms: 1200 },
      { center: "door_1", row: ["blade"], mood: "void", ms: 1200 }
    ]
  },
  letter: {
    sound: "wood",
    beats: [
      { center: "letter", row: [], mood: null, ms: 800 },
      { center: "letter", row: [], mood: "cool", ms: 1000 },
      { center: "scroll", row: ["letter"], mood: "ash", ms: 1100 },
      { center: "letter", row: [], mood: "cool", ms: 1100 }
    ]
  },
  chain: {
    sound: "chain",
    shake: 1,
    beats: [
      { center: "chains", row: [], mood: null, ms: 700 },
      { center: "fx_ember", row: ["chains"], mood: "dawn", ms: 1100 },
      { center: "elder", row: ["chains"], mood: "dawn", ms: 1100 },
      { center: "elder", row: [], mood: "mist", ms: 1200 }
    ]
  },
  placePill: {
    sound: "soft",
    beats: [
      { center: "pill", row: [], mood: "dawn", ms: 800 },
      { center: "pill", row: [], mood: "cool", ms: 900 },
      { center: "elder", row: ["pill"], mood: "cool", ms: 1200 },
      { center: "elder", row: ["pill"], mood: "void", ms: 1200 }
    ]
  },
  cheat: {
    sound: "joke",
    shake: 1,
    beats: [
      { center: "wall", row: [], mood: null, ms: 700 },
      { center: "door_0", row: [], mood: "dawn", ms: 900 },
      { center: "door_1", row: [], mood: null, ms: 1000 },
      { center: "wall", row: ["door_1"], mood: "cool", ms: 1200 }
    ]
  },

  // —— 調查：窺閣（多一拍，鏡頭更有推近感）——
  lookCompass: {
    sound: "soft",
    beats: [
      { center: "wall", row: [], mood: null, ms: 700 },
      { center: "wall", row: ["compass"], mood: "dawn", ms: 900 },
      { center: "compass", row: [], mood: "dawn", ms: 1300 },
      { center: "wall", row: ["compass"], mood: "cool", ms: 1100 }
    ]
  },
  lookPoem: {
    sound: "soft",
    beats: [
      { center: "wall", row: [], mood: "ash", ms: 700 },
      { center: "wall", row: ["poem"], mood: "cool", ms: 900 },
      { center: "poem", row: [], mood: "cool", ms: 1400 },
      { center: "wall", row: ["poem"], mood: "ash", ms: 1100 }
    ]
  },
  lookBronze: {
    sound: "needle",
    beats: [
      { center: "bronze", row: [], mood: null, ms: 800 },
      { center: "bronze", row: ["needle"], mood: "cool", ms: 1200 },
      { center: "bronze", row: [], mood: "ash", ms: 1000 },
      { center: "bronze", row: [], mood: null, ms: 1000 }
    ]
  },
  lookWuxing: {
    sound: "soft",
    beats: [
      { center: "tiles", row: [], mood: null, ms: 700 },
      { center: "poem", row: ["metal"], mood: "ember", ms: 1100 },
      { center: "tiles", row: ["wood", "fire"], mood: "ash", ms: 1100 },
      { center: "tiles", row: [], mood: "cool", ms: 1000 }
    ]
  },
  lookBoard: {
    sound: "wood",
    beats: [
      { center: "board", row: [], mood: null, ms: 800 },
      { center: "board", row: [], mood: "cool", ms: 1200 },
      { center: "board", row: [], mood: "dawn", ms: 1000 },
      { center: "board", row: [], mood: null, ms: 1000 }
    ]
  },
  lookScroll: {
    sound: "wood",
    beats: [
      { center: "shelf", row: [], mood: null, ms: 700 },
      { center: "shelf", row: ["scroll"], mood: "ash", ms: 900 },
      { center: "scroll", row: [], mood: "cool", ms: 1400 },
      { center: "shelf", row: ["scroll"], mood: "cool", ms: 1100 }
    ]
  },
  lookHerbs: {
    sound: "soft",
    beats: [
      { center: "shelf", row: [], mood: null, ms: 700 },
      { center: "shelf", row: ["hongre", "hanyin"], mood: "dawn", ms: 1000 },
      { center: "shelf", row: ["hongre", "hanyin", "xuelian", "qingre"], mood: "ember", ms: 1300 },
      { center: "shelf", row: [], mood: "cool", ms: 1100 }
    ]
  },
  lookNeedle: {
    sound: "needle",
    beats: [
      { center: "needle", row: [], mood: "cool", ms: 1000 },
      { center: "needle", row: [], mood: "dawn", ms: 900 },
      { center: "bronze", row: ["needle"], mood: null, ms: 1200 }
    ]
  },
  lookLetter: {
    sound: "wood",
    beats: [
      { center: "letter", row: [], mood: "cool", ms: 1000 },
      { center: "letter", row: [], mood: "ash", ms: 900 },
      { center: "scroll", row: ["letter"], mood: "cool", ms: 1200 }
    ]
  },
  lookScale: {
    sound: "soft",
    beats: [
      { center: "scale", row: [], mood: null, ms: 1000 },
      { center: "scale", row: [], mood: "dawn", ms: 900 },
      { center: "shelf", row: ["scale"], mood: "cool", ms: 1200 }
    ]
  },
  lookPill: {
    sound: "soft",
    beats: [
      { center: "pill", row: [], mood: "dawn", ms: 1000 },
      { center: "pill", row: [], mood: "cool", ms: 900 },
      { center: "elder", row: ["pill"], mood: "void", ms: 1200 }
    ]
  },
  lookSmear: {
    sound: "crack",
    beats: [
      { center: "smear", row: [], mood: "ash", ms: 1000 },
      { center: "smear", row: [], mood: "ember", ms: 900 },
      { center: "bowl", row: ["smear"], mood: "cool", ms: 1200 }
    ]
  },
  lookBlade: {
    sound: "soft",
    beats: [
      { center: "blade", row: [], mood: "mist", ms: 1000 },
      { center: "blade", row: [], mood: "ash", ms: 900 },
      { center: "screen", row: ["blade"], mood: "void", ms: 1300 }
    ]
  },
  lookBarren: {
    sound: "soft",
    beats: [
      { center: "wall", row: [], mood: "ash", ms: 800 },
      { center: "brick", row: [], mood: "void", ms: 1100 },
      { center: "wall", row: [], mood: "ash", ms: 1000 },
      { center: "wall", row: [], mood: null, ms: 900 }
    ]
  },

  // —— 關與關之間的過廊 ——
  transit: {
    sound: "door",
    beats: [
      { center: "door_0", row: [], mood: "ash", ms: 700 },
      { center: "door_1", row: [], mood: "void", ms: 800 },
      { center: "door_2", row: [], mood: "ash", ms: 900 },
      { center: "door_3", row: [], mood: "void", ms: 800 }
    ]
  }
};

const ENDING_SKY = {
  wolf: "wolfSky",
  flee: "fleeSky",
  sever: "severSky",
  ember: "emberSky",
  buried: "buriedSky"
};

/** log 代號 → clip；進關／過關／調查／慶祝 */
const LOG_CLIPS = {
  "prologue.1": "door",
  "cheat.joke": "cheat",
  "enter.1.a": "enter1",
  "enter.2.a": "enter2",
  "enter.3.a": "enter3",
  "enter.4.a": "enter4",
  "enter.5.a": "enter5",
  "enter.6.a": "enter6",
  "enter.7.a": "enter7",
  "clear.1.a": "clear1",
  "clear.2.a": "clear2",
  "clear.3.a": "clear3",
  "clear.4.a": "board",
  "clear.5.with.a": "brew",
  "clear.5.none.a": "brewNone",
  "clear.6.a": "clear6",
  "bagua.success": "bagua",
  "acupoint.success": "needle",
  "needle.ready": "needle",
  "wuxing.success": "wuxing",
  "sword.success": "sword",
  "letter.1": "letter",
  "ending.freeChains": "chain",
  "ending.placePill": "placePill",
  "compass.inspect": "lookCompass",
  "bagua.poem": "lookPoem",
  "bronze.inspect": "lookBronze",
  "wuxing.poem": "lookWuxing",
  "ko.hint": "lookBoard",
  "brew.scroll": "lookScroll",
  "brew.herbs": "lookHerbs",
  "needle.inspect": "lookNeedle",
  "letter.inspect": "lookLetter",
  "scale.inspect": "lookScale",
  "pill.inspect": "lookPill",
  "smear.inspect": "lookSmear",
  "blade.inspect": "lookBlade",
  "inspect.barren": "lookBarren"
};

const INSPECT_BY_TARGET = {
  compass: "compass.inspect",
  poem: "bagua.poem",
  bronze: "bronze.inspect",
  wuxing: "wuxing.poem",
  board: "ko.hint",
  herbs: "brew.herbs",
  scroll: "brew.scroll",
  needle: "needle.inspect",
  letter: "letter.inspect",
  scale: "scale.inspect",
  pill: "pill.inspect",
  acid_smear: "smear.inspect",
  blade: "blade.inspect",
  barren: "inspect.barren"
};

let reduced = false;
let clip = null;
let clipStarted = 0;
let holdUntil = 0;
let lastKey = "";
let lastLog = "";
let lastEnding = null;
let lastEndingPage = -1;
let lastPhase = null;
let soundHook = null;

export function setReducedMotion(on) {
  reduced = Boolean(on);
}

export function onAnimSound(fn) {
  soundHook = fn;
}

/** 同一目標再調查時補播短窺（首次仍由 syncAnim 播完整鏡頭）。 */
export function noteInspect(target, now = performance.now()) {
  const logId = INSPECT_BY_TARGET[target];
  if (!logId) return;
  const clipName = LOG_CLIPS[logId];
  if (!clipName) return;
  if (logId === lastLog && !animBusy(now)) play(clipName, now, { soft: true });
}

export function animBusy(now = performance.now()) {
  return holdUntil > now;
}

export function fuseFrame(remainingMs) {
  if (remainingMs == null) return "fuse";
  const t = Math.max(0, Math.min(1, remainingMs / FULL_MS));
  if (t > 0.72) return "fuse_0";
  if (t > 0.42) return "fuse_1";
  if (t > 0.16) return "fuse_2";
  return "fuse_3";
}

/** 第 7 關香壓迫：剩餘越少，畫面越沉（策略 C）。 */
export function ashLevel(remainingMs) {
  if (remainingMs == null) return 0;
  const t = Math.max(0, Math.min(1, remainingMs / FULL_MS));
  if (t > 0.66) return 0.12;
  if (t > 0.4) return 0.22;
  if (t > 0.18) return 0.34;
  if (t > 0.06) return 0.46;
  return 0.58;
}

export function syncAnim(state, now = performance.now()) {
  if (!state) return;
  const key = [
    state.beat,
    state.phase,
    state.ending ?? "",
    state.page,
    state.flags?.introDone ? 1 : 0,
    state.log?.[0] ?? ""
  ].join("|");

  if (state.ending && state.ending !== lastEnding) {
    lastEnding = state.ending;
    lastEndingPage = state.page;
    play(state.ending, now);
  } else if (state.ending && state.page !== lastEndingPage) {
    lastEndingPage = state.page;
    if (state.page === 1) holdMood(state.ending, now);
    else if (state.page >= 2) {
      const sky = ENDING_SKY[state.ending];
      if (sky) play(sky, now);
    }
  }
  if (!state.ending) {
    lastEnding = null;
    lastEndingPage = -1;
  }

  const phaseChanged = lastPhase != null && state.phase !== lastPhase && !state.ending;
  const log = state.log?.[0] ?? "";
  if (log !== lastLog) {
    const clipName = LOG_CLIPS[log];
    if (clipName) {
      // 換關進 enter 時：過廊門縫 + 進關鏡頭連播
      const withTransit = phaseChanged && state.beat === "enter" && String(clipName).startsWith("enter");
      play(clipName, now, withTransit ? { transit: true } : {});
    }
    if (log === "acupoint.step") soundHook?.("needle");
    if (log === "acupoint.fail") soundHook?.("needle");
    if (log === "brew.fail.qing" || log === "brew.fail.snow" || log === "brew.fail.extra" || log === "brew.fail.ratio") soundHook?.("crack");
    if (log === "ko.success") soundHook?.("wood");
    if (log === "ko.fail" || log === "bagua.fail" || log === "wuxing.fail" || log === "sword.fail") {
      soundHook?.("crack");
    }
    lastLog = log;
  }

  lastPhase = state.phase;
  lastKey = key;
}

function clipDuration(beats) {
  return beats.reduce((sum, beat) => sum + beat.ms, 0);
}

function play(name, now, options = {}) {
  const def = CLIPS[name];
  if (!def) return;
  if (reduced) {
    const last = def.beats[def.beats.length - 1];
    clip = {
      name,
      beats: [{ ...last, ms: 0 }],
      shake: 0
    };
    clipStarted = now;
    holdUntil = now;
    if (!options.soft) soundHook?.(def.sound);
    return;
  }
  let beats = def.beats;
  if (options.transit && CLIPS.transit) {
    beats = [...CLIPS.transit.beats, ...def.beats];
  }
  if (options.soft) {
    beats = beats.length > 2
      ? [beats[0], beats[beats.length - 1]]
      : beats;
    beats = beats.map((beat) => ({ ...beat, ms: Math.max(400, Math.floor(beat.ms * 0.6)) }));
  }
  clip = {
    name,
    beats,
    shake: options.soft ? 0 : Number(def.shake) || 0
  };
  clipStarted = now;
  holdUntil = now + clipDuration(beats);
  if (!options.soft) soundHook?.(options.transit ? "door" : def.sound);
}

function holdMood(ending, now) {
  const mood = endingMood(ending, 1);
  const center = endingCenter(ending);
  const row = endingRow(ending);
  if (reduced) {
    clip = { name: `${ending}-hold`, beats: [{ center, row, mood, ms: 0 }], shake: 0 };
    clipStarted = now;
    holdUntil = now;
    return;
  }
  const holdMs = 1800;
  clip = {
    name: `${ending}-hold`,
    beats: [
      { center, row, mood, ms: 900 },
      { center, row, mood: endingMood(ending, 2) || mood, ms: holdMs - 900 }
    ],
    shake: 0
  };
  clipStarted = now;
  holdUntil = now + holdMs;
}

function endingCenter(ending) {
  if (ending === "wolf") return "baihu";
  if (ending === "flee") return "qinglong";
  if (ending === "sever") return "pill";
  if (ending === "ember") return "elder";
  if (ending === "buried") return "fuse_3";
  return "sky";
}

function endingRow(ending) {
  if (ending === "sever") return ["elder"];
  if (ending === "ember") return ["qinglong"];
  return [];
}

function endingMood(ending, page) {
  if (page >= 2) return "void";
  if (ending === "wolf") return page === 1 ? "ash" : "ember";
  if (ending === "flee") return page === 1 ? "cool" : "mist";
  if (ending === "sever") return "cool";
  if (ending === "ember") return page === 1 ? "mist" : "dawn";
  if (ending === "buried") return "void";
  return null;
}

function activeBeat(now) {
  if (!clip?.beats?.length) return null;
  let t = now - clipStarted;
  for (const beat of clip.beats) {
    if (t < beat.ms) return beat;
    t -= beat.ms;
  }
  return clip.beats[clip.beats.length - 1];
}

export function stageView(state, now = performance.now()) {
  let center = null;
  let row = null;
  let mood = moodFor(state);

  if (clip && now < holdUntil) {
    const beat = activeBeat(now);
    if (beat) {
      center = beat.center ?? null;
      if (beat.row !== undefined) row = beat.row;
      if (beat.mood !== undefined) mood = beat.mood;
    }
  } else if (clip && now >= holdUntil) {
    clip = null;
  }

  if (!center && state?.ending && state.page >= 2) {
    center = "sky";
    row = [];
    mood = "void";
  }

  const inFinale = state?.phase === 7 && state.flags?.introDone && !state.ending;
  const fuse = inFinale ? fuseFrame(state.timer?.remainingMs) : null;
  const ash = inFinale
    ? ashLevel(state.timer?.remainingMs)
    : state?.ending && state.page >= 2
      ? 0.35
      : 0;

  return {
    center,
    row,
    mood,
    fuse,
    ash,
    shake: clip?.shake && animBusy(now) ? Number(clip.shake) : 0,
    busy: animBusy(now)
  };
}

function moodFor(state) {
  if (!state?.ending) {
    if (state?.phase === 7 && state.flags?.introDone) {
      return "ash";
    }
    return null;
  }
  return endingMood(state.ending, state.page);
}

/** 測試用：重置內部狀態 */
export function resetAnim() {
  clip = null;
  clipStarted = 0;
  holdUntil = 0;
  lastKey = "";
  lastLog = "";
  lastEnding = null;
  lastEndingPage = -1;
  lastPhase = null;
}
