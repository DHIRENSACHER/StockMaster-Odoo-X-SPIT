# Feature1 Integration - Complete Setup Guide

## ✅ What's Been Done

The AI Demand Forecast alert in the dashboard has been fully integrated with the feature1 (Python Flask) forecasting module.

### Integration Summary

| Component | Change | Purpose |
|-----------|--------|---------|
| **feature1/app.py** | Added CORS support | Allow frontend to call Flask API |
| **feature1/requirements.txt** | Added flask-cors | CORS dependency |
| **frontend/vite.config.ts** | Added proxy config | Route API calls to :5000 |
| **frontend/package.json** | Added concurrently + dev-full | Run both servers together |
| **Dashboard Overview** | Button with click handler | Redirect to forecasting dashboard |

---

## 🚀 Quick Start (2 Minutes)

### Prerequisites
- Node.js installed
- Python 3.8+ installed
- MySQL running
- Both folders: `frontend/` and `feature1/`

### Step 1: Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Feature1 (in different terminal)
cd feature1
pip install -r requirements.txt
```

### Step 2: Run Everything

```bash
cd frontend
npm run dev-full
```

This runs:
- ✅ React frontend on http://localhost:3000
- ✅ Flask backend on http://localhost:5000

### Step 3: Test Integration

1. Open http://localhost:3000 in browser
2. Login to dashboard
3. Go to **Overview** tab
4. Find **"AI Demand Forecast"** alert banner
5. Click **"View Analysis"** button
6. New tab opens with forecasting dashboard on http://localhost:5000/dashboard

---

## 📋 Files Changed

### 1. Feature1 Backend
**File:** `feature1/app.py`
```python
# ADDED: CORS support
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "http://localhost:5173", 
    "http://127.0.0.1:5173"
]}})
```

**File:** `feature1/requirements.txt`
```
flask-cors   # Added
```

### 2. Frontend Configuration
**File:** `frontend/vite.config.ts`
```typescript
proxy: {
  '/api/forecast': {
    target: 'http://127.0.0.1:5000',
    changeOrigin: true
  },
  '/dashboard': {
    target: 'http://127.0.0.1:5000',
    changeOrigin: true
  }
}
```

**File:** `frontend/package.json`
```json
{
  "scripts": {
    "dev-full": "concurrently \"vite\" \"cd ../feature1 && python app.py\""
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

### 3. UI Component
**File:** `frontend/pages/dashboard/Overview.tsx`
```tsx
<button 
  onClick={() => window.open('http://localhost:5000/dashboard', '_blank')}
  className="..."
>
  View Analysis
</button>
```

---

## 🏗️ Architecture

```
┌──────────────────────────────┐
│  React Dashboard             │
│  Port: 3000                  │
│                              │
│  ┌────────────────────────┐  │
│  │ Dashboard Page         │  │
│  │  ├─ Overview           │  │
│  │  │  └─ AI Alert        │  │
│  │  │     ├─ Product Info │  │
│  │  │     └─ View Analysis│  │
│  │  │        [BUTTON]     │  │
│  └────────────────────────┘  │
└────────────┬─────────────────┘
             │
    onClick: window.open(
      'http://localhost:5000/dashboard',
      '_blank'
    )
             │
             ↓
┌──────────────────────────────┐
│  Flask Forecasting Dashboard │
│  Port: 5000                  │
│                              │
│  Routes:                     │
│  ├─ GET /dashboard         │
│  ├─ POST /api/forecast/*   │
│  ├─ GET /api/smart-alerts  │
│  └─ GET /api/forecast/<id> │
│                              │
│  CORS: Enabled for :3000    │
└──────────────────────────────┘
```

---

## 🎯 Button Functionality

### Location
- Dashboard → Overview tab
- "AI Demand Forecast" section at top

### What It Does
```
[View Analysis] Button
    ↓
onClick Handler triggers
    ↓
window.open('http://localhost:5000/dashboard', '_blank')
    ↓
Opens Flask dashboard in new tab
    ↓
Shows forecasting, alerts, analytics
```

### Expected Behavior
1. User clicks button
2. New browser tab opens
3. URL: http://localhost:5000/dashboard
4. Flask dashboard renders (if data available)

---

## ⚙️ How It Works

### API Communication Flow

```
Frontend Request:
1. User clicks "View Analysis"
2. Browser opens new tab to http://localhost:5000/dashboard
3. Or: Frontend calls /api/forecast/generate
   └─ Vite proxy intercepts
   └─ Routes to http://127.0.0.1:5000
   └─ Flask processes request
   └─ Response returned

CORS Headers:
- Flask allows Origin: http://localhost:3000
- Frontend can read response
- No CORS errors
```

### Port Usage
| Port | Service | URL |
|------|---------|-----|
| 3000 | React Frontend | http://localhost:3000 |
| 5000 | Flask Backend | http://localhost:5000 |

---

## 🔧 Configuration

### Allowed Origins (CORS)
```python
# In feature1/app.py
CORS(app, resources={r"/api/*": {"origins": [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",      # Alternative Vite port
    "http://127.0.0.1:5173"
]}})
```

### Proxy Configuration
```typescript
// In frontend/vite.config.ts
proxy: {
  '/api/forecast': { target: 'http://127.0.0.1:5000' },
  '/dashboard': { target: 'http://127.0.0.1:5000' }
}
```

---

## 📝 Commands Reference

### Development
```bash
# Run both frontend and backend
npm run dev-full

# Run only frontend (port 3000)
npm run dev

# Run only backend (port 5000)
cd feature1 && python app.py
```

### Installation
```bash
# Frontend dependencies
cd frontend && npm install

# Backend dependencies
cd feature1 && pip install -r requirements.txt
```

### Building
```bash
# Build frontend for production
npm run build

# Preview production build
npm run preview
```

---

## ✨ Testing

### Manual Test
1. Start servers: `npm run dev-full`
2. Open http://localhost:3000
3. Navigate to Dashboard → Overview
4. Look for "AI Demand Forecast" alert
5. Click "View Analysis" button
6. Verify new tab opens with Flask dashboard

### CORS Test
```bash
curl -X OPTIONS http://localhost:5000/api/forecast/generate \
  -H "Origin: http://localhost:3000" \
  -v
```
Should see: `Access-Control-Allow-Origin: http://localhost:3000`

### API Test
```bash
# Test forecasting endpoint
curl -X POST http://localhost:5000/api/forecast/generate \
  -H "Content-Type: application/json"
```

---

## 🔍 Troubleshooting

### Issue: Button doesn't redirect

**Check:**
- Is Flask server running on port 5000?
- Is URL correct: http://localhost:5000/dashboard?
- Check browser console for errors

**Fix:**
```bash
cd feature1
python app.py
# Should show: Running on http://127.0.0.1:5000
```

### Issue: CORS Error

**Check:**
- Is flask-cors installed?
- Is CORS enabled in app.py?

**Fix:**
```bash
pip install flask-cors
# Restart Flask server
```

### Issue: Cannot find module concurrently

**Fix:**
```bash
cd frontend
npm install
```

### Issue: Ports already in use

**Solution:**
- Change port in vite.config.ts (line 11: port: 3001)
- Change port in feature1/app.py (last line: port=5001)
- Update proxy target accordingly

---

## 📚 File Structure

```
StockMaster-Odoo-X-SPIT/
│
├── frontend/
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   └── dashboard/
│   │       └── Overview.tsx          ← Modified: Button handler
│   ├── vite.config.ts               ← Modified: Proxy
│   ├── package.json                 ← Modified: Scripts + deps
│   └── ...
│
├── feature1/
│   ├── app.py                       ← Modified: CORS
│   ├── services/
│   │   └── forecasting.py
│   ├── templates/
│   │   └── dashboard.html           ← Shown in new tab
│   ├── requirements.txt             ← Modified: flask-cors
│   └── ...
│
└── FEATURE1_INTEGRATION.md          ← NEW: Guide
```

---

## 🎯 Next Steps

1. ✅ **Verify Setup**
   - Run `npm run dev-full`
   - Check both servers start without errors

2. ✅ **Test Integration**
   - Navigate to Dashboard → Overview
   - Click "View Analysis" button
   - Verify Flask dashboard opens

3. ✅ **Generate Forecasts**
   - Click button to access forecasting module
   - Trigger forecasts
   - View predictions and alerts

4. ✅ **Explore Features**
   - Smart alerts
   - Auto-reorder suggestions
   - Forecast analysis
   - Stock optimization

---

## 📞 Support

### Common Issues

| Issue | Solution |
|-------|----------|
| Flask not running | `cd feature1 && python app.py` |
| CORS error | Install: `pip install flask-cors` |
| Port conflict | Change port in config files |
| Module not found | Run: `npm install` or `pip install -r requirements.txt` |

### Check Status

1. Frontend: http://localhost:3000/health (if available)
2. Backend: http://localhost:5000/health or http://localhost:5000/dashboard

---

## ✅ Checklist

- [ ] Both servers installed and dependencies resolved
- [ ] npm run dev-full starts without errors
- [ ] Frontend loads on http://localhost:3000
- [ ] Backend runs on http://localhost:5000
- [ ] Dashboard Overview shows AI alert
- [ ] View Analysis button redirects to Flask dashboard
- [ ] New tab opens correctly
- [ ] No CORS errors in browser console

---

**Status:** ✅ **Feature1 Integration Complete**

Ready to use! Run `npm run dev-full` and enjoy the integrated forecasting system.
