<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { formatCell } from '../../../utils/values.js';
import { observeWidth } from './scale.js';

/**
 * Horizontal bars, largest first: names stay readable, values sit at the
 * bar tips. One series (slot 1); thickness capped at 22px, 4px rounded
 * data end, square at the baseline.
 */
const props = defineProps({
  rows: { type: Array, required: true },
  category: { type: Object, required: true },
  value: { type: Object, required: true },
});

const el = ref(null);
const width = ref(600);
const hover = ref(null);
let stop = () => {};
onMounted(() => (stop = observeWidth(el.value, (w) => (width.value = w))));
onBeforeUnmount(() => stop());

const BAR = 22;
const GAP = 10;
const labelWidth = computed(() => Math.min(180, Math.max(80, width.value * 0.32)));
const valueWidth = 72;
const track = computed(() => Math.max(40, width.value - labelWidth.value - valueWidth - 12));
const max = computed(() => Math.max(0, ...props.rows.map((r) => Number(r[props.value.alias]) || 0)));
const items = computed(() => props.rows.map((row, i) => {
  const v = Number(row[props.value.alias]) || 0;
  const w = max.value > 0 ? Math.max(v > 0 ? 3 : 0, (v / max.value) * track.value) : 0;
  return { i, row, v, w, y: i * (BAR + GAP), name: formatCell(row[props.category.alias], props.category) || '(empty)', text: formatCell(row[props.value.alias], props.value) };
}));
const height = computed(() => Math.max(BAR, props.rows.length * (BAR + GAP) - GAP));

/** Rounded at the data end only (the right), square at the baseline. */
function barPath(w) {
  if (w <= 0) return '';
  const r = Math.min(4, w / 2, BAR / 2);
  return `M0,0 H${w - r} Q${w},0 ${w},${r} V${BAR - r} Q${w},${BAR} ${w - r},${BAR} H0 Z`;
}
</script>

<template>
  <div ref="el" class="rg-chart rg-bar" @mouseleave="hover = null">
    <svg :width="width" :height="height" role="img" :aria-label="`${value.label} by ${category.label}`">
      <g v-for="item in items" :key="item.i" :transform="`translate(0, ${item.y})`" class="rg-bar__row" @mouseenter="hover = item">
        <rect :x="0" :y="-GAP / 2" :width="width" :height="BAR + GAP" fill="transparent" />
        <text :x="labelWidth - 8" :y="BAR / 2" class="rg-chart__label" text-anchor="end" dominant-baseline="central">
          {{ item.name.length > 24 ? `${item.name.slice(0, 23)}…` : item.name }}
        </text>
        <g :transform="`translate(${labelWidth}, 0)`">
          <rect :width="track" :height="BAR" class="rg-bar__track" rx="4" />
          <path :d="barPath(item.w)" class="rg-bar__fill rg-series-1" :class="{ 'is-dim': hover && hover.i !== item.i }" :style="{ '--rg-delay': `${item.i * 40}ms` }" />
          <text :x="item.w + 6" :y="BAR / 2" class="rg-chart__value" dominant-baseline="central">{{ item.text }}</text>
        </g>
      </g>
    </svg>
    <div v-if="hover" class="rg-chart__tip" :style="{ top: `${hover.y - 6}px`, insetInlineStart: `${labelWidth + Math.min(hover.w, track - 120)}px` }" role="status">
      <b>{{ hover.name }}</b>
      <span>{{ value.label }}: <b class="rg-num">{{ hover.text }}</b></span>
    </div>
  </div>
</template>
