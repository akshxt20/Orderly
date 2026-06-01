"""Category business logic."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.repositories.category import CategoryRepository
from app.schemas.category import CategoryCreate


class CategoryService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CategoryRepository(db)

    def list_names(self) -> list[str]:
        return self.repo.list_names()

    def create(self, data: CategoryCreate) -> str:
        if self.repo.get_by_name(data.name):
            raise ConflictError(
                f"Category '{data.name}' already exists", {"field": "name"}
            )
        category = self.repo.create(data.name)
        self.db.commit()
        return category.name

    def delete(self, name: str) -> None:
        # A category in use by products can't be removed — that would leave those
        # products pointing at a category nobody can see in the picker.
        if self.repo.product_count(name) > 0:
            raise ConflictError(
                f"'{name}' is used by one or more products and can't be deleted",
                {"name": name},
            )
        category = self.repo.get_by_name(name)
        if category is None:
            raise NotFoundError("Category not found", {"name": name})
        self.repo.delete(category)
        self.db.commit()
