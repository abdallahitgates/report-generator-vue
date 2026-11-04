<script setup>
import { computed } from 'vue';
import { DATE_PRESETS } from '../../utils/definition.js';
import ValueListInput from './ValueListInput.vue';

/** The value part of a filter row, shaped by the field type and operator. */
const props = defineProps({ node: { type: Object, required: true } });
const emit = defineEmits(['update']);

const isDate = computed(() => ['date', 'datetime'].includes(props.node.type));
const isNumber = computed(() => ['integer', 'decimal'].includes(props.node.type) || props.node.isTotal);
const inputType = computed(() => (isDate.value ? 'date' : isNumber.value ? 'number' : 'text'));
const isPreset = computed(() => typeof props.node.value === 'string' && DATE_PRESETS.some(([key]) => key === props.node.value));
const id = (suffix) => `rg-filter-${props.node.uid}-${suffix}`;

function set(value) {
  emit('update', { value });
}

function setRangePart(index, value) {
  const range = Array.isArray(props.node.value) ? [...props.node.value] : ['', ''];
  range[index] = isNumber.value && value !== '' ? Number(value) : value;
  set(range);
}

function setScalar(value) {
  set(isNumber.value && value !== '' ? Number(value) : value);
}
</script>

<template>
  <template v-if="['is_null', 'not_null'].includes(node.op)" />

  <template v-else-if="node.type === 'boolean'">
    <select :id="id('bool')" class="rg-select" :value="node.value === null ? '' : String(node.value)" aria-label="Value" @change="set($event.target.value === 'true')">
      <option value="" disabled>Choose</option>
      <option value="true">Yes</option>
      <option value="false">No</option>
    </select>
  </template>

  <template v-else-if="node.op === 'between' && isDate">
    <select :id="id('preset')" class="rg-select" :value="isPreset ? node.value : 'custom'" aria-label="Date range" @change="set($event.target.value === 'custom' ? ['', ''] : $event.target.value)">
      <option v-for="[key, label] in DATE_PRESETS" :key="key" :value="key">{{ label }}</option>
      <option value="custom">Custom range…</option>
    </select>
    <template v-if="!isPreset">
      <input :id="id('from')" class="rg-input" type="date" aria-label="From" :value="node.value?.[0] ?? ''" @change="setRangePart(0, $event.target.value)" />
      <span class="rg-faint">to</span>
      <input :id="id('to')" class="rg-input" type="date" aria-label="To" :value="node.value?.[1] ?? ''" @change="setRangePart(1, $event.target.value)" />
    </template>
  </template>

  <template v-else-if="node.op === 'between'">
    <input :id="id('from')" class="rg-input" :type="inputType" aria-label="From" style="width: 110px" :value="node.value?.[0] ?? ''" @change="setRangePart(0, $event.target.value)" />
    <span class="rg-faint">and</span>
    <input :id="id('to')" class="rg-input" :type="inputType" aria-label="To" style="width: 110px" :value="node.value?.[1] ?? ''" @change="setRangePart(1, $event.target.value)" />
  </template>

  <ValueListInput
    v-else-if="['in', 'not_in'].includes(node.op)"
    :input-id="id('list')"
    :model-value="Array.isArray(node.value) ? node.value : []"
    :field="node.target.includes('.') ? node.target : null"
    :numeric="isNumber"
    @update:model-value="set"
  />

  <input
    v-else
    :id="id('value')"
    class="rg-input"
    :type="inputType"
    aria-label="Value"
    :style="{ width: isDate ? 'auto' : '160px' }"
    :value="node.value ?? ''"
    @change="setScalar($event.target.value)"
  />
</template>
