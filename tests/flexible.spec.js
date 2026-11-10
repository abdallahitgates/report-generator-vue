import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import ExportMenu from '../src/components/ui/ExportMenu.vue';
import { prefillWidget, widgetColumns, widgetProblem } from '../src/views/dashboards/widgetTypes.js';

describe('Export menu', () => {
  it('exports Excel or CSV and shows progress', async () => {
    let finish;
    const run = vi.fn(() => new Promise((r) => { finish = r; }));
    const wrapper = mount(ExportMenu, { props: { run }, attachTo: document.body });
    await wrapper.find('button').trigger('click');
    await wrapper.findAll('.rg-export__item')[0].trigger('click');
    expect(run).toHaveBeenCalledWith('xlsx');
    expect(wrapper.find('button').text()).toContain('Exporting Excel');
    finish();
    await flushPromises();
    expect(wrapper.find('button').text()).toContain('Export');
  });
});

describe('Widget columns', () => {
  it('always offers the number of rows, plus numeric columns of detail reports', () => {
    const cols = widgetColumns([
      { as: 'rep', label: 'Rep', kind: 'dimension', type: 'string' },
      { as: 'minutes', label: 'Minutes', kind: 'dimension', type: 'integer' },
      { as: 'last', label: 'Last visit', kind: 'value', type: 'date' },
    ]);
    expect(cols.nums.map((n) => n.as)).toEqual(['minutes', '__count']);
    expect(cols.dims[0].as).toBe('rep');

    const widget = prefillWidget({ type: 'bar', report: 'r1', values: [], category: null }, cols);
    expect(widget).toMatchObject({ values: ['minutes'], category: 'rep' });
    expect(widgetProblem(widget)).toBeNull();
    expect(widgetProblem({ type: 'bar', report: 'r1', values: ['x'] })).toBe('Pick the column to chart by.');
    expect(widgetProblem({ type: 'kpi' })).toBe('Pick a report.');
  });
});

describe('Library for people who cannot build reports', () => {
  it('explains where their reports are instead of showing an error', async () => {
    const { createReportGenerator, ReportLibrary, ReportGeneratorApiError } = await import('../src/index.js');
    const plugin = createReportGenerator({ http: { get: vi.fn(), post: vi.fn() } });
    plugin.api.reports.list = vi.fn(async () => { throw new ReportGeneratorApiError('You do not have permission', { status: 403 }); });
    plugin.api.dashboards.list = vi.fn(async () => []);
    const wrapper = mount(ReportLibrary, { global: { plugins: [plugin] }, attachTo: document.body });
    await flushPromises();
    expect(wrapper.text()).toContain('Reports are shared with you through the menu');
    expect(wrapper.text()).not.toContain('New report');
    expect(document.body.textContent).not.toContain('You do not have permission');
    wrapper.unmount();
  });
});
