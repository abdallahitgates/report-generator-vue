import { computed, reactive, watch } from 'vue';
import {
  emptyDraft, formulaItem, fromDefinition, isRunnable, itemFromField, measureLabel,
  operatorsFor, toDefinition, uid, uniqueAlias, ROW_COUNT,
} from '../utils/definition.js';

const HISTORY_LIMIT = 60;
const PAGE_SIZE = 200;

function newQueryId() {
  return globalThis.crypto?.randomUUID?.() ?? `q-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * State and actions for the report builder. Every edit goes through an
 * action, so undo/redo and "unsaved changes" stay exact.
 */
export function createReportBuilder(api, toasts) {
  const state = reactive({
    draft: emptyDraft(),
    roots: null,
    catalog: null,
    loading: true,
    loadingCatalog: false,
    autoRun: true,
    running: false,
    error: null,
    errorUid: null,
    meta: null,
    runSeq: 0,
    saving: false,
    savedSnapshot: null,
    pathChoice: null, // { dataset, field, target, options } while the user picks a join path
    undoDepth: 0,
    redoDepth: 0,
  });

  const history = { past: [], future: [], applying: false };

  const built = computed(() => toDefinition(state.draft));
  const definition = computed(() => built.value.definition);
  const runnable = computed(() => isRunnable(state.draft));
  const datasetsByKey = computed(() => Object.fromEntries((state.catalog?.datasets ?? []).map((d) => [d.key, d])));
  const grouped = computed(() => state.draft.grouped && state.draft.rows.length >= 2);
  const snapshot = () => JSON.stringify(state.draft);
  const dirty = computed(() => state.savedSnapshot !== null && snapshot() !== state.savedSnapshot);

  // ------------------------------------------------------------- history

  let historyTimer = null;
  let lastSnapshot = null;
  watch(() => snapshot(), (now) => {
    if (history.applying) {
      lastSnapshot = now;
      return;
    }
    clearTimeout(historyTimer);
    // Typing a label is one undo step, not one per key.
    historyTimer = setTimeout(() => {
      if (lastSnapshot !== null && lastSnapshot !== now) {
        history.past.push(lastSnapshot);
        if (history.past.length > HISTORY_LIMIT) history.past.shift();
        history.future = [];
        syncDepth();
      }
      lastSnapshot = now;
    }, 250);
  });

  function restore(json) {
    history.applying = true;
    Object.assign(state.draft, JSON.parse(json));
    queueMicrotask(() => (history.applying = false));
  }

  // The stacks hold big JSON strings, so they stay plain arrays; these counters make the buttons reactive.
  function syncDepth() {
    state.undoDepth = history.past.length;
    state.redoDepth = history.future.length;
  }

  function undo() {
    if (!history.past.length) return;
    clearTimeout(historyTimer);
    history.future.push(snapshot());
    restore(history.past.pop());
    syncDepth();
  }

  function redo() {
    if (!history.future.length) return;
    clearTimeout(historyTimer);
    history.past.push(snapshot());
    restore(history.future.pop());
    syncDepth();
  }

  const canUndo = () => state.undoDepth > 0;
  const canRedo = () => state.redoDepth > 0;

  // ------------------------------------------------------------- loading

  async function init(reportId = null) {
    state.loading = true;
    try {
      if (reportId) {
        const report = await api.reports.get(reportId);
        await loadCatalog(report.definition.root);
        state.draft = fromDefinition(report.definition, state.catalog?.datasets ?? [], report);
        hydrateFilters();
      } else {
        state.draft = emptyDraft();
        state.roots = (await api.query.catalog()).datasets;
      }
      state.savedSnapshot = snapshot();
      lastSnapshot = state.savedSnapshot;
      history.past = [];
      history.future = [];
      syncDepth();
      if (runnable.value) run();
    } catch (error) {
      toasts.error(error);
    } finally {
      state.loading = false;
    }
  }

  async function loadCatalog(root) {
    state.loadingCatalog = true;
    try {
      state.catalog = await api.query.catalog(root);
    } finally {
      state.loadingCatalog = false;
    }
  }

  async function chooseRoot(root) {
    try {
      await loadCatalog(root);
      Object.assign(state.draft, { root, rows: [], values: [], filters: { boolean: 'and', items: [] }, sort: [] });
      state.error = null;
      state.meta = null;
    } catch (error) {
      toasts.error(error);
    }
  }

  async function changeRoot() {
    if (!state.roots) {
      try {
        state.roots = (await api.query.catalog()).datasets;
      } catch (error) {
        toasts.error(error);
        return;
      }
    }
    state.draft.root = null;
    state.catalog = null;
  }

  // -------------------------------------------------------------- fields

  function findItem(uidValue) {
    for (const shelf of ['rows', 'values']) {
      const index = state.draft[shelf].findIndex((i) => i.uid === uidValue);
      if (index !== -1) return { shelf, index, item: state.draft[shelf][index] };
    }
    return null;
  }

  /**
   * Adds a catalog field. When the dataset can be reached in more than one
   * way the user is asked which path to use first (state.pathChoice).
   *
   * @param {'rows'|'values'|'filters'} target
   */
  function addField(datasetKey, fieldKey, target = null, index = null, path = undefined, parentUid = null) {
    const dataset = datasetsByKey.value[datasetKey];
    const field = dataset?.fields.find((f) => f.key === fieldKey);
    if (!dataset || !field) return;

    if (path === undefined && dataset.paths?.length > 1) {
      state.pathChoice = { dataset, field, target, index, parentUid, options: dataset.paths };
      return;
    }
    const chosen = path ?? null;

    const shelf = target ?? (field.role === 'measure' ? 'values' : 'rows');
    if (shelf === 'filters') {
      addFilter({ target: `${datasetKey}.${fieldKey}`, type: field.type, label: itemFromField(state.draft, dataset, field).baseLabel, path: chosen }, parentUid);
      return;
    }

    const item = itemFromField(state.draft, dataset, field, { path: chosen, asValue: shelf === 'values' });
    const list = state.draft[shelf];
    list.splice(index ?? list.length, 0, item);
  }

  function choosePath(path) {
    const choice = state.pathChoice;
    state.pathChoice = null;
    if (choice) addField(choice.dataset.key, choice.field.key, choice.target, choice.index, path, choice.parentUid);
  }

  function removeItem(uidValue) {
    const found = findItem(uidValue);
    if (!found) return;
    const alias = found.item.as;
    state.draft[found.shelf].splice(found.index, 1);
    state.draft.sort = state.draft.sort.filter((s) => s.field !== alias);
    // Filters on a total that no longer exists go too.
    state.draft.filters.items = state.draft.filters.items.filter((n) => n.target !== alias);
  }

  /** Moves an item to a shelf and position. A field moved to Values becomes a measure, to Rows a dimension. */
  function moveItem(uidValue, shelf, index) {
    const found = findItem(uidValue);
    if (!found) return;
    const { item } = found;
    if (shelf === 'rows' && item.kind === 'formula') return;

    state.draft[found.shelf].splice(found.index, 1);
    if (shelf !== found.shelf) {
      if (shelf === 'values') {
        item.kind = 'measure';
        item.grain = null;
        item.agg = item.aggregations.includes('sum') ? 'sum' : item.aggregations.includes('count_distinct') ? 'count_distinct' : item.aggregations[0];
        item.label = measureLabel(item);
      } else {
        item.kind = 'dimension';
        item.agg = null;
        if (item.role === 'time') item.grain = 'month';
        item.label = item.baseLabel;
      }
      item.as = uniqueAlias(state.draft, item.label, item);
    }
    const target = state.draft[shelf];
    target.splice(Math.min(index ?? target.length, target.length), 0, item);
  }

  /** Changes aggregation, grain, label or format. An automatic label follows aggregation changes. */
  function updateItem(uidValue, patch) {
    const found = findItem(uidValue);
    if (!found) return;
    const { item } = found;
    const autoLabel = item.kind === 'measure' ? item.label === measureLabel(item) : item.label === item.baseLabel;
    Object.assign(item, patch);
    if ('agg' in patch && autoLabel) item.label = measureLabel(item);
    if ('label' in patch && !patch.label?.trim()) item.label = item.kind === 'measure' ? measureLabel(item) : item.baseLabel;
  }

  function addFormula(label, formula) {
    const item = formulaItem(state.draft, label, formula);
    state.draft.values.push(item);
    return item;
  }

  function updateFormula(uidValue, label, formula) {
    const found = findItem(uidValue);
    if (found) Object.assign(found.item, { label, formula });
  }

  // ------------------------------------------------------------- filters

  function filterGroupOf(parentUid) {
    if (!parentUid) return state.draft.filters;
    const find = (group) => {
      for (const node of group.items) {
        if (node.uid === parentUid) return node;
        if (node.items) {
          const hit = find(node);
          if (hit) return hit;
        }
      }
      return null;
    };
    return find(state.draft.filters) ?? state.draft.filters;
  }

  /** @param {{target: string, type: string, label: string, path?: number[], isTotal?: boolean}} info */
  function addFilter(info, parentUid = null) {
    const op = operatorsFor(info.type, info.isTotal)[0];
    const node = {
      uid: uid(),
      target: info.target,
      type: info.type,
      label: info.label,
      isTotal: !!info.isTotal,
      path: info.path ?? null,
      op,
      value: op === 'between' && (info.type === 'date' || info.type === 'datetime') ? 'this_month' : null,
    };
    filterGroupOf(parentUid).items.push(node);
    return node;
  }

  function filterOnTotal(uidValue) {
    const found = findItem(uidValue);
    if (!found) return;
    const type = found.item.kind === 'measure' && ['count', 'count_distinct'].includes(found.item.agg) ? 'integer' : 'decimal';
    addFilter({ target: found.item.as, type, label: found.item.label, isTotal: true });
  }

  function addFilterGroup() {
    state.draft.filters.items.push({ uid: uid(), boolean: state.draft.filters.boolean === 'and' ? 'or' : 'and', items: [] });
  }

  function updateFilter(node, patch) {
    if ('op' in patch && patch.op !== node.op) {
      const wasList = ['in', 'not_in', 'between'].includes(node.op);
      const isList = ['in', 'not_in', 'between'].includes(patch.op);
      if (wasList !== isList || patch.op === 'between' || node.op === 'between') {
        patch.value = patch.op === 'between' && (node.type === 'date' || node.type === 'datetime') ? 'this_month' : isList ? [] : null;
      }
    }
    Object.assign(node, patch);
  }

  function removeFilter(uidValue) {
    const strip = (group) => {
      group.items = group.items.filter((n) => n.uid !== uidValue);
      group.items.forEach((n) => n.items && strip(n));
    };
    strip(state.draft.filters);
  }

  /** Filters loaded from a saved definition get their labels and types back. */
  function hydrateFilters() {
    const walk = (group) => group.items.forEach((node) => {
      if (node.items) return walk(node);
      if (node.target.includes('.')) {
        const [datasetKey, fieldKey] = node.target.split('.');
        const dataset = datasetsByKey.value[datasetKey];
        const field = dataset?.fields.find((f) => f.key === fieldKey);
        node.type = field?.type ?? 'string';
        node.label = field ? itemFromField(state.draft, dataset, field).baseLabel : node.target;
        node.isTotal = false;
      } else {
        const item = [...state.draft.rows, ...state.draft.values].find((f) => f.as === node.target);
        node.label = item?.label ?? node.target;
        node.isTotal = item?.kind !== 'dimension';
        node.type = item?.kind === 'dimension' ? item.type : 'decimal';
      }
    });
    walk(state.draft.filters);
  }

  // ---------------------------------------------------------------- sort

  /** Click on a column header: ascending, then descending, then unsorted. */
  function toggleSort(alias) {
    const current = state.draft.sort.find((s) => s.field === alias);
    if (!current) state.draft.sort = [{ field: alias, dir: 'asc' }];
    else if (current.dir === 'asc') state.draft.sort = [{ field: alias, dir: 'desc' }];
    else state.draft.sort = [];
  }

  // ------------------------------------------------------------- running

  let controller = null;
  let currentQueryId = null;

  function cancelRunning() {
    controller?.abort();
    if (currentQueryId) api.query.cancel(currentQueryId).catch(() => {});
    controller = null;
    currentQueryId = null;
  }

  /** Asks the grid to reload from the first page. */
  function run() {
    if (!runnable.value) {
      state.meta = null;
      state.error = null;
      return;
    }
    state.runSeq++;
  }

  /**
   * One page for the grid. The top-level request of a run owns the status
   * (running, error, timing); deeper levels only return their rows.
   */
  async function fetchRows({ keys = [], offset = 0, top = false } = {}) {
    const groups = grouped.value ? { columns: state.draft.rows.map((r) => r.as), keys } : undefined;

    if (top && offset === 0) {
      cancelRunning();
      controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      currentQueryId = newQueryId();
      state.running = true;
      state.error = null;
      state.errorUid = null;
    }

    try {
      const result = await api.query.rows(definition.value, {
        offset,
        size: PAGE_SIZE,
        groups,
        queryId: top && offset === 0 ? currentQueryId : undefined,
        signal: controller?.signal,
      });
      if (top) state.meta = { ...result.meta, columns: result.columns };
      return result;
    } catch (error) {
      if (error?.cause?.name === 'CanceledError' || error?.cause?.name === 'AbortError') throw error;
      if (top) {
        state.error = error;
        state.errorUid = error.path ? locate(error.path) : null;
      } else {
        toasts.error(error);
      }
      throw error;
    } finally {
      if (top && offset === 0) {
        state.running = false;
        currentQueryId = null;
      }
    }
  }

  /** Maps an engine error path ("fields.2.ref", "filters.and.1.field") to the draft item. */
  function locate(path) {
    const { locations } = built.value;
    const parts = path.split('.');
    for (let n = parts.length; n > 0; n--) {
      const hit = locations[parts.slice(0, n).join('.')];
      if (hit) return hit;
    }
    return null;
  }

  /** Applies a join path the user picked for an AMBIGUOUS_PATH error. */
  function applyPath(uidValue, path) {
    const found = findItem(uidValue);
    if (found) {
      found.item.path = path;
      return;
    }
    const walk = (group) => group.items.forEach((n) => (n.items ? walk(n) : n.uid === uidValue && (n.path = path)));
    walk(state.draft.filters);
  }

  let runTimer = null;
  watch(() => JSON.stringify(definition.value), () => {
    if (!state.autoRun || state.loading) return;
    clearTimeout(runTimer);
    runTimer = setTimeout(run, 450);
  });

  // -------------------------------------------------------------- saving

  async function save({ name, description, folder, visibility, copy = false } = {}) {
    const d = state.draft;
    const payload = {
      name: (name ?? d.name).trim() || 'Untitled report',
      description: description ?? d.description,
      folder: (folder ?? d.folder) || null,
      visibility: visibility ?? d.visibility,
      definition: definition.value,
    };

    state.saving = true;
    try {
      const saved = d.uuid && !copy && d.canEdit
        ? await api.reports.update(d.uuid, payload)
        : await api.reports.create(payload);
      Object.assign(d, {
        uuid: saved.uuid, name: saved.name, description: saved.description ?? '', folder: saved.folder ?? '',
        visibility: saved.visibility, canEdit: saved.can_edit,
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
    runnable,
    grouped,
    dirty,
    datasetsByKey,
    init,
    chooseRoot,
    changeRoot,
    addField,
    choosePath,
    removeItem,
    moveItem,
    updateItem,
    addFormula,
    updateFormula,
    addFilter,
    addFilterGroup,
    filterOnTotal,
    updateFilter,
    removeFilter,
    toggleSort,
    run,
    fetchRows,
    cancelRunning,
    applyPath,
    save,
    undo,
    redo,
    canUndo,
    canRedo,
    ROW_COUNT,
  };
}

export const REPORT_BUILDER_KEY = Symbol('rg-report-builder');
