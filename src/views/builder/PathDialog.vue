<script setup>
import { inject } from 'vue';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import RgDialog from '../../components/ui/RgDialog.vue';

const builder = inject(REPORT_BUILDER_KEY);
const theme = inject('rg-theme', 'light');
</script>

<template>
  <RgDialog
    v-if="builder.state.pathChoice"
    :title="`How should ${builder.state.pathChoice.dataset.label} connect to this report?`"
    :data-rg-theme="theme"
    @close="builder.state.pathChoice = null"
  >
    <p class="rg-muted" style="margin: 0">
      {{ builder.state.pathChoice.dataset.label }} can be reached in more than one way, and each gives different numbers.
    </p>
    <button
      v-for="option in builder.state.pathChoice.options"
      :key="option.path.join('.')"
      type="button"
      class="rg-path-option"
      @click="builder.choosePath(option.path)"
    >
      <b>{{ option.description }}</b>
      <span v-if="option.multiplies_rows" class="rg-badge rg-badge--warning">several per report row</span>
    </button>
    <template #footer>
      <button type="button" class="rg-btn" @click="builder.state.pathChoice = null">Cancel</button>
    </template>
  </RgDialog>
</template>
