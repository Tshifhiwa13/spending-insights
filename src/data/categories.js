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

export const categoryLabel = (category) => CATEGORIES[category] ?? category;
