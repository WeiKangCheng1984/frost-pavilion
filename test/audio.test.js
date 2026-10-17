import assert from "node:assert/strict";
import { test } from "node:test";
import { drumAllowed, drumGap, MUTE_KEY, readMuted, writeMuted } from "../src/audio.js";

function memory() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    }
  };
}

const running = { ending: null, timer: { remainingMs: 60000, running: true, pausedByLetter: false, pausedByHidden: false } };

test("剩越少，鼓點越密", () => {
  assert.ok(drumGap(60000) > drumGap(30000));
  assert.ok(drumGap(30000) > drumGap(0));
});

test("沒點過、靜音、讀信或分頁隱藏時不打鼓", () => {
  assert.equal(drumAllowed(running, { muted: false, unlocked: false }), false);
  assert.equal(drumAllowed(running, { muted: true, unlocked: true }), false);
  assert.equal(drumAllowed(
    { ending: null, timer: { ...running.timer, running: false, pausedByLetter: true } },
    { muted: false, unlocked: true }
  ), false);
  assert.equal(drumAllowed(
    { ending: null, timer: { ...running.timer, running: false, pausedByHidden: true } },
    { muted: false, unlocked: true }
  ), false);
  assert.equal(drumAllowed(running, { muted: false, unlocked: true }), true);
});

test("靜音寫在自己的鍵，預設不靜音", () => {
  const storage = memory();
  assert.equal(readMuted(storage), false);
  writeMuted(storage, true);
  assert.equal(storage.getItem(MUTE_KEY), "1");
  assert.equal(readMuted(storage), true);
  writeMuted(storage, false);
  assert.equal(readMuted(storage), false);
});
