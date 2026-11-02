import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TransactionsPanel from './TransactionsPanel';

const { getTransactionPage } = vi.hoisted(() => ({ getTransactionPage: vi.fn() }));

vi.mock('../services/spendingService', () => ({
  spendingService: { getTransactionPage },
}));

// Defined once, outside the tests, so it doesn't change between renders.
const range = { from: '2026-09-28', to: '2026-10-27' };

const transactions = [
  { id: 'txn-2', date: '2026-10-21', merchant: 'Spar', category: 'GROCERIES', type: 'DEBIT', amount: 420 },
  { id: 'txn-1', date: '2026-10-20', merchant: 'Shell', category: 'TRANSPORT', type: 'DEBIT', amount: 900 },
];

const pageOf = (items, overrides = {}) => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  ...overrides,
});

const lastRequest = () => getTransactionPage.mock.lastCall[0];

describe('TransactionsPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getTransactionPage.mockResolvedValue(pageOf(transactions));
  });

  it('shows the first page, newest first', async () => {
    render(<TransactionsPanel range={range} />);

    expect(await screen.findByText('Spar')).toBeInTheDocument();
    expect(screen.getByText('2 found')).toBeInTheDocument();
    expect(lastRequest()).toMatchObject({ ...range, page: 1, sortBy: 'date', sortDirection: 'desc' });
  });

  it('searches by merchant once typing pauses', async () => {
    render(<TransactionsPanel range={range} />);
    await screen.findByText('Spar');

    await userEvent.type(screen.getByLabelText('Search merchant'), 'spar');

    await waitFor(() => expect(lastRequest()).toMatchObject({ search: 'spar' }));
  });

  it('filters by category', async () => {
    render(<TransactionsPanel range={range} />);
    await screen.findByText('Spar');

    await userEvent.selectOptions(screen.getByLabelText('Category'), 'GROCERIES');

    await waitFor(() => expect(lastRequest()).toMatchObject({ category: 'GROCERIES' }));
  });

  it('sorts by amount, then flips the direction', async () => {
    render(<TransactionsPanel range={range} />);
    await screen.findByText('Spar');

    await userEvent.click(screen.getByRole('button', { name: 'Amount' }));
    await waitFor(() => expect(lastRequest()).toMatchObject({ sortBy: 'amount', sortDirection: 'desc' }));
    expect(screen.getByRole('columnheader', { name: 'Amount' })).toHaveAttribute('aria-sort', 'descending');

    await userEvent.click(screen.getByRole('button', { name: 'Amount' }));
    await waitFor(() => expect(lastRequest()).toMatchObject({ sortBy: 'amount', sortDirection: 'asc' }));
  });

  it('moves to the next page, and back to page 1 when a filter changes', async () => {
    getTransactionPage.mockResolvedValue(pageOf(transactions, { total: 25, totalPages: 3 }));
    render(<TransactionsPanel range={range} />);
    expect(await screen.findByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(lastRequest()).toMatchObject({ page: 2 }));

    await userEvent.selectOptions(screen.getByLabelText('Category'), 'TRANSPORT');
    await waitFor(() => expect(lastRequest()).toMatchObject({ category: 'TRANSPORT', page: 1 }));
  });

  it('shows an empty state and clears the filters', async () => {
    render(<TransactionsPanel range={range} />);
    await screen.findByText('Spar');

    getTransactionPage.mockResolvedValue(pageOf([]));
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'HEALTH');

    expect(await screen.findByText('No transactions match your filters.')).toBeInTheDocument();

    getTransactionPage.mockResolvedValue(pageOf(transactions));
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByLabelText('Category')).toHaveValue('');
    expect(await screen.findByText('Spar')).toBeInTheDocument();
  });

  it('shows an error when loading fails', async () => {
    getTransactionPage.mockRejectedValue(new Error('boom'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<TransactionsPanel range={range} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded');
  });
});