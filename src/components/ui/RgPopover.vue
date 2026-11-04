<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

/** A small panel under its anchor; closes on outside click or Escape. */
const emit = defineEmits(['close']);
const panel = ref(null);

function onPointer(event) {
  if (panel.value && !panel.value.parentElement?.contains(event.target)) emit('close');
}
function onKey(event) {
  if (event.key === 'Escape') emit('close');
}

onMounted(() => {
  setTimeout(() => document.addEventListener('mousedown', onPointer), 0);
  document.addEventListener('keydown', onKey);
  panel.value?.querySelector('input, select, textarea, button')?.focus();
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onPointer);
  document.removeEventListener('keydown', onKey);
});
</script>

<template>
  <div ref="panel" class="rg-pop" role="dialog" @click.stop>
    <slot />
  </div>
</template>
