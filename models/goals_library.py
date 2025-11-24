from extensions import db
from models.base import AuditMixin
from sqlalchemy import CheckConstraint


class GoalsLibrary(AuditMixin, db.Model):
    __tablename__ = 'goals_library'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=True)  # Nullable initially for backward compatibility
    goal_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    success_criteria = db.Column(db.Text, nullable=True)
    goal_type = db.Column(db.String(50), nullable=False)  # 'Personal Goal', 'Development Goal', 'Business Goal'
    suggested_weight = db.Column(db.Numeric(5, 2), nullable=True, default=10.00)
    category = db.Column(db.String(100), nullable=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    # Relationships
    organization = db.relationship('Organization', backref='goals_library', foreign_keys=[org_id], lazy=True)
    created_by_user = db.relationship('User', foreign_keys='GoalsLibrary.created_by', remote_side='User.id', lazy=True)
    updated_by_user = db.relationship('User', foreign_keys='GoalsLibrary.updated_by', remote_side='User.id', lazy=True)

    # Check constraint for goal_type
    __table_args__ = (
        CheckConstraint("goal_type IN ('Personal Goal', 'Development Goal', 'Business Goal')", name='check_goal_type'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'org_id': self.org_id,
            'goal_name': self.goal_name,
            'description': self.description,
            'success_criteria': self.success_criteria,
            'goal_type': self.goal_type,
            'suggested_weight': float(self.suggested_weight) if self.suggested_weight else None,
            'category': self.category,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }

