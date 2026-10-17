/** 版面寬度；不再對殼做 transform scale，以免 fixed 底欄／囊被困在縮放層。 */

function isWide() {
  return window.matchMedia("(min-width: 720px)").matches;
}

export function applyScale() {
  const fit = document.querySelector("#fit");
  const shell = document.querySelector("#shell");
  if (!fit || !shell || fit.hidden) return 1;

  const wide = isWide();
  const logical = wide ? 720 : 384;
  document.documentElement.style.setProperty("--shell-w", `${logical}px`);

  shell.style.transform = "none";
  shell.style.width = "100%";

  if (wide) {
    fit.style.width = "100%";
    fit.style.maxWidth = `${logical}px`;
    fit.style.height = "auto";
    fit.style.marginLeft = "auto";
    fit.style.marginRight = "auto";
    document.documentElement.style.setProperty("--frame-w", `${logical}px`);
  } else {
    const frame = Math.min(logical, document.documentElement.clientWidth || logical);
    fit.style.width = "100%";
    fit.style.maxWidth = `${logical}px`;
    fit.style.height = "auto";
    fit.style.marginLeft = "auto";
    fit.style.marginRight = "auto";
    document.documentElement.style.setProperty("--frame-w", `${frame}px`);
  }

  fit.dataset.scale = "1";
  return 1;
}

export function mountScale() {
  applyScale();
  window.addEventListener("resize", applyScale);
  if (window.matchMedia) {
    window.matchMedia("(min-width: 720px)").addEventListener("change", applyScale);
  }
}
