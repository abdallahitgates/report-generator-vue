<script setup>
import { computed, inject, reactive, ref, watch } from 'vue';
import { MODEL_STUDIO_KEY } from '../../composables/useModelStudio.js';
import { CARDINALITIES } from '../../utils/semantic.js';
import RgIcon from '../../components/ui/RgIcon.vue';

const props = defineProps({ dataset: { type: Object, required: true } });
const emit = defineEmits(['done']);
const studio = inject(MODEL_STUDIO_KEY);

const form = reactive({ from_column: '', to_dataset_id: '', to_column: '', cardinality: 'many_to_one' });
const targetColumns = ref([]);
const saving = ref(false);

const targets = computed(() => [...studio.state.datasets].filter((d) => !d.missing).sort((a, b) => a.label.localeCompare(b.label)));
const columns = computed(() => props.dataset.fields.filter((f) => !f.missing && f.column));

watch(() => form.to_dataset_id, async (id) => {
  form.to_column = '';
  targetColumns.value = [];
  if (!id) return;
  const detail = await studio.loadDataset(id).catch(() => null);
  targetColumns.value = detail?.fields.filter((f) => !f.missing && f.column) ?? [];
  const pk = detail?.primary_key?.split(',')[0];
  if (pk) form.to_column = pk;
});

const ready = computed(() => form.from_column && form.to_dataset_id && form.to_column);

async function submit() {
  saving.value = true;
  try {
    await studio.createRelationship({ from_dataset_id: props.dataset.id, to_dataset_id: Number(form.to_dataset_id), ...{
      from_column: form.from_column, to_column: form.to_column, cardinality: form.cardinality,
    } });
    emit('done');
  } catch {
    // toast shown
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <form class="rg-add-edge" @submit.prevent="submit">
    <label for="rg-add-from">
      Column in {{ dataset.label }}
      <select id="rg-add-from" v-model="form.from_column" class="rg-select" required>
        <option value="" disabled>Choose a column</option>
        <option v-for="c in columns" :key="c.id" :value="c.column">{{ c.column }}</option>
      </select>
    </label>
    <label for="rg-add-target">
      Points to table
      <select id="rg-add-target" v-model="form.to_dataset_id" class="rg-select" required>
        <option value="" disabled>Choose a table</option>
        <option v-for="d in targets" :key="d.id" :value="d.id">{{ d.label }} ({{ d.source_name }})</option>
      </select>
    </label>
    <label for="rg-add-to">
      Matching column
      <select id="rg-add-to" v-model="form.to_column" class="rg-select" :disabled="!targetColumns.length" required>
        <option value="" disabled>Choose a column</option>
        <option v-for="c in targetColumns" :key="c.id" :value="c.column">{{ c.column }}</option>
      </select>
    </label>
    <label for="rg-add-card">
      Rows on each side
      <select id="rg-add-card" v-model="form.cardinality" class="rg-select">
        <option v-for="c in CARDINALITIES" :key="c.value" :value="c.value">{{ c.label }}</option>
      </select>
    </label>
    <button type="submit" class="rg-btn rg-btn--primary" :disabled="!ready || saving">
      <RgIcon name="plus" small /> Add
    </button>
  </form>
</template>
