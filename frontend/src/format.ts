import type { Category, DateRange } from './types';

const currency = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' });
const shortDate = new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short' });

export const formatMoney = (value: number) => currency.format(value);

export const formatDate = (isoDate: string) => shortDate.format(new Date(`${isoDate}T00:00:00`));

export const CATEGORY_LABELS: Record<Category, string> = {
  GROCERIES: 'Groceries',
  TRANSPORT: 'Transport',
  DINING: 'Eating out',
  ENTERTAINMENT: 'Entertainment',
  UTILITIES: 'Utilities',
  SHOPPING: 'Shopping',
  HEALTH: 'Health',
  INCOME: 'Income',
};

/** Local calendar date as YYYY-MM-DD (avoids the UTC shift of toISOString). */
function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function lastNDays(days: number, today = new Date()): DateRange {
  const start = new Date(today);
  start.setDate(today.getDate() - (days - 1));
  return { from: toIsoDate(start), to: toIsoDate(today) };
}
