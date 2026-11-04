/**
 * Display formatting for report cells. Number formats use the spreadsheet
 * style the model stores ("#,##0", "#,##0.00", "0.00%"), so the same string
 * works in the grid and, later, in Excel exports.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const numberFormats = new Map();

function numberFormatter(decimals, grouping, percent) {
  const key = `${decimals}|${grouping}|${percent}`;
  if (!numberFormats.has(key)) {
    numberFormats.set(key, new Intl.NumberFormat('en', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: grouping,
      style: percent ? 'percent' : 'decimal',
    }));
  }
  return numberFormats.get(key);
}

/** "#,##0.00" -> { decimals: 2, grouping: true, percent: false } */
export function parseNumberFormat(format) {
  if (!format) return null;
  const percent = format.includes('%');
  const grouping = format.includes(',');
  const decimals = (format.split('.')[1] ?? '').replace(/[^0#]/g, '').length;
  return { decimals, grouping, percent };
}

export function formatNumber(value, format, type = 'decimal') {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return String(value);

  const parsed = parseNumberFormat(format);
  if (parsed) return numberFormatter(parsed.decimals, parsed.grouping, parsed.percent).format(number);

  // No format: whole numbers with separators, decimals with up to two places.
  const decimals = type === 'integer' || Number.isInteger(number) ? 0 : 2;
  return numberFormatter(decimals, true, false).format(number);
}

function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(String(value));
  if (!match) return null;
  return { year: +match[1], month: +match[2], day: +match[3], hour: match[4] !== undefined ? +match[4] : null, minute: match[5] !== undefined ? +match[5] : null };
}

export function formatDate(value, grain = null, type = 'date') {
  if (grain === 'month_of_year') return MONTHS[(+value - 1) % 12] ?? String(value);
  if (grain === 'day_of_week') return DAYS[(+value - 1) % 7] ?? String(value);
  if (grain === 'hour_of_day') return `${String(value).padStart(2, '0')}:00`;

  const d = parseDate(value);
  if (!d) return String(value);
  const dayMonthYear = `${d.day} ${MONTHS[d.month - 1]} ${d.year}`;

  switch (grain) {
    case 'year': return String(d.year);
    case 'quarter': return `Q${Math.floor((d.month - 1) / 3) + 1} ${d.year}`;
    case 'month': return `${MONTHS[d.month - 1]} ${d.year}`;
    case 'week': return `Week of ${dayMonthYear}`;
    case 'hour': return `${dayMonthYear}, ${String(d.hour ?? 0).padStart(2, '0')}:00`;
    case 'day': return dayMonthYear;
    default:
      return type === 'datetime' && d.hour !== null
        ? `${dayMonthYear}, ${String(d.hour).padStart(2, '0')}:${String(d.minute).padStart(2, '0')}`
        : dayMonthYear;
  }
}

/**
 * @param {*} value
 * @param {{type: string, kind?: string, format?: string|null, grain?: string|null}} column
 */
export function formatCell(value, column) {
  if (value === null || value === undefined || value === '') {
    return column.kind === 'measure' ? '–' : '(empty)';
  }
  if (column.grain || column.type === 'date' || column.type === 'datetime') {
    return formatDate(value, column.grain, column.type);
  }
  if (column.type === 'boolean') {
    return value === true || value === 1 || value === '1' || value === 't' ? 'Yes' : 'No';
  }
  if (column.type === 'integer' || column.type === 'decimal' || column.kind === 'measure') {
    return formatNumber(value, column.format, column.type);
  }
  return String(value);
}

export function isNumericColumn(column) {
  return !column.grain && (column.kind === 'measure' || column.type === 'integer' || column.type === 'decimal');
}
