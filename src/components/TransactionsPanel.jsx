import { useEffect, useState } from 'react';
import { CATEGORIES } from '../data/categories';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { spendingService } from '../services/spendingService';
import TransactionsTable from './TransactionsTable';

const SEARCH_DELAY_MS = 250;

export default function TransactionsPanel({ range }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [state, setState] = useState({ status: 'loading', transactions: [] });
  const debouncedSearch = useDebouncedValue(search, SEARCH_DELAY_MS);

  useEffect(() => {
    let cancelled = false;
    // Keep showing the previous results while the new ones load.
    setState((previous) => ({ ...previous, status: 'loading' }));

    spendingService
      .getTransactions({ ...range, category: category || undefined, search: debouncedSearch })
      .then((transactions) => {
        if (!cancelled) setState({ status: 'ready', transactions });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        setState({ status: 'error', transactions: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [range, category, debouncedSearch]);

  const hasFilters = search !== '' || category !== '';
  const clearFilters = () => {
    setSearch('');
    setCategory('');
  };

  return (
    <section className="card" aria-labelledby="transactions-heading">
      <header className="band">
        <h2 id="transactions-heading">Transactions</h2>
        {state.status === 'ready' && <span className="band-note">{state.transactions.length} found</span>}
      </header>

      <div className="toolbar">
        <div className="field field-grow">
          <label htmlFor="txn-search">Search merchant</label>
          <input
            id="txn-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="e.g. Checkers"
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label htmlFor="txn-category">Category</label>
          <select id="txn-category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {Object.entries(CATEGORIES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Screen readers announce changes in a status region. */}
      <p className="panel-status" role="status">
        {state.status === 'loading' ? 'Updating…' : ''}
      </p>

      {state.status === 'error' && (
        <p className="card-body status-error" role="alert">
          Transactions could not be loaded. Try again in a moment.
        </p>
      )}

      {state.status === 'ready' && state.transactions.length === 0 && (
        <div className="card-body empty">
          <p className="muted">No transactions match your filters.</p>
          {hasFilters && (
            <button type="button" className="link-button" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {state.status !== 'error' && state.transactions.length > 0 && (
        <TransactionsTable transactions={state.transactions} />
      )}
    </section>
  );
}