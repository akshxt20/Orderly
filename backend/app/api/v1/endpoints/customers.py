"""Customer endpoints."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query, status

from app.api.deps import CustomerSvc, PaginationParams, SortDir
from app.schemas.common import PaginatedResponse, build_meta
from app.schemas.customer import CustomerCreate, CustomerOut, CustomerUpdate

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=PaginatedResponse[CustomerOut])
def list_customers(
    service: CustomerSvc,
    page: PaginationParams,
    search: str | None = Query(None, description="Match against name or email"),
    sort_by: str | None = Query(None),
    sort_dir: SortDir = "desc",
):
    rows, total = service.list(
        page=page.page,
        limit=page.limit,
        search=search,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return {"data": rows, "meta": build_meta(total, page.page, page.limit)}


@router.post("", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, service: CustomerSvc):
    return service.create(payload)


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: UUID, service: CustomerSvc):
    return service.get(customer_id)


@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(customer_id: UUID, payload: CustomerUpdate, service: CustomerSvc):
    return service.update(customer_id, payload)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: UUID, service: CustomerSvc):
    service.delete(customer_id)
