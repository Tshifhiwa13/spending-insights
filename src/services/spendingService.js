import { CATEGORIES } from '../data/categories';
import { CUSTOMER } from '../data/customer';
import { DAYS_OF_HISTORY, generateTransactions } from '../data/mockTransactions';
import { addDays, daysInRange, lastNDays } from '../utils/dates';

const DEFAULT_LATENCY_MS = 300;
const MAX_PAGE_SIZE = 100;

const wait = (ms) => (ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve());
const roundCents = (value) => Math.round(value * 100) / 100;
const largestFirst = (map) =>
  [...map.values()].map((item) => ({ ...item, total: roundCents(item.total) })).sort((a, b) => b.total - a.total);

/** Change as a fraction (0.12 = 12% more), or null when there was nothing before to compare with. */
const changeRatio = (current, previous) =>
  previous === 0 ? null : Math.round(((current - previous) / previous) * 1000) / 1000;

/** Ways transactions can be sorted, each in ascending order. The id breaks ties so order is stable. */
const SORTS = {
  date: (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  amount: (a, b) => a.amount - b.amount || a.id.localeCompare(b.id),
};

/**
 * Mock data service. It behaves like a real API (async, validates input, small delay),
 * so the UI already handles loading and errors, and can switch to fetch() later
 * without changing any components.
 */
export function createSpendingService({
  transactions = generateTransactions(),
  latencyMs = DEFAULT_LATENCY_MS,
  historyStart = lastNDays(DAYS_OF_HISTORY).from,
  customer = CUSTOMER,
} = {}) {
  function inRange({ from, to }) {
    if (!from || !to) throw new Error('A date range with "from" and "to" is required.');
    if (from > to) throw new Error('"from" must be on or before "to".');
    // ISO dates (YYYY-MM-DD) compare correctly as strings.
    return transactions.filter((t) => t.date >= from && t.date <= to);
  }

  /** Transactions in the range that match the optional category and merchant search. */
  function filterTransactions({ from, to, category, search }) {
    if (category && !CATEGORIES[category]) {
      throw new Error(`Unknown category "${category}".`);
    }
    const query = (search ?? '').trim().toLowerCase();

    return inRange({ from, to })
      .filter((t) => !category || t.category === category)
      .filter((t) => !query || t.merchant.toLowerCase().includes(query));
  }

  /** Total spending in a range, and spending per category. */
  function spendingIn(range) {
    const byCategory = new Map();
    let total = 0;
    for (const t of inRange(range)) {
      if (t.type !== 'DEBIT') continue;
      total += t.amount;
      byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
    }
    return { total, byCategory };
  }

  /** The customer's details, with total spending across all available history. */
  async function getCustomerProfile() {
    await wait(latencyMs);
    const totalSpent = transactions
      .filter((t) => t.type === 'DEBIT')
      .reduce((sum, t) => sum + t.amount, 0);

    return { ...customer, totalSpent: roundCents(totalSpent), spentSince: historyStart };
  }

  /** All matching transactions, newest first. */
  async function getTransactions({ from, to, category, search } = {}) {
    await wait(latencyMs);
    return filterTransactions({ from, to, category, search }).sort((a, b) => SORTS.date(b, a));
  }

  /** One page of matching transactions, sorted, plus the totals needed to show page controls. */
  async function getTransactionPage({
    from,
    to,
    category,
    search,
    sortBy = 'date',
    sortDirection = 'desc',
    page = 1,
    pageSize = 10,
  } = {}) {
    await wait(latencyMs);
    if (!SORTS[sortBy]) throw new Error(`Cannot sort by "${sortBy}".`);
    if (sortDirection !== 'asc' && sortDirection !== 'desc') {
      throw new Error('"sortDirection" must be "asc" or "desc".');
    }
    if (!Number.isInteger(page) || page < 1) throw new Error('"page" must be a whole number from 1.');
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
      throw new Error(`"pageSize" must be between 1 and ${MAX_PAGE_SIZE}.`);
    }

    const direction = sortDirection === 'asc' ? 1 : -1;
    const matching = filterTransactions({ from, to, category, search }).sort(
      (a, b) => direction * SORTS[sortBy](a, b),
    );
    const start = (page - 1) * pageSize;

    return {
      items: matching.slice(start, start + pageSize),
      total: matching.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(matching.length / pageSize)),
    };
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

  /**
   * Compares spending in the range with the same number of days just before it.
   * Categories are ordered by the size of their change, biggest first.
   */
  async function getComparison({ from, to } = {}) {
    await wait(latencyMs);
    inRange({ from, to }); // Validates the range.

    const days = daysInRange({ from, to });
    const previous = { from: addDays(from, -days), to: addDays(from, -1) };
    if (previous.from < historyStart) {
      return { available: false, days, current: { from, to }, previous };
    }

    const now = spendingIn({ from, to });
    const before = spendingIn(previous);
    const categories = [...new Set([...now.byCategory.keys(), ...before.byCategory.keys()])]
      .map((category) => {
        const current = roundCents(now.byCategory.get(category) ?? 0);
        const earlier = roundCents(before.byCategory.get(category) ?? 0);
        return {
          category,
          current,
          previous: earlier,
          change: roundCents(current - earlier),
          percent: changeRatio(current, earlier),
        };
      })
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    return {
      available: true,
      days,
      current: { from, to, totalSpent: roundCents(now.total) },
      previous: { ...previous, totalSpent: roundCents(before.total) },
      change: roundCents(now.total - before.total),
      percent: changeRatio(now.total, before.total),
      categories,
    };
  }

  return { getCustomerProfile, getTransactions, getTransactionPage, getSummary, getMonthlyTotals, getComparison };
}

export const spendingService = createSpendingService();