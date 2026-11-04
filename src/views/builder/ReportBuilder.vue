<script setup>
import { onBeforeUnmount, onMounted, provide, ref, watch } from 'vue';
import { useReportGenerator } from '../../context.js';
import { createReportBuilder, REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import { createToasts } from '../../composables/useToasts.js';
import RgToaster from '../../components/ui/RgToaster.vue';
import RgIcon from '../../components/ui/RgIcon.vue';
import BuilderTopbar from './BuilderTopbar.vue';
import RootPicker from './RootPicker.vue';
import FieldExplorer from './FieldExplorer.vue';
import ShelfDrop from './ShelfDrop.vue';
import FilterGroupView from './FilterGroupView.vue';
import ResultsPanel from './ResultsPanel.vue';
import FormulaDialog from './FormulaDialog.vue';
import SaveDialog from './SaveDialog.vue';
import PathDialog from './PathDialog.vue';

const props = defineProps({
  /** uuid of a saved report to open; null starts a new one */
  reportId: { type: String, default: null },
  theme: { type: String, default: 'light' },
});
const emit = defineEmits(['saved']);

const { api } = useReportGenerator();
const toasts = createToasts();
const builder = createReportBuilder(api, toasts);
provide(REPORT_BUILDER_KEY, builder);
provide('rg-theme', props.theme);

const formula = ref(null); // { item } while the formula dialog is open
const saving = ref(null); // { copy } while the save dialog is open
const folders = ref([]);
const filtersDrop = ref(false);

watch(() => props.reportId, (id) => builder.init(id), { immediate: false });

onMounted(async () => {
  await builder.init(props.reportId);
  document.addEventListener('keydown', onKey);
  api.reports.list({ scope: 'mine' }).then((r) => (folders.value = r.folders ?? [])).catch(() => {});
});
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey);
  builder.cancelRunning();
});

function onKey(event) {
  const mod = event.ctrlKey || event.metaKey;
  if (!mod) return;
  const inField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
  if (event.key === 's') {
    event.preventDefault();
    if (builder.runnable.value) saving.value = { copy: false };
  } else if (event.key === 'Enter') {
    event.preventDefault();
    builder.run();
  } else if (event.key.toLowerCase() === 'z' && !inField) {
    event.preventDefault();
    event.shiftKey ? builder.redo() : builder.undo();
  }
}

function onFiltersDrop(event) {
  filtersDrop.value = false;
  try {
    const data = JSON.parse(event.dataTransfer.getData('application/x-rg'));
    if (data.kind === 'field') builder.addField(data.dataset, data.field, 'filters');
    if (data.kind === 'item') builder.filterOnTotal(data.uid);
  } catch {
    // not ours
  }
}

function onSaved(report) {
  emit('saved', report);
}
</script>

<template>
  <div class="rg-root rg-builder" :data-rg-theme="theme">
    <BuilderTopbar @save="saving = { copy: false }" @save-copy="saving = { copy: true }" />

    <div v-if="builder.state.loading" class="rg-builder__body">
      <aside class="rg-explorer"><div class="rg-skeleton-list"><div v-for="n in 10" :key="n" class="rg-skeleton" /></div></aside>
      <main class="rg-builder__main" />
    </div>

    <main v-else-if="!builder.state.draft.root" class="rg-main">
      <RootPicker />
    </main>

    <div v-else class="rg-builder__body">
      <FieldExplorer />
      <main class="rg-builder__main">
        <div class="rg-shelves">
          <ShelfDrop shelf="rows" title="Rows" empty="Drop fields to group by (lines, reps, months…)" />
          <ShelfDrop shelf="values" title="Values" empty="Drop numbers to total (amounts, number of visits…)" @edit-formula="formula = { item: $event }">
            <button type="button" class="rg-btn rg-btn--sm rg-btn--ghost" @click="formula = { item: null }">
              <RgIcon name="fx" small /> Formula
            </button>
          </ShelfDrop>
          <div class="rg-shelf">
            <span class="rg-shelf__title">Filters</span>
            <div
              class="rg-shelf__drop"
              :class="{ 'rg-shelf__drop--over': filtersDrop }"
              style="display: block"
              aria-label="Filters shelf"
              @dragover="[...$event.dataTransfer.types].includes('application/x-rg') && ($event.preventDefault(), (filtersDrop = true))"
              @dragleave.self="filtersDrop = false"
              @drop.prevent="onFiltersDrop"
            >
              <FilterGroupView v-if="builder.state.draft.filters.items.length" :group="builder.state.draft.filters" />
              <span v-else class="rg-shelf__empty">Drop a field to filter the rows, or a value to filter totals</span>
              <div v-if="builder.state.draft.filters.items.length" style="margin-top: 6px">
                <button type="button" class="rg-btn rg-btn--sm rg-btn--ghost" @click="builder.addFilterGroup()">
                  <RgIcon name="plus" small /> Add a group ({{ builder.state.draft.filters.boolean === 'and' ? 'any of' : 'all of' }})
                </button>
              </div>
            </div>
          </div>
          <div class="rg-shelf">
            <span class="rg-shelf__title">Options</span>
            <div class="rg-panel__controls" style="gap: 16px; padding-top: 4px">
              <label class="rg-field-inline" for="rg-opt-grouped" title="Show rows as groups you open one level at a time">
                <input id="rg-opt-grouped" v-model="builder.state.draft.grouped" class="rg-check" type="checkbox" :disabled="builder.state.draft.rows.length < 2" />
                Group rows (open level by level)
              </label>
              <label class="rg-field-inline" for="rg-opt-subtotals">
                <input id="rg-opt-subtotals" v-model="builder.state.draft.subtotals" class="rg-check" type="checkbox" :disabled="!builder.state.draft.values.length || builder.grouped.value" />
                Subtotals
              </label>
            </div>
          </div>
        </div>
        <ResultsPanel />
      </main>
    </div>

    <FormulaDialog v-if="formula" :item="formula.item" @close="formula = null" />
    <SaveDialog v-if="saving" :copy="saving.copy" :folders="folders" @close="saving = null" @saved="onSaved" />
    <PathDialog />
    <RgToaster :toasts="toasts" :data-rg-theme="theme" />
  </div>
</template>
