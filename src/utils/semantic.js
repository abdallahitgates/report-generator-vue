/** Shared vocabulary for field roles, types and totals. */

export const ROLES = [
  { value: 'dimension', label: 'Dimension', short: 'Dim', hint: 'Group and filter by it' },
  { value: 'measure', label: 'Measure', short: 'Msr', hint: 'Add it up, average it, count it' },
  { value: 'time', label: 'Date', short: 'Date', hint: 'Group by day, month, quarter, year' },
  { value: 'key', label: 'Key', short: 'Key', hint: 'Used for joins and counting' },
];

export const TYPE_ICONS = {
  string: 'text', text: 'paragraph', integer: 'hash', decimal: 'hash', boolean: 'toggle',
  date: 'calendar', datetime: 'calendar', time: 'clock', json: 'braces',
};

export const AGGREGATION_LABELS = {
  sum: 'Sum', avg: 'Average', min: 'Min', max: 'Max', count: 'Count', count_distinct: 'Distinct',
};

export const AGGREGATIONS_FOR_TYPE = {
  integer: ['sum', 'avg', 'min', 'max', 'count', 'count_distinct'],
  decimal: ['sum', 'avg', 'min', 'max', 'count', 'count_distinct'],
  date: ['min', 'max', 'count', 'count_distinct'],
  datetime: ['min', 'max', 'count', 'count_distinct'],
};

export function aggregationsFor(type) {
  return AGGREGATIONS_FOR_TYPE[type] ?? ['count', 'count_distinct'];
}
