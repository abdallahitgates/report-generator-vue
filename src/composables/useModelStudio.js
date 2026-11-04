import { computed, reactive } from 'vue';

/**
 * State and actions for Model Studio. One instance per studio, created by
 * the root component and handed to children through provide/inject.
 *
 * Field and dataset edits are saved immediately (no "save" button): each
 * change is one PATCH, and the row shows its own saving state.
 */
export function createModelStudio(api, toasts) {
  const state = reactive({
    status: null,
    datasets: [],
    loading: true,
    selectedId: null,
    detail: null,
    loadingDetail: false,
    view: 'dataset', // dataset | review
    filter: 'all', // all | review | hidden | missing
    search: '',
    scanning: false,
    publishing: false,
    lastScan: null,
    pending: [],
    loadingPending: false,
    saving: {}, // "field:12" -> 'saving' | 'saved'
  });

  const filtered = computed(() => {
    const term = state.search.trim().toLowerCase();
    return state.datasets.filter((d) => {
      if (term && !d.label.toLowerCase().includes(term) && !d.source_name.toLowerCase().includes(term)) return false;
      switch (state.filter) {
        case 'review': return d.pending_relationships_count > 0;
        case 'hidden': return d.is_hidden && !d.missing;
        case 'missing': return d.missing;
        default: return !d.missing;
      }
    });
  });

  const counts = computed(() => ({
    all: state.datasets.filter((d) => !d.missing).length,
    review: state.datasets.filter((d) => d.pending_relationships_count > 0).length,
    hidden: state.datasets.filter((d) => d.is_hidden && !d.missing).length,
    missing: state.datasets.filter((d) => d.missing).length,
  }));

  const datasetsById = computed(() => Object.fromEntries(state.datasets.map((d) => [d.id, d])));

  async function guard(action, { success } = {}) {
    try {
      const result = await action();
      if (success) toasts.success(typeof success === 'function' ? success(result) : success);
      return result;
    } catch (error) {
      toasts.error(error);
      throw error;
    }
  }

  async function init() {
    state.loading = true;
    try {
      const [status, datasets] = await Promise.all([api.model.status(), api.model.datasets()]);
      state.status = status;
      state.datasets = datasets;
      const first = filtered.value[0];
      if (first && !state.selectedId) await select(first.id);
    } catch (error) {
      toasts.error(error);
    } finally {
      state.loading = false;
    }
  }

  async function refreshStatus() {
    try {
      state.status = await api.model.status();
    } catch (error) {
      toasts.error(error);
    }
  }

  async function refreshDatasets() {
    try {
      state.datasets = await api.model.datasets();
    } catch (error) {
      toasts.error(error);
    }
  }

  let statusTimer = null;
  /** Edits come in bursts (typing, toggling rows); refresh the header once they settle. */
  function refreshSoon() {
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      refreshStatus();
      refreshDatasets();
    }, 500);
  }

  async function select(id) {
    state.view = 'dataset';
    state.selectedId = id;
    state.loadingDetail = true;
    try {
      const detail = await api.model.dataset(id);
      if (state.selectedId === id) state.detail = detail;
    } catch (error) {
      toasts.error(error);
    } finally {
      if (state.selectedId === id) state.loadingDetail = false;
    }
  }

  async function scan() {
    state.scanning = true;
    try {
      const { summary, status } = await guard(() => api.model.scan(), {
        success: ({ summary: s }) => s.datasets_added || s.fields_added || s.relationships_added
          ? `Scan finished: ${s.datasets_added} new datasets, ${s.fields_added} new fields, ${s.relationships_added} new relationships.`
          : `Scan finished in ${s.duration_ms} ms. Nothing new.`,
      });
      state.lastScan = summary;
      state.status = status;
      await refreshDatasets();
      if (state.selectedId) await select(state.selectedId);
      else if (filtered.value[0]) await select(filtered.value[0].id);
    } catch {
      // toast already shown
    } finally {
      state.scanning = false;
    }
  }

  async function publish(notes) {
    state.publishing = true;
    try {
      const { data, status } = await guard(() => api.model.publish(notes || null), {
        success: ({ data: v }) => `Published version ${v.version}: ${v.datasets_count} datasets, ${v.relationships_count} relationships.`,
      });
      state.status = status;
      return data;
    } finally {
      state.publishing = false;
    }
  }

  async function updateDataset(patch) {
    const id = state.detail.id;
    const updated = await guard(() => api.model.updateDataset(id, patch));
    if (state.detail?.id === id) Object.assign(state.detail, updated);
    const row = datasetsById.value[id];
    if (row) Object.assign(row, { label: updated.label, is_hidden: updated.is_hidden });
    refreshSoon();
  }

  async function updateField(field, patch) {
    const key = `field:${field.id}`;
    state.saving[key] = 'saving';
    try {
      const updated = await guard(() => api.model.updateField(field.id, patch));
      Object.assign(field, updated);
      state.saving[key] = 'saved';
      setTimeout(() => { if (state.saving[key] === 'saved') delete state.saving[key]; }, 1500);
      refreshSoon();
      return updated;
    } catch (error) {
      delete state.saving[key];
      throw error;
    }
  }

  function replaceRelationship(updated) {
    for (const list of [state.detail?.relationships, state.pending]) {
      const index = list?.findIndex((r) => r.id === updated.id) ?? -1;
      if (index !== -1) list.splice(index, 1, updated);
    }
  }

  async function updateRelationship(relationship, patch) {
    const updated = await guard(() => api.model.updateRelationship(relationship.id, patch));
    replaceRelationship(updated);
    refreshSoon();
  }

  async function createRelationship(data) {
    const created = await guard(() => api.model.createRelationship(data), { success: 'Relationship added.' });
    state.detail?.relationships.unshift(created);
    refreshSoon();
    return created;
  }

  async function deleteRelationship(relationship) {
    await guard(() => api.model.deleteRelationship(relationship.id), { success: 'Relationship removed.' });
    if (state.detail) state.detail.relationships = state.detail.relationships.filter((r) => r.id !== relationship.id);
    refreshSoon();
  }

  async function openReview() {
    state.view = 'review';
    state.loadingPending = true;
    try {
      state.pending = await api.model.relationships('pending');
    } catch (error) {
      toasts.error(error);
    } finally {
      state.loadingPending = false;
    }
  }

  async function bulkReview(ids, status) {
    await guard(() => api.model.bulkRelationships(ids, status), {
      success: `${ids.length} ${ids.length === 1 ? 'relationship' : 'relationships'} ${status}.`,
    });
    state.pending = state.pending.filter((r) => !ids.includes(r.id));
    refreshSoon();
  }

  async function loadDataset(id) {
    return api.model.dataset(id);
  }

  return {
    state,
    filtered,
    counts,
    datasetsById,
    init,
    select,
    scan,
    publish,
    updateDataset,
    updateField,
    updateRelationship,
    createRelationship,
    deleteRelationship,
    openReview,
    bulkReview,
    loadDataset,
    refreshStatus,
  };
}

export const MODEL_STUDIO_KEY = Symbol('rg-model-studio');
