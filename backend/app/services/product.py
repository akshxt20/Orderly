"""Product business logic.

Owns the rules around products and the transaction boundary (commit/rollback).
The repository runs the queries; the service decides what's allowed. Every
product handed back is annotated with its current sale pricing so the API
response carries effective_price / discount_percent / on_sale.
"""

from __future__ import annotations

from typing import Sequence
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.product import Product
from app.repositories.product import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.discount import DiscountResolver


class ProductService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ProductRepository(db)

    def list(self, **params) -> tuple[Sequence[Product], int]:
        rows, total = self.repo.list(**params)
        resolver = DiscountResolver(self.db)
        for product in rows:
            resolver.annotate(product)
        return rows, total

    def get(self, product_id: UUID) -> Product:
        product = self.repo.get(product_id)
        if product is None:
            raise NotFoundError("Product not found", {"id": str(product_id)})
        return DiscountResolver(self.db).annotate(product)

    def create(self, data: ProductCreate) -> Product:
        if self.repo.get_by_sku(data.sku):
            raise ConflictError(
                f"A product with SKU '{data.sku}' already exists",
                {"field": "sku"},
            )
        product = Product(**_dump(data))
        self.repo.create(product)
        self.db.commit()
        self.db.refresh(product)
        return DiscountResolver(self.db).annotate(product)

    def update(self, product_id: UUID, data: ProductUpdate) -> Product:
        product = self.repo.get(product_id)
        if product is None:
            raise NotFoundError("Product not found", {"id": str(product_id)})
        changes = _dump(data, partial=True)

        # Only check for a SKU clash if the SKU is actually changing.
        new_sku = changes.get("sku")
        if new_sku and new_sku != product.sku:
            if self.repo.get_by_sku(new_sku):
                raise ConflictError(
                    f"A product with SKU '{new_sku}' already exists",
                    {"field": "sku"},
                )

        self.repo.update(product, changes)
        self.db.commit()
        self.db.refresh(product)
        return DiscountResolver(self.db).annotate(product)

    def delete(self, product_id: UUID) -> None:
        product = self.repo.get(product_id)
        if product is None:
            raise NotFoundError("Product not found", {"id": str(product_id)})
        # Refuse to orphan historical order lines (FK is RESTRICT anyway, but we
        # turn it into a clean 409 instead of a database error).
        if self.repo.is_referenced(product_id):
            raise ConflictError(
                "This product appears in existing orders and cannot be deleted",
                {"id": str(product_id)},
            )
        self.repo.delete(product)
        self.db.commit()


def _dump(data, *, partial: bool = False) -> dict:
    # Category is now a plain string (no enum conversion needed).
    payload = data.model_dump(exclude_unset=partial)
    return payload
