# Feature1 Forecasting Integration Guide

## Overview
The feature1 (Python Flask) forecasting module has been integrated with the StockMaster frontend React dashboard. The "AI Demand Forecast" alert in the Overview page now redirects to the feature1 forecasting dashboard.

## Setup

### Step 1: Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend Feature1:**
```bash
cd feature1
pip install -r requirements.txt
```

### Step 2: Run Both Servers Together

**Option A: Using the new dev-full script (Recommended)**
```bash
cd frontend
npm run dev-full
```

This runs:
- Frontend Vite dev server on port 3000
- Python Flask app on port 5000

**Option B: Manual - Run in separate terminals**

Terminal 1 (Frontend):
```bash
cd frontend
npm run dev
```

Terminal 2 (Backend):
```bash
cd feature1
python app.py
```

### Step 3: Access the Dashboard

1. Open http://localhost:3000 in browser
2. Login with your credentials
3. Go to Dashboard > Overview
4. Click "View Analysis" button on the "AI Demand Forecast" alert
5. This opens the feature1 forecasting dashboard in a new tab on port 5000

## What Was Changed

### 1. Feature1 App (Python Flask)
**File:** `feature1/app.py`
- Added CORS support with `from flask_cors import CORS`
- Enabled CORS for frontend origins (localhost:3000, localhost:5173, 127.0.0.1 variants)
- Allows cross-origin requests from frontend

**File:** `feature1/requirements.txt`
- Added `flask-cors` dependency

### 2. Frontend (React + Vite)
**File:** `frontend/vite.config.ts`
- Added proxy configuration
- Routes `/api/forecast/*` → `http://127.0.0.1:5000`
- Routes `/dashboard` → `http://127.0.0.1:5000`

**File:** `frontend/package.json`
- Added `concurrently` to devDependencies
- Added `dev-full` script to run both servers

**File:** `frontend/pages/dashboard/Overview.tsx`
- Updated "View Analysis" button with click handler
- Opens feature1 dashboard at `http://localhost:5000/dashboard`

## Architecture

```
┌─────────────────────────────────────────┐
│   React Dashboard (port 3000)            │
│                                          │
│  Overview Page                           │
│  ├─ AI Demand Forecast Alert           │
│  │  └─ View Analysis Button             │
│  │     └─ window.open('http://localhost:5000/dashboard')
│  └─ Stats & Charts                      │
│                                          │
│  API Calls via Proxy:                    │
│  /api/forecast/* → :5000                │
│  /dashboard → :5000                     │
└────────────┬──────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│   Python Flask Server (port 5000)        │
│                                          │
│  Routes:                                 │
│  ├─ GET /dashboard → dashboard.html    │
│  ├─ POST /api/forecast/generate        │
│  ├─ GET /api/dashboard/smart-alerts    │
│  ├─ GET /api/forecast/<product_id>     │
│  └─ POST /api/procurement/auto-reorder │
│                                          │
│  CORS Enabled:                           │
│  └─ Allows requests from port 3000      │
└─────────────────────────────────────────┘
```

## API Endpoints

### Feature1 Forecasting Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/forecast/generate` | Trigger demand forecasting |
| GET | `/api/dashboard/smart-alerts` | Get stock alerts |
| GET | `/api/forecast/<product_id>` | Get forecast for product |
| POST | `/api/procurement/auto-reorder` | Create auto reorder |
| GET | `/dashboard` | View forecasting dashboard |

## Button Functionality

### View Analysis Button
- **Location:** Dashboard > Overview > AI Demand Forecast Alert
- **Action:** Clicks `window.open('http://localhost:5000/dashboard', '_blank')`
- **Result:** Opens feature1 forecasting dashboard in new tab
- **Port:** 5000 (Flask)

## File Structure

```
StockMaster-Odoo-X-SPIT/
├── frontend/
│   ├── pages/
│   │   └── dashboard/
│   │       └── Overview.tsx          ← Modified: Button handler
│   ├── vite.config.ts               ← Modified: Proxy config
│   └── package.json                 ← Modified: Scripts & deps
│
├── feature1/
│   ├── app.py                       ← Modified: CORS enabled
│   └── requirements.txt             ← Modified: Added flask-cors
│
└── FEATURE1_INTEGRATION.md          ← NEW: This file
```

## Testing the Integration

### Manual Test

1. Start both servers:
   ```bash
   npm run dev-full
   ```

2. Open http://localhost:3000 (frontend)

3. Navigate to Dashboard > Overview

4. Look for "AI Demand Forecast" alert banner

5. Click "View Analysis" button

6. New tab opens with http://localhost:5000/dashboard

7. Flask dashboard shows (if database has forecast data)

### Test CORS

```bash
# From terminal, test if CORS is working
curl -X OPTIONS http://localhost:5000/api/forecast/generate \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST"

# Should see CORS headers in response
```

### Test Forecast API

```bash
curl -X POST http://localhost:5000/api/forecast/generate \
  -H "Content-Type: application/json"
```

## Troubleshooting

### Issue: "Cannot reach http://localhost:5000/dashboard"

**Cause:** Feature1 server not running

**Solution:**
```bash
cd feature1
python app.py
# Should show: Running on http://127.0.0.1:5000
```

### Issue: CORS error in browser console

**Cause:** CORS not enabled on feature1 app

**Solution:**
1. Verify `flask-cors` installed: `pip list | grep cors`
2. Verify CORS in app.py has correct origins
3. Restart Flask server

### Issue: Both servers on same port conflict

**Solution:** 
- Frontend uses port 3000 (Vite)
- Backend uses port 5000 (Flask)
- No conflict if both are running

### Issue: "Cannot find module concurrently"

**Solution:**
```bash
cd frontend
npm install
```

## Quick Command Reference

| Command | Purpose |
|---------|---------|
| `npm run dev-full` | Run frontend + backend together |
| `npm run dev` | Run only frontend (port 3000) |
| `cd feature1 && python app.py` | Run only backend (port 5000) |
| `npm run build` | Build frontend for production |

## Environment Variables

### Feature1 (.env)
```
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=1

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stock_master_db
DB_USER=root
DB_PASSWORD=students
```

### Frontend (.env optional)
```
# Backend API URL for fallback
VITE_API_URL=http://localhost:5000
```

## Security Notes

**Development Mode:**
- CORS allows specific localhost origins
- No authentication required (demo)

**Production Deployment:**
- Update CORS to only allow production domain
- Add authentication to feature1 endpoints
- Use HTTPS for all communications
- Store sensitive config in environment variables

## Next Steps

1. ✅ Setup complete - both servers running
2. ✅ Frontend + Backend integrated
3. ✅ Button redirects to feature1 dashboard
4. Start generating forecasts:
   - Click "View Analysis" in dashboard
   - Or call `/api/forecast/generate` endpoint

## Support

For issues or questions:
1. Verify both servers are running
2. Check port 3000 and 5000 are available
3. Check CORS is enabled in feature1/app.py
4. Check database connection in feature1/.env
5. Review browser console for errors
6. Check terminal output for server logs

---

**Status:** ✅ Feature1 Forecasting Integrated with Dashboard
