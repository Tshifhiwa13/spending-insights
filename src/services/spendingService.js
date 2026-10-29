import { CATEGORIES } from '../data/categories';
import { generateTransactions } from '../data/mockTransactions';

const DEFAULT_LATENCY_MS = 300;

const wait = (ms) => (ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve());
const roundCents = (value) => Math.round(value * 100) / 100;
const largestFirst = (map) =>
  [...map.values()].map((item) => ({ ...item, total: roundCents(item.total) })).sort((a, b) => b.total - a.total);

/**
 * Mock data service. It behaves like a real API (async, validates input, small delay),
 * so the UI already handles loading and errors, and can switch to fetch() later
 * without changing any components.
 */
export function createSpendingService({
  transactions = generateTransactions(),
  latencyMs = DEFAULT_LATENCY_MS,
} = {}) {
  function inRange({ from, to }) {
    if (!from || !to) throw new Error('A date range with "from" and "to" is required.');
    if (from > to) throw new Error('"from" must be on or before "to".');
    // ISO dates (YYYY-MM-DD) compare correctly as strings.
    return transactions.filter((t) => t.date >= from && t.date <= to);
  }

  /**
   * Transactions in the range, newest first.
   * Optional filters: `category` (exact match) and `search` (merchant name, case-insensitive).
   */
  async function getTransactions({ from, to, category, search } = {}) {
    await wait(latencyMs);
    if (category && !CATEGORIES[category]) {
      throw new Error(`Unknown category "${category}".`);
    }
    const query = (search ?? '').trim().toLowerCase();

    return inRange({ from, to })
      .filter((t) => !category || t.category === category)
      .filter((t) => !query || t.merchant.toLowerCase().includes(query))
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }

  /** Totals spent and received, money in per source, and spending per category (largest first). */
  async function getSummary({ from, to } = {}) {
    await wait(latencyMs);
    const items = inRange({ from, to });
    const byCategory = new Map();
    const bySource = new Map();
    let totalSpent = 0;
    let totalIncome = 0;

    for (const t of items) {
      if (t.type === 'CREDIT') {
        totalIncome += t.amount;
        const source = bySource.get(t.merchant) ?? { source: t.merchant, total: 0, count: 0 };
        source.total += t.amount;
        source.count += 1;
        bySource.set(t.merchant, source);
        continue;
      }
      totalSpent += t.amount;
      const current = byCategory.get(t.category) ?? { category: t.category, total: 0, count: 0 };
      current.total += t.amount;
      current.count += 1;
      byCategory.set(t.category, current);
    }

    return {
      from,
      to,
      totalSpent: roundCents(totalSpent),
      totalIncome: roundCents(totalIncome),
      incomeBySource: largestFirst(bySource),
      byCategory: largestFirst(byCategory),
    };
  }

  /** Money in and out per calendar month in the range, oldest month first. */
  async function getMonthlyTotals({ from, to } = {}) {
    await wait(latencyMs);
    const months = new Map();

    for (const t of inRange({ from, to })) {
      const month = t.date.slice(0, 7); // "2026-10"
      const totals = months.get(month) ?? { month, moneyIn: 0, moneyOut: 0 };
      if (t.type === 'CREDIT') totals.moneyIn += t.amount;
      else totals.moneyOut += t.amount;
      months.set(month, totals);
    }

    return [...months.values()]
      .map((m) => ({ ...m, moneyIn: roundCents(m.moneyIn), moneyOut: roundCents(m.moneyOut) }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  return { getTransactions, getSummary, getMonthlyTotals };
}

export const spendingService = createSpendingService();