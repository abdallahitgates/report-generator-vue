<script setup>
import { inject, ref } from 'vue';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import FieldChip from './FieldChip.vue';

/** A drop zone holding chips: accepts catalog fields and chips from either shelf. */
const props = defineProps({
  shelf: { type: String, required: true },
  title: { type: String, required: true },
  empty: { type: String, required: true },
});
const emit = defineEmits(['edit-formula']);
const builder = inject(REPORT_BUILDER_KEY);
const over = ref(false);
const marker = ref(null);
const zone = ref(null);

function payload(event) {
  try {
    return JSON.parse(event.dataTransfer.getData('application/x-rg'));
  } catch {
    return null;
  }
}

function indexAt(event) {
  const chips = [...(zone.value?.querySelectorAll('.rg-chip-wrap') ?? [])];
  const rtl = getComputedStyle(zone.value).direction === 'rtl';
  for (let i = 0; i < chips.length; i++) {
    const box = chips[i].getBoundingClientRect();
    const middle = box.left + box.width / 2;
    const before = rtl ? event.clientX > middle : event.clientX < middle;
    if (event.clientY < box.bottom && before) return i;
  }
  return chips.length;
}

function onDragOver(event) {
  if (![...event.dataTransfer.types].includes('application/x-rg')) return;
  event.preventDefault();
  over.value = true;
  marker.value = indexAt(event);
}

function onDrop(event) {
  const data = payload(event);
  const index = marker.value;
  over.value = false;
  marker.value = null;
  if (!data) return;
  if (data.kind === 'field') builder.addField(data.dataset, data.field, props.shelf, index, data.path, null, data.label);
  if (data.kind === 'item') builder.moveItem(data.uid, props.shelf, index);
}
</script>

<template>
  <div class="rg-shelf">
    <span class="rg-shelf__title">{{ title }}</span>
    <div
      ref="zone"
      class="rg-shelf__drop"
      :class="{ 'rg-shelf__drop--over': over }"
      :aria-label="`${title} shelf`"
      @dragover="onDragOver"
      @dragleave.self="over = false; marker = null"
      @drop.prevent="onDrop"
    >
      <template v-for="(item, i) in builder.state.draft[shelf]" :key="item.uid">
        <span v-if="over && marker === i" class="rg-drop-marker" />
        <FieldChip :item="item" :shelf="shelf" @edit-formula="emit('edit-formula', $event)" />
      </template>
      <span v-if="over && marker === builder.state.draft[shelf].length" class="rg-drop-marker" />
      <span v-if="!builder.state.draft[shelf].length && !over" class="rg-shelf__empty">{{ empty }}</span>
      <slot />
    </div>
  </div>
</template>
