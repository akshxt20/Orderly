"""Order data access."""

from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.order import Order
from app.models.order_item import OrderItem
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    sortable_fields = ("created_at", "total_amount", "status")

    def __init__(self, db: Session):
        super().__init__(Order, db)

    def _apply_options(self, stmt):
        # Eager-load everything the list/summary view needs in two extra queries
        # total (not one-per-row), so item_count and customer never trigger N+1.
        return stmt.options(
            selectinload(Order.customer),
            selectinload(Order.items),
        )

    def get_with_details(self, order_id: UUID) -> Order | None:
        # Detail view needs the product behind each line, hence the deeper load.
        return self.db.scalar(
            select(Order)
            .where(Order.id == order_id)
            .options(
                selectinload(Order.customer),
                selectinload(Order.items).selectinload(OrderItem.product),
            )
        )

    def recent(self, limit: int = 5) -> list[Order]:
        return list(
            self.db.scalars(
                select(Order)
                .order_by(Order.created_at.desc())
                .limit(limit)
                .options(
                    selectinload(Order.customer),
                    selectinload(Order.items),
                )
            ).all()
        )

    def total_revenue(self) -> Decimal:
        value = self.db.scalar(
            select(func.coalesce(func.sum(Order.total_amount), 0))
        )
        return Decimal(value)
