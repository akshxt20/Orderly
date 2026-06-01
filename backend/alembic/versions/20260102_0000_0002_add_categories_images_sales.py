"""add product category/image and the sales table

Revision ID: 0002
Revises: 0001
Create Date: 2026-01-02 00:00:00

Adds catalogue categories and product images, plus a sales/offers table that can
target a single product or a whole category.
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- products: new columns ---
    # server_default backfills existing rows so the NOT NULL category is safe.
    op.add_column(
        "products",
        sa.Column("category", sa.String(length=50), server_default="Accessories", nullable=False),
    )
    op.add_column("products", sa.Column("image_url", sa.String(length=500), nullable=True))
    op.create_index("ix_products_category", "products", ["category"])

    # --- sales ---
    sale_scope = postgresql.ENUM("product", "category", name="sale_scope")
    sale_scope.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "sales",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("discount_percent", sa.Numeric(5, 2), nullable=False),
        sa.Column("scope", postgresql.ENUM(name="sale_scope", create_type=False), nullable=False),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("category", sa.String(length=50), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint(
            "discount_percent > 0 AND discount_percent <= 100",
            name="ck_sales_discount_range",
        ),
        sa.CheckConstraint(
            "(scope = 'product' AND product_id IS NOT NULL AND category IS NULL) "
            "OR (scope = 'category' AND category IS NOT NULL AND product_id IS NULL)",
            name="ck_sales_target_matches_scope",
        ),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_sales_product_id", "sales", ["product_id"])
    op.create_index("ix_sales_category", "sales", ["category"])


def downgrade() -> None:
    op.drop_table("sales")
    postgresql.ENUM(name="sale_scope").drop(op.get_bind(), checkfirst=True)
    op.drop_index("ix_products_category", table_name="products")
    op.drop_column("products", "image_url")
    op.drop_column("products", "category")
