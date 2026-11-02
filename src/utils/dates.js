import { formatStatementDate } from './format';

/** Local calendar date as YYYY-MM-DD (avoids the UTC shift of toISOString). */
export function toIsoDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The last `days` days, ending today, as { from, to } ISO dates. */
export function lastNDays(days, today = new Date()) {
  const start = new Date(today);
  start.setDate(today.getDate() - (days - 1));
  return { from: toIsoDate(start), to: toIsoDate(today) };
}

/**
 * Checks a custom date range against the dates data exists for.
 * Returns a message explaining the problem, or null when the range is fine.
 */
export function validateRange({ from, to }, { min, max }) {
  if (!from || !to) return 'Choose both a start date and an end date.';
  if (from > to) return 'The start date must be on or before the end date.';
  if (from < min) return `Data is only available from ${formatStatementDate(min)}.`;
  if (to > max) return 'The end date can’t be in the future.';
  return null;
}