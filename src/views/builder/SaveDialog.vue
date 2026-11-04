<script setup>
import { inject, ref } from 'vue';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import RgDialog from '../../components/ui/RgDialog.vue';

const props = defineProps({
  copy: { type: Boolean, default: false },
  folders: { type: Array, default: () => [] },
});
const emit = defineEmits(['close', 'saved']);
const builder = inject(REPORT_BUILDER_KEY);
const theme = inject('rg-theme', 'light');
const d = builder.state.draft;

const name = ref(props.copy ? `Copy of ${d.name}` : d.name);
const description = ref(d.description);
const folder = ref(d.folder);
const visibility = ref(props.copy ? 'private' : d.visibility);

async function submit() {
  try {
    const saved = await builder.save({ name: name.value, description: description.value, folder: folder.value, visibility: visibility.value, copy: props.copy });
    emit('saved', saved);
    emit('close');
  } catch {
    // toast shown
  }
}
</script>

<template>
  <RgDialog :title="copy ? 'Save a copy' : d.uuid ? 'Save report' : 'Save new report'" :data-rg-theme="theme" @close="emit('close')">
    <form id="rg-save-form" style="display: contents" @submit.prevent="submit">
      <label class="rg-field-inline" style="flex-direction: column; align-items: stretch" for="rg-save-name">
        Name
        <input id="rg-save-name" v-model="name" class="rg-input" maxlength="255" required />
      </label>
      <label class="rg-field-inline" style="flex-direction: column; align-items: stretch" for="rg-save-description">
        Description (optional)
        <textarea id="rg-save-description" v-model="description" class="rg-textarea" maxlength="2000" />
      </label>
      <label class="rg-field-inline" style="flex-direction: column; align-items: stretch" for="rg-save-folder">
        Folder (optional)
        <input id="rg-save-folder" v-model="folder" class="rg-input" list="rg-save-folders" maxlength="255" placeholder="Sales" />
        <datalist id="rg-save-folders"><option v-for="f in folders" :key="f" :value="f" /></datalist>
      </label>
      <fieldset style="border: 0; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px">
        <legend class="rg-muted" style="font-size: 12px; margin-bottom: 4px">Who can open it</legend>
        <label class="rg-field-inline" for="rg-vis-private">
          <input id="rg-vis-private" v-model="visibility" type="radio" value="private" /> Only me (and people I share it with)
        </label>
        <label class="rg-field-inline" for="rg-vis-public">
          <input id="rg-vis-public" v-model="visibility" type="radio" value="public" /> Everyone who builds reports
        </label>
        <span class="rg-faint" style="font-size: 11.5px">People who open it only see the rows they are allowed to see.</span>
      </fieldset>
    </form>
    <template #footer>
      <button type="button" class="rg-btn" @click="emit('close')">Cancel</button>
      <button type="submit" form="rg-save-form" class="rg-btn rg-btn--primary" :disabled="builder.state.saving || !name.trim()">
        {{ builder.state.saving ? 'Saving…' : 'Save' }}
      </button>
    </template>
  </RgDialog>
</template>
