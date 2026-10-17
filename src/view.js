import { acupoints, elements, endingNames, herbs, hints, items, koMoves, lines, passages, trigrams, verses } from "./content.js";
import { endingKickerId, endingPageIds } from "./endings.js";
import { glanceOpen } from "./reduce.js";
import { animBusy, setReducedMotion, stageView, syncAnim } from "./anim.js";
import { prepareEndingCard, releasePreparedCard, savePreparedCard } from "./card.js";
import { getSpriteSheet, loadSprites, onSprites, paintStage } from "./sprites.js";

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

const LABELS = Object.fromEntries([
  ...trigrams.map((item) => [item.id, item.label]),
  ...acupoints.map((item) => [item.id, item.label]),
  ...elements.map((item) => [item.id, item.label]),
  ...koMoves.map((item) => [item.id, item.label])
]);

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = motionQuery.matches;
setReducedMotion(reducedMotion);
const debug = new URLSearchParams(location.search).has("debug");

let latest = null;
let inspectOpen = false;
let openPhase = 0;
let chromeKey = "";
let speech = { key: "", rows: [], count: 0, done: true, timer: 0 };
let brewForm = emptyBrew();
let focus = null;
let selected = null;
let restartDelayTimer = 0;
let restartDelayKey = "";
let wasAnimBusy = false;
let preparedCard = null;

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
  if (selected && !state.inventory.includes(selected)) {
    selected = null;
    focus = null;
  }
  if (state.phase !== openPhase) {
    inspectOpen = false;
    focus = null;
    selected = null;
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
    beat: state.beat,
    page: state.page,
    flags: {
      smearOffered: state.flags.smearOffered,
      bladeOffered: state.flags.bladeOffered,
      introDone: state.flags.introDone,
      pillPlaced: state.flags.pillPlaced,
      chainsFreed: state.flags.chainsFreed,
      letterOpen: state.flags.letterOpen,
      needleReady: state.flags.needleReady,
      scaleReady: state.flags.scaleReady,
      ending: state.ending
    },
    pending: state.pending,
    glance: state.log?.[0] ?? "",
    selected,
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
  paintScene(state);
}

export function paintFrame(state, now = performance.now()) {
  if (latest) latest.state = state;
  syncAnim(state, now);
  paintScene(state, now);
  paintTimer(state);
  const busy = animBusy(now);
  if (busy !== wasAnimBusy) {
    wasAnimBusy = busy;
    chromeKey = "";
    if (latest) paintChrome();
  }
  paintAdvance();
  paintRetreat();
}

function emptyBrew() {
  return { hongre: 0, hanyin: 0, qingre: 0, xuelian: 0, setAsideSnow: false };
}

function clearPassage(state) {
  if (state.phase === 5 && state.beat === "clear") {
    return state.inventory.includes("pill") ? passages.clear[5].with : passages.clear[5].none;
  }
  if (state.beat === "clear") return passages.clear[state.phase];
  return null;
}

function pageIdsFor(state) {
  if (state.phase === "ending") return endingPageIds(state.ending, state);
  if (state.flags.letterOpen) return passages.letter;
  if (state.beat === "cheat") return ["cheat.joke"];
  if (state.beat === "prologue") return passages.prologue;
  if (state.beat === "enter") return passages.enter[state.phase];
  if (state.beat === "clear") return clearPassage(state);
  return null;
}

function rowsFrom(ids) {
  const rows = [];
  for (const id of ids) {
    for (const row of lines[id] ?? []) rows.push(row);
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
  for (const text of shown) {
    const line = document.createElement("p");
    line.textContent = text;
    speechEl.append(line);
  }
  skip.hidden = speech.done || !speech.key;
  paintAdvance();
  paintRetreat();
  if (speech.done && latest?.state?.ending) paintRestart(latest.state, true);
}

function passageLabel(state) {
  if (animBusy()) return "";
  if (glanceOpen(state) && state.phase === 7 && state.beat === "play" && !state.flags.letterOpen) {
    return "繼續";
  }
  const ids = pageIdsFor(state);
  if (!ids) return "";
  if (state.phase === "ending") {
    return state.page >= ids.length - 1 ? "" : "下一段";
  }
  if (state.flags.letterOpen) {
    return state.page >= ids.length - 1 ? "合上" : "繼續";
  }
  return "繼續";
}

function canRetreat(state) {
  const ids = pageIdsFor(state);
  return Boolean(ids && state.page > 0);
}

function paintAdvance() {
  const button = document.querySelector("#advance");
  const state = latest?.state;
  if (!button || !state) return;
  const label = speech.done ? passageLabel(state) : "";
  button.hidden = !label;
  button.textContent = label || "繼續";
}

function paintRetreat() {
  const button = document.querySelector("#retreat");
  const state = latest?.state;
  if (!button || !state) return;
  button.hidden = !speech.done || !canRetreat(state);
}

function paintChrome() {
  const { state, send } = latest;
  const ended = Boolean(state.ending);
  const kickerEl = document.querySelector("#ending-kicker");
  const phase = ended
    ? { kicker: "結局", block: endingNames[state.ending] }
    : state.beat === "prologue"
      ? { kicker: "開場", block: "入閣" }
      : (PHASES[state.phase] ?? PHASES[7]);
  document.querySelector("#kicker").textContent = phase.kicker;
  document.querySelector("#block-name").textContent = phase.block;
  if (kickerEl) {
    const kid = ended ? endingKickerId(state.ending) : null;
    const sub = kid ? lines[kid]?.[0] ?? "" : "";
    kickerEl.textContent = sub;
    kickerEl.hidden = !sub;
  }
  document.querySelector("#progress").textContent = progressText(state);
  paintScene(state);

  const inPlay = state.beat === "play" && !state.flags.letterOpen;
  document.querySelector(".bag-wrap").hidden = ended;
  document.querySelector(".verbs").hidden = ended || !inPlay;
  document.querySelector("#hint").hidden = ended;
  paintRestart(state, ended);
  const use = document.querySelector("#use");
  if (use) use.disabled = !inPlay || Boolean(state.pending) || glanceOpen(state) || animBusy();
  document.querySelector("#close-letter").hidden = true;
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

function paintRestart(state, ended) {
  const wrap = document.querySelector("#ending-actions");
  const restart = document.querySelector("#restart");
  const saveCard = document.querySelector("#save-card");
  if (!wrap || !restart || !saveCard) return;
  if (!ended) {
    window.clearTimeout(restartDelayTimer);
    restartDelayKey = "";
    wrap.hidden = true;
    return;
  }
  const ids = endingPageIds(state.ending, state);
  const onLast = state.page >= ids.length - 1;
  const key = `${state.ending}:${state.page}:${speech.done}`;
  if (!onLast || !speech.done) {
    wrap.hidden = true;
    return;
  }
  if (restartDelayKey === key) return;
  restartDelayKey = key;
  window.clearTimeout(restartDelayTimer);
  wrap.hidden = true;
  const delay = reducedMotion ? 0 : 1200;
  restartDelayTimer = window.setTimeout(() => {
    if (latest?.state?.ending === state.ending && latest.state.page === state.page) {
      wrap.hidden = false;
    }
  }, delay);
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
  if (state.beat === "cheat") return { center: "wall", row: [] };
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
  if (state.phase === 5 && (state.beat === "clear" || state.beat === "offer")) return { center: "bowl", row: [] };
  if (state.phase === 5) return { center: "shelf", row: ["hongre", "hanyin", "xuelian", "qingre"] };
  if (state.phase === 6 && state.beat === "offer") return { center: "screen", row: ["blade"] };
  if (state.phase === 6) return { center: "screen", row: [] };
  if (state.phase === 7) {
    const row = ["baihu", "qinglong"];
    if (state.inventory.includes("pill")) row.push("pill");
    if (state.inventory.includes("acid_smear")) row.push("smear");
    if (state.inventory.includes("blade")) row.push("blade");
    return { center: "elder", row };
  }
  return { center: "wall", row: [] };
}

function paintScene(state, now = performance.now()) {
  const canvas = document.querySelector("#scene");
  if (!canvas || !state) return;
  const base = sceneFor(state);
  const overlay = stageView(state, now);
  paintStage(canvas, {
    center: overlay.center || base.center,
    row: overlay.row ?? base.row
  }, overlay);
}

function progressText(state) {
  if (state.flags.letterOpen) return "信還攤在手上。";
  if (state.beat === "cheat" || state.beat === "prologue" || state.beat === "enter" || state.beat === "clear") return "這段還沒說完。";
  if (state.beat === "offer" && state.phase === 5) return "碗底還留著餘膏。";
  if (state.beat === "offer" && state.phase === 6) return "短刃還掛在屏風旁。";
  if (state.phase >= 1 && state.phase <= 4) {
    const sequence = currentSequence(state);
    if (sequence.length === 0) return "尚未按下。";
    return `已按 ${sequence.map((id) => LABELS[id] ?? id).join("、")}`;
  }
  if (state.phase === 5) return doseSummary();
  if (state.phase === 6) return "排好四句再提交。";
  if (state.ending) return endingNames[state.ending];
  if (!state.flags.introDone) return "他的話還沒說完。";
  if (state.timer?.pausedByLetter) return "讀信時，香暫停。";
  if (state.flags.chainsFreed) return "鏈開了。青龍才是兩人走的路。";
  if (state.flags.pillPlaced) return "丹留下了。青龍是你一個人走的門。";
  return hints.finale;
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
  if (state.phase === 4) return state.sequences.ko;
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
    button.setAttribute("aria-pressed", String(selected === id));
    button.addEventListener("click", () => {
      selected = selected === id ? null : id;
      focus = selected;
      repaint();
    });
    bag.append(button);
  }
}

function paintHint(state) {
  const hint = document.querySelector("#hint");
  if (state.beat === "cheat" || state.beat === "prologue" || state.beat === "enter" || state.beat === "clear") {
    hint.textContent = hints.passage;
    return;
  }
  if (state.flags.letterOpen) {
    hint.textContent = hints.letter;
    return;
  }
  if (state.beat === "offer" && state.phase === 5) {
    hint.textContent = hints.smear;
    return;
  }
  if (state.beat === "offer") {
    hint.textContent = hints.blade;
    return;
  }
  if (state.phase === 1) hint.textContent = hints.bagua;
  else if (state.phase === 2) {
    if (!state.inventory.includes("needle")) hint.textContent = hints.needleMissing;
    else if (!state.flags.needleReady) hint.textContent = hints.needleSheathed;
    else hint.textContent = hints.needleReady;
  } else if (state.phase === 3) hint.textContent = hints.wuxing;
  else if (state.phase === 4) hint.textContent = hints.ko;
  else if (state.phase === 5) hint.textContent = hints.brew;
  else if (state.phase === 6) hint.textContent = hints.sword;
  else if (!state.flags.introDone) hint.textContent = hints.finaleLocked;
  else hint.textContent = hints.finale;
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
  if (state.ending || state.flags.letterOpen) return;
  if (state.beat === "offer" && state.phase === 5) {
    paintOffer(puzzle, "smear", "刮起", "不刮", send);
    return;
  }
  if (state.beat === "offer" && state.phase === 6) {
    paintOffer(puzzle, "blade", "取下", "不取", send);
    return;
  }
  if (state.beat !== "play") return;
  if (state.phase === 1) appendChoices(puzzle, trigrams, "bagua", new Set(state.sequences.bagua), send);
  else if (state.phase === 2) appendChoices(puzzle, acupoints, "acupoint", new Set(state.sequences.acupoint), send);
  else if (state.phase === 3) appendChoices(puzzle, elements, "wuxing", new Set(state.sequences.wuxing), send);
  else if (state.phase === 4) appendChoices(puzzle, koMoves, "ko", new Set(state.sequences.ko), send);
  else if (state.phase === 5) paintBrew(puzzle);
  else if (state.phase === 6) paintSword(puzzle, state, send);
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
  if (glanceOpen(state) || animBusy()) return;
  if (state.pending) {
    paintOffer(parent, "finale", "就這樣", "先不", send);
    return;
  }
  const ready = state.flags.introDone;
  addAction(parent, "白虎石", ready, () => {
    focus = null;
    send({ type: "propose", choice: "baihu" });
  });
  addAction(parent, "青龍石", ready, () => {
    focus = null;
    send({ type: "propose", choice: "qinglong" });
  });
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
  const show = state.beat === "play" && !state.flags.letterOpen && (state.phase === 5 || state.phase === 6);
  submit.hidden = !show;
  submit.disabled = !show;
  submit.title = show ? "送出這一關" : "";
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
  document.querySelector("#advance").addEventListener("click", () => {
    if (!speech.done || !latest) return;
    focus = null;
    if (glanceOpen(latest.state)) latest.send({ type: "acknowledge" });
    else latest.send({ type: "advance" });
  });
  document.querySelector("#retreat").addEventListener("click", () => {
    if (!speech.done) return;
    focus = null;
    latest?.send({ type: "retreat" });
  });
  document.querySelector("#speech").addEventListener("click", finishSpeech);
  document.querySelector("#inspect").addEventListener("click", () => {
    if (!latest) return;
    if (selected) {
      focus = selected;
      latest.send({ type: "inspect", target: selected });
      return;
    }
    const targets = INSPECTS[latest.state.phase] ?? [];
    if (targets.length === 0) {
      latest.send({ type: "inspect", target: "barren" });
      return;
    }
    inspectOpen = !inspectOpen;
    repaint();
  });
  document.querySelector("#use").addEventListener("click", () => {
    if (!latest || document.querySelector("#use").disabled) return;
    const choice = selected === "blade" ? "blade" : selected === "pill" ? "pill" : selected === "acid_smear" ? "smear" : "";
    if (latest.state.phase === 7 && choice) {
      latest.send({ type: "propose", choice });
      return;
    }
    latest.send({ type: "useItem", itemId: selected });
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
  document.querySelector("#save-card").addEventListener("click", async () => {
    if (!latest?.state?.ending) return;
    const button = document.querySelector("#save-card");
    button.disabled = true;
    try {
      await openCardPreview(latest.state);
    } finally {
      button.disabled = false;
    }
  });
  document.querySelector("#card-modal-save").addEventListener("click", () => {
    if (!preparedCard) return;
    savePreparedCard(preparedCard);
    closeCardPreview();
  });
  document.querySelector("#card-modal-close").addEventListener("click", () => {
    closeCardPreview();
  });
  document.querySelector("#card-modal").addEventListener("click", (event) => {
    if (event.target === document.querySelector("#card-modal")) closeCardPreview();
  });
  document.querySelector("#submit").addEventListener("click", () => {
    if (!latest || document.querySelector("#submit").disabled) return;
    const { state, send } = latest;
    focus = null;
    if (state.phase === 5) {
      send({ type: "submit", puzzleId: "brew", recipe: { ...brewForm } });
    } else if (state.phase === 6 && state.beat === "play") {
      send({ type: "submit", puzzleId: "sword" });
    }
  });
}

async function openCardPreview(state) {
  releasePreparedCard(preparedCard);
  preparedCard = await prepareEndingCard(state, getSpriteSheet());
  if (!preparedCard) return;
  const modal = document.querySelector("#card-modal");
  const img = document.querySelector("#card-modal-img");
  const ask = document.querySelector("#card-modal-ask");
  const title = document.querySelector("#card-modal-title");
  img.src = preparedCard.url;
  ask.textContent = preparedCard.details.ask;
  title.textContent = `${preparedCard.details.endingName} · 結局卡`;
  modal.hidden = false;
}

function closeCardPreview() {
  const modal = document.querySelector("#card-modal");
  const img = document.querySelector("#card-modal-img");
  if (modal) modal.hidden = true;
  if (img) img.removeAttribute("src");
  releasePreparedCard(preparedCard);
  preparedCard = null;
}

const timerBar = document.querySelector("#timer-bar");
for (let i = 0; i < 10; i += 1) timerBar.append(document.createElement("span"));

motionQuery.addEventListener("change", () => {
  reducedMotion = motionQuery.matches;
  setReducedMotion(reducedMotion);
  if (reducedMotion && !speech.done) finishSpeech();
});

bindStatic();
loadSprites();
onSprites(() => {
  if (latest) paintScene(latest.state);
});
