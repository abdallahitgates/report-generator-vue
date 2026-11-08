<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { formatCell } from '../../../utils/values.js';

/** A headline number: label, value counting up when it arrives. */
const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, null], default: null },
  column: { type: Object, required: true },
});

const shown = ref(props.value);
let frame = null;

function animate(from, to) {
  cancelAnimationFrame(frame);
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (to === null || from === null || reduce || typeof requestAnimationFrame === 'undefined') {
    shown.value = to;
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / 650);
    const eased = 1 - (1 - t) ** 3;
    shown.value = from + (to - from) * eased;
    if (t < 1) frame = requestAnimationFrame(step);
    else shown.value = to;
  };
  frame = requestAnimationFrame(step);
}

watch(() => props.value, (to, from) => animate(from ?? 0, to));
onMounted(() => animate(0, props.value));
onBeforeUnmount(() => cancelAnimationFrame(frame));

const text = (v) => (v === null || v === undefined ? '—' : formatCell(props.column.type === 'integer' ? Math.round(v) : v, props.column));
</script>

<template>
  <div class="rg-kpi">
    <span class="rg-kpi__label">{{ label }}</span>
    <span class="rg-kpi__value rg-num" :aria-label="text(value)">{{ text(shown) }}</span>
  </div>
</template>
