<script setup>
import { computed, ref } from 'vue';
import NeighborhoodGraph from './NeighborhoodGraph.vue';
import RelationshipRow from './RelationshipRow.vue';
import AddRelationshipForm from './AddRelationshipForm.vue';
import RgIcon from '../../components/ui/RgIcon.vue';

const props = defineProps({ dataset: { type: Object, required: true } });
const adding = ref(false);

const outgoing = computed(() => props.dataset.relationships.filter((r) => r.from?.id === props.dataset.id));
const incoming = computed(() => props.dataset.relationships.filter((r) => r.to?.id === props.dataset.id && r.from?.id !== props.dataset.id));
</script>

<template>
  <div class="rg-card">
    <div class="rg-card__head">
      <h2>How {{ dataset.label }} connects</h2>
      <span class="rg-spacer" />
      <button type="button" class="rg-btn rg-btn--sm" :aria-expanded="adding" @click="adding = !adding">
        <RgIcon :name="adding ? 'x' : 'plus'" small /> {{ adding ? 'Cancel' : 'Add relationship' }}
      </button>
    </div>
    <AddRelationshipForm v-if="adding" :dataset="dataset" @done="adding = false" />
    <template v-if="dataset.relationships.length">
      <div style="padding: 14px 14px 4px; overflow-x: auto">
        <NeighborhoodGraph :dataset="dataset" :relationships="dataset.relationships" />
      </div>
      <div class="rg-graph__legend" aria-hidden="true">
        <span><i /> Confirmed</span>
        <span><i class="rg-l--pending" /> Needs review</span>
        <span><i class="rg-l--rejected" /> Rejected (not used)</span>
      </div>
    </template>
    <div v-else class="rg-empty" style="padding: 32px">
      <p>No relationships found for this table. Add one if it should join to another table.</p>
    </div>
  </div>

  <div v-if="outgoing.length" class="rg-card">
    <div class="rg-card__head"><h2>Points to</h2><span class="rg-badge">{{ outgoing.length }}</span></div>
    <ul class="rg-edge-list">
      <RelationshipRow v-for="r in outgoing" :key="r.id" :relationship="r" :current-id="dataset.id" />
    </ul>
  </div>

  <div v-if="incoming.length" class="rg-card">
    <div class="rg-card__head"><h2>Referenced by</h2><span class="rg-badge">{{ incoming.length }}</span></div>
    <ul class="rg-edge-list">
      <RelationshipRow v-for="r in incoming" :key="r.id" :relationship="r" :current-id="dataset.id" />
    </ul>
  </div>
</template>
