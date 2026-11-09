<script setup>
import { computed } from 'vue';
import RgIcon from '../../components/ui/RgIcon.vue';
import { SINGLE_VALUE, WIDGET_TYPES, prefillWidget, withType } from './widgetTypes.js';

/**
 * The fields of one widget: report (optional), type, column, numbers,
 * title, size. Changes the `widget` object it is given in place.
 */
const props = defineProps({
  widget: { type: Object, required: true },
  /** Reports to choose from; null hides the report picker (pinning from a report). */
  reports: { type: Array, default: null },
  /** { dims: [{as,label}], nums: [{as,label}], loading } of the widget's report. */
  columns: { type: Object, required: true },
  idPrefix: { type: String, default: 'rg-widget' },
});
const emit = defineEmits(['report']);

const SIZES = [['sm', 'Small'], ['md', 'Half'], ['lg', 'Two thirds'], ['full', 'Full width']];
const single = computed(() => SINGLE_VALUE.includes(props.widget.type));
const ordered = computed(() => ['line', 'area'].includes(props.widget.type));
const parts = computed(() => ['pie', 'donut', 'share'].includes(props.widget.type));

function onType(type) {
  Object.assign(props.widget, withType(props.widget, type, { resize: true }));
  prefillWidget(props.widget, props.columns);
}

function toggleValue(alias) {
  const w = props.widget;
  if (single.value) w.values = [alias];
  else w.values = w.values.includes(alias) ? w.values.filter((v) => v !== alias) : [...w.values, alias];
}

function onReport(uuid) {
  Object.assign(props.widget, { report: uuid, category: null, values: [] });
  emit('report', uuid);
}
</script>

<template>
  <div class="rg-publish">
    <label v-if="reports" class="rg-publish__field" :for="`${idPrefix}-report`">
      <span>Report</span>
      <select :id="`${idPrefix}-report`" class="rg-input" :value="widget.report" @change="onReport($event.target.value)">
        <option value="" disabled>Pick a report</option>
        <option v-for="r in reports" :key="r.uuid" :value="r.uuid">{{ r.name }}</option>
      </select>
    </label>
    <div class="rg-publish__field">
      <span>Show as</span>
      <div class="rg-widget-types" role="group" aria-label="Widget type">
        <button v-for="t in WIDGET_TYPES" :key="t.value" type="button" class="rg-widget-type" :aria-pressed="widget.type === t.value" @click="onType(t.value)">
          <RgIcon :name="t.icon" small /><b>{{ t.label }}</b><small>{{ t.hint }}</small>
        </button>
      </div>
    </div>
    <label v-if="!['kpi', 'table'].includes(widget.type)" class="rg-publish__field" :for="`${idPrefix}-category`">
      <span>{{ ordered ? 'Over' : 'By' }}</span>
      <select :id="`${idPrefix}-category`" v-model="widget.category" class="rg-input">
        <option :value="null" disabled>Pick a column</option>
        <option v-for="d in columns.dims" :key="d.as" :value="d.as">{{ d.label }}</option>
      </select>
    </label>
    <fieldset v-if="widget.type !== 'table'" class="rg-publish__field">
      <legend>{{ single ? 'Number' : 'Numbers' }}<small v-if="ordered" class="rg-faint"> · pick numbers of the same scale: they share one axis</small></legend>
      <div class="rg-publish__roles">
        <button v-for="n in columns.nums" :key="n.as" type="button" class="rg-publish__role" :aria-pressed="widget.values.includes(n.as)" @click="toggleValue(n.as)">
          <RgIcon :name="widget.values.includes(n.as) ? 'check' : 'plus'" small />{{ n.label }}
        </button>
        <span v-if="columns.loading" class="rg-faint"><RgIcon name="loader" spin small /> Loading columns…</span>
      </div>
    </fieldset>
    <div class="rg-widget-dialog__row">
      <label class="rg-publish__field" :for="`${idPrefix}-title`">
        <span>Title</span>
        <input :id="`${idPrefix}-title`" v-model="widget.title" class="rg-input" maxlength="160" placeholder="From the numbers" />
      </label>
      <label v-if="widget.type !== 'kpi'" class="rg-publish__field" :for="`${idPrefix}-top`">
        <span>{{ ordered ? 'Points' : parts ? 'Parts' : 'Rows' }}</span>
        <input :id="`${idPrefix}-top`" v-model.number="widget.top" class="rg-input" type="number" min="1" :max="parts ? 12 : ordered ? 400 : 50" />
      </label>
      <label class="rg-publish__field" :for="`${idPrefix}-size`">
        <span>Size</span>
        <select :id="`${idPrefix}-size`" v-model="widget.size" class="rg-input">
          <option v-for="[value, label] in SIZES" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
    </div>
  </div>
</template>
