"""Cross-cutting schemas: the pagination envelope and the error envelope.

Every list endpoint returns the same `{data, meta}` shape and every error returns
the same `{error, message, detail}` shape, so the frontend has exactly one
contract to code against.
"""

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PageMeta(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    meta: PageMeta


class ErrorResponse(BaseModel):
    # Documented purely so it shows up in the OpenAPI schema / Swagger UI.
    error: str
    message: str
    detail: dict | list | None = None


def build_meta(total: int, page: int, limit: int) -> PageMeta:
    # Ceiling division without importing math.
    total_pages = (total + limit - 1) // limit if limit else 0
    return PageMeta(total=total, page=page, limit=limit, total_pages=total_pages)
