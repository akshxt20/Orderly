"""Order endpoints."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query, status

from app.api.deps import OrderSvc, PaginationParams, SortDir
from app.schemas.common import PaginatedResponse, build_meta
from app.schemas.order import OrderCreate, OrderDetail, OrderStatusUpdate, OrderSummary

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=PaginatedResponse[OrderSummary])
def list_orders(
    service: OrderSvc,
    page: PaginationParams,
    sort_by: str | None = Query(None),
    sort_dir: SortDir = "desc",
):
    rows, total = service.list(
        page=page.page,
        limit=page.limit,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return {"data": rows, "meta": build_meta(total, page.page, page.limit)}


@router.post("", response_model=OrderDetail, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, service: OrderSvc):
    return service.create(payload)


@router.get("/{order_id}", response_model=OrderDetail)
def get_order(order_id: UUID, service: OrderSvc):
    return service.get_details(order_id)


@router.patch("/{order_id}/status", response_model=OrderDetail)
def update_order_status(order_id: UUID, payload: OrderStatusUpdate, service: OrderSvc):
    return service.update_status(order_id, payload.status)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: UUID, service: OrderSvc):
    service.delete(order_id)
