"""Dashboard aggregation.

Pure read service that assembles the home-screen metrics from the individual
repositories. Kept separate from the entity services so the dashboard can evolve
(add a metric) without touching product/order logic.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.repositories.customer import CustomerRepository
from app.repositories.order import OrderRepository
from app.repositories.product import ProductRepository
from app.repositories.sale import SaleRepository
from app.services.discount import DiscountResolver


class DashboardService:
    def __init__(self, db: Session):
        self.db = db
        self.products = ProductRepository(db)
        self.customers = CustomerRepository(db)
        self.orders = OrderRepository(db)
        self.sales = SaleRepository(db)

    def get_stats(self) -> dict:
        # Low-stock cards show sale pricing too, so annotate them like everywhere.
        low_stock = self.products.list_low_stock()
        resolver = DiscountResolver(self.db)
        for product in low_stock:
            resolver.annotate(product)

        return {
            "total_products": self.products.count(),
            "total_customers": self.customers.count(),
            "total_orders": self.orders.count(),
            "active_sales": self.sales.count_active(),
            "total_revenue": self.orders.total_revenue(),
            "inventory_value": self.products.inventory_value(),
            "low_stock_products": low_stock,
            "recent_orders": self.orders.recent(limit=5),
        }
