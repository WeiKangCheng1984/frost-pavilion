import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const md = fs.readFileSync(path.join(root, "文案稿.md"), "utf8");
const lines = {};
const chunks = md.split(/^## /m).slice(1);
for (const chunk of chunks) {
  const nl = chunk.indexOf("\n");
  const id = chunk.slice(0, nl).trim();
  if (!id || id.startsWith("items") || id.startsWith("verses") || id.startsWith("koMoves") || id.startsWith("herbs") || id.startsWith("endings")) continue;
  const body = chunk.slice(nl + 1).trim();
  if (!body || body.startsWith("- ")) continue;
  const text = body.split("\n").filter((line) => line.trim()).join("\n");
  lines[id] = text.includes("\n") ? text.split("\n") : [text];
}

const header = `/** 純資料。關卡推進不寫在這個檔案。由 scripts/sync-content.mjs 從文案稿.md 同步 lines／hints。 */

export const timerMs = 60000;

export const items = {
  needle: "寒鐵銀針",
  letter: "泛黃的密信",
  scale: "配藥秤",
  pill: "解毒丹",
  acid_smear: "碗底餘膏",
  blade: "短刃"
};

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

export const acupoints = [
  { id: "shanzhong", label: "膻中" },
  { id: "jiuwei", label: "鳩尾" },
  { id: "qihai", label: "氣海" }
];

export const elements = [
  { id: "metal", label: "金" },
  { id: "wood", label: "木" },
  { id: "water", label: "水" },
  { id: "fire", label: "火" },
  { id: "earth", label: "土" }
];

export const herbs = [
  { id: "hongre", name: "鶴頂紅", tag: "紅熱" },
  { id: "hanyin", name: "相思子", tag: "寒引" },
  { id: "xuelian", name: "雪蓮花", tag: "可解" },
  { id: "qingre", name: "斷腸草", tag: "青熱" }
];

export const koMoves = [
  { id: "take", label: "提子" },
  { id: "retake", label: "對方提回" },
  { id: "elsewhere", label: "別處落子" },
  { id: "fill", label: "填回原點" }
];

export const verses = {
  lineA: "冤沉閣底劍光寒",
  lineB: "有恨難平不共天",
  lineC: "頭白方知恩是刃",
  lineD: "在此一別問青天"
};

export const puzzles = {
  bagua: {
    phase: 1,
    length: 3,
    answer: ["zhen", "dui", "kan"],
    grant: ["needle"],
    failLine: "bagua.fail",
    stepLine: "bagua.step",
    successLine: "bagua.success"
  },
  acupoint: {
    phase: 2,
    requires: ["needle"],
    readyFlag: "needleReady",
    answer: ["qihai", "shanzhong", "jiuwei"],
    grant: [],
    blockedLine: "acupoint.blocked",
    unreadyLine: "acupoint.sheathed",
    failLine: "acupoint.fail",
    stepLine: "acupoint.step",
    successLine: "acupoint.success"
  },
  wuxing: {
    phase: 3,
    answer: ["wood", "earth", "water", "fire"],
    trap: ["metal"],
    grant: [],
    failLine: "wuxing.fail",
    stepLine: "wuxing.step",
    successLine: "wuxing.success"
  },
  ko: {
    phase: 4,
    answer: ["take", "retake", "elsewhere", "fill"],
    grant: ["letter", "scale"],
    failLine: "ko.fail",
    stepLine: "ko.step",
    successLine: "ko.success"
  }
};

export const brew = {
  phase: 5,
  requires: ["scale"],
  recipe: { hongre: 2, hanyin: 1, qingre: 0, xuelian: 0 },
  blockedLine: "brew.fail.scale",
  failQing: "brew.fail.qing",
  failSnow: "brew.fail.snow",
  failRatio: "brew.fail.ratio",
  successLine: "brew.success",
  askLine: "brew.askSmear"
};

export const sword = {
  phase: 6,
  answer: ["lineA", "lineB", "lineC", "lineD"],
  initial: ["lineB", "lineD", "lineA", "lineC"],
  failLine: "sword.fail",
  successLine: "sword.success"
};

export const endingNames = {
  wolf: "孤狼飲血",
  flee: "獨行出閣",
  sever: "斬斷因果",
  ember: "薪火未熄",
  buried: "埋骨空山"
};

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
  passage: ${JSON.stringify(lines["hints.passage"]?.[0] ?? "這段還停在半途。")},
  letter: ${JSON.stringify(lines["hints.letter"]?.[0] ?? "")},
  smear: ${JSON.stringify(lines["hints.smear"]?.[0] ?? "")},
  blade: ${JSON.stringify(lines["hints.blade"]?.[0] ?? "")},
  bagua: ${JSON.stringify(lines["hints.bagua"]?.[0] ?? "")},
  needleMissing: ${JSON.stringify(lines["hints.needleMissing"]?.[0] ?? "")},
  needleSheathed: ${JSON.stringify(lines["hints.needleSheathed"]?.[0] ?? "")},
  needleReady: ${JSON.stringify(lines["hints.needleReady"]?.[0] ?? "")},
  wuxing: ${JSON.stringify(lines["hints.wuxing"]?.[0] ?? "")},
  ko: ${JSON.stringify(lines["hints.ko"]?.[0] ?? "")},
  brew: ${JSON.stringify(lines["hints.brew"]?.[0] ?? "")},
  sword: ${JSON.stringify(lines["hints.sword"]?.[0] ?? "")},
  finaleLocked: ${JSON.stringify(lines["hints.finaleLocked"]?.[0] ?? "")},
  finale: ${JSON.stringify(lines["hints.finale"]?.[0] ?? "")}
};

export const lines = ${JSON.stringify(lines, null, 2)};
`;

fs.writeFileSync(path.join(root, "src", "content.js"), header);
console.log(`synced ${Object.keys(lines).length} line ids`);
