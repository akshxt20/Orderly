"""Product data access."""

from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.order_item import OrderItem
from app.models.product import LOW_STOCK_LEVEL, Product
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    search_fields = ("sku", "name")
    sortable_fields = ("created_at", "name", "price", "quantity")

    def __init__(self, db: Session):
        super().__init__(Product, db)

    def get_by_sku(self, sku: str) -> Product | None:
        return self.db.scalar(select(Product).where(Product.sku == sku))

    def get_many_for_update(self, ids: list[UUID]) -> dict[UUID, Product]:
        """Fetch products and lock their rows (SELECT ... FOR UPDATE).

        Locking is what makes order creation safe under concurrency: two orders
        for the last unit can't both read "1 in stock" and both succeed. The
        second transaction blocks until the first commits, then sees the new
        quantity.
        """
        rows = self.db.scalars(
            select(Product).where(Product.id.in_(ids)).with_for_update()
        ).all()
        return {product.id: product for product in rows}

    def list_low_stock(self) -> list[Product]:
        return list(
            self.db.scalars(
                select(Product)
                .where(Product.quantity < LOW_STOCK_LEVEL)
                .order_by(Product.quantity.asc())
            ).all()
        )

    def inventory_value(self) -> Decimal:
        # SUM can return NULL on an empty table; coalesce to 0.
        value = self.db.scalar(
            select(func.coalesce(func.sum(Product.price * Product.quantity), 0))
        )
        return Decimal(value)

    def is_referenced(self, product_id: UUID) -> bool:
        # Cheap existence check used to block deleting a product that lives in
        # historical orders.
        return self.db.scalar(
            select(func.count()).select_from(OrderItem).where(
                OrderItem.product_id == product_id
            )
        ) > 0
