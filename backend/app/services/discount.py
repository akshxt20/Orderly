"""Discount resolution.

Builds a fast in-memory view of the currently active sales (one query) and
answers "what's the best discount for this product, and which sale gave it?".
A product can be hit by both a product-specific offer and a category-wide sale —
the better of the two wins (we don't stack them, which would be easy to abuse).

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
        # Each bucket maps key -> (discount_percent, sale_name) for the best offer.
        self._by_product: dict = {}
        self._by_category: dict = {}
        for sale in SaleRepository(db).list_active():
            if sale.scope == SaleScope.product and sale.product_id is not None:
                self._keep_best(self._by_product, sale.product_id, sale)
            elif sale.scope == SaleScope.category and sale.category is not None:
                self._keep_best(self._by_category, sale.category, sale)

    @staticmethod
    def _keep_best(bucket: dict, key, sale) -> None:
        current = bucket.get(key)
        if current is None or sale.discount_percent > current[0]:
            bucket[key] = (sale.discount_percent, sale.name)

    def _best(self, product: Product) -> tuple[Decimal, str | None]:
        candidates = [
            offer
            for offer in (
                self._by_product.get(product.id),
                self._by_category.get(product.category),
            )
            if offer is not None
        ]
        if not candidates:
            return (_ZERO, None)
        return max(candidates, key=lambda offer: offer[0])

    def discount_for(self, product: Product) -> Decimal:
        return self._best(product)[0]

    def effective_price(self, product: Product) -> Decimal:
        discount = self.discount_for(product)
        if discount <= 0:
            return product.price
        return (product.price * (Decimal(100) - discount) / Decimal(100)).quantize(_CENT)

    def annotate(self, product: Product) -> Product:
        """Attach derived pricing onto the ORM instance for ProductOut to read.
        These are plain instance attributes, not mapped columns."""
        discount, sale_name = self._best(product)
        product.discount_percent = discount
        product.effective_price = self.effective_price(product)
        product.on_sale = discount > 0
        product.sale_name = sale_name if discount > 0 else None
        return product
