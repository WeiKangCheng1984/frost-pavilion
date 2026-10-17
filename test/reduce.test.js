import assert from "node:assert/strict";
import { test } from "node:test";
import { sword, verses } from "../src/content.js";
import { endingLineId, endingPageIds, resolveEnding } from "../src/endings.js";
import { initialState, reduce } from "../src/reduce.js";

const ALLOWED = new Set(["needle", "letter", "scale", "pill", "acid_smear", "blade"]);

function solve(state, options = {}) {
  if (state.phase === 1) {
    for (const token of ["zhen", "dui", "kan"]) {
      state = reduce(state, { type: "sequencePush", puzzleId: "bagua", token });
    }
  } else if (state.phase === 2) {
    state = reduce(state, { type: "useItem", itemId: "needle" });
    for (const token of ["qihai", "shanzhong", "jiuwei"]) {
      state = reduce(state, { type: "sequencePush", puzzleId: "acupoint", token });
    }
  } else if (state.phase === 3) {
    for (const token of ["wood", "earth", "water", "fire"]) {
      state = reduce(state, { type: "sequencePush", puzzleId: "wuxing", token });
    }
  } else if (state.phase === 4) {
    for (const token of ["take", "retake", "elsewhere", "fill"]) {
      state = reduce(state, { type: "sequencePush", puzzleId: "ko", token });
    }
  } else if (state.phase === 5) {
    state = reduce(state, { type: "useItem", itemId: "scale" });
    state = reduce(state, {
      type: "submit",
      puzzleId: "brew",
      recipe: { hongre: 2, hanyin: 1, qingre: 0, xuelian: 0, setAsideSnow: options.setAsideSnow ?? true }
    });
  } else if (state.phase === 6) {
    state = reduce(state, { type: "sequenceReorder", order: ["lineA", "lineB", "lineC", "lineD"] });
    state = reduce(state, { type: "submit", puzzleId: "sword" });
  }
  return state;
}

function playing(phase, options = {}) {
  let state = initialState();
  for (let i = 0; i < 160 && !(state.phase === phase && state.beat === "play"); i += 1) {
    if (state.beat === "offer") {
      const offer = state.phase === 5 ? "smear" : "blade";
      const answer = offer === "smear" ? (options.smear ?? "no") : (options.blade ?? "no");
      state = reduce(state, { type: "offerAnswer", offer, answer });
    } else if (state.beat === "play") {
      state = solve(state, options);
    } else {
      const next = reduce(state, { type: "advance" });
      if (next === state) break;
      state = next;
    }
  }
  return state;
}

function ready(options = {}) {
  return playing(7, options);
}

test("劍訣每句七字", () => {
  for (const text of Object.values(verses)) assert.equal([...text].length, 7);
});

test("開場時點卦沒有反應", () => {
  const start = initialState();
  const state = reduce(start, { type: "sequencePush", puzzleId: "bagua", token: "zhen" });
  assert.equal(state, start);
  assert.equal(state.beat, "prologue");
});

test("八卦多按一個離，序列清空，仍在第 1 關", () => {
  let state = playing(1);
  state = reduce(state, { type: "sequencePush", puzzleId: "bagua", token: "zhen" });
  state = reduce(state, { type: "sequencePush", puzzleId: "bagua", token: "li" });
  assert.equal(state.phase, 1);
  assert.deepEqual(state.sequences.bagua, []);
  assert.deepEqual(state.inventory, []);
  assert.deepEqual(state.log, ["bagua.fail"]);
});

test("八卦正確三步後獲得銀針，過關文案確認後才進第 2 關", () => {
  const state = solve(playing(1));
  assert.equal(state.phase, 1);
  assert.equal(state.beat, "clear");
  assert.ok(state.inventory.includes("needle"));
  assert.deepEqual(state.log, ["clear.1.a"]);
  const entered = playing(2);
  assert.equal(entered.phase, 2);
  assert.equal(entered.beat, "play");
});

test("沒有針時點穴位，停在第 2 關", () => {
  const bare = { ...playing(2), inventory: [] };
  const state = reduce(bare, { type: "sequencePush", puzzleId: "acupoint", token: "shanzhong" });
  assert.equal(state.phase, 2);
  assert.deepEqual(state.sequences.acupoint, []);
  assert.deepEqual(state.log, ["acupoint.blocked"]);
});

test("五行踩到金，序列清空", () => {
  let state = playing(3);
  state = reduce(state, { type: "sequencePush", puzzleId: "wuxing", token: "wood" });
  state = reduce(state, { type: "sequencePush", puzzleId: "wuxing", token: "metal" });
  assert.equal(state.phase, 3);
  assert.deepEqual(state.sequences.wuxing, []);
  assert.deepEqual(state.log, ["wuxing.fail"]);
});

test("棋盤走錯清空，四手走完才同時得到信和秤", () => {
  const wrong = reduce(playing(4), { type: "sequencePush", puzzleId: "ko", token: "fill" });
  assert.equal(wrong.phase, 4);
  assert.deepEqual(wrong.sequences.ko, []);
  assert.deepEqual(wrong.inventory, ["needle"]);
  assert.deepEqual(wrong.log, ["ko.fail"]);
  const right = solve(wrong);
  assert.equal(right.phase, 4);
  assert.equal(right.beat, "clear");
  assert.deepEqual(right.inventory, ["needle", "letter", "scale"]);
});

test("正確配方且雪蓮別置：有解毒丹，沒有腐鐵瓶，關卡先停在過關", () => {
  const state = solve(playing(5));
  assert.equal(state.phase, 5);
  assert.equal(state.beat, "clear");
  assert.deepEqual(state.log, ["clear.5.with.a"]);
  assert.ok(state.inventory.includes("pill"));
  assert.equal(state.inventory.includes("acid_smear"), false);
  for (const id of state.inventory) assert.ok(ALLOWED.has(id), id);
  assert.equal(state.inventory.some((id) => /acid|vial|bottle/.test(id) && id !== "acid_smear"), false);
});

test("正確配方但雪蓮不別置：沒有解毒丹，回答刮碗後仍進入第 6 關", () => {
  const state = playing(6, { setAsideSnow: false });
  assert.equal(state.phase, 6);
  assert.equal(state.beat, "play");
  assert.equal(state.inventory.includes("pill"), false);
  assert.deepEqual(state.inventory, ["needle", "letter", "scale"]);
});

test("刮碗選否之後沒有餘膏，且不再詢問", () => {
  let state = solve(playing(5));
  while (state.beat !== "offer") state = reduce(state, { type: "advance" });
  state = reduce(state, { type: "offerAnswer", offer: "smear", answer: "no" });
  assert.equal(state.phase, 6);
  assert.equal(state.inventory.includes("acid_smear"), false);
  assert.equal(state.flags.smearOffered, true);
  const again = reduce(state, { type: "offerAnswer", offer: "smear", answer: "yes" });
  assert.equal(again, state);
});

test("劍訣錯序不開門；對序先過關，短刃問完才進第 7 關", () => {
  const wrong = reduce(playing(6), { type: "submit", puzzleId: "sword" });
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
  assert.equal(opened.phase, 6);
  assert.equal(opened.beat, "clear");
  assert.equal(opened.timer, null);

  let asked = opened;
  while (asked.beat !== "offer") asked = reduce(asked, { type: "advance" });
  const entered = reduce(asked, { type: "offerAnswer", offer: "blade", answer: "no" });
  assert.equal(entered.phase, 7);
  assert.equal(entered.beat, "enter");
  assert.equal(entered.timer.running, false);
  assert.equal(entered.timer.remainingMs, 60000);
  assert.equal(entered.flags.introDone, false);
});

test("開場前連續 tick 不扣時，開場後才扣", () => {
  let state = playing(6);
  state = solve(state);
  while (state.beat !== "offer") state = reduce(state, { type: "advance" });
  state = reduce(state, { type: "offerAnswer", offer: "blade", answer: "no" });
  for (let i = 0; i < 1000; i += 1) state = reduce(state, { type: "tick", ms: 1 });
  assert.equal(state.timer.remainingMs, 60000);
  assert.equal(state.ending, null);

  while (!state.flags.introDone) state = reduce(state, { type: "advance" });
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

  const armed = ready({ blade: "yes" });
  const byBlade = reduce(armed, { type: "useItem", itemId: "blade" });
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
  sever = reduce(sever, { type: "useItem", itemId: "pill" });
  assert.equal(sever.ending, null);
  assert.equal(sever.flags.pillPlaced, true);
  assert.equal(sever.inventory.includes("pill"), false);
  sever = reduce(sever, { type: "submit", puzzleId: "ending", choice: "qinglong" });
  assert.equal(sever.ending, "sever");

  let ember = ready({ smear: "yes" });
  ember = reduce(ember, { type: "useItem", itemId: "acid_smear" });
  assert.equal(ember.ending, null);
  assert.equal(ember.flags.chainsFreed, true);
  ember = reduce(ember, { type: "submit", puzzleId: "ending", choice: "qinglong" });
  assert.equal(ember.ending, "ember");

  let buried = ready();
  buried = reduce(buried, { type: "tick", ms: 60000 });
  assert.equal(buried.ending, "buried");
  assert.equal(buried.timer.remainingMs, 0);
});

test("有針但沒使用，銅孔不開；由上往下會失敗", () => {
  let state = playing(2);
  const sheathed = reduce(state, { type: "sequencePush", puzzleId: "acupoint", token: "qihai" });
  assert.deepEqual(sheathed.log, ["acupoint.sheathed"]);
  assert.equal(sheathed.flags.needleReady, false);
  state = reduce(state, { type: "useItem", itemId: "needle" });
  assert.equal(state.flags.needleReady, true);
  const down = reduce(state, { type: "sequencePush", puzzleId: "acupoint", token: "shanzhong" });
  assert.deepEqual(down.sequences.acupoint, []);
  assert.deepEqual(down.log, ["acupoint.fail"]);
  const opened = solve(state);
  assert.equal(opened.beat, "clear");
  assert.deepEqual(opened.sequences.acupoint, ["qihai", "shanzhong", "jiuwei"]);
});

test("沒選道具就使用，只得到一句提醒", () => {
  const state = reduce(playing(1), { type: "useItem", itemId: null });
  assert.deepEqual(state.log, ["use.none"]);
  assert.equal(state.phase, 1);
});

test("藥架沒使用秤不能配，配錯一次只說一個原因", () => {
  const state = playing(5);
  const early = reduce(state, {
    type: "submit",
    puzzleId: "brew",
    recipe: { hongre: 2, hanyin: 1, qingre: 0, xuelian: 0, setAsideSnow: true }
  });
  assert.deepEqual(early.log, ["brew.fail.scale"]);
  assert.equal(early.beat, "play");
  const weighed = reduce(state, { type: "useItem", itemId: "scale" });
  assert.equal(weighed.flags.scaleReady, true);
  const qing = reduce(weighed, {
    type: "submit",
    puzzleId: "brew",
    recipe: { hongre: 2, hanyin: 1, qingre: 2, xuelian: 2, setAsideSnow: true }
  });
  assert.deepEqual(qing.log, ["brew.fail.qing"]);
  const snow = reduce(weighed, {
    type: "submit",
    puzzleId: "brew",
    recipe: { hongre: 2, hanyin: 1, qingre: 0, xuelian: 1, setAsideSnow: true }
  });
  assert.deepEqual(snow.log, ["brew.fail.snow"]);
  const ratio = reduce(weighed, {
    type: "submit",
    puzzleId: "brew",
    recipe: { hongre: 0, hanyin: 0, qingre: 0, xuelian: 0, setAsideSnow: true }
  });
  assert.deepEqual(ratio.log, ["brew.fail.ratio"]);
});

test("雪蓮不別置的過關文案說掌心沒有丹", () => {
  const state = solve(playing(5), { setAsideSnow: false });
  assert.equal(state.inventory.includes("pill"), false);
  assert.deepEqual(state.log, ["clear.5.none.a"]);
});

test("鐵鏈已化開，再按白虎仍是孤狼飲血", () => {
  let state = ready({ smear: "yes" });
  state = reduce(state, { type: "useItem", itemId: "acid_smear" });
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
  assert.deepEqual(state.log, ["ending.wolf.read.a"]);
  assert.equal(endingLineId("wolf", false), "ending.wolf.unread.a");
});

test("開場前按石頭沒有反應", () => {
  let state = playing(6);
  state = solve(state);
  while (state.beat !== "offer") state = reduce(state, { type: "advance" });
  state = reduce(state, { type: "offerAnswer", offer: "blade", answer: "no" });
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

test("開場可上一段，不動關卡", () => {
  let state = initialState();
  state = reduce(state, { type: "advance" });
  assert.equal(state.page, 1);
  state = reduce(state, { type: "retreat" });
  assert.equal(state.page, 0);
  assert.equal(state.beat, "prologue");
  assert.deepEqual(state.log, ["prologue.1"]);
});

test("結局三頁與 flee 袖裡有丹修飾", () => {
  const pages = endingPageIds("flee", {
    flags: { letterRead: false },
    inventory: ["pill"]
  });
  assert.deepEqual(pages, ["ending.flee.a", "ending.flee.b.pill", "ending.flee.c"]);
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
