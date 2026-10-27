import { formatMoney } from '../utils/format';

export default function SummaryTotals({ totalSpent, totalIncome }) {
  const leftOver = totalIncome - totalSpent;

  return (
    <section className="totals" aria-label="Totals">
      <div className="total total-primary">
        <span className="total-label">Spent</span>
        <span className="total-value">{formatMoney(totalSpent)}</span>
      </div>
      <div className="total">
        <span className="total-label">Money in</span>
        <span className="total-value">{formatMoney(totalIncome)}</span>
      </div>
      <div className="total">
        <span className="total-label">Left over</span>
        <span className={`total-value ${leftOver < 0 ? 'negative' : ''}`}>{formatMoney(leftOver)}</span>
      </div>
    </section>
  );
}
