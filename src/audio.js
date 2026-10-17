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
    if (audio.state !== "running") return;
    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(78, now);
    osc.frequency.exponentialRampToValueAtTime(46, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + 0.1);

    const burst = audio.createBufferSource();
    burst.buffer = noise;
    const burstGain = audio.createGain();
    burstGain.gain.setValueAtTime(0.12, now);
    burstGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
    burst.connect(burstGain);
    burstGain.connect(audio.destination);
    burst.start(now);
    burst.stop(now + 0.03);
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
