import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import zlib from "node:zlib";
import { CELL, COLUMNS, FRAME_NAMES } from "../src/sprite-frames.js";

test("色盤最多十六色", () => {
  const colors = fs.readFileSync(new URL("../assets/palette.txt", import.meta.url), "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  assert.ok(colors.length > 0);
  assert.ok(colors.length <= 16);
  const hexes = colors.map((line) => line.split(/\s+/)[1]);
  assert.equal(new Set(hexes).size, hexes.length);
  for (const hex of hexes) assert.match(hex, /^#[0-9a-f]{6}$/);
});

test("精靈圖是十六像素格、沒有縫", () => {
  const png = fs.readFileSync(new URL("../assets/sprites.png", import.meta.url));
  const { width, height, colors } = decode(png);
  assert.equal(width % CELL, 0);
  assert.equal(height % CELL, 0);
  assert.equal(width / CELL, COLUMNS);
  assert.ok((width / CELL) * (height / CELL) >= FRAME_NAMES.length);
  assert.equal(new Set(FRAME_NAMES).size, FRAME_NAMES.length);
  assert.ok(colors.size <= 16);
});

function decode(png) {
  let offset = 8;
  const parts = [];
  let width = 0;
  let height = 0;
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString();
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    }
    if (type === "IDAT") parts.push(data);
    offset += 12 + length;
  }
  const raw = zlib.inflateSync(Buffer.concat(parts));
  const colors = new Set();
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = y * (width * 4 + 1) + 1 + x * 4;
      if (raw[at + 3] === 0) continue;
      colors.add(`${raw[at]},${raw[at + 1]},${raw[at + 2]}`);
    }
  }
  return { width, height, colors };
}
