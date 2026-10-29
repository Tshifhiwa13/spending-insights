import { describe, expect, it } from 'vitest';
import { generateTransactions, MONTHLY_SALARY } from '../data/mockTransactions';
import { createSpendingService } from './spendingService';

const today = new Date(2026, 5, 30); // 30 June 2026
const service = createSpendingService({ transactions: generateTransactions(today), latencyMs: 0 });

describe('spendingService', () => {
  it('category totals add up to total spent', async () => {
    const summary = await service.getSummary({ from: '2026-04-01', to: '2026-06-30' });
    const sum = summary.byCategory.reduce((acc, c) => acc + c.total, 0);

    expect(sum).toBeCloseTo(summary.totalSpent, 2);
  });

  it('money in by source adds up to total income', async () => {
    const summary = await service.getSummary({ from: '2026-01-01', to: '2026-06-30' });
    const sum = summary.incomeBySource.reduce((acc, s) => acc + s.total, 0);

    expect(summary.incomeBySource[0].source).toBe('Employer Salary');
    expect(sum).toBeCloseTo(summary.totalIncome, 2);
  });

  it('counts the salary as income once per month', async () => {
    const june = await service.getSummary({ from: '2026-06-01', to: '2026-06-30' });

    expect(june.totalIncome).toBe(MONTHLY_SALARY);
  });

  it('monthly totals add up to the summary totals', async () => {
    const range = { from: '2026-01-01', to: '2026-06-30' };
    const months = await service.getMonthlyTotals(range);
    const summary = await service.getSummary(range);

    expect(months.map((m) => m.month)).toEqual(['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']);
    expect(months.reduce((sum, m) => sum + m.moneyOut, 0)).toBeCloseTo(summary.totalSpent, 2);
    expect(months.reduce((sum, m) => sum + m.moneyIn, 0)).toBeCloseTo(summary.totalIncome, 2);
  });

  it('returns transactions in range, newest first', async () => {
    const results = await service.getTransactions({ from: '2026-06-17', to: '2026-06-30' });

    expect(results.length).toBeGreaterThan(0);
    results.forEach((t) => {
      expect(t.date >= '2026-06-17' && t.date <= '2026-06-30').toBe(true);
    });
    expect(results[0].date >= results.at(-1).date).toBe(true);
  });

  it('filters by category', async () => {
    const results = await service.getTransactions({ from: '2026-01-01', to: '2026-06-30', category: 'GROCERIES' });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((t) => t.category === 'GROCERIES')).toBe(true);
  });

  it('rejects a reversed date range', async () => {
    await expect(service.getTransactions({ from: '2026-02-01', to: '2026-01-01' })).rejects.toThrow(
      '"from" must be on or before "to"',
    );
  });

  it('generates the same data every time', () => {
    expect(generateTransactions(today)).toEqual(generateTransactions(today));
  });
});
