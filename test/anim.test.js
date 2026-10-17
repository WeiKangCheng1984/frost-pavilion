import assert from "node:assert/strict";
import { test } from "node:test";
import { animBusy, ashLevel, fuseFrame, resetAnim, setReducedMotion, stageView, syncAnim } from "../src/anim.js";
import { FRAME_NAMES } from "../src/sprite-frames.js";

test("香進度四格隨剩餘時間切換", () => {
  assert.equal(fuseFrame(60000), "fuse_0");
  assert.equal(fuseFrame(50000), "fuse_0");
  assert.equal(fuseFrame(30000), "fuse_1");
  assert.equal(fuseFrame(12000), "fuse_2");
  assert.equal(fuseFrame(1000), "fuse_3");
});

test("香越少畫面越沉", () => {
  assert.ok(ashLevel(60000) < ashLevel(20000));
  assert.ok(ashLevel(20000) < ashLevel(3000));
});

test("結局進場是起轉收分鏡，會擋操作數秒", () => {
  resetAnim();
  setReducedMotion(false);
  const now = 1000;
  syncAnim({
    beat: "ending",
    phase: "ending",
    ending: "wolf",
    page: 0,
    flags: {},
    log: ["ending.wolf.unread.a"],
    timer: null
  }, now);
  assert.equal(animBusy(now + 100), true);
  const mid = stageView({
    beat: "ending",
    phase: "ending",
    ending: "wolf",
    page: 0,
    flags: {},
    log: ["ending.wolf.unread.a"]
  }, now + 1200);
  assert.ok(FRAME_NAMES.includes(mid.center));
  assert.equal(mid.mood, "ember");
  assert.equal(animBusy(now + 4500), false);
});

test("調查會播窺閣鏡頭", () => {
  resetAnim();
  setReducedMotion(false);
  const now = 2000;
  syncAnim({
    beat: "play",
    phase: 1,
    ending: null,
    page: 0,
    flags: {},
    log: ["compass.inspect"],
    timer: null
  }, now);
  assert.equal(animBusy(now + 100), true);
  const view = stageView({
    beat: "play",
    phase: 1,
    ending: null,
    page: 0,
    flags: {},
    log: ["compass.inspect"]
  }, now + 800);
  assert.ok(view.center === "compass" || view.center === "wall");
});

test("換關進關會連播過廊與進關", () => {
  resetAnim();
  setReducedMotion(false);
  const now = 3000;
  syncAnim({
    beat: "play",
    phase: 1,
    ending: null,
    page: 0,
    flags: {},
    log: ["bagua.success"],
    timer: null
  }, now);
  syncAnim({
    beat: "enter",
    phase: 2,
    ending: null,
    page: 0,
    flags: {},
    log: ["enter.2.a"],
    timer: null
  }, now + 4000);
  assert.equal(animBusy(now + 4100), true);
  const early = stageView({
    beat: "enter",
    phase: 2,
    ending: null,
    page: 0,
    flags: {},
    log: ["enter.2.a"]
  }, now + 4200);
  assert.ok(["door_0", "door_2", "door_3", "wall", "bronze"].includes(early.center));
});

test("結局中頁定格不重播大火，空鏡頁再收", () => {
  resetAnim();
  setReducedMotion(false);
  const now = 1000;
  syncAnim({
    beat: "ending",
    phase: "ending",
    ending: "flee",
    page: 0,
    flags: {},
    log: ["ending.flee.a"],
    timer: null
  }, now);
  syncAnim({
    beat: "ending",
    phase: "ending",
    ending: "flee",
    page: 1,
    flags: {},
    log: ["ending.flee.b"],
    timer: null
  }, now + 5000);
  const hold = stageView({
    beat: "ending",
    phase: "ending",
    ending: "flee",
    page: 1,
    flags: {},
    log: ["ending.flee.b"]
  }, now + 5100);
  assert.equal(hold.center, "qinglong");

  syncAnim({
    beat: "ending",
    phase: "ending",
    ending: "flee",
    page: 2,
    flags: {},
    log: ["ending.flee.c"],
    timer: null
  }, now + 7000);
  const sky = stageView({
    beat: "ending",
    phase: "ending",
    ending: "flee",
    page: 2,
    flags: {},
    log: ["ending.flee.c"]
  }, now + 7800);
  assert.ok(sky.center === "sky" || sky.center === "qinglong");
  assert.equal(sky.mood, "void");
});

test("減少動態時不擋操作", () => {
  resetAnim();
  setReducedMotion(true);
  const now = 5000;
  syncAnim({
    beat: "ending",
    phase: "ending",
    ending: "buried",
    page: 0,
    flags: {},
    log: ["ending.buried.a"],
    timer: { remainingMs: 0 }
  }, now);
  assert.equal(animBusy(now), false);
});

test("動畫影格都在精靈表裡", () => {
  const needed = [
    "door_0", "door_3", "fuse_0", "fuse_3", "fx_fire_0", "fx_gate_1",
    "fx_ruin_0", "fx_ember", "fx_pill", "board_open", "bowl_aside", "sky",
    "zhen", "dui", "kan", "needle", "bronze", "wood", "earth", "water", "fire",
    "screen", "blade", "letter", "scroll", "chains", "xuelian", "pill", "elder",
    "baihu", "qinglong", "scale", "compass", "poem", "brick", "shelf", "metal",
    "hongre", "hanyin", "qingre", "smear", "bowl"
  ];
  for (const name of needed) assert.ok(FRAME_NAMES.includes(name), name);
});
