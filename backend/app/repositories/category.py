"""Category data access."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.product import Product


class CategoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_names(self) -> list[str]:
        # Union of explicitly-managed categories and any category names already
        # in use on products — so nothing a product references can disappear.
        managed = self.db.scalars(select(Category.name)).all()
        in_use = self.db.scalars(select(Product.category).distinct()).all()
        return sorted({*managed, *in_use})

    def get_by_name(self, name: str) -> Category | None:
        return self.db.scalar(select(Category).where(Category.name == name))

    def create(self, name: str) -> Category:
        category = Category(name=name)
        self.db.add(category)
        self.db.flush()
        return category

    def delete(self, category: Category) -> None:
        self.db.delete(category)
        self.db.flush()

    def product_count(self, name: str) -> int:
        return self.db.scalar(
            select(func.count()).select_from(Product).where(Product.category == name)
        ) or 0
