import { useEffect, useState } from 'react';
import { CATEGORIES } from '../data/categories';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { spendingService } from '../services/spendingService';
import Pagination from './Pagination';
import TransactionsTable from './TransactionsTable';

const SEARCH_DELAY_MS = 250;
const PAGE_SIZE = 10;
const DEFAULT_SORT = { by: 'date', direction: 'desc' };

export default function TransactionsPanel({ range }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState(DEFAULT_SORT);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DELAY_MS);

  // The page belongs to one particular question (period + filters + sort).
  // When the question changes, the remembered page no longer applies, so we're back on page 1.
  const queryKey = JSON.stringify({ range, category, debouncedSearch, sort });
  const [pageState, setPageState] = useState({ key: queryKey, page: 1 });
  const page = pageState.key === queryKey ? pageState.page : 1;
  const goToPage = (nextPage) => setPageState({ key: queryKey, page: nextPage });

  const [state, setState] = useState({ status: 'loading', result: null });

  useEffect(() => {
    let cancelled = false;
    // Keep showing the previous results while the new ones load.
    setState((previous) => ({ ...previous, status: 'loading' }));

    spendingService
      .getTransactionPage({
        ...range,
        category: category || undefined,
        search: debouncedSearch,
        sortBy: sort.by,
        sortDirection: sort.direction,
        page,
        pageSize: PAGE_SIZE,
      })
      .then((result) => {
        if (!cancelled) setState({ status: 'ready', result });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        setState({ status: 'error', result: null });
      });

    return () => {
      cancelled = true;
    };
  }, [range, category, debouncedSearch, sort, page]);

  const result = state.result;
  const hasFilters = search !== '' || category !== '';
  const clearFilters = () => {
    setSearch('');
    setCategory('');
  };

  return (
    <section className="card" aria-labelledby="transactions-heading">
      <header className="band">
        <h2 id="transactions-heading">Transactions</h2>
        {state.status === 'ready' && <span className="band-note">{result.total} found</span>}
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

      {state.status === 'ready' && result.total === 0 && (
        <div className="card-body empty">
          <p className="muted">No transactions match your filters.</p>
          {hasFilters && (
            <button type="button" className="link-button" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {state.status !== 'error' && result && result.items.length > 0 && (
        <>
          <TransactionsTable transactions={result.items} sort={sort} onSortChange={setSort} />
          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            totalPages={result.totalPages}
            onPageChange={goToPage}
          />
        </>
      )}
    </section>
  );
}