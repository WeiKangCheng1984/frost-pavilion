import assert from "node:assert/strict";
import { test } from "node:test";
import { initialState, reduce } from "../src/reduce.js";
import { loadSave, SAVE_KEY, writeSave } from "../src/save.js";

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

function solve(state) {
  if (state.phase === 1) {
    for (const token of ["zhen", "dui", "kan"]) state = reduce(state, { type: "sequencePush", puzzleId: "bagua", token });
  } else if (state.phase === 2) {
    state = reduce(state, { type: "useItem", itemId: "needle" });
    for (const token of ["qihai", "shanzhong", "jiuwei"]) state = reduce(state, { type: "sequencePush", puzzleId: "acupoint", token });
  } else if (state.phase === 3) {
    for (const token of ["wood", "earth", "water", "fire"]) state = reduce(state, { type: "sequencePush", puzzleId: "wuxing", token });
  } else if (state.phase === 4) {
    for (const token of ["take", "retake", "elsewhere", "fill"]) state = reduce(state, { type: "sequencePush", puzzleId: "ko", token });
  } else if (state.phase === 5) {
    state = reduce(state, { type: "useItem", itemId: "scale" });
    state = reduce(state, { type: "submit", puzzleId: "brew", recipe: { hongre: 2, hanyin: 1, qingre: 0, xuelian: 0, setAsideSnow: false } });
  } else if (state.phase === 6) {
    state = reduce(state, { type: "sequenceReorder", order: ["lineA", "lineB", "lineC", "lineD"] });
    state = reduce(state, { type: "submit", puzzleId: "sword" });
  }
  return state;
}

function reachPhase3() {
  let state = initialState();
  for (let i = 0; i < 80 && !(state.phase === 3 && state.beat === "play"); i += 1) {
    if (state.beat === "play") state = solve(state);
    else state = reduce(state, { type: "advance" });
  }
  return reduce(state, { type: "sequencePush", puzzleId: "wuxing", token: "wood" });
}

function reachEnding() {
  let state = initialState();
  for (let i = 0; i < 80 && !(state.phase === 7 && state.beat === "play"); i += 1) {
    if (state.beat === "offer") {
      state = reduce(state, { type: "offerAnswer", offer: state.phase === 5 ? "smear" : "blade", answer: "no" });
    } else if (state.beat === "play") state = solve(state);
    else state = reduce(state, { type: "advance" });
  }
  return reduce(state, { type: "submit", puzzleId: "ending", choice: "baihu" });
}

test("第 3 關中途寫入後可以原樣讀回", () => {
  const storage = memory();
  const state = reachPhase3();
  writeSave(state, storage);
  assert.deepEqual(loadSave(storage), state);
  assert.equal(loadSave(storage).phase, 3);
  assert.deepEqual(loadSave(storage).sequences.wuxing, ["wood"]);
});

test("結局會留在存檔裡", () => {
  const storage = memory();
  const state = reachEnding();
  writeSave(state, storage);
  const loaded = loadSave(storage);
  assert.equal(loaded.ending, "wolf");
  assert.equal(loaded.phase, "ending");
});

test("schemaVersion 不符就丟棄", () => {
  const storage = memory();
  storage.setItem(SAVE_KEY, JSON.stringify({ schemaVersion: 1, phase: 3 }));
  assert.equal(loadSave(storage), null);
  assert.equal(storage.getItem(SAVE_KEY), null);
});

test("壞掉的 JSON 也丟棄", () => {
  const storage = memory();
  storage.setItem(SAVE_KEY, "{");
  assert.equal(loadSave(storage), null);
  assert.equal(storage.getItem(SAVE_KEY), null);
});
