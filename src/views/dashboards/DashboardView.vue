<script setup>
import { onMounted, provide, reactive, ref, watch } from 'vue';
import { useReportGenerator } from '../../context.js';
import RgIcon from '../../components/ui/RgIcon.vue';
import RgMultiSelect from '../../components/ui/RgMultiSelect.vue';
import DashboardWidget from './DashboardWidget.vue';
import { PERIODS } from './periods.js';
import { createQueue } from '../../utils/queue.js';

/**
 * Opens a dashboard: its widgets in a grid, each loading on its own, with
 * the report filters (period, lines, divisions, employees) in one row above.
 * Every number follows the viewer's own access.
 */
const props = defineProps({
  dashboardId: { type: String, required: true },
  theme: { type: String, default: 'light' },
});
const emit = defineEmits(['edit', 'loaded']);

const { api } = useReportGenerator();
provide('rg-theme', props.theme);
provide('rg-widget-queue', createQueue(3));


const dashboard = ref(null);
const loadError = ref(null);
const version = ref(0);
const filters = reactive({ period: '', from: '', to: '', lines: [], divisions: [], employees: [] });
const pickers = reactive({ lines: false, divisions: false, employees: false });

function context() {
  const out = {};
  const period = filters.period === 'custom' ? (filters.from && filters.to ? [filters.from, filters.to] : null) : filters.period || null;
  if (period) out.period = period;
  for (const kind of ['lines', 'divisions', 'employees']) if (filters[kind].length) out[kind] = filters[kind];
  return out;
}

function loader(widget) {
  return () => api.dashboards.widget(props.dashboardId, widget.id, { context: context() });
}

function refresh() {
  version.value++;
}

function optionsFor(kind) {
  return (search) => api.contextOptions(kind, { search, lines: kind === 'lines' ? [] : filters.lines });
}

async function load() {
  loadError.value = null;
  try {
    const data = await api.dashboards.get(props.dashboardId);
    const saved = data.layout?.context ?? {};
    const period = saved.period ?? '';
    Object.assign(filters, Array.isArray(period)
      ? { period: 'custom', from: String(period[0]).slice(0, 10), to: String(period[1]).slice(0, 10) }
      : { period: typeof period === 'string' ? period : '', from: '', to: '' });
    for (const kind of ['lines', 'divisions', 'employees']) filters[kind] = Array.isArray(saved[kind]) ? [...saved[kind]] : [];
    dashboard.value = data;
    emit('loaded', data);
    for (const kind of ['lines', 'divisions', 'employees']) {
      api.contextOptions(kind, { lines: [] }).then((list) => (pickers[kind] = list.length > 0)).catch(() => (pickers[kind] = false));
    }
  } catch (error) {
    loadError.value = error;
  }
}

watch(() => props.dashboardId, load);
onMounted(load);
</script>

<template>
  <div class="rg-root rg-dashboard" :data-rg-theme="theme">
    <div v-if="loadError" class="rg-main">
      <div class="rg-empty">
        <div class="rg-empty__icon"><RgIcon :name="loadError.status === 403 ? 'lock' : 'alert'" /></div>
        <h2>{{ loadError.status === 403 ? 'You cannot open this dashboard' : 'The dashboard could not be opened' }}</h2>
        <p>{{ loadError.message }}</p>
        <button type="button" class="rg-btn" @click="load">Try again</button>
      </div>
    </div>

    <template v-else>
      <header class="rg-topbar">
        <div class="rg-topbar__title">
          <h1 v-if="dashboard">{{ dashboard.name }}</h1>
          <div v-else class="rg-skeleton" style="width: 220px; height: 18px" />
          <div v-if="dashboard?.description" class="rg-topbar__meta"><span>{{ dashboard.description }}</span></div>
        </div>
        <div class="rg-topbar__actions">
          <button v-if="dashboard?.can_edit" type="button" class="rg-btn" @click="emit('edit', dashboard.uuid)"><RgIcon name="fx" small /> Edit</button>
          <button type="button" class="rg-btn rg-btn--primary" :disabled="!dashboard" @click="refresh"><RgIcon name="play" small /> Refresh</button>
        </div>
      </header>

      <form v-if="dashboard" class="rg-viewer__filters" @submit.prevent="refresh">
        <label class="rg-viewer__filter" for="rg-dash-period">
          <span><RgIcon name="calendar" small /> Period</span>
          <select id="rg-dash-period" v-model="filters.period" class="rg-input" @change="filters.period !== 'custom' && refresh()">
            <option value="">As saved in each report</option>
            <option v-for="[value, label] in PERIODS" :key="value" :value="value">{{ label }}</option>
            <option value="custom">Custom range…</option>
          </select>
        </label>
        <div v-if="filters.period === 'custom'" class="rg-viewer__range">
          <input v-model="filters.from" class="rg-input" type="date" aria-label="From" required />
          <span class="rg-faint">to</span>
          <input v-model="filters.to" class="rg-input" type="date" aria-label="To" required />
        </div>
        <div v-if="pickers.lines" class="rg-viewer__filter">
          <span><RgIcon name="folder" small /> Lines</span>
          <RgMultiSelect v-model="filters.lines" label="Lines" all-label="All my lines" :load="optionsFor('lines')" @change="refresh" />
        </div>
        <div v-if="pickers.divisions" class="rg-viewer__filter">
          <span><RgIcon name="users" small /> Divisions</span>
          <RgMultiSelect v-model="filters.divisions" label="Divisions" all-label="All my divisions" :load="optionsFor('divisions')" :depends-on="filters.lines" @change="refresh" />
        </div>
        <div v-if="pickers.employees" class="rg-viewer__filter">
          <span><RgIcon name="users" small /> Employees</span>
          <RgMultiSelect v-model="filters.employees" label="Employees" all-label="All my employees" :load="optionsFor('employees')" :depends-on="filters.lines" @change="refresh" />
        </div>
        <button type="submit" class="rg-btn">Apply</button>
      </form>

      <main class="rg-dashboard__body">
        <div v-if="!dashboard" class="rg-dashboard__grid">
          <div v-for="n in 4" :key="n" class="rg-widget rg-widget--md"><div class="rg-widget__skeleton"><span v-for="m in 4" :key="m" class="rg-skeleton" /></div></div>
        </div>
        <div v-else class="rg-dashboard__grid">
          <DashboardWidget v-for="(widget, i) in dashboard.layout.widgets" :key="widget.id" :widget="widget" :load="loader(widget)" :version="version" :style="{ '--rg-delay': `${i * 50}ms` }" />
          <p v-if="!dashboard.layout.widgets.length" class="rg-faint">This dashboard has no widgets yet.</p>
        </div>
      </main>
    </template>
  </div>
</template>
