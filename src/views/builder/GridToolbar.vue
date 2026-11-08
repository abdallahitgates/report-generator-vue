<script setup>
import { computed, ref } from 'vue';
import { formatCount } from '../../utils/format.js';
import RgIcon from '../../components/ui/RgIcon.vue';
import RgPopover from '../../components/ui/RgPopover.vue';

/**
 * Grid controls: column chooser (show, hide, drag to reorder), density,
 * frozen first column, grand totals, scrolling vs pages, export.
 * `prefs` is the grid's reactive preferences object and is changed in place.
 */
const props = defineProps({
  columns: { type: Array, required: true },
  prefs: { type: Object, required: true },
  grouped: { type: Boolean, default: false },
  canExport: { type: Boolean, default: false },
  canTotal: { type: Boolean, default: false },
  exporting: { type: String, default: null },
  summary: { type: Object, default: null },
  summaryLoading: { type: Boolean, default: false },
});
const emit = defineEmits(['export', 'autosize']);

const chooser = ref(false);
const dragging = ref(null);
const hiddenCount = computed(() => props.columns.filter((c) => props.prefs.hidden.includes(c.alias)).length);

function toggleColumn(alias) {
  const hidden = props.prefs.hidden;
  props.prefs.hidden = hidden.includes(alias) ? hidden.filter((a) => a !== alias) : [...hidden, alias];
}

function move(alias, to) {
  const order = props.columns.map((c) => c.alias);
  const from = order.indexOf(alias);
  if (from === -1 || to < 0 || to >= order.length || from === to) return;
  order.splice(to, 0, order.splice(from, 1)[0]);
  props.prefs.order = order;
}

function onDrop(target) {
  if (dragging.value === null) return;
  move(dragging.value, props.columns.findIndex((c) => c.alias === target));
  dragging.value = null;
}

function resetLayout() {
  Object.assign(props.prefs, { hidden: [], order: [], widths: {} });
}
</script>

<template>
  <div class="rg-gridbar" role="toolbar" aria-label="Grid">
    <div class="rg-gridbar__group" style="position: relative">
      <button type="button" class="rg-btn rg-btn--sm" :aria-expanded="chooser" @click="chooser = !chooser">
        <RgIcon name="table" small /> Columns
        <span v-if="hiddenCount" class="rg-badge rg-badge--info">{{ hiddenCount }} hidden</span>
      </button>
      <RgPopover v-if="chooser" class="rg-colchooser" @close="chooser = false">
        <div class="rg-colchooser__head">
          <b>Columns</b>
          <button type="button" class="rg-linkish" @click="resetLayout">Reset</button>
        </div>
        <TransitionGroup tag="ul" name="rg-list-move" class="rg-colchooser__list">
          <li
            v-for="(column, i) in columns"
            :key="column.alias"
            draggable="true"
            :class="{ 'is-dragging': dragging === column.alias }"
            @dragstart="dragging = column.alias"
            @dragend="dragging = null"
            @dragover.prevent
            @drop.prevent="onDrop(column.alias)"
          >
            <span class="rg-colchooser__grip" aria-hidden="true">⋮⋮</span>
            <label>
              <input type="checkbox" class="rg-check" :checked="!prefs.hidden.includes(column.alias)" @change="toggleColumn(column.alias)" />
              {{ column.label }}
            </label>
            <span class="rg-colchooser__moves">
              <button type="button" class="rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm" :aria-label="`Move ${column.label} up`" :disabled="i === 0" @click="move(column.alias, i - 1)">↑</button>
              <button type="button" class="rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm" :aria-label="`Move ${column.label} down`" :disabled="i === columns.length - 1" @click="move(column.alias, i + 1)">↓</button>
            </span>
          </li>
        </TransitionGroup>
        <p class="rg-faint rg-colchooser__hint">Drag to reorder. Drag a header's edge to resize it.</p>
      </RgPopover>

      <div class="rg-segmented" role="group" aria-label="Row height">
        <button type="button" :aria-pressed="prefs.density === 'comfortable'" title="Comfortable rows" @click="prefs.density = 'comfortable'">Comfortable</button>
        <button type="button" :aria-pressed="prefs.density === 'compact'" title="Compact rows" @click="prefs.density = 'compact'">Compact</button>
      </div>
      <button type="button" class="rg-chip-toggle" :aria-pressed="prefs.freeze" title="Keep the first column visible while scrolling sideways" @click="prefs.freeze = !prefs.freeze">
        Freeze first column
      </button>
      <button v-if="canTotal" type="button" class="rg-chip-toggle" :aria-pressed="prefs.totals" title="Grand totals of the whole report, not just the loaded rows" @click="prefs.totals = !prefs.totals">
        Σ Totals
      </button>
    </div>

    <div class="rg-gridbar__group rg-gridbar__end">
      <span v-if="summary" class="rg-faint rg-num" :title="`${summary.duration_ms} ms`">{{ formatCount(summary.rows) }} rows</span>
      <div class="rg-segmented" role="group" aria-label="Browse">
        <button type="button" :aria-pressed="prefs.paging === 'scroll'" @click="prefs.paging = 'scroll'">Scroll</button>
        <button
          type="button"
          :aria-pressed="prefs.paging === 'pages'"
          :disabled="grouped"
          :title="grouped ? 'Groups load as you open them; pages are for flat reports' : 'Numbered pages'"
          @click="prefs.paging = 'pages'"
        >Pages</button>
      </div>
      <template v-if="canExport">
        <button type="button" class="rg-btn rg-btn--sm" :disabled="!!exporting" title="Every row, as CSV" @click="emit('export', 'csv')">
          <RgIcon :name="exporting === 'csv' ? 'loader' : 'upload'" :spin="exporting === 'csv'" small /> CSV
        </button>
        <button type="button" class="rg-btn rg-btn--sm" :disabled="!!exporting" title="Every row, as an Excel file" @click="emit('export', 'xlsx')">
          <RgIcon :name="exporting === 'xlsx' ? 'loader' : 'upload'" :spin="exporting === 'xlsx'" small /> Excel
        </button>
      </template>
    </div>
  </div>
</template>
