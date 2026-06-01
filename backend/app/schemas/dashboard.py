"""Dashboard aggregate schema."""

from decimal import Decimal

from pydantic import BaseModel

from app.schemas.order import OrderSummary
from app.schemas.product import ProductOut


class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    active_sales: int            # count of currently active offers
    total_revenue: Decimal       # sum of all order totals
    inventory_value: Decimal     # sum of price * quantity across stock on hand
    low_stock_products: list[ProductOut]
    recent_orders: list[OrderSummary]
