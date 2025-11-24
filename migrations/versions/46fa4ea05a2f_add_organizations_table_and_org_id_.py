"""add_organizations_table_and_org_id_columns

Revision ID: 46fa4ea05a2f
Revises: 0caad775a0b5
Create Date: 2025-11-20 20:41:16.772555

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '46fa4ea05a2f'
down_revision = '0caad775a0b5'
branch_labels = None
depends_on = None


def upgrade():
    # Create organizations table
    op.create_table('organizations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code')
    )
    op.create_index('idx_organizations_code', 'organizations', ['code'])
    op.create_index('idx_organizations_is_active', 'organizations', ['is_active'])
    op.create_index('idx_organizations_deleted_at', 'organizations', ['deleted_at'])

    # Add org_id to users table (nullable initially for backward compatibility)
    op.add_column('users', sa.Column('org_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_users_org_id', 'users', 'organizations', ['org_id'], ['id'])

    # Add org_id to employees table (nullable initially)
    op.add_column('employees', sa.Column('org_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_employees_org_id', 'employees', 'organizations', ['org_id'], ['id'])

    # Add org_id to departments table (nullable initially)
    op.add_column('departments', sa.Column('org_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_departments_org_id', 'departments', 'organizations', ['org_id'], ['id'])

    # Add org_id to positions table (nullable initially)
    op.add_column('positions', sa.Column('org_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_positions_org_id', 'positions', 'organizations', ['org_id'], ['id'])


def downgrade():
    # Remove org_id columns
    op.drop_constraint('fk_positions_org_id', 'positions', type_='foreignkey')
    op.drop_column('positions', 'org_id')
    
    op.drop_constraint('fk_departments_org_id', 'departments', type_='foreignkey')
    op.drop_column('departments', 'org_id')
    
    op.drop_constraint('fk_employees_org_id', 'employees', type_='foreignkey')
    op.drop_column('employees', 'org_id')
    
    op.drop_constraint('fk_users_org_id', 'users', type_='foreignkey')
    op.drop_column('users', 'org_id')

    # Drop organizations table
    op.drop_table('organizations')
