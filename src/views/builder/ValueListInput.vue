<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import { useReportGenerator } from '../../context.js';

/**
 * Pick several values. Suggestions come from the server (searched there),
 * so a column with a million distinct values never loads its whole list.
 */
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  field: { type: String, default: null }, // dataset.field, null for free text
  numeric: { type: Boolean, default: false },
  inputId: { type: String, required: true },
});
const emit = defineEmits(['update:modelValue']);
const { api } = useReportGenerator();

const text = ref('');
const suggestions = ref([]);
const open = ref(false);
let timer = null;
let seq = 0;

function add(value) {
  const v = props.numeric ? Number(value) : String(value).trim();
  if (v === '' || (props.numeric && Number.isNaN(v))) return;
  if (!props.modelValue.includes(v)) emit('update:modelValue', [...props.modelValue, v]);
  text.value = '';
  open.value = false;
}

function remove(value) {
  emit('update:modelValue', props.modelValue.filter((v) => v !== value));
}

watch(text, (term) => {
  clearTimeout(timer);
  if (!props.field) return;
  timer = setTimeout(async () => {
    const mine = ++seq;
    try {
      const values = await api.query.values(props.field, term, 30);
      if (mine === seq) {
        suggestions.value = values.filter((v) => !props.modelValue.includes(v));
        open.value = true;
      }
    } catch {
      suggestions.value = [];
    }
  }, 250);
});

onBeforeUnmount(() => clearTimeout(timer));

function closeSoon() {
  setTimeout(() => (open.value = false), 150);
}

function onKeydown(event) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault();
    add(text.value);
  } else if (event.key === 'Backspace' && !text.value && props.modelValue.length) {
    remove(props.modelValue[props.modelValue.length - 1]);
  } else if (event.key === 'Escape') {
    open.value = false;
  }
}
</script>

<template>
  <span class="rg-tags" @click="$event.currentTarget.querySelector('input')?.focus()">
    <span v-for="value in modelValue" :key="String(value)" class="rg-tag">
      {{ value }}
      <button type="button" :aria-label="`Remove ${value}`" @click.stop="remove(value)">×</button>
    </span>
    <input
      :id="inputId"
      v-model="text"
      :inputmode="numeric ? 'decimal' : 'text'"
      :placeholder="modelValue.length ? '' : field ? 'Type to search' : 'Type and press Enter'"
      autocomplete="off"
      @keydown="onKeydown"
      @focus="field && (text = text)"
      @blur="closeSoon"
    />
    <ul v-if="open && suggestions.length" class="rg-suggest" role="listbox">
      <li v-for="value in suggestions" :key="String(value)">
        <button type="button" role="option" @mousedown.prevent="add(value)">{{ value }}</button>
      </li>
    </ul>
  </span>
</template>
