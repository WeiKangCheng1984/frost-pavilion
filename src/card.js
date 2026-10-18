/** 結局紀念圖卡：可預覽、確認後下載，標註本局細節。 */

import { endingNames, items, lines, timerMs } from "./content.js";
import { endingKickerId, endingPageIds } from "./endings.js";
import { CELL, COLUMNS, FRAME_NAMES } from "./sprite-frames.js";

const W = 800;
const FONT = '"Fusion Pixel 12px Prop zh-Hant", sans-serif';
const MARGIN = 64;
const FOOTER = 100;
const ART = 232;

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
const VEIL = "#14110e";

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
  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) return null;
  const bodyH = layoutCard(probe, details, sheet, null);
  const H = Math.max(1480, bodyH + FOOTER);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  layoutCard(ctx, details, sheet, H);
  return canvas;
}

/** paint=null 時只量高；否則畫滿整張卡。回傳內容底緣 y。 */
function layoutCard(ctx, details, sheet, H) {
  const paint = H != null;
  if (paint) {
    paintPaper(ctx, H);
    paintFrame(ctx, H);
  }

  let y = 88;
  if (paint) {
    ctx.textAlign = "center";
    ctx.fillStyle = CINNABAR;
    ctx.font = `40px ${FONT}`;
    ctx.fillText(details.title, W / 2, y);
  }
  y += 42;
  if (paint) {
    ctx.fillStyle = MUTE;
    ctx.font = `26px ${FONT}`;
    ctx.fillText(details.subtitle, W / 2, y);
  }

  y += 64;
  if (paint) {
    ctx.fillStyle = INK;
    ctx.font = `72px ${FONT}`;
    ctx.fillText(details.endingName, W / 2, y);
  }
  y += 48;
  if (details.kicker) {
    if (paint) {
      ctx.fillStyle = CINNABAR;
      ctx.font = `34px ${FONT}`;
      ctx.fillText(`「${details.kicker}」`, W / 2, y);
    }
    y += 40;
  }

  y += 10;
  if (paint) y = paintSeal(ctx, details.sealedLabel, y);
  else y += 52;
  y += 28;

  if (paint) y = paintArt(ctx, sheet, details.frame, y);
  else y += ART + 28;
  y += 44;

  y = paintSection(ctx, "本局評語", details.epitaph, y, {
    labelSize: 26,
    bodySize: 32,
    lineHeight: 46,
    maxRows: 4,
    bodyColor: INK,
    paint
  });
  y += 28;

  if (details.quote) {
    y = paintSection(ctx, "終章一句", details.quote, y, {
      labelSize: 26,
      bodySize: 30,
      lineHeight: 44,
      maxRows: 4,
      bodyColor: MUTE,
      paint
    });
    y += 28;
  }

  if (paint) y = paintRule(ctx, y);
  else y += 2;
  y += 34;

  y = paintSection(ctx, "路途細節", details.pathLabel, y, {
    labelSize: 26,
    bodySize: 30,
    lineHeight: 44,
    maxRows: 3,
    bodyColor: MUTE,
    paint
  });
  y += 22;

  if (paint) {
    ctx.textAlign = "left";
    ctx.fillStyle = INK;
    ctx.font = `28px ${FONT}`;
  }
  for (const line of details.marks) {
    if (paint) {
      y = wrapText(ctx, `· ${line}`, MARGIN, y, W - MARGIN * 2, 40, 3) + 16;
    } else {
      y += measureWrap(ctx, `· ${line}`, W - MARGIN * 2, 40, 3) + 16;
    }
  }

  y += 20;
  if (paint) y = paintRule(ctx, y);
  else y += 2;
  y += 34;

  const bagText = details.bag.length ? details.bag.join("　") : "空——兩袖清風，或兩袖塵土。";
  y = paintSection(ctx, "囊中尚餘", bagText, y, {
    labelSize: 26,
    bodySize: 30,
    lineHeight: 44,
    maxRows: 3,
    bodyColor: MUTE,
    paint
  });

  if (paint) {
    ctx.textAlign = "center";
    ctx.fillStyle = MUTE;
    ctx.font = `26px ${FONT}`;
    ctx.fillText("寒閣一遊 · 留作紀念", W / 2, H - 56);
  }

  return y;
}

function paintPaper(ctx, H) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = PAPER_DEEP;
  ctx.fillRect(0, 0, W, 148);
  ctx.fillRect(0, H - FOOTER, W, FOOTER);

  /* 角隅淡點，不搶字 */
  ctx.fillStyle = "rgba(141, 47, 42, 0.12)";
  ctx.fillRect(48, 48, 10, 10);
  ctx.fillRect(W - 58, 48, 10, 10);
  ctx.fillRect(48, H - 58, 10, 10);
  ctx.fillRect(W - 58, H - 58, 10, 10);
}

function paintFrame(ctx, H) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.strokeRect(18, 18, W - 36, H - 36);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.strokeRect(34, 34, W - 68, H - 68);
  ctx.strokeStyle = CINNABAR;
  ctx.lineWidth = 1;
  ctx.strokeRect(44, 44, W - 88, H - 88);
}

function paintSeal(ctx, text, y) {
  ctx.font = `24px ${FONT}`;
  const padX = 18;
  const padY = 12;
  const tw = ctx.measureText(text).width;
  const boxW = tw + padX * 2;
  const boxH = 24 + padY * 2;
  const x = Math.floor((W - boxW) / 2);
  const top = y - 24;
  ctx.fillStyle = PAPER_DEEP;
  ctx.fillRect(x, top, boxW, boxH);
  ctx.strokeStyle = CINNABAR;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, top, boxW, boxH);
  ctx.fillStyle = CINNABAR;
  ctx.textAlign = "center";
  ctx.fillText(text, W / 2, y + 4);
  return top + boxH;
}

function paintArt(ctx, sheet, frame, top) {
  const artSize = ART;
  const artX = Math.floor((W - artSize) / 2);
  const pad = 16;
  ctx.fillStyle = VEIL;
  ctx.fillRect(artX - pad, top - pad, artSize + pad * 2, artSize + pad * 2);
  drawSprite(ctx, sheet, frame, artX, top, artSize);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(artX - pad, top - pad, artSize + pad * 2, artSize + pad * 2);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1;
  ctx.strokeRect(artX - pad + 7, top - pad + 7, artSize + pad * 2 - 14, artSize + pad * 2 - 14);
  return top + artSize + pad;
}

function paintRule(ctx, y) {
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(MARGIN, y);
  ctx.lineTo(W - MARGIN, y);
  ctx.stroke();
  ctx.strokeStyle = CINNABAR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 48, y);
  ctx.lineTo(W / 2 + 48, y);
  ctx.stroke();
  return y;
}

function paintSection(ctx, label, body, y, opts) {
  if (opts.paint) {
    ctx.textAlign = "left";
    ctx.fillStyle = CINNABAR;
    ctx.font = `${opts.labelSize}px ${FONT}`;
    ctx.fillText(label, MARGIN, y);
  }
  y += opts.labelSize + 16;
  if (opts.paint) {
    ctx.fillStyle = opts.bodyColor;
    ctx.font = `${opts.bodySize}px ${FONT}`;
    return wrapText(ctx, body, MARGIN, y, W - MARGIN * 2, opts.lineHeight, opts.maxRows);
  }
  ctx.font = `${opts.bodySize}px ${FONT}`;
  return y + measureWrap(ctx, body, W - MARGIN * 2, opts.lineHeight, opts.maxRows);
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

function measureWrap(ctx, text, maxWidth, lineHeight, maxRows = 4) {
  let line = "";
  let row = 0;
  for (const ch of text) {
    const next = line + ch;
    if (ctx.measureText(next).width > maxWidth && line) {
      line = ch;
      row += 1;
      if (row >= maxRows) return (row + 1) * lineHeight;
    } else {
      line = next;
    }
  }
  if (line) row += 1;
  return row * lineHeight;
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
