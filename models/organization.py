from extensions import db
from models.base import AuditMixin
from datetime import datetime


class Organization(AuditMixin, db.Model):
    __tablename__ = 'organizations'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(200), nullable=False)
    code = db.Column(db.String(50), unique=True, nullable=False)  # e.g., 'ORG001', 'ACME_CORP'
    description = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    # Relationships
    users = db.relationship('User', foreign_keys='User.org_id', back_populates='organization', lazy=True)
    employees = db.relationship('Employee', foreign_keys='Employee.org_id', back_populates='organization', lazy=True)
    departments = db.relationship('Department', foreign_keys='Department.org_id', back_populates='organization', lazy=True)
    positions = db.relationship('Position', foreign_keys='Position.org_id', back_populates='organization', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'description': self.description,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }

