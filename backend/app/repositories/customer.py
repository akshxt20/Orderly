"""Customer data access."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.order import Order
from app.repositories.base import BaseRepository


class CustomerRepository(BaseRepository[Customer]):
    search_fields = ("name", "email")
    sortable_fields = ("created_at", "name", "email")

    def __init__(self, db: Session):
        super().__init__(Customer, db)

    def get_by_email(self, email: str) -> Customer | None:
        return self.db.scalar(select(Customer).where(Customer.email == email))

    def has_orders(self, customer_id: UUID) -> bool:
        return self.db.scalar(
            select(func.count()).select_from(Order).where(
                Order.customer_id == customer_id
            )
        ) > 0
