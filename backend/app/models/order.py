"""Order model and its lifecycle enum."""

from __future__ import annotations

import enum
import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, uuid_pk

if TYPE_CHECKING:
    from app.models.customer import Customer
    from app.models.order_item import OrderItem


class OrderStatus(str, enum.Enum):
    """Forward-only fulfilment pipeline. Order of members == order of progress,
    which the service layer relies on to reject illegal jumps/rewinds."""

    ordered = "ordered"
    dispatched = "dispatched"
    shipped = "shipped"
    arriving = "arriving"
    arrived = "arrived"


class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    id: Mapped[uuid_pk]

    # RESTRICT: a customer with order history cannot be silently deleted, which
    # would orphan their orders. The service turns this into a clean 409.
    customer_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    status: Mapped[OrderStatus] = mapped_column(
        SAEnum(OrderStatus, name="order_status"),
        default=OrderStatus.ordered,
        server_default=OrderStatus.ordered.value,
        nullable=False,
    )

    # Authoritative total, computed by the backend from line items — never trusted
    # from the client.
    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), default=0, server_default="0", nullable=False
    )

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    customer: Mapped["Customer"] = relationship(back_populates="orders")

    # Cascade: deleting an order removes its line items in the same operation.
    # Stock restoration on delete is handled explicitly in the service layer.
    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
    )

    @property
    def item_count(self) -> int:
        # Read-only convenience for list responses. Safe from N+1 because list
        # queries eager-load `items`; never accessed on a detached instance.
        return len(self.items)
