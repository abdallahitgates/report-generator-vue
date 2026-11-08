/** Small helpers shared by the dashboard charts. */

/** Clean axis maximum and ticks from 0 (0 / 1,000 / 2,000 ...). */
export function niceTicks(max, count = 4) {
  if (!Number.isFinite(max) || max <= 0) return { max: 1, ticks: [0, 1] };
  const raw = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? 10 * magnitude;
  const top = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return { max: top, ticks };
}

/** 0 / 950 / 10K / 2.5M: in full under 10,000, compact above. */
export function axisLabel(value, max) {
  if (max < 10000) return new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value);
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

/** Width of an element, kept up to date. */
export function observeWidth(el, set) {
  if (!el) return () => {};
  set(el.clientWidth || 600);
  if (typeof ResizeObserver === 'undefined') return () => {};
  const observer = new ResizeObserver((entries) => set(Math.max(120, Math.round(entries[0].contentRect.width))));
  observer.observe(el);
  return () => observer.disconnect();
}
