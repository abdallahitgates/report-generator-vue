import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ReportBuilder, createReportGenerator } from '../src/index.js';

const reports = [
  { key: 'visit_statistics', label: 'Visit statistics', description: 'Plans and visits', group: 'Visits', levels: ['employee', 'division'] },
  { key: 'vacations', label: 'Vacation statistics', description: null, group: 'Vacations', levels: ['employee'] },
];
const fields = {
  visit_statistics: [{ key: 'total_actual', label: 'Total Actual', type: 'integer', total: 'sum' }, { key: 'coverage', label: 'Coverage', type: 'percent', total: null }],
  vacations: [{ key: 'total_days', label: 'Total Days', type: 'integer', total: 'sum' }],
};

function setup({ report = null } = {}) {
  const p = createReportGenerator({ http: { get: vi.fn(), post: vi.fn() } });
  const rows = vi.fn(async () => ({
    columns: [{ alias: 'employee', label: 'Employee', type: 'string', kind: 'dimension' }, { alias: 'total_actual', label: 'Visits', type: 'integer', kind: 'measure', total: 'sum' }],
    rows: [{ employee: 'Ali', total_actual: 12 }], page: { has_more: false }, meta: { mode: 'combined', duration_ms: 5 },
  }));
  p.api.combine = { reports: vi.fn(async () => reports), fields: vi.fn(async (key) => fields[key]) };
  Object.assign(p.api.query, { rows, summary: vi.fn(async () => ({ rows: 1, totals: { total_actual: 12 } })), catalog: vi.fn(async () => ({ datasets: [{ key: 'visits', label: 'Visits', fields_count: 3 }] })) });
  Object.assign(p.api.reports, {
    get: vi.fn(async () => report),
    list: vi.fn(async () => ({ data: [], folders: [] })),
    create: vi.fn(async (payload) => ({ uuid: 'new-1', name: payload.name, visibility: 'private', can_edit: true, can_publish: true, published: false })),
    update: vi.fn(async (uuid, payload) => ({ uuid, name: payload.name, visibility: 'private', can_edit: true, can_publish: true, published: false })),
  });
  p.api.contextOptions = vi.fn(async () => [{ id: 1, label: 'North' }]);
  const wrapper = mount(ReportBuilder, { props: { reportId: report?.uuid ?? null }, global: { plugins: [p] }, attachTo: document.body });
  return { wrapper, api: p.api, rows };
}

afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers(); });

describe('Combined reports', () => {
  it('starts from the report type choice and builds columns from existing reports', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { wrapper, api, rows } = setup();
    await flushPromises();

    const card = wrapper.find('.rg-root-card--combine');
    expect(card.exists()).toBe(true);
    await card.trigger('click');
    await flushPromises();

    expect(wrapper.find('.rg-combined').exists()).toBe(true);
    expect(wrapper.findAll('.rg-catalog__group h3').map((h) => h.text())).toEqual(['Visits', 'Vacations']);

    await wrapper.findAll('.rg-catalog__head')[0].trigger('click');
    await flushPromises();
    expect(api.combine.fields).toHaveBeenCalledWith('visit_statistics', { level: 'employee', period: 'this_month', lines: [] });
    await wrapper.findAll('.rg-catalog__fields input')[0].setValue(true);
    await flushPromises();
    vi.advanceTimersByTime(500);
    await flushPromises();

    const chips = () => wrapper.findAll('.rg-combined__chip .rg-linkish').map((b) => b.text());
    expect(chips()).toEqual(['Line', 'Employee', 'Total Actual (Visit statistics)']);
    const definition = rows.mock.calls.at(-1)[0];
    expect(definition).toMatchObject({ type: 'combined', level: 'employee', context: { period: 'this_month' } });
    expect(definition.fields.at(-1)).toEqual({ report: 'visit_statistics', field: 'total_actual', as: 'total_actual', label: 'Total Actual (Visit statistics)' });
    expect(wrapper.find('.rg-grid').text()).toContain('Ali');

    // A report that has no rows per division cannot be opened at that level.
    await wrapper.findAll('.rg-combined__settings .rg-segmented button')[1].trigger('click');
    await flushPromises();
    expect(wrapper.findAll('.rg-catalog__head')[1].attributes('disabled')).toBeDefined();
  });

  it('adds a formula, renames a column and saves', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const report = { uuid: 'r9', name: 'Visits and vacations', can_edit: true, can_publish: true, definition: {
      type: 'combined', level: 'employee', context: { period: 'last_month' },
      fields: [{ base: 'employee', as: 'employee' }, { report: 'visit_statistics', field: 'total_actual', as: 'visits', label: 'Visits' }, { report: 'vacations', field: 'total_days', as: 'vacation_days', label: 'Vacation days' }],
    } };
    const { wrapper, api } = setup({ report });
    await flushPromises();
    expect(wrapper.find('.rg-combined').exists()).toBe(true);
    expect(wrapper.find('#rg-combined-period').element.value).toBe('last_month');

    const formulaButton = wrapper.findAll('.rg-combined__columns > button').find((b) => b.text().includes('Formula'));
    await formulaButton.trigger('click');
    await flushPromises();
    document.querySelector('#rg-combined-formula-label').value = 'Visits per day';
    document.querySelector('#rg-combined-formula-label').dispatchEvent(new Event('input'));
    document.querySelector('#rg-combined-formula-text').value = 'visits / 20';
    document.querySelector('#rg-combined-formula-text').dispatchEvent(new Event('input'));
    document.querySelector('#rg-combined-formula').dispatchEvent(new Event('submit'));
    await flushPromises();

    await wrapper.findAll('.rg-combined__chip .rg-linkish')[1].trigger('click');
    const rename = wrapper.find('.rg-combined__rename');
    await rename.setValue('Actual visits');
    await rename.trigger('keydown', { key: 'Enter' });

    const saveButton = wrapper.findAll('.rg-topbar__actions button').find((b) => b.text().includes('Save') && !b.text().includes('copy'));
    await saveButton.trigger('click');
    await flushPromises();
    document.querySelector('#rg-save-form').dispatchEvent(new Event('submit'));
    await flushPromises();

    // r9 can be edited, so it is updated in place.
    expect(api.reports.update).toHaveBeenCalledTimes(1);
    const [uuid, sent] = api.reports.update.mock.calls[0];
    expect(uuid).toBe('r9');
    expect(sent.definition.context).toEqual({ period: 'last_month' });
    expect(sent.definition.fields.map((f) => f.label ?? f.as)).toEqual(['employee', 'Actual visits', 'Vacation days', 'Visits per day']);
    expect(sent.definition.fields.at(-1)).toEqual({ formula: 'visits / 20', as: 'visits_per_day', label: 'Visits per day' });
  });
});
