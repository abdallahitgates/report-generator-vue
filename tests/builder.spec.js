import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ReportBuilder, ReportLibrary, ReportGeneratorApiError, createReportGenerator } from '../src/index.js';

const field = (key, label, type, role, aggregations = []) => ({ key, label, type, role, aggregations, format: null });

const catalog = {
  model_version: 1,
  root: 'visits',
  datasets: [
    { key: 'visits', label: 'Visits', row_estimate: 5000000, paths: [], fields: [
      field('__rows', 'Number of Visits', 'integer', 'measure', ['count']),
      field('amount', 'Amount', 'decimal', 'measure', ['sum', 'avg', 'min', 'max', 'count', 'count_distinct']),
      field('visit_date', 'Visit Date', 'date', 'time'),
      field('status', 'Status', 'string', 'dimension'),
    ] },
    { key: 'users', label: 'Users', row_estimate: 2000, paths: [{ path: [3], description: 'Visits → Users (user_id)', multiplies_rows: false }], fields: [
      field('name', 'Name', 'string', 'dimension'),
    ] },
    { key: 'lines', label: 'Lines', row_estimate: 20, paths: [
      { path: [3, 7], description: 'Visits → Users (user_id) → Lines (line_id)', multiplies_rows: false },
      { path: [4, 8], description: 'Visits → Doctors (doctor_id) → Lines (line_id)', multiplies_rows: false },
    ], fields: [field('name', 'Name', 'string', 'dimension')] },
  ],
};

function rowsResponse(definition, options = {}) {
  const fields = definition.fields;
  const columns = fields.map((f) => ({ alias: f.as, label: f.label, type: f.agg ? 'decimal' : f.grain ? 'date' : 'string', kind: f.agg || f.formula ? 'measure' : 'dimension', format: null }));
  const keys = options.groups?.keys ?? [];
  const level = keys.length;
  const groupAlias = options.groups?.columns?.[level];
  const row = Object.fromEntries(fields.map((f) => [f.as, f.agg ? 1234.5 : f.grain ? '2026-03-01' : `${f.as}-${level}`]));
  const visible = options.groups && level < options.groups.columns.length
    ? columns.filter((c) => c.kind === 'measure' || options.groups.columns.slice(0, level + 1).includes(c.alias))
    : columns;
  return {
    columns: visible,
    rows: [row, { ...row, [groupAlias ?? fields[0].as]: 'second' }],
    page: { offset: options.offset ?? 0, size: 200, has_more: false },
    meta: { mode: 'aggregate', duration_ms: 12, cached: false, estimated_rows: 1000, model_version: 1 },
  };
}

function fakeApi(over = {}) {
  return {
    query: {
      catalog: vi.fn(async (root) => (root ? catalog : { model_version: 1, datasets: [{ key: 'visits', label: 'Visits', row_estimate: 5000000, fields_count: 4 }] })),
      rows: vi.fn(async (definition, options) => rowsResponse(definition, options)),
      validate: vi.fn(async () => ({ mode: 'aggregate', columns: [] })),
      values: vi.fn(async () => ['done', 'missed']),
      cancel: vi.fn(async () => ({ cancelled: true })),
      ...over.query,
    },
    reports: {
      list: vi.fn(async () => ({ data: [], folders: ['Sales'] })),
      get: vi.fn(),
      create: vi.fn(async (payload) => ({ uuid: 'r1', name: payload.name, description: '', folder: payload.folder, visibility: payload.visibility, can_edit: true })),
      update: vi.fn(async (uuid, payload) => ({ uuid, name: payload.name, visibility: payload.visibility, can_edit: true })),
      duplicate: vi.fn(),
      remove: vi.fn(async () => null),
      ...over.reports,
    },
  };
}

function mountWith(component, api, props = {}) {
  const plugin = createReportGenerator({ http: { get: vi.fn(), post: vi.fn() } });
  Object.assign(plugin.api, api);
  return mount(component, { props, global: { plugins: [plugin] }, attachTo: document.body });
}

async function settle() {
  await flushPromises();
  vi.advanceTimersByTime(1000);
  await flushPromises();
}

async function startReport(api) {
  const wrapper = mountWith(ReportBuilder, api);
  await flushPromises();
  await wrapper.find('.rg-root-card').trigger('click');
  await flushPromises();
  return wrapper;
}

function addButton(wrapper, label, action = 'Add') {
  return wrapper.findAll('.rg-fld').find((li) => li.find('.rg-fld__label').text() === label).find(`[aria-label="${action} ${label}"]`);
}

function lastDefinition(api) {
  return api.query.rows.mock.calls.at(-1)[0];
}

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('Report builder', () => {
  it('starts by asking what the report is about', async () => {
    const api = fakeApi();
    const wrapper = await startReport(api);

    expect(api.query.catalog).toHaveBeenLastCalledWith('visits');
    expect(wrapper.text()).toContain('Report on Visits');
    expect(wrapper.findAll('.rg-ds')).toHaveLength(3);
  });

  it('adds dimensions to Rows and measures to Values, then runs', async () => {
    const api = fakeApi();
    const wrapper = await startReport(api);

    await addButton(wrapper, 'Status').trigger('click');
    await addButton(wrapper, 'Amount').trigger('click');
    await settle();

    expect(wrapper.findAll('.rg-shelf')[0].text()).toContain('Status');
    expect(wrapper.findAll('.rg-shelf')[1].text()).toContain('Sum of Amount');
    expect(lastDefinition(api).fields).toEqual([
      { ref: 'visits.status', as: 'status', label: 'Status' },
      { ref: 'visits.amount', as: 'sum_of_amount', label: 'Sum of Amount', agg: 'sum' },
    ]);
    expect(wrapper.find('.rg-grid').text()).toContain('1,234.50');
    expect(wrapper.find('.rg-statusbar').text()).toContain('12 ms');
  });

  it('asks which way to join when a dataset is reachable twice', async () => {
    const api = fakeApi();
    const wrapper = await startReport(api);
    await wrapper.findAll('.rg-ds__head')[2].trigger('click');

    await addButton(wrapper, 'Name').trigger('click');
    expect(document.body.textContent).toContain('How should Lines connect to this report?');

    [...document.querySelectorAll('.rg-path-option')][1].click();
    await settle();

    expect(lastDefinition(api).fields[0]).toMatchObject({ ref: 'lines.name', path: [4, 8], label: 'Lines Name' });
  });

  it('opens groups one level at a time', async () => {
    const api = fakeApi();
    const wrapper = await startReport(api);
    await addButton(wrapper, 'Status').trigger('click');
    await addButton(wrapper, 'Visit Date').trigger('click');
    await addButton(wrapper, 'Number of Visits').trigger('click');
    await settle();

    expect(api.query.rows.mock.calls.at(-1)[1].groups).toEqual({ columns: ['status', 'visit_date'], keys: [] });
    expect(wrapper.find('.rg-grid thead').text()).toContain('Status › Visit Date');

    await wrapper.find('.rg-tree__toggle').trigger('click');
    await flushPromises();

    expect(api.query.rows.mock.calls.at(-1)[1].groups).toEqual({ columns: ['status', 'visit_date'], keys: ['status-0'] });
    expect(wrapper.find('.rg-grid').text()).toContain('Mar 2026');
  });

  it('filters with values searched on the server', async () => {
    const api = fakeApi();
    const wrapper = await startReport(api);
    await addButton(wrapper, 'Amount').trigger('click');
    await addButton(wrapper, 'Status', 'Filter by').trigger('click');

    const row = wrapper.find('.rg-filter-row');
    expect(row.text()).toContain('Status');
    await row.find('select').setValue('in');
    const input = wrapper.find('.rg-tags input');
    await input.setValue('mi');
    vi.advanceTimersByTime(300);
    await flushPromises();
    expect(api.query.values).toHaveBeenCalledWith('visits.status', 'mi', 30);

    await wrapper.findAll('.rg-suggest button')[1].trigger('mousedown');
    await settle();

    expect(lastDefinition(api).filters).toEqual({ and: [{ field: 'visits.status', op: 'in', value: ['missed'] }] });
  });

  it('filters dates with presets by default', async () => {
    const api = fakeApi();
    const wrapper = await startReport(api);
    await addButton(wrapper, 'Amount').trigger('click');
    await addButton(wrapper, 'Visit Date', 'Filter by').trigger('click');
    await settle();

    expect(lastDefinition(api).filters).toEqual({ and: [{ field: 'visits.visit_date', op: 'between', value: 'this_month' }] });
  });

  it('shows engine errors with a way to fix ambiguous joins', async () => {
    let fail = true;
    const api = fakeApi({ query: { rows: vi.fn(async (definition, options) => {
      if (fail) {
        fail = false;
        throw new ReportGeneratorApiError('Lines can be reached in more than one way.', {
          status: 422, code: 'AMBIGUOUS_PATH', path: 'fields.0.ref',
          details: { options: [{ path: [3, 7], description: 'Via the rep', multiplies_rows: false }] },
        });
      }
      return rowsResponse(definition, options);
    }) } });
    const wrapper = await startReport(api);
    await addButton(wrapper, 'Status').trigger('click');
    await settle();

    expect(wrapper.find('.rg-errorbox').text()).toContain('Choose how to connect the tables');
    expect(wrapper.find('.rg-chip--error').exists()).toBe(true);

    await wrapper.find('.rg-errorbox__options button').trigger('click');
    await settle();

    expect(lastDefinition(api).fields[0].path).toEqual([3, 7]);
    expect(wrapper.find('.rg-errorbox').exists()).toBe(false);
  });

  it('changes the aggregation from the chip menu and keeps the label in step', async () => {
    const api = fakeApi();
    const wrapper = await startReport(api);
    await addButton(wrapper, 'Amount').trigger('click');

    await wrapper.find('.rg-chip').trigger('click');
    await wrapper.find('.rg-pop select').setValue('avg');
    await settle();

    expect(wrapper.find('.rg-chip').text()).toContain('Average of Amount');
    expect(lastDefinition(api).fields[0]).toMatchObject({ agg: 'avg', label: 'Average of Amount' });
  });

  it('undoes and redoes edits', async () => {
    const api = fakeApi();
    const wrapper = await startReport(api);
    await addButton(wrapper, 'Status').trigger('click');
    await settle();
    await addButton(wrapper, 'Amount').trigger('click');
    await settle();

    await wrapper.find('[aria-label="Undo"]').trigger('click');
    await flushPromises();
    expect(wrapper.findAll('.rg-chip')).toHaveLength(1);

    await wrapper.find('[aria-label="Redo"]').trigger('click');
    await flushPromises();
    expect(wrapper.findAll('.rg-chip')).toHaveLength(2);
  });

  it('saves a new report and reports it to the host', async () => {
    const api = fakeApi();
    const wrapper = await startReport(api);
    await addButton(wrapper, 'Amount').trigger('click');
    await settle();

    await wrapper.find('.rg-topbar__actions .rg-btn--primary').trigger('click');
    const name = document.querySelector('#rg-save-name');
    name.value = 'Amount this month';
    name.dispatchEvent(new Event('input'));
    document.querySelector('#rg-save-folder').value = 'Sales';
    document.querySelector('#rg-save-folder').dispatchEvent(new Event('input'));
    document.querySelector('#rg-save-form').dispatchEvent(new Event('submit'));
    await flushPromises();

    expect(api.reports.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Amount this month', folder: 'Sales', visibility: 'private',
      definition: expect.objectContaining({ root: 'visits' }),
    }));
    expect(wrapper.emitted('saved')[0][0].uuid).toBe('r1');
    expect(wrapper.text()).not.toContain('Unsaved changes');
  });

  it('opens a saved report and runs it', async () => {
    const api = fakeApi({ reports: { get: vi.fn(async () => ({
      uuid: 'r9', name: 'Visits by rep', visibility: 'public', can_edit: false,
      definition: { root: 'visits', fields: [{ ref: 'users.name', as: 'rep', label: 'Rep' }, { ref: 'visits.__rows', agg: 'count', as: 'visits', label: 'Visits' }] },
    })) } });
    const wrapper = mountWith(ReportBuilder, api, { reportId: 'r9' });
    await settle();

    expect(wrapper.find('#rg-report-name').element.value).toBe('Visits by rep');
    expect(wrapper.text()).toContain('View only');
    expect(api.query.rows).toHaveBeenCalled();
    expect(wrapper.find('.rg-grid').text()).toContain('rep-0');
  });

  it('checks a formula before adding it', async () => {
    const api = fakeApi({ query: { validate: vi.fn(async () => {
      throw new ReportGeneratorApiError('Formula "x": Unknown function SLEEP.', { status: 422, code: 'INVALID_FORMULA' });
    }) } });
    const wrapper = await startReport(api);
    await addButton(wrapper, 'Amount').trigger('click');

    await wrapper.findAll('.rg-shelf')[1].find('button.rg-btn').trigger('click');
    const label = document.querySelector('#rg-formula-label');
    label.value = 'Slow';
    label.dispatchEvent(new Event('input'));
    const text = document.querySelector('#rg-formula-text');
    text.value = 'SLEEP(10)';
    text.dispatchEvent(new Event('input'));
    await flushPromises();
    [...document.querySelectorAll('.rg-dialog button')].find((b) => b.textContent.includes('Add formula')).click();
    await flushPromises();

    expect(document.body.textContent).toContain('Unknown function SLEEP');
    expect(wrapper.findAll('.rg-chip')).toHaveLength(1);
  });
});

describe('Report library', () => {
  const reports = [
    { uuid: 'a', name: 'Visits by rep', folder: 'Field', fields_count: 3, is_owner: true, can_edit: true, visibility: 'private', shared: false, updated_at: new Date().toISOString() },
    { uuid: 'b', name: 'Sales by line', folder: null, fields_count: 2, is_owner: false, can_edit: false, visibility: 'public', shared: true, updated_at: new Date().toISOString() },
  ];

  it('lists reports, searches on the server and opens them', async () => {
    const api = fakeApi({ reports: { list: vi.fn(async () => ({ data: reports, folders: ['Field'] })) } });
    const wrapper = mountWith(ReportLibrary, api);
    await flushPromises();

    expect(wrapper.findAll('.rg-report-row')).toHaveLength(2);
    expect(wrapper.text()).toContain('View only');
    expect(wrapper.text()).toContain('Everyone');

    await wrapper.find('#rg-library-search').setValue('sales');
    vi.advanceTimersByTime(300);
    await flushPromises();
    expect(api.reports.list).toHaveBeenLastCalledWith({ scope: 'all', search: 'sales', folder: undefined });

    await wrapper.find('.rg-report-row__title button').trigger('click');
    expect(wrapper.emitted('open')[0]).toEqual(['a']);
  });

  it('deletes only after confirming, and only your own', async () => {
    const api = fakeApi({ reports: { list: vi.fn(async () => ({ data: reports, folders: [] })) } });
    const wrapper = mountWith(ReportLibrary, api);
    await flushPromises();

    expect(wrapper.findAll('[aria-label^="Delete"]')).toHaveLength(1);
    await wrapper.find('[aria-label="Delete Visits by rep"]').trigger('click');
    [...document.querySelectorAll('.rg-dialog button')].find((b) => b.textContent === 'Delete').click();
    await flushPromises();

    expect(api.reports.remove).toHaveBeenCalledWith('a');
    expect(wrapper.findAll('.rg-report-row')).toHaveLength(1);
  });
});

describe('Field tree', () => {
  const visitFields = catalog.datasets[0].fields;
  const tree = {
    name: 'visits', label: 'Visits', topic: 'visits', topic_label: 'Visits', path: [], multiplies_rows: false,
    fields: [...visitFields, { ...field('user_id', 'Employee ID', 'integer', 'key'), hidden: true }],
    relations: [{
      name: 'employee', label: 'Employee', topic: 'users', topic_label: 'Users', path: [3], multiplies_rows: false,
      fields: [field('name', 'Employee', 'string', 'dimension')],
      relations: [{ name: 'line', label: 'Line', topic: 'lines', topic_label: 'Lines', path: [3, 7], multiplies_rows: false, fields: [field('name', 'Line', 'string', 'dimension')], relations: [] }],
    }, {
      name: 'products', label: 'Products discussed', topic: 'visit_products', topic_label: 'Visit products', path: [-9], multiplies_rows: true,
      fields: [field('samples', 'Samples', 'integer', 'measure', ['sum'])], relations: [],
    }],
  };

  it('adds a field with its own join path, never asking which way, and names it by the path', async () => {
    // The server names fields the same in the tree and the flat list.
    const flat = structuredClone(catalog);
    flat.datasets[1].fields[0].label = 'Employee';
    flat.datasets[2].fields[0].label = 'Line';
    const api = fakeApi({ query: { catalog: vi.fn(async (root) => (root ? { ...flat, tree } : { model_version: 1, datasets: [{ key: 'visits', label: 'Visits', fields_count: 4 }] })) } });
    const wrapper = await startReport(api);

    // Hidden join keys stay out; branches open on click; "many" only where rows multiply.
    expect(wrapper.text()).not.toContain('Employee ID');
    const heads = () => wrapper.findAll('.rg-ds__head');
    expect(heads().find((h) => h.text().includes('Products discussed')).text()).toContain('many');
    expect(heads().find((h) => h.text().includes('Employee')).text()).not.toContain('many');

    await heads().find((h) => h.text().includes('Employee')).trigger('click');
    await heads().find((h) => h.text().startsWith('Line')).trigger('click');
    await addButton(wrapper, 'Line').trigger('click');
    await settle();

    expect(wrapper.find('.rg-dialog').exists()).toBe(false);
    expect(wrapper.findAll('.rg-shelf')[0].text()).toContain('Employee › Line');
    expect(lastDefinition(api).fields[0]).toMatchObject({ ref: 'lines.name', path: [3, 7], label: 'Employee › Line' });

    // Search opens every branch that matches.
    await wrapper.find('#rg-field-search').setValue('samp');
    expect(wrapper.findAll('.rg-fld__label').map((f) => f.text())).toEqual(['Samples']);
  });
});
