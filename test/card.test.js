import assert from "node:assert/strict";
import { test } from "node:test";
import { cardDetails, cardFileName } from "../src/card.js";
import { timerMs } from "../src/content.js";

function base(over = {}) {
  return {
    ending: "flee",
    inventory: ["letter", "pill"],
    flags: {
      letterRead: true,
      bladeOffered: true,
      pillPlaced: false,
      chainsFreed: false,
      smearOffered: true
    },
    timer: { remainingMs: 42000, running: false, pausedByLetter: false, pausedByHidden: false },
    ...over
  };
}

test("結局卡細節標註密信、丹、香與封局", () => {
  const details = cardDetails(base());
  assert.equal(details.endingName, "獨行出閣");
  assert.equal(details.kicker, "門在背後");
  assert.ok(details.marks.some((line) => line.includes("密信：已讀")));
  assert.ok(details.marks.some((line) => line.includes("解毒丹：仍在袖裡")));
  assert.ok(details.marks.some((line) => line.includes("短刃：看過未取")));
  assert.ok(details.marks.some((line) => line.includes(`香：餘 42／${Math.round(timerMs / 1000)} 秒`)));
  assert.ok(details.marks.some((line) => line.includes("封局：獨按青龍")));
  assert.deepEqual(details.bag, ["泛黃的密信", "解毒丹"]);
  assert.equal(cardFileName(details), "血鎖寒閣-獨行出閣.png");
});

test("埋骨空山標香盡，薪火標化鏈", () => {
  const buried = cardDetails(base({
    ending: "buried",
    inventory: ["blade"],
    flags: {
      letterRead: false,
      bladeOffered: true,
      pillPlaced: false,
      chainsFreed: false,
      smearOffered: false
    },
    timer: { remainingMs: 0, running: false, pausedByLetter: false, pausedByHidden: false }
  }));
  assert.equal(buried.endingName, "埋骨空山");
  assert.ok(buried.marks.some((line) => line.includes("香：已盡")));
  assert.ok(buried.marks.some((line) => line.includes("密信：未展")));

  const ember = cardDetails(base({
    ending: "ember",
    inventory: [],
    flags: {
      letterRead: true,
      bladeOffered: false,
      pillPlaced: false,
      chainsFreed: true,
      smearOffered: true
    }
  }));
  assert.ok(ember.marks.some((line) => line.includes("鐵鏈：已化開")));
  assert.ok(ember.marks.some((line) => line.includes("封局：化鏈後青龍")));
});

test("沒有結局就不產卡", () => {
  assert.equal(cardDetails({ ending: null, inventory: [], flags: {} }), null);
});
