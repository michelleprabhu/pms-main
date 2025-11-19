"""Create new database schema with roles, departments, positions, employees, updated users and review_periods

Revision ID: 15c5cf36c947
Revises: 4c90e9b7a452
Create Date: 2025-11-18 21:48:47.591617

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '15c5cf36c947'
down_revision = '4c90e9b7a452'
branch_labels = None
depends_on = None


def upgrade():
    # Step 1: Drop existing tables that depend on users (to avoid FK constraint issues)
    # We'll recreate them later if needed
    op.drop_table('notifications', if_exists=True)
    op.drop_table('evaluations', if_exists=True)
    op.drop_table('performance_documents', if_exists=True)
    op.drop_table('competencies', if_exists=True)
    op.drop_table('goals', if_exists=True)
    op.drop_table('review_periods', if_exists=True)
    op.drop_table('master', if_exists=True)  # Drop master table that depends on users
    
    # Step 2: Create roles table
    op.create_table('roles',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('role_name', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_roles_is_active', 'roles', ['is_active'])
    op.create_index('idx_roles_deleted_at', 'roles', ['deleted_at'])
    
    # Step 3: Create departments table (no dependencies yet)
    op.create_table('departments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('external_id', sa.String(length=50), nullable=True),
        sa.Column('head_of_department_id', sa.Integer(), nullable=True),  # Will add FK after employees table
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('last_synced_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('external_id')
    )
    op.create_index('idx_departments_head_of_department_id', 'departments', ['head_of_department_id'])
    op.create_index('idx_departments_deleted_at', 'departments', ['deleted_at'])
    
    # Step 4: Create positions table
    op.create_table('positions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(length=100), nullable=False),
        sa.Column('external_id', sa.String(length=50), nullable=True),
        sa.Column('department_id', sa.Integer(), nullable=True),
        sa.Column('grade_level', sa.String(length=20), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('last_synced_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['department_id'], ['departments.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('external_id')
    )
    op.create_index('idx_positions_department_id', 'positions', ['department_id'])
    op.create_index('idx_positions_deleted_at', 'positions', ['deleted_at'])
    
    # Step 5: Create employees table
    op.create_table('employees',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('employee_id', sa.String(length=20), nullable=False),
        sa.Column('external_id', sa.String(length=50), nullable=True),
        sa.Column('full_name', sa.String(length=200), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=True),
        sa.Column('email', sa.String(length=120), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('joining_date', sa.Date(), nullable=False),
        sa.Column('position_id', sa.Integer(), nullable=True),
        sa.Column('department_id', sa.Integer(), nullable=True),
        sa.Column('reporting_manager_id', sa.Integer(), nullable=True),
        sa.Column('employment_status', sa.String(length=20), nullable=False, server_default='Active'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('salary_grade', sa.String(length=20), nullable=True),
        sa.Column('last_synced_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['position_id'], ['positions.id'], ),
        sa.ForeignKeyConstraint(['department_id'], ['departments.id'], ),
        sa.ForeignKeyConstraint(['reporting_manager_id'], ['employees.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('external_id'),
        sa.CheckConstraint('reporting_manager_id IS NULL OR reporting_manager_id != id', name='check_self_manager')
    )
    op.create_index('idx_employees_department_id', 'employees', ['department_id'])
    op.create_index('idx_employees_position_id', 'employees', ['position_id'])
    op.create_index('idx_employees_reporting_manager_id', 'employees', ['reporting_manager_id'])
    op.create_index('idx_employees_employment_status', 'employees', ['employment_status'])
    op.create_index('idx_employees_is_active', 'employees', ['is_active'])
    op.create_index('idx_employees_deleted_at', 'employees', ['deleted_at'])
    
    # Step 6: Add FK from departments to employees (now that employees table exists)
    op.create_foreign_key('fk_departments_head_of_department', 'departments', 'employees', ['head_of_department_id'], ['id'])
    
    # Step 7: Drop old users table and create new one
    op.drop_table('users')
    op.create_table('users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('username', sa.String(length=80), nullable=False),
        sa.Column('email', sa.String(length=120), nullable=False),
        sa.Column('password', sa.String(length=200), nullable=False),
        sa.Column('role_id', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('employee_id', sa.Integer(), nullable=True),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_users_employee_id', 'users', ['employee_id'])
    op.create_index('idx_users_role_id', 'users', ['role_id'])
    op.create_index('idx_users_is_active', 'users', ['is_active'])
    op.create_index('idx_users_deleted_at', 'users', ['deleted_at'])
    
    # Step 8: Add FKs to departments, positions, employees for created_by/updated_by (roles FK added after users exist)
    op.create_foreign_key('fk_departments_created_by', 'departments', 'users', ['created_by'], ['id'])
    op.create_foreign_key('fk_departments_updated_by', 'departments', 'users', ['updated_by'], ['id'])
    op.create_foreign_key('fk_positions_created_by', 'positions', 'users', ['created_by'], ['id'])
    op.create_foreign_key('fk_positions_updated_by', 'positions', 'users', ['updated_by'], ['id'])
    op.create_foreign_key('fk_employees_created_by', 'employees', 'users', ['created_by'], ['id'])
    op.create_foreign_key('fk_employees_updated_by', 'employees', 'users', ['updated_by'], ['id'])
    
    # Step 9: Add FKs to roles for created_by/updated_by (now that users table exists)
    op.create_foreign_key('fk_roles_created_by', 'roles', 'users', ['created_by'], ['id'])
    op.create_foreign_key('fk_roles_updated_by', 'roles', 'users', ['updated_by'], ['id'])
    
    # Step 10: Create review_periods table with new schema
    op.create_table('review_periods',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('period_name', sa.String(length=100), nullable=False),
        sa.Column('period_type', sa.String(length=50), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('financial_period', sa.String(length=50), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('end_date > start_date', name='check_end_after_start')
    )
    op.create_index('idx_review_periods_period_type', 'review_periods', ['period_type'])
    op.create_index('idx_review_periods_start_date', 'review_periods', ['start_date'])
    op.create_index('idx_review_periods_end_date', 'review_periods', ['end_date'])
    op.create_index('idx_review_periods_is_active', 'review_periods', ['is_active'])
    op.create_index('idx_review_periods_deleted_at', 'review_periods', ['deleted_at'])


def downgrade():
    # Drop tables in reverse order
    op.drop_table('review_periods')
    op.drop_table('users')
    op.drop_table('employees')
    op.drop_table('positions')
    op.drop_table('departments')
    op.drop_table('roles')
