import { endingNames, items } from "./content.js";

export const SAVE_KEY = "frost-pavilion";

const VERSION = 4;
const ITEM_IDS = new Set(Object.keys(items));
const ENDINGS = new Set(Object.keys(endingNames));
const SWORD_IDS = ["lineA", "lineB", "lineC", "lineD"];
const FLAG_KEYS = ["letterRead", "smearOffered", "pillPlaced", "chainsFreed", "introDone", "bladeOffered", "letterOpen", "needleReady", "scaleReady"];
const BEATS = new Set(["prologue", "enter", "play", "clear", "offer", "ending"]);

export function loadSave(storage) {
  let raw;
  try {
    raw = storage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    discard(storage);
    return null;
  }
  if (!validState(data)) {
    discard(storage);
    return null;
  }
  return data;
}

export function writeSave(state, storage) {
  storage.setItem(SAVE_KEY, JSON.stringify(state));
}

function discard(storage) {
  try {
    storage.removeItem(SAVE_KEY);
  } catch {
    // 壞檔刪不掉時，下次仍會因版本或形狀不合而重開。
  }
}

function validState(data) {
  if (!data || typeof data !== "object") return false;
  if (data.schemaVersion !== VERSION) return false;
  if (data.phase === "ending") {
    if (!ENDINGS.has(data.ending)) return false;
  } else if (!Number.isInteger(data.phase) || data.phase < 1 || data.phase > 7 || data.ending != null) {
    return false;
  }
  if (!Array.isArray(data.inventory)) return false;
  if (new Set(data.inventory).size !== data.inventory.length) return false;
  if (data.inventory.some((id) => !ITEM_IDS.has(id))) return false;
  if (!BEATS.has(data.beat)) return false;
  if (!Number.isInteger(data.page) || data.page < 0) return false;
  if (data.phase === "ending" && data.page > 2) return false;
  if (!data.flags || FLAG_KEYS.some((key) => typeof data.flags[key] !== "boolean")) return false;
  if (!validSequences(data.sequences)) return false;
  if (!validTimer(data.timer, data.phase)) return false;
  if (!Array.isArray(data.log) || data.log.length > 4) return false;
  if (data.log.some((id) => typeof id !== "string")) return false;
  return true;
}

function validSequences(sequences) {
  if (!sequences) return false;
  for (const key of ["bagua", "acupoint", "wuxing", "ko"]) {
    const list = sequences[key];
    if (!Array.isArray(list) || list.some((token) => typeof token !== "string")) return false;
  }
  const sword = sequences.sword;
  if (!Array.isArray(sword) || sword.length !== SWORD_IDS.length) return false;
  return SWORD_IDS.every((id) => sword.includes(id));
}

function validTimer(timer, phase) {
  if (phase !== 7 && phase !== "ending") return timer == null;
  if (phase === 7 && (timer == null || typeof timer !== "object")) return false;
  if (timer == null) return true;
  if (typeof timer.remainingMs !== "number" || !Number.isFinite(timer.remainingMs) || timer.remainingMs < 0) return false;
  return typeof timer.running === "boolean"
    && typeof timer.pausedByLetter === "boolean"
    && typeof timer.pausedByHidden === "boolean";
}
