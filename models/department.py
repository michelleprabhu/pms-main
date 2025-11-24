from extensions import db
from models.base import AuditMixin
from datetime import datetime


class Department(AuditMixin, db.Model):
    __tablename__ = 'departments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    external_id = db.Column(db.String(50), unique=True, nullable=True)
    head_of_department_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=True)  # Nullable initially for backward compatibility
    description = db.Column(db.Text, nullable=True)
    last_synced_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    head_of_department = db.relationship('Employee', foreign_keys=[head_of_department_id], backref='departments_headed', lazy=True)
    positions = db.relationship('Position', back_populates='department', lazy=True)
    employees = db.relationship('Employee', foreign_keys='Employee.department_id', back_populates='department', lazy=True)
    organization = db.relationship('Organization', back_populates='departments', foreign_keys=[org_id], lazy=True)
    created_by_user = db.relationship('User', foreign_keys='Department.created_by', remote_side='User.id', lazy=True)
    updated_by_user = db.relationship('User', foreign_keys='Department.updated_by', remote_side='User.id', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'external_id': self.external_id,
            'head_of_department_id': self.head_of_department_id,
            'org_id': self.org_id,
            'description': self.description,
            'last_synced_at': self.last_synced_at.isoformat() if self.last_synced_at else None,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }



