import { formatStatementDate } from './format';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Local calendar date as YYYY-MM-DD (avoids the UTC shift of toISOString). */
export function toIsoDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** YYYY-MM-DD → a local Date at midnight. */
function parseIsoDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** The last `days` days, ending today, as { from, to } ISO dates. */
export function lastNDays(days, today = new Date()) {
  const start = new Date(today);
  start.setDate(today.getDate() - (days - 1));
  return { from: toIsoDate(start), to: toIsoDate(today) };
}

/** Moves an ISO date forward (positive) or back (negative) by whole days. */
export function addDays(isoDate, days) {
  const date = parseIsoDate(isoDate);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** Number of days in an inclusive range: 1–31 August is 31 days. */
export function daysInRange({ from, to }) {
  return Math.round((parseIsoDate(to) - parseIsoDate(from)) / MS_PER_DAY) + 1;
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