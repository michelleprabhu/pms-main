"""rename performance_documents to score_cards

Revision ID: ec65daf833bf
Revises: a2240e3dce57
Create Date: 2025-11-19 18:48:52.874735

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'ec65daf833bf'
down_revision = 'a2240e3dce57'
branch_labels = None
depends_on = None


def upgrade():
    # Rename table from performance_documents to score_cards
    op.rename_table('performance_documents', 'score_cards')
    
    # Rename the sequence
    op.execute('ALTER SEQUENCE performance_documents_id_seq RENAME TO score_cards_id_seq')
    
    # Rename foreign key constraints
    op.execute('ALTER TABLE score_cards RENAME CONSTRAINT performance_documents_created_by_fkey TO score_cards_created_by_fkey')
    op.execute('ALTER TABLE score_cards RENAME CONSTRAINT performance_documents_employee_id_fkey TO score_cards_employee_id_fkey')
    op.execute('ALTER TABLE score_cards RENAME CONSTRAINT performance_documents_review_period_id_fkey TO score_cards_review_period_id_fkey')
    op.execute('ALTER TABLE score_cards RENAME CONSTRAINT performance_documents_updated_by_fkey TO score_cards_updated_by_fkey')
    op.execute('ALTER TABLE score_cards RENAME CONSTRAINT performance_documents_user_id_fkey TO score_cards_user_id_fkey')
    op.execute('ALTER TABLE score_cards RENAME CONSTRAINT performance_documents_pkey TO score_cards_pkey')
    
    # Update evaluations table - rename column and update foreign key
    with op.batch_alter_table('evaluations', schema=None) as batch_op:
        batch_op.alter_column('performance_document_id', new_column_name='score_card_id')
    
    # Rename the foreign key constraint in evaluations table
    op.execute('ALTER TABLE evaluations RENAME CONSTRAINT evaluations_performance_document_id_fkey TO evaluations_score_card_id_fkey')


def downgrade():
    # Rename table back from score_cards to performance_documents
    op.rename_table('score_cards', 'performance_documents')
    
    # Rename the sequence back
    op.execute('ALTER SEQUENCE score_cards_id_seq RENAME TO performance_documents_id_seq')
    
    # Rename foreign key constraints back
    op.execute('ALTER TABLE performance_documents RENAME CONSTRAINT score_cards_created_by_fkey TO performance_documents_created_by_fkey')
    op.execute('ALTER TABLE performance_documents RENAME CONSTRAINT score_cards_employee_id_fkey TO performance_documents_employee_id_fkey')
    op.execute('ALTER TABLE performance_documents RENAME CONSTRAINT score_cards_review_period_id_fkey TO performance_documents_review_period_id_fkey')
    op.execute('ALTER TABLE performance_documents RENAME CONSTRAINT score_cards_updated_by_fkey TO performance_documents_updated_by_fkey')
    op.execute('ALTER TABLE performance_documents RENAME CONSTRAINT score_cards_user_id_fkey TO performance_documents_user_id_fkey')
    op.execute('ALTER TABLE performance_documents RENAME CONSTRAINT score_cards_pkey TO performance_documents_pkey')
    
    # Update evaluations table back - rename column and update foreign key
    with op.batch_alter_table('evaluations', schema=None) as batch_op:
        batch_op.alter_column('score_card_id', new_column_name='performance_document_id')
    
    # Rename the foreign key constraint in evaluations table back
    op.execute('ALTER TABLE evaluations RENAME CONSTRAINT evaluations_score_card_id_fkey TO evaluations_performance_document_id_fkey')
