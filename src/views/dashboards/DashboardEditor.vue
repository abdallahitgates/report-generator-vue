<script setup>
import { computed, onMounted, provide, reactive, ref } from 'vue';
import { useReportGenerator } from '../../context.js';
import { createToasts } from '../../composables/useToasts.js';
import RgIcon from '../../components/ui/RgIcon.vue';
import RgDialog from '../../components/ui/RgDialog.vue';
import RgToaster from '../../components/ui/RgToaster.vue';
import PublishDialog from '../builder/PublishDialog.vue';
import DashboardWidget from './DashboardWidget.vue';
import { PERIODS } from './periods.js';
import { createQueue } from '../../utils/queue.js';
import WidgetForm from './WidgetForm.vue';

/**
 * Builds a dashboard: starts from a report's suggested layout (or empty),
 * adds, edits, sizes and orders widgets with live data, saves and publishes.
 */
const props = defineProps({
  /** Saved dashboard to edit, or null for a new one. */
  dashboardId: { type: String, default: null },
  /** Report uuid to start a new dashboard from. */
  fromReport: { type: String, default: null },
  theme: { type: String, default: 'light' },
});
const emit = defineEmits(['saved', 'published', 'view']);

const { api } = useReportGenerator();
const toasts = createToasts();
provide('rg-theme', props.theme);
provide('rg-widget-queue', createQueue(3));

import { WIDGET_TYPES as TYPES, withType } from './widgetTypes.js';
const SIZES = [['sm', 'Small'], ['md', 'Half'], ['lg', 'Two thirds'], ['full', 'Full width']];

const state = reactive({ loading: true, saving: false, uuid: null, name: 'Untitled dashboard', visibility: 'private', canPublish: false, published: false, period: '', widgets: [] });
const version = ref(0);
const editing = ref(null); // a widget copy while the dialog is open
const reports = ref([]);
const columnsByReport = reactive({}); // uuid -> { dims, nums }
const dragging = ref(null);
const publishing = ref(false);
let seq = 0;
const nextId = () => `w${Date.now().toString(36)}${(++seq).toString(36)}`;

const context = () => (state.period ? { period: state.period } : {});
const loader = (widget) => () => api.dashboards.preview(widget, { context: context() });

async function columnsOf(uuid) {
  if (!uuid) return { dims: [], nums: [] };
  if (!columnsByReport[uuid]) {
    columnsByReport[uuid] = { dims: [], nums: [], loading: true };
    try {
      const view = await api.reports.view(uuid);
      const fields = view.fields ?? [];
      columnsByReport[uuid] = {
        dims: fields.filter((f) => f.kind === 'dimension').map((f) => ({ as: f.as, label: f.label ?? f.as })),
        nums: fields.filter((f) => f.kind !== 'dimension').map((f) => ({ as: f.as, label: f.label ?? f.as })),
      };
    } catch {
      columnsByReport[uuid] = { dims: [], nums: [] };
    }
  }
  return columnsByReport[uuid];
}

onMounted(async () => {
  try {
    api.reports.list().then((r) => (reports.value = r.data ?? [])).catch(() => {});
    if (props.dashboardId) {
      const d = await api.dashboards.get(props.dashboardId);
      Object.assign(state, {
        uuid: d.uuid, name: d.name, visibility: d.visibility, canPublish: d.can_publish, published: d.published,
        period: typeof d.layout?.context?.period === 'string' ? d.layout.context.period : '', widgets: d.layout.widgets ?? [],
      });
    } else if (props.fromReport) {
      const layout = await api.dashboards.generate(props.fromReport);
      Object.assign(state, { name: layout.name, period: typeof layout.context?.period === 'string' ? layout.context.period : '', widgets: layout.widgets });
    }
  } catch (error) {
    toasts.error(error);
  } finally {
    state.loading = false;
  }
});

function openWidget(widget = null) {
  const report = widget?.report ?? state.widgets[0]?.report ?? props.fromReport ?? reports.value[0]?.uuid ?? '';
  editing.value = widget
    ? { ...widget, values: [...(widget.values ?? [])] }
    : { id: null, type: 'kpi', title: '', report, category: null, values: [], top: 10, size: 'sm' };
  columnsOf(editing.value.report);
}

const editCols = computed(() => columnsByReport[editing.value?.report] ?? { dims: [], nums: [], loading: !!editing.value?.report });
const editReady = computed(() => {
  const w = editing.value;
  if (!w?.report) return false;
  if (w.type === 'table') return true;
  if (!w.values.length) return false;
  return w.type === 'kpi' || !!w.category;
});

/** Switch a widget's chart type from its card, keeping what fits. */
function switchType(widget, type) {
  state.widgets = state.widgets.map((w) => (w.id === widget.id ? withType(w, type) : w));
}

function saveWidget() {
  const w = { ...editing.value };
  const title = w.title?.trim();
  if (!title) {
    const nums = editCols.value.nums;
    w.title = w.values.map((a) => nums.find((n) => n.as === a)?.label ?? a).join(', ') || reports.value.find((r) => r.uuid === w.report)?.name || 'Widget';
  }
  w.report_name = reports.value.find((r) => r.uuid === w.report)?.name ?? w.report_name;
  if (w.id) state.widgets = state.widgets.map((x) => (x.id === w.id ? w : x));
  else state.widgets = [...state.widgets, { ...w, id: nextId() }];
  editing.value = null;
}

function remove(id) {
  state.widgets = state.widgets.filter((w) => w.id !== id);
}

function move(id, by) {
  const list = [...state.widgets];
  const from = list.findIndex((w) => w.id === id);
  const to = from + by;
  if (from === -1 || to < 0 || to >= list.length) return;
  list.splice(to, 0, list.splice(from, 1)[0]);
  state.widgets = list;
}

function resize(widget) {
  const order = SIZES.map(([s]) => s);
  const next = order[(order.indexOf(widget.size ?? 'md') + 1) % order.length];
  state.widgets = state.widgets.map((w) => (w.id === widget.id ? { ...w, size: next } : w));
}

function onDrop(target) {
  if (!dragging.value || dragging.value === target) return;
  const list = [...state.widgets];
  const from = list.findIndex((w) => w.id === dragging.value);
  const to = list.findIndex((w) => w.id === target);
  list.splice(to, 0, list.splice(from, 1)[0]);
  state.widgets = list;
  dragging.value = null;
}

async function save() {
  state.saving = true;
  const payload = {
    name: state.name.trim() || 'Untitled dashboard',
    visibility: state.visibility,
    layout: { context: context(), widgets: state.widgets.map(({ report_name: _, ...w }) => w) },
  };
  try {
    const saved = state.uuid ? await api.dashboards.update(state.uuid, payload) : await api.dashboards.create(payload);
    Object.assign(state, { uuid: saved.uuid, canPublish: saved.can_publish, published: saved.published });
    toasts.success(`Saved "${saved.name}".`);
    emit('saved', saved);
  } catch (error) {
    toasts.error(error);
  } finally {
    state.saving = false;
  }
}
</script>

<template>
  <div class="rg-root rg-dashboard rg-dashboard--editing" :data-rg-theme="theme">
    <header class="rg-topbar">
      <div class="rg-topbar__title">
        <label class="rg-sr-only" for="rg-dash-name">Dashboard name</label>
        <input id="rg-dash-name" v-model="state.name" class="rg-input rg-input--bare rg-name-input" maxlength="255" />
        <div class="rg-topbar__meta">
          <span>{{ state.widgets.length }} {{ state.widgets.length === 1 ? 'widget' : 'widgets' }}</span>
          <span v-if="state.published" class="rg-badge rg-badge--success"><RgIcon name="globe" small /> Published</span>
        </div>
      </div>
      <div class="rg-topbar__actions">
        <div class="rg-segmented" role="group" aria-label="Who can open it">
          <button type="button" :aria-pressed="state.visibility === 'private'" @click="state.visibility = 'private'">Only me</button>
          <button type="button" :aria-pressed="state.visibility === 'public'" @click="state.visibility = 'public'">Everyone</button>
        </div>
        <button v-if="state.uuid && state.canPublish" type="button" class="rg-btn" @click="publishing = true"><RgIcon name="globe" small /> {{ state.published ? 'Publishing' : 'Publish' }}</button>
        <button v-if="state.uuid" type="button" class="rg-btn" @click="emit('view', state.uuid)"><RgIcon name="eye" small /> View</button>
        <button type="button" class="rg-btn rg-btn--primary" :disabled="state.saving || !state.widgets.length" @click="save"><RgIcon name="save" small /> {{ state.saving ? 'Saving…' : 'Save' }}</button>
      </div>
    </header>

    <div class="rg-viewer__filters">
      <label class="rg-viewer__filter" for="rg-dash-edit-period">
        <span><RgIcon name="calendar" small /> Default period</span>
        <select id="rg-dash-edit-period" v-model="state.period" class="rg-input" @change="version++">
          <option value="">As saved in each report</option>
          <option v-for="[value, label] in PERIODS" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <button type="button" class="rg-btn rg-btn--primary" @click="openWidget()"><RgIcon name="plus" small /> Add widget</button>
    </div>

    <main class="rg-dashboard__body">
      <div v-if="state.loading" class="rg-dashboard__grid">
        <div v-for="n in 4" :key="n" class="rg-widget rg-widget--md"><div class="rg-widget__skeleton"><span v-for="m in 4" :key="m" class="rg-skeleton" /></div></div>
      </div>
      <div v-else-if="!state.widgets.length" class="rg-empty">
        <div class="rg-empty__icon"><RgIcon name="view" /></div>
        <h2>Add your first widget</h2>
        <p>Show a report's totals as headline numbers, its top items as bars, how it changes over time, or its first rows.</p>
        <button type="button" class="rg-btn rg-btn--primary" @click="openWidget()"><RgIcon name="plus" small /> Add widget</button>
      </div>
      <TransitionGroup v-else tag="div" name="rg-list-move" class="rg-dashboard__grid">
        <DashboardWidget
          v-for="(widget, i) in state.widgets"
          :key="widget.id"
          :widget="widget"
          :load="loader(widget)"
          :version="version"
          :class="{ 'is-dragging': dragging === widget.id }"
          draggable="true"
          @dragstart="dragging = widget.id"
          @dragend="dragging = null"
          @dragover.prevent
          @drop.prevent="onDrop(widget.id)"
        >
          <template #actions>
            <div class="rg-widget__tools">
              <label class="rg-sr-only" :for="`rg-type-${widget.id}`">Show {{ widget.title }} as</label>
              <select :id="`rg-type-${widget.id}`" class="rg-input rg-widget__type" :value="widget.type" title="Show as" @change="switchType(widget, $event.target.value)">
                <option v-for="t in TYPES" :key="t.value" :value="t.value" :disabled="!t.fits(widget)">{{ t.label }}</option>
              </select>
              <button type="button" class="rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm" :aria-label="`Edit ${widget.title}`" @click="openWidget(widget)"><RgIcon name="fx" small /></button>
              <button type="button" class="rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm" :aria-label="`Resize ${widget.title}`" :title="`Size: ${SIZES.find(([s]) => s === (widget.size ?? 'md'))?.[1]}`" @click="resize(widget)">{{ { sm: 'S', md: 'M', lg: 'L', full: 'Full' }[widget.size ?? 'md'] }}</button>
              <button type="button" class="rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm" :aria-label="`Move ${widget.title} earlier`" :disabled="i === 0" @click="move(widget.id, -1)">‹</button>
              <button type="button" class="rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm" :aria-label="`Move ${widget.title} later`" :disabled="i === state.widgets.length - 1" @click="move(widget.id, 1)">›</button>
              <button type="button" class="rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm" :aria-label="`Remove ${widget.title}`" @click="remove(widget.id)"><RgIcon name="trash" small /></button>
            </div>
          </template>
        </DashboardWidget>
      </TransitionGroup>
    </main>

    <RgDialog v-if="editing" :title="editing.id ? 'Edit widget' : 'Add widget'" class="rg-widget-dialog" :data-rg-theme="theme" @close="editing = null">
      <form id="rg-widget-form" class="rg-publish" @submit.prevent="editReady && saveWidget()">
        <WidgetForm :widget="editing" :reports="reports" :columns="editCols" @report="columnsOf" />
        <div v-if="editReady" class="rg-widget-dialog__preview">
          <span class="rg-faint">Preview</span>
          <DashboardWidget :widget="{ ...editing, size: 'full' }" :load="loader(editing)" :version="version" />
        </div>
      </form>
      <template #footer>
        <button type="button" class="rg-btn" @click="editing = null">Cancel</button>
        <button type="submit" form="rg-widget-form" class="rg-btn rg-btn--primary" :disabled="!editReady">{{ editing.id ? 'Update' : 'Add' }}</button>
      </template>
    </RgDialog>

    <PublishDialog
      v-if="publishing"
      kind="dashboard"
      :uuid="state.uuid"
      :name="state.name"
      @close="publishing = false"
      @published="(s) => { state.published = true; emit('published', s); }"
      @unpublished="(s) => { state.published = false; emit('published', s); }"
    />
    <RgToaster :toasts="toasts" :data-rg-theme="theme" />
  </div>
</template>
