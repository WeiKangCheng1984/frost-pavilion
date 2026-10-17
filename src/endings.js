/** 結局純函式。沒有短刃仍送出揮刀時，回傳 null，表示狀態不變。 */

export function resolveEnding(state, choice) {
  if (choice === "blade" && !state.inventory.includes("blade")) return null;
  if (choice === "baihu" || choice === "blade") return "wolf";
  if (choice === "qinglong" && state.flags.chainsFreed) return "ember";
  if (choice === "qinglong" && state.flags.pillPlaced) return "sever";
  if (choice === "qinglong") return "flee";
  return null;
}

export function endingLineId(ending, letterRead) {
  if (ending === "wolf") {
    return letterRead ? "ending.wolf.read" : "ending.wolf.unread";
  }
  if (ending === "flee" || ending === "sever" || ending === "ember" || ending === "buried") {
    return `ending.${ending}`;
  }
  return null;
}
