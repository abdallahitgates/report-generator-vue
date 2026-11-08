import { computed, reactive, watch } from 'vue';

const PAGE_SIZE = 200;
let uidSeq = 0;
const uid = () => `c${++uidSeq}`;

export const BASE_COLUMNS = [
  { key: 'line', label: 'Line' },
  { key: 'division', label: 'Division' },
  { key: 'employee', label: 'Employee' },
];

function slug(text) {
  const s = String(text ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return /^[a-z]/.test(s) ? s.slice(0, 50) : `c_${s}`.slice(0, 50);
}

export function emptyCombinedDraft() {
  return {
    uuid: null,
    name: 'Untitled combined report',
    description: '',
    folder: '',
    visibility: 'private',
    canEdit: true,
    canPublish: false,
    published: false,
    level: 'employee',
    period: 'this_month',
    from: '',
    to: '',
    lines: [],
    fields: [
      { uid: uid(), base: 'line', as: 'line', label: 'Line' },
      { uid: uid(), base: 'employee', as: 'employee', label: 'Employee' },
    ],
    // For the results grid: combined reports have no row groups.
    rows: [],
    values: [],
    sort: [],
  };
}

/** Saved report -> draft. */
export function combinedDraftFrom(report) {
  const d = report.definition ?? {};
  const period = d.context?.period ?? 'this_month';
  return {
    ...emptyCombinedDraft(),
    uuid: report.uuid ?? null,
    name: report.name ?? 'Untitled combined report',
    description: report.description ?? '',
    folder: report.folder ?? '',
    visibility: report.visibility ?? 'private',
    canEdit: report.can_edit ?? true,
    canPublish: report.can_publish ?? false,
    published: report.published ?? false,
    level: d.level ?? 'employee',
    period: Array.isArray(period) ? 'custom' : period,
    from: Array.isArray(period) ? String(period[0]).slice(0, 10) : '',
    to: Array.isArray(period) ? String(period[1]).slice(0, 10) : '',
    lines: Array.isArray(d.context?.lines) ? [...d.context.lines] : [],
    fields: (d.fields ?? []).map((f) => ({ uid: uid(), ...f, label: f.label ?? null })),
    sort: d.sort ?? [],
  };
}

/**
 * State and actions of the combined report builder: columns of existing
 * reports side by side per employee or division. Also serves as the
 * results grid's host (fetchRows, fetchSummary, exportReport, toggleSort).
 */
export function createCombinedBuilder(api, toasts) {
  const state = reactive({
    loading: false,
    draft: emptyCombinedDraft(),
    reports: [], // [{ key, label, description, group, levels }]
    fieldsByReport: {}, // `${key}|${level}|${period}` -> { loading, fields, error }
    runSeq: 0,
    running: false,
    error: null,
    meta: null,
    saving: false,
    savedSnapshot: null,
  });

  const definition = computed(() => {
    const d = state.draft;
    const period = d.period === 'custom' ? (d.from && d.to ? [d.from, d.to] : 'this_month') : d.period;
    return {
      type: 'combined',
      level: d.level,
      context: { period, ...(d.lines.length ? { lines: d.lines } : {}) },
      fields: d.fields.map(({ uid: _, ...f }) => Object.fromEntries(Object.entries(f).filter(([, v]) => v !== null && v !== undefined && v !== ''))),
      sort: d.sort.filter((s) => d.fields.some((f) => f.as === s.field)),
    };
  });

  const snapshot = () => JSON.stringify([definition.value, state.draft.name]);
  const dirty = computed(() => state.savedSnapshot !== null && snapshot() !== state.savedSnapshot);
  const runnable = computed(() => state.draft.fields.some((f) => !f.base));
  const grouped = computed(() => false);
  const reportsByKey = computed(() => Object.fromEntries(state.reports.map((r) => [r.key, r])));

  async function init(report = null) {
    state.loading = true;
    try {
      state.draft = report ? combinedDraftFrom(report) : emptyCombinedDraft();
      state.reports = await api.combine.reports();
      state.savedSnapshot = snapshot();
      if (runnable.value) run();
    } catch (error) {
      toasts.error(error);
    } finally {
      state.loading = false;
    }
  }

  // ------------------------------------------------------------- catalog

  function periodKey() {
    const d = state.draft;
    return d.period === 'custom' ? `${d.from}~${d.to}` : d.period;
  }

  function fieldsKey(key) {
    return `${key}|${state.draft.level}|${periodKey()}`;
  }

  async function loadFields(key) {
    const k = fieldsKey(key);
    if (state.fieldsByReport[k]?.fields || state.fieldsByReport[k]?.loading) return;
    state.fieldsByReport[k] = { loading: true, fields: null, error: null };
    try {
      const d = state.draft;
      const period = d.period === 'custom' ? (d.from && d.to ? [d.from, d.to] : undefined) : d.period;
      const fields = await api.combine.fields(key, { level: d.level, period, lines: d.lines });
      state.fieldsByReport[k] = { loading: false, fields, error: null };
    } catch (error) {
      state.fieldsByReport[k] = { loading: false, fields: null, error: error.message };
    }
  }

  function fieldsOf(key) {
    return state.fieldsByReport[fieldsKey(key)] ?? null;
  }

  // ------------------------------------------------------------- columns

  function uniqueAlias(base) {
    const taken = new Set(state.draft.fields.map((f) => f.as));
    let alias = slug(base) || 'column';
    for (let i = 2; taken.has(alias); i++) alias = `${slug(base)}_${i}`;
    return alias;
  }

  function hasField(report, field) {
    return state.draft.fields.some((f) => f.report === report && f.field === field);
  }

  function toggleField(report, field) {
    const existing = state.draft.fields.find((f) => f.report === report && f.field === field.key);
    if (existing) {
      removeColumn(existing.uid);
      return;
    }
    const reportLabel = reportsByKey.value[report]?.label ?? report;
    state.draft.fields.push({ uid: uid(), report, field: field.key, as: uniqueAlias(field.key), label: `${field.label} (${reportLabel})` });
  }

  function toggleBase(key) {
    const existing = state.draft.fields.find((f) => f.base === key);
    if (existing) {
      removeColumn(existing.uid);
      return;
    }
    const at = state.draft.fields.findIndex((f) => !f.base);
    const column = { uid: uid(), base: key, as: uniqueAlias(key), label: BASE_COLUMNS.find((b) => b.key === key)?.label ?? key };
    state.draft.fields.splice(at === -1 ? state.draft.fields.length : at, 0, column);
  }

  function addFormula({ label, formula }) {
    const column = { uid: uid(), formula, as: uniqueAlias(label || 'formula'), label: label || 'Formula' };
    state.draft.fields.push(column);
    return column;
  }

  function updateColumn(columnUid, patch) {
    const column = state.draft.fields.find((f) => f.uid === columnUid);
    if (column) Object.assign(column, patch);
  }

  function removeColumn(columnUid) {
    const column = state.draft.fields.find((f) => f.uid === columnUid);
    state.draft.fields = state.draft.fields.filter((f) => f.uid !== columnUid);
    if (column) state.draft.sort = state.draft.sort.filter((s) => s.field !== column.as);
  }

  function moveColumn(columnUid, to) {
    const fields = [...state.draft.fields];
    const from = fields.findIndex((f) => f.uid === columnUid);
    if (from === -1 || to < 0 || to >= fields.length) return;
    fields.splice(to, 0, fields.splice(from, 1)[0]);
    state.draft.fields = fields;
  }

  // ------------------------------------------------------------- running

  let timer = null;
  function run() {
    if (!runnable.value) {
      state.error = null;
      state.meta = null;
      return;
    }
    state.runSeq++;
  }

  // Run again shortly after the definition changes.
  watch(() => JSON.stringify(definition.value), () => {
    clearTimeout(timer);
    timer = setTimeout(run, 450);
  });

  // Columns of another level / period are different: reload the open reports' lists.
  watch(() => [state.draft.level, periodKey()], () => {
    for (const key of Object.keys(state.fieldsByReport)) {
      if (state.fieldsByReport[key].fields === null && !state.fieldsByReport[key].loading) delete state.fieldsByReport[key];
    }
  });

  async function fetchRows({ offset = 0, top = false, size = PAGE_SIZE, fresh = false } = {}) {
    const starts = top && (offset === 0 || fresh);
    if (starts) {
      state.running = true;
      state.error = null;
    }
    try {
      const result = await api.query.rows(definition.value, { offset, size });
      if (starts) state.meta = { ...result.meta, columns: result.columns };
      return result;
    } catch (error) {
      if (starts) state.error = error;
      throw error;
    } finally {
      if (starts) state.running = false;
    }
  }

  function toggleSort(alias) {
    const current = state.draft.sort.find((s) => s.field === alias);
    state.draft.sort = !current ? [{ field: alias, dir: 'asc' }] : current.dir === 'asc' ? [{ field: alias, dir: 'desc' }] : [];
  }

  async function save({ name, description, folder, visibility, copy = false } = {}) {
    const d = state.draft;
    const payload = {
      name: (name ?? d.name).trim() || 'Untitled combined report',
      description: description ?? d.description,
      folder: (folder ?? d.folder) || null,
      visibility: visibility ?? d.visibility,
      definition: definition.value,
    };
    state.saving = true;
    try {
      const saved = d.uuid && !copy && d.canEdit ? await api.reports.update(d.uuid, payload) : await api.reports.create(payload);
      Object.assign(d, {
        uuid: saved.uuid, name: saved.name, description: saved.description ?? '', folder: saved.folder ?? '',
        visibility: saved.visibility, canEdit: saved.can_edit, canPublish: saved.can_publish ?? false, published: saved.published ?? false,
      });
      state.savedSnapshot = snapshot();
      toasts.success(`Saved "${saved.name}".`);
      return saved;
    } catch (error) {
      toasts.error(error);
      throw error;
    } finally {
      state.saving = false;
    }
  }

  return {
    state,
    definition,
    dirty,
    runnable,
    grouped,
    reportsByKey,
    init,
    loadFields,
    fieldsOf,
    hasField,
    toggleField,
    toggleBase,
    addFormula,
    updateColumn,
    removeColumn,
    moveColumn,
    run,
    fetchRows,
    toggleSort,
    fetchSummary: () => api.query.summary(definition.value),
    exportReport: async (format) => {
      try {
        const name = await api.query.export(definition.value, format, { name: state.draft.name || 'report' });
        toasts.success(`Exported "${name}".`);
      } catch (error) {
        toasts.error(error);
        throw error;
      }
    },
    gridKey: computed(() => (state.draft.uuid ? `report:${state.draft.uuid}` : null)),
    save,
  };
}
