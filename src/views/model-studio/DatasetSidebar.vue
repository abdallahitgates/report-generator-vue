<script setup>
import { inject } from 'vue';
import { MODEL_STUDIO_KEY } from '../../composables/useModelStudio.js';
import { formatCount } from '../../utils/format.js';
import RgIcon from '../../components/ui/RgIcon.vue';

const studio = inject(MODEL_STUDIO_KEY);

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'review', label: 'To review' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'missing', label: 'Missing' },
];
</script>

<template>
  <aside class="rg-sidebar" aria-label="Datasets">
    <div class="rg-sidebar__head">
      <label class="rg-search">
        <span class="rg-sr-only">Search datasets</span>
        <RgIcon name="search" />
        <input
          id="rg-dataset-search"
          v-model="studio.state.search"
          class="rg-input"
          type="search"
          placeholder="Search tables"
          autocomplete="off"
        />
      </label>
      <div class="rg-tabs" role="tablist">
        <template v-for="tab in TABS" :key="tab.value">
          <button
            v-if="tab.value !== 'missing' || studio.counts.value.missing"
            type="button"
            role="tab"
            class="rg-tab"
            :aria-selected="studio.state.filter === tab.value ? 'true' : 'false'"
            @click="studio.state.filter = tab.value"
          >
            {{ tab.label }} <span class="rg-num">{{ studio.counts.value[tab.value] }}</span>
          </button>
        </template>
      </div>
    </div>

    <ul class="rg-list">
      <li v-for="dataset in studio.filtered.value" :key="dataset.id">
        <button
          type="button"
          class="rg-list__item"
          :class="{ 'rg-list__item--muted': dataset.is_hidden || dataset.missing }"
          :aria-current="studio.state.view === 'dataset' && studio.state.selectedId === dataset.id ? 'true' : 'false'"
          @click="studio.select(dataset.id)"
        >
          <span class="rg-list__label">{{ dataset.label }}</span>
          <span class="rg-list__flags">
            <span v-if="dataset.missing" class="rg-badge rg-badge--danger">missing</span>
            <span v-else-if="dataset.pending_relationships_count" class="rg-badge rg-badge--warning" :title="`${dataset.pending_relationships_count} relationships to review`">
              {{ dataset.pending_relationships_count }}
            </span>
            <RgIcon v-if="dataset.is_hidden" name="eyeOff" small title="Hidden from users" />
          </span>
          <span class="rg-list__sub">
            <RgIcon :name="dataset.source_type === 'view' ? 'view' : 'table'" small />
            <span class="rg-mono">{{ dataset.source_name }}</span>
          </span>
          <span class="rg-list__sub rg-num" :title="dataset.row_estimate === null ? 'Row count unknown' : 'Estimated rows'">
            {{ formatCount(dataset.row_estimate) }}
          </span>
        </button>
      </li>
      <li v-if="!studio.filtered.value.length" class="rg-list__empty">
        {{ studio.state.search ? 'No table matches your search.' : 'Nothing here.' }}
      </li>
    </ul>
  </aside>
</template>
