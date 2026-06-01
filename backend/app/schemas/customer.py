"""Customer request/response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class CustomerBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    address: str | None = None

    @field_validator("email")
    @classmethod
    def _normalise_email(cls, value: EmailStr) -> str:
        # Store lower-cased so the unique index also blocks case-variant dupes.
        return value.strip().lower()


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=20)
    address: str | None = None

    @field_validator("email")
    @classmethod
    def _normalise_email(cls, value):
        return value.strip().lower() if value else value


class CustomerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: str
    phone: str | None
    address: str | None
    created_at: datetime
    updated_at: datetime


class CustomerBrief(BaseModel):
    # Lightweight nested representation used inside order payloads.
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: str
