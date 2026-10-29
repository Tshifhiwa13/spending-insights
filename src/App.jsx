import { useEffect, useMemo, useState } from 'react';
import MoneySummary from './components/MoneySummary';
import MonthlyTrend from './components/MonthlyTrend';
import PeriodPicker from './components/PeriodPicker';
import SpendingDonut from './components/SpendingDonut';
import StatementInfo from './components/StatementInfo';
import TransactionsPanel from './components/TransactionsPanel';
import { categoryLabel } from './data/categories';
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

    Promise.all([spendingService.getSummary(range), spendingService.getMonthlyTotals(range)])
      .then(([summary, monthly]) => {
        if (!cancelled) setState({ status: 'ready', summary, monthly });
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
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <h1>Your spending</h1>
          <PeriodPicker value={days} onChange={setDays} />
        </div>
      </header>

      <main className="page" aria-busy={state.status === 'loading'}>
        {state.status === 'loading' && <p className="status">Loading your spending…</p>}

        {state.status === 'error' && (
          <div className="status status-error" role="alert">
            <p>Your spending data could not be loaded. Try again in a moment.</p>
            <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
              Try again
            </button>
          </div>
        )}

        {state.status === 'ready' && <Dashboard summary={state.summary} monthly={state.monthly} range={range} />}
      </main>
    </>
  );
}

function Dashboard({ summary, monthly, range }) {
  const moneyIn = summary.incomeBySource.map((s) => ({ label: s.source, total: s.total }));
  const moneyOut = summary.byCategory.map((c) => ({ label: categoryLabel(c.category), total: c.total }));

  return (
    <div className="dashboard">
      <StatementInfo
        from={summary.from}
        to={summary.to}
        totalIncome={summary.totalIncome}
        totalSpent={summary.totalSpent}
      />

      <MonthlyTrend months={monthly} />

      <div className="grid-2">
        <MoneySummary
          title="Money in"
          tone="in"
          total={summary.totalIncome}
          rows={moneyIn}
          emptyText="No money received in this period."
        />
        <MoneySummary
          title="Money out"
          tone="out"
          total={summary.totalSpent}
          rows={moneyOut}
          emptyText="No spending in this period."
        />
      </div>

      <div className="grid-2 grid-wide-right">
        <SpendingDonut categories={summary.byCategory} totalSpent={summary.totalSpent} />
        <TransactionsPanel range={range} />
      </div>
    </div>
  );
}
