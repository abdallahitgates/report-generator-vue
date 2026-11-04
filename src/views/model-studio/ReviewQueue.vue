<script setup>
import { computed, inject, ref } from 'vue';
import { MODEL_STUDIO_KEY } from '../../composables/useModelStudio.js';
import { ORIGINS } from '../../utils/semantic.js';
import { pluralize } from '../../utils/format.js';
import RelationshipRow from './RelationshipRow.vue';
import RgIcon from '../../components/ui/RgIcon.vue';

const studio = inject(MODEL_STUDIO_KEY);
const selected = ref(new Set());
const busy = ref(false);

const groups = computed(() => {
  const byOrigin = {};
  for (const r of studio.state.pending) (byOrigin[r.origin] ??= []).push(r);
  return Object.entries(byOrigin)
    .map(([origin, items]) => ({ origin, label: ORIGINS[origin]?.label ?? origin, items }))
    .sort((a, b) => b.items[0].confidence - a.items[0].confidence);
});

function toggle(id) {
  const next = new Set(selected.value);
  next.has(id) ? next.delete(id) : next.add(id);
  selected.value = next;
}

function selectGroup(group) {
  const next = new Set(selected.value);
  const all = group.items.every((r) => next.has(r.id));
  group.items.forEach((r) => (all ? next.delete(r.id) : next.add(r.id)));
  selected.value = next;
}

async function apply(status) {
  busy.value = true;
  try {
    const ids = [...selected.value];
    await studio.bulkReview(ids, status);
    selected.value = new Set();
  } catch {
    // toast shown
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <section class="rg-panel">
    <div class="rg-panel__head">
      <div class="rg-panel__title">
        <h2 style="margin: 0; font-size: 20px; font-weight: 650">Relationships to review</h2>
        <p class="rg-muted" style="margin: 0; max-width: 70ch">
          These links were guessed from your Eloquent models or from column names like <span class="rg-mono">doctor_id</span>.
          Confirm the ones that are right. Reports can only join on confirmed relationships.
        </p>
      </div>
      <div class="rg-panel__controls">
        <button type="button" class="rg-btn" :disabled="!selected.size || busy" @click="apply('rejected')">Reject selected</button>
        <button type="button" class="rg-btn rg-btn--primary" :disabled="!selected.size || busy" @click="apply('confirmed')">
          <RgIcon name="check" small /> Confirm {{ selected.size ? selected.size : '' }}
        </button>
      </div>
    </div>

    <div v-if="studio.state.loadingPending" class="rg-card rg-skeleton-list">
      <div v-for="n in 6" :key="n" class="rg-skeleton" />
    </div>

    <div v-else-if="!studio.state.pending.length" class="rg-empty">
      <div class="rg-empty__icon"><RgIcon name="check" /></div>
      <h2>All reviewed</h2>
      <p>Every relationship has been confirmed or rejected. New guesses appear here after the next scan.</p>
    </div>

    <template v-else>
    <div v-for="group in groups" :key="group.origin" class="rg-card">
      <div class="rg-review-group">
        {{ group.label }} · {{ pluralize(group.items.length, 'relationship') }}
        <button type="button" class="rg-btn rg-btn--sm rg-btn--ghost" @click="selectGroup(group)">
          {{ group.items.every((r) => selected.has(r.id)) ? 'Clear selection' : 'Select all' }}
        </button>
      </div>
      <ul class="rg-edge-list">
        <RelationshipRow
          v-for="r in group.items"
          :key="r.id"
          :relationship="r"
          selectable
          :selected="selected.has(r.id)"
          @toggle="toggle"
        />
      </ul>
    </div>
    </template>
  </section>
</template>
