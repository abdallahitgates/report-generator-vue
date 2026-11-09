import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { PublishDialog, ReportViewer, createReportGenerator } from '../src/index.js';

function plugin(overrides) {
  const p = createReportGenerator({ http: { get: vi.fn(), post: vi.fn() } });
  Object.assign(p.api.reports, overrides.reports ?? {});
  if (overrides.roles) p.api.roles = overrides.roles;
  return p;
}

afterEach(() => { document.body.innerHTML = ''; });

describe('Publish dialog', () => {
  it('suggests the permission, picks roles and publishes', async () => {
    const publish = vi.fn(async (uuid, payload) => ({ published: true, ...payload }));
    const p = plugin({
      reports: { publishing: vi.fn(async () => ({ published: false, permission: null, suggested_permission: 'show_reports_visits', roles: [], in_menu: false, menu_group: null })), publish },
      roles: vi.fn(async () => [{ id: '8', name: 'Medical Rep' }, { id: '7', name: 'District Manager' }]),
    });
    const wrapper = mount(PublishDialog, { props: { uuid: 'r1', name: 'Visits' }, global: { plugins: [p] }, attachTo: document.body });
    await flushPromises();

    const input = document.querySelector('#rg-publish-permission');
    expect(input.value).toBe('show_reports_visits');
    const roles = [...document.querySelectorAll('.rg-publish__role')];
    expect(roles.map((r) => r.textContent.trim())).toEqual(['Medical Rep', 'District Manager']);
    roles[0].click();
    await flushPromises();
    expect(roles[0].getAttribute('aria-pressed')).toBe('true');

    document.querySelector('#rg-publish-group').value = 'Visits';
    document.querySelector('#rg-publish-group').dispatchEvent(new Event('input'));
    document.querySelector('#rg-publish-form').dispatchEvent(new Event('submit'));
    await flushPromises();

    expect(publish).toHaveBeenCalledWith('r1', { permission: 'show_reports_visits', roles: ['Medical Rep'], inMenu: true, menuGroup: 'Visits' });
    expect(wrapper.emitted('published')).toHaveLength(1);
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('shows server validation next to the field and can unpublish', async () => {
    const error = Object.assign(new Error('invalid'), { errors: { permission: ['Another report already uses this permission.'] } });
    const unpublish = vi.fn(async () => ({ published: false }));
    const p = plugin({
      reports: {
        publishing: vi.fn(async () => ({ published: true, permission: 'show_reports_x', suggested_permission: 'show_reports_x', roles: ['Medical Rep'], in_menu: true, menu_group: null })),
        publish: vi.fn(async () => { throw error; }),
        unpublish,
      },
      roles: vi.fn(async () => [{ id: '8', name: 'Medical Rep' }]),
    });
    const wrapper = mount(PublishDialog, { props: { uuid: 'r1', name: 'X' }, global: { plugins: [p] }, attachTo: document.body });
    await flushPromises();

    document.querySelector('#rg-publish-form').dispatchEvent(new Event('submit'));
    await flushPromises();
    expect(document.body.textContent).toContain('Another report already uses this permission.');

    [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Unpublish').click();
    await flushPromises();
    expect(unpublish).toHaveBeenCalledWith('r1');
    expect(wrapper.emitted('unpublished')).toHaveLength(1);
  });
});

describe('Report viewer', () => {
  const view = () => ({
    uuid: 'r1', name: 'Visits per rep', description: 'Monthly', can_edit: false, root: 'visits',
    context: { period: 'this_month' }, parameters: [],
    fields: [{ as: 'rep', kind: 'dimension' }, { as: 'visits', kind: 'value' }], sort: [], grouped: false, rows: [], subtotals: false,
  });
  const result = () => ({ columns: [{ alias: 'rep', label: 'Rep', kind: 'dimension', type: 'string' }, { alias: 'visits', label: 'Visits', kind: 'measure', type: 'integer' }], rows: [{ rep: 'Ali', visits: 3 }, { rep: 'Mona', visits: 1 }], page: { has_more: false }, meta: { duration_ms: 12 } });

  it('runs the report with the saved period, then the one the viewer picks', async () => {
    const run = vi.fn(async () => result());
    const p = plugin({ reports: { view: vi.fn(async () => view()), run } });
    const wrapper = mount(ReportViewer, { props: { reportId: 'r1' }, global: { plugins: [p] }, attachTo: document.body });
    await flushPromises();

    expect(wrapper.find('h1').text()).toBe('Visits per rep');
    expect(run).toHaveBeenCalledWith('r1', expect.objectContaining({ context: { period: 'this_month' } }));
    expect(wrapper.findAll('tbody tr').map((r) => r.text())).toEqual(['Ali3', 'Mona1']);
    expect(wrapper.find('.rg-statusbar').text()).toContain('2 rows');

    await wrapper.find('#rg-viewer-period').setValue('last_year');
    await flushPromises();
    expect(run).toHaveBeenLastCalledWith('r1', expect.objectContaining({ context: { period: 'last_year' } }));

    await wrapper.find('#rg-viewer-period').setValue('');
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(run.mock.calls.at(-1)[1].context).toBeUndefined();

    await wrapper.findAll('th .rg-th__sort')[1].trigger('click');
    await flushPromises();
    expect(run.mock.calls.at(-1)[1].sort).toEqual([{ field: 'visits', dir: 'asc' }]);
    expect(wrapper.text()).not.toContain('Edit');
  });

  it('explains when the report cannot be opened', async () => {
    const p = plugin({ reports: { view: vi.fn(async () => { throw Object.assign(new Error('You do not have access to this report.'), { status: 403 }); }) } });
    const wrapper = mount(ReportViewer, { props: { reportId: 'r1' }, global: { plugins: [p] }, attachTo: document.body });
    await flushPromises();
    expect(wrapper.text()).toContain('You cannot open this report');
  });
});
