<script setup>
import { computed, inject, reactive, ref } from 'vue';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import RgIcon from '../../components/ui/RgIcon.vue';
import FieldNode from './FieldNode.vue';

/**
 * The fields a report can use, as the tree of its topic's relations
 * (Visits ▸ Employee ▸ Line). Search opens every branch that matches.
 */
const builder = inject(REPORT_BUILDER_KEY);
const search = ref('');
const open = reactive({});
/**
 * Servers before 0.4 send only the flat list: the report's topic with the
 * others under it, each asking which way to join when there are several.
 */
function fromDatasets(datasets, root) {
  const top = datasets.find((d) => d.key === root);
  if (!top) return null;
  const node = (d) => ({
    name: d.key,
    label: d.label,
    topic: d.key,
    topic_label: d.label,
    path: d.key === root ? [] : d.paths?.length === 1 ? d.paths[0].path : undefined,
    multiplies_rows: (d.paths ?? []).some((p) => p.multiplies_rows),
    fields: d.fields,
    relations: [],
  });
  return { ...node(top), relations: datasets.filter((d) => d.key !== root).map(node) };
}

const tree = computed(() => builder.state.catalog?.tree ?? fromDatasets(builder.state.catalog?.datasets ?? [], builder.state.draft.root));
</script>

<template>
  <aside class="rg-explorer" aria-label="Fields">
    <div class="rg-explorer__head">
      <label class="rg-search">
        <span class="rg-sr-only">Search fields</span>
        <RgIcon name="search" />
        <input id="rg-field-search" v-model="search" class="rg-input" type="search" placeholder="Search fields" autocomplete="off" />
      </label>
      <span class="rg-explorer__hint">Drag fields onto Rows, Values or Filters, or double-click to add.</span>
    </div>
    <div class="rg-explorer__list">
      <FieldNode v-if="tree" :node="tree" :search="search" :open="open" />
      <div v-else class="rg-skeleton-list"><div v-for="n in 6" :key="n" class="rg-skeleton" /></div>
    </div>
  </aside>
</template>
