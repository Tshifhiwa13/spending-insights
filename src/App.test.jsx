import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const { getSummary, getTransactions } = vi.hoisted(() => ({
  getSummary: vi.fn(),
  getTransactions: vi.fn(),
}));

vi.mock('./services/spendingService', () => ({
  spendingService: { getSummary, getTransactions },
}));

const summary = {
  from: '2026-09-28',
  to: '2026-10-27',
  totalSpent: 1500,
  totalIncome: 28500,
  incomeBySource: [{ source: 'Employer Salary', total: 28500, count: 1 }],
  byCategory: [{ category: 'GROCERIES', total: 1500, count: 2 }],
};

const transactions = [
  { id: 'txn-1', date: '2026-10-20', merchant: 'Checkers', category: 'GROCERIES', type: 'DEBIT', amount: 1500 },
];

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getSummary.mockResolvedValue(summary);
    getTransactions.mockResolvedValue(transactions);
  });

  it('shows the statement, money in and out, and transactions once data loads', async () => {
    render(<App />);

    expect(await screen.findByText('Checkers')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Statement information' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Money in' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Money out' })).toBeInTheDocument();
    expect(screen.getAllByText('Employer Salary').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Groceries').length).toBeGreaterThan(0);
  });

  it('loads a longer period when another option is chosen', async () => {
    render(<App />);
    await screen.findByText('Checkers');

    await userEvent.click(screen.getByRole('button', { name: '3 months' }));

    expect(screen.getByRole('button', { name: '3 months' })).toHaveAttribute('aria-pressed', 'true');
    expect(getSummary).toHaveBeenCalledTimes(2);
  });

  it('shows an error with a retry button when loading fails', async () => {
    getSummary.mockRejectedValue(new Error('boom'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
