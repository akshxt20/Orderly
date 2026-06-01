"""Global exception handling.

Turns every failure into the same JSON envelope:

    {"error": "<CODE>", "message": "<human text>", "detail": <optional>}

so the client never has to parse FastAPI's default `{"detail": ...}` for some
errors and something else for others. Unexpected exceptions are logged and
returned as a generic 500 — internal details are never leaked to the caller.
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.core.exceptions import AppError

logger = logging.getLogger("orderly")


def _envelope(error: str, message: str, detail=None) -> dict:
    return {"error": error, "message": message, "detail": detail}


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(_: Request, exc: AppError):
        return JSONResponse(
            status_code=exc.status_code,
            content=_envelope(exc.error_code, exc.message, exc.detail),
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(_: Request, exc: RequestValidationError):
        # Flatten Pydantic's error list into "field: reason" pairs the UI can show.
        fields = [
            {
                "field": ".".join(str(p) for p in err["loc"] if p != "body"),
                "reason": err["msg"],
            }
            for err in exc.errors()
        ]
        return JSONResponse(
            status_code=422,
            content=_envelope(
                "VALIDATION_ERROR", "One or more fields are invalid", fields
            ),
        )

    @app.exception_handler(IntegrityError)
    async def handle_integrity_error(_: Request, exc: IntegrityError):
        # Safety net for a unique/check violation that slipped past the service
        # layer (e.g. a race between two creates). Never expose the raw SQL.
        logger.warning("IntegrityError: %s", exc.orig)
        return JSONResponse(
            status_code=409,
            content=_envelope(
                "CONFLICT", "The request conflicts with existing data"
            ),
        )

    @app.exception_handler(Exception)
    async def handle_unexpected(_: Request, exc: Exception):
        logger.exception("Unhandled error: %s", exc)
        return JSONResponse(
            status_code=500,
            content=_envelope("INTERNAL_ERROR", "Something went wrong"),
        )
