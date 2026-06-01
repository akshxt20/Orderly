"""Sale / offer model.

A sale carries a percentage discount and targets EITHER one product or a whole
category (never both). The `scope` column records which, and a CHECK constraint
enforces that exactly the right target column is filled — so the table can't hold
a contradictory row like "product sale with a category set".
"""

from __future__ import annotations

import enum
import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint
from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, uuid_pk

if TYPE_CHECKING:
    from app.models.product import Product


class SaleScope(str, enum.Enum):
    product = "product"
    category = "category"


class Sale(Base, TimestampMixin):
    __tablename__ = "sales"
    __table_args__ = (
        CheckConstraint(
            "discount_percent > 0 AND discount_percent <= 100",
            name="ck_sales_discount_range",
        ),
        # Exactly-one-target invariant, guaranteed at the database level.
        CheckConstraint(
            "(scope = 'product' AND product_id IS NOT NULL AND category IS NULL) "
            "OR (scope = 'category' AND category IS NOT NULL AND product_id IS NULL)",
            name="ck_sales_target_matches_scope",
        ),
    )

    id: Mapped[uuid_pk]
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    discount_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)

    scope: Mapped[SaleScope] = mapped_column(
        SAEnum(SaleScope, name="sale_scope"), nullable=False
    )

    product_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    category: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true", nullable=False
    )

    product: Mapped["Product | None"] = relationship(back_populates="sales")
