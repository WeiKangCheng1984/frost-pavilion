import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const md = fs.readFileSync(path.join(root, "文案稿.md"), "utf8");
const lines = {};
const lists = {};
const listIds = new Set([
  "items",
  "verses",
  "acupoints",
  "koMoves",
  "herbs",
  "endings",
  "puzzle.bagua",
  "puzzle.acupoint",
  "puzzle.wuxing",
  "puzzle.ko",
  "puzzle.brew",
  "puzzle.sword"
]);
const chunks = md.split(/^## /m).slice(1);
for (const chunk of chunks) {
  const nl = chunk.indexOf("\n");
  const id = chunk.slice(0, nl).trim();
  if (!id) continue;
  const body = chunk.slice(nl + 1).split(/^# /m)[0].trim();
  if (!body) continue;
  const bullets = body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "));
  if (listIds.has(id) || (bullets.length > 0 && bullets.length === body.split("\n").filter((line) => line.trim()).length)) {
    lists[id] = bullets;
    continue;
  }
  const text = body.split("\n").filter((line) => line.trim()).join("\n");
  lines[id] = text.includes("\n") ? text.split("\n") : [text];
}

/** 稿內以「（……）」註記不用的提示，同步成空字串。 */
function hintText(id) {
  const text = lines[id]?.[0] ?? "";
  return !text || text.startsWith("（") ? "" : text;
}

function parsePairs(id) {
  return (lists[id] ?? []).map((line) => {
    const match = line.match(/^- (\w+)：(.+)$/);
    if (!match) throw new Error(`無法解析 ${id}：${line}`);
    return [match[1], match[2].trim()];
  });
}

function parseCsvField(sectionId, key) {
  const row = (lists[sectionId] ?? []).find((line) => line.startsWith(`- ${key}：`));
  if (!row) throw new Error(`解謎設定缺少 ${sectionId} / ${key}`);
  return row
    .slice(`- ${key}：`.length)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseRecipe(sectionId) {
  const row = (lists[sectionId] ?? []).find((line) => line.startsWith("- recipe："));
  if (!row) throw new Error(`解謎設定缺少 ${sectionId} / recipe`);
  const recipe = {};
  for (const part of row.slice("- recipe：".length).split(",")) {
    const [id, amount] = part.trim().split(/\s+/);
    if (!id) continue;
    recipe[id] = Number(amount);
  }
  return recipe;
}

const items = Object.fromEntries(parsePairs("items"));
const verses = Object.fromEntries(parsePairs("verses"));
const endingNames = Object.fromEntries(parsePairs("endings"));
const acupoints = parsePairs("acupoints").map(([id, label]) => ({ id, label }));
const koMoves = parsePairs("koMoves").map(([id, label]) => ({ id, label }));
const herbs = parsePairs("herbs").map(([id, value]) => {
  const [name, tag] = value.split("／").map((part) => part.trim());
  if (!name || !tag) throw new Error(`藥材需「名／標籤」：${id}`);
  return { id, name, tag };
});

const baguaAnswer = parseCsvField("puzzle.bagua", "answer");
const acupointAnswer = parseCsvField("puzzle.acupoint", "answer");
const wuxingAnswer = parseCsvField("puzzle.wuxing", "answer");
const wuxingTrap = parseCsvField("puzzle.wuxing", "trap");
const koAnswer = parseCsvField("puzzle.ko", "answer");
const brewRecipe = parseRecipe("puzzle.brew");
const asideCorrect = parseCsvField("puzzle.brew", "asideCorrect")[0];
const asideChoices = parseCsvField("puzzle.brew", "asideChoices");
const swordAnswer = parseCsvField("puzzle.sword", "answer");
const swordInitial = parseCsvField("puzzle.sword", "initial");

const header = `/** 純資料。關卡推進不寫在這個檔案。由 scripts/sync-content.mjs 從文案稿.md 同步 lines／hints／名稱／解謎設定。 */

export const timerMs = 60000;

export const items = ${JSON.stringify(items, null, 2)};

export const trigrams = [
  { id: "qian", label: "乾" },
  { id: "dui", label: "兌" },
  { id: "li", label: "離" },
  { id: "zhen", label: "震" },
  { id: "xun", label: "巽" },
  { id: "kan", label: "坎" },
  { id: "gen", label: "艮" },
  { id: "kun", label: "坤" }
];

export const acupoints = ${JSON.stringify(acupoints, null, 2)};

export const elements = [
  { id: "metal", label: "金" },
  { id: "wood", label: "木" },
  { id: "water", label: "水" },
  { id: "fire", label: "火" },
  { id: "earth", label: "土" }
];

export const herbs = ${JSON.stringify(herbs, null, 2)};

export const koMoves = ${JSON.stringify(koMoves, null, 2)};

export const verses = ${JSON.stringify(verses, null, 2)};

export const puzzles = {
  bagua: {
    phase: 1,
    length: ${baguaAnswer.length},
    answer: ${JSON.stringify(baguaAnswer)},
    grant: ["needle"],
    failLine: "bagua.fail",
    stepLine: "bagua.step",
    successLine: "bagua.success"
  },
  acupoint: {
    phase: 2,
    requires: ["needle"],
    readyFlag: "needleReady",
    answer: ${JSON.stringify(acupointAnswer)},
    grant: [],
    blockedLine: "acupoint.blocked",
    unreadyLine: "acupoint.sheathed",
    failLine: "acupoint.fail",
    stepLine: "acupoint.step",
    successLine: "acupoint.success"
  },
  wuxing: {
    phase: 3,
    answer: ${JSON.stringify(wuxingAnswer)},
    trap: ${JSON.stringify(wuxingTrap)},
    grant: [],
    failLine: "wuxing.fail",
    stepLine: "wuxing.step",
    successLine: "wuxing.success"
  },
  ko: {
    phase: 4,
    answer: ${JSON.stringify(koAnswer)},
    grant: ["letter", "scale"],
    failLine: "ko.fail",
    stepLine: "ko.step",
    successLine: "ko.success"
  }
};

export const brew = {
  phase: 5,
  requires: ["scale"],
  recipe: ${JSON.stringify(brewRecipe)},
  asideCorrect: ${JSON.stringify(asideCorrect)},
  blockedLine: "brew.fail.scale",
  failQing: "brew.fail.qing",
  failSnow: "brew.fail.snow",
  failExtra: "brew.fail.extra",
  failRatio: "brew.fail.ratio",
  asideChoices: ${JSON.stringify(asideChoices)},
  successLine: "brew.success",
  askLine: "brew.askSmear"
};

export const sword = {
  phase: 6,
  answer: ${JSON.stringify(swordAnswer)},
  initial: ${JSON.stringify(swordInitial)},
  failLine: "sword.fail",
  successLine: "sword.success"
};

export const endingNames = ${JSON.stringify(endingNames, null, 2)};

/** 每一則代號是一頁。 */
export const passages = {
  prologue: ["prologue.1", "prologue.2", "prologue.3", "prologue.4"],
  enter: {
    1: ["enter.1.a", "enter.1.b", "enter.1.c"],
    2: ["enter.2.a", "enter.2.b", "enter.2.c"],
    3: ["enter.3.a", "enter.3.b"],
    4: ["enter.4.a", "enter.4.b"],
    5: ["enter.5.a", "enter.5.b", "enter.5.c"],
    6: ["enter.6.a", "enter.6.b"],
    7: ["enter.7.a", "enter.7.b", "enter.7.c", "enter.7.d", "enter.7.e", "enter.7.f"]
  },
  clear: {
    1: ["clear.1.a", "clear.1.b", "clear.1.c"],
    2: ["clear.2.a", "clear.2.b"],
    3: ["clear.3.a", "clear.3.b"],
    4: ["clear.4.a", "clear.4.b", "clear.4.c"],
    5: {
      with: ["clear.5.with.a", "clear.5.with.b", "clear.5.with.c"],
      none: ["clear.5.none.a", "clear.5.none.b", "clear.5.none.c"]
    },
    6: ["clear.6.a", "clear.6.b", "clear.6.c"]
  },
  letter: ["letter.1", "letter.2", "letter.3", "letter.4"]
};

export const hints = {
  passage: ${JSON.stringify(hintText("hints.passage"))},
  letter: ${JSON.stringify(hintText("hints.letter"))},
  smear: ${JSON.stringify(hintText("hints.smear"))},
  blade: ${JSON.stringify(hintText("hints.blade"))},
  bagua: ${JSON.stringify(hintText("hints.bagua"))},
  needleMissing: ${JSON.stringify(hintText("hints.needleMissing"))},
  needleSheathed: ${JSON.stringify(hintText("hints.needleSheathed"))},
  needleReady: ${JSON.stringify(hintText("hints.needleReady"))},
  wuxing: ${JSON.stringify(hintText("hints.wuxing"))},
  ko: ${JSON.stringify(hintText("hints.ko"))},
  brew: ${JSON.stringify(hintText("hints.brew"))},
  sword: ${JSON.stringify(hintText("hints.sword"))},
  finaleLocked: ${JSON.stringify(hintText("hints.finaleLocked"))},
  finale: ${JSON.stringify(hintText("hints.finale"))}
};

export const lines = ${JSON.stringify(lines, null, 2)};
`;

fs.writeFileSync(path.join(root, "src", "content.js"), header);
console.log(`synced ${Object.keys(lines).length} line ids, ${acupoints.length} acupoints, ${koMoves.length} koMoves, ${herbs.length} herbs`);
