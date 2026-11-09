<script setup>
import { computed, ref } from 'vue';
import { formatCell } from '../../../utils/values.js';

/**
 * Pie or donut: up to six slices in the categorical order (the rest folded
 * into "Other"), 2px surface gaps between slices, and a legend that names
 * every slice with its value and share (color is never the only cue). The
 * donut shows the total in its hole.
 */
const props = defineProps({
  rows: { type: Array, required: true },
  category: { type: Object, required: true },
  value: { type: Object, required: true },
  donut: { type: Boolean, default: false },
  parts: { type: Number, default: 6 },
});

const hover = ref(null);
const SIZE = 168;
const R = SIZE / 2 - 2;
const INNER = computed(() => (props.donut ? R * 0.6 : 0));

const total = computed(() => props.rows.reduce((s, r) => s + Math.max(0, Number(r[props.value.alias]) || 0), 0));
const slices = computed(() => {
  const sorted = [...props.rows].sort((a, b) => (Number(b[props.value.alias]) || 0) - (Number(a[props.value.alias]) || 0));
  const head = sorted.slice(0, Math.min(6, props.parts));
  const rest = sorted.slice(head.length);
  const list = head.map((r, i) => ({ key: i, slot: i + 1, name: formatCell(r[props.category.alias], props.category) || '(empty)', v: Math.max(0, Number(r[props.value.alias]) || 0) }));
  const other = rest.reduce((s, r) => s + Math.max(0, Number(r[props.value.alias]) || 0), 0);
  if (other > 0) list.push({ key: 'other', slot: 'other', name: `Other (${rest.length})`, v: other });

  let angle = -Math.PI / 2;
  return list.filter((s) => s.v > 0).map((s) => {
    const share = total.value > 0 ? s.v / total.value : 0;
    const start = angle;
    angle += share * Math.PI * 2;
    return { ...s, share, start, end: angle, text: formatCell(s.v, props.value) };
  });
});

function arc(start, end, outer, inner) {
  // A full circle needs two arcs.
  if (end - start >= Math.PI * 2 - 1e-6) end = start + Math.PI * 2 - 1e-4;
  const large = end - start > Math.PI ? 1 : 0;
  const p = (r, a) => `${(R + 2 + r * Math.cos(a)).toFixed(2)},${(R + 2 + r * Math.sin(a)).toFixed(2)}`;
  if (inner <= 0) return `M${R + 2},${R + 2} L${p(outer, start)} A${outer},${outer} 0 ${large} 1 ${p(outer, end)} Z`;
  return `M${p(outer, start)} A${outer},${outer} 0 ${large} 1 ${p(outer, end)} L${p(inner, end)} A${inner},${inner} 0 ${large} 0 ${p(inner, start)} Z`;
}

const pct = (share) => new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 1 }).format(share);
const centre = computed(() => (hover.value !== null ? slices.value.find((s) => s.key === hover.value) : null));
</script>

<template>
  <div class="rg-chart rg-pie">
    <svg :width="SIZE" :height="SIZE" :viewBox="`0 0 ${SIZE} ${SIZE}`" role="img" :aria-label="`${value.label} by ${category.label}`" class="rg-pie__svg" @mouseleave="hover = null">
      <path
        v-for="(s, i) in slices"
        :key="s.key"
        :d="arc(s.start, s.end, hover === s.key ? R : R - 3, INNER)"
        :class="['rg-pie__slice', `rg-series-${s.slot}`, { 'is-dim': hover !== null && hover !== s.key }]"
        :style="{ '--rg-delay': `${i * 70}ms` }"
        @mouseenter="hover = s.key"
      />
      <g v-if="donut" class="rg-pie__centre">
        <text :x="SIZE / 2" :y="SIZE / 2 - 6" text-anchor="middle" class="rg-pie__total rg-num">{{ centre ? pct(centre.share) : formatCell(total, value) }}</text>
        <text :x="SIZE / 2" :y="SIZE / 2 + 13" text-anchor="middle" class="rg-chart__axis">{{ centre ? centre.name.slice(0, 18) : 'Total' }}</text>
      </g>
    </svg>
    <ul class="rg-share__legend rg-pie__legend">
      <li v-for="s in slices" :key="s.key" :class="{ 'is-hover': hover === s.key }" @mouseenter="hover = s.key" @mouseleave="hover = null">
        <i :class="`rg-swatch rg-series-${s.slot}`" />
        <span class="rg-share__name">{{ s.name }}</span>
        <b class="rg-num">{{ s.text }}</b>
        <span class="rg-num rg-faint">{{ pct(s.share) }}</span>
      </li>
    </ul>
  </div>
</template>
