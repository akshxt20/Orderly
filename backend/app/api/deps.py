"""Shared FastAPI dependencies: DB session, pagination, and service injection.

Each request gets its own session, opened here and guaranteed closed in the
`finally`. Services are provided through `Depends` so endpoints never construct
them directly — that keeps the wiring in one place and makes the services trivial
to swap out in tests.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated, Iterator, Literal

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.services.customer import CustomerService
from app.services.dashboard import DashboardService
from app.services.order import OrderService
from app.services.product import ProductService
from app.services.category import CategoryService
from app.services.sale import SaleService


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbSession = Annotated[Session, Depends(get_db)]


@dataclass
class Pagination:
    page: int
    limit: int


def pagination(
    page: int = Query(1, ge=1, description="1-based page number"),
    limit: int = Query(
        settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE
    ),
) -> Pagination:
    return Pagination(page=page, limit=limit)


PaginationParams = Annotated[Pagination, Depends(pagination)]
SortDir = Annotated[Literal["asc", "desc"], Query()]


# --- service providers (dependency injection) ---

def get_product_service(db: DbSession) -> ProductService:
    return ProductService(db)


def get_customer_service(db: DbSession) -> CustomerService:
    return CustomerService(db)


def get_order_service(db: DbSession) -> OrderService:
    return OrderService(db)


def get_dashboard_service(db: DbSession) -> DashboardService:
    return DashboardService(db)


def get_sale_service(db: DbSession) -> SaleService:
    return SaleService(db)


def get_category_service(db: DbSession) -> CategoryService:
    return CategoryService(db)


ProductSvc = Annotated[ProductService, Depends(get_product_service)]
CustomerSvc = Annotated[CustomerService, Depends(get_customer_service)]
OrderSvc = Annotated[OrderService, Depends(get_order_service)]
DashboardSvc = Annotated[DashboardService, Depends(get_dashboard_service)]
SaleSvc = Annotated[SaleService, Depends(get_sale_service)]
CategorySvc = Annotated[CategoryService, Depends(get_category_service)]
