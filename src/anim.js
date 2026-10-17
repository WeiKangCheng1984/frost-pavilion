/** 呈現層動畫。不改謎題答案，只決定畫面與短暫擋操作。 */

const FULL_MS = 60000;

const CLIPS = {
  door: {
    frames: ["door_0", "door_1", "door_2", "door_3", "door_3", "door_2", "wall"],
    ms: 3800,
    sound: "door"
  },
  wolf: {
    frames: ["fx_fire_0", "fx_fire_1", "fx_fire_0", "fx_fire_1", "baihu", "fx_fire_0", "baihu", "fx_fire_1"],
    ms: 5200,
    sound: "fire",
    shake: true
  },
  flee: {
    frames: ["fx_gate_0", "fx_gate_1", "qinglong", "fx_gate_1", "qinglong", "fx_gate_0", "qinglong"],
    ms: 4800,
    sound: "gate"
  },
  sever: {
    frames: ["fx_pill", "pill", "elder", "pill", "elder", "fx_pill", "elder"],
    ms: 4600,
    sound: "soft"
  },
  ember: {
    frames: ["fx_ember", "chains", "elder", "qinglong", "elder", "qinglong", "fx_ember"],
    ms: 5200,
    sound: "chain"
  },
  buried: {
    frames: ["fuse_3", "fuse_2", "fx_ruin_0", "fx_ruin_1", "fx_ruin_0", "fx_ruin_1", "sky"],
    ms: 5600,
    sound: "ruin",
    shake: true
  },
  wolfSky: { frames: ["baihu", "sky", "sky", "baihu", "sky"], ms: 3400, sound: "soft" },
  fleeSky: { frames: ["qinglong", "sky", "sky", "qinglong", "sky"], ms: 3400, sound: "soft" },
  severSky: { frames: ["elder", "sky", "pill", "sky"], ms: 3200, sound: "soft" },
  emberSky: { frames: ["elder", "qinglong", "sky", "sky"], ms: 3400, sound: "soft" },
  buriedSky: { frames: ["fx_ruin_1", "sky", "sky", "fuse_3"], ms: 3600, sound: "fuse" },
  board: {
    frames: ["board", "board", "board_open", "letter", "board_open", "letter", "board_open"],
    ms: 4000,
    sound: "wood"
  },
  brew: {
    frames: ["bowl_aside", "xuelian", "pill", "bowl_aside", "pill", "bowl"],
    ms: 4000,
    sound: "soft"
  },
  brewNone: {
    frames: ["bowl", "bowl", "bowl_aside", "bowl", "bowl"],
    ms: 3200,
    sound: "crack"
  },
  cheat: {
    frames: ["wall", "door_0", "wall", "door_1", "door_0", "wall", "door_0"],
    ms: 3600,
    sound: "joke"
  },
  bagua: {
    frames: ["wall", "zhen", "dui", "kan", "door_0", "door_1", "wall"],
    ms: 3400,
    sound: "soft"
  },
  needle: {
    frames: ["bronze", "needle", "bronze", "needle", "bronze", "needle"],
    ms: 3200,
    sound: "needle"
  },
  wuxing: {
    frames: ["tiles", "wood", "earth", "water", "fire", "tiles"],
    ms: 3400,
    sound: "soft"
  },
  sword: {
    frames: ["screen", "blade", "screen", "door_0", "door_1", "screen"],
    ms: 3600,
    sound: "soft"
  },
  letter: {
    frames: ["letter", "scroll", "letter", "scroll", "letter"],
    ms: 2800,
    sound: "wood"
  },
  chain: {
    frames: ["chains", "fx_ember", "chains", "elder", "chains"],
    ms: 3000,
    sound: "chain"
  },
  placePill: {
    frames: ["pill", "elder", "pill", "elder"],
    ms: 2600,
    sound: "soft"
  }
};

const ENDING_SKY = {
  wolf: "wolfSky",
  flee: "fleeSky",
  sever: "severSky",
  ember: "emberSky",
  buried: "buriedSky"
};

let reduced = false;
let clip = null;
let clipStarted = 0;
let holdUntil = 0;
let lastKey = "";
let lastLog = "";
let lastEnding = null;
let lastEndingPage = -1;
let soundHook = null;

export function setReducedMotion(on) {
  reduced = Boolean(on);
}

export function onAnimSound(fn) {
  soundHook = fn;
}

export function animBusy(now = performance.now()) {
  return holdUntil > now;
}

export function fuseFrame(remainingMs) {
  if (remainingMs == null) return "fuse";
  const t = Math.max(0, Math.min(1, remainingMs / FULL_MS));
  if (t > 0.66) return "fuse_0";
  if (t > 0.33) return "fuse_1";
  if (t > 0.08) return "fuse_2";
  return "fuse_3";
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
    if (state.page >= 2) {
      const sky = ENDING_SKY[state.ending];
      if (sky) play(sky, now);
    } else if (state.page === 1) {
      play(state.ending, now, { soft: true });
    }
  }
  if (!state.ending) {
    lastEnding = null;
    lastEndingPage = -1;
  }

  const log = state.log?.[0] ?? "";
  if (log !== lastLog) {
    if (log === "prologue.1") play("door", now);
    if (log === "cheat.joke") play("cheat", now);
    if (log === "clear.4.a") play("board", now);
    if (log === "clear.5.with.a") play("brew", now);
    if (log === "clear.5.none.a") play("brewNone", now);
    if (log === "bagua.success") play("bagua", now);
    if (log === "acupoint.success" || log === "needle.ready") play("needle", now);
    if (log === "wuxing.success") play("wuxing", now);
    if (log === "sword.success") play("sword", now);
    if (log === "letter.1") play("letter", now);
    if (log === "ending.freeChains") play("chain", now);
    if (log === "ending.placePill") play("placePill", now);
    if (log === "acupoint.step") soundHook?.("needle");
    if (log === "acupoint.fail") soundHook?.("needle");
    if (log === "brew.fail.qing" || log === "brew.fail.snow" || log === "brew.fail.ratio") soundHook?.("crack");
    if (log === "ko.success") soundHook?.("wood");
    lastLog = log;
  }

  lastKey = key;
}

function play(name, now, options = {}) {
  const def = CLIPS[name];
  if (!def) return;
  if (reduced) {
    clip = { name, frames: [def.frames[def.frames.length - 1]], ms: 0, shake: false };
    clipStarted = now;
    holdUntil = now;
    if (!options.soft) soundHook?.(def.sound);
    return;
  }
  const ms = options.soft ? Math.floor(def.ms * 0.55) : def.ms;
  const frames = options.soft ? def.frames.slice(-Math.max(3, Math.ceil(def.frames.length / 2))) : def.frames;
  clip = { name, frames, ms, shake: Boolean(def.shake) && !options.soft };
  clipStarted = now;
  holdUntil = now + ms;
  if (!options.soft) soundHook?.(def.sound);
}

export function stageView(state, now = performance.now()) {
  const mood = moodFor(state);
  let center = null;
  let row = null;

  if (clip && now < clipStarted + Math.max(clip.ms, 1)) {
    const span = Math.max(clip.ms, 1);
    const i = Math.min(clip.frames.length - 1, Math.floor(((now - clipStarted) / span) * clip.frames.length));
    center = clip.frames[i];
  } else if (clip && now >= clipStarted + clip.ms) {
    clip = null;
  }

  if (!center && state?.ending && state.page >= 2) {
    center = "sky";
    row = [];
  }

  const fuse = state?.phase === 7 && state.flags?.introDone && !state.ending
    ? fuseFrame(state.timer?.remainingMs)
    : null;

  return {
    center,
    row,
    mood,
    fuse,
    shake: Boolean(clip?.shake) && animBusy(now) ? 1 : 0,
    busy: animBusy(now)
  };
}

function moodFor(state) {
  if (!state?.ending) {
    if (state?.phase === 7 && state.flags?.introDone) return "ash";
    return null;
  }
  if (state.page >= 2) return "void";
  if (state.ending === "wolf") return "ember";
  if (state.ending === "flee") return "mist";
  if (state.ending === "sever") return "cool";
  if (state.ending === "ember") return "dawn";
  if (state.ending === "buried") return "void";
  return null;
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
}
