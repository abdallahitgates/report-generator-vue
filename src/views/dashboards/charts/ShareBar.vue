<script setup>
import { computed, ref } from 'vue';
import { formatCell } from '../../../utils/values.js';

/**
 * How a total splits across a column: one 100% bar of up to six parts in
 * the categorical order (the rest folded into "Other"), 2px surface gaps,
 * and a legend with each part's value and share.
 */
const props = defineProps({
  rows: { type: Array, required: true },
  category: { type: Object, required: true },
  value: { type: Object, required: true },
  /** Every part when the widget asked for more; only `parts` get their own color. */
  parts: { type: Number, default: 6 },
});

const hover = ref(null);
const total = computed(() => props.rows.reduce((sum, r) => sum + Math.max(0, Number(r[props.value.alias]) || 0), 0));
const segments = computed(() => {
  const sorted = [...props.rows].sort((a, b) => (Number(b[props.value.alias]) || 0) - (Number(a[props.value.alias]) || 0));
  const head = sorted.slice(0, Math.min(6, props.parts));
  const rest = sorted.slice(head.length);
  const list = head.map((r, i) => ({ key: i, slot: i + 1, name: formatCell(r[props.category.alias], props.category) || '(empty)', v: Math.max(0, Number(r[props.value.alias]) || 0) }));
  const other = rest.reduce((sum, r) => sum + Math.max(0, Number(r[props.value.alias]) || 0), 0);
  if (other > 0) list.push({ key: 'other', slot: 'other', name: `Other (${rest.length})`, v: other });
  return list.map((s) => ({ ...s, share: total.value > 0 ? s.v / total.value : 0, text: formatCell(s.v, props.value) }));
});
const pct = (share) => new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 1 }).format(share);
</script>

<template>
  <div class="rg-chart rg-share">
    <div class="rg-share__bar" role="img" :aria-label="`${value.label} by ${category.label}`" @mouseleave="hover = null">
      <span
        v-for="(s, i) in segments"
        :key="s.key"
        :class="['rg-share__seg', `rg-series-${s.slot}`, { 'is-dim': hover !== null && hover !== s.key }]"
        :style="{ flexGrow: s.share, '--rg-delay': `${i * 60}ms` }"
        @mouseenter="hover = s.key"
      />
    </div>
    <ul class="rg-share__legend">
      <li v-for="s in segments" :key="s.key" :class="{ 'is-hover': hover === s.key }" @mouseenter="hover = s.key" @mouseleave="hover = null">
        <i :class="`rg-swatch rg-series-${s.slot}`" />
        <span class="rg-share__name">{{ s.name }}</span>
        <b class="rg-num">{{ s.text }}</b>
        <span class="rg-num rg-faint">{{ pct(s.share) }}</span>
      </li>
    </ul>
  </div>
</template>
