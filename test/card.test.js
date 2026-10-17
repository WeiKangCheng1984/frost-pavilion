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
  assert.ok(details.epitaph.includes("門在背後"));
  assert.ok(details.quote.length > 0);
  assert.ok(details.pathLabel.includes("信已讀"));
  assert.ok(details.pathLabel.includes("丹在袖"));
  assert.ok(details.marks.some((line) => line.includes("密信：已展讀")));
  assert.ok(details.marks.some((line) => line.includes("解毒丹：仍溫袖底")));
  assert.ok(details.marks.some((line) => line.includes("短刃：屏風前看過")));
  assert.ok(details.marks.some((line) => line.includes(`香火：封局時餘 42／${Math.round(timerMs / 1000)} 秒`)));
  assert.ok(details.marks.some((line) => line.includes("封局之路：獨按青龍")));
  assert.deepEqual(details.bag, ["泛黃的密信", "解毒丹"]);
  assert.equal(details.ask.includes("下載"), true);
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
  assert.ok(buried.marks.some((line) => line.includes("香火：已盡")));
  assert.ok(buried.marks.some((line) => line.includes("密信：始終未拆")));
  assert.ok(buried.quote.includes("塌過"));

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
  assert.ok(ember.marks.some((line) => line.includes("鐵鏈：餘膏化開")));
  assert.ok(ember.marks.some((line) => line.includes("封局之路：化鏈後青龍")));
  assert.ok(ember.epitaph.includes("沒有原諒"));
});

test("沒有結局就不產卡", () => {
  assert.equal(cardDetails({ ending: null, inventory: [], flags: {} }), null);
});
