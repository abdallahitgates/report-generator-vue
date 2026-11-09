<script setup>
import { computed, reactive } from 'vue';
import RgIcon from '../../components/ui/RgIcon.vue';
import RgPopover from '../../components/ui/RgPopover.vue';
import { OPERATORS, operatorsFor } from '../../utils/definition.js';

/**
 * A column's menu: sort, add as a further sort level, filter, hide.
 * Emits sort(dir, add), filter({ op, value }), hide, close.
 */
const props = defineProps({
  column: { type: Object, required: true },
  /** 'asc' | 'desc' | null */
  sorted: { type: String, default: null },
  /** Position of this column among sort levels (1-based), 0 if unsorted. */
  level: { type: Number, default: 0 },
  canFilter: { type: Boolean, default: false },
  /** The column's current filter, if any: { op, value }. */
  filter: { type: Object, default: null },
});
const emit = defineEmits(['sort', 'unsort', 'filter', 'unfilter', 'hide', 'close']);

const isTotal = computed(() => props.column.kind !== 'dimension');
const type = computed(() => {
  const t = props.column.type;
  if (props.column.grain) return 'date';
  if (isTotal.value) return ['date', 'datetime'].includes(t) ? t : 'decimal';
  return t ?? 'string';
});
const ops = computed(() => operatorsFor(type.value, isTotal.value && !['date', 'datetime'].includes(type.value)).filter((op) => op !== 'in' || type.value !== 'boolean'));
const input = computed(() => (['integer', 'decimal'].includes(type.value) ? 'number' : ['date', 'datetime'].includes(type.value) ? 'date' : 'text'));

const form = reactive({
  op: props.filter?.op ?? ops.value[0],
  value: props.filter && !Array.isArray(props.filter.value) ? props.filter.value ?? '' : '',
  from: Array.isArray(props.filter?.value) ? props.filter.value[0] ?? '' : '',
  to: Array.isArray(props.filter?.value) ? props.filter.value[1] ?? '' : '',
  list: ['in', 'not_in'].includes(props.filter?.op) ? (props.filter.value ?? []).join(', ') : '',
});
const noValue = computed(() => ['is_null', 'not_null'].includes(form.op));
const isList = computed(() => ['in', 'not_in'].includes(form.op));
const isRange = computed(() => form.op === 'between');

function cast(v) {
  if (input.value === 'number') return v === '' || v === null ? null : Number(v);
  if (type.value === 'boolean') return v === 'true' || v === true;
  return v;
}
const value = computed(() => {
  if (noValue.value) return null;
  if (isRange.value) return [cast(form.from), cast(form.to)];
  if (isList.value) return form.list.split(',').map((s) => s.trim()).filter(Boolean).map(cast);
  return cast(form.value);
});
const valid = computed(() => {
  const v = value.value;
  if (noValue.value) return true;
  if (Array.isArray(v)) return v.length > 0 && v.every((x) => x !== '' && x !== null && !Number.isNaN(x));
  return v !== '' && v !== null && v !== undefined && !Number.isNaN(v);
});

function apply() {
  if (!valid.value) return;
  emit('filter', { op: form.op, value: value.value });
  emit('close');
}
const sortLabels = computed(() => (['integer', 'decimal'].includes(type.value) ? ['1 → 9', '9 → 1'] : ['date', 'datetime'].includes(type.value) ? ['Oldest first', 'Newest first'] : ['A → Z', 'Z → A']));
</script>

<template>
  <RgPopover class="rg-colmenu" @close="emit('close')">
    <div class="rg-colmenu__title"><b>{{ column.label }}</b></div>
    <div class="rg-colmenu__group" role="group" aria-label="Sort">
      <button type="button" class="rg-colmenu__item" :aria-pressed="sorted === 'asc' && level <= 1" @click="emit('sort', 'asc', false); emit('close')">
        <RgIcon name="sort" small /> Sort {{ sortLabels[0] }}
      </button>
      <button type="button" class="rg-colmenu__item" :aria-pressed="sorted === 'desc' && level <= 1" @click="emit('sort', 'desc', false); emit('close')">
        <RgIcon name="sort" small class="rg-flip" /> Sort {{ sortLabels[1] }}
      </button>
      <button type="button" class="rg-colmenu__item" :disabled="level === 1" @click="emit('sort', sorted === 'asc' ? 'desc' : 'asc', true); emit('close')">
        <RgIcon name="plus" small /> {{ level ? 'Flip in the sort order' : 'Then by this column' }}
      </button>
      <button v-if="sorted" type="button" class="rg-colmenu__item" @click="emit('unsort'); emit('close')">
        <RgIcon name="x" small /> Remove sort
      </button>
    </div>
    <form v-if="canFilter" class="rg-colmenu__filter" @submit.prevent="apply">
      <span class="rg-colmenu__label"><RgIcon name="filter" small /> Filter {{ isTotal ? 'totals' : 'rows' }}</span>
      <select v-model="form.op" class="rg-input" aria-label="Condition">
        <option v-for="op in ops" :key="op" :value="op">{{ OPERATORS[op] }}</option>
      </select>
      <template v-if="!noValue">
        <div v-if="isRange" class="rg-colmenu__range">
          <input v-model="form.from" class="rg-input" :type="input" aria-label="From" />
          <span class="rg-faint">and</span>
          <input v-model="form.to" class="rg-input" :type="input" aria-label="To" />
        </div>
        <input v-else-if="isList" v-model="form.list" class="rg-input" placeholder="Values, separated by commas" aria-label="Values" />
        <select v-else-if="type === 'boolean'" v-model="form.value" class="rg-input" aria-label="Value">
          <option value="true">Yes</option><option value="false">No</option>
        </select>
        <input v-else v-model="form.value" class="rg-input" :type="input" :step="input === 'number' ? 'any' : undefined" aria-label="Value" placeholder="Value" />
      </template>
      <div class="rg-colmenu__actions">
        <button v-if="filter" type="button" class="rg-btn rg-btn--sm rg-btn--ghost" @click="emit('unfilter'); emit('close')">Clear</button>
        <button type="submit" class="rg-btn rg-btn--sm rg-btn--primary" :disabled="!valid">Apply filter</button>
      </div>
    </form>
    <button v-if="column.alias !== '__tree'" type="button" class="rg-colmenu__item rg-colmenu__hide" @click="emit('hide'); emit('close')">
      <RgIcon name="eyeOff" small /> Hide column
    </button>
  </RgPopover>
</template>
