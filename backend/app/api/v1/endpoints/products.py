"""Product endpoints.

Thin by design: parse query/body, delegate to the service, shape the response.
No business logic lives here.
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query, status

from app.api.deps import PaginationParams, ProductSvc, SortDir
from app.schemas.common import PaginatedResponse, build_meta
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=PaginatedResponse[ProductOut])
def list_products(
    service: ProductSvc,
    page: PaginationParams,
    search: str | None = Query(None, description="Match against SKU or name"),
    sort_by: str | None = Query(None),
    sort_dir: SortDir = "desc",
    category: str | None = Query(None, description="Filter by product category"),
    low_stock: bool = Query(False, description="Only products below the low-stock level"),
):
    rows, total = service.list(
        page=page.page,
        limit=page.limit,
        search=search,
        sort_by=sort_by,
        sort_dir=sort_dir,
        category=category,
        low_stock=low_stock,
    )
    return {"data": rows, "meta": build_meta(total, page.page, page.limit)}


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, service: ProductSvc):
    return service.create(payload)


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: UUID, service: ProductSvc):
    return service.get(product_id)


@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: UUID, payload: ProductUpdate, service: ProductSvc):
    return service.update(product_id, payload)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: UUID, service: ProductSvc):
    service.delete(product_id)
