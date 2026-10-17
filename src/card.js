/** 結局紀念圖卡：可預覽、確認後下載，標註本局細節。 */

import { endingNames, items, lines, timerMs } from "./content.js";
import { endingKickerId, endingPageIds } from "./endings.js";
import { CELL, COLUMNS, FRAME_NAMES } from "./sprite-frames.js";

const W = 720;
const H = 1100;

const FRAME_BY_ENDING = {
  wolf: "baihu",
  flee: "qinglong",
  sever: "pill",
  ember: "elder",
  buried: "fuse_3"
};

const EPITAPH = {
  wolf: "深宮無雨，閣內有火。恨還在，只是不知該指向誰。",
  flee: "門在背後闔上。山風過袖，什麼都不替你記住。",
  sever: "這一夜沒有再殺，也沒有和解。你帶走的只有腳步聲。",
  ember: "你沒有原諒他，卻沒讓這座閣把話說死。兩影投在山道上。",
  buried: "兩塊石頭之間，誰也沒有選。許多年後，只當這裡塌過一截山。"
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
  const letterRead = Boolean(state.flags.letterRead);
  const bladeOffered = Boolean(state.flags.bladeOffered);
  const pillPlaced = Boolean(state.flags.pillPlaced);
  const chainsFreed = Boolean(state.flags.chainsFreed);
  const smearOffered = Boolean(state.flags.smearOffered);
  const bag = state.inventory.map((id) => items[id]).filter(Boolean);
  const pages = endingPageIds(ending, state);
  const quoteId = pages[pages.length - 1];
  const openId = pages[0];
  const quote = lines[quoteId]?.[0] ?? "";
  const opening = lines[openId]?.[0] ?? "";
  const info = {
    ending,
    letterRead,
    hasBlade,
    bladeOffered,
    pillPlaced,
    chainsFreed,
    hasPill,
    hasSmear,
    smearOffered,
    remainingMs: typeof remainingMs === "number" ? remainingMs : null
  };

  return {
    title: "血鎖寒閣",
    subtitle: "密室逃脫 · 結局留念",
    ending,
    endingName: endingNames[ending],
    kicker: lines[endingKickerId(ending)]?.[0] ?? "",
    epitaph: EPITAPH[ending] ?? "",
    opening,
    quote,
    letterRead,
    hasBlade,
    bladeOffered,
    pillPlaced,
    chainsFreed,
    hasPill,
    hasSmear,
    smearOffered,
    remainingMs: info.remainingMs,
    bag,
    frame: FRAME_BY_ENDING[ending] ?? "sky",
    sealedLabel: sealedLabel(ending),
    pathLabel: pathLabel(info),
    marks: buildMarks(info),
    ask: "要將這張結局卡下載到裝置嗎?"
  };
}

function sealedLabel(ending) {
  if (ending === "buried") return "香盡封局 · 埋骨空山";
  if (ending === "wolf") return "白虎／短刃 · 孤狼飲血";
  if (ending === "flee") return "獨按青龍 · 獨行出閣";
  if (ending === "sever") return "丹後青龍 · 斬斷因果";
  if (ending === "ember") return "化鏈後青龍 · 薪火未熄";
  return "結算";
}

function pathLabel(info) {
  const bits = [];
  bits.push(info.letterRead ? "信已讀" : "信未展");
  if (info.bladeOffered) bits.push(info.hasBlade ? "刃在腰" : "刃未取");
  if (info.pillPlaced) bits.push("丹已置");
  else if (info.hasPill) bits.push("丹在袖");
  if (info.chainsFreed) bits.push("鏈已化");
  else if (info.hasSmear) bits.push("膏未用");
    if (info.ending === "buried" || info.remainingMs === 0) bits.push("香已盡");
  else if (info.remainingMs != null) bits.push(`香餘${Math.ceil(info.remainingMs / 1000)}秒`);
  return bits.join(" · ");
}

function buildMarks(info) {
  const marks = [];
  if (info.letterRead) {
    marks.push("密信：已展讀——知他頂罪，是為留你一命。");
  } else {
    marks.push("密信：始終未拆。封口仍乾，像從未寫過。");
  }

  if (info.bladeOffered && info.hasBlade) {
    marks.push("短刃：囊中有刃。最快的路，曾在腰間一寸。");
  } else if (info.bladeOffered) {
    marks.push("短刃：屏風前看過，終究沒有取下。");
  } else {
    marks.push("短刃：此局未逢。暗門旁那一柄，與你無緣。");
  }

  if (info.pillPlaced) {
    marks.push("解毒丹：已置石床邊。不叫醒，也不抱拳。");
  } else if (info.hasPill) {
    marks.push("解毒丹：仍溫袖底。你帶走了它，卻沒留下。");
  } else {
    marks.push("解毒丹：未得。雪蓮若進了碗，掌心便是空的。");
  }

  if (info.chainsFreed) {
    marks.push("鐵鏈：餘膏化開。兩人衝出塌石之前。");
  } else if (info.hasSmear) {
    marks.push("餘膏：刮起卻未用。鏈聲仍在，像雨點打舊瓦。");
  } else if (info.smearOffered) {
    marks.push("餘膏：未刮／未留。鏈仍鎖骨，話仍鎖在閣裡。");
  } else {
    marks.push("鐵鏈：仍鎖。石床上那個人，還在等一句答案。");
  }

  if (info.ending === "buried" || info.remainingMs === 0) {
    marks.push("香火：已盡。煙斷如針落地，沒有聲。");
  } else if (info.remainingMs != null) {
    const sec = Math.max(0, Math.ceil(info.remainingMs / 1000));
    const total = Math.round(timerMs / 1000);
    marks.push(`香火：封局時餘 ${sec}／${total} 秒。煙還斜著。`);
  }

  marks.push(`封局之路：${sealedLabel(info.ending)}`);
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
  ctx.fillRect(0, 0, W, 108);
  ctx.fillRect(0, H - 88, W, 88);

  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 14, W - 28, H - 28);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, W - 52, H - 52);

  ctx.textAlign = "center";
  ctx.fillStyle = CINNABAR;
  ctx.font = '26px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
  ctx.fillText(details.title, W / 2, 58);
  ctx.fillStyle = MUTE;
  ctx.font = '18px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
  ctx.fillText(details.subtitle, W / 2, 88);

  ctx.fillStyle = INK;
  ctx.font = '42px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
  ctx.fillText(details.endingName, W / 2, 156);
  if (details.kicker) {
    ctx.fillStyle = CINNABAR;
    ctx.font = '24px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
    ctx.fillText(`「${details.kicker}」`, W / 2, 194);
  }

  const artY = 220;
  const artSize = 168;
  const artX = Math.floor((W - artSize) / 2);
  ctx.fillStyle = "#14110e";
  ctx.fillRect(artX - 10, artY - 10, artSize + 20, artSize + 20);
  drawSprite(ctx, sheet, details.frame, artX, artY, artSize);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(artX - 10, artY - 10, artSize + 20, artSize + 20);

  let y = artY + artSize + 44;
  ctx.textAlign = "left";
  ctx.fillStyle = CINNABAR;
  ctx.font = '20px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
  ctx.fillText("本局評語", 56, y);
  y += 30;
  ctx.fillStyle = INK;
  ctx.font = '20px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
  y = wrapText(ctx, details.epitaph, 56, y, W - 112, 28, 3) + 18;

  if (details.quote) {
    ctx.fillStyle = CINNABAR;
    ctx.font = '20px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
    ctx.fillText("終章一句", 56, y);
    y += 30;
    ctx.fillStyle = MUTE;
    ctx.font = '18px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
    y = wrapText(ctx, details.quote, 56, y, W - 112, 26, 3) + 18;
  }

  ctx.fillStyle = CINNABAR;
  ctx.font = '20px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
  ctx.fillText("路途細節", 56, y);
  y += 28;
  ctx.fillStyle = MUTE;
  ctx.font = '18px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
  y = wrapText(ctx, details.pathLabel, 56, y, W - 112, 26, 2) + 16;

  ctx.fillStyle = INK;
  ctx.font = '18px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
  for (const line of details.marks) {
    y = wrapText(ctx, `· ${line}`, 56, y, W - 112, 26, 2) + 8;
  }

  y += 10;
  ctx.fillStyle = CINNABAR;
  ctx.font = '20px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
  ctx.fillText("囊中尚餘", 56, y);
  y += 28;
  ctx.fillStyle = MUTE;
  ctx.font = '18px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
  wrapText(ctx, details.bag.length ? details.bag.join("　") : "空——兩袖清風，或兩袖塵土。", 56, y, W - 112, 26, 2);

  ctx.textAlign = "center";
  ctx.fillStyle = MUTE;
  ctx.font = '18px "Fusion Pixel 12px Prop zh-Hant", sans-serif';
  ctx.fillText("寒閣一遊 · 留作紀念", W / 2, H - 48);

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

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxRows = 4) {
  let line = "";
  let row = 0;
  for (const ch of text) {
    const next = line + ch;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, y + row * lineHeight);
      line = ch;
      row += 1;
      if (row >= maxRows) {
        ctx.fillText(`${line}…`, x, y + row * lineHeight);
        return y + (row + 1) * lineHeight;
      }
    } else {
      line = next;
    }
  }
  if (line) {
    ctx.fillText(line, x, y + row * lineHeight);
    row += 1;
  }
  return y + row * lineHeight;
}

export async function prepareEndingCard(state, sheet) {
  const details = cardDetails(state);
  if (!details) return null;
  await document.fonts?.ready?.catch?.(() => {});
  const canvas = drawEndingCard(details, sheet);
  if (!canvas) return null;
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  return {
    details,
    canvas,
    blob,
    url,
    fileName: cardFileName(details)
  };
}

export function savePreparedCard(prepared) {
  if (!prepared?.url || !prepared?.fileName) return false;
  const link = document.createElement("a");
  link.href = prepared.url;
  link.download = prepared.fileName;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  return true;
}

export function releasePreparedCard(prepared) {
  if (prepared?.url) URL.revokeObjectURL(prepared.url);
}
