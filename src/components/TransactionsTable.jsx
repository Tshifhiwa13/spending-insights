import { categoryLabel } from '../data/categories';
import { formatDate, formatMoney } from '../utils/format';

function SortableHeader({ label, column, sort, onSortChange, className }) {
  const isActive = sort.by === column;
  const ariaSort = isActive ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none';
  // First click sorts highest/newest first; clicking the active column flips the direction.
  const nextDirection = isActive && sort.direction === 'desc' ? 'asc' : 'desc';
  const icon = isActive ? (sort.direction === 'asc' ? '▲' : '▼') : '↕';

  return (
    <th scope="col" aria-sort={ariaSort} className={className}>
      <button type="button" className="sort-button" onClick={() => onSortChange({ by: column, direction: nextDirection })}>
        {label}
        <span className="sort-icon" aria-hidden="true">
          {icon}
        </span>
      </button>
    </th>
  );
}

export default function TransactionsTable({ transactions, sort, onSortChange }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <SortableHeader label="Date" column="date" sort={sort} onSortChange={onSortChange} />
            <th scope="col">Merchant</th>
            <th scope="col">Category</th>
            <SortableHeader label="Amount" column="amount" sort={sort} onSortChange={onSortChange} className="amount" />
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
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
  );
}