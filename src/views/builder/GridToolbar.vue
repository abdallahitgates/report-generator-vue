<script setup>
import { computed, ref } from 'vue';
import { formatCount } from '../../utils/format.js';
import RgIcon from '../../components/ui/RgIcon.vue';
import RgPopover from '../../components/ui/RgPopover.vue';

/**
 * Grid controls: column chooser (show, hide, drag to reorder), density,
 * frozen first column, grand totals, scrolling vs pages, sort levels.
 * `prefs` is the grid's reactive preferences object and is changed in place.
 */
const props = defineProps({
  columns: { type: Array, required: true },
  prefs: { type: Object, required: true },
  grouped: { type: Boolean, default: false },
  canTotal: { type: Boolean, default: false },
  summary: { type: Object, default: null },
  summaryLoading: { type: Boolean, default: false },
  /** Sort levels [{ field, dir }] and whether more than one can be set. */
  sort: { type: Array, default: () => [] },
  canSort: { type: Boolean, default: false },
});
const emit = defineEmits(['autosize', 'sort']);

const sorter = ref(false);
const labelOf = (alias) => props.columns.find((c) => c.alias === alias)?.label ?? alias;
const unsorted = computed(() => props.columns.filter((c) => !props.sort.some((s) => s.field === c.alias)));
function setLevel(i, patch) {
  emit('sort', props.sort.map((s, j) => (j === i ? { ...s, ...patch } : s)));
}
function removeLevel(i) {
  emit('sort', props.sort.filter((_, j) => j !== i));
}
function moveLevel(i, by) {
  const list = [...props.sort];
  const to = i + by;
  if (to < 0 || to >= list.length) return;
  list.splice(to, 0, list.splice(i, 1)[0]);
  emit('sort', list);
}
function addLevel(alias) {
  if (alias) emit('sort', [...props.sort, { field: alias, dir: 'asc' }]);
}

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

      <div v-if="canSort" style="position: relative">
        <button type="button" class="rg-btn rg-btn--sm" :aria-expanded="sorter" @click="sorter = !sorter">
          <RgIcon name="sort" small /> Sort
          <span v-if="sort.length" class="rg-badge rg-badge--info">{{ sort.length }}</span>
        </button>
        <RgPopover v-if="sorter" class="rg-sorter" @close="sorter = false">
          <div class="rg-colchooser__head">
            <b>Sort by</b>
            <button v-if="sort.length" type="button" class="rg-linkish" @click="emit('sort', [])">Clear</button>
          </div>
          <TransitionGroup tag="ol" name="rg-list-move" class="rg-sorter__list">
            <li v-for="(level, i) in sort" :key="level.field">
              <span class="rg-sorter__n">{{ i === 0 ? 'Sort by' : 'then' }}</span>
              <b class="rg-sorter__col">{{ labelOf(level.field) }}</b>
              <div class="rg-segmented" role="group" :aria-label="`Direction for ${labelOf(level.field)}`">
                <button type="button" :aria-pressed="level.dir === 'asc'" @click="setLevel(i, { dir: 'asc' })">↑ Asc</button>
                <button type="button" :aria-pressed="level.dir === 'desc'" @click="setLevel(i, { dir: 'desc' })">↓ Desc</button>
              </div>
              <button type="button" class="rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm" :aria-label="`Move ${labelOf(level.field)} up`" :disabled="i === 0" @click="moveLevel(i, -1)">↑</button>
              <button type="button" class="rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm" :aria-label="`Remove ${labelOf(level.field)}`" @click="removeLevel(i)"><RgIcon name="x" small /></button>
            </li>
          </TransitionGroup>
          <p v-if="!sort.length" class="rg-faint rg-colchooser__hint">Rows come in the database's order. Add a level, or Shift+click headers.</p>
          <select v-if="sort.length < 5 && unsorted.length" class="rg-input" aria-label="Add a sort level" @change="addLevel($event.target.value); $event.target.value = ''">
            <option value="">+ Add a sort level…</option>
            <option v-for="c in unsorted" :key="c.alias" :value="c.alias">{{ c.label }}</option>
          </select>
        </RgPopover>
      </div>

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
    </div>
  </div>
</template>
