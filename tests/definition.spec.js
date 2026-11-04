import { describe, expect, it } from 'vitest';
import { emptyDraft, fromDefinition, itemFromField, toDefinition } from '../src/utils/definition.js';
import { formatCell, formatDate, formatNumber } from '../src/utils/values.js';

const visits = { key: 'visits', label: 'Visits', paths: [], fields: [
  { key: '__rows', label: 'Number of Visits', type: 'integer', role: 'measure', aggregations: ['count'] },
  { key: 'amount', label: 'Amount', type: 'decimal', role: 'measure', aggregations: ['sum', 'avg'] },
  { key: 'visit_date', label: 'Visit Date', type: 'date', role: 'time', aggregations: [] },
] };
const users = { key: 'users', label: 'Users', paths: [{ path: [3] }], fields: [{ key: 'name', label: 'Name', type: 'string', role: 'dimension', aggregations: [] }] };

describe('draft <-> definition', () => {
  it('builds labels, aliases and a definition from catalog fields', () => {
    const draft = { ...emptyDraft(), root: 'visits' };
    draft.rows.push(itemFromField(draft, users, users.fields[0]));
    draft.rows.push(itemFromField(draft, visits, visits.fields[2]));
    draft.values.push(itemFromField(draft, visits, visits.fields[0]));
    draft.values.push(itemFromField(draft, visits, visits.fields[1]));

    const { definition, locations } = toDefinition(draft);

    expect(definition.fields).toEqual([
      { ref: 'users.name', as: 'users_name', label: 'Users Name' },
      { ref: 'visits.visit_date', as: 'visit_date', label: 'Visit Date', grain: 'month' },
      { ref: 'visits.__rows', as: 'number_of_visits', label: 'Number of Visits', agg: 'count' },
      { ref: 'visits.amount', as: 'sum_of_amount', label: 'Sum of Amount', agg: 'sum' },
    ]);
    expect(locations['fields.2']).toBe(draft.values[0].uid);
  });

  it('leaves unfinished filters out of the definition', () => {
    const draft = { ...emptyDraft(), root: 'visits' };
    draft.filters.items.push({ uid: 'a', target: 'visits.status', op: '=', value: null });
    draft.filters.items.push({ uid: 'b', target: 'visits.status', op: 'is_null', value: null });
    draft.filters.items.push({ uid: 'c', target: 'visits.amount', op: 'between', value: [1, ''] });

    const { definition, locations } = toDefinition(draft);
    expect(definition.filters).toEqual({ and: [{ field: 'visits.status', op: 'is_null' }] });
    expect(locations['filters.and.0']).toBe('b');
  });

  it('round-trips a saved definition', () => {
    const definition = {
      version: 1, root: 'visits', subtotals: true, ui: { grouped: false, rows: ['rep'] },
      fields: [
        { ref: 'users.name', as: 'rep', label: 'Rep', path: [3] },
        { ref: 'visits.amount', agg: 'avg', as: 'avg_amount', label: 'Average of Amount' },
        { formula: 'avg_amount * 2', as: 'double', label: 'Double' },
      ],
      filters: { and: [{ field: 'visits.visit_date', op: 'between', value: 'this_month' }, { or: [{ field: 'rep', op: '=', value: 'Ali' }] }] },
      sort: [{ field: 'avg_amount', dir: 'desc' }],
    };

    const draft = fromDefinition(definition, [visits, users], { uuid: 'u1', name: 'Saved', can_edit: false });
    expect(draft.rows.map((r) => r.as)).toEqual(['rep']);
    expect(draft.values.map((r) => r.kind)).toEqual(['measure', 'formula']);
    expect(draft.canEdit).toBe(false);

    const again = toDefinition(draft).definition;
    expect(again.fields).toEqual(definition.fields);
    expect(again.filters).toEqual(definition.filters);
    expect(again.sort).toEqual(definition.sort);
    expect(again.subtotals).toBe(true);
  });
});

describe('cell formatting', () => {
  it('formats numbers with spreadsheet-style formats', () => {
    expect(formatNumber(1234567.891, '#,##0.00')).toBe('1,234,567.89');
    expect(formatNumber(1234567, '#,##0')).toBe('1,234,567');
    expect(formatNumber(0.1234, '0.00%')).toBe('12.34%');
    expect(formatNumber(70.5, null, 'decimal')).toBe('70.50');
    expect(formatNumber(3, null, 'integer')).toBe('3');
  });

  it('formats dates by their grouping', () => {
    expect(formatDate('2026-03-01', 'month')).toBe('Mar 2026');
    expect(formatDate('2026-04-01', 'quarter')).toBe('Q2 2026');
    expect(formatDate('2026-01-01', 'year')).toBe('2026');
    expect(formatDate('2026-03-02', 'week')).toBe('Week of 2 Mar 2026');
    expect(formatDate(3, 'month_of_year')).toBe('Mar');
    expect(formatDate(7, 'day_of_week')).toBe('Sun');
    expect(formatDate('2026-03-02 14:05:00', null, 'datetime')).toBe('2 Mar 2026, 14:05');
  });

  it('shows empty values for what they are', () => {
    expect(formatCell(null, { kind: 'dimension', type: 'string' })).toBe('(empty)');
    expect(formatCell(null, { kind: 'measure', type: 'decimal' })).toBe('–');
    expect(formatCell(1, { kind: 'dimension', type: 'boolean' })).toBe('Yes');
  });
});
