/** Shared vocabulary for roles, types and relationship origins. */

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

export const ORIGINS = {
  foreign_key: { label: 'Foreign key', tone: 'neutral' },
  eloquent: { label: 'Model', tone: 'info' },
  convention: { label: 'Name match', tone: 'warning' },
  manual: { label: 'Added by hand', tone: 'neutral' },
};

export const HIDDEN_REASONS = {
  key: 'Key column: hidden from users, still used for joins.',
  sensitive: 'Looks sensitive (password, token, secret).',
  unsupported: 'This database type cannot be used in reports.',
  json: 'JSON column: hidden until JSON fields are supported.',
  soft_delete: 'Soft-delete marker: deleted rows are filtered out automatically.',
};

export const CARDINALITIES = [
  { value: 'many_to_one', label: 'Many to one' },
  { value: 'one_to_one', label: 'One to one' },
  { value: 'one_to_many', label: 'One to many' },
];
