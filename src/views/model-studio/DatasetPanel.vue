<script setup>
import { computed, inject, ref, watch } from 'vue';
import { MODEL_STUDIO_KEY } from '../../composables/useModelStudio.js';
import { formatCount, pluralize } from '../../utils/format.js';
import RgIcon from '../../components/ui/RgIcon.vue';
import RgSwitch from '../../components/ui/RgSwitch.vue';
import FieldsTable from './FieldsTable.vue';
import RelationshipsPanel from './RelationshipsPanel.vue';

const studio = inject(MODEL_STUDIO_KEY);
const tab = ref('fields');
const label = ref('');

const detail = computed(() => studio.state.detail);
const timeFields = computed(() => detail.value?.fields.filter((f) => f.role === 'time' && !f.missing) ?? []);
const pendingCount = computed(() => detail.value?.relationships.filter((r) => r.status === 'pending').length ?? 0);
const visibleCount = computed(() => detail.value?.fields.filter((f) => !f.is_hidden && !f.missing).length ?? 0);

watch(() => detail.value?.id, () => {
  label.value = detail.value?.label ?? '';
  if (pendingCount.value && tab.value === 'fields' && detail.value?.fields.length === 0) tab.value = 'relationships';
}, { immediate: true });

function saveLabel() {
  const value = label.value.trim();
  if (!value) {
    label.value = detail.value.label;
    return;
  }
  if (value !== detail.value.label) studio.updateDataset({ label: value }).catch(() => (label.value = detail.value.label));
}
</script>

<template>
  <div v-if="studio.state.loadingDetail && !detail" class="rg-panel">
    <div class="rg-skeleton" style="width: 40%; height: 22px" />
    <div class="rg-skeleton" style="width: 60%" />
  </div>

  <div v-else-if="!detail" class="rg-empty">
    <div class="rg-empty__icon"><RgIcon name="table" /></div>
    <h2>Pick a dataset</h2>
    <p>Choose a table on the left to rename it, decide which columns users see, and check how it connects to other tables.</p>
  </div>

  <section v-else class="rg-panel" :aria-busy="studio.state.loadingDetail ? 'true' : 'false'">
    <div class="rg-panel__head">
      <div class="rg-panel__title">
        <label class="rg-sr-only" for="rg-dataset-label">Dataset name</label>
        <input
          id="rg-dataset-label"
          v-model="label"
          class="rg-input rg-input--bare"
          maxlength="255"
          @blur="saveLabel"
          @keydown.enter="$event.target.blur()"
        />
        <div class="rg-facts">
          <span><RgIcon :name="detail.source_type === 'view' ? 'view' : 'table'" small /><span class="rg-mono">{{ detail.source_name }}</span></span>
          <span class="rg-num">{{ formatCount(detail.row_estimate) }} rows (estimate)</span>
          <span>{{ visibleCount }} of {{ pluralize(detail.fields.length, 'field') }} visible</span>
          <span v-if="detail.primary_key"><RgIcon name="key" small />{{ detail.primary_key }}</span>
          <span v-if="detail.soft_delete_column" title="Rows with this column set are excluded from reports automatically">
            Deleted rows filtered by <span class="rg-mono">{{ detail.soft_delete_column }}</span>
          </span>
          <span v-if="detail.missing" class="rg-badge rg-badge--danger">Missing from the database</span>
        </div>
      </div>
      <div class="rg-panel__controls">
        <label class="rg-field-inline" for="rg-default-date">
          Default date
          <select
            id="rg-default-date"
            class="rg-select"
            :value="detail.default_time_field ?? ''"
            @change="studio.updateDataset({ default_time_field: $event.target.value || null })"
          >
            <option value="">None</option>
            <option v-for="f in timeFields" :key="f.key" :value="f.key">{{ f.label }}</option>
          </select>
        </label>
        <span class="rg-field-inline">
          Visible to users
          <RgSwitch
            :model-value="!detail.is_hidden"
            :label="detail.is_hidden ? 'Show this dataset to users' : 'Hide this dataset from users'"
            @update:model-value="studio.updateDataset({ is_hidden: !$event })"
          />
        </span>
      </div>
    </div>

    <div class="rg-segtabs" role="tablist">
      <button type="button" role="tab" :aria-selected="tab === 'fields' ? 'true' : 'false'" @click="tab = 'fields'">
        Fields <span class="rg-badge">{{ detail.fields.length }}</span>
      </button>
      <button type="button" role="tab" :aria-selected="tab === 'relationships' ? 'true' : 'false'" @click="tab = 'relationships'">
        Relationships
        <span class="rg-badge" :class="{ 'rg-badge--warning': pendingCount }">{{ pendingCount ? `${pendingCount} to review` : detail.relationships.length }}</span>
      </button>
    </div>

    <FieldsTable v-if="tab === 'fields'" :key="`f-${detail.id}`" :fields="detail.fields" />
    <RelationshipsPanel v-else :key="`r-${detail.id}`" :dataset="detail" />
  </section>
</template>
