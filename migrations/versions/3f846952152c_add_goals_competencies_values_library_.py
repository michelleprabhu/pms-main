"""add_goals_competencies_values_library_tables

Revision ID: 3f846952152c
Revises: 46fa4ea05a2f
Create Date: 2025-11-23 17:25:29.039238

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3f846952152c'
down_revision = '46fa4ea05a2f'
branch_labels = None
depends_on = None


def upgrade():
    # Create goals_library table
    op.create_table('goals_library',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('org_id', sa.Integer(), nullable=True),  # Nullable initially for backward compatibility
        sa.Column('goal_name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('success_criteria', sa.Text(), nullable=True),
        sa.Column('goal_type', sa.String(length=50), nullable=False),
        sa.Column('suggested_weight', sa.Numeric(precision=5, scale=2), nullable=True, server_default='10.00'),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("goal_type IN ('Personal Goal', 'Development Goal', 'Business Goal')", name='check_goal_type')
    )
    op.create_index('idx_goals_library_org_id', 'goals_library', ['org_id'])
    op.create_index('idx_goals_library_is_active', 'goals_library', ['is_active'])
    op.create_index('idx_goals_library_deleted_at', 'goals_library', ['deleted_at'])
    op.create_index('idx_goals_library_category', 'goals_library', ['category'])

    # Create competencies_library table
    op.create_table('competencies_library',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('org_id', sa.Integer(), nullable=True),  # Nullable initially for backward compatibility
        sa.Column('competency_name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('min_proficiency_level', sa.Integer(), nullable=True, server_default='1'),
        sa.Column('max_proficiency_level', sa.Integer(), nullable=True, server_default='5'),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_competencies_library_org_id', 'competencies_library', ['org_id'])
    op.create_index('idx_competencies_library_is_active', 'competencies_library', ['is_active'])
    op.create_index('idx_competencies_library_deleted_at', 'competencies_library', ['deleted_at'])
    op.create_index('idx_competencies_library_category', 'competencies_library', ['category'])

    # Create values_library table
    op.create_table('values_library',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('org_id', sa.Integer(), nullable=True),  # Nullable initially for backward compatibility
        sa.Column('value_name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_values_library_org_id', 'values_library', ['org_id'])
    op.create_index('idx_values_library_is_active', 'values_library', ['is_active'])
    op.create_index('idx_values_library_deleted_at', 'values_library', ['deleted_at'])
    op.create_index('idx_values_library_category', 'values_library', ['category'])


def downgrade():
    op.drop_index('idx_values_library_category', table_name='values_library')
    op.drop_index('idx_values_library_deleted_at', table_name='values_library')
    op.drop_index('idx_values_library_is_active', table_name='values_library')
    op.drop_index('idx_values_library_org_id', table_name='values_library')
    op.drop_table('values_library')

    op.drop_index('idx_competencies_library_category', table_name='competencies_library')
    op.drop_index('idx_competencies_library_deleted_at', table_name='competencies_library')
    op.drop_index('idx_competencies_library_is_active', table_name='competencies_library')
    op.drop_index('idx_competencies_library_org_id', table_name='competencies_library')
    op.drop_table('competencies_library')

    op.drop_index('idx_goals_library_category', table_name='goals_library')
    op.drop_index('idx_goals_library_deleted_at', table_name='goals_library')
    op.drop_index('idx_goals_library_is_active', table_name='goals_library')
    op.drop_index('idx_goals_library_org_id', table_name='goals_library')
    op.drop_table('goals_library')
