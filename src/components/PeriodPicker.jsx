export const PERIODS = [
  { days: 30, label: '30 days' },
  { days: 90, label: '3 months' },
  { days: 180, label: '6 months' },
];

export default function PeriodPicker({ value, onChange }) {
  return (
    <div className="period-picker" role="group" aria-label="Time period">
      {PERIODS.map((period) => (
        <button
          key={period.days}
          type="button"
          aria-pressed={value === period.days}
          onClick={() => onChange(period.days)}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
