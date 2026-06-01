"""Discount resolution.

Builds a fast in-memory view of the currently active sales (one query) and
answers "what's the best discount for this product?". A product can be hit by
both a product-specific offer and a category-wide sale — the better of the two
wins (we don't stack them, which would be easy to abuse).

This is shared by ProductService (to annotate catalogue pricing) and OrderService
(to snapshot the discounted price onto each line), so the two can never disagree.
"""

from __future__ import annotations

from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.sale import SaleScope
from app.repositories.sale import SaleRepository

_CENT = Decimal("0.01")
_ZERO = Decimal("0")


class DiscountResolver:
    def __init__(self, db: Session):
        self._by_product: dict = {}
        self._by_category: dict = {}
        for sale in SaleRepository(db).list_active():
            if sale.scope == SaleScope.product and sale.product_id is not None:
                current = self._by_product.get(sale.product_id, _ZERO)
                self._by_product[sale.product_id] = max(current, sale.discount_percent)
            elif sale.scope == SaleScope.category and sale.category is not None:
                current = self._by_category.get(sale.category, _ZERO)
                self._by_category[sale.category] = max(current, sale.discount_percent)

    def discount_for(self, product: Product) -> Decimal:
        return max(
            self._by_product.get(product.id, _ZERO),
            self._by_category.get(product.category, _ZERO),
        )

    def effective_price(self, product: Product) -> Decimal:
        discount = self.discount_for(product)
        if discount <= 0:
            return product.price
        return (product.price * (Decimal(100) - discount) / Decimal(100)).quantize(_CENT)

    def annotate(self, product: Product) -> Product:
        """Attach derived pricing onto the ORM instance for ProductOut to read.
        These are plain instance attributes, not mapped columns."""
        discount = self.discount_for(product)
        product.discount_percent = discount
        product.effective_price = self.effective_price(product)
        product.on_sale = discount > 0
        return product
