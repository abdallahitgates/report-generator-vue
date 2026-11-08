<script setup>
import { computed, inject, onMounted, provide, ref } from 'vue';
import { useReportGenerator } from '../../context.js';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import { BASE_COLUMNS, createCombinedBuilder } from '../../composables/useCombinedBuilder.js';
import { createToasts } from '../../composables/useToasts.js';
import { TYPE_ICONS } from '../../utils/semantic.js';
import RgIcon from '../../components/ui/RgIcon.vue';
import RgDialog from '../../components/ui/RgDialog.vue';
import RgMultiSelect from '../../components/ui/RgMultiSelect.vue';
import RgToaster from '../../components/ui/RgToaster.vue';
import ResultGrid from '../builder/ResultGrid.vue';
import SaveDialog from '../builder/SaveDialog.vue';
import PublishDialog from '../builder/PublishDialog.vue';

/**
 * Builder for combined reports: columns of existing reports side by side,
 * one row per employee or per division, plus formulas across them.
 */
const props = defineProps({
  /** Saved combined report to open (from api.reports.get), or null for a new one. */
  report: { type: Object, default: null },
  theme: { type: String, default: 'light' },
});
const emit = defineEmits(['saved', 'published', 'back']);

const { api } = useReportGenerator();
const toasts = createToasts();
const builder = createCombinedBuilder(api, toasts);
provide(REPORT_BUILDER_KEY, builder);
if (!inject('rg-theme', null)) provide('rg-theme', props.theme);

const PERIODS = [
  ['this_month', 'This month'], ['last_month', 'Last month'], ['this_quarter', 'This quarter'], ['last_quarter', 'Last quarter'],
  ['this_year', 'This year'], ['last_year', 'Last year'], ['last_30_days', 'Last 30 days'],
];
const TYPE_ICON = { ...TYPE_ICONS, percent: 'hash' };

const draft = computed(() => builder.state.draft);
const search = ref('');
const open = ref(new Set());
const saving = ref(null);
const publishing = ref(false);
const formula = ref(null); // { label, formula, uid? }
const renaming = ref(null);
const dragging = ref(null);

const groups = computed(() => {
  const term = search.value.trim().toLowerCase();
  const out = new Map();
  for (const report of builder.state.reports) {
    if (term && !report.label.toLowerCase().includes(term) && !(report.description ?? '').toLowerCase().includes(term)) continue;
    const name = report.group ?? 'Reports';
    if (!out.has(name)) out.set(name, []);
    out.get(name).push(report);
  }
  return [...out];
});

const usedReports = computed(() => new Set(draft.value.fields.filter((f) => f.report).map((f) => f.report)));
const aliases = computed(() => draft.value.fields.map((f) => ({ uid: f.uid, as: f.as, label: f.label ?? f.as })));

function supports(report) {
  return report.levels.includes(draft.value.level);
}

function toggleOpen(report) {
  const next = new Set(open.value);
  if (next.has(report.key)) next.delete(report.key);
  else {
    next.add(report.key);
    builder.loadFields(report.key);
  }
  open.value = next;
}

function sourceOf(column) {
  if (column.base) return 'Structure';
  if (column.formula) return 'Formula';
  return builder.reportsByKey.value[column.report]?.label ?? column.report;
}

function startRename(column) {
  renaming.value = { uid: column.uid, label: column.label ?? column.as };
}

function finishRename() {
  if (renaming.value?.label?.trim()) builder.updateColumn(renaming.value.uid, { label: renaming.value.label.trim() });
  renaming.value = null;
}

function onDrop(target) {
  if (!dragging.value) return;
  builder.moveColumn(dragging.value, draft.value.fields.findIndex((f) => f.uid === target));
  dragging.value = null;
}

function saveFormula() {
  const f = formula.value;
  if (!f?.formula?.trim()) return;
  if (f.uid) builder.updateColumn(f.uid, { label: f.label || 'Formula', formula: f.formula.trim() });
  else builder.addFormula({ label: f.label, formula: f.formula.trim() });
  formula.value = null;
}

function insertName(as) {
  formula.value.formula = `${formula.value.formula ?? ''}${formula.value.formula && !/\s$/.test(formula.value.formula) ? ' ' : ''}${as}`;
}

function linesOptions(search) {
  return api.contextOptions('lines', { search });
}

function onSaved(report) {
  emit('saved', report);
}

onMounted(() => builder.init(props.report));

const ERROR_TITLES = {
  REPORT_FAILED: 'One of the reports could not run',
  DATASET_FORBIDDEN: 'No access',
  LEVEL_UNSUPPORTED: 'Not available at this level',
  UNKNOWN_FIELD: 'Check the formula',
  INVALID_FORMULA: 'Check the formula',
};
</script>

<template>
  <div class="rg-root rg-combined" :data-rg-theme="theme">
    <header class="rg-topbar">
      <div class="rg-topbar__title">
        <label class="rg-sr-only" for="rg-combined-name">Report name</label>
        <input id="rg-combined-name" v-model="draft.name" class="rg-input rg-input--bare rg-name-input" maxlength="255" />
        <div class="rg-topbar__meta">
          <span class="rg-root-chip">
            <RgIcon name="table" small /> Combined report, one row per <b>{{ draft.level }}</b>
            <button v-if="!draft.uuid" type="button" @click="emit('back')">change type</button>
          </span>
          <span v-if="builder.dirty.value"><i class="rg-dot" aria-hidden="true" /> Unsaved changes</span>
          <span v-if="draft.published" class="rg-badge rg-badge--success"><RgIcon name="globe" small /> Published</span>
        </div>
      </div>
      <div class="rg-topbar__actions">
        <button type="button" class="rg-btn" :disabled="!builder.runnable.value || builder.state.running" @click="builder.run()"><RgIcon name="play" small /> Run</button>
        <span class="rg-toolbar-sep" />
        <button v-if="draft.uuid && draft.canPublish" type="button" class="rg-btn" @click="publishing = true">
          <RgIcon name="globe" small /> {{ draft.published ? 'Publishing' : 'Publish' }}
        </button>
        <button v-if="draft.uuid" type="button" class="rg-btn" @click="saving = { copy: true }"><RgIcon name="copy" small /> Save a copy</button>
        <button type="button" class="rg-btn rg-btn--primary" :disabled="!builder.runnable.value || builder.state.saving || (draft.uuid && !draft.canEdit)" @click="saving = { copy: false }">
          <RgIcon name="save" small /> Save
        </button>
      </div>
    </header>

    <div v-if="builder.state.loading" class="rg-builder__body">
      <aside class="rg-explorer"><div class="rg-skeleton-list"><div v-for="n in 8" :key="n" class="rg-skeleton" /></div></aside>
      <main class="rg-builder__main" />
    </div>

    <div v-else class="rg-builder__body">
      <aside class="rg-explorer rg-catalog" aria-label="Reports">
        <div class="rg-explorer__head">
          <label class="rg-search">
            <span class="rg-sr-only">Search reports</span>
            <RgIcon name="search" />
            <input v-model="search" class="rg-input" type="search" placeholder="Search reports" autocomplete="off" />
          </label>
        </div>
        <div class="rg-catalog__list">
          <p v-if="!builder.state.reports.length" class="rg-list__empty">No existing reports can be combined yet.</p>
          <section v-for="[name, reports] in groups" :key="name" class="rg-catalog__group">
            <h3>{{ name }}</h3>
            <article v-for="report in reports" :key="report.key" class="rg-catalog__report" :class="{ 'is-open': open.has(report.key), 'is-used': usedReports.has(report.key), 'is-off': !supports(report) }">
              <button type="button" class="rg-catalog__head" :aria-expanded="open.has(report.key)" :disabled="!supports(report)" @click="toggleOpen(report)">
                <RgIcon name="chevron" small class="rg-catalog__chev" />
                <span>
                  <b>{{ report.label }}</b>
                  <small v-if="!supports(report)" class="rg-faint">Per {{ report.levels.join(' / ') }} only</small>
                  <small v-else-if="report.description" class="rg-faint">{{ report.description }}</small>
                </span>
                <span v-if="usedReports.has(report.key)" class="rg-badge rg-badge--info">in use</span>
              </button>
              <Transition name="rg-swap">
                <ul v-if="open.has(report.key)" class="rg-catalog__fields">
                  <li v-if="builder.fieldsOf(report.key)?.loading" class="rg-faint"><RgIcon name="loader" spin small /> Reading its columns…</li>
                  <li v-else-if="builder.fieldsOf(report.key)?.error" class="rg-catalog__error">{{ builder.fieldsOf(report.key).error }}</li>
                  <li v-for="field in builder.fieldsOf(report.key)?.fields ?? []" :key="field.key">
                    <label>
                      <input type="checkbox" class="rg-check" :checked="builder.hasField(report.key, field.key)" @change="builder.toggleField(report.key, field)" />
                      <RgIcon :name="TYPE_ICON[field.type] ?? 'text'" small />
                      <span>{{ field.label }}</span>
                      <small v-if="field.type === 'percent'" class="rg-faint">%</small>
                    </label>
                  </li>
                </ul>
              </Transition>
            </article>
          </section>
        </div>
      </aside>

      <main class="rg-builder__main">
        <div class="rg-combined__settings">
          <div class="rg-segmented" role="group" aria-label="One row per">
            <button type="button" :aria-pressed="draft.level === 'employee'" @click="draft.level = 'employee'">Per employee</button>
            <button type="button" :aria-pressed="draft.level === 'division'" @click="draft.level = 'division'">Per division</button>
          </div>
          <label class="rg-field-inline" for="rg-combined-period">
            <RgIcon name="calendar" small /> Period
            <select id="rg-combined-period" v-model="draft.period" class="rg-input" style="width: auto">
              <option v-for="[value, label] in PERIODS" :key="value" :value="value">{{ label }}</option>
              <option value="custom">Custom range…</option>
            </select>
          </label>
          <template v-if="draft.period === 'custom'">
            <input v-model="draft.from" class="rg-input" type="date" aria-label="From" style="width: auto" />
            <span class="rg-faint">to</span>
            <input v-model="draft.to" class="rg-input" type="date" aria-label="To" style="width: auto" />
          </template>
          <div class="rg-field-inline">
            <RgIcon name="folder" small /> Lines
            <RgMultiSelect v-model="draft.lines" label="Lines" all-label="All my lines" :load="linesOptions" />
          </div>
        </div>

        <div class="rg-combined__columns">
          <div class="rg-combined__base" role="group" aria-label="Structure columns">
            <button v-for="b in BASE_COLUMNS" :key="b.key" type="button" class="rg-chip-toggle" :aria-pressed="draft.fields.some((f) => f.base === b.key)" @click="builder.toggleBase(b.key)">
              {{ b.label }}
            </button>
          </div>
          <TransitionGroup tag="ol" name="rg-list-move" class="rg-combined__chips" aria-label="Columns">
            <li
              v-for="(column, i) in draft.fields"
              :key="column.uid"
              class="rg-combined__chip"
              :class="{ 'is-formula': column.formula, 'is-base': column.base, 'is-dragging': dragging === column.uid }"
              draggable="true"
              @dragstart="dragging = column.uid"
              @dragend="dragging = null"
              @dragover.prevent
              @drop.prevent="onDrop(column.uid)"
            >
              <span class="rg-combined__grip" aria-hidden="true">⋮⋮</span>
              <span class="rg-combined__text">
                <input
                  v-if="renaming?.uid === column.uid"
                  v-model="renaming.label"
                  class="rg-input rg-combined__rename"
                  :aria-label="`Rename ${column.label ?? column.as}`"
                  @keydown.enter.prevent="finishRename"
                  @keydown.escape="renaming = null"
                  @blur="finishRename"
                />
                <button v-else type="button" class="rg-linkish" :title="'Rename'" @click="startRename(column)">{{ column.label ?? column.as }}</button>
                <small class="rg-faint"><template v-if="column.formula"><RgIcon name="fx" small /> {{ column.formula }}</template><template v-else>{{ sourceOf(column) }}</template></small>
              </span>
              <button v-if="column.formula" type="button" class="rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm" :aria-label="`Edit ${column.label}`" @click="formula = { uid: column.uid, label: column.label, formula: column.formula }">
                <RgIcon name="fx" small />
              </button>
              <button type="button" class="rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm" :aria-label="`Move ${column.label ?? column.as} left`" :disabled="i === 0" @click="builder.moveColumn(column.uid, i - 1)">‹</button>
              <button type="button" class="rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm" :aria-label="`Remove ${column.label ?? column.as}`" @click="builder.removeColumn(column.uid)"><RgIcon name="x" small /></button>
            </li>
          </TransitionGroup>
          <button type="button" class="rg-btn rg-btn--sm" :disabled="draft.fields.length < 2" @click="formula = { label: '', formula: '' }">
            <RgIcon name="fx" small /> Formula
          </button>
        </div>

        <section class="rg-results" aria-label="Results">
          <div class="rg-statusbar" role="status" aria-live="polite">
            <span v-if="builder.state.running"><RgIcon name="loader" spin small /> Running the reports…</span>
            <template v-else-if="builder.state.meta && !builder.state.error">
              <span>{{ usedReports.size }} {{ usedReports.size === 1 ? 'report' : 'reports' }} combined</span>
              <span class="rg-num">{{ builder.state.meta.duration_ms }} ms</span>
              <span v-if="builder.state.meta.cached" class="rg-badge rg-badge--success">from cache</span>
            </template>
            <span v-else-if="!builder.runnable.value" class="rg-faint">Open a report on the left and tick the columns you want.</span>
          </div>
          <div>
            <div v-if="builder.state.error" class="rg-errorbox" role="alert">
              <span class="rg-errorbox__title"><RgIcon name="alert" small />{{ ERROR_TITLES[builder.state.error.code] ?? 'This report cannot run yet' }}</span>
              <span>{{ builder.state.error.message }}</span>
            </div>
          </div>
          <ResultGrid />
        </section>
      </main>
    </div>

    <RgDialog v-if="formula" :title="formula.uid ? 'Edit formula' : 'New formula'" :data-rg-theme="theme" @close="formula = null">
      <form id="rg-combined-formula" class="rg-publish" @submit.prevent="saveFormula">
        <label class="rg-publish__field" for="rg-combined-formula-label">
          <span>Column name</span>
          <input id="rg-combined-formula-label" v-model="formula.label" class="rg-input" maxlength="120" placeholder="Sales per visit" />
        </label>
        <label class="rg-publish__field" for="rg-combined-formula-text">
          <span>Formula</span>
          <textarea id="rg-combined-formula-text" v-model="formula.formula" class="rg-textarea rg-formula" placeholder="ROUND(sales / visits, 2)" required />
        </label>
        <div class="rg-publish__field">
          <span>Columns you can use</span>
          <div class="rg-token-list">
            <button v-for="a in aliases.filter((x) => x.uid !== formula.uid)" :key="a.as" type="button" class="rg-chip-toggle" :title="a.label" @click="insertName(a.as)">{{ a.as }}</button>
          </div>
          <small class="rg-faint">+ − * / %, comparisons, IF, ROUND, ABS, COALESCE, NULLIF, GREATEST, LEAST, SAFE_DIVIDE. Dividing by zero gives an empty cell.</small>
        </div>
      </form>
      <template #footer>
        <button type="button" class="rg-btn" @click="formula = null">Cancel</button>
        <button type="submit" form="rg-combined-formula" class="rg-btn rg-btn--primary" :disabled="!formula.formula?.trim()">{{ formula.uid ? 'Update' : 'Add' }}</button>
      </template>
    </RgDialog>

    <SaveDialog v-if="saving" :copy="saving.copy" @close="saving = null" @saved="onSaved" />
    <PublishDialog
      v-if="publishing"
      :uuid="draft.uuid"
      :name="draft.name"
      @close="publishing = false"
      @published="(s) => { draft.published = true; emit('published', s); }"
      @unpublished="(s) => { draft.published = false; emit('published', s); }"
    />
    <RgToaster :toasts="toasts" :data-rg-theme="theme" />
  </div>
</template>
