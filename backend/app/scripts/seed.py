"""Seed the database with realistic demo data.

Run inside the backend container:
    docker compose exec backend python -m app.scripts.seed

It wipes existing rows first so it's safe to re-run. Orders are created through
the real OrderService so stock deduction and totals behave exactly as in the app.
Prices are in Indian Rupees.
"""

from __future__ import annotations

from decimal import Decimal
from urllib.parse import quote_plus

from app.db.session import SessionLocal
from app.models import Customer, Order, OrderItem, Product, Sale, SaleScope
from app.schemas.order import OrderCreate, OrderItemCreate
from app.services.order import OrderService

PRODUCTS = [
    {"sku": "MOB-IPH-15", "name": "iPhone 15 (128GB)", "category": "Mobiles", "price": "79999", "quantity": 18, "low_stock_threshold": 5, "description": "Apple iPhone 15, Black"},
    {"sku": "MOB-SAM-M14", "name": "Samsung Galaxy M14 5G", "category": "Mobiles", "price": "13499", "quantity": 40, "low_stock_threshold": 8, "description": "6GB RAM, 128GB"},
    {"sku": "MOB-ONP-N3", "name": "OnePlus Nord 3", "category": "Mobiles", "price": "24999", "quantity": 4, "low_stock_threshold": 6, "description": "Low stock demo item"},
    {"sku": "AUD-BOAT-141", "name": "boAt Airdopes 141", "category": "Audio", "price": "1299", "quantity": 120, "low_stock_threshold": 20, "description": "TWS earbuds"},
    {"sku": "AUD-SONY-XB", "name": "Sony WH-CH520 Headphones", "category": "Audio", "price": "3490", "quantity": 30, "low_stock_threshold": 10},
    {"sku": "PWR-MI-20K", "name": "Mi Power Bank 3i (20000mAh)", "category": "Power", "price": "1999", "quantity": 3, "low_stock_threshold": 10, "description": "Low stock demo item"},
    {"sku": "ACC-LOG-M331", "name": "Logitech M331 Silent Mouse", "category": "Accessories", "price": "699", "quantity": 85, "low_stock_threshold": 15},
    {"sku": "LAP-DELL-15", "name": "Dell Inspiron 15", "category": "Laptops", "price": "54990", "quantity": 12, "low_stock_threshold": 4, "description": "Core i5, 16GB RAM, 512GB SSD"},
]


def _image_for(name: str) -> str:
    # On-brand (black/white) placeholder; swap for a real CDN URL via the form.
    return f"https://placehold.co/600x600/0a0a0a/ffffff?text={quote_plus(name)}"

CUSTOMERS = [
    {"name": "Aarav Sharma", "email": "aarav.sharma@example.in", "phone": "+91 98765 43210", "address": "12 MG Road, Bengaluru, Karnataka"},
    {"name": "Priya Patel", "email": "priya.patel@example.in", "phone": "+91 99820 11223", "address": "45 Satellite Road, Ahmedabad, Gujarat"},
    {"name": "Rohan Gupta", "email": "rohan.gupta@example.in", "phone": "+91 90011 22334", "address": "8 Park Street, Kolkata, West Bengal"},
    {"name": "Ananya Iyer", "email": "ananya.iyer@example.in", "phone": "+91 98401 55667", "address": "23 Anna Salai, Chennai, Tamil Nadu"},
    {"name": "Vikram Singh", "email": "vikram.singh@example.in", "phone": "+91 99100 88776", "address": "67 Connaught Place, New Delhi"},
    {"name": "Sneha Reddy", "email": "sneha.reddy@example.in", "phone": "+91 90300 44551", "address": "19 Banjara Hills, Hyderabad, Telangana"},
    {"name": "Arjun Nair", "email": "arjun.nair@example.in", "phone": "+91 99461 33220", "address": "5 Marine Drive, Kochi, Kerala"},
    {"name": "Diya Mehta", "email": "diya.mehta@example.in", "phone": "+91 98191 77665", "address": "31 Linking Road, Mumbai, Maharashtra"},
]


def run() -> None:
    db = SessionLocal()
    try:
        # Clean slate (children first to respect FK constraints).
        db.query(Sale).delete()
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(Product).delete()
        db.query(Customer).delete()
        db.commit()

        products = [
            Product(
                **{**data, "price": Decimal(data["price"]), "image_url": _image_for(data["name"])}
            )
            for data in PRODUCTS
        ]
        customers = [Customer(**data) for data in CUSTOMERS]
        db.add_all(products)
        db.add_all(customers)
        db.commit()
        for row in (*products, *customers):
            db.refresh(row)

        # Two demo offers: one category-wide, one product-specific. Created before
        # the orders so the seeded orders reflect the discounted prices.
        sales = [
            Sale(name="Audio Fest", discount_percent=Decimal("15"), scope=SaleScope.category, category="Audio"),
            Sale(name="iPhone Launch Offer", discount_percent=Decimal("8"), scope=SaleScope.product, product_id=products[0].id),
        ]
        db.add_all(sales)
        db.commit()

        # A handful of orders through the real service so stock + totals are right.
        service = OrderService(db)
        order_plan = [
            (customers[0], [(products[0], 1), (products[3], 2)]),
            (customers[1], [(products[1], 1)]),
            (customers[2], [(products[6], 3), (products[4], 1)]),
            (customers[3], [(products[7], 1)]),
            (customers[5], [(products[3], 4)]),
        ]
        for customer, lines in order_plan:
            service.create(
                OrderCreate(
                    customer_id=customer.id,
                    items=[
                        OrderItemCreate(product_id=product.id, quantity=qty)
                        for product, qty in lines
                    ],
                )
            )

        print(
            f"Seeded {len(products)} products, {len(customers)} customers, "
            f"{len(sales)} sales, {len(order_plan)} orders."
        )
    finally:
        db.close()


if __name__ == "__main__":
    run()
