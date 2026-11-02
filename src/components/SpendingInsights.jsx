import { categoryLabel } from '../data/categories';
import { formatMoney, formatPercent } from '../utils/format';

const TOP_CHANGES = 4;

/** "R 2 340,00 (12%) more" or "R 350,00 (22%) less". */
function describeChange(change, percent) {
  const amount = formatMoney(Math.abs(change));
  const share = percent === null ? '' : ` (${formatPercent(Math.abs(percent))})`;
  return `${amount}${share} ${change > 0 ? 'more' : 'less'}`;
}

export default function SpendingInsights({ comparison }) {
  const periodText = `the previous ${comparison.days} days`;

  return (
    <section className="card" aria-labelledby="insights-heading">
      <header className="band">
        <h2 id="insights-heading">Compared with the previous period</h2>
      </header>

      <div className="card-body">
        {!comparison.available ? (
          <p className="muted">
            There isn’t enough history to compare this period with {periodText}. Try a shorter period.
          </p>
        ) : (
          <>
            <p className="insight-headline">
              {comparison.change === 0
                ? `You spent the same as in ${periodText}.`
                : `You spent ${describeChange(comparison.change, comparison.percent)} than in ${periodText}.`}
            </p>

            <ul className="insight-list">
              {comparison.categories
                .filter((c) => c.change !== 0)
                .slice(0, TOP_CHANGES)
                .map((c) => {
                  const isUp = c.change > 0;
                  return (
                    <li key={c.category} className={isUp ? 'insight-up' : 'insight-down'}>
                      <span className="trend-icon" aria-hidden="true">
                        {isUp ? '▲' : '▼'}
                      </span>
                      <span>{categoryLabel(c.category)}</span>
                      <span className="insight-change">
                        {c.previous === 0 ? `${formatMoney(c.change)} new` : describeChange(c.change, c.percent)}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}