/**
 * Formulas as people write them, with column names in brackets
 * ("[Visits] / [Doctors]"), and as the engine stores them, with column
 * aliases ("visits / doctors"). Text in quotes is never touched.
 */

const WORDS = new Set(['AND', 'OR', 'NOT', 'TRUE', 'FALSE', 'NULL']);

/** Splits a formula into quoted strings and the code between them. */
function parts(text) {
  const out = [];
  let i = 0;
  let start = 0;
  while (i < text.length) {
    const q = text[i];
    if (q === "'" || q === '"') {
      if (i > start) out.push({ code: true, text: text.slice(start, i) });
      let j = i + 1;
      while (j < text.length && text[j] !== q) j++;
      out.push({ code: false, text: text.slice(i, j + 1) });
      i = j + 1;
      start = i;
    } else i++;
  }
  if (start < text.length) out.push({ code: true, text: text.slice(start) });
  return out;
}

/**
 * "[Number of visits] / visits" -> "visits / visits". Brackets match column
 * labels (any case) or aliases.
 *
 * @param {Array<{as: string, label: string}>} columns
 * @returns {{ formula: string, unknown: string[] }}
 */
export function toAliases(text, columns) {
  const byLabel = new Map();
  for (const c of columns) {
    byLabel.set(String(c.label ?? '').trim().toLowerCase(), c.as);
    byLabel.set(String(c.as).toLowerCase(), c.as);
  }
  const unknown = [];
  const formula = parts(text).map((p) => (p.code
    ? p.text.replace(/\[([^\]]+)\]/g, (_, name) => {
      const alias = byLabel.get(name.trim().toLowerCase());
      if (!alias) unknown.push(name.trim());
      return alias ?? `[${name}]`;
    })
    : p.text)).join('');
  return { formula, unknown };
}

/** "visits / doctors" -> "[Number of visits] / [Doctors]" for editing. */
export function toLabels(formula, columns) {
  const byAlias = new Map(columns.map((c) => [c.as, c.label ?? c.as]));
  return parts(formula ?? '').map((p) => (p.code
    ? p.text.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b(\s*\()?/g, (whole, name, call) => {
      if (call || WORDS.has(name.toUpperCase()) || !byAlias.has(name)) return whole;
      return `[${byAlias.get(name)}]`;
    })
    : p.text)).join('');
}
