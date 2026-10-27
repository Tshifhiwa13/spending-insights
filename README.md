# Customer Spending Insights Dashboard

A responsive dashboard that shows a customer's spending by period and category, backed by a Java (Spring Boot) API serving mocked transaction data.

## Tech stack

| Layer    | Technology                                   |
|----------|----------------------------------------------|
| Frontend | React 18, TypeScript, Vite, Vitest           |
| Backend  | Java 21, Spring Boot 3, JUnit 5              |
| Runtime  | Docker, Docker Compose, Nginx                |
| CI       | GitHub Actions                               |

## Run with Docker (recommended)

Requirements: Docker Desktop (or Docker Engine with Compose).

```bash
docker compose up --build
```

- Dashboard: http://localhost:3000
- API: http://localhost:8080/api/insights/summary
- Health check: http://localhost:8080/actuator/health

## Run locally for development

Requirements: Java 21, Maven 3.9+, Node.js 20+.

```bash
# Terminal 1 — backend on :8080
cd backend
mvn spring-boot:run

# Terminal 2 — frontend on :5173 (proxies /api to :8080)
cd frontend
npm install
npm run dev
```

## Test

```bash
cd backend && mvn verify          # backend unit + API tests
cd frontend && npm test           # frontend component tests
cd frontend && npm run typecheck  # TypeScript checks
```

## API

| Method | Endpoint               | Query parameters                                  | Description                                |
|--------|------------------------|---------------------------------------------------|--------------------------------------------|
| GET    | `/api/transactions`    | `from`, `to` (YYYY-MM-DD), `category` (optional) | Transactions in range, newest first        |
| GET    | `/api/insights/summary`| `from`, `to` (YYYY-MM-DD)                         | Totals spent and received, by category     |

If `from`/`to` are omitted, the last 30 days are used. Invalid input returns `400` with an RFC 7807 problem-details body.

Mock data covers the last 180 days and is generated with a fixed seed, so it's the same on every start.

## Project structure

```
backend/    Spring Boot API (mock data, business logic, tests)
frontend/   React app (dashboard UI, API client, tests)
.github/    CI pipeline
docker-compose.yml
```

## Design decisions

- **Mock data lives behind a repository class**, so swapping in a real database later only touches one class.
- **Nginx proxies `/api` to the backend**, so the browser talks to one origin and no CORS setup is needed.
- **Time is injected via `Clock`**, which keeps date-based tests deterministic.

## Roadmap

- [ ] Spending trend chart
- [ ] Transaction search, filtering, sorting and pagination
- [ ] Custom date range picker
- [ ] End-to-end tests (Playwright)
