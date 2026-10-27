import { useEffect, useMemo, useState } from 'react';
import CategoryBreakdown from './components/CategoryBreakdown';
import PeriodPicker from './components/PeriodPicker';
import SummaryTotals from './components/SummaryTotals';
import TransactionsTable from './components/TransactionsTable';
import { spendingService } from './services/spendingService';
import { lastNDays } from './utils/dates';

export default function App() {
  const [days, setDays] = useState(30);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ status: 'loading' });
  const range = useMemo(() => lastNDays(days), [days]);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    Promise.all([spendingService.getSummary(range), spendingService.getTransactions(range)])
      .then(([summary, transactions]) => {
        if (!cancelled) setState({ status: 'ready', summary, transactions });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        setState({ status: 'error' });
      });

    // Ignore results from an older request if the period changes mid-load.
    return () => {
      cancelled = true;
    };
  }, [range, reloadKey]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Your spending</h1>
        <PeriodPicker value={days} onChange={setDays} />
      </header>

      <main aria-busy={state.status === 'loading'}>
        {state.status === 'loading' && <p className="status">Loading your spending…</p>}

        {state.status === 'error' && (
          <div className="status status-error" role="alert">
            <p>Your spending data could not be loaded. Try again in a moment.</p>
            <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
              Try again
            </button>
          </div>
        )}

        {state.status === 'ready' && (
          <>
            <SummaryTotals totalSpent={state.summary.totalSpent} totalIncome={state.summary.totalIncome} />
            <div className="columns">
              <CategoryBreakdown categories={state.summary.byCategory} />
              <TransactionsTable transactions={state.transactions} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
