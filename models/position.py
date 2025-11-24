from extensions import db
from models.base import AuditMixin
from datetime import datetime


class Position(AuditMixin, db.Model):
    __tablename__ = 'positions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(100), nullable=False)
    external_id = db.Column(db.String(50), unique=True, nullable=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=True)  # Nullable initially for backward compatibility
    grade_level = db.Column(db.String(20), nullable=True)
    description = db.Column(db.Text, nullable=True)
    last_synced_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    department = db.relationship('Department', back_populates='positions', lazy=True)
    employees = db.relationship('Employee', back_populates='position', lazy=True)
    organization = db.relationship('Organization', back_populates='positions', foreign_keys=[org_id], lazy=True)
    created_by_user = db.relationship('User', foreign_keys='Position.created_by', remote_side='User.id', lazy=True)
    updated_by_user = db.relationship('User', foreign_keys='Position.updated_by', remote_side='User.id', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'external_id': self.external_id,
            'department_id': self.department_id,
            'org_id': self.org_id,
            'grade_level': self.grade_level,
            'description': self.description,
            'last_synced_at': self.last_synced_at.isoformat() if self.last_synced_at else None,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }



