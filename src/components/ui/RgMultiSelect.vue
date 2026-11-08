<script setup>
import { computed, ref, watch } from 'vue';
import RgIcon from './RgIcon.vue';
import RgPopover from './RgPopover.vue';

/**
 * Pick several items from a list loaded (and searched) on the server.
 * v-model is a list of ids; `load(search)` returns [{ id, label }].
 */
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, required: true },
  allLabel: { type: String, default: 'All' },
  load: { type: Function, required: true },
  /** Changes when the list depends on something else (the chosen lines). */
  dependsOn: { type: [String, Number, Array], default: null },
});
const emit = defineEmits(['update:modelValue', 'change']);

const open = ref(false);
const search = ref('');
const options = ref([]);
const known = ref(new Map()); // id -> label, so chips keep their names after searching
const loading = ref(false);
let seq = 0;
let timer = null;

async function fetch() {
  const mine = ++seq;
  loading.value = true;
  try {
    const list = await props.load(search.value.trim());
    if (mine !== seq) return;
    options.value = list;
    list.forEach((o) => known.value.set(o.id, o.label));
  } catch {
    if (mine === seq) options.value = [];
  } finally {
    if (mine === seq) loading.value = false;
  }
}

watch(search, () => {
  clearTimeout(timer);
  timer = setTimeout(fetch, 250);
});
watch(open, (isOpen) => isOpen && fetch());
watch(() => props.dependsOn, () => {
  options.value = [];
  if (open.value) fetch();
}, { deep: true });

const selected = computed(() => new Set(props.modelValue));
const summary = computed(() => {
  if (!props.modelValue.length) return props.allLabel;
  if (props.modelValue.length === 1) return known.value.get(props.modelValue[0]) ?? '1 selected';
  return `${props.modelValue.length} selected`;
});

function toggle(id) {
  const next = selected.value.has(id) ? props.modelValue.filter((v) => v !== id) : [...props.modelValue, id];
  emit('update:modelValue', next);
}

function clear() {
  emit('update:modelValue', []);
}

function close() {
  open.value = false;
  emit('change');
}
</script>

<template>
  <div class="rg-multi" style="position: relative">
    <button type="button" class="rg-input rg-multi__button" :aria-expanded="open" :aria-label="`${label}: ${summary}`" @click="open ? close() : (open = true)">
      <span :class="{ 'rg-faint': !modelValue.length }">{{ summary }}</span>
      <RgIcon name="chevron" small class="rg-multi__chev" />
    </button>
    <Transition name="rg-swap">
      <RgPopover v-if="open" class="rg-multi__pop" @close="close">
        <label class="rg-search">
          <span class="rg-sr-only">Search {{ label }}</span>
          <RgIcon name="search" />
          <input v-model="search" class="rg-input" type="search" :placeholder="`Search ${label.toLowerCase()}`" autocomplete="off" />
        </label>
        <ul class="rg-multi__list" role="listbox" :aria-label="label" aria-multiselectable="true">
          <li v-if="loading && !options.length" class="rg-faint"><RgIcon name="loader" spin small /> Loading…</li>
          <li v-else-if="!options.length" class="rg-faint">Nothing to pick.</li>
          <li v-for="option in options" :key="option.id" role="option" :aria-selected="selected.has(option.id)">
            <label>
              <input type="checkbox" class="rg-check" :checked="selected.has(option.id)" @change="toggle(option.id)" />
              {{ option.label }}
            </label>
          </li>
        </ul>
        <div class="rg-pop__foot">
          <button type="button" class="rg-btn rg-btn--sm rg-btn--ghost" :disabled="!modelValue.length" @click="clear">Clear</button>
          <button type="button" class="rg-btn rg-btn--sm rg-btn--primary" @click="close">Done</button>
        </div>
      </RgPopover>
    </Transition>
  </div>
</template>
