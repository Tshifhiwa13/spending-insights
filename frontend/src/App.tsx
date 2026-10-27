import { useEffect, useMemo, useState } from 'react';
import { fetchSummary, fetchTransactions } from './api';
import { CATEGORY_LABELS, formatDate, formatMoney, lastNDays } from './format';
import type { SpendingSummary, Transaction } from './types';

const PERIODS = [
  { days: 30, label: '30 days' },
  { days: 90, label: '3 months' },
  { days: 180, label: '6 months' },
];

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; summary: SpendingSummary; transactions: Transaction[] };

export default function App() {
  const [days, setDays] = useState(30);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const range = useMemo(() => lastNDays(days), [days]);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });

    Promise.all([fetchSummary(range, controller.signal), fetchTransactions(range, controller.signal)])
      .then(([summary, transactions]) => setState({ status: 'ready', summary, transactions }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setState({ status: 'error', message: 'Your spending data could not be loaded.' });
      });

    return () => controller.abort();
  }, [range, reloadKey]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Your spending</h1>
        <div className="period-picker" role="group" aria-label="Time period">
          {PERIODS.map((period) => (
            <button
              key={period.days}
              type="button"
              aria-pressed={days === period.days}
              onClick={() => setDays(period.days)}
            >
              {period.label}
            </button>
          ))}
        </div>
      </header>

      <main aria-busy={state.status === 'loading'}>
        {state.status === 'loading' && <p className="status">Loading your spending…</p>}

        {state.status === 'error' && (
          <div className="status status-error" role="alert">
            <p>{state.message} Check your connection and try again.</p>
            <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
              Try again
            </button>
          </div>
        )}

        {state.status === 'ready' && <Dashboard summary={state.summary} transactions={state.transactions} />}
      </main>
    </div>
  );
}

function Dashboard({ summary, transactions }: { summary: SpendingSummary; transactions: Transaction[] }) {
  const net = summary.totalIncome - summary.totalSpent;
  const largest = summary.byCategory[0]?.total ?? 0;

  return (
    <>
      <section className="totals" aria-label="Totals">
        <div className="total total-primary">
          <span className="total-label">Spent</span>
          <span className="total-value">{formatMoney(summary.totalSpent)}</span>
        </div>
        <div className="total">
          <span className="total-label">Money in</span>
          <span className="total-value">{formatMoney(summary.totalIncome)}</span>
        </div>
        <div className="total">
          <span className="total-label">Left over</span>
          <span className={`total-value ${net < 0 ? 'negative' : ''}`}>{formatMoney(net)}</span>
        </div>
      </section>

      <div className="columns">
        <section className="panel" aria-labelledby="categories-heading">
          <h2 id="categories-heading">Where it went</h2>
          {summary.byCategory.length === 0 ? (
            <p className="muted">No spending in this period.</p>
          ) : (
            <ul className="category-list">
              {summary.byCategory.map((item) => (
                <li key={item.category}>
                  <div className="category-row">
                    <span>{CATEGORY_LABELS[item.category]}</span>
                    <span className="amount">{formatMoney(item.total)}</span>
                  </div>
                  <div className="bar" aria-hidden="true">
                    <div className="bar-fill" style={{ width: `${(item.total / largest) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel" aria-labelledby="recent-heading">
          <h2 id="recent-heading">Recent transactions</h2>
          {transactions.length === 0 ? (
            <p className="muted">No transactions in this period.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Merchant</th>
                    <th scope="col">Category</th>
                    <th scope="col" className="amount">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 15).map((t) => (
                    <tr key={t.id}>
                      <td>{formatDate(t.date)}</td>
                      <td>{t.merchant}</td>
                      <td>{CATEGORY_LABELS[t.category]}</td>
                      <td className={`amount ${t.type === 'CREDIT' ? 'positive' : ''}`}>
                        {t.type === 'CREDIT' ? '+' : '−'}
                        {formatMoney(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
