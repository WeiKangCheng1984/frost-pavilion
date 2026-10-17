import { brew, puzzles, sword, timerMs } from "./content.js";
import { endingLineId, resolveEnding } from "./endings.js";

const SWORD_IDS = ["lineA", "lineB", "lineC", "lineD"];

export function initialState() {
  return {
    schemaVersion: 1,
    phase: 1,
    inventory: [],
    flags: {
      letterRead: false,
      smearOffered: false,
      pillPlaced: false,
      chainsFreed: false,
      introDone: false,
      bladeOffered: false
    },
    sequences: {
      bagua: [],
      acupoint: [],
      wuxing: [],
      sword: [...sword.initial]
    },
    timer: null,
    ending: null,
    log: ["bagua.intro"]
  };
}

export function reduce(state, action) {
  if (!action || typeof action.type !== "string") return state;
  if (state.ending && action.type !== "restart") return state;

  switch (action.type) {
    case "inspect":
      return inspect(state, action.target);
    case "sequencePush":
      return sequencePush(state, action.puzzleId, action.token);
    case "sequenceReorder":
      return sequenceReorder(state, action.order);
    case "submit":
      return submit(state, action);
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
    case "skipIntro":
      return skipIntro(state);
    case "tick":
      return tick(state, action.ms);
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

function inspect(state, target) {
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
    letter: "letter.body",
    pill: "pill.inspect",
    acid_smear: "smear.inspect",
    blade: "blade.inspect"
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
  if (!puzzle || !puzzle.answer || state.phase !== puzzle.phase) return state;
  if (puzzle.requires?.some((id) => !has(state, id))) {
    return { ...state, log: [puzzle.blockedLine] };
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
    phase: state.phase + 1,
    inventory: gainAll(state.inventory, puzzle.grant),
    sequences: { ...state.sequences, [puzzleId]: next },
    log: [puzzle.successLine]
  };
}

function sequenceReorder(state, order) {
  if (state.phase !== sword.phase || !isSwordOrder(order)) return state;
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
  if (action.puzzleId === "ko") return submitKo(state, action.choice);
  if (action.puzzleId === "brew") return submitBrew(state, action.recipe);
  if (action.puzzleId === "sword") return submitSword(state);
  if (action.puzzleId === "ending") return submitEnding(state, action.choice);
  return state;
}

function submitKo(state, choice) {
  const puzzle = puzzles.ko;
  if (state.phase !== puzzle.phase) return state;
  if (choice !== puzzle.answer) return { ...state, log: [puzzle.failLine] };
  return {
    ...state,
    phase: state.phase + 1,
    inventory: gainAll(state.inventory, puzzle.grant),
    log: [puzzle.successLine]
  };
}

function brewOk(input) {
  if (!input) return false;
  return input.hongre === brew.recipe.hongre
    && input.hanyin === brew.recipe.hanyin
    && input.qingre === brew.recipe.qingre
    && input.xuelian === brew.recipe.xuelian;
}

function submitBrew(state, recipe) {
  if (state.phase !== brew.phase) return state;
  if (brew.requires.some((id) => !has(state, id))) {
    return { ...state, log: [brew.blockedLine] };
  }
  if (!brewOk(recipe)) return { ...state, log: [brew.failLine] };
  const inventory = recipe.setAsideSnow ? gain(state.inventory, "pill") : state.inventory;
  return {
    ...state,
    phase: state.phase + 1,
    inventory,
    log: [brew.successLine, brew.askLine]
  };
}

function submitSword(state) {
  if (state.phase !== sword.phase) return state;
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
    phase: state.phase + 1,
    timer: { remainingMs: timerMs, running: false, pausedByLetter: false, pausedByHidden: false },
    log: [sword.successLine, "blade.ask"]
  };
}

function submitEnding(state, choice) {
  if (state.phase !== 7 || !state.flags.introDone) return state;
  const ending = resolveEnding(state, choice);
  if (!ending) return state;
  return applyEnding(state, ending);
}

function offerAnswer(state, offer, answer) {
  if (answer !== "yes" && answer !== "no") return state;
  if (offer === "smear") return answerSmear(state, answer);
  if (offer === "blade") return answerBlade(state, answer);
  return state;
}

function answerSmear(state, answer) {
  if (state.phase !== 6 || state.flags.smearOffered) return state;
  return {
    ...state,
    inventory: answer === "yes" ? gain(state.inventory, "acid_smear") : state.inventory,
    flags: { ...state.flags, smearOffered: true },
    log: [answer === "yes" ? "brew.smearYes" : "brew.smearNo"]
  };
}

function answerBlade(state, answer) {
  if (state.phase !== 7 || state.flags.bladeOffered) return state;
  return {
    ...state,
    inventory: answer === "yes" ? gain(state.inventory, "blade") : state.inventory,
    flags: { ...state.flags, bladeOffered: true },
    log: ["ending.intro"]
  };
}

function placePill(state) {
  if (state.phase !== 7 || !state.flags.introDone || !has(state, "pill")) return state;
  return {
    ...state,
    inventory: lose(state.inventory, "pill"),
    flags: { ...state.flags, pillPlaced: true },
    log: ["ending.placePill"]
  };
}

function freeChains(state) {
  if (state.phase !== 7 || !state.flags.introDone || !has(state, "acid_smear")) return state;
  return {
    ...state,
    inventory: lose(state.inventory, "acid_smear"),
    flags: { ...state.flags, chainsFreed: true },
    log: ["ending.freeChains"]
  };
}

function openLetter(state) {
  if (!has(state, "letter")) return state;
  const next = {
    ...state,
    flags: { ...state.flags, letterRead: true },
    log: ["letter.body"]
  };
  if (!state.timer) return next;
  return {
    ...next,
    timer: { ...state.timer, pausedByLetter: true, running: false }
  };
}

function closeLetter(state) {
  if (!state.timer?.pausedByLetter) return state;
  return {
    ...state,
    timer: {
      ...state.timer,
      pausedByLetter: false,
      running: state.flags.introDone && !state.timer.pausedByHidden
    },
    log: [state.flags.introDone ? "letter.closed" : "ending.intro"]
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

function skipIntro(state) {
  if (state.phase !== 7 || state.flags.introDone || !state.timer) return state;
  return {
    ...state,
    flags: { ...state.flags, introDone: true },
    timer: {
      ...state.timer,
      running: !state.timer.pausedByLetter && !state.timer.pausedByHidden
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
  const line = endingLineId(ending, state.flags.letterRead);
  return {
    ...state,
    phase: "ending",
    ending,
    timer: state.timer
      ? {
          ...state.timer,
          running: false,
          pausedByLetter: false,
          remainingMs: ending === "buried" ? 0 : state.timer.remainingMs
        }
      : null,
    log: line ? [line] : state.log
  };
}
