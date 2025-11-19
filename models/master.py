from extensions import db
from datetime import datetime

class Master(db.Model):
    __tablename__ = 'master'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(50), unique=True, nullable=False)  # e.g., 'STATUS_GOAL', 'ROLE_USER', 'PERIOD_TYPE'
    value = db.Column(db.String(100), nullable=False)  # e.g., 'Pending', 'HR', 'Q1'
    description = db.Column(db.String(500))
    category = db.Column(db.String(50), nullable=False)  # e.g., 'STATUS', 'ROLE', 'PERIOD_TYPE'
    is_active = db.Column(db.Boolean, default=True)
    display_order = db.Column(db.Integer, default=0)
    meta_data = db.Column(db.JSON, default={})  # Additional data if needed
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    creator = db.relationship('User', foreign_keys=[created_by])
    updater = db.relationship('User', foreign_keys=[updated_by])

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'value': self.value,
            'description': self.description,
            'category': self.category,
            'is_active': self.is_active,
            'display_order': self.display_order,
            'meta_data': self.meta_data,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }

    @classmethod
    def get_by_category(cls, category):
        """Get all active master records by category"""
        return cls.query.filter_by(category=category, is_active=True, deleted_at=None).order_by(cls.display_order).all()

    @classmethod
    def get_by_code(cls, code):
        """Get master record by code"""
        return cls.query.filter_by(code=code, deleted_at=None).first()

