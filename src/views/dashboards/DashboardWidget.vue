<script setup>
import { computed, ref, watch } from 'vue';
import { formatCell, isNumericColumn } from '../../utils/values.js';
import RgIcon from '../../components/ui/RgIcon.vue';
import KpiTile from './charts/KpiTile.vue';
import BarChart from './charts/BarChart.vue';
import LineChart from './charts/LineChart.vue';
import ShareBar from './charts/ShareBar.vue';
import ColumnChart from './charts/ColumnChart.vue';
import PieChart from './charts/PieChart.vue';

/**
 * One dashboard card: loads its data through `load()` whenever `version`
 * changes, shows a skeleton meanwhile, then the chart, with the same
 * numbers in a table for screen readers.
 */
const props = defineProps({
  widget: { type: Object, required: true },
  /** () => Promise<{ type, columns, rows }> */
  load: { type: Function, required: true },
  /** Bump to reload (filters changed). */
  version: { type: [Number, String], default: 0 },
});

const data = ref(null);
const error = ref(null);
// No access to the report behind the widget: the card stays, its data does not.
const locked = ref(props.widget.can_view === false);
const loading = ref(false);
let seq = 0;

async function fetch() {
  if (props.widget.can_view === false) {
    locked.value = true;
    return;
  }
  const mine = ++seq;
  loading.value = true;
  error.value = null;
  try {
    const result = await props.load();
    if (mine === seq) data.value = result;
  } catch (e) {
    if (mine === seq && (e?.code === 'REPORT_FORBIDDEN' || e?.status === 403)) locked.value = true;
    else if (mine === seq) error.value = e?.message ?? 'This widget could not load.';
  } finally {
    if (mine === seq) loading.value = false;
  }
}

watch(() => [props.version, JSON.stringify(props.widget)], fetch, { immediate: true });

const byAlias = computed(() => Object.fromEntries((data.value?.columns ?? []).map((c) => [c.alias, c])));
const category = computed(() => byAlias.value[props.widget.category] ?? null);
const values = computed(() => (props.widget.values ?? []).map((a) => byAlias.value[a]).filter(Boolean));
const empty = computed(() => data.value && data.value.rows.length === 0);
const tableColumns = computed(() => data.value?.columns ?? []);

defineExpose({ reload: fetch });
</script>

<template>
  <article class="rg-widget" :class="[`rg-widget--${widget.type}`, `rg-widget--${widget.size ?? 'md'}`]">
    <header class="rg-widget__head">
      <div class="rg-widget__titles">
        <h3>{{ widget.title || (values[0]?.label ?? 'Widget') }}</h3>
        <small v-if="widget.report_name" class="rg-faint">{{ widget.report_name }}</small>
      </div>
      <slot name="actions" />
    </header>

    <div class="rg-widget__body" :aria-busy="loading ? 'true' : 'false'">
      <div v-if="locked" class="rg-widget__locked">
        <span class="rg-empty__icon"><RgIcon name="lock" /></span>
        <span>You need access to <b>{{ widget.report_name ?? 'its report' }}</b> to see this.</span>
      </div>
      <div v-else-if="loading && !data" class="rg-widget__skeleton">
        <span v-for="n in (widget.type === 'kpi' ? 2 : 5)" :key="n" class="rg-skeleton" :style="{ width: `${40 + ((n * 29) % 55)}%` }" />
      </div>
      <p v-else-if="error" class="rg-widget__error"><RgIcon name="alert" small /> {{ error }}</p>
      <p v-else-if="empty" class="rg-widget__empty rg-faint">No data for these filters.</p>
      <template v-else-if="data">
        <div :class="{ 'rg-widget__stale': loading }">
          <div v-if="widget.type === 'kpi'" class="rg-kpis">
            <KpiTile v-for="v in values" :key="v.alias" :label="values.length > 1 || !widget.title ? v.label : ''" :value="data.rows[0]?.[v.alias] ?? null" :column="v" />
          </div>
          <BarChart v-else-if="widget.type === 'bar' && category && values[0]" :rows="data.rows" :category="category" :value="values[0]" />
          <ColumnChart v-else-if="widget.type === 'column' && category && values[0]" :rows="data.rows" :category="category" :value="values[0]" />
          <LineChart v-else-if="['line', 'area'].includes(widget.type) && category && values.length" :rows="data.rows" :category="category" :values="values" :area="widget.type === 'area'" />
          <PieChart v-else-if="['pie', 'donut'].includes(widget.type) && category && values[0]" :rows="data.rows" :category="category" :value="values[0]" :donut="widget.type === 'donut'" :parts="widget.top ?? 6" />
          <ShareBar v-else-if="widget.type === 'share' && category && values[0]" :rows="data.rows" :category="category" :value="values[0]" :parts="widget.top ?? 6" />
          <div v-else-if="widget.type === 'table'" class="rg-widget__table">
            <table class="rg-grid">
              <thead><tr><th v-for="c in tableColumns" :key="c.alias" :class="{ 'rg-num': isNumericColumn(c) }">{{ c.label }}</th></tr></thead>
              <tbody>
                <tr v-for="(row, i) in data.rows" :key="i" class="rg-row">
                  <td v-for="c in tableColumns" :key="c.alias" :class="{ 'rg-num': isNumericColumn(c) }">{{ formatCell(row[c.alias], c) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- The same numbers for screen readers. -->
        <table v-if="widget.type !== 'table' && !locked" class="rg-sr-only">
          <caption>{{ widget.title }}</caption>
          <thead><tr><th v-for="c in tableColumns" :key="c.alias">{{ c.label }}</th></tr></thead>
          <tbody><tr v-for="(row, i) in data.rows" :key="i"><td v-for="c in tableColumns" :key="c.alias">{{ formatCell(row[c.alias], c) }}</td></tr></tbody>
        </table>
      </template>
    </div>
  </article>
</template>
