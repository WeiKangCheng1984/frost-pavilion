import { CELL, COLUMNS, DETAIL, FRAME_NAMES, SCALE } from "./sprite-frames.js";

const STAGE_W = 384;
const STAGE_H = 216;
const indexOf = new Map(FRAME_NAMES.map((name, index) => [name, index]));

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

export function paintStage(canvas, scene) {
  const ctx = canvas.getContext("2d");
  if (!ctx || !sheetReady) return;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#14110e";
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  const tile = CELL * DETAIL;
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < STAGE_W / tile; col += 1) {
      draw(ctx, "brick", col * tile, row * tile, DETAIL);
    }
  }
  const hero = CELL * SCALE;
  draw(ctx, scene.center, Math.floor((STAGE_W - hero) / 2), 40, SCALE);
  const row = scene.row ?? [];
  const icon = CELL * DETAIL;
  const origin = Math.floor((STAGE_W - row.length * icon) / 2);
  row.forEach((name, index) => {
    draw(ctx, name, origin + index * icon, STAGE_H - icon, DETAIL);
  });
}

function draw(ctx, name, x, y, scale) {
  const index = indexOf.get(name);
  if (index == null) return;
  const sx = (index % COLUMNS) * CELL;
  const sy = Math.floor(index / COLUMNS) * CELL;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sheet, sx, sy, CELL, CELL, x, y, CELL * scale, CELL * scale);
}
