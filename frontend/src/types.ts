export type Category =
  | 'GROCERIES'
  | 'TRANSPORT'
  | 'DINING'
  | 'ENTERTAINMENT'
  | 'UTILITIES'
  | 'SHOPPING'
  | 'HEALTH'
  | 'INCOME';

export interface Transaction {
  id: string;
  date: string; // ISO date, e.g. 2026-10-26
  merchant: string;
  category: Category;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
}

export interface CategoryTotal {
  category: Category;
  total: number;
  count: number;
}

export interface SpendingSummary {
  from: string;
  to: string;
  totalSpent: number;
  totalIncome: number;
  byCategory: CategoryTotal[];
}

export interface DateRange {
  from: string;
  to: string;
}
