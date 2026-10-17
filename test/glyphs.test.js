import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import zlib from "node:zlib";
import { acupoints, elements, endingNames, herbs, hints, items, koMoves, lines, trigrams, verses } from "../src/content.js";

const FONT = new URL("../assets/fonts/fusion-pixel-12px-proportional-zh_hant.otf.woff", import.meta.url);

test("劇本用字都在 Fusion Pixel 繁體裡", () => {
  const chars = cmapOf(fs.readFileSync(FONT));
  const missing = [];
  for (const [id, rows] of Object.entries(lines)) {
    for (const row of rows) {
      for (const ch of row) {
        if (!chars.has(ch.codePointAt(0))) missing.push(`${id}:${ch}`);
      }
    }
  }
  const labels = [
    ...Object.values(items),
    ...Object.values(verses),
    ...Object.values(endingNames),
    ...trigrams.map((item) => item.label),
    ...acupoints.map((item) => item.label),
    ...elements.map((item) => item.label),
    ...herbs.flatMap((item) => [item.name, item.tag]),
    ...koMoves.map((item) => item.label),
    ...Object.values(hints)
  ];
  for (const text of labels) {
    for (const ch of text) {
      if (!chars.has(ch.codePointAt(0))) missing.push(text);
    }
  }
  assert.deepEqual(missing, []);
});

test("失敗句不把正確序列念出來", () => {
  const joined = (id) => lines[id].join("");
  assert.equal(joined("bagua.fail").includes("震"), false);
  assert.equal(joined("acupoint.fail").includes("膻中"), false);
  assert.equal(joined("acupoint.fail").includes("氣海"), false);
  assert.equal(joined("acupoint.fail").includes("鳩尾"), false);
  assert.equal(joined("wuxing.fail").includes("木困"), false);
  assert.equal(joined("ko.fail").includes("別處"), false);
  assert.equal(joined("ko.fail").includes("劫"), false);
  for (const id of ["brew.fail.scale", "brew.fail.qing", "brew.fail.snow", "brew.fail.ratio"]) {
    assert.equal(/[0-9]/.test(joined(id)), false, id);
  }
  assert.equal(joined("sword.fail").includes("冤"), false);
});

function cmapOf(buf) {
  const numTables = buf.readUInt16BE(12);
  let cursor = 44;
  let cmap = null;
  for (let i = 0; i < numTables; i += 1) {
    const tag = buf.toString("latin1", cursor, cursor + 4);
    const offset = buf.readUInt32BE(cursor + 4);
    const comp = buf.readUInt32BE(cursor + 8);
    const orig = buf.readUInt32BE(cursor + 12);
    const slice = buf.subarray(offset, offset + comp);
    if (tag === "cmap") cmap = comp === orig ? slice : zlib.inflateSync(slice);
    cursor += 20;
  }
  const chars = new Set();
  const tables = cmap.readUInt16BE(2);
  for (let i = 0; i < tables; i += 1) {
    const sub = cmap.readUInt32BE(4 + i * 8 + 4);
    const format = cmap.readUInt16BE(sub);
    if (format === 4) addFormat4(cmap, sub, chars);
    if (format === 12) addFormat12(cmap, sub, chars);
  }
  return chars;
}

function addFormat4(cmap, sub, chars) {
  const segCount = cmap.readUInt16BE(sub + 6) / 2;
  const end0 = sub + 14;
  const start0 = end0 + segCount * 2 + 2;
  for (let seg = 0; seg < segCount; seg += 1) {
    const end = cmap.readUInt16BE(end0 + seg * 2);
    const start = cmap.readUInt16BE(start0 + seg * 2);
    if (end === 0xffff) continue;
    for (let code = start; code <= end; code += 1) chars.add(code);
  }
}

function addFormat12(cmap, sub, chars) {
  const groups = cmap.readUInt32BE(sub + 12);
  for (let group = 0; group < groups; group += 1) {
    const at = sub + 16 + group * 12;
    const start = cmap.readUInt32BE(at);
    const end = cmap.readUInt32BE(at + 4);
    for (let code = start; code <= end; code += 1) chars.add(code);
  }
}
