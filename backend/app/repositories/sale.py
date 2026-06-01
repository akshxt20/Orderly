"""Sale data access."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.sale import Sale
from app.repositories.base import BaseRepository


class SaleRepository(BaseRepository[Sale]):
    sortable_fields = ("created_at", "discount_percent")

    def __init__(self, db: Session):
        super().__init__(Sale, db)

    def _apply_options(self, stmt):
        return stmt.options(selectinload(Sale.product))

    def get_with_product(self, sale_id: UUID) -> Sale | None:
        return self.db.scalar(
            select(Sale).where(Sale.id == sale_id).options(selectinload(Sale.product))
        )

    def list_active(self) -> list[Sale]:
        return list(self.db.scalars(select(Sale).where(Sale.is_active.is_(True))).all())

    def count_active(self) -> int:
        return self.db.scalar(
            select(func.count()).select_from(Sale).where(Sale.is_active.is_(True))
        ) or 0
