function shellWidth() {
  const wide = window.matchMedia("(min-width: 720px)").matches;
  return wide ? 720 : 384;
}

export function applyScale() {
  const fit = document.querySelector("#fit");
  const shell = document.querySelector("#shell");
  if (!fit || !shell || fit.hidden) return 1;

  const logical = shellWidth();
  document.documentElement.style.setProperty("--shell-w", `${logical}px`);
  shell.style.width = `${logical}px`;
  shell.style.transform = "scale(1)";

  const height = shell.offsetHeight || 1;
  const maxN = wideCap();
  const n = Math.max(1, Math.min(
    maxN,
    Math.floor(document.documentElement.clientWidth / logical),
    Math.floor(document.documentElement.clientHeight / Math.max(height * 0.92, 1))
  ));

  shell.style.transform = `scale(${n})`;
  fit.style.width = `${logical * n}px`;
  fit.style.height = `${Math.ceil(height * n)}px`;
  fit.dataset.scale = String(n);
  return n;
}

function wideCap() {
  return window.matchMedia("(min-width: 720px)").matches ? 2 : 3;
}

export function mountScale() {
  applyScale();
  window.addEventListener("resize", applyScale);
  if (window.matchMedia) {
    window.matchMedia("(min-width: 720px)").addEventListener("change", applyScale);
  }
}
