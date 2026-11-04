import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ModelStudio, createReportGenerator } from '../src/index.js';
import { createModelStudio } from '../src/composables/useModelStudio.js';
import { createToasts } from '../src/composables/useToasts.js';
import { formatCount, timeAgo } from '../src/utils/format.js';

const status = (over = {}) => ({
  scanned: true,
  latest_scan: { id: 1, connection: 'mysql', driver: 'mysql', tables_count: 2, scanned_at: new Date().toISOString() },
  last_structure_changes: null,
  current_version: null,
  unpublished_changes: true,
  counts: { datasets: 2, visible_datasets: 2, missing_datasets: 0, pending_relationships: 1 },
  ...over,
});

const datasets = () => [
  { id: 1, key: 'users', label: 'Users', source_type: 'table', source_name: 'users', row_estimate: 2000, is_hidden: false, missing: false, fields_count: 3, visible_fields_count: 1, pending_relationships_count: 1 },
  { id: 2, key: 'visits', label: 'Visits', source_type: 'table', source_name: 'visits', row_estimate: 51234567, is_hidden: false, missing: false, fields_count: 2, visible_fields_count: 2, pending_relationships_count: 1 },
];

const relationship = { id: 7, from: { id: 2, key: 'visits', label: 'Visits' }, from_column: 'user_id', to: { id: 1, key: 'users', label: 'Users' }, to_column: 'id', cardinality: 'many_to_one', join_type: 'left', origin: 'convention', confidence: 0.7, status: 'pending', label: null };

const usersDetail = () => ({
  id: 1, key: 'users', label: 'Users', source_type: 'table', source_name: 'users', primary_key: 'id', default_time_field: null,
  row_estimate: 2000, is_hidden: false, missing: false, soft_delete_column: 'deleted_at', polymorphic: [],
  fields: [
    { id: 11, dataset_id: 1, key: 'id', column: 'id', label: 'ID', type: 'integer', role: 'key', aggregations: [], format: null, is_hidden: true, is_sensitive: false, is_indexed: true, hidden_reason: 'key', missing: false },
    { id: 12, dataset_id: 1, key: 'name', column: 'name', label: 'Name', type: 'string', role: 'dimension', aggregations: [], format: null, is_hidden: false, is_sensitive: false, is_indexed: false, hidden_reason: null, missing: false },
    { id: 13, dataset_id: 1, key: 'password', column: 'password', label: 'Password', type: 'string', role: 'dimension', aggregations: [], format: null, is_hidden: true, is_sensitive: true, is_indexed: false, hidden_reason: 'sensitive', missing: false },
  ],
  relationships: [relationship],
});

function fakeApi(overrides = {}) {
  return {
    model: {
      status: vi.fn(async () => status()),
      datasets: vi.fn(async () => datasets()),
      dataset: vi.fn(async () => usersDetail()),
      scan: vi.fn(async () => ({ summary: { datasets_added: 2, fields_added: 5, relationships_added: 1, duration_ms: 40 }, status: status() })),
      updateDataset: vi.fn(async (id, patch) => ({ ...usersDetail(), ...patch })),
      updateField: vi.fn(async (id, patch) => ({ ...usersDetail().fields.find((f) => f.id === id), ...patch })),
      relationships: vi.fn(async () => [relationship]),
      updateRelationship: vi.fn(async (id, patch) => ({ ...relationship, ...patch })),
      bulkRelationships: vi.fn(async (ids) => ({ updated: ids.length })),
      createRelationship: vi.fn(),
      deleteRelationship: vi.fn(),
      publish: vi.fn(async () => ({ data: { version: 1, datasets_count: 2, relationships_count: 1 }, status: status({ unpublished_changes: false }) })),
      ...overrides,
    },
  };
}

function mountStudio(api) {
  const plugin = createReportGenerator({ http: { get: vi.fn(), post: vi.fn() } });
  plugin.api.model = api.model;
  return mount(ModelStudio, { global: { plugins: [plugin] }, attachTo: document.body });
}

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('Model Studio', () => {
  it('invites a first scan when nothing has been scanned', async () => {
    const api = fakeApi({ status: vi.fn(async () => ({ ...status(), scanned: false })), datasets: vi.fn(async () => []) });
    const wrapper = mountStudio(api);
    await flushPromises();

    expect(wrapper.text()).toContain('Scan your database to start');
    await wrapper.find('.rg-empty .rg-btn--primary').trigger('click');
    expect(api.model.scan).toHaveBeenCalled();
  });

  it('lists datasets, opens the first one and shows the review notice', async () => {
    const wrapper = mountStudio(fakeApi());
    await flushPromises();

    const items = wrapper.findAll('.rg-list__item');
    expect(items).toHaveLength(2);
    expect(items[1].text()).toContain('51.2M');
    expect(wrapper.find('#rg-dataset-label').element.value).toBe('Users');
    expect(wrapper.text()).toContain('1 relationship');
    expect(wrapper.text()).toContain('Unpublished changes');
  });

  it('filters datasets by search', async () => {
    const wrapper = mountStudio(fakeApi());
    await flushPromises();

    await wrapper.find('#rg-dataset-search').setValue('visit');
    expect(wrapper.findAll('.rg-list__item')).toHaveLength(1);
  });

  it('asks before showing a sensitive column', async () => {
    const api = fakeApi();
    const wrapper = mountStudio(api);
    await flushPromises();

    const passwordRow = wrapper.findAll('tbody tr').find((tr) => tr.text().includes('password'));
    await passwordRow.find('.rg-switch').trigger('click');
    expect(api.model.updateField).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('Show a sensitive column?');

    const showAnyway = [...document.querySelectorAll('.rg-dialog button')].find((b) => b.textContent.includes('Show anyway'));
    showAnyway.click();
    await flushPromises();
    expect(api.model.updateField).toHaveBeenCalledWith(13, { is_hidden: false, confirm_sensitive: true });
  });

  it('saves a renamed field on blur', async () => {
    const api = fakeApi();
    const wrapper = mountStudio(api);
    await flushPromises();

    const input = wrapper.find('#rg-field-label-12');
    await input.setValue('Full name');
    await input.trigger('blur');
    await flushPromises();
    expect(api.model.updateField).toHaveBeenCalledWith(12, { label: 'Full name' });
  });

  it('does not allow a text field to become a date', async () => {
    const wrapper = mountStudio(fakeApi());
    await flushPromises();

    const nameRow = wrapper.findAll('tbody tr').find((tr) => tr.text().includes('name'));
    const dateButton = nameRow.findAll('.rg-segmented button').find((b) => b.text() === 'Date');
    expect(dateButton.attributes('disabled')).toBeDefined();
  });

  it('confirms relationships in bulk from the review queue', async () => {
    const api = fakeApi();
    const wrapper = mountStudio(api);
    await flushPromises();

    await wrapper.find('.rg-notice .rg-btn').trigger('click');
    await flushPromises();
    expect(wrapper.text()).toContain('Relationships to review');

    await wrapper.find('.rg-review-group .rg-btn').trigger('click');
    const confirm = wrapper.findAll('.rg-panel__controls .rg-btn').find((b) => b.text().includes('Confirm'));
    await confirm.trigger('click');
    await flushPromises();

    expect(api.model.bulkRelationships).toHaveBeenCalledWith([7], 'confirmed');
    expect(wrapper.text()).toContain('All reviewed');
  });

  it('publishes with notes', async () => {
    const api = fakeApi();
    const wrapper = mountStudio(api);
    await flushPromises();

    await wrapper.find('.rg-topbar__actions .rg-btn--primary').trigger('click');
    const textarea = document.querySelector('#rg-publish-notes');
    textarea.value = 'First model';
    textarea.dispatchEvent(new Event('input'));
    [...document.querySelectorAll('.rg-dialog button')].find((b) => b.textContent.includes('Publish version 1')).click();
    await flushPromises();

    expect(api.model.publish).toHaveBeenCalledWith('First model');
  });
});

describe('createModelStudio', () => {
  it('shows a toast and keeps the old value when a save fails', async () => {
    const toasts = createToasts();
    const api = fakeApi({ updateField: vi.fn(async () => { throw new Error('Label is required.'); }) });
    const studio = createModelStudio(api, toasts);
    const field = { id: 1, label: 'Old' };

    await expect(studio.updateField(field, { label: '' })).rejects.toThrow();
    expect(field.label).toBe('Old');
    expect(toasts.items[0]).toMatchObject({ kind: 'error', message: 'Label is required.' });
  });
});

describe('format helpers', () => {
  it('formats counts compactly and unknowns as a dash', () => {
    expect(formatCount(null)).toBe('—');
    expect(formatCount(950)).toBe('950');
    expect(formatCount(51234567)).toBe('51.2M');
  });

  it('describes times relative to now', () => {
    const now = Date.parse('2026-11-04T12:00:00Z');
    expect(timeAgo('2026-11-04T11:55:00Z', now)).toBe('5 minutes ago');
    expect(timeAgo('2026-11-04T12:00:00Z', now)).toBe('just now');
  });
});
