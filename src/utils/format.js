const currency = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' });
const shortDate = new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short' });

export const formatMoney = (value) => currency.format(value);

export const formatDate = (isoDate) => shortDate.format(new Date(`${isoDate}T00:00:00`));
