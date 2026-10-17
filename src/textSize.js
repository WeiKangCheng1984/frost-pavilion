import { applyScale } from "./scale.js";

const KEY = "frost-text-size";
const SIZES = new Set(["s", "m", "l"]);

export function mountTextSize() {
  const saved = readSize();
  applySize(saved);
  for (const button of document.querySelectorAll(".text-size-btn")) {
    button.addEventListener("click", () => {
      const size = button.dataset.textSize;
      if (!SIZES.has(size)) return;
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
