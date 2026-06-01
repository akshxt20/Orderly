"""add categories table

Revision ID: 0003
Revises: 0002
Create Date: 2026-01-03 00:00:00

Promotes categories from "whatever strings products happen to use" to a managed
table, seeded with the built-in set plus any category already present on a
product (so existing data stays selectable).
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_BUILTINS = ["Mobiles", "Audio", "Laptops", "Accessories", "Power"]


def upgrade() -> None:
    op.create_table(
        "categories",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_categories_name", "categories", ["name"], unique=True)

    # Seed: built-ins + any category already used by a product.
    conn = op.get_bind()
    used = conn.execute(
        sa.text("SELECT DISTINCT category FROM products WHERE category IS NOT NULL")
    ).fetchall()
    names = sorted({*_BUILTINS, *(row[0] for row in used)})
    if names:
        op.bulk_insert(
            sa.table("categories", sa.column("name", sa.String)),
            [{"name": name} for name in names],
        )


def downgrade() -> None:
    op.drop_index("ix_categories_name", table_name="categories")
    op.drop_table("categories")
