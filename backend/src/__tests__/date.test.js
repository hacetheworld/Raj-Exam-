import { describe, it, expect } from 'vitest';
import { todayIST, tomorrowIST, addDays, isValidDateString } from '../utils/date.js';

describe('date utils', () => {
  it('validates YYYY-MM-DD date strings', () => {
    expect(isValidDateString('2026-10-01')).toBe(true);
    expect(isValidDateString('2026-02-31')).toBe(false);
    expect(isValidDateString('invalid')).toBe(false);
    expect(isValidDateString('2026-1-1')).toBe(false);
  });

  it('adds days correctly without timezone shift', () => {
    expect(addDays('2026-10-01', 1)).toBe('2026-10-02');
    expect(addDays('2026-10-01', -1)).toBe('2026-09-30');
  });

  it('returns valid IST today and tomorrow strings', () => {
    expect(isValidDateString(todayIST())).toBe(true);
    expect(isValidDateString(tomorrowIST())).toBe(true);
    expect(tomorrowIST()).toBe(addDays(todayIST(), 1));
  });
});
