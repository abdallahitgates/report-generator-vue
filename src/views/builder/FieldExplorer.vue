<script setup>
import { computed, inject, ref } from 'vue';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import { TYPE_ICONS } from '../../utils/semantic.js';
import { formatCount } from '../../utils/format.js';
import RgIcon from '../../components/ui/RgIcon.vue';

const builder = inject(REPORT_BUILDER_KEY);
const search = ref('');
const open = ref({});

const datasets = computed(() => {
  const term = search.value.trim().toLowerCase();
  return (builder.state.catalog?.datasets ?? []).map((dataset) => {
    const fields = term
      ? dataset.fields.filter((f) => f.label.toLowerCase().includes(term) || dataset.label.toLowerCase().includes(term))
      : dataset.fields;
    return { dataset, fields, isRoot: dataset.key === builder.state.draft.root };
  }).filter((entry) => entry.fields.length);
});

function isOpen(entry) {
  return search.value.trim() !== '' || (open.value[entry.dataset.key] ?? entry.isRoot);
}

function toggle(key, entry) {
  open.value = { ...open.value, [key]: !isOpen(entry) };
}

function onDragStart(event, dataset, field) {
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('application/x-rg', JSON.stringify({ kind: 'field', dataset: dataset.key, field: field.key }));
  event.dataTransfer.setData('text/plain', field.label);
}

function roleClass(field) {
  return `rg-role rg-role--${field.role}`;
}

function manyHint(dataset) {
  return dataset.paths?.some((p) => p.multiplies_rows);
}
</script>

<template>
  <aside class="rg-explorer" aria-label="Fields">
    <div class="rg-explorer__head">
      <label class="rg-search">
        <span class="rg-sr-only">Search fields</span>
        <RgIcon name="search" />
        <input id="rg-field-search" v-model="search" class="rg-input" type="search" placeholder="Search fields" autocomplete="off" />
      </label>
      <span class="rg-explorer__hint">Drag fields onto Rows, Values or Filters, or use the buttons.</span>
    </div>

    <div class="rg-explorer__list">
      <section v-for="entry in datasets" :key="entry.dataset.key" class="rg-ds">
        <button
          type="button"
          class="rg-ds__head"
          :aria-expanded="isOpen(entry) ? 'true' : 'false'"
          @click="toggle(entry.dataset.key, entry)"
        >
          <RgIcon name="chevron" small class="rg-chev" />
          <span>{{ entry.dataset.label }}</span>
          <span class="rg-ds__meta">
            <span v-if="entry.isRoot" class="rg-badge rg-badge--info">report</span>
            <span v-else-if="manyHint(entry.dataset)" class="rg-badge" :title="`Several ${entry.dataset.label} per ${builder.datasetsByKey.value[builder.state.draft.root]?.label}`">many</span>
            <span v-if="entry.dataset.paths?.length > 1" class="rg-badge rg-badge--warning" title="Reachable in more than one way: you will be asked which">{{ entry.dataset.paths.length }} ways</span>
            <span class="rg-faint rg-num" style="font-size: 11px">{{ formatCount(entry.dataset.row_estimate) }}</span>
          </span>
        </button>
        <ul v-if="isOpen(entry)" class="rg-ds__fields">
          <li
            v-for="field in entry.fields"
            :key="field.key"
            class="rg-fld"
            draggable="true"
            :title="`${field.label} (${field.type})`"
            @dragstart="onDragStart($event, entry.dataset, field)"
            @dblclick="builder.addField(entry.dataset.key, field.key)"
          >
            <span :class="roleClass(field)"><RgIcon :name="field.key === '__rows' ? 'hash' : TYPE_ICONS[field.type] || 'text'" small class="rg-fld__icon" /></span>
            <span class="rg-fld__label">{{ field.label }}</span>
            <span class="rg-fld__actions">
              <button
                type="button"
                class="rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon"
                :aria-label="`Add ${field.label}`"
                title="Add"
                @click="builder.addField(entry.dataset.key, field.key)"
              ><RgIcon name="plus" small /></button>
              <button
                v-if="field.key !== '__rows'"
                type="button"
                class="rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon"
                :aria-label="`Filter by ${field.label}`"
                title="Filter by this"
                @click="builder.addField(entry.dataset.key, field.key, 'filters')"
              ><RgIcon name="filter" small /></button>
            </span>
          </li>
        </ul>
      </section>
      <p v-if="!datasets.length" class="rg-list__empty">No field matches “{{ search }}”.</p>
    </div>
  </aside>
</template>
