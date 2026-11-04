<script setup>
import { onMounted, provide } from 'vue';
import { useReportGenerator } from '../../context.js';
import { createModelStudio, MODEL_STUDIO_KEY } from '../../composables/useModelStudio.js';
import { createToasts } from '../../composables/useToasts.js';
import RgToaster from '../../components/ui/RgToaster.vue';
import RgIcon from '../../components/ui/RgIcon.vue';
import StudioTopbar from './StudioTopbar.vue';
import StudioNotices from './StudioNotices.vue';
import DatasetSidebar from './DatasetSidebar.vue';
import DatasetPanel from './DatasetPanel.vue';
import ReviewQueue from './ReviewQueue.vue';

const props = defineProps({
  /** light | dark. The host decides; Model Studio does not follow the OS on its own. */
  theme: { type: String, default: 'light' },
});

const { api } = useReportGenerator();
const toasts = createToasts();
const studio = createModelStudio(api, toasts);
provide(MODEL_STUDIO_KEY, studio);
provide('rg-theme', props.theme);

onMounted(() => studio.init());
</script>

<template>
  <div class="rg-root rg-studio" :data-rg-theme="theme">
    <StudioTopbar />
    <StudioNotices />

    <div v-if="studio.state.loading" class="rg-body">
      <aside class="rg-sidebar">
        <div class="rg-skeleton-list">
          <div v-for="n in 8" :key="n" class="rg-skeleton" :style="{ width: `${50 + ((n * 37) % 45)}%` }" />
        </div>
      </aside>
      <main class="rg-main" />
    </div>

    <div v-else-if="!studio.state.status?.scanned" class="rg-main">
      <div class="rg-empty">
        <div class="rg-empty__icon"><RgIcon name="database" /></div>
        <h2>Scan your database to start</h2>
        <p>
          The scan reads every table, column and foreign key, guesses how tables connect from your
          models and column names, and hides anything that looks sensitive. Nothing is shown to users
          until you review it and publish.
        </p>
        <button type="button" class="rg-btn rg-btn--primary" :disabled="studio.state.scanning" @click="studio.scan()">
          <RgIcon :name="studio.state.scanning ? 'loader' : 'scan'" :spin="studio.state.scanning" />
          {{ studio.state.scanning ? 'Scanning…' : 'Scan database' }}
        </button>
      </div>
    </div>

    <div v-else class="rg-body">
      <DatasetSidebar />
      <main class="rg-main">
        <ReviewQueue v-if="studio.state.view === 'review'" />
        <DatasetPanel v-else />
      </main>
    </div>

    <RgToaster :toasts="toasts" :data-rg-theme="theme" />
  </div>
</template>
