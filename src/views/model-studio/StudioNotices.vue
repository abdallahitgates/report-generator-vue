<script setup>
import { computed, inject, ref } from 'vue';
import { MODEL_STUDIO_KEY } from '../../composables/useModelStudio.js';
import { pluralize } from '../../utils/format.js';
import RgIcon from '../../components/ui/RgIcon.vue';

const studio = inject(MODEL_STUDIO_KEY);
const showChanges = ref(false);

const pending = computed(() => studio.state.status?.counts?.pending_relationships ?? 0);
const changes = computed(() => studio.state.status?.last_structure_changes);

const changeParts = computed(() => {
  const c = changes.value;
  if (!c) return [];
  const count = (map) => Object.values(map || {}).reduce((sum, list) => sum + list.length, 0);
  return [
    c.tables_added.length && pluralize(c.tables_added.length, 'table') + ' added',
    c.tables_removed.length && pluralize(c.tables_removed.length, 'table') + ' removed',
    count(c.columns_added) && pluralize(count(c.columns_added), 'column') + ' added',
    count(c.columns_removed) && pluralize(count(c.columns_removed), 'column') + ' removed',
    count(c.columns_changed) && pluralize(count(c.columns_changed), 'column type') + ' changed',
  ].filter(Boolean);
});
</script>

<template>
  <div class="rg-notices">
    <div v-if="pending > 0 && studio.state.view !== 'review'" class="rg-notice rg-notice--warning">
      <RgIcon name="link" />
      <span>
        <strong>{{ pluralize(pending, 'relationship') }}</strong>
        {{ pending === 1 ? 'was' : 'were' }} guessed from models or column names and
        {{ pending === 1 ? 'needs' : 'need' }} your review before users can join on {{ pending === 1 ? 'it' : 'them' }}.
      </span>
      <button type="button" class="rg-btn rg-btn--sm" @click="studio.openReview()">Review</button>
    </div>

    <div v-if="changeParts.length" class="rg-notice rg-notice--info">
      <RgIcon name="alert" />
      <span><strong>The database changed</strong> since the scan before last: {{ changeParts.join(', ') }}.</span>
      <button type="button" class="rg-btn rg-btn--sm rg-btn--ghost" :aria-expanded="showChanges" @click="showChanges = !showChanges">
        {{ showChanges ? 'Hide' : 'Details' }}
      </button>
      <ul v-if="showChanges" class="rg-notice__details">
        <li v-for="t in changes.tables_added" :key="`ta-${t}`">New table <span class="rg-mono">{{ t }}</span></li>
        <li v-for="t in changes.tables_removed" :key="`tr-${t}`">Removed table <span class="rg-mono">{{ t }}</span></li>
        <li v-for="(cols, t) in changes.columns_added" :key="`ca-${t}`">
          <span class="rg-mono">{{ t }}</span>: new {{ cols.join(', ') }}
        </li>
        <li v-for="(cols, t) in changes.columns_removed" :key="`cr-${t}`">
          <span class="rg-mono">{{ t }}</span>: removed {{ cols.join(', ') }}
        </li>
        <li v-for="(cols, t) in changes.columns_changed" :key="`cc-${t}`">
          <span class="rg-mono">{{ t }}</span>:
          <span v-for="c in cols" :key="c.column">{{ c.column }} {{ c.from }} → {{ c.to }} </span>
        </li>
      </ul>
    </div>
  </div>
</template>
