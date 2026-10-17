import { onAnimSound, setReducedMotion } from "./anim.js";
import { createAudio } from "./audio.js";
import { initialState, reduce } from "./reduce.js";
import { applyScale, mountScale } from "./scale.js";
import { mountTextSize } from "./textSize.js";
import { loadSave, writeSave } from "./save.js";
import { paintFrame, paintMute, render } from "./view.js";

const FRAME_CAP = 250;

const audio = createAudio();
const saved = loadSave(sessionStorage);
let state = saved ?? initialState();
let started = false;
let lastFrame = 0;
let nextTickSave = 0;

onAnimSound((name) => audio.playCue(name));
setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

function persist() {
  if (!started) return;
  try {
    writeSave(state, sessionStorage);
  } catch {
    // 這一頁寫不進時，遊玩仍繼續。
  }
}

function send(action) {
  if (!started && action.type !== "restart") return;
  const next = reduce(state, action);
  if (next === state) return;
  const prevEnding = state.ending;
  state = next;
  const tickOnly = action.type === "tick" && !state.ending;
  if (tickOnly) {
    if (performance.now() >= nextTickSave) {
      nextTickSave = performance.now() + 1000;
      persist();
    }
  } else {
    persist();
    render(state, send);
    applyScale();
    if (state.ending && !prevEnding) nextTickSave = 0;
  }
  audio.sync(state);
}

function armAudio() {
  audio.unlock();
  audio.sync(state);
}

function bindMute() {
  for (const button of document.querySelectorAll("[data-mute]")) {
    button.addEventListener("click", () => {
      audio.toggle();
      paintMute(audio.muted);
      audio.sync(state);
    });
  }
}

function showResume() {
  const resume = document.querySelector("#boot-resume");
  if (!resume) return;
  const canResume = Boolean(saved)
    && !(saved.beat === "prologue" && saved.page === 0 && saved.phase === 1 && !saved.inventory?.length);
  resume.hidden = !canResume;
}

function enterGame(nextState) {
  state = nextState;
  started = true;
  document.querySelector("#boot").hidden = true;
  document.querySelector("#fit").hidden = false;
  persist();
  paintMute(audio.muted);
  render(state, send);
  applyScale();
  mountScale();
  mountTextSize(() => send({ type: "skipToFinale" }));
  audio.sync(state);
  lastFrame = 0;
}

document.querySelector("#boot-enter").addEventListener("click", () => {
  armAudio();
  enterGame(initialState());
});

document.querySelector("#boot-resume").addEventListener("click", () => {
  armAudio();
  enterGame(saved ?? initialState());
});

document.addEventListener("pointerdown", armAudio, { capture: true });
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") armAudio();
}, { capture: true });

document.addEventListener("visibilitychange", () => {
  lastFrame = 0;
  if (started) send({ type: document.hidden ? "conceal" : "reveal" });
});

function frame(now) {
  try {
    if (started && !document.hidden && state.timer?.running) {
      const delta = lastFrame === 0 ? 0 : Math.min(FRAME_CAP, now - lastFrame);
      if (delta > 0) send({ type: "tick", ms: delta });
    }
    if (started) {
      audio.sync(state, now);
      paintFrame(state, now);
    }
  } finally {
    lastFrame = now;
    window.requestAnimationFrame(frame);
  }
}

bindMute();
paintMute(audio.muted);
showResume();
window.requestAnimationFrame(frame);
