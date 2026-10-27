import { categoryLabel } from '../data/categories';
import { formatMoney } from '../utils/format';

export default function CategoryBreakdown({ categories }) {
  const largest = categories[0]?.total ?? 0;

  return (
    <section className="panel" aria-labelledby="categories-heading">
      <h2 id="categories-heading">Where it went</h2>
      {categories.length === 0 ? (
        <p className="muted">No spending in this period.</p>
      ) : (
        <ul className="category-list">
          {categories.map((item) => (
            <li key={item.category}>
              <div className="category-row">
                <span>{categoryLabel(item.category)}</span>
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
  );
}
