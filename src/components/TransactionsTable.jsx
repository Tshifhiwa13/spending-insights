import { categoryLabel } from '../data/categories';
import { formatDate, formatMoney } from '../utils/format';

const ROWS_SHOWN = 12;

export default function TransactionsTable({ transactions }) {
  return (
    <section className="card" aria-labelledby="recent-heading">
      <header className="band">
        <h2 id="recent-heading">Recent transactions</h2>
        <span className="band-note">{transactions.length} in period</span>
      </header>

      {transactions.length === 0 ? (
        <p className="muted card-body">No transactions in this period.</p>
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
              {transactions.slice(0, ROWS_SHOWN).map((t) => {
                const isIncome = t.type === 'CREDIT';
                return (
                  <tr key={t.id}>
                    <td>{formatDate(t.date)}</td>
                    <td>{t.merchant}</td>
                    <td>{categoryLabel(t.category)}</td>
                    <td className={`amount ${isIncome ? 'money-in' : 'money-out'}`}>
                      {isIncome ? '+' : '−'}
                      {formatMoney(t.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
