const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const plain = new Intl.NumberFormat('en');
const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** 1234567 -> "1.2M"; null -> "—" (unknown, e.g. a view or an unanalyzed table). */
export function formatCount(value) {
  if (value === null || value === undefined) return '—';
  return value < 10000 ? plain.format(value) : compact.format(value);
}

export function formatNumber(value) {
  return plain.format(value ?? 0);
}

const UNITS = [
  ['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60],
];

/** ISO date -> "5 minutes ago". */
export function timeAgo(iso, now = Date.now()) {
  if (!iso) return '';
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}
