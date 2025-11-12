"""merge heads

Revision ID: 85e844037487
Revises: 07563c89eb07, c68d85241f5d
Create Date: 2025-11-12 21:22:53.212420

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '85e844037487'
down_revision: Union[str, None] = ('07563c89eb07', 'c68d85241f5d')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
