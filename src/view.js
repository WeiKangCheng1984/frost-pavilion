import { acupoints, brew, elements, endingNames, herbs, hints, items, koMoves, lines, passages, trigrams, verses } from "./content.js";
import { endingKickerId, endingPageIds } from "./endings.js";
import { glanceOpen } from "./reduce.js";
import { animBusy, noteInspect, setReducedMotion, stageView, syncAnim } from "./anim.js";
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

/** 底欄「使用」短名，避免長物名擠爆手機底欄 */
const GRIP = {
  needle: "銀針",
  letter: "密信",
  scale: "秤",
  pill: "丹",
  acid_smear: "餘膏",
  blade: "短刃"
};

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = motionQuery.matches;
setReducedMotion(reducedMotion);
const debug = new URLSearchParams(location.search).has("debug");

let latest = null;
let inspectOpen = false;
let openPhase = 0;
let chromeKey = "";
let speech = { key: "", rows: [], count: 0, done: true, ready: true, timer: 0, readyTimer: 0 };
let bagOpen = false;
let menuOpen = false;
let hintNudge = "";
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
    hintNudge = "";
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
    else {
      paintAdvance();
      paintRetreat();
    }
  } else {
    paintAdvance();
    paintRetreat();
  }
}

function emptyBrew() {
  const form = { setAside: null };
  for (const herb of herbs) form[herb.id] = 0;
  return form;
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

function speechPace(len) {
  if (len <= 18) return 44;
  if (len <= 48) return 34;
  return 28;
}

function markSpeechReady() {
  speech.ready = true;
  paintSpeech();
  paintAdvance();
  if (latest) {
    paintHint(latest.state);
    if (glanceOpen(latest.state) || latest.state.ending) {
      document.querySelector(".speech-wrap")?.scrollIntoView({ block: "nearest" });
    }
  }
}

function beginSpeech(rows, key) {
  window.clearInterval(speech.timer);
  window.clearTimeout(speech.readyTimer);
  hintNudge = "";
  const instant = reducedMotion || key.length === 0;
  speech = {
    key,
    rows,
    count: instant ? key.length : 0,
    done: instant,
    ready: instant,
    timer: 0,
    readyTimer: 0
  };
  if (instant) return;
  const pace = speechPace(key.length);
  speech.timer = window.setInterval(() => {
    speech.count += 1;
    if (speech.count >= speech.key.length) {
      speech.count = speech.key.length;
      speech.done = true;
      window.clearInterval(speech.timer);
      speech.readyTimer = window.setTimeout(markSpeechReady, 160);
    }
    paintSpeech();
  }, pace);
}

function finishSpeech() {
  if (speech.done && speech.ready) return;
  window.clearInterval(speech.timer);
  window.clearTimeout(speech.readyTimer);
  speech.count = speech.key.length;
  speech.done = true;
  speech.ready = true;
  paintSpeech();
  paintAdvance();
  if (latest) paintHint(latest.state);
}

let speechPaint = "";

function paintSpeech() {
  const speechEl = document.querySelector("#speech");
  const skip = document.querySelector("#skip");
  if (!speechEl || !skip) return;
  const mark = `${speech.key}:${speech.count}:${speech.done}:${speech.ready}`;
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
  if (speech.ready && latest?.state?.ending) paintRestart(latest.state, true);
}

function passageLabel(state) {
  if (animBusy()) return "";
  /* 調查／窺閣一瞥：任何關都要能「繼續」收束，否則會卡死 */
  if (glanceOpen(state)) return "繼續";
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
  const label = speech.ready ? passageLabel(state) : "";
  const show = Boolean(label);
  button.hidden = !show;
  button.textContent = label || "繼續";
  button.classList.add("btn-primary");
  button.classList.toggle("is-pulse", show && glanceOpen(state));
}

function paintRetreat() {
  const button = document.querySelector("#retreat");
  const state = latest?.state;
  if (!button || !state) return;
  button.hidden = !speech.ready || !canRetreat(state);
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
  const bagWrap = document.querySelector(".bag-wrap");
  if (bagWrap) bagWrap.hidden = ended;
  document.querySelector("#hint").hidden = ended;
  document.querySelector("#inspect").hidden = ended;
  document.querySelector("#use").hidden = ended;
  paintRestart(state, ended);
  paintUseButton(inPlay, state);
  const inspectBtn = document.querySelector("#inspect");
  if (inspectBtn) {
    const inspectBlocked = !inPlay || Boolean(state.pending) || glanceOpen(state) || animBusy() || ended;
    inspectBtn.disabled = inspectBlocked;
    inspectBtn.title = inspectBlocked
      ? ""
      : selected
        ? `調查：${items[selected] ?? selected}`
        : "調查眼前之物";
    inspectBtn.setAttribute("aria-expanded", String(inspectOpen));
  }
  document.querySelector("#close-letter").hidden = true;
  document.querySelector("#debug-skip").hidden = !debug || ended || !state.timer?.running;

  if (!ended) {
    paintBag(state, send);
    paintHint(state);
    paintInspect(state, send);
  } else {
    inspectOpen = false;
    const panel = document.querySelector("#inspect-panel");
    if (panel) panel.hidden = true;
    const puzzle = document.querySelector("#puzzle");
    if (puzzle) puzzle.replaceChildren();
  }
  paintPuzzle(state, send);
  paintSubmit(state);
  paintBagChrome();
}

function isWideLayout() {
  return window.matchMedia("(min-width: 720px)").matches;
}

function paintUseButton(inPlay, state) {
  const use = document.querySelector("#use");
  if (!use) return;
  const blocked = !inPlay || Boolean(state.pending) || glanceOpen(state) || animBusy();
  const grip = selected ? (GRIP[selected] ?? items[selected] ?? selected) : "";
  use.disabled = blocked;
  use.textContent = grip ? `用·${grip}` : "使用";
  use.setAttribute("aria-pressed", String(Boolean(selected)));
  use.title = blocked
    ? ""
    : grip
      ? `使用：${items[selected] ?? selected}`
      : "先於囊中點選物品";
}

/** 擋操作時不寫系統旁白；若該按「繼續」，輕點一下底欄按鈕。 */
function cueContinue() {
  const btn = document.querySelector("#advance");
  if (!btn || btn.hidden) return;
  btn.classList.remove("is-cue");
  void btn.offsetWidth;
  btn.classList.add("is-cue");
}

function paintBagChrome() {
  const drawer = document.querySelector("#bag-drawer");
  const toggle = document.querySelector("#bag-toggle");
  const menu = document.querySelector("#menu");
  const menuToggle = document.querySelector("#menu-toggle");
  const title = document.querySelector("#bag-title");
  const wide = isWideLayout();
  if (drawer) {
    drawer.classList.toggle("is-open", wide || bagOpen);
    drawer.setAttribute("aria-hidden", wide ? "false" : String(!bagOpen));
  }
  if (toggle) {
    toggle.setAttribute("aria-expanded", String(Boolean(bagOpen)));
    toggle.hidden = Boolean(latest?.state?.ending);
  }
  if (menu) menu.hidden = !menuOpen;
  if (menuToggle) menuToggle.setAttribute("aria-expanded", String(menuOpen));
  if (title) {
    title.textContent = selected ? `囊 · ${items[selected] ?? selected}` : "囊";
  }
}

function openBag() {
  bagOpen = true;
  paintBagChrome();
}

function closeBag() {
  bagOpen = false;
  paintBagChrome();
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
  const key = `${state.ending}:${state.page}:${speech.ready}`;
  if (!onLast || !speech.ready) {
    wrap.hidden = true;
    return;
  }
  if (restartDelayKey === key) return;
  restartDelayKey = key;
  window.clearTimeout(restartDelayTimer);
  wrap.hidden = true;
  /* 結局末頁靜場一息，再出下載／重開（約 1.5～2 秒） */
  const delay = reducedMotion ? 0 : 1700;
  restartDelayTimer = window.setTimeout(() => {
    if (latest?.state?.ending === state.ending && latest.state.page === state.page && speech.ready) {
      wrap.hidden = false;
      openBag();
      wrap.scrollIntoView({ block: "nearest" });
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
  /* 敘事拍：頂欄留白，不寫「還沒說完」類系統句 */
  if (state.beat === "cheat" || state.beat === "prologue" || state.beat === "enter" || state.beat === "clear") return "";
  if (state.beat === "offer" && state.phase === 5) return "碗底還留著餘膏。";
  if (state.beat === "offer" && state.phase === 6) return "短刃還掛在屏風旁。";
  if (state.phase >= 1 && state.phase <= 4) {
    const sequence = currentSequence(state);
    if (sequence.length === 0) return "";
    return sequence.map((id) => LABELS[id] ?? id).join("、");
  }
  if (state.phase === 5) return doseSummary();
  if (state.phase === 6) return "";
  if (state.ending) return endingNames[state.ending];
  if (!state.flags.introDone) return "";
  if (state.timer?.pausedByLetter) return "讀信時，香暫停。";
  if (state.flags.chainsFreed) return "鏈開了。青龍才是兩人走的路。";
  if (state.flags.pillPlaced) return "丹留下了。青龍是你一個人走的門。";
  return "";
}

function doseSummary() {
  const text = herbs.map((herb) => `${herb.tag}${brewForm[herb.id] ?? 0}`).join(" ");
  if (!brewForm.setAside) return text;
  const picked = herbs.find((herb) => herb.id === brewForm.setAside);
  return `${text} 別置${picked?.name ?? brewForm.setAside}`;
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
  if (!bag) return;
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
      hintNudge = "";
      if (!isWideLayout()) openBag();
      repaint();
    });
    bag.append(button);
  }
}

function paintHint(state) {
  const hint = document.querySelector("#hint");
  if (!hint) return;
  if (hintNudge) {
    hint.textContent = hintNudge;
    return;
  }
  /* 換景、打字、未收的一瞥、敘事拍：框下留白，由對白與「繼續」承擔 */
  if (animBusy() || glanceOpen(state) || !speech.ready) {
    hint.textContent = "";
    return;
  }
  if (state.beat === "cheat" || state.beat === "prologue" || state.beat === "enter" || state.beat === "clear") {
    hint.textContent = "";
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
  if (selected && state.beat === "play") {
    const name = items[selected] ?? selected;
    hint.textContent = `${name}，握在掌心。`;
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
  else if (!state.flags.introDone) hint.textContent = "";
  else hint.textContent = hints.finale;
}

function paintInspect(state, send) {
  const panel = document.querySelector("#inspect-panel");
  if (!panel) return;
  const inPlay = state.beat === "play" && !state.flags.letterOpen && !state.ending;
  const targets = inPlay ? (INSPECTS[state.phase] ?? []) : [];
  const show = inspectOpen && targets.length > 0;
  panel.hidden = !show;
  panel.replaceChildren();
  if (!show) return;

  const head = document.createElement("div");
  head.className = "inspect-head";
  const lead = document.createElement("p");
  lead.className = "hand-label";
  lead.textContent = "要看何處";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "inspect-close";
  close.textContent = "合";
  close.setAttribute("aria-label", "收起調查");
  close.addEventListener("click", () => {
    inspectOpen = false;
    hintNudge = "";
    repaint();
  });
  head.append(lead, close);
  panel.append(head);

  const row = document.createElement("div");
  row.className = "inspect-targets";
  for (const item of targets) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.label;
    button.addEventListener("click", () => {
      focus = item.target;
      inspectOpen = false;
      hintNudge = "";
      send({ type: "inspect", target: item.target });
      noteInspect(item.target);
      paintScene(latest.state);
      repaint();
      document.querySelector(".speech-wrap")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    row.append(button);
  }
  panel.append(row);
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
  const asideRow = document.createElement("div");
  asideRow.className = "mix aside-row";
  const asideLabel = document.createElement("span");
  asideLabel.textContent = "別置";
  asideRow.append(asideLabel);
  const none = document.createElement("button");
  none.type = "button";
  none.textContent = "無";
  none.setAttribute("aria-pressed", String(!brewForm.setAside));
  none.addEventListener("click", () => {
    brewForm = { ...brewForm, setAside: null };
    repaint();
  });
  asideRow.append(none);
  for (const id of brew.asideChoices ?? []) {
    const herb = herbs.find((item) => item.id === id);
    if (!herb) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = herb.name;
    button.setAttribute("aria-pressed", String(brewForm.setAside === id));
    button.addEventListener("click", () => {
      brewForm = { ...brewForm, setAside: brewForm.setAside === id ? null : id };
      repaint();
    });
    asideRow.append(button);
  }
  parent.append(asideRow);
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
  for (const button of document.querySelectorAll("[data-mute]")) {
    button.setAttribute("aria-pressed", String(muted));
    button.textContent = muted ? "開聲" : "靜音";
  }
}

function bindStatic() {
  document.querySelector("#skip").addEventListener("click", finishSpeech);
  document.querySelector("#advance").addEventListener("click", () => {
    if (!speech.ready || !latest) return;
    if (animBusy()) {
      hintNudge = "";
      paintHint(latest.state);
      return;
    }
    focus = null;
    inspectOpen = false;
    hintNudge = "";
    if (glanceOpen(latest.state)) latest.send({ type: "acknowledge" });
    else latest.send({ type: "advance" });
  });
  document.querySelector("#retreat").addEventListener("click", () => {
    if (!speech.ready) return;
    focus = null;
    latest?.send({ type: "retreat" });
  });
  document.querySelector("#speech").addEventListener("click", finishSpeech);
  document.querySelector("#menu-toggle").addEventListener("click", () => {
    menuOpen = !menuOpen;
    paintBagChrome();
  });
  document.querySelector("#bag-toggle").addEventListener("click", () => {
    if (isWideLayout()) return;
    bagOpen = !bagOpen;
    paintBagChrome();
  });
  document.querySelector("#bag-close")?.addEventListener("click", () => {
    if (!isWideLayout()) closeBag();
  });
  document.querySelector("#inspect").addEventListener("click", () => {
    if (!latest) return;
    const state = latest.state;
    const blocked = state.ending
      || state.beat !== "play"
      || state.flags.letterOpen
      || glanceOpen(state)
      || animBusy()
      || Boolean(state.pending);
    if (blocked) {
      hintNudge = "";
      if (glanceOpen(state) || animBusy() || state.beat !== "play") cueContinue();
      paintHint(state);
      return;
    }
    hintNudge = "";
    if (selected) {
      focus = selected;
      inspectOpen = false;
      latest.send({ type: "inspect", target: selected });
      noteInspect(selected);
      return;
    }
    const targets = INSPECTS[state.phase] ?? [];
    if (targets.length === 0) {
      inspectOpen = false;
      latest.send({ type: "inspect", target: "barren" });
      noteInspect("barren");
      return;
    }
    inspectOpen = !inspectOpen;
    if (!isWideLayout()) closeBag();
    repaint();
    if (inspectOpen) {
      document.querySelector("#inspect-panel")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
  document.querySelector("#use").addEventListener("click", () => {
    if (!latest) return;
    const useBtn = document.querySelector("#use");
    if (useBtn?.disabled) {
      const st = latest.state;
      hintNudge = "";
      if (glanceOpen(st) || animBusy()) cueContinue();
      paintHint(st);
      return;
    }
    if (!selected) {
      hintNudge = "囊裡，先取一件。";
      inspectOpen = false;
      openBag();
      repaint();
      document.querySelector("#bag")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      return;
    }
    hintNudge = "";
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
      const recipe = { ...brewForm };
      delete recipe.setAsideSnow;
      send({ type: "submit", puzzleId: "brew", recipe });
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
if (timerBar) {
  for (let i = 0; i < 10; i += 1) timerBar.append(document.createElement("span"));
}

motionQuery.addEventListener("change", () => {
  reducedMotion = motionQuery.matches;
  setReducedMotion(reducedMotion);
  if (reducedMotion && !speech.done) finishSpeech();
});

bindStatic();
window.addEventListener("resize", () => {
  paintBagChrome();
});
loadSprites();
onSprites(() => {
  if (latest) paintScene(latest.state);
});
