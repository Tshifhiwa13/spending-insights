import { useEffect, useMemo, useState } from 'react';
import CustomerProfile from './components/CustomerProfile';
import CustomRangeForm from './components/CustomRangeForm';
import MoneySummary from './components/MoneySummary';
import MonthlyTrend from './components/MonthlyTrend';
import PeriodPicker from './components/PeriodPicker';
import SpendingDonut from './components/SpendingDonut';
import SpendingInsights from './components/SpendingInsights';
import StatementInfo from './components/StatementInfo';
import TransactionsPanel from './components/TransactionsPanel';
import { categoryLabel } from './data/categories';
import { DAYS_OF_HISTORY } from './data/mockTransactions';
import { spendingService } from './services/spendingService';
import { lastNDays } from './utils/dates';

export default function App() {
  // Either a preset ({ days: 30 }) or a custom range ({ from, to }).
  const [period, setPeriod] = useState({ days: 30 });
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ status: 'loading' });

  const range = useMemo(
    () => (period.days ? lastNDays(period.days) : { from: period.from, to: period.to }),
    [period],
  );
  // The dates mock data exists for: the earliest generated day up to today.
  const limits = useMemo(() => ({ min: lastNDays(DAYS_OF_HISTORY).from, max: lastNDays(1).to }), []);

  useEffect(() => {
    let cancelled = false;
    // If a dashboard is already showing, keep it on screen while the new period loads,
    // instead of blanking the page. Only the very first load shows the loading message.
    setState((previous) => (previous.status === 'ready' ? { ...previous, isUpdating: true } : { status: 'loading' }));

    Promise.all([
      spendingService.getSummary(range),
      spendingService.getMonthlyTotals(range),
      spendingService.getComparison(range),
    ])
      .then(([summary, monthly, comparison]) => {
        if (!cancelled) setState({ status: 'ready', summary, monthly, comparison, isUpdating: false });
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

  function selectPreset(days) {
    setPeriod({ days });
    setIsCustomOpen(false);
  }

  function applyCustomRange(customRange) {
    setPeriod(customRange);
    setIsCustomOpen(false);
  }

  const isBusy = state.status === 'loading' || Boolean(state.isUpdating);
  let statusMessage = '';
  if (state.status === 'loading') statusMessage = 'Loading your spending…';
  else if (state.isUpdating) statusMessage = 'Updating your spending…';

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <header className="topbar">
        <div className="topbar-inner">
          <h1>Your spending</h1>
          <PeriodPicker
            value={period.days ?? 'custom'}
            isCustomOpen={isCustomOpen}
            onSelectPreset={selectPreset}
            onToggleCustom={() => setIsCustomOpen((open) => !open)}
          />
        </div>
        {isCustomOpen && (
          <div className="topbar-inner topbar-custom">
            <CustomRangeForm
              initialRange={range}
              limits={limits}
              onApply={applyCustomRange}
              onCancel={() => setIsCustomOpen(false)}
            />
          </div>
        )}
      </header>

      <main id="main" tabIndex={-1} className="page" aria-busy={isBusy}>
        <CustomerProfile />

        {/* One status region, so screen readers announce loading and updating. */}
        <p className="page-status" role="status">
          {statusMessage}
        </p>

        {state.status === 'error' && (
          <div className="status status-error" role="alert">
            <p>Your spending data could not be loaded. Try again in a moment.</p>
            <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
              Try again
            </button>
          </div>
        )}

        {state.status === 'ready' && (
          <Dashboard
            summary={state.summary}
            monthly={state.monthly}
            comparison={state.comparison}
            range={range}
            isUpdating={state.isUpdating}
          />
        )}
      </main>
    </>
  );
}

function Dashboard({ summary, monthly, comparison, range, isUpdating }) {
  const moneyIn = summary.incomeBySource.map((s) => ({ label: s.source, total: s.total }));
  const moneyOut = summary.byCategory.map((c) => ({ label: categoryLabel(c.category), total: c.total }));

  return (
    <div className={isUpdating ? 'dashboard is-updating' : 'dashboard'}>
      <div className="grid-2">
        <StatementInfo
          from={summary.from}
          to={summary.to}
          totalIncome={summary.totalIncome}
          totalSpent={summary.totalSpent}
        />
        <SpendingInsights comparison={comparison} />
      </div>

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