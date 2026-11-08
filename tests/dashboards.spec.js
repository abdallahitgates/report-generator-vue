import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { DashboardEditor, DashboardView, ReportLibrary, createReportGenerator } from '../src/index.js';

const col = (alias, label, type = 'integer', kind = 'measure', extra = {}) => ({ alias, label, type, kind, ...extra });
const DATA = {
  kpi: { type: 'kpi', columns: [col('visits', 'Visits'), col('amount', 'Amount', 'decimal', 'measure', { format: '#,##0.00' })], rows: [{ visits: 1234, amount: 430.5 }] },
  bar: { type: 'bar', columns: [col('rep', 'Rep', 'string', 'dimension'), col('visits', 'Visits')], rows: [{ rep: 'Ali', visits: 30 }, { rep: 'Mona', visits: 12 }] },
  line: { type: 'line', columns: [col('month', 'Month', 'date', 'dimension'), col('visits', 'Visits')], rows: [{ month: '2026-01-01', visits: 3 }, { month: '2026-02-01', visits: 5 }, { month: '2026-03-01', visits: 4 }] },
  share: { type: 'share', columns: [col('sp', 'Speciality', 'string', 'dimension'), col('visits', 'Visits')], rows: [{ sp: 'Cardio', visits: 75 }, { sp: 'GP', visits: 25 }] },
  table: { type: 'table', columns: [col('rep', 'Rep', 'string', 'dimension'), col('visits', 'Visits')], rows: [{ rep: 'Ali', visits: 30 }] },
};
const WIDGETS = [
  { id: 'k', type: 'kpi', title: 'Headline', report: 'r1', values: ['visits', 'amount'], size: 'sm' },
  { id: 'b', type: 'bar', title: 'Top reps', report: 'r1', category: 'rep', values: ['visits'], size: 'md' },
  { id: 'l', type: 'line', title: 'Visits by month', report: 'r1', category: 'month', values: ['visits'], size: 'full' },
  { id: 's', type: 'share', title: 'Share', report: 'r1', category: 'sp', values: ['visits'], size: 'md' },
  { id: 't', type: 'table', title: 'Rows', report: 'r1', size: 'full' },
];

function plugin() {
  const p = createReportGenerator({ http: { get: vi.fn(), post: vi.fn() } });
  p.api.dashboards = {
    get: vi.fn(async () => ({ uuid: 'd1', name: 'Visits board', can_edit: true, layout: { context: { period: 'this_month' }, widgets: WIDGETS } })),
    widget: vi.fn(async (uuid, id) => DATA[WIDGETS.find((w) => w.id === id).type]),
    preview: vi.fn(async (widget) => DATA[widget.type]),
    generate: vi.fn(async () => ({ name: 'Visits dashboard', context: {}, widgets: WIDGETS.slice(0, 2) })),
    create: vi.fn(async (payload) => ({ uuid: 'd9', name: payload.name, can_publish: false, published: false })),
    list: vi.fn(async () => [{ uuid: 'd1', name: 'Visits board', widgets_count: 5, updated_at: new Date().toISOString(), is_owner: true, published: true }]),
  };
  p.api.contextOptions = vi.fn(async () => []);
  Object.assign(p.api.reports, {
    list: vi.fn(async () => ({ data: [{ uuid: 'r1', name: 'Visits per rep', fields_count: 3, updated_at: new Date().toISOString(), is_owner: true }], folders: [] })),
    view: vi.fn(async () => ({ fields: [{ as: 'rep', label: 'Rep', kind: 'dimension' }, { as: 'visits', label: 'Visits', kind: 'value' }] })),
  });
  return p;
}

afterEach(() => { document.body.innerHTML = ''; });

describe('Dashboards', () => {
  it('shows every widget with its own data and reloads them with the filters', async () => {
    const p = plugin();
    const wrapper = mount(DashboardView, { props: { dashboardId: 'd1' }, global: { plugins: [p] }, attachTo: document.body });
    await flushPromises();

    expect(wrapper.find('h1').text()).toBe('Visits board');
    expect(wrapper.findAll('.rg-widget')).toHaveLength(5);
    expect(p.api.dashboards.widget).toHaveBeenCalledWith('d1', 'k', { context: { period: 'this_month' } });

    expect(wrapper.findAll('.rg-kpi__label').map((l) => l.text())).toEqual(['Visits', 'Amount']);
    expect(wrapper.find('.rg-kpi__value').attributes('aria-label')).toBe('1,234');
    expect(wrapper.findAll('.rg-bar text.rg-chart__label').map((t) => t.text())).toEqual(['Ali', 'Mona']);
    expect(wrapper.find('.rg-line__path').attributes('d')).toMatch(/^M/);
    expect(wrapper.find('.rg-share__legend').text()).toContain('75%');
    expect(wrapper.find('.rg-widget--table tbody').text()).toContain('Ali');
    // Every chart's numbers are also in a table for screen readers.
    expect(wrapper.findAll('table.rg-sr-only')).toHaveLength(4);

    await wrapper.find('#rg-dash-period').setValue('last_year');
    await flushPromises();
    expect(p.api.dashboards.widget).toHaveBeenLastCalledWith('d1', 't', { context: { period: 'last_year' } });
  });

  it('starts from a report, adds a widget with a live preview and saves', async () => {
    const p = plugin();
    const wrapper = mount(DashboardEditor, { props: { fromReport: 'r1' }, global: { plugins: [p] }, attachTo: document.body });
    await flushPromises();

    expect(p.api.dashboards.generate).toHaveBeenCalledWith('r1');
    expect(wrapper.find('#rg-dash-name').element.value).toBe('Visits dashboard');
    expect(wrapper.findAll('.rg-widget')).toHaveLength(2);

    await wrapper.findAll('.rg-viewer__filters button').find((b) => b.text().includes('Add widget')).trigger('click');
    await flushPromises();
    [...document.querySelectorAll('.rg-widget-type')].find((b) => b.textContent.includes('Share')).click();
    await flushPromises();
    const category = document.querySelector('#rg-widget-category');
    category.value = 'rep';
    category.dispatchEvent(new Event('change'));
    [...document.querySelectorAll('.rg-publish__role')].find((b) => b.textContent.includes('Visits')).click();
    await flushPromises();
    expect(p.api.dashboards.preview).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'share', category: 'rep', values: ['visits'], report: 'r1' }), { context: {} });

    document.querySelector('#rg-widget-form').dispatchEvent(new Event('submit'));
    await flushPromises();
    expect(wrapper.findAll('.rg-widget')).toHaveLength(3);

    await wrapper.findAll('.rg-topbar__actions button').find((b) => b.text().includes('Save')).trigger('click');
    await flushPromises();
    const payload = p.api.dashboards.create.mock.calls[0][0];
    expect(payload.name).toBe('Visits dashboard');
    expect(payload.layout.widgets.map((w) => w.type)).toEqual(['kpi', 'bar', 'share']);
    expect(payload.layout.widgets[2]).toMatchObject({ title: 'Visits', size: 'md', top: 6 });
    expect(wrapper.emitted('saved')[0][0].uuid).toBe('d9');
  });

  it('lists dashboards in the library and starts one from a report', async () => {
    const p = plugin();
    const wrapper = mount(ReportLibrary, { global: { plugins: [p] }, attachTo: document.body });
    await flushPromises();

    await wrapper.findAll('.rg-report-row__actions button').find((b) => b.text().includes('Dashboard')).trigger('click');
    expect(wrapper.emitted('dashboard')[0]).toEqual(['r1']);

    await wrapper.findAll('[role="tab"]').find((t) => t.text() === 'Dashboards').trigger('click');
    await flushPromises();
    expect(wrapper.find('.rg-report-row').text()).toContain('Visits board');
    await wrapper.find('.rg-report-row__title button').trigger('click');
    expect(wrapper.emitted('open-dashboard')[0]).toEqual(['d1']);
  });
});
