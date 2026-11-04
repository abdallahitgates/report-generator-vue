<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useReportGenerator } from '../../context.js';
import { createToasts } from '../../composables/useToasts.js';
import { timeAgo } from '../../utils/format.js';
import RgIcon from '../../components/ui/RgIcon.vue';
import RgToaster from '../../components/ui/RgToaster.vue';
import RgDialog from '../../components/ui/RgDialog.vue';

/** Saved reports: mine, shared with me, everything I can open. Emits open(uuid) and create(). */
const props = defineProps({ theme: { type: String, default: 'light' } });
const emit = defineEmits(['open', 'create']);
const { api } = useReportGenerator();
const toasts = createToasts();

const scope = ref('all');
const search = ref('');
const folder = ref(null);
const reports = ref([]);
const folders = ref([]);
const loading = ref(true);
const confirmDelete = ref(null);

const SCOPES = [['all', 'All'], ['mine', 'Mine'], ['shared', 'Shared with me']];

let timer = null;
async function load() {
  loading.value = true;
  try {
    const result = await api.reports.list({ scope: scope.value, search: search.value || undefined, folder: folder.value || undefined });
    reports.value = result.data;
    if (!folder.value) folders.value = result.folders;
  } catch (error) {
    toasts.error(error);
  } finally {
    loading.value = false;
  }
}

watch([scope, folder], load);
watch(search, () => {
  clearTimeout(timer);
  timer = setTimeout(load, 250);
});
onMounted(load);

async function duplicate(report) {
  try {
    const copy = await api.reports.duplicate(report.uuid);
    toasts.success(`Created "${copy.name}".`);
    emit('open', copy.uuid);
  } catch (error) {
    toasts.error(error);
  }
}

async function remove(report) {
  confirmDelete.value = null;
  try {
    await api.reports.remove(report.uuid);
    reports.value = reports.value.filter((r) => r.uuid !== report.uuid);
    toasts.success(`Deleted "${report.name}".`);
  } catch (error) {
    toasts.error(error);
  }
}

const empty = computed(() => !loading.value && !reports.value.length);
</script>

<template>
  <div class="rg-root rg-library" :data-rg-theme="theme">
    <header class="rg-topbar">
      <div class="rg-topbar__title">
        <h1>Reports</h1>
        <div class="rg-topbar__meta"><span>Build a report from any connected data, save it, and share it.</span></div>
      </div>
      <div class="rg-topbar__actions">
        <button type="button" class="rg-btn rg-btn--primary" @click="emit('create')"><RgIcon name="plus" small /> New report</button>
      </div>
    </header>

    <div class="rg-library__filters">
      <div class="rg-tabs" role="tablist">
        <button
          v-for="[value, label] in SCOPES"
          :key="value"
          type="button"
          role="tab"
          class="rg-tab"
          :aria-selected="scope === value ? 'true' : 'false'"
          @click="scope = value"
        >{{ label }}</button>
      </div>
      <label class="rg-search" style="width: 260px">
        <span class="rg-sr-only">Search reports</span>
        <RgIcon name="search" />
        <input id="rg-library-search" v-model="search" class="rg-input" type="search" placeholder="Search reports" autocomplete="off" />
      </label>
      <div v-if="folders.length" class="rg-tabs" aria-label="Folders">
        <button type="button" class="rg-tab" :aria-selected="!folder ? 'true' : 'false'" @click="folder = null">All folders</button>
        <button v-for="f in folders" :key="f" type="button" class="rg-tab" :aria-selected="folder === f ? 'true' : 'false'" @click="folder = f">
          <RgIcon name="folder" small /> {{ f }}
        </button>
      </div>
    </div>

    <div class="rg-library__list">
      <div v-if="loading" class="rg-skeleton-list"><div v-for="n in 5" :key="n" class="rg-skeleton" style="height: 44px" /></div>

      <div v-else-if="empty" class="rg-empty">
        <div class="rg-empty__icon"><RgIcon name="table" /></div>
        <h2>{{ search || folder ? 'No report matches' : scope === 'shared' ? 'Nothing shared with you yet' : 'No reports yet' }}</h2>
        <p>{{ search || folder ? 'Try another search or folder.' : 'Start one: pick what it is about, then drag in the fields you need.' }}</p>
        <button v-if="!search && !folder" type="button" class="rg-btn rg-btn--primary" @click="emit('create')"><RgIcon name="plus" small /> New report</button>
      </div>

      <template v-else>
      <article v-for="report in reports" :key="report.uuid" class="rg-report-row">
        <div class="rg-report-row__title">
          <button type="button" @click="emit('open', report.uuid)">{{ report.name }}</button>
          <div class="rg-report-row__meta">
            <span v-if="report.folder"><RgIcon name="folder" small /> {{ report.folder }}</span>
            <span>{{ report.fields_count }} fields</span>
            <span>Updated {{ timeAgo(report.updated_at) }}</span>
            <span v-if="report.description" class="rg-faint" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 420px">{{ report.description }}</span>
          </div>
        </div>
        <div style="display: flex; gap: 6px; align-items: center">
          <span v-if="report.visibility === 'public'" class="rg-badge rg-badge--info"><RgIcon name="globe" small /> Everyone</span>
          <span v-else-if="report.shared" class="rg-badge rg-badge--info"><RgIcon name="users" small /> Shared</span>
          <span v-if="!report.is_owner" class="rg-badge">{{ report.can_edit ? 'Can edit' : 'View only' }}</span>
        </div>
        <div class="rg-report-row__actions">
          <button type="button" class="rg-btn rg-btn--sm rg-btn--ghost" @click="duplicate(report)"><RgIcon name="copy" small /> Duplicate</button>
          <button v-if="report.is_owner" type="button" class="rg-btn rg-btn--sm rg-btn--ghost rg-btn--danger" :aria-label="`Delete ${report.name}`" @click="confirmDelete = report">
            <RgIcon name="trash" small />
          </button>
        </div>
      </article>
      </template>
    </div>

    <RgDialog v-if="confirmDelete" :title="`Delete “${confirmDelete.name}”?`" :data-rg-theme="theme" @close="confirmDelete = null">
      <p style="margin: 0">People it is shared with will lose it too. This cannot be undone from here.</p>
      <template #footer>
        <button type="button" class="rg-btn" @click="confirmDelete = null">Keep it</button>
        <button type="button" class="rg-btn rg-btn--danger" @click="remove(confirmDelete)">Delete</button>
      </template>
    </RgDialog>
    <RgToaster :toasts="toasts" :data-rg-theme="theme" />
  </div>
</template>
