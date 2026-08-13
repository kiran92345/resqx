# ResQ-X — AI-Driven Emergency Resource Allocation

"Right Resource, Right Place, Right Time."

A full-stack disaster response system: real-time priority scoring, explainable
AI (SHAP-style) breakdowns, LP-optimized resource allocation (PuLP), and an
end-to-end dispatch pipeline — with separate Admin (Emergency Control Officer)
and Citizen panels behind role-based auth.

## Architecture

```
resqx/
├── backend/     FastAPI + MongoDB (Motor) + PuLP optimizer + JWT auth + WebSocket
└── frontend/    React 18 + TypeScript + Vite + Tailwind + Leaflet + Recharts
```

## 1. Backend setup

Requires Python 3.11+ and a running MongoDB instance (local or Atlas).

```bash
cd backend
python -m venv venv && source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                  # edit MONGO_URI / JWT_SECRET as needed
python seed.py                                        # populates 6 mock disaster zones + resource hubs
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs
Health check: http://localhost:8000/api/health

## 2. Frontend setup

Requires Node.js 18+.

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — the Vite dev server proxies `/api` and `/ws` to
the backend on port 8000 (see `vite.config.ts`).

## 3. Using the app

1. Sign up as a **Citizen** to submit an emergency assistance request, or as
   a **Control Officer** (admin) to manage the response.
2. The top navbar has an Admin/Citizen toggle so an authenticated user can
   preview both panels without logging out.
3. Admin → **Dashboard**: live KPIs, incident map (pins colored red/amber/green
   by priority), priority-trend and supply/demand charts.
4. Admin → **Affected Zones**: sortable/filterable table; click **"Why?"** on
   any row to open the XAI drawer with the SHAP-style score breakdown.
5. Admin → **Resource Hub**: click **Run Optimization** to solve the LP
   allocation problem across all open incidents and current stock.
6. Admin → **Dispatch Center**: advance each request through
   `submitted → in_review → dispatched → in_transit → delivered → resolved`.
7. Citizen → **Request Help**: submission form with live anomaly-detection
   guardrails (e.g. injured > affected triggers a warning before submit).
8. Citizen → **Track Request** / **Stock Radar**: live ETA + status timeline,
   and nearby hub stock levels with low-stock warnings.

Real-time events (new incidents, stock alerts, status/allocation updates) are
pushed over `/ws/live` and surfaced as toast notifications on both panels.

## Notes on the scoring & optimization engines

- `backend/app/services/scoring_engine.py` computes an interpretable,
  weighted-feature priority score (0–100) and returns an ordered list of
  signed contributions that sum to the score — the same contract a real
  `shap.TreeExplainer` would give you, so you can swap in an actual trained
  model later without touching the API or frontend.
- `backend/app/services/optimizer.py` uses PuLP (CBC solver) to maximize
  total priority-weighted resource fulfillment subject to per-resource stock
  caps, with a deterministic greedy fallback if PuLP/CBC isn't available in
  the runtime.

## Production hardening TODO

- Swap the in-memory WebSocket connection manager for Redis pub/sub if
  scaling beyond one backend instance.
- Add refresh tokens / token revocation (current JWT is access-token-only).
- Add MongoDB indexes on `incidents.priority_score`, `incidents.status`,
  `resources.location_hub`.
- Add rate limiting on `/api/incidents` (public citizen intake endpoint).
- Code-split the frontend bundle (`vite build` currently warns about a
  ~790 KB main chunk — mostly Leaflet + Recharts).
