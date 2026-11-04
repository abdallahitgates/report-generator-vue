<script setup>
import { computed, ref } from 'vue';
import FieldRow from './FieldRow.vue';
import RgIcon from '../../components/ui/RgIcon.vue';

const props = defineProps({ fields: { type: Array, required: true } });
const showHidden = ref(true);
const filter = ref('');

const rows = computed(() => {
  const term = filter.value.trim().toLowerCase();
  return props.fields.filter((f) =>
    (showHidden.value || !f.is_hidden)
    && (!term || f.label.toLowerCase().includes(term) || (f.column ?? '').toLowerCase().includes(term)));
});
</script>

<template>
  <div class="rg-card">
    <div class="rg-card__head">
      <label class="rg-search" style="width: 240px">
        <span class="rg-sr-only">Filter fields</span>
        <RgIcon name="search" />
        <input id="rg-field-filter" v-model="filter" class="rg-input" type="search" placeholder="Filter fields" />
      </label>
      <span class="rg-spacer" />
      <label class="rg-field-inline">
        <input id="rg-show-hidden" v-model="showHidden" class="rg-check" type="checkbox" />
        Show hidden fields
      </label>
    </div>
    <div class="rg-table-wrap">
      <table class="rg-table">
        <thead>
          <tr>
            <th scope="col" style="width: 48px"><span class="rg-sr-only">Visible</span></th>
            <th scope="col">Field</th>
            <th scope="col">Type</th>
            <th scope="col">Role</th>
            <th scope="col">Aggregations</th>
            <th scope="col">Format</th>
          </tr>
        </thead>
        <tbody>
          <FieldRow v-for="field in rows" :key="field.id" :field="field" />
          <tr v-if="!rows.length">
            <td colspan="6" class="rg-muted" style="text-align: center; padding: 24px">No field matches.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
