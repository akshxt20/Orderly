"""Category model.

Categories were originally derived from product rows (the distinct set of
`products.category`). Persisting them in their own table lets an admin create a
category before any product uses it, and delete one that's no longer needed —
while products keep storing the category name they belong to.
"""

from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, uuid_pk


class Category(Base, TimestampMixin):
    __tablename__ = "categories"

    id: Mapped[uuid_pk]
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
