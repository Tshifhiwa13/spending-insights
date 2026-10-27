import { categoryColor, categoryLabel } from '../data/categories';
import { formatMoney, formatPercent } from '../utils/format';

const RADIUS = 60;
const STROKE = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function SpendingDonut({ categories, totalSpent }) {
  let offset = 0;
  const slices = categories.map((item) => {
    const share = totalSpent > 0 ? item.total / totalSpent : 0;
    const slice = { ...item, share, length: share * CIRCUMFERENCE, offset };
    offset += slice.length;
    return slice;
  });

  return (
    <section className="card" aria-labelledby="mix-heading">
      <header className="band">
        <h2 id="mix-heading">Spending mix</h2>
      </header>

      {slices.length === 0 ? (
        <p className="muted card-body">No spending in this period.</p>
      ) : (
        <div className="donut-layout card-body">
          <svg className="donut" viewBox="0 0 160 160" role="img" aria-label={`Total spent ${formatMoney(totalSpent)}, split by category`}>
            <g transform="rotate(-90 80 80)">
              {slices.map((slice) => (
                <circle
                  key={slice.category}
                  cx="80"
                  cy="80"
                  r={RADIUS}
                  fill="none"
                  stroke={categoryColor(slice.category)}
                  strokeWidth={STROKE}
                  strokeDasharray={`${slice.length} ${CIRCUMFERENCE - slice.length}`}
                  strokeDashoffset={-slice.offset}
                />
              ))}
            </g>
            <text x="80" y="76" textAnchor="middle" className="donut-caption">Spent</text>
            <text x="80" y="94" textAnchor="middle" className="donut-total">
              {formatMoney(Math.round(totalSpent))}
            </text>
          </svg>

          <ul className="legend">
            {slices.map((slice) => (
              <li key={slice.category}>
                <span className="legend-dot" style={{ background: categoryColor(slice.category) }} aria-hidden="true" />
                <span className="legend-label">{categoryLabel(slice.category)}</span>
                <span className="legend-share">{formatPercent(slice.share)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
