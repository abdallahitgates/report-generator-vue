<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import RgIcon from './RgIcon.vue';

defineProps({ title: { type: String, required: true } });
const emit = defineEmits(['close']);
const dialog = ref(null);

function onKey(event) {
  if (event.key === 'Escape') emit('close');
}

onMounted(() => {
  document.addEventListener('keydown', onKey);
  (dialog.value?.querySelector('.rg-dialog__body textarea, .rg-dialog__body input, .rg-dialog__body button') ?? dialog.value?.querySelector('.rg-dialog__foot button'))?.focus();
});
onBeforeUnmount(() => document.removeEventListener('keydown', onKey));
</script>

<template>
  <Teleport to="body">
    <div class="rg-root rg-overlay" v-bind="$attrs" @mousedown.self="emit('close')">
      <div ref="dialog" class="rg-dialog" role="dialog" aria-modal="true" :aria-label="title">
        <div class="rg-dialog__head">
          <h2>{{ title }}</h2>
          <button type="button" class="rg-btn rg-btn--ghost rg-btn--icon rg-btn--sm rg-dialog__close" aria-label="Close" @click="emit('close')"><RgIcon name="x" small /></button>
        </div>
        <div class="rg-dialog__body"><slot /></div>
        <div class="rg-dialog__foot"><slot name="footer" /></div>
      </div>
    </div>
  </Teleport>
</template>
