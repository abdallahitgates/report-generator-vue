/** Widget types: what each shows, and how a widget changes when its type does. */

const hasCategory = (w) => !!w.category;
const hasValues = (w) => (w.values ?? []).length > 0;

export const WIDGET_TYPES = [
  { value: 'kpi', label: 'KPI', icon: 'hash', hint: 'Headline numbers', fits: hasValues },
  { value: 'bar', label: 'Bar', icon: 'view', hint: 'Top items, across', fits: (w) => hasCategory(w) && hasValues(w) },
  { value: 'column', label: 'Column', icon: 'view', hint: 'Top items, upright', fits: (w) => hasCategory(w) && hasValues(w) },
  { value: 'line', label: 'Line', icon: 'clock', hint: 'Over time', fits: (w) => hasCategory(w) && hasValues(w) },
  { value: 'area', label: 'Area', icon: 'clock', hint: 'Over time, filled', fits: (w) => hasCategory(w) && hasValues(w) },
  { value: 'pie', label: 'Pie', icon: 'globe', hint: 'Parts of a whole', fits: (w) => hasCategory(w) && hasValues(w) },
  { value: 'donut', label: 'Donut', icon: 'globe', hint: 'Parts, with the total', fits: (w) => hasCategory(w) && hasValues(w) },
  { value: 'share', label: 'Share bar', icon: 'table', hint: 'Parts in one bar', fits: (w) => hasCategory(w) && hasValues(w) },
  { value: 'table', label: 'Table', icon: 'table', hint: 'First rows', fits: () => true },
];

/** Types that show one number. */
export const SINGLE_VALUE = ['bar', 'column', 'pie', 'donut', 'share'];

const DEFAULT_TOP = { line: 120, area: 120, pie: 6, donut: 6, share: 6 };
const DEFAULT_SIZE = { kpi: 'sm', table: 'full', line: 'full', area: 'full' };

/** The widget as another type: keeps report, column and numbers where they fit. */
export function withType(widget, type, { resize = false } = {}) {
  const next = { ...widget, type };
  if (SINGLE_VALUE.includes(type)) next.values = (widget.values ?? []).slice(0, 1);
  if (type === 'kpi') next.category = null;
  const wasParts = ['pie', 'donut', 'share'].includes(widget.type);
  const isParts = ['pie', 'donut', 'share'].includes(type);
  const wasOrdered = ['line', 'area'].includes(widget.type);
  const isOrdered = ['line', 'area'].includes(type);
  if (resize || wasParts !== isParts || wasOrdered !== isOrdered) next.top = DEFAULT_TOP[type] ?? 10;
  if (resize) next.size = DEFAULT_SIZE[type] ?? 'md';
  return next;
}
