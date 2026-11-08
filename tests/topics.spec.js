import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { TopicsBrowser, createReportGenerator } from '../src/index.js';

const field = (key, label, over = {}) => ({ key, label, type: 'string', role: 'dimension', aggregations: [], format: null, description: null, options: null, hidden: false, ...over });

const topics = () => ({
  model_version: 9,
  groups: [
    {
      name: 'Visits',
      topics: [{
        key: 'actual_visits', label: 'Actual Visits', group: 'Visits', description: 'Visits reps made', table: 'actual_visits',
        class: 'App\\Reporting\\Topics\\ActualVisitsTopic', permission: null, public: false, fields_count: 2,
        filters: { period: true, line: true, division: true, employee: true },
        columns: { period: 'visit_date', line: 'line_id', division: 'div_id', employee: 'user_id' },
        fields: [
          field('__rows', 'Number of visits', { type: 'integer', role: 'measure', aggregations: ['count'] }),
          field('visit_date', 'Visit date', { type: 'date', role: 'time' }),
          field('status', 'Status', { options: { done: 'Done', missed: 'Missed' } }),
          field('account_id', 'Account ID', { type: 'integer', role: 'key', hidden: true }),
        ],
        relations: [{ name: 'employee', label: 'Employee', type: 'belongsTo', topic: 'users', topic_label: 'Users', foreign_key: 'user_id' }],
      }],
    },
    {
      name: 'Users',
      topics: [{
        key: 'users', label: 'Users', group: 'Users', description: null, table: 'users', class: 'App\\Reporting\\Topics\\UsersTopic',
        permission: 'reports.users', public: false, fields_count: 1,
        filters: { period: false, line: false, division: false, employee: true },
        columns: { period: null, line: null, division: null, employee: 'id' },
        fields: [field('__rows', 'Number of users', { type: 'integer', role: 'measure', aggregations: ['count'] }), field('name', 'Name')],
        relations: [],
      }],
    },
  ],
});

function mountBrowser(api, props = {}) {
  const plugin = createReportGenerator({ http: { get: vi.fn(), post: vi.fn() } });
  plugin.api.topics = api;
  return mount(TopicsBrowser, { props, global: { plugins: [plugin] }, attachTo: document.body });
}

afterEach(() => { document.body.innerHTML = ''; });

describe('Topics browser', () => {
  it('shows a tab per group and the first topic with its filters, fields and relations', async () => {
    const wrapper = mountBrowser(vi.fn(async () => topics()));
    await flushPromises();

    const tabs = wrapper.findAll('[role="tab"]');
    expect(tabs.map((t) => t.text())).toEqual(['Visits1', 'Users1']);
    expect(tabs[0].attributes('aria-selected')).toBe('true');

    expect(wrapper.find('.rg-topic__title').text()).toBe('Actual Visits');
    expect(wrapper.findAll('.rg-topic__filters li:not(.is-off)')).toHaveLength(4);
    expect(wrapper.find('.rg-topic__filters').text()).toContain('div_id');

    // The id column stays hidden until asked for.
    const rows = () => wrapper.findAll('.rg-topic__field').map((r) => r.find('b').text());
    expect(rows()).toEqual(['Number of visits', 'Visit date', 'Status']);
    await wrapper.find('.rg-topic__fields').element.closest('.rg-card').querySelector('input[type="checkbox"]').click();
    await flushPromises();
    expect(rows()).toContain('Account ID');
    expect(wrapper.text()).toContain('2 values');
  });

  it('follows a relation to the topic it leads to, switching tabs', async () => {
    const wrapper = mountBrowser(vi.fn(async () => topics()));
    await flushPromises();

    await wrapper.find('.rg-topic__relation').trigger('click');
    await flushPromises();

    expect(wrapper.find('.rg-topic__title').text()).toBe('Users');
    expect(wrapper.findAll('[role="tab"]')[1].attributes('aria-selected')).toBe('true');
    expect(wrapper.text()).toContain('reports.users');
    expect(wrapper.emitted('select').map((e) => e[0])).toEqual(['actual_visits', 'users']);
  });

  it('searches topics and fields across tabs', async () => {
    const wrapper = mountBrowser(vi.fn(async () => topics()));
    await flushPromises();

    await wrapper.find('input[type="search"]').setValue('name');
    expect(wrapper.findAll('.rg-list__item').map((i) => i.find('.rg-list__label').text())).toEqual(['Users']);
  });

  it('opens the topic it is given and explains an empty or failing list', async () => {
    const opened = mountBrowser(vi.fn(async () => topics()), { initialTopic: 'users' });
    await flushPromises();
    expect(opened.find('.rg-topic__title').text()).toBe('Users');

    const empty = mountBrowser(vi.fn(async () => ({ model_version: 1, groups: [] })));
    await flushPromises();
    expect(empty.text()).toContain('No topics yet');

    const failing = mountBrowser(vi.fn(async () => { throw new Error('Forbidden'); }));
    await flushPromises();
    expect(failing.text()).toContain('Topics could not be loaded');
    expect(failing.text()).toContain('Forbidden');
  });
});
