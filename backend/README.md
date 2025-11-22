# StockMaster Backend

Express + MySQL service that powers the StockMaster dashboard. It ships with an enterprise-ready layout: structured routing, central error handling, Firebase-backed auth (ID token verification), rate limiting, and schema/seed scripts that mirror the provided inventory tables.

## Quick start

1. Copy `.env.example` to `.env` and set database credentials plus a strong `JWT_SECRET` and the required Firebase Admin keys (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).
2. Install dependencies: `npm install`
3. Prepare the database (creates tables and demo data): `npm run db:seed`
4. Start the API: `npm run dev` (or `npm start` after `npm run build`)

The service listens on `PORT` (default `4000`). Health check is available at `/health`.

## Key endpoints

- `GET /api/auth/me` – returns the Firebase-authenticated principal mapped to local roles.
- `POST /api/auth/sync` – upserts Firebase users into `inventory_user` + groups; returns local roles.
- `POST /api/auth/track` – writes to `auth_audit_log` (login/logout/password reset events).
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
- Seed sets up admin user, groups/permissions, warehouses/locations, products, quants, sample moves, ledger rows aligned with the frontend mocks, and a starter audit row.
- Stock validation logic prevents negative inventory and writes to `inventory_stockvaluationlayer`.

## Frontend integration

The frontend uses Firebase Auth for sign-in/sign-up and password reset (email OTP). `AuthContext` pulls a Firebase ID token for API calls and syncs roles via `/api/auth/sync`, logging auth events through `/api/auth/track`. Configure `VITE_API_URL` and Firebase client keys in `frontend/.env.local`.
