from extensions import db
from datetime import datetime
from sqlalchemy import UniqueConstraint

class ScoreCard(db.Model):
    __tablename__ = 'score_cards'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    
    # Core fields for score cards
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    review_period_id = db.Column(db.Integer, db.ForeignKey('review_periods.id'), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='planning')
    overall_rating = db.Column(db.Float, nullable=True)
    
    # Legacy fields (now nullable for backward compatibility)
    title = db.Column(db.String(200), nullable=True)
    content = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    version = db.Column(db.Integer, default=1)
    published_date = db.Column(db.DateTime)
    
    # Audit fields
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    employee = db.relationship('Employee', backref='score_cards')
    review_period = db.relationship('ReviewPeriod', backref='score_cards')
    user = db.relationship('User', foreign_keys=[user_id], back_populates='owned_score_cards')
    evaluations = db.relationship('Evaluation', backref='related_score_card', lazy=True)

    # Approval history as a JSON column
    approval_history = db.Column(db.JSON, default=[])
    
    # Unique constraint: one score card per employee per review period
    __table_args__ = (
        UniqueConstraint('employee_id', 'review_period_id', name='uq_employee_review_period'),
    )

    @property
    def current_approval_status(self):
        if self.approval_history:
            return self.approval_history[-1]['status']
        return 'Not Started'

    def to_dict(self):
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'review_period_id': self.review_period_id,
            'status': self.status,
            'overall_rating': self.overall_rating,
            'title': self.title,
            'content': self.content,
            'user_id': self.user_id,
            'version': self.version,
            'published_date': self.published_date.isoformat() if self.published_date else None,
            'approval_status': self.current_approval_status,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }

