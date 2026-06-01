"""Order request/response schemas.

Note what the client is NOT allowed to send: no prices, no totals, no status on
creation. Those are all derived/owned by the backend. The client states intent
(who, which products, how many); the server decides the money.
"""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, computed_field

from app.models.order import OrderStatus
from app.schemas.customer import CustomerBrief


class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(gt=0, description="Units to order; must be positive")


class OrderCreate(BaseModel):
    customer_id: UUID
    items: list[OrderItemCreate] = Field(min_length=1, description="At least one line")
    notes: str | None = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


# --- nested read models ---

class _ProductInLine(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    sku: str
    name: str


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    quantity: int
    unit_price: Decimal
    product: _ProductInLine

    @computed_field
    @property
    def line_total(self) -> Decimal:
        return self.unit_price * self.quantity


class OrderSummary(BaseModel):
    # Row shape for the orders list and dashboard "recent orders".
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status: OrderStatus
    total_amount: Decimal
    item_count: int
    customer: CustomerBrief
    created_at: datetime


class OrderDetail(BaseModel):
    # Full shape for the order detail page.
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status: OrderStatus
    total_amount: Decimal
    notes: str | None
    customer: CustomerBrief
    items: list[OrderItemOut]
    created_at: datetime
    updated_at: datetime
