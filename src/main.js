import { createAudio } from "./audio.js";
import { initialState, reduce } from "./reduce.js";
import { applyScale, mountScale } from "./scale.js";
import { loadSave, writeSave } from "./save.js";
import { paintMute, render } from "./view.js";

const FRAME_CAP = 250;

const audio = createAudio();
let state = loadSave(sessionStorage) ?? initialState();
let lastFrame = 0;

function send(action) {
  const next = reduce(state, action);
  if (next === state) return;
  state = next;
  try {
    writeSave(state, sessionStorage);
  } catch {
    // 這一頁寫不進時，遊玩仍繼續，重新整理才會回到第 1 關。
  }
  render(state, send);
  audio.sync(state);
  applyScale();
}

function armAudio() {
  audio.unlock();
  audio.sync(state);
}

document.querySelector("#mute").addEventListener("click", () => {
  audio.toggle();
  paintMute(audio.muted);
  audio.sync(state);
});

document.addEventListener("pointerdown", armAudio, { capture: true });
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") armAudio();
}, { capture: true });

document.addEventListener("visibilitychange", () => {
  lastFrame = 0;
  send({ type: document.hidden ? "conceal" : "reveal" });
});

function frame(now) {
  if (!document.hidden && state.timer?.running) {
    const delta = lastFrame === 0 ? 0 : Math.min(FRAME_CAP, now - lastFrame);
    if (delta > 0) send({ type: "tick", ms: delta });
  }
  audio.sync(state, now);
  lastFrame = now;
  window.requestAnimationFrame(frame);
}

paintMute(audio.muted);
render(state, send);
mountScale();
window.requestAnimationFrame(frame);
