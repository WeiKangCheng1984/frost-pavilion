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

function reachPhase3() {
  let state = initialState();
  for (const token of ["zhen", "dui", "kan"]) {
    state = reduce(state, { type: "sequencePush", puzzleId: "bagua", token });
  }
  for (const token of ["shanzhong", "jiuwei", "qihai"]) {
    state = reduce(state, { type: "sequencePush", puzzleId: "acupoint", token });
  }
  state = reduce(state, { type: "sequencePush", puzzleId: "wuxing", token: "wood" });
  return state;
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
  let state = reachPhase3();
  for (const token of ["earth", "water", "fire"]) {
    state = reduce(state, { type: "sequencePush", puzzleId: "wuxing", token });
  }
  state = reduce(state, { type: "submit", puzzleId: "ko", choice: "ko" });
  state = reduce(state, {
    type: "submit",
    puzzleId: "brew",
    recipe: { hongre: 2, hanyin: 1, qingre: 0, xuelian: 0, setAsideSnow: false }
  });
  state = reduce(state, { type: "offerAnswer", offer: "smear", answer: "no" });
  state = reduce(state, { type: "sequenceReorder", order: ["lineA", "lineB", "lineC", "lineD"] });
  state = reduce(state, { type: "submit", puzzleId: "sword" });
  state = reduce(state, { type: "offerAnswer", offer: "blade", answer: "no" });
  state = reduce(state, { type: "skipIntro" });
  state = reduce(state, { type: "submit", puzzleId: "ending", choice: "baihu" });
  writeSave(state, storage);
  const loaded = loadSave(storage);
  assert.equal(loaded.ending, "wolf");
  assert.equal(loaded.phase, "ending");
});

test("schemaVersion 不符就丟棄", () => {
  const storage = memory();
  storage.setItem(SAVE_KEY, JSON.stringify({ schemaVersion: 2, phase: 3 }));
  assert.equal(loadSave(storage), null);
  assert.equal(storage.getItem(SAVE_KEY), null);
});

test("壞掉的 JSON 也丟棄", () => {
  const storage = memory();
  storage.setItem(SAVE_KEY, "{");
  assert.equal(loadSave(storage), null);
  assert.equal(storage.getItem(SAVE_KEY), null);
});
