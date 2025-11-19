from extensions import db
from models.base import AuditMixin
from datetime import datetime


class Role(AuditMixin, db.Model):
    __tablename__ = 'roles'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    role_name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    # Relationships
    users = db.relationship('User', back_populates='role', foreign_keys='User.role_id', lazy=True)
    created_by_user = db.relationship('User', foreign_keys='Role.created_by', remote_side='User.id', lazy=True)
    updated_by_user = db.relationship('User', foreign_keys='Role.updated_by', remote_side='User.id', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'role_name': self.role_name,
            'description': self.description,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }

