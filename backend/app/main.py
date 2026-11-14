import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import settings
from app.seed.seed_data import init_db
from app.routers import (
    auth, profile, roles, analysis, roadmap,
    assessments, progress, mentor, agents_activity, admin, simulate
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-Agent Personalized Learning Platform API - Know your gaps. Learn what matters. Get job-ready.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to ensure database tables & seed data are initialized
@app.on_event("startup")
def on_startup():
    init_db()

# Include API Routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(roles.router)
app.include_router(analysis.router)
app.include_router(roadmap.router)
app.include_router(assessments.router)
app.include_router(progress.router)
app.include_router(mentor.router)
app.include_router(agents_activity.router)
app.include_router(admin.router)
app.include_router(simulate.router)

# Mount frontend dist static files if built
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def health_check():
        return {
            "status": "healthy",
            "app": settings.PROJECT_NAME,
            "tagline": "Know your gaps. Learn what matters. Get job-ready.",
            "llm_provider": settings.LLM_PROVIDER
        }
