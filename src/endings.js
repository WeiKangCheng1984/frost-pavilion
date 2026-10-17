/** 結局純函式。沒有短刃仍送出揮刀時，回傳 null，表示狀態不變。 */

export function resolveEnding(state, choice) {
  if (choice === "blade" && !state.inventory.includes("blade")) return null;
  if (choice === "baihu" || choice === "blade") return "wolf";
  if (choice === "qinglong" && state.flags.chainsFreed) return "ember";
  if (choice === "qinglong" && state.flags.pillPlaced) return "sever";
  if (choice === "qinglong") return "flee";
  return null;
}

function hasPill(inventory) {
  return inventory.includes("pill");
}

function hasBlade(inventory) {
  return inventory.includes("blade");
}

/** 結局三頁代號。輕量修飾見 skill.md 第 7 節。 */
export function endingPageIds(ending, state) {
  const { letterRead } = state.flags;
  const inventory = state.inventory;

  if (ending === "wolf") {
    const root = letterRead ? "ending.wolf.read" : "ending.wolf.unread";
    return [`${root}.a`, `${root}.b`, `${root}.c`];
  }
  if (ending === "flee") {
    const b = hasPill(inventory) ? "ending.flee.b.pill" : "ending.flee.b";
    const c = letterRead ? "ending.flee.c.letter" : "ending.flee.c";
    return ["ending.flee.a", b, c];
  }
  if (ending === "sever") {
    const c = letterRead ? "ending.sever.c.letter" : "ending.sever.c";
    return ["ending.sever.a", "ending.sever.b", c];
  }
  if (ending === "ember") {
    const b = letterRead ? "ending.ember.b.letter" : "ending.ember.b";
    return ["ending.ember.a", b, "ending.ember.c"];
  }
  if (ending === "buried") {
    let b = "ending.buried.b";
    if (hasBlade(inventory)) b = "ending.buried.b.blade";
    const c = letterRead ? "ending.buried.c.letter" : "ending.buried.c";
    return ["ending.buried.a", b, c];
  }
  return [];
}

/** 相容測試：第一頁代號。 */
export function endingLineId(ending, letterRead) {
  const pages = endingPageIds(ending, {
    flags: { letterRead },
    inventory: []
  });
  return pages[0] ?? null;
}

export function endingKickerId(ending) {
  return ending ? `ending.kicker.${ending}` : null;
}
