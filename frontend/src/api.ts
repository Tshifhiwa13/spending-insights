import type { DateRange, SpendingSummary, Transaction } from './types';

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

const query = (range: DateRange) => new URLSearchParams({ from: range.from, to: range.to }).toString();

export const fetchSummary = (range: DateRange, signal?: AbortSignal) =>
  getJson<SpendingSummary>(`/api/insights/summary?${query(range)}`, signal);

export const fetchTransactions = (range: DateRange, signal?: AbortSignal) =>
  getJson<Transaction[]>(`/api/transactions?${query(range)}`, signal);
