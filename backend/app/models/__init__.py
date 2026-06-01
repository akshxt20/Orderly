"""Model registry.

Importing every model here gives Alembic's autogenerate a single place to learn
about all tables, and lets the rest of the app do `from app.models import Order`.
"""

from app.models.category import Category
from app.models.customer import Customer
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.models.product import Product, ProductCategory
from app.models.sale import Sale, SaleScope

__all__ = [
    "Product",
    "ProductCategory",
    "Category",
    "Customer",
    "Order",
    "OrderItem",
    "OrderStatus",
    "Sale",
    "SaleScope",
]
