import assert from "node:assert/strict";
import { test } from "node:test";
import { createAudio, drumAllowed, drumGap, MUTE_KEY, readMuted, writeMuted } from "../src/audio.js";

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

test("倒數開始且音訊已解鎖時，sync 打鼓不丟例外", () => {
  class FakeParam {
    setValueAtTime() {}
    exponentialRampToValueAtTime() {}
  }
  class FakeNode {
    connect() {
      return this;
    }
    start() {}
    stop() {}
    frequency = new FakeParam();
    gain = new FakeParam();
  }
  class FakeBuffer {
    getChannelData() {
      return new Float32Array(8);
    }
  }
  class FakeAudioContext {
    state = "running";
    sampleRate = 44100;
    currentTime = 0;
    destination = new FakeNode();
    createOscillator() {
      return new FakeNode();
    }
    createGain() {
      return new FakeNode();
    }
    createBuffer() {
      return new FakeBuffer();
    }
    createBufferSource() {
      return new FakeNode();
    }
    resume() {
      return Promise.resolve();
    }
  }

  const previous = globalThis.AudioContext;
  const previousDocument = globalThis.document;
  globalThis.AudioContext = FakeAudioContext;
  globalThis.document = {
    documentElement: { dataset: {} }
  };
  try {
    const audio = createAudio(memory());
    audio.unlock();
    assert.doesNotThrow(() => audio.sync(running, 1));
    assert.doesNotThrow(() => audio.playCue("door"));
  } finally {
    globalThis.AudioContext = previous;
    globalThis.document = previousDocument;
  }
});
