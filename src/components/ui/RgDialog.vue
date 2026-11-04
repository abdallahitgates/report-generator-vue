<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

defineProps({ title: { type: String, required: true } });
const emit = defineEmits(['close']);
const dialog = ref(null);

function onKey(event) {
  if (event.key === 'Escape') emit('close');
}

onMounted(() => {
  document.addEventListener('keydown', onKey);
  dialog.value?.querySelector('textarea, input, button')?.focus();
});
onBeforeUnmount(() => document.removeEventListener('keydown', onKey));
</script>

<template>
  <Teleport to="body">
    <div class="rg-root rg-overlay" v-bind="$attrs" @mousedown.self="emit('close')">
      <div ref="dialog" class="rg-dialog" role="dialog" aria-modal="true" :aria-label="title">
        <div class="rg-dialog__head"><h2>{{ title }}</h2></div>
        <div class="rg-dialog__body"><slot /></div>
        <div class="rg-dialog__foot"><slot name="footer" /></div>
      </div>
    </div>
  </Teleport>
</template>
