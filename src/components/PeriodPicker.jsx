const PERIODS = [
  { days: 30, label: '30 days' },
  { days: 90, label: '3 months' },
  { days: 180, label: '6 months' },
];

/** `value` is the selected number of days, or 'custom' for a custom range. */
export default function PeriodPicker({ value, isCustomOpen, onSelectPreset, onToggleCustom }) {
  return (
    <div className="period-picker" role="group" aria-label="Time period">
      {PERIODS.map((period) => (
        <button
          key={period.days}
          type="button"
          aria-pressed={value === period.days}
          onClick={() => onSelectPreset(period.days)}
        >
          {period.label}
        </button>
      ))}
      <button
        type="button"
        aria-pressed={value === 'custom'}
        aria-expanded={isCustomOpen}
        aria-controls="custom-range"
        onClick={onToggleCustom}
      >
        Custom
      </button>
    </div>
  );
}