import { formatMoney, formatStatementDate } from '../utils/format';

export default function StatementInfo({ from, to, totalIncome, totalSpent }) {
  const net = totalIncome - totalSpent;

  return (
    <section className="card statement" aria-labelledby="statement-heading">
      <h2 id="statement-heading">Statement information</h2>
      <dl className="statement-grid">
        <div>
          <dt>From date</dt>
          <dd>{formatStatementDate(from)}</dd>
        </div>
        <div>
          <dt>Money in</dt>
          <dd className="money-in">{formatMoney(totalIncome)}</dd>
        </div>
        <div>
          <dt>To date</dt>
          <dd>{formatStatementDate(to)}</dd>
        </div>
        <div>
          <dt>Money out</dt>
          <dd className="money-out">−{formatMoney(totalSpent)}</dd>
        </div>
        <div className="statement-net">
          <dt>Net for period</dt>
          <dd className={net < 0 ? 'money-out' : 'money-in'}>{formatMoney(net)}</dd>
        </div>
      </dl>
    </section>
  );
}
