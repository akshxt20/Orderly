"""Sale / offer schemas.

Cross-field validation guarantees the payload is internally consistent before it
reaches the service: a product-scoped sale must carry a product_id (and no
category), and vice-versa. The service then checks the target actually exists.
"""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.product import ProductCategory
from app.models.sale import SaleScope


class SaleCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    discount_percent: Decimal = Field(gt=0, le=100, max_digits=5, decimal_places=2)
    scope: SaleScope
    product_id: UUID | None = None
    category: str | None = None
    is_active: bool = True

    @model_validator(mode="after")
    def _check_target(self):
        if self.scope == SaleScope.product:
            if self.product_id is None or self.category is not None:
                raise ValueError("A product sale needs a product_id and no category")
        else:  # category scope
            if self.category is None or self.product_id is not None:
                raise ValueError("A category sale needs a category and no product_id")
        return self


class SaleUpdate(BaseModel):
    # Only the activation toggle and discount are editable post-creation; changing
    # the target is conceptually a different sale, so re-create instead.
    name: str | None = Field(default=None, min_length=1, max_length=255)
    discount_percent: Decimal | None = Field(default=None, gt=0, le=100, max_digits=5, decimal_places=2)
    is_active: bool | None = None


class _ProductBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    sku: str
    name: str


class SaleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    discount_percent: Decimal
    scope: SaleScope
    category: str | None
    is_active: bool
    product: _ProductBrief | None
    created_at: datetime
