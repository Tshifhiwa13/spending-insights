import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMoney } from '../utils/format';

// SVG fill attributes can't read CSS variables, so the colours are set here.
const BLUE = '#1fa2de';
const RED = '#e5373a';

const monthLabel = new Intl.DateTimeFormat('en-ZA', { month: 'short' });
const toLabel = (month) => monthLabel.format(new Date(`${month}-01T00:00:00`));
const shortRand = (value) => `R${Math.round(value / 1000)}k`;

export default function MonthlyTrend({ months }) {
  const data = months.map((m) => ({ ...m, label: toLabel(m.month) }));

  return (
    <section className="card" aria-labelledby="trend-heading">
      <header className="band">
        <h2 id="trend-heading">Money in and out by month</h2>
      </header>

      {data.length === 0 ? (
        <p className="muted card-body">No transactions in this period.</p>
      ) : (
        <div className="card-body chart">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} accessibilityLayer>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} />
              <YAxis tickFormatter={shortRand} tickLine={false} axisLine={false} width={48} />
              <Tooltip formatter={(value) => formatMoney(value)} />
              <Legend />
              <Bar dataKey="moneyIn" name="Money in" fill={BLUE} radius={[4, 4, 0, 0]} />
              <Bar dataKey="moneyOut" name="Money out" fill={RED} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}