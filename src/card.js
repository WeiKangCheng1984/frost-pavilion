/** 結局紀念圖卡：可下載分享，標註本局細節。 */

import { endingNames, items, lines, timerMs } from "./content.js";
import { endingKickerId } from "./endings.js";
import { CELL, COLUMNS, FRAME_NAMES } from "./sprite-frames.js";

const W = 720;
const H = 900;

const FRAME_BY_ENDING = {
  wolf: "baihu",
  flee: "qinglong",
  sever: "pill",
  ember: "elder",
  buried: "fuse_3"
};

const PAPER = "#efe6d4";
const PAPER_DEEP = "#e4d8c2";
const INK = "#1c1612";
const MUTE = "#5e564c";
const CINNABAR = "#8d2f2a";
const LINE = "#c9b896";

export function cardDetails(state) {
  const ending = state?.ending;
  if (!ending || !endingNames[ending]) return null;
  const remainingMs = state.timer?.remainingMs;
  const hasPill = state.inventory.includes("pill");
  const hasBlade = state.inventory.includes("blade");
  const hasSmear = state.inventory.includes("acid_smear");
  const bag = state.inventory
    .map((id) => items[id])
    .filter(Boolean);

  return {
    title: "血鎖寒閣",
    ending,
    endingName: endingNames[ending],
    kicker: lines[endingKickerId(ending)]?.[0] ?? "",
    letterRead: Boolean(state.flags.letterRead),
    hasBlade,
    bladeOffered: Boolean(state.flags.bladeOffered),
    pillPlaced: Boolean(state.flags.pillPlaced),
    chainsFreed: Boolean(state.flags.chainsFreed),
    hasPill,
    hasSmear,
    smearOffered: Boolean(state.flags.smearOffered),
    remainingMs: typeof remainingMs === "number" ? remainingMs : null,
    bag,
    frame: FRAME_BY_ENDING[ending] ?? "sky",
    sealedLabel: sealedLabel(ending),
    marks: buildMarks({
      ending,
      letterRead: Boolean(state.flags.letterRead),
      hasBlade,
      bladeOffered: Boolean(state.flags.bladeOffered),
      pillPlaced: Boolean(state.flags.pillPlaced),
      chainsFreed: Boolean(state.flags.chainsFreed),
      hasPill,
      hasSmear,
      smearOffered: Boolean(state.flags.smearOffered),
      remainingMs: typeof remainingMs === "number" ? remainingMs : null
    })
  };
}

function sealedLabel(ending) {
  if (ending === "buried") return "香盡封局";
  if (ending === "wolf") return "白虎／短刃";
  if (ending === "flee") return "獨按青龍";
  if (ending === "sever") return "丹後青龍";
  if (ending === "ember") return "化鏈後青龍";
  return "結算";
}

function buildMarks(info) {
  const marks = [];
  marks.push(info.letterRead ? "密信：已讀" : "密信：未展");
  if (info.bladeOffered) marks.push(info.hasBlade ? "短刃：囊中有刃" : "短刃：看過未取");
  else marks.push("短刃：未遇");
  if (info.pillPlaced) marks.push("解毒丹：已置石床");
  else if (info.hasPill) marks.push("解毒丹：仍在袖裡");
  else marks.push("解毒丹：未得");
  if (info.chainsFreed) marks.push("鐵鏈：已化開");
  else if (info.hasSmear) marks.push("餘膏：未用");
  else if (info.smearOffered) marks.push("餘膏：未刮／未留");
  else marks.push("鐵鏈：仍鎖");
  if (info.ending === "buried" || info.remainingMs === 0) marks.push("香：已盡");
  else if (info.remainingMs != null) {
    const sec = Math.max(0, Math.ceil(info.remainingMs / 1000));
    const total = Math.round(timerMs / 1000);
    marks.push(`香：餘 ${sec}／${total} 秒`);
  }
  marks.push(`封局：${sealedLabel(info.ending)}`);
  return marks;
}

export function cardFileName(details) {
  const name = details?.endingName ?? "結局";
  return `血鎖寒閣-${name}.png`;
}

export function drawEndingCard(details, sheet) {
  if (!details) return null;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = PAPER_DEEP;
  ctx.fillRect(0, 0, W, 96);
  ctx.fillRect(0, H - 72, W, 72);

  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, W - 32, H - 32);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  ctx.fillStyle = CINNABAR;
  ctx.font = '28px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(details.title, W / 2, 70);

  ctx.fillStyle = INK;
  ctx.font = '44px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
  ctx.fillText(details.endingName, W / 2, 150);

  if (details.kicker) {
    ctx.fillStyle = MUTE;
    ctx.font = '24px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
    ctx.fillText(details.kicker, W / 2, 190);
  }

  const artY = 230;
  const artSize = 192;
  const artX = Math.floor((W - artSize) / 2);
  ctx.fillStyle = "#14110e";
  ctx.fillRect(artX - 12, artY - 12, artSize + 24, artSize + 24);
  drawSprite(ctx, sheet, details.frame, artX, artY, artSize);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(artX - 12, artY - 12, artSize + 24, artSize + 24);

  ctx.textAlign = "left";
  ctx.fillStyle = CINNABAR;
  ctx.font = '22px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
  ctx.fillText("本局細節", 64, 480);

  ctx.fillStyle = INK;
  ctx.font = '22px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
  details.marks.forEach((line, index) => {
    ctx.fillText(`· ${line}`, 64, 520 + index * 36);
  });

  const bagY = 520 + details.marks.length * 36 + 28;
  ctx.fillStyle = CINNABAR;
  ctx.fillText("囊中尚餘", 64, bagY);
  ctx.fillStyle = MUTE;
  ctx.font = '20px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
  const bagLine = details.bag.length ? details.bag.join("　") : "空";
  wrapText(ctx, bagLine, 64, bagY + 34, W - 128, 28);

  ctx.textAlign = "center";
  ctx.fillStyle = MUTE;
  ctx.font = '18px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
  ctx.fillText("寒閣一遊 · 留作紀念", W / 2, H - 40);

  return canvas;
}

function drawSprite(ctx, sheet, name, x, y, size) {
  if (!sheet || !FRAME_NAMES.includes(name)) {
    ctx.fillStyle = PAPER_DEEP;
    ctx.fillRect(x, y, size, size);
    return;
  }
  const index = FRAME_NAMES.indexOf(name);
  const sx = (index % COLUMNS) * CELL;
  const sy = Math.floor(index / COLUMNS) * CELL;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sheet, sx, sy, CELL, CELL, x, y, size, size);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  let line = "";
  let row = 0;
  for (const ch of text) {
    const next = line + ch;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, y + row * lineHeight);
      line = ch;
      row += 1;
      if (row >= 3) {
        ctx.fillText(`${line}…`, x, y + row * lineHeight);
        return;
      }
    } else {
      line = next;
    }
  }
  if (line) ctx.fillText(line, x, y + row * lineHeight);
}

export async function downloadEndingCard(state, sheet) {
  const details = cardDetails(state);
  if (!details) return false;
  await document.fonts?.ready?.catch?.(() => {});
  const canvas = drawEndingCard(details, sheet);
  if (!canvas) return false;
  const file = cardFileName(details);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file;
      link.rel = "noopener";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      resolve(true);
    }, "image/png");
  });
}
