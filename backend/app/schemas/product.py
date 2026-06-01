"""Product request/response schemas.

The same business rules live here (input validation) and in the DB (CHECK
constraints). Pydantic gives the caller a friendly 422; the constraints are the
backstop nothing can bypass.
"""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator

from app.models.product import LOW_STOCK_LEVEL


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    # Category is a free-form string so users can create custom categories.
    # The built-in values (Mobiles, Audio, etc.) remain as suggestions in the UI.
    category: str = Field(default="Accessories", min_length=1, max_length=50)
    image_url: str | None = Field(default=None, max_length=500)
    price: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    quantity: int = Field(ge=0)
    low_stock_threshold: int = Field(default=10, ge=0)


class ProductCreate(ProductBase):
    sku: str = Field(min_length=1, max_length=100)

    @field_validator("sku")
    @classmethod
    def _normalise_sku(cls, value: str) -> str:
        # Trim so "  ABC " and "ABC" can't both exist as "different" SKUs.
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("SKU cannot be blank")
        return cleaned


class ProductUpdate(BaseModel):
    # All optional: PUT here behaves as a partial update (PATCH-like) so a client
    # can change just the price without resending the whole product.
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    category: str | None = Field(default=None, min_length=1, max_length=50)
    image_url: str | None = Field(default=None, max_length=500)
    price: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)
    quantity: int | None = Field(default=None, ge=0)
    low_stock_threshold: int | None = Field(default=None, ge=0)
    sku: str | None = Field(default=None, min_length=1, max_length=100)

    @field_validator("sku")
    @classmethod
    def _normalise_sku(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("SKU cannot be blank")
        return cleaned


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    sku: str
    name: str
    description: str | None = None
    category: str
    image_url: str | None = None
    price: Decimal
    quantity: int
    low_stock_threshold: int = 10
    created_at: datetime
    updated_at: datetime

    # Pricing fields are populated by ProductService from the active sales — they
    # are not stored columns. effective_price == price when nothing applies.
    discount_percent: Decimal = Decimal("0")
    effective_price: Decimal
    on_sale: bool = False

    @computed_field  # derived flag so the UI doesn't re-implement the rule
    @property
    def is_low_stock(self) -> bool:
        return self.quantity < LOW_STOCK_LEVEL
