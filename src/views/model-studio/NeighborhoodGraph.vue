<script setup>
import { computed, inject } from 'vue';
import { MODEL_STUDIO_KEY } from '../../composables/useModelStudio.js';

/**
 * The selected dataset in the middle, tables it points to on the right,
 * tables pointing to it on the left. Dashed amber edges still need review.
 */
const props = defineProps({
  dataset: { type: Object, required: true },
  relationships: { type: Array, required: true },
});
const studio = inject(MODEL_STUDIO_KEY);

const MAX_PER_SIDE = 9;
const W = 760;
const NODE_W = 210;
const NODE_H = 36;
const GAP = 10;
const CENTER_W = 200;

function side(list) {
  const shown = list.slice(0, MAX_PER_SIDE);
  return { shown, more: list.length - shown.length };
}

const layout = computed(() => {
  const id = props.dataset.id;
  const live = props.relationships.filter((r) => r.from && r.to);
  const right = side(live.filter((r) => r.from.id === id && r.to.id !== id));
  const left = side(live.filter((r) => r.to.id === id && r.from.id !== id));
  const self = live.filter((r) => r.from.id === id && r.to.id === id);

  const rows = Math.max(right.shown.length + (right.more ? 1 : 0), left.shown.length + (left.more ? 1 : 0), 1);
  const height = rows * (NODE_H + GAP) + GAP;
  const cy = height / 2;

  const place = (items, x, otherOf) => items.map((r, i) => {
    const y = GAP + i * (NODE_H + GAP);
    const other = otherOf(r);
    return { r, x, y, other, column: r.from.id === id ? r.from_column : r.to_column, otherColumn: r.from.id === id ? r.to_column : r.from_column };
  });

  return {
    height,
    cy,
    right: place(right.shown, W - NODE_W - 4, (r) => r.to),
    left: place(left.shown, 4, (r) => r.from),
    moreRight: right.more,
    moreLeft: left.more,
    rows,
    self,
  };
});

const centerX = W / 2 - CENTER_W / 2;

function edgePath(node, isRight) {
  const { cy } = layout.value;
  const ny = node.y + NODE_H / 2;
  if (isRight) {
    const x1 = centerX + CENTER_W;
    const x2 = node.x;
    const mid = (x1 + x2) / 2;
    return `M${x1},${cy} C${mid},${cy} ${mid},${ny} ${x2},${ny}`;
  }
  const x1 = node.x + NODE_W;
  const x2 = centerX;
  const mid = (x1 + x2) / 2;
  return `M${x1},${ny} C${mid},${ny} ${mid},${cy} ${x2},${cy}`;
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
</script>

<template>
  <svg
    class="rg-graph"
    :viewBox="`0 0 ${W} ${layout.height}`"
    role="img"
    :aria-label="`${dataset.label}: points to ${layout.right.length + layout.moreRight} tables, referenced by ${layout.left.length + layout.moreLeft}`"
  >
    <path v-for="n in layout.right" :key="`er-${n.r.id}`" :d="edgePath(n, true)" :class="`rg-edge--${n.r.status}`" />
    <path v-for="n in layout.left" :key="`el-${n.r.id}`" :d="edgePath(n, false)" :class="`rg-edge--${n.r.status}`" />

    <g class="rg-graph__node rg-graph__node--center">
      <rect :x="centerX" :y="layout.cy - 24" :width="CENTER_W" height="48" rx="8" />
      <text :x="W / 2" :y="layout.cy - 2" text-anchor="middle">{{ truncate(dataset.label, 26) }}</text>
      <text :x="W / 2" :y="layout.cy + 14" text-anchor="middle" class="rg-graph__sub" style="fill: currentColor; opacity: 0.7">
        {{ layout.self.length ? `${truncate(dataset.source_name, 18)} ↻` : truncate(dataset.source_name, 26) }}
      </text>
    </g>

    <g
      v-for="n in [...layout.left, ...layout.right]"
      :key="`n-${n.r.id}`"
      class="rg-graph__node rg-graph__node--link"
      tabindex="0"
      role="link"
      :aria-label="`Open ${n.other.label}`"
      @click="studio.select(n.other.id)"
      @keydown.enter="studio.select(n.other.id)"
    >
      <rect :x="n.x" :y="n.y" :width="NODE_W" :height="NODE_H" rx="6" />
      <text :x="n.x + 10" :y="n.y + 15">{{ truncate(n.other.label, 26) }}</text>
      <text :x="n.x + 10" :y="n.y + 29" class="rg-graph__sub">{{ truncate(`${n.column} → ${n.otherColumn}`, 30) }}</text>
    </g>

    <text v-if="layout.moreLeft" x="14" :y="GAP + layout.left.length * (NODE_H + GAP) + 22" class="rg-graph__sub">
      +{{ layout.moreLeft }} more below
    </text>
    <text v-if="layout.moreRight" :x="W - NODE_W + 6" :y="GAP + layout.right.length * (NODE_H + GAP) + 22" class="rg-graph__sub">
      +{{ layout.moreRight }} more below
    </text>
  </svg>
</template>
