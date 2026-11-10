<script setup>
import { computed, inject } from 'vue';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import { TYPE_ICONS } from '../../utils/semantic.js';
import RgIcon from '../../components/ui/RgIcon.vue';

/**
 * One topic of the relation tree (Visits ▸ Employee ▸ Line): its fields,
 * then the topics it leads to. Every field is added with this node's own
 * join path, so nothing asks "which way?".
 */
defineOptions({ name: 'FieldNode' });
const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  /** Labels of the nodes above, for names like "Employee › Line". */
  trail: { type: Array, default: () => [] },
  search: { type: String, default: '' },
  open: { type: Object, required: true },
});
const builder = inject(REPORT_BUILDER_KEY);

const id = computed(() => (props.node.path ? props.node.path.join('.') : props.node.topic) || 'root');
const isRoot = computed(() => props.depth === 0);
const label = computed(() => [...props.trail, props.node.label].join(' › '));
const term = computed(() => props.search.trim().toLowerCase());

function matches(node, labels) {
  if (!term.value) return true;
  const here = [...labels, node.label].join(' ').toLowerCase();
  return here.includes(term.value)
    || node.fields.some((f) => !f.hidden && f.label.toLowerCase().includes(term.value))
    || (node.relations ?? []).some((child) => matches(child, [...labels, node.label]));
}

// Hidden fields (join keys) stay out of the list.
const visible = computed(() => props.node.fields.filter((f) => !f.hidden));
const fields = computed(() => {
  if (!term.value || label.value.toLowerCase().includes(term.value)) return visible.value;
  return visible.value.filter((f) => f.label.toLowerCase().includes(term.value));
});
const children = computed(() => (props.node.relations ?? []).filter((child) => matches(child, isRoot.value ? [] : [...props.trail, props.node.label])));
const expanded = computed(() => (term.value ? true : props.open[id.value] ?? isRoot.value));
const childTrail = computed(() => (isRoot.value ? [] : [...props.trail, props.node.label]));

function toggle() {
  props.open[id.value] = !expanded.value;
}

/** Label the builder gives this node's fields: none for the report's own topic. */
const nodeLabel = computed(() => (isRoot.value ? null : label.value));

function add(field, target = null) {
  // path undefined (flat catalogs): the builder asks which way to join.
  builder.addField(props.node.topic, field.key, target, null, props.node.path, null, nodeLabel.value);
}

function onDragStart(event, field) {
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('application/x-rg', JSON.stringify({
    kind: 'field', dataset: props.node.topic, field: field.key, path: props.node.path, label: nodeLabel.value,
  }));
  event.dataTransfer.setData('text/plain', field.label);
}
</script>

<template>
  <section class="rg-ds" :class="{ 'rg-ds--nested': depth > 0 }" :style="{ '--rg-depth': depth }">
    <button type="button" class="rg-ds__head" :aria-expanded="expanded ? 'true' : 'false'" @click="toggle">
      <RgIcon name="chevron" small class="rg-chev" />
      <span class="rg-ds__name">
        {{ node.label }}
        <small v-if="node.topic_label && node.topic_label !== node.label && !isRoot" class="rg-faint">{{ node.topic_label }}</small>
      </span>
      <span class="rg-ds__meta">
        <span v-if="isRoot" class="rg-badge rg-badge--info">report</span>
        <span v-else-if="node.multiplies_rows" class="rg-badge" title="Several per report row: totals are counted once per row">many</span>
      </span>
    </button>
    <template v-if="expanded">
      <ul v-if="fields.length" class="rg-ds__fields">
        <li
          v-for="field in fields"
          :key="field.key"
          class="rg-fld"
          draggable="true"
          :title="`${label} · ${field.label} (${field.type})`"
          @dragstart="onDragStart($event, field)"
          @dblclick="add(field)"
        >
          <span :class="`rg-role rg-role--${field.role}`"><RgIcon :name="field.key === '__rows' ? 'hash' : TYPE_ICONS[field.type] || 'text'" small class="rg-fld__icon" /></span>
          <span class="rg-fld__label">{{ field.label }}</span>
          <span class="rg-fld__actions">
            <button type="button" class="rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon" :aria-label="`Add ${field.label}`" title="Add" @click="add(field)"><RgIcon name="plus" small /></button>
            <button v-if="field.key !== '__rows'" type="button" class="rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon" :aria-label="`Filter by ${field.label}`" title="Filter by this" @click="add(field, 'filters')"><RgIcon name="filter" small /></button>
          </span>
        </li>
      </ul>
      <FieldNode
        v-for="child in children"
        :key="child.path ? child.path.join('.') : child.topic"
        :node="child"
        :depth="depth + 1"
        :trail="childTrail"
        :search="search"
        :open="open"
      />
    </template>
  </section>
</template>
