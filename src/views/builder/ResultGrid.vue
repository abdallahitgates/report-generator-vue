<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import { formatCell, isNumericColumn } from '../../utils/values.js';
import RgIcon from '../../components/ui/RgIcon.vue';

/**
 * Results with server-side paging and lazy groups: the top level loads 200
 * rows at a time as you scroll; opening a group loads just that group's
 * children. Nothing is computed in the browser.
 */
const builder = inject(REPORT_BUILDER_KEY);
const levels = reactive(new Map()); // key -> { rows, hasMore, loading, offset }
const expanded = reactive(new Set());
const columns = ref([]);
const wrap = ref(null);
const sentinel = ref(null);
let generation = 0;
let observer = null;

const draft = computed(() => builder.state.draft);
const grouped = computed(() => builder.grouped.value);
const rowAliases = computed(() => draft.value.rows.map((r) => r.as));
const itemsByAlias = computed(() => Object.fromEntries([...draft.value.rows, ...draft.value.values].map((i) => [i.as, i])));

const keyOf = (keys) => JSON.stringify(keys);

function enrich(column) {
  const item = itemsByAlias.value[column.alias];
  return { ...column, grain: item?.kind === 'dimension' ? item.grain : null };
}

const displayColumns = computed(() => {
  const cols = columns.value.filter((c) => c.alias !== '__subtotal').map(enrich);
  if (!grouped.value) return cols;
  const rowSet = new Set(rowAliases.value);
  const tree = {
    alias: '__tree',
    label: draft.value.rows.map((r) => r.label).join(' › '),
    kind: 'dimension',
    type: 'string',
    sortAlias: rowAliases.value[0],
  };
  return [tree, ...cols.filter((c) => !rowSet.has(c.alias))];
});

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

const top = computed(() => levels.get(keyOf([])));

async function load(keys, append = false) {
  const key = keyOf(keys);
  if (!levels.has(key)) levels.set(key, { rows: [], hasMore: false, loading: false });
  // The reactive copy the map hands back, so changes below re-render.
  const node = levels.get(key);
  if (node.loading) return;
  node.loading = true;
  const mine = generation;

  try {
    const offset = append ? node.rows.length : 0;
    const result = await builder.fetchRows({ keys, offset, top: keys.length === 0 });
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

function reset() {
  generation++;
  levels.clear();
  expanded.clear();
  if (builder.runnable.value) load([]);
  else columns.value = [];
  nextTick(() => wrap.value?.scrollTo?.({ top: 0 }));
}

watch(() => builder.state.runSeq, reset);

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
  const alias = column.alias === '__tree' ? rowAliases.value[entry.level] : column.alias;
  const v = entry.row[alias];
  return (v === null || v === undefined) && subtotalLabel(entry.row, alias) === null;
}

function sortState(column) {
  const alias = column.sortAlias ?? column.alias;
  return draft.value.sort.find((s) => s.field === alias)?.dir ?? null;
}

onMounted(() => {
  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && top.value?.hasMore && !top.value.loading) load([], true);
    }, { root: wrap.value, rootMargin: '200px' });
    if (sentinel.value) observer.observe(sentinel.value);
  }
  if (builder.runnable.value && builder.state.runSeq > 0) reset();
});

onBeforeUnmount(() => observer?.disconnect());

defineExpose({ loadMore: () => load([], true) });
</script>

<template>
  <div ref="wrap" class="rg-grid-wrap">
    <table v-if="displayColumns.length" class="rg-grid" :aria-busy="builder.state.running ? 'true' : 'false'">
      <thead>
        <tr>
          <th
            v-for="column in displayColumns"
            :key="column.alias"
            scope="col"
            :class="{ 'rg-num': isNumericColumn(column) }"
            :aria-sort="sortState(column) === 'asc' ? 'ascending' : sortState(column) === 'desc' ? 'descending' : 'none'"
          >
            <button type="button" :title="`Sort by ${column.label}`" @click="builder.toggleSort(column.sortAlias ?? column.alias)">
              {{ column.label }}
              <span v-if="sortState(column)" aria-hidden="true">{{ sortState(column) === 'asc' ? '↑' : '↓' }}</span>
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="entry in visible" :key="entry.key">
          <tr v-if="entry.more" class="rg-grid__more">
            <td :colspan="displayColumns.length">
              <button type="button" class="rg-btn rg-btn--sm rg-btn--ghost" @click="load(entry.keys, true)">Show more</button>
            </td>
          </tr>
          <tr v-else :class="{ 'rg-row--group': canExpand(entry), 'rg-row--subtotal': Number(entry.row.__subtotal) > 0 }">
            <td
              v-for="(column, ci) in displayColumns"
              :key="column.alias"
              :class="{ 'rg-num': isNumericColumn(column), 'rg-cell--empty': isEmpty(entry, column) }"
              :style="ci === 0 && grouped ? { paddingInlineStart: `${12 + entry.level * 20}px` } : null"
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
    </table>
    <div ref="sentinel" class="rg-sentinel" />
    <div v-if="top?.hasMore && top?.loading" class="rg-muted" style="padding: 10px 16px">Loading more…</div>
  </div>
</template>
