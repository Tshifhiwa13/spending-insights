export const CATEGORIES = {
  GROCERIES: 'Groceries',
  TRANSPORT: 'Transport',
  DINING: 'Eating out',
  ENTERTAINMENT: 'Entertainment',
  UTILITIES: 'Utilities',
  SHOPPING: 'Shopping',
  HEALTH: 'Health',
  INCOME: 'Income',
};

/** Blues and reds, alternated so neighbouring donut slices stay distinguishable. */
export const CATEGORY_COLORS = {
  SHOPPING: '#0a4b6e',
  UTILITIES: '#e5373a',
  GROCERIES: '#1fa2de',
  TRANSPORT: '#a3162a',
  HEALTH: '#7fcbef',
  DINING: '#f08a80',
  ENTERTAINMENT: '#2f6fa8',
  INCOME: '#1fa2de',
};

export const categoryLabel = (category) => CATEGORIES[category] ?? category;
export const categoryColor = (category) => CATEGORY_COLORS[category] ?? '#5b6b78';
