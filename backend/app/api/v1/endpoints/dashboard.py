"""Dashboard endpoint."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import DashboardSvc
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardStats)
def get_dashboard(service: DashboardSvc):
    return service.get_stats()
