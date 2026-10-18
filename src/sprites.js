import { CELL, COLUMNS, DETAIL, FRAME_NAMES, SCALE } from "./sprite-frames.js";

const STAGE_W = 384;
const STAGE_H = 216;
const indexOf = new Map(FRAME_NAMES.map((name, index) => [name, index]));

const MOOD = {
  ember: "rgba(141, 47, 42, 0.3)",
  mist: "rgba(61, 82, 112, 0.24)",
  cool: "rgba(138, 147, 163, 0.22)",
  dawn: "rgba(226, 177, 67, 0.14)",
  void: "rgba(20, 17, 14, 0.5)",
  ash: "rgba(44, 36, 28, 0.22)"
};

let sheet = null;
let sheetReady = false;
const waiting = [];

export function loadSprites() {
  sheet = new Image();
  sheet.decoding = "sync";
  sheet.src = new URL("../assets/sprites.png", import.meta.url).href;
  sheet.onload = () => {
    sheetReady = true;
    for (const fn of waiting) fn();
    waiting.length = 0;
  };
}

export function onSprites(fn) {
  if (sheetReady) fn();
  else waiting.push(fn);
}

export function getSpriteSheet() {
  return sheetReady ? sheet : null;
}

export function paintStage(canvas, scene, overlay = {}) {
  const ctx = canvas.getContext("2d");
  if (!ctx || !sheetReady) return;
  ctx.imageSmoothingEnabled = false;
  const shakeLv = Number(overlay.shake) || 0;
  const tick = Math.floor(performance.now() / (shakeLv >= 2 ? 28 : 40));
  const shakeX = shakeLv ? ((tick % 3) - 1) * shakeLv : 0;
  const shakeY = shakeLv >= 2 ? ((Math.floor(tick / 2) % 2) * 2 - 1) : 0;
  ctx.save();
  ctx.translate(shakeX, shakeY);
  ctx.fillStyle = "#14110e";
  ctx.fillRect(-2, 0, STAGE_W + 4, STAGE_H);

  const tile = CELL * DETAIL;
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < STAGE_W / tile; col += 1) {
      draw(ctx, "brick", col * tile, row * tile, DETAIL);
    }
  }

  const center = overlay.center || scene.center;
  const row = overlay.row ?? scene.row ?? [];
  const hero = CELL * SCALE;
  draw(ctx, center, Math.floor((STAGE_W - hero) / 2), 36, SCALE);

  if (overlay.fuse) {
    const urgency = overlay.ash > 0.4 ? DETAIL + 1 : DETAIL;
    const size = CELL * urgency;
    draw(ctx, overlay.fuse, STAGE_W - size - 6, 6, urgency);
  }

  const icon = CELL * DETAIL;
  const origin = Math.floor((STAGE_W - row.length * icon) / 2);
  row.forEach((name, index) => {
    draw(ctx, name, origin + index * icon, STAGE_H - icon - 2, DETAIL);
  });

  ctx.restore();

  const tint = MOOD[overlay.mood];
  if (tint) {
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  }

  if (overlay.ash > 0) {
    ctx.fillStyle = `rgba(20, 17, 14, ${Math.min(0.7, overlay.ash)})`;
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);
    if (overlay.ash > 0.35) {
      paintSmoke(ctx, overlay.ash, performance.now());
    }
  }
}

function paintSmoke(ctx, ash, now) {
  const n = 4 + Math.floor(ash * 6);
  ctx.fillStyle = `rgba(201, 184, 150, ${0.08 + ash * 0.1})`;
  for (let i = 0; i < n; i += 1) {
    const drift = ((now / 40) + i * 17) % (STAGE_H + 20);
    const x = 24 + ((i * 53) % (STAGE_W - 48));
    const y = STAGE_H - drift;
    const w = 3 + (i % 3);
    ctx.fillRect(x, y, w, w);
  }
}

function draw(ctx, name, x, y, scale) {
  const index = indexOf.get(name);
  if (index == null) return;
  const sx = (index % COLUMNS) * CELL;
  const sy = Math.floor(index / COLUMNS) * CELL;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sheet, sx, sy, CELL, CELL, x, y, CELL * scale, CELL * scale);
}
