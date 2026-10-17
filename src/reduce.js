import { brew, passages, puzzles, sword, timerMs } from "./content.js";
import { endingPageIds, resolveEnding } from "./endings.js";

const SWORD_IDS = ["lineA", "lineB", "lineC", "lineD"];

export function initialState() {
  return {
    schemaVersion: 4,
    phase: 1,
    beat: "prologue",
    page: 0,
    inventory: [],
    flags: {
      letterRead: false,
      smearOffered: false,
      pillPlaced: false,
      chainsFreed: false,
      introDone: false,
      bladeOffered: false,
      letterOpen: false,
      needleReady: false,
      scaleReady: false
    },
    sequences: {
      bagua: [],
      acupoint: [],
      wuxing: [],
      ko: [],
      sword: [...sword.initial]
    },
    timer: null,
    ending: null,
    pending: null,
    log: [passages.prologue[0]]
  };
}

const GLANCE = new Set([
  "bagua.poem",
  "wuxing.poem",
  "brew.herbs",
  "brew.scroll",
  "ko.hint",
  "inspect.barren"
]);

export function glanceOpen(state) {
  const id = state.log?.[0];
  if (typeof id !== "string") return false;
  return id.endsWith(".inspect") || GLANCE.has(id);
}

export function reduce(state, action) {
  if (!action || typeof action.type !== "string") return state;
  if (state.ending && !["restart", "advance", "retreat", "skipToFinale"].includes(action.type)) return state;

  switch (action.type) {
    case "inspect":
      return inspect(state, action.target);
    case "advance":
      return advance(state);
    case "retreat":
      return retreat(state);
    case "sequencePush":
      return sequencePush(state, action.puzzleId, action.token);
    case "sequenceReorder":
      return sequenceReorder(state, action.order);
    case "submit":
      return submit(state, action);
    case "useItem":
      return useItem(state, action.itemId);
    case "offerAnswer":
      return offerAnswer(state, action.offer, action.answer);
    case "placePill":
      return placePill(state);
    case "freeChains":
      return freeChains(state);
    case "openLetter":
      return openLetter(state);
    case "closeLetter":
      return closeLetter(state);
    case "conceal":
      return conceal(state);
    case "reveal":
      return reveal(state);
    case "tick":
      return tick(state, action.ms);
    case "acknowledge":
      return acknowledge(state);
    case "propose":
      return propose(state, action.choice);
    case "skipToFinale":
      return skipToFinale();
    case "restart":
      return initialState();
    default:
      return state;
  }
}

function has(state, id) {
  return state.inventory.includes(id);
}

function gain(inventory, id) {
  return inventory.includes(id) ? inventory : [...inventory, id];
}

function lose(inventory, id) {
  return inventory.filter((item) => item !== id);
}

function gainAll(inventory, ids) {
  return ids.reduce(gain, inventory);
}

function playing(state) {
  return state.beat === "play" && !state.flags.letterOpen;
}

function clearPassage(state) {
  if (state.phase === 5) {
    return has(state, "pill") ? passages.clear[5].with : passages.clear[5].none;
  }
  return passages.clear[state.phase];
}

function pageIds(state) {
  if (state.phase === "ending") return endingPageIds(state.ending, state);
  if (state.flags.letterOpen) return passages.letter;
  if (state.beat === "cheat") return ["cheat.joke"];
  if (state.beat === "prologue") return passages.prologue;
  if (state.beat === "enter") return passages.enter[state.phase];
  if (state.beat === "clear") return clearPassage(state);
  return null;
}

function retreat(state) {
  const ids = pageIds(state);
  if (!ids || state.page <= 0) return state;
  const page = state.page - 1;
  return { ...state, page, log: [ids[page]] };
}

function beginEnter(state, phase) {
  return {
    ...state,
    phase,
    beat: "enter",
    page: 0,
    log: [passages.enter[phase][0]]
  };
}

function advance(state) {
  const ids = pageIds(state);
  if (!ids) return state;
  if (state.page < ids.length - 1) {
    const page = state.page + 1;
    return { ...state, page, log: [ids[page]] };
  }
  if (state.ending) return state;
  if (state.flags.letterOpen) return closeLetter(state);
  return finishPassage(state);
}

function finishPassage(state) {
  if (state.beat === "cheat") {
    return {
      ...state,
      beat: "play",
      page: 0,
      flags: { ...state.flags, introDone: true },
      timer: {
        ...state.timer,
        running: !state.timer.pausedByLetter && !state.timer.pausedByHidden
      },
      log: ["finale.hold"]
    };
  }
  if (state.beat === "prologue") return beginEnter(state, 1);
  if (state.beat === "enter" && state.phase === 7) {
    return {
      ...state,
      beat: "play",
      page: 0,
      flags: { ...state.flags, introDone: true },
      timer: {
        ...state.timer,
        running: !state.timer.pausedByLetter && !state.timer.pausedByHidden
      }
    };
  }
  if (state.beat === "enter") return { ...state, beat: "play", page: 0 };
  if (state.beat !== "clear") return state;
  if (state.phase === 5) return { ...state, beat: "offer", page: 0, log: ["brew.askSmear"] };
  if (state.phase === 6) return { ...state, beat: "offer", page: 0, log: ["blade.ask"] };
  return beginEnter(state, state.phase + 1);
}

function inspect(state, target) {
  if (!playing(state)) return state;
  const table = {
    compass: "compass.inspect",
    poem: "bagua.poem",
    bronze: "bronze.inspect",
    wuxing: "wuxing.poem",
    board: "ko.hint",
    herbs: "brew.herbs",
    scroll: "brew.scroll",
    needle: "needle.inspect",
    scale: "scale.inspect",
    letter: "letter.1",
    pill: "pill.inspect",
    acid_smear: "smear.inspect",
    blade: "blade.inspect",
    barren: "inspect.barren"
  };
  const line = table[target];
  if (!line) return state;
  const itemTargets = ["needle", "scale", "letter", "pill", "acid_smear", "blade"];
  if (itemTargets.includes(target) && !has(state, target)) return state;
  return {
    ...state,
    flags: target === "letter" ? { ...state.flags, letterRead: true } : state.flags,
    log: [line]
  };
}

function sequencePush(state, puzzleId, token) {
  const puzzle = puzzles[puzzleId];
  if (!playing(state) || !puzzle || !puzzle.answer || state.phase !== puzzle.phase) return state;
  if (puzzle.requires?.some((id) => !has(state, id))) {
    return { ...state, log: [puzzle.blockedLine] };
  }
  if (puzzle.readyFlag && !state.flags[puzzle.readyFlag]) {
    return { ...state, log: [puzzle.unreadyLine] };
  }
  const prev = state.sequences[puzzleId];
  const expected = puzzle.answer[prev.length];
  if (token !== expected) {
    return {
      ...state,
      sequences: { ...state.sequences, [puzzleId]: [] },
      log: [puzzle.failLine]
    };
  }
  const next = [...prev, token];
  if (next.length < puzzle.answer.length) {
    return {
      ...state,
      sequences: { ...state.sequences, [puzzleId]: next },
      log: [puzzle.stepLine]
    };
  }
  return {
    ...state,
    beat: "clear",
    page: 0,
    inventory: gainAll(state.inventory, puzzle.grant),
    sequences: { ...state.sequences, [puzzleId]: next },
    log: [clearLine(state, gainAll(state.inventory, puzzle.grant))]
  };
}

function sequenceReorder(state, order) {
  if (!playing(state) || state.phase !== sword.phase || !isSwordOrder(order)) return state;
  return {
    ...state,
    sequences: { ...state.sequences, sword: [...order] }
  };
}

function isSwordOrder(order) {
  return Array.isArray(order)
    && order.length === SWORD_IDS.length
    && SWORD_IDS.every((id) => order.includes(id));
}

function submit(state, action) {
  if (action.puzzleId === "brew") return submitBrew(state, action.recipe);
  if (action.puzzleId === "sword") return submitSword(state);
  if (action.puzzleId === "ending") return submitEnding(state, action.choice);
  return state;
}

function clearLine(state, inventory) {
  if (state.phase === 5) return inventory.includes("pill") ? "clear.5.with.a" : "clear.5.none.a";
  return passages.clear[state.phase][0];
}

function brewOk(input) {
  if (!input) return false;
  return input.hongre === brew.recipe.hongre
    && input.hanyin === brew.recipe.hanyin
    && input.qingre === brew.recipe.qingre
    && input.xuelian === brew.recipe.xuelian;
}

function brewFailLine(recipe) {
  if (recipe?.qingre) return brew.failQing;
  if (recipe?.xuelian) return brew.failSnow;
  return brew.failRatio;
}

function submitBrew(state, recipe) {
  if (!playing(state) || state.phase !== brew.phase) return state;
  if (brew.requires.some((id) => !has(state, id)) || !state.flags.scaleReady) {
    return { ...state, log: [brew.blockedLine] };
  }
  if (!brewOk(recipe)) return { ...state, log: [brewFailLine(recipe)] };
  const inventory = recipe?.setAsideSnow ? gain(state.inventory, "pill") : state.inventory;
  return {
    ...state,
    beat: "clear",
    page: 0,
    inventory,
    log: [clearLine(state, inventory)]
  };
}

function submitSword(state) {
  if (!playing(state) || state.phase !== sword.phase) return state;
  const correct = sword.answer.every((id, index) => state.sequences.sword[index] === id);
  if (!correct) {
    return {
      ...state,
      sequences: { ...state.sequences, sword: [...sword.initial] },
      log: [sword.failLine]
    };
  }
  return {
    ...state,
    beat: "clear",
    page: 0,
    log: [clearLine(state, state.inventory)]
  };
}

function submitEnding(state, choice) {
  if (decisionSealed(state)) return state;
  if (state.phase !== 7 || !state.flags.introDone) return state;
  const ending = resolveEnding(state, choice);
  if (!ending) return state;
  return applyEnding(state, ending);
}

function offerAnswer(state, offer, answer) {
  if (answer !== "yes" && answer !== "no") return state;
  if (offer === "smear") return answerSmear(state, answer);
  if (offer === "blade") return answerBlade(state, answer);
  if (offer === "finale") return answerFinale(state, answer);
  return state;
}

function decisionSealed(state) {
  return Boolean(state.pending) || glanceOpen(state);
}

function askLine(state, choice) {
  if (choice === "baihu") return "finale.ask.baihu";
  if (choice === "blade") return "finale.ask.blade";
  if (choice === "pill") return "finale.ask.pill";
  if (choice === "smear") return "finale.ask.smear";
  if (state.flags.chainsFreed) return "finale.ask.qinglong.chains";
  if (state.flags.pillPlaced) return "finale.ask.qinglong.pill";
  return "finale.ask.qinglong";
}

function propose(state, choice) {
  if (!playing(state) || state.phase !== 7 || !state.flags.introDone) return state;
  if (decisionSealed(state)) return state;
  if (choice !== "baihu" && choice !== "qinglong" && choice !== "blade" && choice !== "pill" && choice !== "smear") return state;
  if (choice === "blade" && !has(state, "blade")) return state;
  if (choice === "pill" && !has(state, "pill")) return state;
  if (choice === "smear" && !has(state, "acid_smear")) return state;
  return { ...state, pending: choice, log: [askLine(state, choice)] };
}

function answerFinale(state, answer) {
  if (!state.pending || state.phase !== 7) return state;
  const choice = state.pending;
  const cleared = { ...state, pending: null };
  if (answer === "no") return { ...cleared, log: ["finale.hold"] };
  if (choice === "baihu") return submitEnding(cleared, "baihu");
  if (choice === "qinglong") return submitEnding(cleared, "qinglong");
  if (choice === "blade") return useBlade(cleared);
  if (choice === "pill") return placePill(cleared);
  if (choice === "smear") return freeChains(cleared);
  return cleared;
}

function acknowledge(state) {
  if (!playing(state) || !glanceOpen(state)) return state;
  return { ...state, log: ["finale.hold"] };
}

function skipToFinale() {
  const next = initialState();
  return {
    ...next,
    phase: 7,
    beat: "cheat",
    inventory: ["letter", "pill", "acid_smear", "blade"],
    flags: { ...next.flags, smearOffered: true, bladeOffered: true },
    timer: { remainingMs: timerMs, running: false, pausedByLetter: false, pausedByHidden: false },
    log: ["cheat.joke"]
  };
}

function answerSmear(state, answer) {
  if (state.phase !== 5 || state.beat !== "offer" || state.flags.smearOffered) return state;
  return beginEnter({
    ...state,
    inventory: answer === "yes" ? gain(state.inventory, "acid_smear") : state.inventory,
    flags: { ...state.flags, smearOffered: true }
  }, 6);
}

function answerBlade(state, answer) {
  if (state.phase !== 6 || state.beat !== "offer" || state.flags.bladeOffered) return state;
  return beginEnter({
    ...state,
    inventory: answer === "yes" ? gain(state.inventory, "blade") : state.inventory,
    flags: { ...state.flags, bladeOffered: true },
    timer: { remainingMs: timerMs, running: false, pausedByLetter: false, pausedByHidden: false }
  }, 7);
}

function useItem(state, itemId) {
  if (!playing(state)) return state;
  if (!itemId) return { ...state, log: ["use.none"] };
  if (!has(state, itemId)) return state;
  if (itemId === "needle") return useNeedle(state);
  if (itemId === "letter") return openLetter(state);
  if (itemId === "scale") return useScale(state);
  if (itemId === "pill") return placePill(state);
  if (itemId === "acid_smear") return freeChains(state);
  if (itemId === "blade") return useBlade(state);
  return state;
}

function useNeedle(state) {
  if (state.flags.needleReady) return { ...state, log: ["needle.spent"] };
  if (state.phase !== 2) return { ...state, log: ["needle.useless"] };
  return {
    ...state,
    flags: { ...state.flags, needleReady: true },
    log: ["needle.ready"]
  };
}

function useScale(state) {
  if (state.phase !== 5) return { ...state, log: ["scale.useless"] };
  if (state.flags.scaleReady) return { ...state, log: ["scale.again"] };
  return {
    ...state,
    flags: { ...state.flags, scaleReady: true },
    log: ["scale.ready"]
  };
}

function useBlade(state) {
  if (decisionSealed(state)) return state;
  if (state.phase !== 7 || !state.flags.introDone) return { ...state, log: ["blade.early"] };
  return submitEnding(state, "blade");
}

function placePill(state) {
  if (decisionSealed(state)) return state;
  if (!playing(state) || !has(state, "pill")) return state;
  if (state.phase !== 7 || !state.flags.introDone) return { ...state, log: ["pill.early"] };
  return {
    ...state,
    inventory: lose(state.inventory, "pill"),
    flags: { ...state.flags, pillPlaced: true },
    log: ["ending.placePill"]
  };
}

function freeChains(state) {
  if (decisionSealed(state)) return state;
  if (!playing(state) || !has(state, "acid_smear")) return state;
  if (state.phase !== 7 || !state.flags.introDone) return { ...state, log: ["smear.early"] };
  return {
    ...state,
    inventory: lose(state.inventory, "acid_smear"),
    flags: { ...state.flags, chainsFreed: true },
    log: ["ending.freeChains"]
  };
}

function openLetter(state) {
  if (!playing(state) || !has(state, "letter")) return state;
  const next = {
    ...state,
    page: 0,
    log: [passages.letter[0]],
    flags: { ...state.flags, letterRead: true, letterOpen: true }
  };
  if (!state.timer) return next;
  return {
    ...next,
    timer: { ...state.timer, pausedByLetter: true, running: false }
  };
}

function closeLetter(state) {
  if (!state.flags.letterOpen) return state;
  const next = {
    ...state,
    page: 0,
    log: ["letter.closed"],
    flags: { ...state.flags, letterOpen: false }
  };
  if (!state.timer) return next;
  return {
    ...next,
    timer: {
      ...state.timer,
      pausedByLetter: false,
      running: state.flags.introDone && !state.timer.pausedByHidden
    }
  };
}

function conceal(state) {
  if (!state.timer) return state;
  return {
    ...state,
    timer: { ...state.timer, pausedByHidden: true, running: false }
  };
}

function reveal(state) {
  if (!state.timer) return state;
  return {
    ...state,
    timer: {
      ...state.timer,
      pausedByHidden: false,
      running: state.flags.introDone && !state.timer.pausedByLetter
    }
  };
}

function tick(state, ms) {
  const timer = state.timer;
  if (!timer?.running || timer.pausedByLetter || timer.pausedByHidden) return state;
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms <= 0) return state;
  const remainingMs = timer.remainingMs - ms;
  if (remainingMs <= 0) return applyEnding(state, "buried");
  return { ...state, timer: { ...timer, remainingMs } };
}

function applyEnding(state, ending) {
  const pages = endingPageIds(ending, state);
  return {
    ...state,
    phase: "ending",
    beat: "ending",
    page: 0,
    pending: null,
    ending,
    timer: state.timer
      ? {
          ...state.timer,
          running: false,
          pausedByLetter: false,
          remainingMs: ending === "buried" ? 0 : state.timer.remainingMs
        }
      : null,
    log: pages.length ? [pages[0]] : state.log
  };
}
