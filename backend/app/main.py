"""Application entry point.

Wires together configuration, CORS, the global error handlers, and the versioned
API router. Kept deliberately small — assembly only, no logic.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.middleware.error_handler import register_exception_handlers

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Inventory & Order Management API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS: the explicit list (Vite dev server + any configured origins) PLUS a regex
# that allows any *.netlify.app site. The regex makes deploys robust to the exact
# site name / trailing-slash mistakes that otherwise cause silent CORS failures.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https://([a-z0-9-]+\.)*netlify\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["meta"])
def health_check():
    # Lightweight liveness probe for Render and Docker healthchecks.
    return {"status": "ok"}
