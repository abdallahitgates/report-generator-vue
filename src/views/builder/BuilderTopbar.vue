<script setup>
import { computed, inject } from 'vue';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import RgIcon from '../../components/ui/RgIcon.vue';

const emit = defineEmits(['save', 'save-copy', 'close', 'publish']);
const builder = inject(REPORT_BUILDER_KEY);
const draft = computed(() => builder.state.draft);
const rootLabel = computed(() => builder.datasetsByKey.value[draft.value.root]?.label ?? draft.value.root);
</script>

<template>
  <header class="rg-topbar">
    <div class="rg-topbar__title">
      <label class="rg-sr-only" for="rg-report-name">Report name</label>
      <input id="rg-report-name" v-model="draft.name" class="rg-input rg-input--bare rg-name-input" maxlength="255" />
      <div class="rg-topbar__meta">
        <span v-if="draft.root" class="rg-root-chip">
          Report on <b>{{ rootLabel }}</b>
          <button type="button" @click="builder.changeRoot()">change</button>
        </span>
        <span v-if="builder.dirty.value"><i class="rg-dot" aria-hidden="true" /> Unsaved changes</span>
        <span v-if="draft.uuid && !draft.canEdit" class="rg-badge">View only: save a copy to keep changes</span>
        <span v-if="draft.published" class="rg-badge rg-badge--success"><RgIcon name="globe" small /> Published</span>
      </div>
    </div>

    <div class="rg-topbar__actions">
      <button type="button" class="rg-btn rg-btn--ghost rg-btn--icon" :disabled="!builder.canUndo()" aria-label="Undo" title="Undo (Ctrl+Z)" @click="builder.undo()">
        <RgIcon name="undo" />
      </button>
      <button type="button" class="rg-btn rg-btn--ghost rg-btn--icon" :disabled="!builder.canRedo()" aria-label="Redo" title="Redo (Ctrl+Shift+Z)" @click="builder.redo()">
        <RgIcon name="redo" />
      </button>
      <span class="rg-toolbar-sep" />
      <label class="rg-field-inline" for="rg-autorun" title="Run the report as you change it">
        <input id="rg-autorun" v-model="builder.state.autoRun" class="rg-check" type="checkbox" /> Auto-run
      </label>
      <button type="button" class="rg-btn" :disabled="!builder.runnable.value || builder.state.running" title="Run (Ctrl+Enter)" @click="builder.run()">
        <RgIcon name="play" small /> Run
      </button>
      <span class="rg-toolbar-sep" />
      <button v-if="draft.uuid && draft.canPublish" type="button" class="rg-btn" title="Give roles a permission to open this report" @click="emit('publish')">
        <RgIcon name="globe" small /> {{ draft.published ? 'Publishing' : 'Publish' }}
      </button>
      <button v-if="draft.uuid" type="button" class="rg-btn" :disabled="!draft.root" @click="emit('save-copy')">
        <RgIcon name="copy" small /> Save a copy
      </button>
      <button
        type="button"
        class="rg-btn rg-btn--primary"
        :disabled="!builder.runnable.value || builder.state.saving || (draft.uuid && !draft.canEdit)"
        title="Save (Ctrl+S)"
        @click="emit('save')"
      >
        <RgIcon name="save" small /> Save
      </button>
    </div>
  </header>
</template>
