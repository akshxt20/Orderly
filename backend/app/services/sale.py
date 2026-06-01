"""Sale / offer business logic."""

from __future__ import annotations

from typing import Sequence
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.sale import Sale, SaleScope
from app.repositories.product import ProductRepository
from app.repositories.sale import SaleRepository
from app.schemas.sale import SaleCreate, SaleUpdate


class SaleService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = SaleRepository(db)
        self.products = ProductRepository(db)

    def list(self, **params) -> tuple[Sequence[Sale], int]:
        return self.repo.list(**params)

    def get(self, sale_id: UUID) -> Sale:
        sale = self.repo.get_with_product(sale_id)
        if sale is None:
            raise NotFoundError("Sale not found", {"id": str(sale_id)})
        return sale

    def create(self, data: SaleCreate) -> Sale:
        # For a product offer, make sure the target product actually exists.
        if data.scope == SaleScope.product:
            if self.products.get(data.product_id) is None:
                raise NotFoundError(
                    "Product not found", {"product_id": str(data.product_id)}
                )

        sale = Sale(
            name=data.name,
            discount_percent=data.discount_percent,
            scope=data.scope,
            product_id=data.product_id,
            category=data.category,
            is_active=data.is_active,
        )
        self.repo.create(sale)
        self.db.commit()
        # Reload with the product relationship for the response.
        return self.get(sale.id)

    def update(self, sale_id: UUID, data: SaleUpdate) -> Sale:
        sale = self.get(sale_id)
        self.repo.update(sale, data.model_dump(exclude_unset=True))
        self.db.commit()
        return self.get(sale.id)

    def delete(self, sale_id: UUID) -> None:
        sale = self.get(sale_id)
        self.repo.delete(sale)
        self.db.commit()
