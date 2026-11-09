<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { formatCell } from '../../../utils/values.js';
import { axisLabel, niceTicks, observeWidth } from './scale.js';

/**
 * Numbers over an ordered column (months, days). One axis for every series
 * (pick numbers of the same scale); 2px lines, a 10% wash under a single
 * series, an end dot with its value, and a crosshair tooltip on hover.
 */
const props = defineProps({
  rows: { type: Array, required: true },
  category: { type: Object, required: true },
  values: { type: Array, required: true },
  height: { type: Number, default: 220 },
  /** Fill under the lines (area chart). */
  area: { type: Boolean, default: false },
});

const el = ref(null);
const width = ref(600);
const hover = ref(null);
let stop = () => {};
onMounted(() => (stop = observeWidth(el.value, (w) => (width.value = w))));
onBeforeUnmount(() => stop());

const M = { top: 12, right: 64, bottom: 28, left: 52 };
const plotW = computed(() => Math.max(40, width.value - M.left - M.right));
const plotH = computed(() => props.height - M.top - M.bottom);
const scale = computed(() => niceTicks(Math.max(0, ...props.rows.flatMap((r) => props.values.map((v) => Number(r[v.alias]) || 0)))));
const x = (i) => (props.rows.length < 2 ? plotW.value / 2 : (i / (props.rows.length - 1)) * plotW.value);
const y = (v) => plotH.value - ((Number(v) || 0) / scale.value.max) * plotH.value;

const series = computed(() => props.values.map((column, s) => {
  const points = props.rows.map((r, i) => [x(i), r[column.alias] === null || r[column.alias] === undefined ? null : y(r[column.alias])]);
  let d = '';
  points.forEach(([px, py], i) => {
    if (py === null) return;
    d += `${d === '' || points[i - 1]?.[1] === null ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
  });
  const last = [...points].reverse().find((p) => p[1] !== null);
  return { column, slot: s + 1, d, area: props.area && d ? `${d}L${x(props.rows.length - 1)},${plotH.value}L${x(0)},${plotH.value}Z` : null, last };
}));

const xLabels = computed(() => {
  const n = props.rows.length;
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(plotW.value / 70))));
  const labels = props.rows.map((r, i) => ({ i, text: formatCell(r[props.category.alias], props.category) })).filter((l) => l.i % every === 0 || l.i === n - 1);
  // Never let a label run into the last one.
  const last = labels[labels.length - 1];
  return labels.filter((l) => l === last || x(last.i) - x(l.i) >= 64);
});

function onMove(event) {
  const box = event.currentTarget.getBoundingClientRect();
  const px = event.clientX - box.left - M.left;
  if (props.rows.length === 0) return;
  const i = props.rows.length < 2 ? 0 : Math.round((px / plotW.value) * (props.rows.length - 1));
  hover.value = Math.min(props.rows.length - 1, Math.max(0, i));
}

const lastValue = (s) => formatCell(props.rows[props.rows.length - 1]?.[s.column.alias], s.column);
</script>

<template>
  <div ref="el" class="rg-chart rg-line">
    <ul v-if="values.length > 1" class="rg-legend">
      <li v-for="s in series" :key="s.column.alias"><i :class="`rg-swatch rg-series-${s.slot}`" />{{ s.column.label }}</li>
    </ul>
    <svg :width="width" :height="height" role="img" :aria-label="`${values.map((v) => v.label).join(', ')} by ${category.label}`" @mousemove="onMove" @mouseleave="hover = null">
      <g :transform="`translate(${M.left}, ${M.top})`">
        <g class="rg-chart__grid">
          <g v-for="t in scale.ticks" :key="t" :transform="`translate(0, ${y(t)})`">
            <line :x2="plotW" />
            <text x="-8" dominant-baseline="central" text-anchor="end" class="rg-chart__axis">{{ axisLabel(t, scale.max) }}</text>
          </g>
        </g>
        <text v-for="l in xLabels" :key="l.i" :x="x(l.i)" :y="plotH + 18" text-anchor="middle" class="rg-chart__axis">{{ l.text }}</text>
        <path v-for="s in series" v-show="s.area" :key="`a${s.slot}`" :d="s.area ?? ''" :class="`rg-line__area rg-series-${s.slot}`" />
        <path v-for="s in series" :key="`l${s.slot}`" :d="s.d" :class="`rg-line__path rg-series-${s.slot}`" pathLength="1" />
        <g v-for="s in series" v-show="s.last" :key="`e${s.slot}`">
          <circle v-if="s.last" :cx="s.last[0]" :cy="s.last[1]" r="4" :class="`rg-line__dot rg-series-${s.slot}`" />
          <text v-if="s.last && values.length <= 4" :x="s.last[0] + 8" :y="s.last[1]" dominant-baseline="central" class="rg-chart__value">{{ lastValue(s) }}</text>
        </g>
        <g v-if="hover !== null">
          <line :x1="x(hover)" :x2="x(hover)" :y2="plotH" class="rg-line__cross" />
          <template v-for="s in series" :key="`h${s.slot}`">
            <circle v-if="rows[hover]?.[s.column.alias] !== null && rows[hover]?.[s.column.alias] !== undefined" :cx="x(hover)" :cy="y(rows[hover][s.column.alias])" r="4" :class="`rg-line__dot rg-series-${s.slot}`" />
          </template>
        </g>
      </g>
    </svg>
    <div v-if="hover !== null" class="rg-chart__tip" :style="{ top: '8px', insetInlineStart: `${Math.min(M.left + x(hover) + 12, width - 180)}px` }" role="status">
      <b>{{ formatCell(rows[hover][category.alias], category) }}</b>
      <span v-for="s in series" :key="s.column.alias"><i v-if="values.length > 1" :class="`rg-swatch rg-series-${s.slot}`" />{{ s.column.label }}: <b class="rg-num">{{ formatCell(rows[hover][s.column.alias], s.column) }}</b></span>
    </div>
  </div>
</template>
