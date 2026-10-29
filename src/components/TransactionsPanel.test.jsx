import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TransactionsPanel from './TransactionsPanel';

const { getTransactions } = vi.hoisted(() => ({ getTransactions: vi.fn() }));

vi.mock('../services/spendingService', () => ({
  spendingService: { getTransactions },
}));

// Defined once, outside the tests, so it doesn't change between renders.
const range = { from: '2026-09-28', to: '2026-10-27' };

const transactions = [
  { id: 'txn-2', date: '2026-10-21', merchant: 'Spar', category: 'GROCERIES', type: 'DEBIT', amount: 420 },
  { id: 'txn-1', date: '2026-10-20', merchant: 'Shell', category: 'TRANSPORT', type: 'DEBIT', amount: 900 },
];

describe('TransactionsPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getTransactions.mockResolvedValue(transactions);
  });

  it('shows the transactions for the date range', async () => {
    render(<TransactionsPanel range={range} />);

    expect(await screen.findByText('Spar')).toBeInTheDocument();
    expect(screen.getByText('2 found')).toBeInTheDocument();
    expect(getTransactions).toHaveBeenCalledWith(expect.objectContaining(range));
  });

  it('searches by merchant once typing pauses', async () => {
    render(<TransactionsPanel range={range} />);
    await screen.findByText('Spar');

    await userEvent.type(screen.getByLabelText('Search merchant'), 'spar');

    await waitFor(() =>
      expect(getTransactions).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'spar' })),
    );
  });

  it('filters by category', async () => {
    render(<TransactionsPanel range={range} />);
    await screen.findByText('Spar');

    await userEvent.selectOptions(screen.getByLabelText('Category'), 'GROCERIES');

    await waitFor(() =>
      expect(getTransactions).toHaveBeenLastCalledWith(expect.objectContaining({ category: 'GROCERIES' })),
    );
  });

  it('shows an empty state and clears the filters', async () => {
    render(<TransactionsPanel range={range} />);
    await screen.findByText('Spar');

    getTransactions.mockResolvedValue([]);
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'HEALTH');

    expect(await screen.findByText('No transactions match your filters.')).toBeInTheDocument();

    getTransactions.mockResolvedValue(transactions);
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByLabelText('Category')).toHaveValue('');
    expect(await screen.findByText('Spar')).toBeInTheDocument();
  });

  it('shows an error when loading fails', async () => {
    getTransactions.mockRejectedValue(new Error('boom'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<TransactionsPanel range={range} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded');
  });
});