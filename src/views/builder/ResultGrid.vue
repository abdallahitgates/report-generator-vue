<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import { formatCell, formatNumber, isNumericColumn } from '../../utils/values.js';
import { formatCount } from '../../utils/format.js';
import RgIcon from '../../components/ui/RgIcon.vue';
import GridToolbar from './GridToolbar.vue';

/**
 * Results grid with spreadsheet-style handling, all server-side so it stays
 * fast on millions of rows:
 * - infinite scroll (200 rows at a time) or numbered pages;
 * - lazy groups: opening a group loads just its children;
 * - grand totals and the row count of the whole report (one summary query);
 * - select cells (click, drag, Shift+click, Shift+arrows) to see Count,
 *   Sum, Average, Min and Max, and copy them with Ctrl+C into Excel;
 * - hide, reorder and resize columns, freeze the first column, density.
 * Layout choices are remembered per report in this browser.
 *
 * The host (builder or viewer) provides, through REPORT_BUILDER_KEY:
 * state { draft { rows, values, sort }, runSeq, running, error }, grouped,
 * runnable, fetchRows({ keys, offset, top, size }), toggleSort(alias), and
 * optionally fetchSummary(), exportReport(format) and gridKey.
 */
const builder = inject(REPORT_BUILDER_KEY);
const levels = reactive(new Map()); // key -> { rows, hasMore, loading }
const expanded = reactive(new Set());
const columns = ref([]);
const wrap = ref(null);
const sentinel = ref(null);
let generation = 0;
let observer = null;

// ------------------------------------------------------------ preferences

const PREFS = { hidden: [], order: [], widths: {}, density: 'comfortable', freeze: true, totals: true, paging: 'scroll', pageSize: 100 };
const prefs = reactive({ ...PREFS });
const storageKey = computed(() => {
  const key = typeof builder.gridKey === 'object' ? builder.gridKey?.value : builder.gridKey;
  return key ? `rg-grid:${key}` : null;
});

function loadPrefs() {
  Object.assign(prefs, { ...PREFS, hidden: [], order: [], widths: {} });
  if (!storageKey.value) return;
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey.value) ?? 'null');
    if (saved && typeof saved === 'object') Object.assign(prefs, saved);
  } catch {
    // Private mode or blocked storage: defaults.
  }
}
function savePrefs() {
  if (!storageKey.value) return;
  try {
    window.localStorage.setItem(storageKey.value, JSON.stringify(prefs));
  } catch {
    // Not saved; the grid still works.
  }
}
watch(prefs, savePrefs, { deep: true });
watch(storageKey, loadPrefs, { immediate: true });

// ---------------------------------------------------------------- columns

const draft = computed(() => builder.state.draft);
const grouped = computed(() => builder.grouped.value);
const rowAliases = computed(() => draft.value.rows.map((r) => r.as));
const itemsByAlias = computed(() => Object.fromEntries([...draft.value.rows, ...draft.value.values].map((i) => [i.as, i])));
const keyOf = (keys) => JSON.stringify(keys);

function enrich(column) {
  const item = itemsByAlias.value[column.alias];
  return { ...column, grain: item?.kind === 'dimension' ? item.grain : null };
}

/** Every result column, in the user's order (hidden ones included), for the chooser. */
const allColumns = computed(() => {
  let cols = columns.value.filter((c) => c.alias !== '__subtotal').map(enrich);
  if (grouped.value) {
    const rowSet = new Set(rowAliases.value);
    cols = cols.filter((c) => !rowSet.has(c.alias));
  }
  const order = prefs.order;
  return [...cols].sort((a, b) => {
    const ia = order.indexOf(a.alias);
    const ib = order.indexOf(b.alias);
    return (ia === -1 ? 1e6 : ia) - (ib === -1 ? 1e6 : ib);
  });
});

const displayColumns = computed(() => {
  const cols = allColumns.value.filter((c) => !prefs.hidden.includes(c.alias));
  if (!grouped.value) return cols;
  const tree = {
    alias: '__tree',
    label: draft.value.rows.map((r) => r.label).join(' › '),
    kind: 'dimension',
    type: 'string',
    sortAlias: rowAliases.value[0],
  };
  return [tree, ...cols];
});

function colStyle(column) {
  const width = prefs.widths[column.alias];
  return width ? { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` } : null;
}

// ------------------------------------------------------------------- rows

const paged = computed(() => prefs.paging === 'pages' && !grouped.value);
const page = ref(1);

/** Flattened rows to render: [{ row, level, keys, key }] */
const visible = computed(() => {
  const out = [];
  const walk = (keys, level) => {
    const node = levels.get(keyOf(keys));
    if (!node) return;
    node.rows.forEach((row, i) => {
      const childKeys = grouped.value ? [...keys, row[rowAliases.value[level]]] : null;
      const key = grouped.value ? keyOf(childKeys) : `${keyOf(keys)}#${i}`;
      out.push({ row, level, keys: childKeys, key });
      if (grouped.value && expanded.has(key)) walk(childKeys, level + 1);
    });
    if (node.hasMore && keys.length > 0) out.push({ more: true, keys, level, key: `${keyOf(keys)}#more` });
  };
  walk([], 0);
  return out;
});
const dataRows = computed(() => visible.value.filter((e) => !e.more));
const top = computed(() => levels.get(keyOf([])));

async function load(keys, append = false) {
  const key = keyOf(keys);
  if (!levels.has(key)) levels.set(key, { rows: [], hasMore: false, loading: false });
  const node = levels.get(key);
  if (node.loading) return;
  node.loading = true;
  const mine = generation;

  try {
    const size = paged.value && keys.length === 0 ? prefs.pageSize : undefined;
    const offset = paged.value && keys.length === 0 ? (page.value - 1) * prefs.pageSize : append ? node.rows.length : 0;
    const result = await builder.fetchRows({ keys, offset, top: keys.length === 0, size, fresh: paged.value && keys.length === 0 && !append });
    if (mine !== generation) return;
    if (keys.length === 0 && !append) columns.value = result.columns;
    node.rows = append ? [...node.rows, ...result.rows] : result.rows;
    node.hasMore = result.page.has_more;
  } catch {
    if (mine === generation && !append && keys.length === 0) node.rows = [];
  } finally {
    node.loading = false;
  }
}

// ---------------------------------------------------------------- summary

const summary = ref(null);
const summaryLoading = ref(false);
const summaryError = ref(null);

async function loadSummary() {
  summary.value = null;
  summaryError.value = null;
  if (!builder.fetchSummary || !(prefs.totals || paged.value)) return;
  const mine = generation;
  summaryLoading.value = true;
  try {
    const result = await builder.fetchSummary();
    if (mine === generation) summary.value = result;
  } catch (error) {
    if (mine === generation) summaryError.value = error?.message ?? 'Totals are not available.';
  } finally {
    if (mine === generation) summaryLoading.value = false;
  }
}

const pages = computed(() => (summary.value ? Math.max(1, Math.ceil(summary.value.rows / prefs.pageSize)) : null));
const totalsRow = computed(() => (prefs.totals && summary.value && Object.keys(summary.value.totals ?? {}).length ? summary.value.totals : null));

function reset({ keepPage = false } = {}) {
  generation++;
  levels.clear();
  expanded.clear();
  clearSelection();
  if (!keepPage) page.value = 1;
  if (builder.runnable.value) {
    load([]);
    if (!keepPage) loadSummary();
  } else {
    columns.value = [];
    summary.value = null;
  }
  nextTick(() => wrap.value?.scrollTo?.({ top: 0 }));
}

watch(() => builder.state.runSeq, () => reset());
watch(() => [prefs.paging, prefs.pageSize], () => reset());
watch(() => prefs.totals, (on) => on && !summary.value && loadSummary());

function goTo(n) {
  const last = pages.value ?? (top.value?.hasMore ? page.value + 1 : page.value);
  const next = Math.min(Math.max(1, n), last);
  if (next === page.value) return;
  page.value = next;
  reset({ keepPage: true });
}

function toggle(entry) {
  if (expanded.has(entry.key)) {
    expanded.delete(entry.key);
    return;
  }
  expanded.add(entry.key);
  if (!levels.has(entry.key)) load(entry.keys);
}

function canExpand(entry) {
  return grouped.value && entry.level < rowAliases.value.length - 1;
}

/** Subtotal rows from ROLLUP: which dimension cell says "Total". */
function subtotalLabel(row, alias) {
  const level = Number(row.__subtotal ?? 0);
  if (!level) return null;
  const dims = columns.value.filter((c) => c.kind === 'dimension').map((c) => c.alias);
  const index = dims.indexOf(alias);
  if (index === -1 || index < dims.length - level) return null;
  return index === dims.length - level ? (level === dims.length ? 'Grand total' : 'Total') : '';
}

function aliasAt(entry, column) {
  return column.alias === '__tree' ? rowAliases.value[entry.level] : column.alias;
}

function rawValue(entry, column) {
  return entry.row[aliasAt(entry, column)];
}

function cell(entry, column) {
  if (column.alias === '__tree') {
    const alias = rowAliases.value[entry.level];
    return formatCell(entry.row[alias], enrich({ ...(columns.value.find((c) => c.alias === alias) ?? { type: 'string', kind: 'dimension' }), alias }));
  }
  const label = subtotalLabel(entry.row, column.alias);
  if (label !== null) return label;
  return formatCell(entry.row[column.alias], column);
}

function isEmpty(entry, column) {
  const alias = aliasAt(entry, column);
  const v = entry.row[alias];
  return (v === null || v === undefined) && subtotalLabel(entry.row, alias) === null;
}

function isNegative(entry, column) {
  const v = rawValue(entry, column);
  return isNumericColumn(column) && typeof v === 'number' && v < 0;
}

function sortState(column) {
  const alias = column.sortAlias ?? column.alias;
  return draft.value.sort.find((s) => s.field === alias)?.dir ?? null;
}

function totalCell(column) {
  if (column.alias === '__tree' || !totalsRow.value) return '';
  const value = totalsRow.value[column.alias];
  return value === undefined || value === null ? '' : formatCell(value, column);
}

// -------------------------------------------------------------- selection

const selection = reactive({ anchor: null, focus: null, dragging: false });

function clearSelection() {
  selection.anchor = selection.focus = null;
  selection.dragging = false;
}

const range = computed(() => {
  if (!selection.anchor || !selection.focus) return null;
  return {
    r1: Math.min(selection.anchor.r, selection.focus.r), r2: Math.max(selection.anchor.r, selection.focus.r),
    c1: Math.min(selection.anchor.c, selection.focus.c), c2: Math.max(selection.anchor.c, selection.focus.c),
  };
});

const rowIndex = computed(() => new Map(dataRows.value.map((e, i) => [e.key, i])));

function isSelected(entry, ci) {
  const r = rowIndex.value.get(entry.key);
  const s = range.value;
  return !!s && r >= s.r1 && r <= s.r2 && ci >= s.c1 && ci <= s.c2;
}

function isFocus(entry, ci) {
  return selection.focus && rowIndex.value.get(entry.key) === selection.focus.r && selection.focus.c === ci;
}

function onCellDown(event, entry, ci) {
  if (event.button !== 0 || event.target.closest('button')) return;
  const at = { r: rowIndex.value.get(entry.key), c: ci };
  if (event.shiftKey && selection.anchor) {
    selection.focus = at;
  } else {
    selection.anchor = at;
    selection.focus = at;
  }
  selection.dragging = true;
  wrap.value?.focus({ preventScroll: true });
}

function onCellEnter(entry, ci) {
  if (selection.dragging) selection.focus = { r: rowIndex.value.get(entry.key), c: ci };
}

function stopDrag() {
  selection.dragging = false;
}

/** Selected cells as [[{ column, value, text }]] rows. */
function selectedCells() {
  const s = range.value;
  if (!s) return [];
  const cols = displayColumns.value.slice(s.c1, s.c2 + 1);
  return dataRows.value.slice(s.r1, s.r2 + 1).map((entry) => cols.map((column) => ({
    column, value: rawValue(entry, column), text: isEmpty(entry, column) ? '' : cell(entry, column),
  })));
}

const stats = computed(() => {
  const cells = selectedCells().flat();
  if (cells.length < 2) return null;
  const filled = cells.filter((c) => c.value !== null && c.value !== undefined && c.value !== '');
  const numbers = cells.filter((c) => isNumericColumn(c.column) && typeof c.value === 'number').map((c) => c.value);
  const out = { cells: cells.length, count: filled.length, numbers: numbers.length };
  if (numbers.length) {
    const sum = numbers.reduce((a, b) => a + b, 0);
    Object.assign(out, { sum, avg: sum / numbers.length, min: Math.min(...numbers), max: Math.max(...numbers) });
  }
  return out;
});

async function copySelection() {
  const rows = selectedCells();
  if (!rows.length) return;
  // Raw numbers so Excel can add them up; labels for everything else.
  const tsv = rows.map((r) => r.map((c) => (typeof c.value === 'number' ? String(c.value) : c.text.replace(/[\t\n]/g, ' '))).join('\t')).join('\n');
  try {
    await navigator.clipboard?.writeText(tsv);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1200);
  } catch {
    // Clipboard blocked: nothing to do.
  }
}
const copied = ref(false);

function onKey(event) {
  const mod = event.ctrlKey || event.metaKey;
  if (mod && event.key.toLowerCase() === 'c' && range.value) {
    event.preventDefault();
    copySelection();
    return;
  }
  if (mod && event.key.toLowerCase() === 'a' && dataRows.value.length) {
    event.preventDefault();
    selection.anchor = { r: 0, c: 0 };
    selection.focus = { r: dataRows.value.length - 1, c: displayColumns.value.length - 1 };
    return;
  }
  if (event.key === 'Escape') {
    clearSelection();
    return;
  }
  const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
  const move = moves[event.key];
  if (!move || !selection.focus) return;
  event.preventDefault();
  const rtl = getComputedStyle(wrap.value).direction === 'rtl' && move[1] !== 0;
  const next = {
    r: Math.min(Math.max(0, selection.focus.r + move[0]), dataRows.value.length - 1),
    c: Math.min(Math.max(0, selection.focus.c + (rtl ? -move[1] : move[1])), displayColumns.value.length - 1),
  };
  selection.focus = next;
  if (!event.shiftKey) selection.anchor = next;
  nextTick(() => wrap.value?.querySelector('.rg-cell--focus')?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }));
}

// ----------------------------------------------------------------- resize

let resizing = null;
function startResize(event, column) {
  const th = event.target.closest('th');
  resizing = { alias: column.alias, x: event.clientX, width: th.getBoundingClientRect().width, rtl: getComputedStyle(th).direction === 'rtl' };
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', endResize, { once: true });
  event.preventDefault();
}
function onResize(event) {
  if (!resizing) return;
  const dx = (event.clientX - resizing.x) * (resizing.rtl ? -1 : 1);
  prefs.widths = { ...prefs.widths, [resizing.alias]: Math.round(Math.max(60, Math.min(800, resizing.width + dx))) };
}
function endResize() {
  resizing = null;
  document.removeEventListener('mousemove', onResize);
}
function autoSize(column) {
  const { [column.alias]: _, ...rest } = prefs.widths;
  prefs.widths = rest;
}

// ---------------------------------------------------------------- export

const exporting = ref(null);
const exportError = ref(null);
async function exportAs(format) {
  if (!builder.exportReport || exporting.value) return;
  exporting.value = format;
  exportError.value = null;
  try {
    await builder.exportReport(format);
  } catch (error) {
    exportError.value = error?.message ?? 'Export failed.';
  } finally {
    exporting.value = null;
  }
}

// --------------------------------------------------------------- lifecycle

onMounted(() => {
  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver((entries) => {
      if (paged.value) return;
      if (entries.some((e) => e.isIntersecting) && top.value?.hasMore && !top.value.loading) load([], true);
    }, { root: wrap.value, rootMargin: '200px' });
    if (sentinel.value) observer.observe(sentinel.value);
  }
  document.addEventListener('mouseup', stopDrag);
  if (builder.runnable.value && builder.state.runSeq > 0) reset();
});

onBeforeUnmount(() => {
  observer?.disconnect();
  document.removeEventListener('mouseup', stopDrag);
  endResize();
});

defineExpose({ loadMore: () => load([], true), summary, prefs, stats, copySelection, goTo, page });

const statText = (n) => formatNumber(n, null);
</script>

<template>
  <div class="rg-gridbox" :class="[`rg-gridbox--${prefs.density}`, { 'rg-gridbox--frozen': prefs.freeze }]">
    <GridToolbar
      :columns="allColumns"
      :prefs="prefs"
      :grouped="grouped"
      :can-export="!!builder.exportReport && displayColumns.length > 0"
      :can-total="!!builder.fetchSummary"
      :exporting="exporting"
      :summary="summary"
      :summary-loading="summaryLoading"
      @export="exportAs"
      @autosize="(c) => autoSize(c)"
    />
    <p v-if="exportError" class="rg-gridbox__error" role="alert"><RgIcon name="alert" small /> {{ exportError }}</p>

    <div
      ref="wrap"
      class="rg-grid-wrap"
      tabindex="0"
      role="grid"
      :aria-rowcount="summary?.rows ?? undefined"
      :aria-busy="builder.state.running ? 'true' : 'false'"
      @keydown="onKey"
    >
      <table v-if="displayColumns.length" class="rg-grid" :class="{ 'rg-grid--selecting': selection.dragging }">
        <thead>
          <tr>
            <th
              v-for="column in displayColumns"
              :key="column.alias"
              scope="col"
              :class="{ 'rg-num': isNumericColumn(column) }"
              :style="colStyle(column)"
              :aria-sort="sortState(column) === 'asc' ? 'ascending' : sortState(column) === 'desc' ? 'descending' : 'none'"
            >
              <button type="button" :title="`Sort by ${column.label}`" @click="builder.toggleSort(column.sortAlias ?? column.alias)">
                {{ column.label }}
                <span v-if="sortState(column)" class="rg-sort" aria-hidden="true">{{ sortState(column) === 'asc' ? '↑' : '↓' }}</span>
              </button>
              <span
                class="rg-resize"
                role="separator"
                aria-orientation="vertical"
                :aria-label="`Resize ${column.label}`"
                title="Drag to resize, double-click to fit"
                @mousedown="startResize($event, column)"
                @dblclick="autoSize(column)"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="top?.loading && !top.rows.length">
            <tr v-for="n in 8" :key="`sk${n}`" class="rg-row--skeleton">
              <td v-for="column in displayColumns" :key="column.alias"><span class="rg-skeleton" :style="{ width: `${40 + ((n * 23 + column.alias.length * 7) % 50)}%` }" /></td>
            </tr>
          </template>
          <template v-for="entry in visible" :key="entry.key">
            <tr v-if="entry.more" class="rg-grid__more">
              <td :colspan="displayColumns.length">
                <button type="button" class="rg-btn rg-btn--sm rg-btn--ghost" @click="load(entry.keys, true)">Show more</button>
              </td>
            </tr>
            <tr v-else class="rg-row" :class="{ 'rg-row--group': canExpand(entry), 'rg-row--subtotal': Number(entry.row.__subtotal) > 0 }">
              <td
                v-for="(column, ci) in displayColumns"
                :key="column.alias"
                :class="{
                  'rg-num': isNumericColumn(column),
                  'rg-cell--empty': isEmpty(entry, column),
                  'rg-cell--negative': isNegative(entry, column),
                  'rg-cell--selected': isSelected(entry, ci),
                  'rg-cell--focus': isFocus(entry, ci),
                }"
                :style="[colStyle(column), ci === 0 && grouped ? { paddingInlineStart: `${12 + entry.level * 20}px` } : null]"
                @mousedown="onCellDown($event, entry, ci)"
                @mouseenter="onCellEnter(entry, ci)"
              >
                <span v-if="ci === 0 && grouped" class="rg-tree">
                  <button
                    v-if="canExpand(entry)"
                    type="button"
                    class="rg-tree__toggle"
                    :aria-expanded="expanded.has(entry.key) ? 'true' : 'false'"
                    :aria-label="`${expanded.has(entry.key) ? 'Collapse' : 'Expand'} ${cell(entry, column)}`"
                    @click="toggle(entry)"
                  >
                    <RgIcon :name="levels.get(entry.key)?.loading ? 'loader' : 'chevron'" small :spin="!!levels.get(entry.key)?.loading" />
                  </button>
                  <span v-else style="width: 20px; display: inline-block" />
                  {{ cell(entry, column) }}
                </span>
                <template v-else>{{ cell(entry, column) }}</template>
              </td>
            </tr>
          </template>
          <tr v-if="top && !top.rows.length && !top.loading && !builder.state.error">
            <td :colspan="displayColumns.length" class="rg-muted" style="text-align: center; height: 80px">No rows match these filters.</td>
          </tr>
        </tbody>
        <tfoot v-if="totalsRow && top?.rows.length">
          <tr class="rg-grid__totals">
            <td v-for="(column, ci) in displayColumns" :key="column.alias" :class="{ 'rg-num': isNumericColumn(column) }" :style="colStyle(column)">
              <template v-if="ci === 0 && !totalCell(column)"><b>Grand total</b></template>
              <template v-else>{{ totalCell(column) }}</template>
            </td>
          </tr>
        </tfoot>
      </table>
      <div ref="sentinel" class="rg-sentinel" />
      <div v-if="!paged && top?.hasMore && top?.loading && top.rows.length" class="rg-muted" style="padding: 10px 16px">Loading more…</div>
    </div>

    <footer class="rg-gridfoot">
      <Transition name="rg-swap" mode="out-in">
        <div v-if="stats" key="stats" class="rg-gridfoot__stats" aria-live="polite">
          <span v-if="stats.numbers">Sum <b class="rg-num">{{ statText(stats.sum) }}</b></span>
          <span v-if="stats.numbers">Average <b class="rg-num">{{ statText(stats.avg) }}</b></span>
          <span v-if="stats.numbers">Min <b class="rg-num">{{ statText(stats.min) }}</b></span>
          <span v-if="stats.numbers">Max <b class="rg-num">{{ statText(stats.max) }}</b></span>
          <span>Count <b class="rg-num">{{ formatCount(stats.count) }}</b></span>
          <button type="button" class="rg-btn rg-btn--sm rg-btn--ghost" :title="'Copy (Ctrl+C)'" @click="copySelection">
            <RgIcon :name="copied ? 'check' : 'copy'" small /> {{ copied ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <div v-else key="rows" class="rg-gridfoot__stats rg-faint">
          <span v-if="summary">{{ formatCount(summary.rows) }} {{ summary.rows === 1 ? 'row' : 'rows' }}</span>
          <span v-else-if="summaryLoading"><RgIcon name="loader" spin small /> Counting…</span>
          <span v-else-if="summaryError" :title="summaryError">Total rows unavailable</span>
          <span v-if="dataRows.length" class="rg-gridfoot__hint">Click and drag to select cells</span>
        </div>
      </Transition>

      <nav v-if="paged" class="rg-pager" aria-label="Pages">
        <label class="rg-pager__size">
          Rows per page
          <select v-model.number="prefs.pageSize" class="rg-input">
            <option v-for="n in [50, 100, 200, 500, 1000]" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
        <button type="button" class="rg-btn rg-btn--icon rg-btn--ghost" aria-label="First page" :disabled="page === 1" @click="goTo(1)">«</button>
        <button type="button" class="rg-btn rg-btn--icon rg-btn--ghost" aria-label="Previous page" :disabled="page === 1" @click="goTo(page - 1)">‹</button>
        <span class="rg-num">Page
          <input class="rg-input rg-pager__input" type="number" min="1" :max="pages ?? undefined" :value="page" aria-label="Page" @change="goTo(Number($event.target.value))" />
          <template v-if="pages"> of {{ formatCount(pages) }}</template>
        </span>
        <button type="button" class="rg-btn rg-btn--icon rg-btn--ghost" aria-label="Next page" :disabled="pages ? page >= pages : !top?.hasMore" @click="goTo(page + 1)">›</button>
        <button v-if="pages" type="button" class="rg-btn rg-btn--icon rg-btn--ghost" aria-label="Last page" :disabled="page >= pages" @click="goTo(pages)">»</button>
      </nav>
    </footer>
  </div>
</template>
