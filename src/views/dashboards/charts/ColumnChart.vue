<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { formatCell } from '../../../utils/values.js';
import { axisLabel, niceTicks, observeWidth } from './scale.js';

/**
 * Vertical columns from one baseline: thickness capped at 24px, 4px rounded
 * tops, value on the cap when it fits, names under the axis (shortened,
 * full name in the tooltip).
 */
const props = defineProps({
  rows: { type: Array, required: true },
  category: { type: Object, required: true },
  value: { type: Object, required: true },
  height: { type: Number, default: 240 },
});

const el = ref(null);
const width = ref(600);
const hover = ref(null);
let stop = () => {};
onMounted(() => (stop = observeWidth(el.value, (w) => (width.value = w))));
onBeforeUnmount(() => stop());

const M = { top: 18, right: 8, bottom: 36, left: 48 };
const plotW = computed(() => Math.max(40, width.value - M.left - M.right));
const plotH = computed(() => props.height - M.top - M.bottom);
const scale = computed(() => niceTicks(Math.max(0, ...props.rows.map((r) => Number(r[props.value.alias]) || 0))));
const band = computed(() => plotW.value / Math.max(1, props.rows.length));
const thick = computed(() => Math.min(24, Math.max(4, band.value - 6)));
const items = computed(() => props.rows.map((row, i) => {
  const v = Math.max(0, Number(row[props.value.alias]) || 0);
  const h = (v / scale.value.max) * plotH.value;
  return {
    i, h, x: i * band.value + (band.value - thick.value) / 2,
    name: formatCell(row[props.category.alias], props.category) || '(empty)',
    text: formatCell(row[props.value.alias], props.value),
  };
}));
const maxChars = computed(() => Math.max(3, Math.floor(band.value / 6.5)));
const short = (name) => (name.length > maxChars.value ? `${name.slice(0, maxChars.value - 1)}…` : name);
const showValues = computed(() => band.value >= 34);

/** Rounded at the top (data end), square at the baseline. */
function colPath(h) {
  if (h <= 0) return '';
  const w = thick.value;
  const r = Math.min(4, w / 2, h);
  return `M0,${h} V${r} Q0,0 ${r},0 H${w - r} Q${w},0 ${w},${r} V${h} Z`;
}
</script>

<template>
  <div ref="el" class="rg-chart rg-column" @mouseleave="hover = null">
    <svg :width="width" :height="height" role="img" :aria-label="`${value.label} by ${category.label}`">
      <g :transform="`translate(${M.left}, ${M.top})`">
        <g class="rg-chart__grid">
          <g v-for="t in scale.ticks" :key="t" :transform="`translate(0, ${plotH - (t / scale.max) * plotH})`">
            <line :x2="plotW" />
            <text x="-8" dominant-baseline="central" text-anchor="end" class="rg-chart__axis">{{ axisLabel(t, scale.max) }}</text>
          </g>
        </g>
        <g v-for="item in items" :key="item.i" @mouseenter="hover = item">
          <rect :x="item.i * band" y="0" :width="band" :height="plotH" fill="transparent" />
          <path :d="colPath(item.h)" :transform="`translate(${item.x}, ${plotH - item.h})`" class="rg-column__fill rg-series-1" :class="{ 'is-dim': hover && hover.i !== item.i }" :style="{ '--rg-delay': `${item.i * 40}ms` }" />
          <text v-if="showValues" :x="item.x + thick / 2" :y="plotH - item.h - 6" text-anchor="middle" class="rg-chart__value">{{ item.text }}</text>
          <text :x="item.x + thick / 2" :y="plotH + 16" text-anchor="middle" class="rg-chart__axis">{{ short(item.name) }}</text>
        </g>
      </g>
    </svg>
    <div v-if="hover" class="rg-chart__tip" :style="{ top: `${Math.max(0, M.top + plotH - hover.h - 56)}px`, insetInlineStart: `${Math.min(M.left + hover.x + thick + 6, width - 170)}px` }" role="status">
      <b>{{ hover.name }}</b>
      <span>{{ value.label }}: <b class="rg-num">{{ hover.text }}</b></span>
    </div>
  </div>
</template>
