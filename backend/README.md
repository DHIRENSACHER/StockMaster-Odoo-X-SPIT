# StockMaster Backend

Express + MySQL service that powers the StockMaster dashboard. It ships with an enterprise-ready layout: structured routing, central error handling, JWT auth, rate limiting, and schema/seed scripts that mirror the provided inventory tables.

## Quick start

1. Copy `.env.example` to `.env` and set database credentials plus a strong `JWT_SECRET`.
2. Install dependencies: `npm install`
3. Prepare the database (creates tables and demo data): `npm run db:seed`
4. Start the API: `npm run dev` (or `npm start` after `npm run build`)

The service listens on `PORT` (default `4000`). Health check is available at `/health`.

## Key endpoints

- `POST /api/auth/login` – returns `{ token, user }` for email/password (seeded admin: `admin@stockmaster.com` / `Admin@123`).
- `GET /api/products` – list products with quantities.
- `POST /api/products` – create a product (requires auth).
- `GET /api/operations` – list stock moves with line items.
- `POST /api/operations` – create a new stock move.
- `PUT /api/operations/:id` – update header + lines.
- `PATCH /api/operations/:id/status` – update status; validating to `DONE` posts stock/ledger changes.
- `GET /api/ledger` – stock valuation/ledger entries.
- `GET /api/warehouses`, `GET /api/locations` – reference data.

## Database notes

- Schema lives in `sql/schema.sql`; demo data in `sql/seed.sql`.
- Seed sets up admin user, groups/permissions, warehouses/locations, products, quants, sample moves, and ledger rows aligned with the frontend mocks.
- Stock validation logic prevents negative inventory and writes to `inventory_stockvaluationlayer`.

## Frontend integration

The frontend uses `VITE_API_URL` (set in `frontend/.env.local`) and the `AuthContext` / `StoreContext` to call the API. Successful login stores a JWT that is attached to requests; data auto-loads from the backend when a token is present.
