<script setup>
import { computed, inject, ref } from 'vue';
import { MODEL_STUDIO_KEY } from '../../composables/useModelStudio.js';
import { formatNumber, timeAgo } from '../../utils/format.js';
import RgIcon from '../../components/ui/RgIcon.vue';
import PublishDialog from './PublishDialog.vue';

const studio = inject(MODEL_STUDIO_KEY);
const publishing = ref(false);

const status = computed(() => studio.state.status);
const version = computed(() => status.value?.current_version);
const scan = computed(() => status.value?.latest_scan);
</script>

<template>
  <header class="rg-topbar">
    <div class="rg-topbar__title">
      <h1>Data model</h1>
      <div v-if="status" class="rg-topbar__meta">
        <span v-if="version">
          <RgIcon name="history" small />
          Version {{ version.version }} published {{ timeAgo(version.published_at) }}
        </span>
        <span v-else-if="status.scanned">Not published yet</span>
        <span v-if="scan">
          <RgIcon name="database" small />
          {{ formatNumber(scan.tables_count) }} tables in <span class="rg-mono">{{ scan.connection }}</span>
          ({{ scan.driver }}), scanned {{ timeAgo(scan.scanned_at) }}
        </span>
        <span v-if="status.unpublished_changes">
          <i class="rg-dot" aria-hidden="true" />
          Unpublished changes
        </span>
      </div>
    </div>

    <div v-if="status?.scanned" class="rg-topbar__actions">
      <button type="button" class="rg-btn" :disabled="studio.state.scanning" @click="studio.scan()">
        <RgIcon :name="studio.state.scanning ? 'loader' : 'scan'" :spin="studio.state.scanning" />
        {{ studio.state.scanning ? 'Scanning…' : 'Scan again' }}
      </button>
      <button
        type="button"
        class="rg-btn rg-btn--primary"
        :disabled="!status.unpublished_changes || studio.state.publishing"
        :title="status.unpublished_changes ? '' : 'Nothing has changed since the last published version'"
        @click="publishing = true"
      >
        <RgIcon name="upload" />
        Publish
      </button>
    </div>

    <PublishDialog v-if="publishing" @close="publishing = false" />
  </header>
</template>
