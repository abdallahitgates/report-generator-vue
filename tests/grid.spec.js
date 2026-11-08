import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, defineComponent, h, provide, reactive } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import ResultGrid from '../src/views/builder/ResultGrid.vue';
import { REPORT_BUILDER_KEY } from '../src/composables/useReportBuilder.js';
import { ReportViewer, createReportGenerator } from '../src/index.js';

const COLUMNS = [
  { alias: 'rep', label: 'Rep', type: 'string', kind: 'dimension' },
  { alias: 'visits', label: 'Visits', type: 'integer', kind: 'measure', total: 'sum' },
  { alias: 'amount', label: 'Amount', type: 'decimal', kind: 'measure', format: '#,##0.00', total: 'sum' },
];
const ROWS = Array.from({ length: 250 }, (_, i) => ({ rep: `rep-${i}`, visits: i + 1, amount: i % 3 === 0 ? -(i * 1.5) : i * 1.5 }));

function host(overrides = {}) {
  const state = reactive({ draft: { rows: [{ as: 'rep', label: 'Rep', kind: 'dimension' }], values: [{ as: 'visits' }, { as: 'amount' }], sort: [] }, runSeq: 1, running: false, error: null });
  const builder = {
    state,
    grouped: computed(() => false),
    runnable: computed(() => true),
    fetchRows: vi.fn(async ({ offset = 0, size = 200 }) => ({
      columns: COLUMNS, rows: ROWS.slice(offset, offset + size), page: { has_more: offset + size < ROWS.length },
    })),
    toggleSort: vi.fn(),
    fetchSummary: vi.fn(async () => ({ rows: 250, totals: { visits: 31375, amount: 1234.5 }, duration_ms: 3 })),
    exportReport: vi.fn(async () => {}),
    gridKey: 'test',
    ...overrides,
  };
  const Host = defineComponent({ setup() { provide(REPORT_BUILDER_KEY, builder); return () => h(ResultGrid); } });
  return { builder, wrapper: mount(Host, { attachTo: document.body }) };
}

beforeEach(() => {
  try { window.localStorage.clear(); } catch { /* ignore */ }
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn(async () => {}) }, configurable: true });
});
afterEach(() => { document.body.innerHTML = ''; });

describe('Results grid', () => {
  it('shows grand totals and the row count of the whole report', async () => {
    const { wrapper } = host();
    await flushPromises();
    expect(wrapper.find('tfoot').text()).toContain('31,375');
    expect(wrapper.find('tfoot').text()).toContain('1,234.50');
    expect(wrapper.find('.rg-gridfoot').text()).toContain('250 rows');
    expect(wrapper.findAll('td.rg-cell--negative').length).toBeGreaterThan(0);
  });

  it('adds up the selected cells and copies them for Excel', async () => {
    const { wrapper } = host();
    await flushPromises();
    const cells = () => wrapper.findAll('tbody tr.rg-row');
    await cells()[0].findAll('td')[1].trigger('mousedown', { button: 0 });
    await cells()[2].findAll('td')[1].trigger('mousedown', { button: 0, shiftKey: true });
    document.dispatchEvent(new MouseEvent('mouseup'));
    await flushPromises();

    const stats = wrapper.find('.rg-gridfoot__stats').text();
    expect(stats).toContain('Sum 6');
    expect(stats).toContain('Average 2');
    expect(stats).toContain('Max 3');
    expect(wrapper.findAll('td.rg-cell--selected')).toHaveLength(3);

    await wrapper.find('.rg-grid-wrap').trigger('keydown', { key: 'ArrowRight', shiftKey: true });
    expect(wrapper.findAll('td.rg-cell--selected')).toHaveLength(6);
    await wrapper.find('.rg-grid-wrap').trigger('keydown', { key: 'c', ctrlKey: true });
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('1\t0\n2\t1.5\n3\t3');
  });

  it('hides and reorders columns and remembers it', async () => {
    const { wrapper } = host();
    await flushPromises();
    await wrapper.find('.rg-gridbar button').trigger('click');
    const boxes = document.querySelectorAll('.rg-colchooser input[type="checkbox"]');
    expect(boxes).toHaveLength(3);
    boxes[2].click();
    await flushPromises();
    expect(wrapper.findAll('thead th').map((t) => t.text())).toEqual(['Rep', 'Visits']);

    document.querySelector('[aria-label="Move Visits up"]').click();
    await flushPromises();
    expect(wrapper.findAll('thead th').map((t) => t.text())).toEqual(['Visits', 'Rep']);
    expect(JSON.parse(window.localStorage.getItem('rg-grid:test')).hidden).toEqual(['amount']);
  });

  it('pages through the report with the total page count', async () => {
    const { wrapper, builder } = host();
    await flushPromises();
    const pages = wrapper.findAll('.rg-segmented button').find((b) => b.text() === 'Pages');
    await pages.trigger('click');
    await flushPromises();
    expect(wrapper.find('.rg-pager').text()).toContain('of 3');
    expect(wrapper.findAll('tbody tr.rg-row')).toHaveLength(100);

    await wrapper.find('[aria-label="Next page"]').trigger('click');
    await flushPromises();
    expect(builder.fetchRows).toHaveBeenLastCalledWith(expect.objectContaining({ offset: 100, size: 100, fresh: true }));
    expect(wrapper.find('tbody tr.rg-row td').text()).toBe('rep-100');

    await wrapper.find('[aria-label="Last page"]').trigger('click');
    await flushPromises();
    expect(wrapper.findAll('tbody tr.rg-row')).toHaveLength(50);
  });

  it('exports through the host', async () => {
    const { wrapper, builder } = host();
    await flushPromises();
    const excel = wrapper.findAll('.rg-gridbar button').find((b) => b.text().includes('Excel'));
    await excel.trigger('click');
    await flushPromises();
    expect(builder.exportReport).toHaveBeenCalledWith('xlsx');
  });
});

describe('Report viewer filters', () => {
  it('offers the structure pickers the server fills and sends the choices', async () => {
    const p = createReportGenerator({ http: { get: vi.fn(), post: vi.fn() } });
    const run = vi.fn(async () => ({ columns: COLUMNS, rows: ROWS.slice(0, 3), page: { has_more: false }, meta: {} }));
    Object.assign(p.api.reports, {
      view: vi.fn(async () => ({ uuid: 'r1', name: 'R', context: {}, parameters: [], fields: [{ as: 'rep', kind: 'dimension' }, { as: 'visits', kind: 'value' }], sort: [], grouped: false, rows: [] })),
      run,
      summary: vi.fn(async () => ({ rows: 3, totals: {} })),
    });
    p.api.contextOptions = vi.fn(async (kind) => (kind === 'lines' ? [{ id: 1, label: 'North' }, { id: 2, label: 'South' }] : kind === 'employees' ? [{ id: 9, label: 'Ali' }] : []));
    const wrapper = mount(ReportViewer, { props: { reportId: 'r1' }, global: { plugins: [p] }, attachTo: document.body });
    await flushPromises();

    const labels = wrapper.findAll('.rg-viewer__filter > span').map((s) => s.text());
    expect(labels).toContain('Lines');
    expect(labels).toContain('Employees');
    expect(labels).not.toContain('Divisions');

    await wrapper.find('[aria-label="Lines: All my lines"]').trigger('click');
    await flushPromises();
    document.querySelector('.rg-multi__list input').click();
    await flushPromises();
    [...document.querySelectorAll('.rg-multi__pop button')].find((b) => b.textContent.trim() === 'Done').click();
    await flushPromises();
    expect(run.mock.calls.at(-1)[1].context).toEqual({ lines: [1] });
  });
});
