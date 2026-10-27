# Customer Spending Insights Dashboard

A responsive dashboard that shows a customer's spending by period and category, built with React and JavaScript using mocked transaction data.

## Tech stack

| Area      | Technology                                   |
|-----------|----------------------------------------------|
| UI        | React 18, JavaScript, HTML, CSS              |
| Build     | Vite                                         |
| Testing   | Vitest, React Testing Library                |
| Quality   | ESLint                                       |
| Runtime   | Docker, Nginx                                |
| CI        | GitHub Actions                               |

## Run with Docker

Requirements: Docker Desktop.

```bash
docker build -t spending-insights .
docker run --rm -p 3000:80 spending-insights
```

Open http://localhost:3000.

The Docker build also runs the linter and tests, so a broken build never produces an image.

## Run locally for development

Requirements: Node.js 20+.

```bash
npm install
npm run dev
```

Open http://localhost:5173. Changes appear instantly.

## Test and lint

```bash
npm test          # run all tests once
npm run test:watch  # re-run tests as you edit
npm run lint      # check code quality
npm run build     # production build into dist/
```

## Project structure

```
src/
  components/   UI pieces (period picker, totals, category breakdown, transactions table)
  data/         Mock transaction generator and category labels
  services/     Mock data service with an async, API-like interface
  utils/        Date and currency formatting helpers
  App.jsx       Page layout, data loading, loading and error states
```

## Mock data

About 6 months of transactions are generated in the browser, ending today, using a fixed random seed. The data is the same on every load, and the most recent periods always have data. Amounts are in South African rand (ZAR).

## Design decisions

- **The data service behaves like a real API.** It's asynchronous, validates its input and adds a short delay, so the UI handles loading and error states properly. Switching to a real backend later means changing only `spendingService.js`.
- **Components are small and focused**, each owning one part of the page, which keeps them easy to test and change.
- **Accessibility is built in:** semantic HTML, labelled sections and tables, `aria-pressed` on period buttons, visible keyboard focus, and dark mode and reduced-motion support.

## Roadmap

- [ ] Spending trend chart over time
- [ ] Transactions page with search, category filter, sorting and pagination
- [ ] Custom date range picker
- [ ] End-to-end tests (Playwright)
