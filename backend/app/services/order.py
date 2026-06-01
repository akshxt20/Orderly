"""Order business logic — the transactional heart of the system.

Creating an order touches three tables and must be all-or-nothing: validate the
customer, validate every product, check stock, snapshot prices, compute the
total, deduct inventory, and write the order + its lines. If any step fails, the
whole thing rolls back and inventory is untouched.

Two correctness guarantees worth calling out:
  * Row locking (SELECT ... FOR UPDATE) prevents two concurrent orders from
    overselling the same unit.
  * Deleting an order restores the exact quantities it deducted, in the same
    transaction.
"""

from __future__ import annotations

from collections import defaultdict
from decimal import Decimal
from typing import Sequence
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import (
    InsufficientStockError,
    InvalidStatusTransitionError,
    NotFoundError,
)
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.repositories.customer import CustomerRepository
from app.repositories.order import OrderRepository
from app.repositories.product import ProductRepository
from app.schemas.order import OrderCreate
from app.services.discount import DiscountResolver

# Fixed pipeline order; index = position in the fulfilment journey.
_STATUS_SEQUENCE = list(OrderStatus)


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.orders = OrderRepository(db)
        self.products = ProductRepository(db)
        self.customers = CustomerRepository(db)

    # --- reads ---

    def list(self, **params) -> tuple[Sequence[Order], int]:
        return self.orders.list(**params)

    def get_details(self, order_id: UUID) -> Order:
        order = self.orders.get_with_details(order_id)
        if order is None:
            raise NotFoundError("Order not found", {"id": str(order_id)})
        return order

    # --- create (atomic) ---

    def create(self, data: OrderCreate) -> Order:
        try:
            customer = self.customers.get(data.customer_id)
            if customer is None:
                raise NotFoundError(
                    "Customer not found", {"customer_id": str(data.customer_id)}
                )

            # Merge duplicate lines for the same product so "2 + 3 of X" is a
            # single stock check for 5, not two that each pass against stale read.
            requested: dict[UUID, int] = defaultdict(int)
            for line in data.items:
                requested[line.product_id] += line.quantity

            # Lock the product rows up front to serialise concurrent orders.
            products = self.products.get_many_for_update(list(requested.keys()))

            # Resolve any active offers once; the same engine the catalogue uses,
            # so the price charged matches the price shown.
            discounts = DiscountResolver(self.db)

            order = Order(
                customer_id=customer.id,
                status=OrderStatus.ordered,
                notes=data.notes,
            )
            total = Decimal("0.00")

            for product_id, quantity in requested.items():
                product = products.get(product_id)
                if product is None:
                    raise NotFoundError(
                        "Product not found", {"product_id": str(product_id)}
                    )
                if product.quantity < quantity:
                    raise InsufficientStockError(
                        f"'{product.name}' has only {product.quantity} in stock "
                        f"but {quantity} were requested",
                        {
                            "product_id": str(product_id),
                            "requested": quantity,
                            "available": product.quantity,
                        },
                    )

                unit_price = discounts.effective_price(product)  # discounted if on sale
                product.quantity -= quantity  # deduct inventory
                order.items.append(
                    OrderItem(
                        product_id=product.id,
                        quantity=quantity,
                        unit_price=unit_price,  # snapshot the price actually charged
                    )
                )
                total += unit_price * quantity

            order.total_amount = total
            self.db.add(order)
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

        # Re-fetch with relationships eagerly loaded for the response.
        return self.get_details(order.id)

    # --- status transition (forward-only, one step at a time) ---

    def update_status(self, order_id: UUID, new_status: OrderStatus) -> Order:
        order = self.get_details(order_id)
        current_index = _STATUS_SEQUENCE.index(order.status)
        target_index = _STATUS_SEQUENCE.index(new_status)

        if target_index != current_index + 1:
            raise InvalidStatusTransitionError(
                f"Cannot move an order from '{order.status.value}' to "
                f"'{new_status.value}'",
                {
                    "current": order.status.value,
                    "requested": new_status.value,
                    "allowed_next": (
                        _STATUS_SEQUENCE[current_index + 1].value
                        if current_index + 1 < len(_STATUS_SEQUENCE)
                        else None
                    ),
                },
            )

        order.status = new_status
        self.db.commit()
        return self.get_details(order.id)

    # --- delete (restores inventory atomically) ---

    def delete(self, order_id: UUID) -> None:
        try:
            order = self.get_details(order_id)
            # Lock the affected products before adding stock back.
            product_ids = [item.product_id for item in order.items]
            products = self.products.get_many_for_update(product_ids)
            for item in order.items:
                product = products.get(item.product_id)
                if product is not None:
                    product.quantity += item.quantity  # restore inventory

            self.db.delete(order)  # cascades to order_items
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise
