const currency = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' });
const shortDate = new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short' });

export const formatMoney = (value) => currency.format(value);

export const formatDate = (isoDate) => shortDate.format(new Date(`${isoDate}T00:00:00`));

/** 2026-10-27 → 27/10/2026, as on a bank statement. */
export const formatStatementDate = (isoDate) => isoDate.split('-').reverse().join('/');

export const formatPercent = (value) => `${Math.round(value * 100)}%`;
