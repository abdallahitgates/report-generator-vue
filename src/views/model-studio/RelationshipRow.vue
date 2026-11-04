<script setup>
import { computed, inject } from 'vue';
import { MODEL_STUDIO_KEY } from '../../composables/useModelStudio.js';
import { CARDINALITIES, ORIGINS } from '../../utils/semantic.js';
import RgIcon from '../../components/ui/RgIcon.vue';

const props = defineProps({
  relationship: { type: Object, required: true },
  /** The dataset being viewed; its side is shown as plain text, the other side as a link. */
  currentId: { type: Number, default: null },
  selectable: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
});
const emit = defineEmits(['toggle']);
const studio = inject(MODEL_STUDIO_KEY);

const r = computed(() => props.relationship);
const origin = computed(() => ORIGINS[r.value.origin] ?? { label: r.value.origin, tone: 'neutral' });
const confidencePct = computed(() => Math.round(r.value.confidence * 100));

function update(patch) {
  studio.updateRelationship(r.value, patch).catch(() => {});
}
</script>

<template>
  <li class="rg-edge" :class="`rg-edge--${r.status}`">
    <div class="rg-edge__path">
      <input
        v-if="selectable"
        :id="`rg-rel-${r.id}`"
        class="rg-check"
        type="checkbox"
        :checked="selected"
        :aria-label="`Select ${r.from?.label}.${r.from_column} to ${r.to?.label}.${r.to_column}`"
        @change="emit('toggle', r.id)"
      />
      <component
        :is="r.from?.id === currentId ? 'span' : 'button'"
        :type="r.from?.id === currentId ? undefined : 'button'"
        :class="r.from?.id === currentId ? 'rg-edge__ds' : 'rg-linkish'"
        @click="r.from?.id !== currentId && studio.select(r.from.id)"
      >{{ r.from?.label }}</component>
      <span class="rg-mono rg-muted">.{{ r.from_column }}</span>
      <RgIcon name="arrow" small class="rg-icon--arrow" />
      <component
        :is="r.to?.id === currentId ? 'span' : 'button'"
        :type="r.to?.id === currentId ? undefined : 'button'"
        :class="r.to?.id === currentId ? 'rg-edge__ds' : 'rg-linkish'"
        @click="r.to?.id !== currentId && studio.select(r.to.id)"
      >{{ r.to?.label }}</component>
      <span class="rg-mono rg-muted">.{{ r.to_column }}</span>
    </div>

    <div class="rg-edge__meta">
      <select
        :id="`rg-card-${r.id}`"
        class="rg-select"
        :value="r.cardinality"
        :aria-label="'How many rows match on each side'"
        @change="update({ cardinality: $event.target.value })"
      >
        <option v-for="c in CARDINALITIES" :key="c.value" :value="c.value">{{ c.label }}</option>
      </select>
      <span class="rg-badge" :class="`rg-badge--${origin.tone}`" :title="`Found by: ${origin.label}, ${confidencePct}% confident`">
        {{ origin.label }}
      </span>
      <span
        v-if="r.origin !== 'manual' && r.origin !== 'foreign_key'"
        class="rg-confidence"
        :class="{ 'rg-confidence--high': r.confidence >= 0.85 }"
        :title="`${confidencePct}% confident`"
      ><i :style="{ width: `${confidencePct}%` }" /></span>
    </div>

    <div class="rg-edge__actions">
      <template v-if="r.status === 'pending'">
        <button type="button" class="rg-btn rg-btn--sm" @click="update({ status: 'confirmed' })">
          <RgIcon name="check" small /> Confirm
        </button>
        <button type="button" class="rg-btn rg-btn--sm rg-btn--ghost" @click="update({ status: 'rejected' })">Reject</button>
      </template>
      <template v-else>
        <span class="rg-badge" :class="r.status === 'confirmed' ? 'rg-badge--success' : 'rg-badge--danger'">{{ r.status }}</span>
        <button
          type="button"
          class="rg-btn rg-btn--sm rg-btn--ghost"
          @click="update({ status: r.status === 'confirmed' ? 'rejected' : 'confirmed' })"
        >
          {{ r.status === 'confirmed' ? 'Reject' : 'Restore' }}
        </button>
        <button
          v-if="r.origin === 'manual'"
          type="button"
          class="rg-btn rg-btn--sm rg-btn--ghost rg-btn--icon"
          aria-label="Delete relationship"
          title="Delete"
          @click="studio.deleteRelationship(r).catch(() => {})"
        >
          <RgIcon name="trash" small />
        </button>
      </template>
    </div>
  </li>
</template>
