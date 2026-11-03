import { expect, test } from '@playwright/test';

/** Date `days` ago as YYYY-MM-DD, using the local calendar like the app does. */
function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const asStatementDate = (isoDate) => isoDate.split('-').reverse().join('/');

// exact: true matches the whole label, so "To" doesn't also match "Total spent" or "Custom".
const fromInput = (page) => page.getByLabel('From', { exact: true });
const toInput = (page) => page.getByLabel('To', { exact: true });
const categorySelect = (page) => page.getByLabel('Category', { exact: true });
const searchInput = (page) => page.getByLabel('Search merchant', { exact: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Statement information' })).toBeVisible();
});

test.describe('dashboard', () => {
  test('shows the last 30 days by default', async ({ page }) => {
    await expect(page.getByRole('button', { name: '30 days' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { name: 'Money in', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Money out', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Compared with the previous period' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible();
    await expect(page.getByText(asStatementDate(daysAgo(29)))).toBeVisible();
  });

  test('changes the statement period with the preset buttons', async ({ page }) => {
    await page.getByRole('button', { name: '3 months' }).click();

    await expect(page.getByRole('button', { name: '3 months' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText(asStatementDate(daysAgo(89)))).toBeVisible();
  });

  test('applies a custom date range', async ({ page }) => {
    const from = daysAgo(60);
    const to = daysAgo(31);

    await page.getByRole('button', { name: 'Custom' }).click();
    await fromInput(page).fill(from);
    await toInput(page).fill(to);
    await page.getByRole('button', { name: 'Apply' }).click();

    await expect(page.getByRole('button', { name: 'Custom' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText(asStatementDate(from))).toBeVisible();
    await expect(page.getByText(asStatementDate(to))).toBeVisible();
  });

  test('explains an invalid custom range', async ({ page }) => {
    await page.getByRole('button', { name: 'Custom' }).click();
    await fromInput(page).fill(daysAgo(5));
    await toInput(page).fill(daysAgo(20));
    await page.getByRole('button', { name: 'Apply' }).click();

    await expect(page.getByRole('alert')).toContainText('start date must be on or before the end date');
  });
});

test.describe('transactions', () => {
  test.beforeEach(async ({ page }) => {
    // More transactions makes searching, filtering and paging meaningful.
    await page.getByRole('button', { name: '3 months' }).click();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  });

  const merchantCells = (page) => page.locator('tbody tr td:nth-child(2)');
  const categoryCells = (page) => page.locator('tbody tr td:nth-child(3)');

  test('searches by merchant', async ({ page }) => {
    await searchInput(page).fill('checkers');

    await expect.poll(async () => [...new Set(await merchantCells(page).allTextContents())]).toEqual(['Checkers']);
  });

  test('filters by category and clears the filter', async ({ page }) => {
    await categorySelect(page).selectOption('GROCERIES');
    await expect.poll(async () => [...new Set(await categoryCells(page).allTextContents())]).toEqual(['Groceries']);

    await categorySelect(page).selectOption('');
    await expect.poll(async () => new Set(await categoryCells(page).allTextContents()).size).toBeGreaterThan(1);
  });

  test('sorts by amount', async ({ page }) => {
    const amountHeader = page.getByRole('columnheader', { name: 'Amount' });

    await page.getByRole('button', { name: 'Amount' }).click();
    await expect(amountHeader).toHaveAttribute('aria-sort', 'descending');

    await page.getByRole('button', { name: 'Amount' }).click();
    await expect(amountHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  test('pages through results and returns to page 1 when filtering', async ({ page }) => {
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText(/^Page 2 of \d+$/)).toBeVisible();

    await categorySelect(page).selectOption('TRANSPORT');
    await expect(page.getByText(/^Page 1 of \d+$/)).toBeVisible();
  });
});