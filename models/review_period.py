from extensions import db
from models.base import AuditMixin
from datetime import datetime, date
from sqlalchemy import CheckConstraint

class ReviewPeriod(AuditMixin, db.Model):
    __tablename__ = 'review_periods'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    period_name = db.Column(db.String(100), nullable=False)
    period_type = db.Column(db.String(50), nullable=False)  # 'Q1', 'Q2', 'Q3', 'Q4', 'Annual', 'Mid-Year'
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    financial_period = db.Column(db.String(50), nullable=True)  # e.g., 'FY2024', 'FY2025'
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=True, default='Draft')  # 'Draft', 'Active', 'Completed'
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    # Relationships
    creator = db.relationship('User', foreign_keys=[created_by], lazy=True)
    updater = db.relationship('User', foreign_keys=[updated_by], lazy=True)

    # Check constraint: end_date must be after start_date
    __table_args__ = (
        CheckConstraint('end_date > start_date', name='check_end_after_start'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'period_name': self.period_name,
            'period_type': self.period_type,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'financial_period': self.financial_period,
            'description': self.description,
            'status': self.status,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }

