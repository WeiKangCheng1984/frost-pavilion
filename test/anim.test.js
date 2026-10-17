import assert from "node:assert/strict";
import { test } from "node:test";
import { animBusy, fuseFrame, resetAnim, setReducedMotion, stageView, syncAnim } from "../src/anim.js";
import { FRAME_NAMES } from "../src/sprite-frames.js";

test("香進度四格隨剩餘時間切換", () => {
  assert.equal(fuseFrame(60000), "fuse_0");
  assert.equal(fuseFrame(40000), "fuse_0");
  assert.equal(fuseFrame(30000), "fuse_1");
  assert.equal(fuseFrame(10000), "fuse_2");
  assert.equal(fuseFrame(1000), "fuse_3");
});

test("結局觸發時會擋操作約兩秒", () => {
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
  assert.equal(animBusy(now + 3000), false);
  const view = stageView({
    beat: "ending",
    phase: "ending",
    ending: "wolf",
    page: 0,
    flags: {},
    log: ["ending.wolf.unread.a"]
  }, now + 200);
  assert.ok(view.center);
  assert.ok(FRAME_NAMES.includes(view.center));
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
    "fx_ruin_0", "fx_ember", "fx_pill", "board_open", "bowl_aside", "sky"
  ];
  for (const name of needed) assert.ok(FRAME_NAMES.includes(name), name);
});
