/**
 * The builder edits a "draft" shaped for the UI (fields on shelves, filter
 * rows with ids); the engine takes a "definition". These two functions are
 * the only place that knows both shapes.
 */
import { AGGREGATION_LABELS } from './semantic.js';

let nextUid = 1;
export const uid = () => `f${nextUid++}`;

export const ROW_COUNT = '__rows';

export const OPERATORS = {
  '=': 'is',
  '!=': 'is not',
  '>': 'greater than',
  '>=': 'at least',
  '<': 'less than',
  '<=': 'at most',
  in: 'is any of',
  not_in: 'is none of',
  between: 'between',
  contains: 'contains',
  not_contains: 'does not contain',
  starts_with: 'starts with',
  ends_with: 'ends with',
  is_null: 'is empty',
  not_null: 'is not empty',
};

const TEXT_OPS = ['=', '!=', 'in', 'not_in', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_null', 'not_null'];
const NUMBER_OPS = ['=', '!=', '>', '>=', '<', '<=', 'between', 'in', 'is_null', 'not_null'];
const DATE_OPS = ['between', '=', '>', '>=', '<', '<=', 'is_null', 'not_null'];
const BOOL_OPS = ['=', 'is_null', 'not_null'];
const TOTAL_OPS = ['>', '>=', '<', '<=', '=', '!=', 'between'];

export function operatorsFor(type, isTotal = false) {
  if (isTotal) return TOTAL_OPS;
  if (type === 'integer' || type === 'decimal') return NUMBER_OPS;
  if (type === 'date' || type === 'datetime') return DATE_OPS;
  if (type === 'boolean') return BOOL_OPS;
  return TEXT_OPS;
}

export const DATE_PRESETS = [
  ['today', 'Today'], ['yesterday', 'Yesterday'], ['last_7_days', 'Last 7 days'], ['last_30_days', 'Last 30 days'],
  ['this_week', 'This week'], ['last_week', 'Last week'], ['this_month', 'This month'], ['last_month', 'Last month'],
  ['this_quarter', 'This quarter'], ['last_quarter', 'Last quarter'], ['this_year', 'This year'], ['last_year', 'Last year'],
];

export function emptyDraft() {
  return {
    uuid: null,
    name: 'Untitled report',
    description: '',
    folder: '',
    visibility: 'private',
    canEdit: true,
    root: null,
    rows: [],
    values: [],
    filters: { boolean: 'and', items: [] },
    sort: [],
    subtotals: false,
    grouped: true,
    parameters: [],
  };
}

function slug(text) {
  const s = String(text).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48);
  return /^[a-z_]/.test(s) ? s || 'field' : `f_${s}`;
}

export function aliasesIn(draft) {
  return [...draft.rows, ...draft.values].map((f) => f.as);
}

export function uniqueAlias(draft, base, except = null) {
  const taken = new Set([...draft.rows, ...draft.values].filter((f) => f !== except).map((f) => f.as));
  let alias = slug(base);
  for (let i = 2; taken.has(alias); i++) alias = `${slug(base)}_${i}`;
  return alias;
}

/** Label for a field taken from a dataset that is not the report's root. */
export function fieldLabel(dataset, field, rootKey) {
  if (field.key === ROW_COUNT) return field.label;
  if (dataset.key === rootKey) return field.label;
  return field.label.toLowerCase().includes(dataset.label.toLowerCase()) ? field.label : `${dataset.label} ${field.label}`;
}

export function measureLabel(item) {
  if (item.field === ROW_COUNT) return item.baseLabel;
  return `${AGGREGATION_LABELS[item.agg] ?? item.agg} of ${item.baseLabel}`;
}

/**
 * Builds a shelf item for a catalog field.
 * Measures go to Values with their first aggregation; everything else to Rows.
 */
export function itemFromField(draft, dataset, field, { path = null, asValue = null } = {}) {
  const baseLabel = fieldLabel(dataset, field, draft.root);
  const value = asValue ?? field.role === 'measure';
  const item = {
    uid: uid(),
    kind: value ? 'measure' : 'dimension',
    dataset: dataset.key,
    datasetLabel: dataset.label,
    field: field.key,
    type: field.type,
    role: field.role,
    aggregations: field.aggregations?.length ? field.aggregations : ['count', 'count_distinct'],
    baseLabel,
    grain: null,
    agg: null,
    path,
    format: null,
  };

  if (value) {
    item.agg = item.aggregations.includes('sum') ? 'sum' : item.aggregations[0];
    item.label = measureLabel(item);
  } else {
    if (field.role === 'time') item.grain = 'month';
    item.label = baseLabel;
  }
  item.as = uniqueAlias(draft, item.label);

  return item;
}

export function formulaItem(draft, label, formula) {
  return { uid: uid(), kind: 'formula', label, formula, as: uniqueAlias(draft, label), format: null };
}

function fieldToSpec(item) {
  if (item.kind === 'formula') {
    return { formula: item.formula, as: item.as, label: item.label, ...(item.format ? { format: item.format } : {}) };
  }
  const spec = { ref: `${item.dataset}.${item.field}`, as: item.as, label: item.label };
  if (item.kind === 'measure') spec.agg = item.agg;
  if (item.kind === 'dimension' && item.grain) spec.grain = item.grain;
  if (item.path) spec.path = item.path;
  if (item.format) spec.format = item.format;
  return spec;
}

function filterToSpec(node) {
  if (node.items) {
    return { [node.boolean]: node.items.map(filterToSpec).filter(Boolean) };
  }
  const spec = { field: node.target, op: node.op };
  if (!['is_null', 'not_null'].includes(node.op)) spec.value = node.value;
  if (node.path) spec.path = node.path;
  return spec;
}

function filterIsComplete(node) {
  if (node.items) return true;
  if (['is_null', 'not_null'].includes(node.op)) return true;
  const v = node.value;
  if (v === null || v === undefined || v === '') return false;
  if (Array.isArray(v)) return node.op === 'between' ? v.length === 2 && v.every((x) => x !== '' && x !== null) : v.length > 0;
  return true;
}

function pruneFilters(group) {
  return { boolean: group.boolean, items: group.items.filter(filterIsComplete).map((n) => (n.items ? pruneFilters(n) : n)) };
}

/**
 * Draft -> engine definition. Unfinished filter rows (no value yet) are left
 * out, so editing a filter never breaks the preview.
 *
 * Returns the definition and where each draft item ended up, so engine
 * errors ("fields.2.ref") can be pinned to the right chip.
 */
export function toDefinition(draft) {
  const fields = [...draft.rows, ...draft.values];
  const locations = {};
  fields.forEach((item, i) => (locations[`fields.${i}`] = item.uid));

  const definition = {
    version: 1,
    root: draft.root,
    fields: fields.map(fieldToSpec),
    sort: draft.sort.filter((s) => fields.some((f) => f.as === s.field)),
    subtotals: draft.subtotals,
    ui: { grouped: draft.grouped, rows: draft.rows.map((r) => r.as) },
  };

  if (draft.parameters.length) definition.parameters = draft.parameters;

  const filters = pruneFilters(draft.filters);
  if (filters.items.length) {
    definition.filters = filterToSpec(filters);
    const walk = (group, prefix) => group.items.forEach((node, i) => {
      const at = `${prefix}.${group.boolean}.${i}`;
      if (node.items) walk(node, at);
      else locations[at] = node.uid;
    });
    walk(filters, 'filters');
  }

  return { definition, locations };
}

/**
 * Engine definition -> draft, using the catalog for labels and types.
 *
 * @param {object} definition
 * @param {Array} datasets  catalog entries for the root (with fields)
 */
export function fromDefinition(definition, datasets, report = {}) {
  const draft = emptyDraft();
  draft.root = definition.root;
  draft.subtotals = !!definition.subtotals;
  draft.grouped = definition.ui?.grouped ?? true;
  draft.parameters = definition.parameters ?? [];
  draft.sort = definition.sort ?? [];
  Object.assign(draft, {
    uuid: report.uuid ?? null,
    name: report.name ?? draft.name,
    description: report.description ?? '',
    folder: report.folder ?? '',
    visibility: report.visibility ?? 'private',
    canEdit: report.can_edit ?? true,
  });

  const byKey = Object.fromEntries(datasets.map((d) => [d.key, d]));
  const rowAliases = new Set(definition.ui?.rows ?? []);

  for (const spec of definition.fields ?? []) {
    if (spec.formula) {
      draft.values.push({ uid: uid(), kind: 'formula', label: spec.label ?? spec.as, formula: spec.formula, as: spec.as, format: spec.format ?? null });
      continue;
    }
    const [datasetKey, fieldKey] = spec.ref.split('.');
    const dataset = byKey[datasetKey] ?? { key: datasetKey, label: datasetKey, fields: [] };
    const field = dataset.fields.find((f) => f.key === fieldKey) ?? { key: fieldKey, label: fieldKey, type: 'string', role: 'dimension', aggregations: [] };
    const isValue = !!spec.agg && !rowAliases.has(spec.as);
    const item = {
      uid: uid(),
      kind: isValue ? 'measure' : 'dimension',
      dataset: datasetKey,
      datasetLabel: dataset.label,
      field: fieldKey,
      type: field.type,
      role: field.role,
      aggregations: field.aggregations?.length ? field.aggregations : ['count', 'count_distinct'],
      baseLabel: fieldLabel(dataset, field, definition.root),
      grain: spec.grain ?? null,
      agg: spec.agg ?? null,
      path: spec.path ?? null,
      format: spec.format ?? null,
      as: spec.as,
      label: spec.label ?? spec.as,
      missing: !byKey[datasetKey] || !dataset.fields.some((f) => f.key === fieldKey),
    };
    (isValue ? draft.values : draft.rows).push(item);
  }

  const toNode = (spec) => {
    const boolean = spec.and ? 'and' : spec.or ? 'or' : null;
    if (boolean) return { uid: uid(), boolean, items: spec[boolean].map(toNode) };
    return { uid: uid(), target: spec.field, op: spec.op, value: spec.value ?? null, path: spec.path ?? null };
  };
  if (definition.filters) {
    const root = toNode(definition.filters);
    draft.filters = root.items ? { boolean: root.boolean, items: root.items } : { boolean: 'and', items: [root] };
  }

  return draft;
}

/** True when the draft has enough to ask the engine for rows. */
export function isRunnable(draft) {
  return !!draft.root && draft.rows.length + draft.values.length > 0;
}
