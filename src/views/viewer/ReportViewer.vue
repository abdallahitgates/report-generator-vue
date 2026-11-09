<script setup>
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from 'vue';
import { useReportGenerator } from '../../context.js';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import { formatCount } from '../../utils/format.js';
import RgIcon from '../../components/ui/RgIcon.vue';
import ExportMenu from '../../components/ui/ExportMenu.vue';
import RgMultiSelect from '../../components/ui/RgMultiSelect.vue';
import ResultGrid from '../builder/ResultGrid.vue';
import { OPERATORS } from '../../utils/definition.js';
import PinToDashboard from '../dashboards/PinToDashboard.vue';

/**
 * Opens a saved report for reading: the people a report is published to
 * use this, without the builder. They pick the period, lines, divisions,
 * employees and the report's parameters, sort, page, select and total
 * cells and export; every row follows their own access.
 */
const props = defineProps({
  reportId: { type: String, required: true },
  theme: { type: String, default: 'light' },
  /** Offer "Dashboard" (for people who can build dashboards). */
  dashboards: { type: Boolean, default: false },
});
const emit = defineEmits(['edit', 'loaded', 'dashboard', 'open-dashboard']);
const pinning = ref(false);

const PAGE_SIZE = 200;
const PERIODS = [
  ['this_month', 'This month'], ['last_month', 'Last month'], ['this_quarter', 'This quarter'], ['last_quarter', 'Last quarter'],
  ['this_year', 'This year'], ['last_year', 'Last year'], ['last_7_days', 'Last 7 days'], ['last_30_days', 'Last 30 days'],
  ['today', 'Today'], ['yesterday', 'Yesterday'],
];

const { api } = useReportGenerator();
provide('rg-theme', props.theme);

const report = ref(null);
const loadError = ref(null);
const filters = reactive({ period: '', from: '', to: '', lines: [], divisions: [], employees: [], parameters: {} });
/** Which structure pickers the server offers (it returns nothing for an unconfigured one). */
const pickers = reactive({ lines: false, divisions: false, employees: false });

const state = reactive({
  draft: { rows: [], values: [], sort: [] },
  /** The viewer's own filters on report columns: [{ field, op, value, label, type }]. */
  filters: [],
  runSeq: 0,
  running: false,
  error: null,
  meta: null,
});
const grouped = computed(() => !!report.value?.grouped && state.draft.rows.length >= 2);
const runnable = computed(() => !!report.value);

let controller = null;

function periodValue() {
  if (filters.period === 'custom') return filters.from && filters.to ? [filters.from, filters.to] : null;
  return filters.period || null;
}

/** The report filters the viewer picked, as the run endpoints take them. */
function context() {
  const out = {};
  const period = periodValue();
  if (period) out.period = period;
  for (const kind of ['lines', 'divisions', 'employees']) {
    if (filters[kind].length) out[kind] = filters[kind];
  }
  return Object.keys(out).length ? out : undefined;
}

const choices = () => ({
  parameters: filters.parameters,
  context: context(),
  sort: state.draft.sort,
  ...(state.filters.length ? { filters: state.filters.map(({ field, op, value }) => ({ field, op, value })) } : {}),
});

function optionsFor(kind) {
  return (search) => api.contextOptions(kind, { search, lines: kind === 'lines' ? [] : filters.lines, period: periodValue() ?? undefined });
}

async function fetchRows({ keys = [], offset = 0, top = false, size = PAGE_SIZE, fresh = false } = {}) {
  const groups = grouped.value ? { columns: state.draft.rows.map((r) => r.as), keys } : undefined;
  const starts = top && (offset === 0 || fresh);
  if (starts) {
    controller?.abort?.();
    controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    state.running = true;
    state.error = null;
  }
  try {
    const result = await api.reports.run(props.reportId, {
      ...choices(),
      offset,
      size: size ?? PAGE_SIZE,
      groups,
      signal: controller?.signal,
    });
    if (top) {
      if (starts) state.meta = { ...result.meta, rows: result.rows.length, has_more: !!result.page?.has_more };
      // Column labels come from the server.
      const labels = Object.fromEntries((result.columns ?? []).map((c) => [c.alias, c.label]));
      state.draft.rows.forEach((r) => { r.label = labels[r.as] ?? r.label; });
    }
    return result;
  } catch (error) {
    if (top) state.error = error;
    throw error;
  } finally {
    if (starts) state.running = false;
  }
}

function run() {
  state.runSeq++;
}

function toggleSort(alias) {
  const current = state.draft.sort.find((s) => s.field === alias);
  state.draft.sort = !current ? [{ field: alias, dir: 'asc' }] : current.dir === 'asc' ? [{ field: alias, dir: 'desc' }] : [];
  run();
}

function setSort(list) {
  state.draft.sort = list;
  run();
}

function filterColumn(column, filter) {
  state.filters = state.filters.filter((f) => f.field !== column.alias);
  if (filter) state.filters.push({ field: column.alias, label: column.label, type: column.type, kind: column.kind, ...filter });
  run();
}

function filterText(f) {
  const v = Array.isArray(f.value) ? (f.op === 'between' ? f.value.join(' – ') : f.value.join(', ')) : f.value;
  return `${OPERATORS[f.op] ?? f.op}${v === null || v === undefined ? '' : ` ${v}`}`;
}

provide(REPORT_BUILDER_KEY, {
  state,
  grouped,
  runnable,
  fetchRows,
  toggleSort,
  setSort,
  filterColumn,
  columnFilter: (alias) => state.filters.find((f) => f.field === alias) ?? null,
  // Combined reports are filtered by their own reports' filters.
  filterable: computed(() => report.value?.type !== 'combined'),
  fetchSummary: () => api.reports.summary(props.reportId, choices()),
  exportReport: (format) => api.reports.export(props.reportId, format, choices()),
  gridKey: computed(() => `view:${props.reportId}`),
});

async function load() {
  loadError.value = null;
  report.value = null;
  try {
    const data = await api.reports.view(props.reportId);
    const byAlias = Object.fromEntries((data.fields ?? []).map((f) => [f.as, f]));
    const rowAliases = data.grouped && data.rows?.length ? data.rows : (data.fields ?? []).filter((f) => f.kind === 'dimension').map((f) => f.as);
    state.draft.rows = rowAliases.map((as) => ({ as, label: byAlias[as]?.label ?? as, kind: 'dimension', grain: byAlias[as]?.grain ?? null }));
    state.draft.values = (data.fields ?? []).filter((f) => !rowAliases.includes(f.as)).map((f) => ({ as: f.as, label: f.label ?? f.as, kind: f.kind, grain: f.grain ?? null }));
    state.draft.sort = data.sort ?? [];

    const saved = data.context?.period ?? null;
    if (Array.isArray(saved)) Object.assign(filters, { period: 'custom', from: String(saved[0]).slice(0, 10), to: String(saved[1]).slice(0, 10) });
    else filters.period = typeof saved === 'string' && !saved.startsWith('{{') ? saved : '';
    filters.parameters = Object.fromEntries((data.parameters ?? []).map((p) => [p.key, p.default ?? '']));

    for (const kind of ['lines', 'divisions', 'employees']) {
      filters[kind] = Array.isArray(data.context?.[kind]) ? [...data.context[kind]] : [];
    }

    report.value = data;
    emit('loaded', data);
    run();
    // Show only the pickers the server can fill.
    for (const kind of ['lines', 'divisions', 'employees']) {
      api.contextOptions(kind, { lines: [] }).then((list) => (pickers[kind] = list.length > 0)).catch(() => (pickers[kind] = false));
    }
  } catch (error) {
    loadError.value = error;
  }
}

watch(() => props.reportId, load);
onMounted(load);
onBeforeUnmount(() => controller?.abort?.());

const ERROR_TITLES = {
  MISSING_PARAMETER: 'Choose a value to run this report',
  DATASET_FORBIDDEN: 'No access',
  TIMEOUT: 'The report took too long',
  TOO_HEAVY: 'The report would read too much data',
  TOO_MANY_QUERIES: 'Too many reports running',
  SERVER_BUSY: 'The report server is busy',
};
</script>

<template>
  <div class="rg-root rg-viewer" :data-rg-theme="theme">
    <div v-if="loadError" class="rg-main">
      <div class="rg-empty">
        <div class="rg-empty__icon"><RgIcon :name="loadError.status === 403 ? 'lock' : 'alert'" /></div>
        <h2>{{ loadError.status === 403 ? 'You cannot open this report' : loadError.status === 404 ? 'This report no longer exists' : 'The report could not be opened' }}</h2>
        <p>{{ loadError.message }}</p>
        <button type="button" class="rg-btn" @click="load">Try again</button>
      </div>
    </div>

    <template v-else>
      <header class="rg-topbar">
        <div class="rg-topbar__title">
          <h1 v-if="report">{{ report.name }}</h1>
          <div v-else class="rg-skeleton" style="width: 220px; height: 18px" />
          <div v-if="report?.description" class="rg-topbar__meta"><span>{{ report.description }}</span></div>
        </div>
        <div class="rg-topbar__actions">
          <button v-if="report?.can_edit" type="button" class="rg-btn" @click="emit('edit', report.uuid)"><RgIcon name="fx" small /> Edit</button>
          <button v-if="report && dashboards" type="button" class="rg-btn" title="Add a chart or number from this report to a dashboard" @click="pinning = true"><RgIcon name="plus" small /> Pin to dashboard</button>
          <button v-if="report && dashboards" type="button" class="rg-btn" title="Make a dashboard from this report" @click="emit('dashboard', report.uuid)"><RgIcon name="view" small /> Dashboard</button>
          <ExportMenu :run="(format) => api.reports.export(props.reportId, format, choices())" :disabled="!report" />
          <button type="button" class="rg-btn rg-btn--primary" :disabled="!report || state.running" @click="run"><RgIcon name="play" small /> Refresh</button>
        </div>
      </header>

      <form v-if="report" class="rg-viewer__filters" @submit.prevent="run">
        <label class="rg-viewer__filter" for="rg-viewer-period">
          <span><RgIcon name="calendar" small /> Period</span>
          <select id="rg-viewer-period" v-model="filters.period" class="rg-input" @change="filters.period !== 'custom' && run()">
            <option value="">All dates</option>
            <option v-for="[value, label] in PERIODS" :key="value" :value="value">{{ label }}</option>
            <option value="custom">Custom range…</option>
          </select>
        </label>
        <Transition name="rg-swap">
          <div v-if="filters.period === 'custom'" class="rg-viewer__range">
            <input v-model="filters.from" class="rg-input" type="date" aria-label="From" required />
            <span class="rg-faint">to</span>
            <input v-model="filters.to" class="rg-input" type="date" aria-label="To" required />
          </div>
        </Transition>
        <div v-if="pickers.lines" class="rg-viewer__filter">
          <span><RgIcon name="folder" small /> Lines</span>
          <RgMultiSelect v-model="filters.lines" label="Lines" all-label="All my lines" :load="optionsFor('lines')" @change="run" />
        </div>
        <div v-if="pickers.divisions" class="rg-viewer__filter">
          <span><RgIcon name="users" small /> Divisions</span>
          <RgMultiSelect v-model="filters.divisions" label="Divisions" all-label="All my divisions" :load="optionsFor('divisions')" :depends-on="filters.lines" @change="run" />
        </div>
        <div v-if="pickers.employees" class="rg-viewer__filter">
          <span><RgIcon name="users" small /> Employees</span>
          <RgMultiSelect v-model="filters.employees" label="Employees" all-label="All my employees" :load="optionsFor('employees')" :depends-on="filters.lines" @change="run" />
        </div>
        <label v-for="parameter in report.parameters" :key="parameter.key" class="rg-viewer__filter" :for="`rg-viewer-p-${parameter.key}`">
          <span>{{ parameter.label ?? parameter.key }}<b v-if="parameter.required" class="rg-viewer__required">*</b></span>
          <select v-if="parameter.type === 'date_range'" :id="`rg-viewer-p-${parameter.key}`" v-model="filters.parameters[parameter.key]" class="rg-input">
            <option v-for="[value, label] in PERIODS" :key="value" :value="value">{{ label }}</option>
          </select>
          <input v-else :id="`rg-viewer-p-${parameter.key}`" v-model="filters.parameters[parameter.key]" class="rg-input" :type="parameter.type === 'number' ? 'number' : 'text'" />
        </label>
        <button type="submit" class="rg-btn" :disabled="state.running">Apply</button>
      </form>

      <section class="rg-results" aria-label="Results">
        <div class="rg-statusbar" role="status" aria-live="polite">
          <span v-if="state.running"><RgIcon name="loader" spin small /> Running…</span>
          <span v-else-if="state.meta" class="rg-num">
            {{ state.meta.has_more ? `${formatCount(state.meta.rows ?? 0)}+ rows` : `${formatCount(state.meta.rows ?? 0)} rows` }}
            <template v-if="state.meta.duration_ms != null"> · {{ state.meta.duration_ms }} ms</template>
          </span>
        </div>
        <div v-if="state.error" class="rg-errorbox" role="alert">
          <span class="rg-errorbox__title"><RgIcon name="alert" small />{{ ERROR_TITLES[state.error.code] ?? 'The report could not run' }}</span>
          <span>{{ state.error.message }}</span>
        </div>
        <TransitionGroup v-if="state.filters.length" tag="div" name="rg-list-fade" class="rg-filterchips" aria-label="Column filters">
          <span key="label" class="rg-filterchips__label"><RgIcon name="filter" small /> Filtered</span>
          <span v-for="f in state.filters" :key="f.field" class="rg-filterchip">
            <b>{{ f.label }}</b> {{ filterText(f) }}
            <button type="button" :aria-label="`Remove the filter on ${f.label}`" @click="filterColumn({ alias: f.field }, null)"><RgIcon name="x" small /></button>
          </span>
          <button key="clear" type="button" class="rg-linkish" @click="state.filters = []; run()">Clear all</button>
        </TransitionGroup>
        <ResultGrid v-if="report" />
      </section>
    </template>
    <PinToDashboard v-if="pinning && report" :report="report.uuid" :report-name="report.name" @close="pinning = false" @open-dashboard="(uuid) => { pinning = false; emit('open-dashboard', uuid); }" />
  </div>
</template>
