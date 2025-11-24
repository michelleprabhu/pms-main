from extensions import db
from flask_login import UserMixin
from models.base import AuditMixin
from datetime import datetime

class User(UserMixin, AuditMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=True)  # Nullable initially for backward compatibility
    last_login = db.Column(db.DateTime, nullable=True)

    # Relationships
    role = db.relationship('Role', back_populates='users', foreign_keys=[role_id], lazy=True)
    employee = db.relationship('Employee', back_populates='user', foreign_keys=[employee_id], uselist=False, lazy=True)
    organization = db.relationship('Organization', back_populates='users', foreign_keys=[org_id], lazy=True)
    # owned_goals relationship removed - goals are now linked to score_cards, not directly to users
    owned_competencies = db.relationship('Competency', foreign_keys='Competency.owner_id', back_populates='owner', lazy=True)
    owned_score_cards = db.relationship('ScoreCard', foreign_keys='ScoreCard.user_id', back_populates='user', lazy=True)
    owned_evaluations = db.relationship('Evaluation', foreign_keys='Evaluation.user_id', back_populates='user', lazy=True)
    received_notifications = db.relationship('Notification', foreign_keys='Notification.recipient_id', back_populates='recipient', lazy=True)
    created_users = db.relationship('User', foreign_keys='User.created_by', remote_side=[id], lazy=True)
    updated_users = db.relationship('User', foreign_keys='User.updated_by', remote_side=[id], lazy=True)

    def to_dict(self, include_permissions=True):
        """Convert user to dictionary, optionally including permissions"""
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role_id': self.role_id,
            'role': self.role.role_name if self.role else None,  # Include role_name for frontend compatibility
            'is_active': self.is_active,
            'employee_id': self.employee_id,
            'org_id': self.org_id,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }
        
        # Include permissions if requested
        if include_permissions:
            try:
                from services.permission_service import get_user_permission_codes
                data['permissions'] = list(get_user_permission_codes(self.id))
            except Exception as e:
                # If permission service fails, just return empty list
                # This ensures backward compatibility
                data['permissions'] = []
        
        return data