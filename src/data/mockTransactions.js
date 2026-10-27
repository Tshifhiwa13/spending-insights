import { toIsoDate } from '../utils/dates';

export const DAYS_OF_HISTORY = 180;
export const MONTHLY_SALARY = 28500;

const MERCHANTS = {
  GROCERIES: ['Checkers', 'Pick n Pay', 'Woolworths Food', 'Spar'],
  TRANSPORT: ['Engen', 'Shell', 'Uber', 'Gautrain'],
  DINING: ["Nando's", 'Ocean Basket', 'Mugg & Bean', 'Wimpy'],
  ENTERTAINMENT: ['Netflix', 'Showmax', 'Ster-Kinekor', 'Spotify'],
  UTILITIES: ['Municipality Electricity', 'Vodacom', 'MTN', 'Telkom Fibre'],
  SHOPPING: ['Takealot', 'Mr Price', 'Game', 'Edgars'],
  HEALTH: ['Clicks', 'Dis-Chem', 'Virgin Active'],
};

const AMOUNT_RANGES = {
  GROCERIES: [150, 1800],
  TRANSPORT: [60, 1200],
  DINING: [90, 650],
  ENTERTAINMENT: [60, 400],
  UTILITIES: [300, 1500],
  SHOPPING: [120, 2500],
  HEALTH: [80, 900],
};

const SPEND_CATEGORIES = Object.keys(MERCHANTS);

/** Small seeded random number generator, so the mock data is the same on every load. */
function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (random, list) => list[Math.floor(random() * list.length)];
const toCents = (value) => Math.round(value * 100) / 100;

/**
 * Generates ~6 months of realistic transactions ending on `today`.
 * Dates move with the calendar, so "last 30 days" always has data.
 */
export function generateTransactions(today = new Date(), days = DAYS_OF_HISTORY) {
  const random = seededRandom(42);
  const transactions = [];
  let sequence = 1;
  const nextId = () => `txn-${String(sequence++).padStart(5, '0')}`;

  for (let offset = days - 1; offset >= 0; offset--) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    const date = toIsoDate(day);

    if (day.getDate() === 25) {
      transactions.push({
        id: nextId(),
        date,
        merchant: 'Employer Salary',
        category: 'INCOME',
        type: 'CREDIT',
        amount: MONTHLY_SALARY,
      });
    }

    const purchasesToday = Math.floor(random() * 4);
    for (let i = 0; i < purchasesToday; i++) {
      const category = pick(random, SPEND_CATEGORIES);
      const [min, max] = AMOUNT_RANGES[category];
      transactions.push({
        id: nextId(),
        date,
        merchant: pick(random, MERCHANTS[category]),
        category,
        type: 'DEBIT',
        amount: toCents(min + random() * (max - min)),
      });
    }
  }
  return transactions;
}
