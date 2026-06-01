"""Customer model."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, uuid_pk

if TYPE_CHECKING:
    from app.models.order import Order


class Customer(Base, TimestampMixin):
    __tablename__ = "customers"

    id: Mapped[uuid_pk]
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # 320 = RFC 5321 max email length. Stored lower-cased by the service layer so
    # the unique index also blocks "Bob@x.com" vs "bob@x.com" duplicates.
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)

    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)

    orders: Mapped[list["Order"]] = relationship(back_populates="customer")
