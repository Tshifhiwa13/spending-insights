import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SpendingInsights from './SpendingInsights';

const comparison = {
  available: true,
  days: 30,
  change: 1200,
  percent: 0.12,
  categories: [
    { category: 'GROCERIES', current: 3000, previous: 1800, change: 1200, percent: 0.667 },
    { category: 'DINING', current: 500, previous: 800, change: -300, percent: -0.375 },
    { category: 'HEALTH', current: 300, previous: 0, change: 300, percent: null },
    { category: 'TRANSPORT', current: 900, previous: 900, change: 0, percent: 0 },
  ],
};

describe('SpendingInsights', () => {
  it('summarises the overall change in a sentence', () => {
    render(<SpendingInsights comparison={comparison} />);

    expect(screen.getByText('You spent R 1 200,00 (12%) more than in the previous 30 days.')).toBeInTheDocument();
  });

  it('lists the categories that changed, with more, less and new', () => {
    render(<SpendingInsights comparison={comparison} />);

    expect(screen.getByText('R 1 200,00 (67%) more')).toBeInTheDocument();
    expect(screen.getByText('R 300,00 (38%) less')).toBeInTheDocument();
    expect(screen.getByText('R 300,00 new')).toBeInTheDocument();
    expect(screen.queryByText('Transport')).not.toBeInTheDocument();
  });

  it('explains when there is not enough history', () => {
    render(<SpendingInsights comparison={{ available: false, days: 180 }} />);

    expect(screen.getByText(/isn’t enough history/)).toBeInTheDocument();
  });
});