import { describe, expect, it } from 'vitest';
import { toAliases, toLabels } from '../src/utils/formulaText.js';

const columns = [{ as: 'visits', label: 'Number of visits' }, { as: 'doctors', label: 'Doctors' }, { as: 'amount', label: 'Amount (sum)' }];

describe('formula text', () => {
  it('turns column names in brackets into aliases', () => {
    expect(toAliases('[Number of visits] / [doctors]', columns)).toEqual({ formula: 'visits / doctors', unknown: [] });
    expect(toAliases("IF([Amount (sum)] > 10, '[Doctors]', 'x')", columns).formula).toBe("IF(amount > 10, '[Doctors]', 'x')");
    expect(toAliases('[Nope] + visits', columns)).toEqual({ formula: '[Nope] + visits', unknown: ['Nope'] });
  });

  it('shows aliases as column names, leaving functions, words and text alone', () => {
    expect(toLabels("SAFE_DIVIDE(amount, visits) AND NOT doctors = 'visits'", columns))
      .toBe("SAFE_DIVIDE([Amount (sum)], [Number of visits]) AND NOT [Doctors] = 'visits'");
    expect(toAliases(toLabels('ROUND(visits / doctors, 2)', columns), columns).formula).toBe('ROUND(visits / doctors, 2)');
  });
});
