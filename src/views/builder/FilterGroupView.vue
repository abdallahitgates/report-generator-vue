<script setup>
import { inject } from 'vue';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import { OPERATORS, operatorsFor } from '../../utils/definition.js';
import RgIcon from '../../components/ui/RgIcon.vue';
import FilterValue from './FilterValue.vue';

defineOptions({ name: 'FilterGroupView' });
const props = defineProps({
  group: { type: Object, required: true },
  nested: { type: Boolean, default: false },
});
const builder = inject(REPORT_BUILDER_KEY);

function setBoolean(boolean) {
  props.group.boolean = boolean;
}

function onDrop(event) {
  let data = null;
  try {
    data = JSON.parse(event.dataTransfer.getData('application/x-rg'));
  } catch {
    return;
  }
  if (data?.kind === 'field') builder.addField(data.dataset, data.field, 'filters', null, data.path, props.group.uid, data.label);
}
</script>

<template>
  <div
    :class="nested ? 'rg-filter-group' : 'rg-filters'"
    @dragover="nested && [...$event.dataTransfer.types].includes('application/x-rg') && $event.preventDefault()"
    @drop.stop="nested && ($event.preventDefault(), onDrop($event))"
  >
    <div v-if="group.items.length > 1 || nested" class="rg-filter-row">
      <span class="rg-faint" style="font-size: 12px">Match</span>
      <span class="rg-bool-toggle" role="group" aria-label="How filters combine">
        <button type="button" :aria-pressed="group.boolean === 'and' ? 'true' : 'false'" @click="setBoolean('and')">ALL</button>
        <button type="button" :aria-pressed="group.boolean === 'or' ? 'true' : 'false'" @click="setBoolean('or')">ANY</button>
      </span>
      <span class="rg-faint" style="font-size: 12px">of these</span>
      <button v-if="nested" type="button" class="rg-btn rg-btn--ghost rg-btn--sm" style="margin-inline-start: auto" @click="builder.removeFilter(group.uid)">Remove group</button>
    </div>

    <template v-for="node in group.items" :key="node.uid">
      <FilterGroupView v-if="node.items" :group="node" nested />
      <div v-else class="rg-filter-row" :class="{ 'rg-filter-row--error': builder.state.errorUid === node.uid }">
        <span class="rg-filter-field" :title="node.target">
          <RgIcon v-if="node.isTotal" name="hash" small />
          {{ node.label }}
        </span>
        <select
          :id="`rg-filter-${node.uid}-op`"
          class="rg-select"
          aria-label="Condition"
          :value="node.op"
          @change="builder.updateFilter(node, { op: $event.target.value })"
        >
          <option v-for="op in operatorsFor(node.type, node.isTotal)" :key="op" :value="op">{{ OPERATORS[op] }}</option>
        </select>
        <FilterValue :node="node" @update="builder.updateFilter(node, $event)" />
        <button type="button" class="rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon" :aria-label="`Remove filter on ${node.label}`" @click="builder.removeFilter(node.uid)">
          <RgIcon name="x" small />
        </button>
      </div>
    </template>

    <p v-if="nested && !group.items.length" class="rg-faint" style="margin: 0; font-size: 12px">
      Drop fields here to add conditions to this group.
    </p>
  </div>
</template>
