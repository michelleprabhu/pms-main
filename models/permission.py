from extensions import db
from models.base import AuditMixin
from datetime import datetime


class Permission(AuditMixin, db.Model):
    __tablename__ = 'permissions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(100), nullable=False, unique=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=True)  # e.g., 'pages', 'actions', 'hr_management'
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    # Relationships
    # Note: role_permissions table is defined in models.role
    roles = db.relationship('Role', secondary='role_permissions', back_populates='permissions', lazy='dynamic')
    created_by_user = db.relationship('User', foreign_keys='Permission.created_by', remote_side='User.id', lazy=True)
    updated_by_user = db.relationship('User', foreign_keys='Permission.updated_by', remote_side='User.id', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }

