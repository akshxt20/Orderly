"""Customer business logic."""

from __future__ import annotations

from typing import Sequence
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.customer import Customer
from app.repositories.customer import CustomerRepository
from app.schemas.customer import CustomerCreate, CustomerUpdate


class CustomerService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CustomerRepository(db)

    def list(self, **params) -> tuple[Sequence[Customer], int]:
        return self.repo.list(**params)

    def get(self, customer_id: UUID) -> Customer:
        customer = self.repo.get(customer_id)
        if customer is None:
            raise NotFoundError("Customer not found", {"id": str(customer_id)})
        return customer

    def create(self, data: CustomerCreate) -> Customer:
        if self.repo.get_by_email(data.email):
            raise ConflictError(
                f"A customer with email '{data.email}' already exists",
                {"field": "email"},
            )
        customer = Customer(**data.model_dump())
        self.repo.create(customer)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def update(self, customer_id: UUID, data: CustomerUpdate) -> Customer:
        customer = self.get(customer_id)
        changes = data.model_dump(exclude_unset=True)

        new_email = changes.get("email")
        if new_email and new_email != customer.email:
            if self.repo.get_by_email(new_email):
                raise ConflictError(
                    f"A customer with email '{new_email}' already exists",
                    {"field": "email"},
                )

        self.repo.update(customer, changes)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def delete(self, customer_id: UUID) -> None:
        customer = self.get(customer_id)
        if self.repo.has_orders(customer_id):
            raise ConflictError(
                "This customer has existing orders and cannot be deleted",
                {"id": str(customer_id)},
            )
        self.repo.delete(customer)
        self.db.commit()
