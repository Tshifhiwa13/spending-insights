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
