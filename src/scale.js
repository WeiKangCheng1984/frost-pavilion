const LOGICAL_WIDTH = 384;

export function applyScale() {
  const fit = document.querySelector("#fit");
  const shell = document.querySelector("#shell");
  if (!fit || !shell) return 1;
  shell.style.transform = "scale(1)";
  const height = shell.offsetHeight || 1;
  const n = Math.max(1, Math.min(
    2,
    Math.floor(document.documentElement.clientWidth / LOGICAL_WIDTH),
    Math.floor(document.documentElement.clientHeight / height)
  ));
  shell.style.transform = `scale(${n})`;
  fit.style.width = `${LOGICAL_WIDTH * n}px`;
  fit.style.height = `${Math.ceil(height * n)}px`;
  fit.dataset.scale = String(n);
  return n;
}

export function mountScale() {
  applyScale();
  window.addEventListener("resize", applyScale);
}
