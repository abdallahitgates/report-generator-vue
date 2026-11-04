<script setup>
import { computed, inject, ref } from 'vue';
import { MODEL_STUDIO_KEY } from '../../composables/useModelStudio.js';
import { formatNumber } from '../../utils/format.js';
import RgDialog from '../../components/ui/RgDialog.vue';

const emit = defineEmits(['close']);
const studio = inject(MODEL_STUDIO_KEY);
const theme = inject('rg-theme', 'light');
const notes = ref('');

const counts = computed(() => studio.state.status?.counts ?? {});
const next = computed(() => (studio.state.status?.current_version?.version ?? 0) + 1);

async function publish() {
  try {
    await studio.publish(notes.value.trim());
    emit('close');
  } catch {
    // toast shown
  }
}
</script>

<template>
  <RgDialog :title="`Publish version ${next}`" :data-rg-theme="theme" @close="emit('close')">
    <p class="rg-muted" style="margin: 0">
      Users building reports will see this version right away. Hidden datasets and fields, and relationships that
      are not confirmed, are left out.
    </p>
    <div class="rg-stats">
      <div class="rg-stat"><b>{{ formatNumber(counts.visible_datasets) }}</b><span>visible datasets</span></div>
      <div class="rg-stat"><b>{{ formatNumber(counts.datasets - counts.visible_datasets) }}</b><span>hidden or missing</span></div>
      <div class="rg-stat"><b>{{ formatNumber(counts.pending_relationships) }}</b><span>links still to review</span></div>
    </div>
    <label class="rg-field-inline" for="rg-publish-notes" style="flex-direction: column; align-items: stretch">
      What changed (optional)
      <textarea id="rg-publish-notes" v-model="notes" class="rg-textarea" maxlength="2000" placeholder="Renamed visit fields, confirmed sales links" />
    </label>
    <template #footer>
      <button type="button" class="rg-btn" @click="emit('close')">Cancel</button>
      <button type="button" class="rg-btn rg-btn--primary" :disabled="studio.state.publishing" @click="publish">
        {{ studio.state.publishing ? 'Publishing…' : `Publish version ${next}` }}
      </button>
    </template>
  </RgDialog>
</template>
