from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, incidents, resources, allocations, dashboard, websocket, analytics

app = FastAPI(
    title="ResQ-X API",
    description="AI-Driven Emergency Resource Allocation — priority scoring, "
                "explainable AI, and LP-optimized resource dispatch.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(incidents.router)
app.include_router(resources.router)
app.include_router(allocations.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(websocket.router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "ResQ-X API"}
