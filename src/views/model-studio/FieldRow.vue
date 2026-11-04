<script setup>
import { computed, inject, ref, watch } from 'vue';
import { MODEL_STUDIO_KEY } from '../../composables/useModelStudio.js';
import { AGGREGATION_LABELS, HIDDEN_REASONS, ROLES, TYPE_ICONS, aggregationsFor } from '../../utils/semantic.js';
import RgIcon from '../../components/ui/RgIcon.vue';
import RgSwitch from '../../components/ui/RgSwitch.vue';
import RgDialog from '../../components/ui/RgDialog.vue';

const props = defineProps({ field: { type: Object, required: true } });
const studio = inject(MODEL_STUDIO_KEY);
const theme = inject('rg-theme', 'light');

const label = ref(props.field.label);
const format = ref(props.field.format ?? '');
const confirmingSensitive = ref(false);

watch(() => props.field.label, (v) => (label.value = v));
watch(() => props.field.format, (v) => (format.value = v ?? ''));

const saving = computed(() => studio.state.saving[`field:${props.field.id}`]);
const isTemporal = computed(() => ['date', 'datetime'].includes(props.field.type));
const unsupported = computed(() => props.field.hidden_reason === 'unsupported');
const allowedAggs = computed(() => aggregationsFor(props.field.type));

function save(patch) {
  return studio.updateField(props.field, patch).catch(() => {
    label.value = props.field.label;
    format.value = props.field.format ?? '';
  });
}

function saveLabel() {
  const value = label.value.trim();
  if (!value) return (label.value = props.field.label);
  if (value !== props.field.label) save({ label: value });
}

function saveFormat() {
  const value = format.value.trim() || null;
  if (value !== (props.field.format ?? null)) save({ format: value });
}

function toggleVisible(visible) {
  if (visible && props.field.is_sensitive) {
    confirmingSensitive.value = true;
    return;
  }
  save({ is_hidden: !visible });
}

function confirmSensitive() {
  confirmingSensitive.value = false;
  save({ is_hidden: false, confirm_sensitive: true });
}

function setRole(role) {
  if (role !== props.field.role) save({ role });
}

function toggleAgg(agg) {
  const current = props.field.aggregations ?? [];
  const next = current.includes(agg) ? current.filter((a) => a !== agg) : [...current, agg];
  if (next.length === 0) return; // a measure needs at least one way to aggregate
  save({ aggregations: allowedAggs.value.filter((a) => next.includes(a)) });
}

function roleDisabled(role) {
  return role === 'time' && !isTemporal.value;
}
</script>

<template>
  <tr :class="{ 'rg-row--hidden': field.is_hidden, 'rg-row--missing': field.missing }">
    <td>
      <RgSwitch
        :model-value="!field.is_hidden"
        :disabled="unsupported || field.missing"
        :label="field.is_hidden ? `Show ${field.label}` : `Hide ${field.label}`"
        @update:model-value="toggleVisible"
      />
    </td>
    <td>
      <div class="rg-cell-field">
        <input
          :id="`rg-field-label-${field.id}`"
          v-model="label"
          class="rg-input rg-input--bare"
          :aria-label="`Label for ${field.column}`"
          maxlength="255"
          @blur="saveLabel"
          @keydown.enter="$event.target.blur()"
        />
        <span class="rg-cell-field__sub">
          <span class="rg-mono">{{ field.column }}</span>
          <RgIcon v-if="field.is_sensitive" name="lock" small />
          <RgIcon v-if="field.is_indexed" name="bolt" small />
          <span v-if="field.missing" class="rg-badge rg-badge--danger">missing</span>
          <span v-else-if="field.is_hidden && field.hidden_reason" class="rg-faint">{{ HIDDEN_REASONS[field.hidden_reason] }}</span>
          <span v-else-if="field.is_indexed" class="rg-faint">Indexed: fast to filter</span>
          <span v-if="saving" class="rg-saving" :class="{ 'rg-saving--ok': saving === 'saved' }">
            {{ saving === 'saving' ? 'Saving…' : 'Saved' }}
          </span>
        </span>
      </div>
    </td>
    <td>
      <span class="rg-type"><RgIcon :name="TYPE_ICONS[field.type] || 'text'" small />{{ field.type }}</span>
    </td>
    <td>
      <div class="rg-segmented" role="group" :aria-label="`Role of ${field.label}`">
        <button
          v-for="role in ROLES"
          :key="role.value"
          type="button"
          :class="`rg-role rg-role--${role.value}`"
          :aria-pressed="field.role === role.value ? 'true' : 'false'"
          :disabled="roleDisabled(role.value) || field.missing"
          :title="roleDisabled(role.value) ? 'Only date columns can be dates' : role.hint"
          @click="setRole(role.value)"
        >
          {{ role.short }}
        </button>
      </div>
    </td>
    <td>
      <div v-if="field.role === 'measure'" class="rg-aggs">
        <button
          v-for="agg in allowedAggs"
          :key="agg"
          type="button"
          class="rg-chip-toggle"
          :aria-pressed="(field.aggregations ?? []).includes(agg) ? 'true' : 'false'"
          @click="toggleAgg(agg)"
        >
          {{ AGGREGATION_LABELS[agg] }}
        </button>
      </div>
      <span v-else class="rg-faint">—</span>
    </td>
    <td>
      <input
        v-if="field.role === 'measure'"
        :id="`rg-field-format-${field.id}`"
        v-model="format"
        class="rg-input rg-format rg-mono"
        :aria-label="`Number format for ${field.label}`"
        placeholder="#,##0.00"
        maxlength="64"
        @blur="saveFormat"
        @keydown.enter="$event.target.blur()"
      />
      <span v-else class="rg-faint">—</span>
    </td>
  </tr>

  <RgDialog
    v-if="confirmingSensitive"
    title="Show a sensitive column?"
    :data-rg-theme="theme"
    @close="confirmingSensitive = false"
  >
    <p style="margin: 0">
      <span class="rg-mono">{{ field.column }}</span> looks like it holds passwords, tokens or secrets.
      Everyone who can build reports on this dataset will be able to read it.
    </p>
    <template #footer>
      <button type="button" class="rg-btn" @click="confirmingSensitive = false">Keep hidden</button>
      <button type="button" class="rg-btn rg-btn--danger" @click="confirmSensitive">Show anyway</button>
    </template>
  </RgDialog>
</template>
