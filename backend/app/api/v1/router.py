"""Aggregates every v1 endpoint router under one include."""

from fastapi import APIRouter

from app.api.v1.endpoints import categories, customers, dashboard, orders, products, sales

api_router = APIRouter()
api_router.include_router(products.router)
api_router.include_router(customers.router)
api_router.include_router(orders.router)
api_router.include_router(sales.router)
api_router.include_router(dashboard.router)
api_router.include_router(categories.router)
