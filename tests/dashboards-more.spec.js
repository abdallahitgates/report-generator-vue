import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { DashboardEditor, DashboardView, PinToDashboard, createReportGenerator } from '../src/index.js';

const col = (alias, label, type = 'integer', kind = 'measure') => ({ alias, label, type, kind });
const parts = { columns: [col('sp', 'Speciality', 'string', 'dimension'), col('visits', 'Visits')], rows: [['Cardio', 40], ['GP', 30], ['Ortho', 15], ['Derm', 8], ['ENT', 4], ['Neuro', 2], ['Pedia', 1]].map(([sp, visits]) => ({ sp, visits })) };
const months = { columns: [col('month', 'Month', 'date', 'dimension'), col('visits', 'Visits')], rows: [{ month: '2026-01-01', visits: 3 }, { month: '2026-02-01', visits: 5 }] };
const W = [
  { id: 'c', type: 'column', title: 'Column', report: 'r1', category: 'sp', values: ['visits'], size: 'md', can_view: true },
  { id: 'p', type: 'pie', title: 'Pie', report: 'r1', category: 'sp', values: ['visits'], top: 6, size: 'md', can_view: true },
  { id: 'd', type: 'donut', title: 'Donut', report: 'r1', category: 'sp', values: ['visits'], top: 6, size: 'md', can_view: true },
  { id: 'a', type: 'area', title: 'Area', report: 'r1', category: 'month', values: ['visits'], size: 'md', can_view: true },
  { id: 'x', type: 'kpi', title: 'Locked', report: 'r2', report_name: 'Sales secrets', values: ['v'], size: 'sm', can_view: false },
];

function plugin() {
  const p = createReportGenerator({ http: { get: vi.fn(), post: vi.fn() } });
  p.api.dashboards = {
    get: vi.fn(async () => ({ uuid: 'd1', name: 'Board', can_edit: true, layout: { context: {}, widgets: W } })),
    widget: vi.fn(async (uuid, id) => ({ type: W.find((w) => w.id === id).type, ...(id === 'a' ? months : parts) })),
    preview: vi.fn(async (w) => ({ type: w.type, ...(['line', 'area'].includes(w.type) ? months : parts) })),
    list: vi.fn(async () => [{ uuid: 'd1', name: 'Board', widgets_count: 5, is_owner: true }, { uuid: 'd2', name: 'Not mine', widgets_count: 1, is_owner: false }]),
    pin: vi.fn(async (uuid, widget) => ({ uuid, name: 'Board' })),
    create: vi.fn(async (payload) => ({ uuid: 'd9', name: payload.name })),
  };
  p.api.contextOptions = vi.fn(async () => []);
  Object.assign(p.api.reports, {
    list: vi.fn(async () => ({ data: [{ uuid: 'r1', name: 'Visits' }] })),
    view: vi.fn(async () => ({ fields: [{ as: 'sp', label: 'Speciality', kind: 'dimension' }, { as: 'visits', label: 'Visits', kind: 'value' }] })),
  });
  return p;
}

afterEach(() => { document.body.innerHTML = ''; });

describe('More widget types', () => {
  it('draws columns, pies, donuts and areas, and locks widgets without report access', async () => {
    const p = plugin();
    const wrapper = mount(DashboardView, { props: { dashboardId: 'd1' }, global: { plugins: [p] }, attachTo: document.body });
    await flushPromises();

    expect(wrapper.findAll('.rg-column__fill')).toHaveLength(7);
    // Six slices and "Other" for the rest.
    const pie = wrapper.findAll('.rg-widget--pie .rg-pie__slice');
    expect(pie).toHaveLength(7);
    expect(wrapper.find('.rg-widget--pie .rg-pie__legend').text()).toContain('Other (1)');
    expect(wrapper.find('.rg-widget--pie .rg-pie__centre').exists()).toBe(false);
    expect(wrapper.find('.rg-widget--donut .rg-pie__total').text()).toBe('100');
    expect(wrapper.find('.rg-widget--area .rg-line__area').attributes('style') ?? '').not.toContain('display: none');

    expect(wrapper.find('.rg-widget--kpi .rg-widget__locked').text()).toContain('Sales secrets');
    expect(p.api.dashboards.widget).not.toHaveBeenCalledWith('d1', 'x', expect.anything());
  });

  it('switches a widget to another type from its card', async () => {
    const p = plugin();
    const wrapper = mount(DashboardEditor, { props: { dashboardId: 'd1' }, global: { plugins: [p] }, attachTo: document.body });
    await flushPromises();
    const select = wrapper.find('#rg-type-c');
    expect(select.findAll('option').find((o) => o.text() === 'KPI').attributes('disabled')).toBeUndefined();
    await select.setValue('donut');
    await flushPromises();
    expect(wrapper.find('.rg-widget--donut .rg-pie__total').exists()).toBe(true);
    expect(p.api.dashboards.preview).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'c', type: 'donut', top: 6 }), { context: {} });
  });
});

describe('Pin to dashboard', () => {
  it('pins a chart of the report to one of my dashboards', async () => {
    const p = plugin();
    const wrapper = mount(PinToDashboard, { props: { report: 'r1', reportName: 'Visits' }, global: { plugins: [p] }, attachTo: document.body });
    await flushPromises();

    // Starts as a bar of the report's first column and number, previewed live.
    expect(p.api.dashboards.preview).toHaveBeenCalledWith(expect.objectContaining({ type: 'bar', category: 'sp', values: ['visits'], report: 'r1' }));
    const options = [...document.querySelectorAll('#rg-pin-target option')].map((o) => o.textContent.trim());
    expect(options).toEqual(['Board (5 widgets)', 'A new dashboard…']);

    [...document.querySelectorAll('.rg-widget-type')].find((b) => b.textContent.includes('Pie')).click();
    await flushPromises();
    document.querySelector('#rg-pin-form').dispatchEvent(new Event('submit'));
    await flushPromises();

    expect(p.api.dashboards.pin).toHaveBeenCalledWith('d1', expect.objectContaining({ type: 'pie', category: 'sp', values: ['visits'], title: 'Visits', report: 'r1' }));
    expect(document.body.textContent).toContain('Added to Board');
    [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Open dashboard')).click();
    expect(wrapper.emitted('open-dashboard')[0]).toEqual(['d1']);
  });

  it('can start a new dashboard with the pinned widget', async () => {
    const p = plugin();
    mount(PinToDashboard, { props: { report: 'r1', reportName: 'Visits' }, global: { plugins: [p] }, attachTo: document.body });
    await flushPromises();
    const target = document.querySelector('#rg-pin-target');
    target.value = 'new';
    target.dispatchEvent(new Event('change'));
    await flushPromises();
    document.querySelector('#rg-pin-form').dispatchEvent(new Event('submit'));
    await flushPromises();
    const payload = p.api.dashboards.create.mock.calls[0][0];
    expect(payload.name).toBe('Visits dashboard');
    expect(payload.layout.widgets).toEqual([expect.objectContaining({ id: 'w1', type: 'bar', report: 'r1' })]);
  });
});
