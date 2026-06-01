"""Domain exceptions.

Services raise these intent-revealing errors instead of FastAPI's HTTPException,
so the business layer stays framework-agnostic (it could be reused behind a CLI
or a worker). A single handler (middleware/error_handler.py) maps them to HTTP.

Each carries a stable machine-readable `error_code` the frontend can branch on,
separate from the human `message`.
"""

from __future__ import annotations


class AppError(Exception):
    status_code: int = 500
    error_code: str = "INTERNAL_ERROR"

    def __init__(self, message: str, detail: dict | None = None):
        super().__init__(message)
        self.message = message
        self.detail = detail


class NotFoundError(AppError):
    status_code = 404
    error_code = "NOT_FOUND"


class ConflictError(AppError):
    # Duplicate unique field, or deleting a row other rows depend on.
    status_code = 409
    error_code = "CONFLICT"


class InsufficientStockError(AppError):
    # Requested quantity exceeds what's on hand. 409 = conflict with current
    # inventory state, which is more precise than a generic 422 here.
    status_code = 409
    error_code = "INSUFFICIENT_STOCK"


class InvalidStatusTransitionError(AppError):
    # Tried to move an order to a non-adjacent or backward status.
    status_code = 422
    error_code = "INVALID_STATUS_TRANSITION"
