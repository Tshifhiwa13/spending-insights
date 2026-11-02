import { useState } from 'react';
import { validateRange } from '../utils/dates';

export default function CustomRangeForm({ initialRange, limits, onApply, onCancel }) {
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault(); // Stop the browser reloading the page.
    const problem = validateRange({ from, to }, limits);
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    onApply({ from, to });
  }

  // Links each input to the error message, so screen readers read it out.
  const errorProps = error ? { 'aria-invalid': true, 'aria-describedby': 'range-error' } : {};

  return (
    <form id="custom-range" className="custom-range" aria-label="Custom date range" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="range-from">From</label>
        <input
          id="range-from"
          type="date"
          value={from}
          min={limits.min}
          max={limits.max}
          onChange={(event) => setFrom(event.target.value)}
          {...errorProps}
        />
      </div>
      <div className="field">
        <label htmlFor="range-to">To</label>
        <input
          id="range-to"
          type="date"
          value={to}
          min={limits.min}
          max={limits.max}
          onChange={(event) => setTo(event.target.value)}
          {...errorProps}
        />
      </div>
      <div className="custom-range-actions">
        <button type="submit" className="button-primary">
          Apply
        </button>
        <button type="button" className="button-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
      {error && (
        <p id="range-error" className="range-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}