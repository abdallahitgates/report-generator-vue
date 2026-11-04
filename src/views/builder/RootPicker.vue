<script setup>
import { computed, inject, ref } from 'vue';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import { formatCount } from '../../utils/format.js';
import RgIcon from '../../components/ui/RgIcon.vue';

const builder = inject(REPORT_BUILDER_KEY);
const search = ref('');

const roots = computed(() => {
  const term = search.value.trim().toLowerCase();
  return (builder.state.roots ?? []).filter((d) => !term || d.label.toLowerCase().includes(term) || d.key.includes(term));
});
</script>

<template>
  <div class="rg-roots">
    <div>
      <h2>What is this report about?</h2>
      <p class="rg-muted" style="margin: 4px 0 0">
        Pick the main dataset: each row of a detailed report is one of these. Fields from connected datasets can be added next.
      </p>
    </div>
    <label class="rg-search" style="max-width: 360px">
      <span class="rg-sr-only">Search datasets</span>
      <RgIcon name="search" />
      <input id="rg-root-search" v-model="search" class="rg-input" type="search" placeholder="Search datasets" autocomplete="off" />
    </label>
    <div class="rg-roots__grid">
      <button v-for="dataset in roots" :key="dataset.key" type="button" class="rg-root-card" @click="builder.chooseRoot(dataset.key)">
        <b>{{ dataset.label }}</b>
        <span class="rg-num">{{ formatCount(dataset.row_estimate) }} rows · {{ dataset.fields_count }} fields</span>
      </button>
    </div>
    <p v-if="builder.state.roots && !roots.length" class="rg-muted">
      {{ search ? 'No dataset matches your search.' : 'There are no datasets you can report on yet. Ask an admin to publish the data model.' }}
    </p>
  </div>
</template>
