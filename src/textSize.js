import { applyScale } from "./scale.js";

const KEY = "frost-text-size";
const SIZES = new Set(["s", "m", "l"]);
const CHEAT = ["l", "l", "l", "m", "m", "m", "s", "s", "s"];

export function nextCheatStep(step, size) {
  const next = size === CHEAT[step] ? step + 1 : (size === CHEAT[0] ? 1 : 0);
  return { step: next === CHEAT.length ? 0 : next, fired: next === CHEAT.length };
}

export function mountTextSize(onCheat) {
  const saved = readSize();
  applySize(saved);
  let step = 0;
  for (const button of document.querySelectorAll(".text-size-btn")) {
    button.addEventListener("click", () => {
      const size = button.dataset.textSize;
      if (!SIZES.has(size)) return;
      const cheat = nextCheatStep(step, size);
      step = cheat.step;
      if (cheat.fired) onCheat?.();
      applySize(size);
      applyScale();
      try {
        localStorage.setItem(KEY, size);
      } catch {
        // 無本地儲存時仍套用當次字級。
      }
    });
  }
}

function readSize() {
  try {
    const size = localStorage.getItem(KEY);
    if (SIZES.has(size)) return size;
  } catch {
    // ignore
  }
  return "m";
}

function applySize(size) {
  document.documentElement.dataset.textSize = size;
  for (const button of document.querySelectorAll(".text-size-btn")) {
    const on = button.dataset.textSize === size;
    button.setAttribute("aria-pressed", String(on));
  }
}
