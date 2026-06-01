"""Sale / offer endpoints."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query, status

from app.api.deps import PaginationParams, SaleSvc, SortDir
from app.schemas.common import PaginatedResponse, build_meta
from app.schemas.sale import SaleCreate, SaleOut, SaleUpdate

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get("", response_model=PaginatedResponse[SaleOut])
def list_sales(
    service: SaleSvc,
    page: PaginationParams,
    sort_by: str | None = Query(None),
    sort_dir: SortDir = "desc",
):
    rows, total = service.list(
        page=page.page, limit=page.limit, sort_by=sort_by, sort_dir=sort_dir
    )
    return {"data": rows, "meta": build_meta(total, page.page, page.limit)}


@router.post("", response_model=SaleOut, status_code=status.HTTP_201_CREATED)
def create_sale(payload: SaleCreate, service: SaleSvc):
    return service.create(payload)


@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(sale_id: UUID, service: SaleSvc):
    return service.get(sale_id)


@router.patch("/{sale_id}", response_model=SaleOut)
def update_sale(sale_id: UUID, payload: SaleUpdate, service: SaleSvc):
    return service.update(sale_id, payload)


@router.delete("/{sale_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sale(sale_id: UUID, service: SaleSvc):
    service.delete(sale_id)
