export const MUTE_KEY = "frost-pavilion-mute";

const FULL_MS = 60000;

export function drumGap(remainingMs) {
  const span = Math.max(0, Math.min(FULL_MS, remainingMs));
  return 240 + (span / FULL_MS) * 960;
}

export function drumAllowed(state, { muted, unlocked }) {
  return Boolean(unlocked && !muted && state?.timer?.running && !state.ending);
}

export function readMuted(storage) {
  return storage.getItem(MUTE_KEY) === "1";
}

export function writeMuted(storage, muted) {
  storage.setItem(MUTE_KEY, muted ? "1" : "0");
}

export function createAudio(storage = localStorage) {
  let ctx = null;
  let noise = null;
  let muted = readMuted(storage);
  let unlocked = false;
  let nextAt = 0;

  function context() {
    if (!ctx) {
      ctx = new AudioContext();
      const frames = Math.floor(ctx.sampleRate * 0.03);
      noise = ctx.createBuffer(1, frames, ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < frames; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }
    return ctx;
  }

  function mark(drumming) {
    if (typeof document === "undefined") return;
    const live = Boolean(ctx && ctx.state === "running");
    document.documentElement.dataset.audio = unlocked ? (live ? "live" : "pending") : "locked";
    document.documentElement.dataset.drum = drumming && live ? "on" : "off";
  }

  function hit(audio) {
    tone(audio, { freq: 78, end: 46, dur: 0.1, vol: 0.22, burst: true });
  }

  function tone(audio, { freq, end = freq, dur = 0.1, vol = 0.18, burst = false, type = "sine" }) {
    if (!audio || audio.state !== "running") return;
    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (end !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, end), now + dur * 0.8);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(vol, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
    if (burst && noise) {
      const src = audio.createBufferSource();
      src.buffer = noise;
      const bg = audio.createGain();
      bg.gain.setValueAtTime(0.1, now);
      bg.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      src.connect(bg);
      bg.connect(audio.destination);
      src.start(now);
      src.stop(now + 0.04);
    }
  }

  function cue(name) {
    if (muted || !unlocked) return;
    const audio = context();
    if (audio.state === "suspended") audio.resume();
    if (name === "door") tone(audio, { freq: 90, end: 40, dur: 0.18, vol: 0.2, type: "triangle", burst: true });
    else if (name === "fire") tone(audio, { freq: 60, end: 30, dur: 0.22, vol: 0.24, type: "sawtooth", burst: true });
    else if (name === "gate") tone(audio, { freq: 140, end: 90, dur: 0.16, vol: 0.16, type: "square" });
    else if (name === "ruin") tone(audio, { freq: 50, end: 28, dur: 0.28, vol: 0.26, type: "sawtooth", burst: true });
    else if (name === "chain") tone(audio, { freq: 220, end: 110, dur: 0.12, vol: 0.14, type: "triangle", burst: true });
    else if (name === "needle") tone(audio, { freq: 880, end: 440, dur: 0.06, vol: 0.1, type: "sine" });
    else if (name === "wood") tone(audio, { freq: 180, end: 120, dur: 0.08, vol: 0.12, type: "triangle" });
    else if (name === "crack") tone(audio, { freq: 100, end: 60, dur: 0.1, vol: 0.14, type: "square", burst: true });
    else if (name === "fuse") tone(audio, { freq: 320, end: 80, dur: 0.2, vol: 0.1, type: "sine" });
    else if (name === "joke") {
      tone(audio, { freq: 520, end: 520, dur: 0.06, vol: 0.1, type: "square" });
      setTimeout(() => tone(context(), { freq: 390, end: 390, dur: 0.08, vol: 0.1, type: "square" }), 90);
    } else tone(audio, { freq: 200, end: 150, dur: 0.08, vol: 0.1, type: "sine" });
  }

  mark(false);

  return {
    get muted() {
      return muted;
    },
    unlock() {
      const audio = context();
      unlocked = true;
      if (audio.state === "suspended") audio.resume();
      mark(false);
    },
    toggle() {
      muted = !muted;
      writeMuted(storage, muted);
      nextAt = 0;
      mark(false);
    },
    playCue(name) {
      cue(name);
    },
    sync(state, now = performance.now()) {
      if (!drumAllowed(state, { muted, unlocked })) {
        nextAt = 0;
        mark(false);
        return;
      }
      if (nextAt === 0 || now >= nextAt) {
        hit(context());
        nextAt = now + drumGap(state.timer.remainingMs);
      }
      mark(true);
    }
  };
}
