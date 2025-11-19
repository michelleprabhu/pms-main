from extensions import db
from datetime import datetime

class Goal(db.Model):
    __tablename__ = 'goals'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Pending')
    metrics = db.Column(db.JSON, default={})
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    owner = db.relationship('User', foreign_keys=[owner_id], back_populates='owned_goals')
    creator = db.relationship('User', foreign_keys=[created_by])
    updater = db.relationship('User', foreign_keys=[updated_by])

    def __init__(self, title, description, owner_id, start_date, end_date, created_by):
        self.title = title
        self.description = description
        self.owner_id = owner_id
        self.start_date = start_date
        self.end_date = end_date
        self.created_by = created_by

    @property
    def duration(self):
        return (self.end_date - self.start_date).days

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'owner_id': self.owner_id,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'status': self.status,
            'metrics': self.metrics,
            'duration': self.duration,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }