import { useId } from 'react';
import { formatMoney } from '../utils/format';

/**
 * A statement-style summary panel: a band with the title and total,
 * then one row per item with a proportional bar.
 * `tone` is "in" (blue, positive) or "out" (red, negative).
 */
export default function MoneySummary({ title, total, rows, tone, emptyText }) {
  const headingId = useId();
  const sign = tone === 'out' ? '−' : '';
  const largest = rows.reduce((max, row) => Math.max(max, row.total), 0);

  return (
    <section className={`card summary summary-${tone}`} aria-labelledby={headingId}>
      <header className="band">
        <h2 id={headingId}>{title}</h2>
        <span className="band-total">
          {sign}
          {formatMoney(total)}
        </span>
      </header>

      {rows.length === 0 ? (
        <p className="muted card-body">{emptyText}</p>
      ) : (
        <ul className="summary-rows">
          {rows.map((row) => (
            <li key={row.label}>
              <span className="row-label">{row.label}</span>
              <span className="row-bar" aria-hidden="true">
                <span className="row-bar-fill" style={{ width: `${Math.max((row.total / largest) * 100, 3)}%` }} />
              </span>
              <span className="row-amount">
                {sign}
                {formatMoney(row.total)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
