/** 呈現層動畫。不改謎題答案，只決定畫面與短暫擋操作。 */

const FULL_MS = 60000;

const CLIPS = {
  door: { frames: ["door_0", "door_1", "door_2", "door_3"], ms: 2200, sound: "door" },
  wolf: { frames: ["fx_fire_0", "fx_fire_1", "fx_fire_0", "baihu"], ms: 2600, sound: "fire" },
  flee: { frames: ["fx_gate_0", "fx_gate_1", "qinglong"], ms: 2400, sound: "gate" },
  sever: { frames: ["fx_pill", "pill", "elder"], ms: 2200, sound: "soft" },
  ember: { frames: ["fx_ember", "elder", "qinglong"], ms: 2600, sound: "chain" },
  buried: { frames: ["fuse_3", "fx_ruin_0", "fx_ruin_1"], ms: 2800, sound: "ruin" },
  board: { frames: ["board", "board_open", "letter"], ms: 2000, sound: "wood" },
  brew: { frames: ["bowl_aside", "pill", "bowl"], ms: 2000, sound: "soft" },
  brewNone: { frames: ["bowl", "bowl"], ms: 1600, sound: "crack" },
  cheat: { frames: ["wall", "door_0", "wall"], ms: 1800, sound: "joke" }
};

let reduced = false;
let clip = null;
let clipStarted = 0;
let holdUntil = 0;
let lastKey = "";
let lastLog = "";
let lastEnding = null;
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
    play(state.ending, now);
  }
  if (!state.ending) lastEnding = null;

  const log = state.log?.[0] ?? "";
  if (log !== lastLog) {
    if (log === "prologue.1") play("door", now);
    if (log === "cheat.joke") play("cheat", now);
    if (log === "clear.4.a") play("board", now);
    if (log === "clear.5.with.a") play("brew", now);
    if (log === "clear.5.none.a") play("brewNone", now);
    if (log === "acupoint.step" || log === "needle.ready") soundHook?.("needle");
    if (log === "acupoint.fail") soundHook?.("needle");
    if (log === "brew.fail.qing" || log === "brew.fail.snow" || log === "brew.fail.ratio") soundHook?.("crack");
    if (log === "ending.freeChains") soundHook?.("chain");
    if (log === "bagua.success" || log === "wuxing.success" || log === "sword.success") soundHook?.("soft");
    lastLog = log;
  }

  lastKey = key;
}

function play(name, now) {
  const def = CLIPS[name];
  if (!def) return;
  if (reduced) {
    clip = { name, frames: [def.frames[def.frames.length - 1]], ms: 0 };
    clipStarted = now;
    holdUntil = now;
    soundHook?.(def.sound);
    return;
  }
  clip = { name, frames: def.frames, ms: def.ms };
  clipStarted = now;
  holdUntil = now + def.ms;
  soundHook?.(def.sound);
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
    shake: clip && (clip.name === "wolf" || clip.name === "buried") && animBusy(now) ? 1 : 0,
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
}
