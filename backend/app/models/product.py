"""Product model — the inventory unit."""

from __future__ import annotations

import enum
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, uuid_pk

if TYPE_CHECKING:
    from app.models.order_item import OrderItem
    from app.models.sale import Sale


# A product counts as "low stock" when its quantity falls below this global
# level. Kept as one constant so the API flag and the dashboard query agree.
LOW_STOCK_LEVEL = 10


class ProductCategory(str, enum.Enum):
    """Fixed catalogue taxonomy. A closed set keeps category-wide sales reliable
    (no 'Mobile' vs 'Mobiles' fragmentation). Stored as the string value, not a
    DB enum, so adding a category later is a code change, not a migration."""

    mobiles = "Mobiles"
    audio = "Audio"
    laptops = "Laptops"
    accessories = "Accessories"
    power = "Power"


class Product(Base, TimestampMixin):
    __tablename__ = "products"
    __table_args__ = (
        # Defence in depth: these rules are also enforced in Pydantic, but the
        # database is the last line that cannot be bypassed by a buggy caller.
        CheckConstraint("price >= 0", name="ck_products_price_non_negative"),
        CheckConstraint("quantity >= 0", name="ck_products_quantity_non_negative"),
    )

    id: Mapped[uuid_pk]
    sku: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Catalogue taxonomy — indexed because category-wide sales filter on it.
    category: Mapped[str] = mapped_column(
        String(50), server_default=ProductCategory.accessories.value, nullable=False, index=True
    )

    # Image is a URL (no object storage in the stack); nullable so a product can
    # exist before its photo is added.
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Money is NUMERIC, never float — binary floats can't represent 0.10 exactly.
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    quantity: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)

    # Per-product threshold: a warehouse stocks far more pens than laptops, so a
    # single global "low stock" number would be meaningless.
    low_stock_threshold: Mapped[int] = mapped_column(
        Integer, default=10, server_default="10", nullable=False
    )

    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="product")

    # A product-scoped offer is deleted with its product.
    sales: Mapped[list["Sale"]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )
