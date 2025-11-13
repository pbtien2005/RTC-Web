"""merge heads

Revision ID: fd454f4cd70e
Revises: 343911d63462, 85e844037487
Create Date: 2025-11-13 10:57:18.827486

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fd454f4cd70e'
down_revision: Union[str, None] = ('343911d63462', '85e844037487')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
