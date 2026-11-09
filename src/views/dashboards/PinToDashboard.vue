<script setup>
import { computed, inject, onMounted, reactive, ref } from 'vue';
import { useReportGenerator } from '../../context.js';
import RgDialog from '../../components/ui/RgDialog.vue';
import RgIcon from '../../components/ui/RgIcon.vue';
import DashboardWidget from './DashboardWidget.vue';
import WidgetForm from './WidgetForm.vue';

/**
 * "Pin to dashboard" from a saved report: pick how to show it (any widget
 * type), check it in a live preview, and add it to one of your dashboards
 * or a new one.
 */
const props = defineProps({
  report: { type: String, required: true },
  reportName: { type: String, default: '' },
});
const emit = defineEmits(['close', 'pinned', 'open-dashboard']);
const { api } = useReportGenerator();
const theme = inject('rg-theme', 'light');

const widget = reactive({ id: 'preview', type: 'bar', title: '', report: props.report, category: null, values: [], top: 10, size: 'md' });
const columns = reactive({ dims: [], nums: [], loading: true });
const dashboards = ref([]);
const target = ref('new');
const newName = ref(props.reportName ? `${props.reportName} dashboard` : 'New dashboard');
const state = reactive({ saving: false, error: null, done: null });

onMounted(async () => {
  try {
    const [view, list] = await Promise.all([api.reports.view(props.report), api.dashboards.list().catch(() => [])]);
    const fields = view.fields ?? [];
    columns.dims = fields.filter((f) => f.kind === 'dimension').map((f) => ({ as: f.as, label: f.label ?? f.as }));
    columns.nums = fields.filter((f) => f.kind !== 'dimension').map((f) => ({ as: f.as, label: f.label ?? f.as }));
    // A sensible start: the first column and number of the report.
    widget.category = columns.dims[0]?.as ?? null;
    widget.values = columns.nums[0] ? [columns.nums[0].as] : [];
    if (!widget.category) Object.assign(widget, { type: 'kpi', size: 'sm' });
    dashboards.value = list.filter((d) => d.is_owner);
    if (dashboards.value.length) target.value = dashboards.value[0].uuid;
  } catch (error) {
    state.error = error.message;
  } finally {
    columns.loading = false;
  }
});

const ready = computed(() => widget.type === 'table' || (widget.values.length > 0 && (widget.type === 'kpi' || !!widget.category)));
const previewKey = computed(() => JSON.stringify(widget));

function finalWidget() {
  const { id: _, ...w } = widget;
  if (!w.title?.trim()) w.title = w.values.map((a) => columns.nums.find((n) => n.as === a)?.label ?? a).join(', ') || props.reportName || 'Widget';
  return w;
}

async function pin() {
  state.saving = true;
  state.error = null;
  try {
    const dashboard = target.value === 'new'
      ? await api.dashboards.create({ name: newName.value.trim() || 'New dashboard', layout: { widgets: [{ id: 'w1', ...finalWidget() }] } })
      : await api.dashboards.pin(target.value, finalWidget());
    state.done = dashboard;
    emit('pinned', dashboard);
  } catch (error) {
    state.error = error.message;
  } finally {
    state.saving = false;
  }
}
</script>

<template>
  <RgDialog :title="state.done ? 'Pinned' : `Pin “${reportName}” to a dashboard`" class="rg-widget-dialog" :data-rg-theme="theme" @close="emit('close')">
    <div v-if="state.done" class="rg-pin__done">
      <span class="rg-empty__icon"><RgIcon name="check" /></span>
      <p>Added to <b>{{ state.done.name }}</b>.</p>
    </div>
    <form v-else id="rg-pin-form" class="rg-publish" @submit.prevent="ready && pin()">
      <WidgetForm :widget="widget" :columns="columns" id-prefix="rg-pin" />
      <div v-if="ready" class="rg-widget-dialog__preview">
        <span class="rg-faint">Preview</span>
        <DashboardWidget :widget="{ ...widget, size: 'full' }" :load="() => api.dashboards.preview(widget)" :version="previewKey" />
      </div>
      <div class="rg-publish__field rg-pin__target">
        <span>Add to</span>
        <select id="rg-pin-target" v-model="target" class="rg-input">
          <option v-for="d in dashboards" :key="d.uuid" :value="d.uuid">{{ d.name }} ({{ d.widgets_count }} widgets)</option>
          <option value="new">A new dashboard…</option>
        </select>
        <input v-if="target === 'new'" id="rg-pin-name" v-model="newName" class="rg-input" maxlength="255" aria-label="New dashboard name" />
      </div>
      <p v-if="state.error" class="rg-publish__error" role="alert">{{ state.error }}</p>
    </form>
    <template #footer>
      <template v-if="state.done">
        <button type="button" class="rg-btn" @click="emit('close')">Close</button>
        <button type="button" class="rg-btn rg-btn--primary" @click="emit('open-dashboard', state.done.uuid)"><RgIcon name="view" small /> Open dashboard</button>
      </template>
      <template v-else>
        <button type="button" class="rg-btn" @click="emit('close')">Cancel</button>
        <button type="submit" form="rg-pin-form" class="rg-btn rg-btn--primary" :disabled="!ready || state.saving">
          <RgIcon name="plus" small /> {{ state.saving ? 'Pinning…' : 'Pin' }}
        </button>
      </template>
    </template>
  </RgDialog>
</template>
