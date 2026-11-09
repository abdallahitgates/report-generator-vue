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

/** The report's row count: always a number a widget can show. */
export const ROW_COUNT = { as: '__count', label: 'Number of rows' };

const NUMERIC = ['integer', 'decimal'];

/**
 * A saved report's columns as widgets use them: columns to chart by, and
 * numbers (its totals, numeric columns of a detail report, and the number
 * of rows, so every report has at least one).
 *
 * @param {Array<{as, label, kind, type}>} fields  from reports.view
 */
export function widgetColumns(fields = []) {
  const label = (f) => f.label ?? f.as;
  const dims = fields.filter((f) => f.kind === 'dimension').map((f) => ({ as: f.as, label: label(f), type: f.type ?? null }));
  const totals = fields
    .filter((f) => f.kind !== 'dimension' && !['date', 'datetime', 'string', 'text', 'boolean'].includes(f.type))
    .map((f) => ({ as: f.as, label: label(f) }));
  const numericColumns = fields
    .filter((f) => f.kind === 'dimension' && NUMERIC.includes(f.type))
    .map((f) => ({ as: f.as, label: `${label(f)} (total)` }));
  return { dims: dims.filter((d) => !NUMERIC.includes(d.type)).concat(dims.filter((d) => NUMERIC.includes(d.type))), nums: [...totals, ...numericColumns, ROW_COUNT] };
}

/** Fills what a widget still lacks with the report's first column and number. */
export function prefillWidget(widget, columns) {
  if (!widget.values?.length && widget.type !== 'table') widget.values = columns.nums[0] ? [columns.nums[0].as] : [];
  if (!widget.category && !['kpi', 'table'].includes(widget.type)) {
    const time = columns.dims.find((d) => ['date', 'datetime'].includes(d.type));
    widget.category = (['line', 'area'].includes(widget.type) && time ? time.as : columns.dims[0]?.as) ?? null;
  }
  return widget;
}

/** Why a widget cannot be added yet, or null when it can. */
export function widgetProblem(widget) {
  if (!widget?.report) return 'Pick a report.';
  if (widget.type === 'table') return null;
  if (!widget.values?.length) return 'Pick a number to show.';
  if (widget.type !== 'kpi' && !widget.category) return 'Pick the column to chart by.';
  return null;
}
