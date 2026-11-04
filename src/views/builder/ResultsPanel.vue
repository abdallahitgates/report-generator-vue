<script setup>
import { computed, inject, ref } from 'vue';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import { formatCount } from '../../utils/format.js';
import RgIcon from '../../components/ui/RgIcon.vue';
import ResultGrid from './ResultGrid.vue';

const builder = inject(REPORT_BUILDER_KEY);
const showSql = ref(false);

const meta = computed(() => builder.state.meta);
const error = computed(() => builder.state.error);

const MODES = {
  detail: 'Rows',
  aggregate: 'Totals',
  multi_fact: 'Totals per branch, combined (no double counting)',
};

const ERROR_TITLES = {
  AMBIGUOUS_PATH: 'Choose how to connect the tables',
  FAN_TRAP: 'These fields cannot be totalled together',
  TIMEOUT: 'The report took too long',
  TOO_HEAVY: 'The report would read too much data',
  DATASET_FORBIDDEN: 'No access',
  MODEL_NOT_PUBLISHED: 'No data model yet',
  TOO_MANY_QUERIES: 'Too many reports running',
  SERVER_BUSY: 'The report server is busy',
};
</script>

<template>
  <section class="rg-results" aria-label="Results">
    <div class="rg-statusbar" role="status" aria-live="polite">
      <template v-if="builder.state.running">
        <span><RgIcon name="loader" spin small /> Running…</span>
        <button type="button" class="rg-btn rg-btn--sm rg-btn--ghost" @click="builder.cancelRunning(); builder.state.running = false">
          <RgIcon name="stop" small /> Stop
        </button>
      </template>
      <template v-else-if="meta && !error">
        <span>{{ MODES[meta.mode] ?? meta.mode }}</span>
        <span class="rg-num">{{ meta.duration_ms }} ms</span>
        <span v-if="meta.cached" class="rg-badge rg-badge--success">from cache</span>
        <span v-if="meta.estimated_rows !== undefined" class="rg-num" title="How many rows the database expects to read">
          reads ~{{ formatCount(meta.estimated_rows) }} rows
        </span>
        <span v-if="meta.heavy" class="rg-badge rg-badge--warning" title="Large enough that exporting it will run in the background">heavy</span>
      </template>
      <span v-else-if="!builder.runnable.value" class="rg-faint">Add fields to see results.</span>
      <span class="rg-spacer" />
      <button v-if="meta?.sql" type="button" class="rg-btn rg-btn--sm rg-btn--ghost" :aria-expanded="showSql" @click="showSql = !showSql">
        {{ showSql ? 'Hide SQL' : 'SQL' }}
      </button>
    </div>

    <div>
      <pre v-if="showSql && meta?.sql" class="rg-mono" style="margin: 0; padding: 10px 16px; max-height: 160px; overflow: auto; background: var(--rg-sunken); white-space: pre-wrap; font-size: 11.5px">{{ meta.sql }}</pre>

      <div v-if="error" class="rg-errorbox" role="alert">
        <span class="rg-errorbox__title"><RgIcon name="alert" small />{{ ERROR_TITLES[error.code] ?? 'This report cannot run yet' }}</span>
        <span>{{ error.message }}</span>
        <div v-if="error.code === 'AMBIGUOUS_PATH' && builder.state.errorUid" class="rg-errorbox__options">
          <button
            v-for="option in error.details?.options ?? []"
            :key="option.path.join('.')"
            type="button"
            class="rg-btn"
            @click="builder.applyPath(builder.state.errorUid, option.path)"
          >
            {{ option.description }}
            <span v-if="option.multiplies_rows" class="rg-badge rg-badge--warning">several per row</span>
          </button>
        </div>
      </div>
    </div>

    <ResultGrid />
  </section>
</template>
