import { acupoints, elements, endingNames, herbs, items, lines, puzzles, trigrams, verses } from "./content.js";
import { loadSprites, onSprites, paintStage } from "./sprites.js";

const PHASES = {
  1: { kicker: "第一關", block: "八卦壁" },
  2: { kicker: "第二關", block: "銅人" },
  3: { kicker: "第三關", block: "地磚" },
  4: { kicker: "第四關", block: "棋盤" },
  5: { kicker: "第五關", block: "藥架" },
  6: { kicker: "第六關", block: "屏風" },
  7: { kicker: "暗門", block: "暗門" }
};

const INSPECTS = {
  1: [
    { target: "compass", label: "方位對照" },
    { target: "poem", label: "壁上詩" }
  ],
  2: [{ target: "bronze", label: "銅人穴名" }],
  3: [{ target: "wuxing", label: "壁上刻字" }],
  4: [{ target: "board", label: "看棋盤" }],
  5: [
    { target: "scroll", label: "殘卷" },
    { target: "herbs", label: "毒架" }
  ]
};

const KO_LABELS = { ko: "劫", eye: "做眼", snapback: "倒撲", seki: "雙活" };

const LABELS = Object.fromEntries([
  ...trigrams.map((item) => [item.id, item.label]),
  ...acupoints.map((item) => [item.id, item.label]),
  ...elements.map((item) => [item.id, item.label])
]);

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = motionQuery.matches;
const debug = new URLSearchParams(location.search).has("debug");
const introKey = lines["ending.intro"].join("\n");

let latest = null;
let inspectOpen = false;
let openPhase = 0;
let chromeKey = "";
let speech = { key: "", rows: [], count: 0, done: true, timer: 0 };
let brewForm = emptyBrew();
let focus = null;

const TARGET_FRAMES = {
  compass: "compass",
  poem: "poem",
  bronze: "bronze",
  wuxing: "tiles",
  board: "board",
  scroll: "scroll",
  herbs: "shelf",
  needle: "needle",
  letter: "letter",
  scale: "scale",
  pill: "pill",
  acid_smear: "smear",
  blade: "blade"
};

export function render(state, send) {
  latest = { state, send };
  if (state.phase !== openPhase) {
    inspectOpen = false;
    focus = null;
    if (state.phase === 5) brewForm = emptyBrew();
    openPhase = state.phase;
  }
  const rows = rowsFrom(state.log);
  const key = rows.join("\n");
  if (key !== speech.key) beginSpeech(rows, key);
  const nextChrome = JSON.stringify({
    phase: state.phase,
    inventory: state.inventory,
    sequences: state.sequences,
    flags: {
      smearOffered: state.flags.smearOffered,
      bladeOffered: state.flags.bladeOffered,
      introDone: state.flags.introDone,
      pillPlaced: state.flags.pillPlaced,
      chainsFreed: state.flags.chainsFreed,
      letterOpen: Boolean(state.timer?.pausedByLetter),
      ending: state.ending
    },
    focus,
    inspectOpen,
    brewForm
  });
  if (nextChrome !== chromeKey) {
    chromeKey = nextChrome;
    paintChrome();
  }
  paintSpeech();
  paintTimer(state);
  maybeStartCountdown();
}

function emptyBrew() {
  return { hongre: 0, hanyin: 0, qingre: 0, xuelian: 0, setAsideSnow: false };
}

function rowsFrom(ids) {
  const rows = [];
  for (const id of ids) {
    for (const row of lines[id] ?? []) {
      if (rows.length < 4) rows.push(row);
    }
  }
  return rows;
}

function beginSpeech(rows, key) {
  window.clearInterval(speech.timer);
  const done = reducedMotion || key.length === 0;
  speech = { key, rows, count: done ? key.length : 0, done, timer: 0 };
  if (done) return;
  speech.timer = window.setInterval(() => {
    speech.count += 1;
    if (speech.count >= speech.key.length) {
      speech.count = speech.key.length;
      speech.done = true;
      window.clearInterval(speech.timer);
      maybeStartCountdown();
    }
    paintSpeech();
  }, 36);
}

function finishSpeech() {
  if (speech.done) return;
  window.clearInterval(speech.timer);
  speech.count = speech.key.length;
  speech.done = true;
  paintSpeech();
  maybeStartCountdown();
}

function maybeStartCountdown() {
  const state = latest?.state;
  if (!speech.done || !state) return;
  if (state.phase !== 7 || state.flags.introDone || !state.flags.bladeOffered) return;
  if (speech.key !== introKey) return;
  latest.send({ type: "skipIntro" });
}

let speechPaint = "";

function paintSpeech() {
  const speechEl = document.querySelector("#speech");
  const skip = document.querySelector("#skip");
  if (!speechEl || !skip) return;
  const mark = `${speech.key}:${speech.count}:${speech.done}`;
  if (mark === speechPaint) return;
  speechPaint = mark;
  const shown = speech.key.slice(0, speech.count).split("\n");
  speechEl.replaceChildren();
  for (let i = 0; i < 4; i += 1) {
    const line = document.createElement("p");
    line.textContent = shown[i] ?? "";
    speechEl.append(line);
  }
  skip.hidden = speech.done;
}

function paintChrome() {
  const { state, send } = latest;
  const ended = Boolean(state.ending);
  const phase = ended
    ? { kicker: "結局", block: endingNames[state.ending] }
    : (PHASES[state.phase] ?? PHASES[7]);
  document.querySelector("#kicker").textContent = phase.kicker;
  document.querySelector("#block-name").textContent = phase.block;
  document.querySelector("#progress").textContent = progressText(state);
  paintScene(state);

  document.querySelector(".bag-wrap").hidden = ended;
  document.querySelector(".verbs").hidden = ended || state.phase === 7;
  document.querySelector("#hint").hidden = ended;
  document.querySelector("#restart").hidden = !ended;
  document.querySelector("#close-letter").hidden = ended || !state.timer?.pausedByLetter;
  document.querySelector("#debug-skip").hidden = !debug || ended || !state.timer?.running;

  if (!ended) {
    paintBag(state, send);
    paintHint(state);
    paintInspect(state, send);
  }
  paintPuzzle(state, send);
  paintSubmit(state);

  document.querySelector("#inspect").setAttribute("aria-expanded", String(inspectOpen));
}

function paintTimer(state) {
  const clock = document.querySelector("#clock");
  const bar = document.querySelector("#timer-bar");
  const show = state.phase === 7 && state.flags.introDone && !state.ending && state.timer;
  if (!show) {
    clock.textContent = "亥時";
    bar.hidden = true;
    return;
  }
  clock.textContent = `${Math.ceil(state.timer.remainingMs / 1000)} 秒`;
  bar.hidden = false;
  const lit = Math.ceil(state.timer.remainingMs / 6000);
  [...bar.children].forEach((cell, index) => {
    cell.dataset.on = String(index < lit);
  });
}

function sceneFor(state) {
  if (state.ending === "wolf") return { center: "baihu", row: [] };
  if (state.ending === "flee") return { center: "qinglong", row: [] };
  if (state.ending === "sever") return { center: "pill", row: ["elder"] };
  if (state.ending === "ember") return { center: "elder", row: ["chains", "qinglong"] };
  if (state.ending === "buried") return { center: "fuse", row: [] };
  if (focus && TARGET_FRAMES[focus]) return { center: TARGET_FRAMES[focus], row: [] };
  if (state.phase === 1) return { center: "wall", row: state.sequences.bagua };
  if (state.phase === 2) return { center: "bronze", row: state.inventory.includes("needle") ? ["needle"] : [] };
  if (state.phase === 3) return { center: "tiles", row: state.sequences.wuxing };
  if (state.phase === 4) return { center: "board", row: [] };
  if (state.phase === 5) return { center: "shelf", row: ["hongre", "hanyin", "xuelian", "qingre"] };
  if (state.phase === 6 && !state.flags.smearOffered) return { center: "bowl", row: [] };
  if (!state.flags.bladeOffered) return { center: "screen", row: ["blade"] };
  const row = ["baihu", "qinglong"];
  if (state.inventory.includes("pill")) row.push("pill");
  if (state.inventory.includes("acid_smear")) row.push("smear");
  if (state.inventory.includes("blade")) row.push("blade");
  return { center: "elder", row };
}

function paintScene(state) {
  const canvas = document.querySelector("#scene");
  if (!canvas || !state) return;
  paintStage(canvas, sceneFor(state));
}

function progressText(state) {
  if (state.phase >= 1 && state.phase <= 3) {
    const sequence = currentSequence(state);
    if (sequence.length === 0) return "尚未按下。";
    return `已按 ${sequence.map((id) => LABELS[id] ?? id).join("、")}`;
  }
  if (state.phase === 4) return "選一個手法。";
  if (state.phase === 5) return doseSummary();
  if (state.phase === 6 && !state.flags.smearOffered) return "碗底還留著餘膏。";
  if (state.phase === 6) return "排好四句再提交。";
  if (state.ending) return endingNames[state.ending];
  if (!state.flags.bladeOffered) return "短刃還掛在屏風旁。";
  if (!state.flags.introDone) return "開場未完，倒數未走。";
  if (state.timer?.pausedByLetter) return "讀信時，香暫停。";
  if (state.flags.chainsFreed) return "鐵鏈已開，青龍才能同行。";
  if (state.flags.pillPlaced) return "丹已放下，青龍即可離開。";
  return "白虎地火，青龍出門。";
}

function doseSummary() {
  const tags = [
    ["hongre", "紅熱"],
    ["hanyin", "寒引"],
    ["qingre", "青熱"],
    ["xuelian", "可解"]
  ];
  const text = tags.map(([id, tag]) => `${tag}${brewForm[id]}`).join(" ");
  return brewForm.setAsideSnow ? `${text} 已別置` : text;
}

function currentSequence(state) {
  if (state.phase === 1) return state.sequences.bagua;
  if (state.phase === 2) return state.sequences.acupoint;
  if (state.phase === 3) return state.sequences.wuxing;
  return [];
}

function paintBag(state, send) {
  const bag = document.querySelector("#bag");
  bag.replaceChildren();
  if (state.inventory.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "空";
    bag.append(empty);
    return;
  }
  for (const id of state.inventory) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = items[id] ?? id;
    button.addEventListener("click", () => {
      focus = id;
      if (id === "letter" && state.phase === 7 && state.timer) {
        send({ type: "openLetter" });
      } else {
        send({ type: "inspect", target: id });
      }
      paintScene(latest.state);
    });
    bag.append(button);
  }
}

function paintHint(state) {
  const hint = document.querySelector("#hint");
  if (state.phase === 1) hint.textContent = "點卦符。調查可看方位。";
  else if (state.phase === 2) {
    hint.textContent = state.inventory.includes("needle")
      ? "銀針在背包裡。由上到下點穴。"
      : "口袋裡沒有銀針。";
  } else if (state.phase === 3) hint.textContent = "踩錯會重來。壁上刻字可調查。";
  else if (state.phase === 4) hint.textContent = "先調查棋盤，再選手法。";
  else if (state.phase === 5) hint.textContent = "調查殘卷。份數選好再提交。";
  else if (state.phase === 6 && !state.flags.smearOffered) hint.textContent = "先決定要不要刮碗。";
  else if (state.phase === 6) hint.textContent = "上下移動句子，再提交。";
  else if (!state.flags.bladeOffered) hint.textContent = "短刃可取，也可留。";
  else if (!state.flags.introDone) hint.textContent = "開場結束後，石頭才有反應。";
  else if (!state.inventory.includes("blade")) hint.textContent = "沒有短刃，不能揮刀。";
  else hint.textContent = "石頭、丹、餘膏，選一件做完。";
}

function paintInspect(state, send) {
  const panel = document.querySelector("#inspect-panel");
  const targets = INSPECTS[state.phase] ?? [];
  panel.hidden = !inspectOpen || targets.length === 0;
  panel.replaceChildren();
  for (const item of targets) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.label;
    button.addEventListener("click", () => {
      focus = item.target;
      send({ type: "inspect", target: item.target });
      paintScene(latest.state);
    });
    panel.append(button);
  }
}

function paintPuzzle(state, send) {
  const puzzle = document.querySelector("#puzzle");
  puzzle.replaceChildren();
  if (state.phase === 1) appendChoices(puzzle, trigrams, "bagua", new Set(state.sequences.bagua), send);
  else if (state.phase === 2) appendChoices(puzzle, acupoints, "acupoint", new Set(state.sequences.acupoint), send);
  else if (state.phase === 3) appendChoices(puzzle, elements, "wuxing", new Set(state.sequences.wuxing), send);
  else if (state.phase === 4) paintKo(puzzle, send);
  else if (state.phase === 5) paintBrew(puzzle);
  else if (state.phase === 6 && !state.flags.smearOffered) paintOffer(puzzle, "smear", "刮起", "不刮", send);
  else if (state.phase === 6) paintSword(puzzle, state, send);
  else if (state.ending) return;
  else if (!state.flags.bladeOffered) paintOffer(puzzle, "blade", "取下", "不取", send);
  else paintFinale(puzzle, state, send);
}

function appendChoices(parent, choices, puzzleId, pressed, send) {
  for (const choice of choices) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = choice.label;
    button.setAttribute("aria-pressed", String(pressed.has(choice.id)));
    button.addEventListener("click", () => {
      focus = null;
      send({ type: "sequencePush", puzzleId, token: choice.id });
    });
    parent.append(button);
  }
}

function paintKo(parent, send) {
  for (const id of puzzles.ko.options) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = KO_LABELS[id] ?? id;
    button.addEventListener("click", () => {
      focus = null;
      send({ type: "submit", puzzleId: "ko", choice: id });
    });
    parent.append(button);
  }
}

function paintBrew(parent) {
  for (const herb of herbs) {
    const row = document.createElement("div");
    row.className = "mix";
    const name = document.createElement("span");
    name.textContent = `${herb.name}　${herb.tag}`;
    row.append(name);
    for (const amount of [0, 1, 2]) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(amount);
      button.setAttribute("aria-pressed", String(brewForm[herb.id] === amount));
      button.addEventListener("click", () => setDose(herb.id, amount));
      row.append(button);
    }
    parent.append(row);
  }
  const aside = document.createElement("button");
  aside.type = "button";
  aside.textContent = "雪蓮別置";
  aside.setAttribute("aria-pressed", String(brewForm.setAsideSnow));
  aside.addEventListener("click", () => {
    brewForm = { ...brewForm, setAsideSnow: !brewForm.setAsideSnow };
    repaint();
  });
  parent.append(aside);
}

function setDose(id, amount) {
  brewForm = { ...brewForm, [id]: amount };
  repaint();
}

function paintSword(parent, state, send) {
  state.sequences.sword.forEach((id, index) => {
    const row = document.createElement("div");
    row.className = "sword-row";
    const up = document.createElement("button");
    up.type = "button";
    up.textContent = "上";
    up.disabled = index === 0;
    up.addEventListener("click", () => moveSword(state, index, -1, send));
    const down = document.createElement("button");
    down.type = "button";
    down.textContent = "下";
    down.disabled = index === state.sequences.sword.length - 1;
    down.addEventListener("click", () => moveSword(state, index, 1, send));
    const text = document.createElement("span");
    text.textContent = verses[id] ?? id;
    row.append(up, down, text);
    parent.append(row);
  });
}

function moveSword(state, index, dir, send) {
  const order = [...state.sequences.sword];
  const next = index + dir;
  if (next < 0 || next >= order.length) return;
  focus = null;
  [order[index], order[next]] = [order[next], order[index]];
  send({ type: "sequenceReorder", order });
}

function paintOffer(parent, offer, yesLabel, noLabel, send) {
  const yes = document.createElement("button");
  yes.type = "button";
  yes.textContent = yesLabel;
  yes.addEventListener("click", () => {
    focus = null;
    send({ type: "offerAnswer", offer, answer: "yes" });
  });
  const no = document.createElement("button");
  no.type = "button";
  no.textContent = noLabel;
  no.addEventListener("click", () => {
    focus = null;
    send({ type: "offerAnswer", offer, answer: "no" });
  });
  parent.append(yes, no);
}

function paintFinale(parent, state, send) {
  const ready = state.flags.introDone;
  addAction(parent, "白虎石", ready, () => {
    focus = null;
    send({ type: "submit", puzzleId: "ending", choice: "baihu" });
  });
  addAction(parent, "青龍石", ready, () => {
    focus = null;
    send({ type: "submit", puzzleId: "ending", choice: "qinglong" });
  });
  if (state.inventory.includes("blade")) {
    addAction(parent, "揮刀", ready, () => {
      focus = null;
      send({ type: "submit", puzzleId: "ending", choice: "blade" });
    });
  }
  if (state.inventory.includes("pill")) {
    addAction(parent, "放下丹", ready, () => {
      focus = null;
      send({ type: "placePill" });
    });
  }
  if (state.inventory.includes("acid_smear")) {
    addAction(parent, "化開鐵鏈", ready, () => {
      focus = null;
      send({ type: "freeChains" });
    });
  }
}

function addAction(parent, label, enabled, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.disabled = !enabled;
  button.addEventListener("click", onClick);
  parent.append(button);
}

function paintSubmit(state) {
  const submit = document.querySelector("#submit");
  const brewing = state.phase === 5;
  const sorting = state.phase === 6 && state.flags.smearOffered;
  submit.disabled = !(brewing || sorting);
  submit.title = submit.disabled ? "這一關不用這個鈕" : "送出這一關";
}

function repaint() {
  chromeKey = "";
  if (latest) render(latest.state, latest.send);
}

export function paintMute(muted) {
  const button = document.querySelector("#mute");
  if (!button) return;
  button.setAttribute("aria-pressed", String(muted));
  button.textContent = muted ? "開聲" : "靜音";
}

function bindStatic() {
  document.querySelector("#skip").addEventListener("click", finishSpeech);
  document.querySelector("#speech").addEventListener("click", finishSpeech);
  document.querySelector("#inspect").addEventListener("click", () => {
    inspectOpen = !inspectOpen;
    repaint();
  });
  document.querySelector("#use").addEventListener("click", () => {
    const puzzle = document.querySelector("#puzzle button:not(:disabled)");
    if (puzzle) puzzle.focus();
  });
  document.querySelector("#close-letter").addEventListener("click", () => {
    focus = null;
    latest?.send({ type: "closeLetter" });
  });
  document.querySelector("#debug-skip").addEventListener("click", () => {
    latest?.send({ type: "tick", ms: 10000 });
  });
  document.querySelector("#restart").addEventListener("click", () => {
    focus = null;
    latest?.send({ type: "restart" });
  });
  document.querySelector("#submit").addEventListener("click", () => {
    if (!latest || document.querySelector("#submit").disabled) return;
    const { state, send } = latest;
    focus = null;
    if (state.phase === 5) {
      send({ type: "submit", puzzleId: "brew", recipe: { ...brewForm } });
    } else if (state.phase === 6 && state.flags.smearOffered) {
      send({ type: "submit", puzzleId: "sword" });
    }
  });
}

const timerBar = document.querySelector("#timer-bar");
for (let i = 0; i < 10; i += 1) timerBar.append(document.createElement("span"));

motionQuery.addEventListener("change", () => {
  reducedMotion = motionQuery.matches;
  if (reducedMotion && !speech.done) finishSpeech();
});

bindStatic();
loadSprites();
onSprites(() => {
  if (latest) paintScene(latest.state);
});
