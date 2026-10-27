import { render, screen } from '@testing-library/react';
import App from './App';
import type { SpendingSummary, Transaction } from './types';

const summary: SpendingSummary = {
  from: '2026-09-27',
  to: '2026-10-26',
  totalSpent: 1500,
  totalIncome: 28500,
  byCategory: [{ category: 'GROCERIES', total: 1500, count: 2 }],
};

const transactions: Transaction[] = [
  { id: 'txn-1', date: '2026-10-20', merchant: 'Checkers', category: 'GROCERIES', type: 'DEBIT', amount: 1500 },
];

function mockFetch(ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) =>
      Promise.resolve({
        ok,
        status: ok ? 200 : 500,
        json: () => Promise.resolve(url.includes('summary') ? summary : transactions),
      }),
    ),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('App', () => {
  it('shows totals, categories and transactions once data loads', async () => {
    mockFetch();
    render(<App />);

    expect(await screen.findByText('Checkers')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Where it went' })).toBeInTheDocument();
    expect(screen.getAllByText('Groceries').length).toBeGreaterThan(0);
  });

  it('shows an error with a retry button when the API fails', async () => {
    mockFetch(false);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
