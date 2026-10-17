import { CELL, COLUMNS, DETAIL, FRAME_NAMES, SCALE } from "./sprite-frames.js";

const STAGE_W = 384;
const STAGE_H = 216;
const indexOf = new Map(FRAME_NAMES.map((name, index) => [name, index]));

const MOOD = {
  ember: "rgba(141, 47, 42, 0.28)",
  mist: "rgba(61, 82, 112, 0.22)",
  cool: "rgba(138, 147, 163, 0.2)",
  dawn: "rgba(226, 177, 67, 0.16)",
  void: "rgba(20, 17, 14, 0.45)",
  ash: "rgba(44, 36, 28, 0.18)"
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
  const shake = overlay.shake ? ((Math.floor(performance.now() / 40) % 2) * 2 - 1) : 0;
  ctx.save();
  ctx.translate(shake, 0);
  ctx.fillStyle = "#14110e";
  ctx.fillRect(-2, 0, STAGE_W + 4, STAGE_H);

  const tile = CELL * DETAIL;
  const brickName = overlay.mood === "void" ? "brick" : "brick";
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < STAGE_W / tile; col += 1) {
      draw(ctx, brickName, col * tile, row * tile, DETAIL);
    }
  }

  const center = overlay.center || scene.center;
  const row = overlay.row ?? scene.row ?? [];
  const hero = CELL * SCALE;
  draw(ctx, center, Math.floor((STAGE_W - hero) / 2), 40, SCALE);

  if (overlay.fuse) {
    draw(ctx, overlay.fuse, STAGE_W - CELL * DETAIL - 8, 8, DETAIL);
  }

  const icon = CELL * DETAIL;
  const origin = Math.floor((STAGE_W - row.length * icon) / 2);
  row.forEach((name, index) => {
    draw(ctx, name, origin + index * icon, STAGE_H - icon, DETAIL);
  });

  ctx.restore();
  const tint = MOOD[overlay.mood];
  if (tint) {
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);
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
