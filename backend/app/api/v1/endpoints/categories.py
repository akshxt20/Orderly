"""Category endpoints.

GET returns the manageable list (built-in + product-derived names). POST adds a
new category that can exist before any product uses it; DELETE removes one,
provided no product still references it.
"""

from __future__ import annotations

from fastapi import APIRouter, status

from app.api.deps import CategorySvc
from app.schemas.category import CategoryCreate

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[str])
def list_categories(service: CategorySvc):
    return service.list_names()


@router.post("", response_model=str, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, service: CategorySvc):
    return service.create(payload)


@router.delete("/{name}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(name: str, service: CategorySvc):
    service.delete(name)
