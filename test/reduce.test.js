import assert from "node:assert/strict";
import { test } from "node:test";
import { lines, sword, verses } from "../src/content.js";
import { endingLineId, resolveEnding } from "../src/endings.js";
import { initialState, reduce } from "../src/reduce.js";

const ALLOWED = new Set(["needle", "letter", "scale", "pill", "acid_smear", "blade"]);

function playTo(target, options = {}) {
  let state = initialState();
  const setAside = options.setAsideSnow ?? true;
  if (target < 2) return state;
  for (const token of ["zhen", "dui", "kan"]) {
    state = reduce(state, { type: "sequencePush", puzzleId: "bagua", token });
  }
  if (target < 3) return state;
  for (const token of ["shanzhong", "jiuwei", "qihai"]) {
    state = reduce(state, { type: "sequencePush", puzzleId: "acupoint", token });
  }
  if (target < 4) return state;
  for (const token of ["wood", "earth", "water", "fire"]) {
    state = reduce(state, { type: "sequencePush", puzzleId: "wuxing", token });
  }
  if (target < 5) return state;
  state = reduce(state, { type: "submit", puzzleId: "ko", choice: "ko" });
  if (target < 6) return state;
  state = reduce(state, {
    type: "submit",
    puzzleId: "brew",
    recipe: { hongre: 2, hanyin: 1, qingre: 0, xuelian: 0, setAsideSnow: setAside }
  });
  if (target < 7) return state;
  state = reduce(state, {
    type: "sequenceReorder",
    order: ["lineA", "lineB", "lineC", "lineD"]
  });
  state = reduce(state, { type: "submit", puzzleId: "sword" });
  return state;
}

function ready(options = {}) {
  return reduce(playTo(7, options), { type: "skipIntro" });
}

test("台詞每則最多四行，每行最多十八字", () => {
  for (const [id, rows] of Object.entries(lines)) {
    assert.ok(rows.length <= 4, id);
    for (const row of rows) assert.ok([...row].length <= 18, `${id}:${row}`);
  }
  for (const text of Object.values(verses)) assert.equal([...text].length, 7);
});

test("八卦多按一個離，序列清空，仍在第 1 關", () => {
  let state = reduce(initialState(), { type: "sequencePush", puzzleId: "bagua", token: "zhen" });
  state = reduce(state, { type: "sequencePush", puzzleId: "bagua", token: "li" });
  assert.equal(state.phase, 1);
  assert.deepEqual(state.sequences.bagua, []);
  assert.deepEqual(state.inventory, []);
  assert.deepEqual(state.log, ["bagua.fail"]);
});

test("八卦正確三步後獲得銀針，進入第 2 關", () => {
  const state = playTo(2);
  assert.equal(state.phase, 2);
  assert.ok(state.inventory.includes("needle"));
  assert.deepEqual(state.log, ["bagua.success"]);
});

test("沒有針時點穴位，停在第 2 關", () => {
  const bare = { ...playTo(2), inventory: [] };
  const state = reduce(bare, { type: "sequencePush", puzzleId: "acupoint", token: "shanzhong" });
  assert.equal(state.phase, 2);
  assert.deepEqual(state.sequences.acupoint, []);
  assert.deepEqual(state.log, ["acupoint.blocked"]);
});

test("五行踩到金，序列清空", () => {
  let state = playTo(3);
  state = reduce(state, { type: "sequencePush", puzzleId: "wuxing", token: "wood" });
  state = reduce(state, { type: "sequencePush", puzzleId: "wuxing", token: "metal" });
  assert.equal(state.phase, 3);
  assert.deepEqual(state.sequences.wuxing, []);
  assert.deepEqual(state.log, ["wuxing.fail"]);
});

test("四選一選倒撲不發道具，選劫才同時得到信和秤", () => {
  const wrong = reduce(playTo(4), { type: "submit", puzzleId: "ko", choice: "snapback" });
  assert.equal(wrong.phase, 4);
  assert.deepEqual(wrong.inventory, ["needle"]);
  const right = reduce(wrong, { type: "submit", puzzleId: "ko", choice: "ko" });
  assert.equal(right.phase, 5);
  assert.deepEqual(right.inventory, ["needle", "letter", "scale"]);
});

test("正確配方且雪蓮別置：有解毒丹，沒有腐鐵瓶，並進入第 6 關", () => {
  const state = playTo(6);
  assert.equal(state.phase, 6);
  assert.ok(state.inventory.includes("pill"));
  assert.equal(state.inventory.includes("acid_smear"), false);
  for (const id of state.inventory) assert.ok(ALLOWED.has(id), id);
  assert.equal(state.inventory.some((id) => /acid|vial|bottle/.test(id) && id !== "acid_smear"), false);
});

test("正確配方但雪蓮不別置：沒有解毒丹，仍進入第 6 關", () => {
  const state = playTo(6, { setAsideSnow: false });
  assert.equal(state.phase, 6);
  assert.equal(state.inventory.includes("pill"), false);
  assert.deepEqual(state.inventory, ["needle", "letter", "scale"]);
});

test("刮碗選否之後沒有餘膏，且不再詢問", () => {
  const state = reduce(playTo(6), { type: "offerAnswer", offer: "smear", answer: "no" });
  assert.equal(state.inventory.includes("acid_smear"), false);
  assert.equal(state.flags.smearOffered, true);
  const again = reduce(state, { type: "offerAnswer", offer: "smear", answer: "yes" });
  assert.equal(again, state);
});

test("劍訣錯序不開門；對序進入第 7 關且倒數尚未跑", () => {
  const wrong = reduce(playTo(6), { type: "submit", puzzleId: "sword" });
  assert.equal(wrong.phase, 6);
  assert.equal(wrong.timer, null);
  assert.deepEqual(wrong.sequences.sword, sword.initial);

  const shuffled = reduce(wrong, {
    type: "sequenceReorder",
    order: ["lineD", "lineC", "lineB", "lineA"]
  });
  const reset = reduce(shuffled, { type: "submit", puzzleId: "sword" });
  assert.equal(reset.phase, 6);
  assert.deepEqual(reset.sequences.sword, sword.initial);

  const ordered = reduce(reset, {
    type: "sequenceReorder",
    order: ["lineA", "lineB", "lineC", "lineD"]
  });
  const opened = reduce(ordered, { type: "submit", puzzleId: "sword" });
  assert.equal(opened.phase, 7);
  assert.equal(opened.timer.running, false);
  assert.equal(opened.timer.remainingMs, 60000);
  assert.equal(opened.flags.introDone, false);
});

test("開場前連續 tick 不扣時，開場後才扣", () => {
  let state = playTo(7);
  for (let i = 0; i < 1000; i += 1) state = reduce(state, { type: "tick", ms: 1 });
  assert.equal(state.timer.remainingMs, 60000);
  assert.equal(state.ending, null);

  state = reduce(state, { type: "skipIntro" });
  assert.equal(state.timer.running, true);
  for (let i = 0; i < 1000; i += 1) state = reduce(state, { type: "tick", ms: 1 });
  assert.equal(state.timer.remainingMs, 59000);
  assert.equal(state.ending, null);
});

test("讀信期間 tick 不扣時", () => {
  let state = ready();
  const before = state.timer.remainingMs;
  state = reduce(state, { type: "openLetter" });
  assert.equal(state.flags.letterRead, true);
  assert.equal(state.timer.pausedByLetter, true);
  assert.equal(state.timer.running, false);
  for (let i = 0; i < 1000; i += 1) state = reduce(state, { type: "tick", ms: 1 });
  assert.equal(state.timer.remainingMs, before);
  state = reduce(state, { type: "closeLetter" });
  state = reduce(state, { type: "tick", ms: 1 });
  assert.equal(state.timer.remainingMs, before - 1);
});

test("結局表：白虎、揮刀、青龍、放丹、解鏈、時間到", () => {
  const wolf = reduce(ready(), { type: "submit", puzzleId: "ending", choice: "baihu" });
  assert.equal(wolf.ending, "wolf");
  assert.equal(wolf.phase, "ending");

  const armed = reduce(ready(), { type: "offerAnswer", offer: "blade", answer: "yes" });
  const byBlade = reduce(armed, { type: "submit", puzzleId: "ending", choice: "blade" });
  assert.equal(byBlade.ending, "wolf");

  const unarmed = ready();
  const refused = reduce(unarmed, { type: "submit", puzzleId: "ending", choice: "blade" });
  assert.equal(refused, unarmed);

  const flee = reduce(ready({ setAsideSnow: false }), {
    type: "submit",
    puzzleId: "ending",
    choice: "qinglong"
  });
  assert.equal(flee.ending, "flee");

  let sever = ready();
  sever = reduce(sever, { type: "placePill" });
  assert.equal(sever.ending, null);
  assert.equal(sever.flags.pillPlaced, true);
  assert.equal(sever.inventory.includes("pill"), false);
  sever = reduce(sever, { type: "submit", puzzleId: "ending", choice: "qinglong" });
  assert.equal(sever.ending, "sever");

  let ember = reduce(playTo(6), { type: "offerAnswer", offer: "smear", answer: "yes" });
  ember = reduce(ember, { type: "sequenceReorder", order: ["lineA", "lineB", "lineC", "lineD"] });
  ember = reduce(ember, { type: "submit", puzzleId: "sword" });
  ember = reduce(ember, { type: "skipIntro" });
  ember = reduce(ember, { type: "freeChains" });
  assert.equal(ember.ending, null);
  assert.equal(ember.flags.chainsFreed, true);
  ember = reduce(ember, { type: "submit", puzzleId: "ending", choice: "qinglong" });
  assert.equal(ember.ending, "ember");

  let buried = ready();
  buried = reduce(buried, { type: "tick", ms: 60000 });
  assert.equal(buried.ending, "buried");
  assert.equal(buried.timer.remainingMs, 0);
});

test("鐵鏈已化開，再按白虎仍是孤狼飲血", () => {
  let state = reduce(playTo(6), { type: "offerAnswer", offer: "smear", answer: "yes" });
  state = reduce(state, { type: "sequenceReorder", order: ["lineA", "lineB", "lineC", "lineD"] });
  state = reduce(state, { type: "submit", puzzleId: "sword" });
  state = reduce(state, { type: "skipIntro" });
  state = reduce(state, { type: "freeChains" });
  state = reduce(state, { type: "submit", puzzleId: "ending", choice: "baihu" });
  assert.equal(state.ending, "wolf");
});

test("結局寫入後，再提交不會改結局", () => {
  const ended = reduce(ready(), { type: "submit", puzzleId: "ending", choice: "baihu" });
  const again = reduce(ended, { type: "submit", puzzleId: "ending", choice: "qinglong" });
  assert.equal(again, ended);
});

test("讀過信的孤狼飲血用另一句，結局代號不變", () => {
  let state = ready();
  state = reduce(state, { type: "openLetter" });
  state = reduce(state, { type: "closeLetter" });
  state = reduce(state, { type: "submit", puzzleId: "ending", choice: "baihu" });
  assert.equal(state.ending, "wolf");
  assert.deepEqual(state.log, ["ending.wolf.read"]);
  assert.equal(endingLineId("wolf", false), "ending.wolf.unread");
});

test("開場前按石頭沒有反應", () => {
  const state = playTo(7);
  const pressed = reduce(state, { type: "submit", puzzleId: "ending", choice: "baihu" });
  assert.equal(pressed, state);
});

test("分頁隱藏不會被合上信件重新打開", () => {
  let state = ready();
  state = reduce(state, { type: "conceal" });
  assert.equal(state.timer.pausedByHidden, true);
  assert.equal(state.timer.running, false);
  state = reduce(state, { type: "openLetter" });
  state = reduce(state, { type: "closeLetter" });
  assert.equal(state.timer.pausedByLetter, false);
  assert.equal(state.timer.pausedByHidden, true);
  assert.equal(state.timer.running, false);
  const held = reduce(state, { type: "tick", ms: 1000 });
  assert.equal(held.timer.remainingMs, 60000);
  state = reduce(state, { type: "reveal" });
  assert.equal(state.timer.pausedByHidden, false);
  assert.equal(state.timer.running, true);
});

test("resolveEnding 與結局表一致", () => {
  const base = ready();
  assert.equal(resolveEnding(base, "baihu"), "wolf");
  assert.equal(resolveEnding(base, "blade"), null);
  assert.equal(resolveEnding(base, "qinglong"), "flee");
  const armed = { ...base, inventory: [...base.inventory, "blade"] };
  assert.equal(resolveEnding(armed, "blade"), "wolf");
  const placed = { ...base, flags: { ...base.flags, pillPlaced: true } };
  assert.equal(resolveEnding(placed, "qinglong"), "sever");
  const freed = { ...base, flags: { ...base.flags, chainsFreed: true, pillPlaced: true } };
  assert.equal(resolveEnding(freed, "qinglong"), "ember");
  assert.equal(resolveEnding(freed, "baihu"), "wolf");
});
