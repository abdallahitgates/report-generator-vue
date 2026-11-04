<script setup>
import { computed, inject, ref } from 'vue';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import { AGGREGATION_LABELS } from '../../utils/semantic.js';
import RgIcon from '../../components/ui/RgIcon.vue';
import RgPopover from '../../components/ui/RgPopover.vue';

const props = defineProps({
  item: { type: Object, required: true },
  shelf: { type: String, required: true },
});
const emit = defineEmits(['edit-formula']);
const builder = inject(REPORT_BUILDER_KEY);
const open = ref(false);
const dragging = ref(false);

const GRAINS = [
  [null, 'Exact value'], ['day', 'Day'], ['week', 'Week'], ['month', 'Month'], ['quarter', 'Quarter'], ['year', 'Year'],
  ['month_of_year', 'Month of year'], ['day_of_week', 'Day of week'],
];

const isTime = computed(() => ['date', 'datetime'].includes(props.item.type));
const roleClass = computed(() => (props.item.kind === 'formula' ? 'rg-chip--formula' : `rg-role rg-role--${props.item.kind === 'measure' ? 'measure' : props.item.role === 'time' ? 'time' : 'dimension'}`));
const tag = computed(() => {
  if (props.item.kind === 'formula') return 'fx';
  if (props.item.kind === 'measure') return props.item.field === '__rows' ? '#' : AGGREGATION_LABELS[props.item.agg];
  return props.item.grain ? GRAINS.find(([g]) => g === props.item.grain)?.[1] : '';
});
const hasError = computed(() => builder.state.errorUid === props.item.uid);

function onDragStart(event) {
  dragging.value = true;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('application/x-rg', JSON.stringify({ kind: 'item', uid: props.item.uid }));
  event.dataTransfer.setData('text/plain', props.item.label);
}

function update(patch) {
  builder.updateItem(props.item.uid, patch);
}

function move(shelf) {
  builder.moveItem(props.item.uid, shelf);
  open.value = false;
}

function shift(delta) {
  const list = builder.state.draft[props.shelf];
  const index = list.findIndex((i) => i.uid === props.item.uid);
  builder.moveItem(props.item.uid, props.shelf, Math.max(0, index + delta));
}
</script>

<template>
  <div class="rg-chip-wrap">
    <span
      class="rg-chip"
      :class="[roleClass, { 'rg-chip--error': hasError, 'rg-chip--dragging': dragging }]"
      draggable="true"
      role="button"
      tabindex="0"
      :aria-label="`${item.label}: open options`"
      :title="item.missing ? 'This field is no longer in the data model' : item.label"
      @dragstart="onDragStart"
      @dragend="dragging = false"
      @click="open = !open"
      @keydown.enter.prevent="open = !open"
      @keydown.delete="builder.removeItem(item.uid)"
      @keydown.alt.left.prevent="shift(-1)"
      @keydown.alt.right.prevent="shift(1)"
    >
      <RgIcon v-if="item.missing" name="alert" small />
      <span class="rg-chip__label">{{ item.label }}</span>
      <span v-if="tag" class="rg-chip__tag">{{ tag }}</span>
      <button type="button" class="rg-chip__x" :aria-label="`Remove ${item.label}`" @click.stop="builder.removeItem(item.uid)">
        <RgIcon name="x" small />
      </button>
    </span>

    <RgPopover v-if="open" @close="open = false">
      <label :for="`rg-chip-label-${item.uid}`">
        Column name
        <input :id="`rg-chip-label-${item.uid}`" class="rg-input" :value="item.label" maxlength="120" @change="update({ label: $event.target.value })" />
      </label>

      <label v-if="item.kind === 'measure' && item.field !== '__rows'" :for="`rg-chip-agg-${item.uid}`">
        Calculate
        <select :id="`rg-chip-agg-${item.uid}`" class="rg-select" :value="item.agg" @change="update({ agg: $event.target.value })">
          <option v-for="agg in item.aggregations" :key="agg" :value="agg">{{ AGGREGATION_LABELS[agg] }}</option>
        </select>
      </label>

      <label v-if="item.kind === 'dimension' && isTime" :for="`rg-chip-grain-${item.uid}`">
        Group dates by
        <select :id="`rg-chip-grain-${item.uid}`" class="rg-select" :value="item.grain ?? ''" @change="update({ grain: $event.target.value || null })">
          <option v-for="[value, text] in GRAINS" :key="text" :value="value ?? ''">{{ text }}</option>
        </select>
      </label>

      <label v-if="item.kind !== 'dimension'" :for="`rg-chip-format-${item.uid}`">
        Number format
        <input :id="`rg-chip-format-${item.uid}`" class="rg-input rg-mono" :value="item.format ?? ''" placeholder="#,##0.00 or 0.0%" maxlength="64" @change="update({ format: $event.target.value || null })" />
      </label>

      <p v-if="item.path" class="rg-faint" style="margin: 0; font-size: 11.5px">Uses a chosen join path.</p>

      <div class="rg-pop__foot">
        <div class="rg-pop__row">
          <button v-if="item.kind === 'formula'" type="button" class="rg-btn rg-btn--sm" @click="emit('edit-formula', item); open = false">
            <RgIcon name="fx" small /> Edit formula
          </button>
          <button v-if="item.kind !== 'dimension'" type="button" class="rg-btn rg-btn--sm" @click="builder.filterOnTotal(item.uid); open = false">
            <RgIcon name="filter" small /> Filter on this
          </button>
          <button v-if="shelf === 'values' && item.kind === 'measure' && item.field !== '__rows'" type="button" class="rg-btn rg-btn--sm" @click="move('rows')">Move to Rows</button>
          <button v-if="shelf === 'rows'" type="button" class="rg-btn rg-btn--sm" @click="move('values')">Move to Values</button>
        </div>
        <button type="button" class="rg-btn rg-btn--sm rg-btn--danger rg-btn--ghost" @click="builder.removeItem(item.uid)">Remove</button>
      </div>
    </RgPopover>
  </div>
</template>
