import { describe, expect, it } from 'vitest';
import { lastNDays, toIsoDate, validateRange } from './dates';

const limits = { min: '2026-05-06', max: '2026-11-02' };

describe('dates', () => {
  it('formats a date as YYYY-MM-DD using the local calendar', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('gives the last N days, including today', () => {
    expect(lastNDays(30, new Date(2026, 10, 2))).toEqual({ from: '2026-10-04', to: '2026-11-02' });
  });

  it('accepts a valid range, including a single day', () => {
    expect(validateRange({ from: '2026-08-01', to: '2026-08-31' }, limits)).toBeNull();
    expect(validateRange({ from: '2026-08-01', to: '2026-08-01' }, limits)).toBeNull();
  });

  it('explains what is wrong with an invalid range', () => {
    expect(validateRange({ from: '', to: '2026-08-31' }, limits)).toMatch('Choose both');
    expect(validateRange({ from: '2026-09-01', to: '2026-08-01' }, limits)).toMatch('on or before');
    expect(validateRange({ from: '2026-01-01', to: '2026-08-01' }, limits)).toMatch('only available from 06/05/2026');
    expect(validateRange({ from: '2026-10-01', to: '2026-12-01' }, limits)).toMatch('future');
  });
});