import { generateTransactions } from '../data/mockTransactions';

const DEFAULT_LATENCY_MS = 300;

const wait = (ms) => (ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve());
const roundCents = (value) => Math.round(value * 100) / 100;

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

  /** Transactions in the range, newest first, optionally for one category. */
  async function getTransactions({ from, to, category } = {}) {
    await wait(latencyMs);
    return inRange({ from, to })
      .filter((t) => !category || t.category === category)
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }

  /** Totals spent and received, plus spending per category (largest first). */
  async function getSummary({ from, to } = {}) {
    await wait(latencyMs);
    const items = inRange({ from, to });
    const byCategory = new Map();
    let totalSpent = 0;
    let totalIncome = 0;

    for (const t of items) {
      if (t.type === 'CREDIT') {
        totalIncome += t.amount;
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
      byCategory: [...byCategory.values()]
        .map((c) => ({ ...c, total: roundCents(c.total) }))
        .sort((a, b) => b.total - a.total),
    };
  }

  return { getTransactions, getSummary };
}

export const spendingService = createSpendingService();
