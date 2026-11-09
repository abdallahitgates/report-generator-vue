<script setup>
import RgIcon from './RgIcon.vue';

defineProps({ toasts: { type: Object, required: true } });
</script>

<template>
  <Teleport to="body">
    <div class="rg-root rg-toaster" v-bind="$attrs" role="status" aria-live="polite">
      <TransitionGroup name="rg-toast">
      <div v-for="toast in toasts.items" :key="toast.id" class="rg-toast" :class="`rg-toast--${toast.kind}`">
        <RgIcon :name="toast.kind === 'error' ? 'alert' : 'check'" />
        <p>{{ toast.message }}</p>
        <button type="button" class="rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon" aria-label="Dismiss" @click="toasts.dismiss(toast.id)">
          <RgIcon name="x" small />
        </button>
      </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
