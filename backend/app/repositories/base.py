"""Generic repository.

Holds the CRUD/query mechanics shared by every entity (get, paginated list with
search + sort, create, update, delete, count) so the concrete repositories only
add the queries that are specific to their table. The repository layer owns
*data access* — it never makes business decisions and never commits; flushing
vs committing is left to the service so a service can compose several repository
calls inside one transaction.
"""

from __future__ import annotations

from typing import Any, Generic, Sequence, TypeVar
from uuid import UUID

from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models.product import LOW_STOCK_LEVEL

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    # Columns a `search` term is matched against (overridden per entity).
    search_fields: tuple[str, ...] = ()
    # Columns allowed in `sort_by`, guarding against arbitrary-column injection.
    sortable_fields: tuple[str, ...] = ("created_at",)
    default_sort: str = "created_at"

    def __init__(self, model: type[ModelType], db: Session):
        self.model = model
        self.db = db

    def get(self, entity_id: UUID) -> ModelType | None:
        return self.db.get(self.model, entity_id)

    def list(
        self,
        *,
        page: int = 1,
        limit: int = 20,
        search: str | None = None,
        sort_by: str | None = None,
        sort_dir: str = "desc",
        category: str | None = None,
        low_stock: bool = False,
    ) -> tuple[Sequence[ModelType], int]:
        """Return (rows for the page, total matching rows)."""
        stmt = select(self.model)
        stmt = self._apply_search(stmt, search)
        if category and hasattr(self.model, "category"):
            stmt = stmt.where(self.model.category == category)
        if low_stock and hasattr(self.model, "quantity"):
            stmt = stmt.where(self.model.quantity < LOW_STOCK_LEVEL)

        # Total is computed against the filtered query (before pagination) so the
        # client can render correct page counts.
        total = self.db.scalar(
            select(func.count()).select_from(stmt.subquery())
        ) or 0

        stmt = self._apply_sort(stmt, sort_by, sort_dir)
        stmt = stmt.offset((page - 1) * limit).limit(limit)
        stmt = self._apply_options(stmt)  # eager-load relationships (avoids N+1)
        rows = self.db.scalars(stmt).all()
        return rows, total

    def create(self, obj: ModelType) -> ModelType:
        self.db.add(obj)
        self.db.flush()  # assign PK / defaults without committing the transaction
        return obj

    def update(self, obj: ModelType, data: dict[str, Any]) -> ModelType:
        for field, value in data.items():
            setattr(obj, field, value)
        self.db.flush()
        return obj

    def delete(self, obj: ModelType) -> None:
        self.db.delete(obj)
        self.db.flush()

    def count(self) -> int:
        return self.db.scalar(select(func.count()).select_from(self.model)) or 0

    # --- internal helpers ---

    def _apply_options(self, stmt):
        # Override in a concrete repo to attach eager loaders (selectinload etc.).
        return stmt

    def _apply_search(self, stmt, search: str | None):
        if not search or not self.search_fields:
            return stmt
        term = f"%{search.strip().lower()}%"
        conditions = [
            func.lower(getattr(self.model, field)).like(term)
            for field in self.search_fields
        ]
        return stmt.where(or_(*conditions))

    def _apply_sort(self, stmt, sort_by: str | None, sort_dir: str):
        column_name = sort_by if sort_by in self.sortable_fields else self.default_sort
        column = getattr(self.model, column_name)
        direction = asc if sort_dir == "asc" else desc
        return stmt.order_by(direction(column))
