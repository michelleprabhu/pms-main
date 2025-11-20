from extensions import db
from datetime import datetime

class Goal(db.Model):
    __tablename__ = 'goals'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    score_card_id = db.Column(db.Integer, db.ForeignKey('score_cards.id'), nullable=False)
    
    goal_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    success_criteria = db.Column(db.Text, nullable=True)
    weight = db.Column(db.Integer, nullable=False)  # Percentage (e.g., 30 means 30%)
    
    added_by_role = db.Column(db.String(20), nullable=False)  # 'HR', 'Manager', 'Employee'
    added_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    deadline_date = db.Column(db.Date, nullable=True)
    
    status = db.Column(db.String(50), default='active')  # active, accepted, rejected
    
    # Audit fields
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    score_card = db.relationship('ScoreCard', backref='goals')
    added_by_user = db.relationship('User', foreign_keys=[added_by_user_id])
    creator = db.relationship('User', foreign_keys=[created_by])
    updater = db.relationship('User', foreign_keys=[updated_by])

    def to_dict(self):
        return {
            'id': self.id,
            'score_card_id': self.score_card_id,
            'goal_name': self.goal_name,
            'description': self.description,
            'success_criteria': self.success_criteria,
            'weight': self.weight,
            'added_by_role': self.added_by_role,
            'added_by_user': {
                'id': self.added_by_user.id,
                'email': self.added_by_user.email,
                'username': self.added_by_user.username
            } if self.added_by_user else None,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'deadline_date': self.deadline_date.isoformat() if self.deadline_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }