from extensions import db
from datetime import datetime

class Competency(db.Model):
    __tablename__ = 'competencies'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.String(500), nullable=False)
    proficiency_levels = db.Column(db.ARRAY(db.String(50)), default=['Beginner', 'Intermediate', 'Advanced', 'Expert'])
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    owner = db.relationship('User', foreign_keys=[owner_id], back_populates='owned_competencies')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'proficiency_levels': self.proficiency_levels,
            'owner_id': self.owner_id,
            'goal_count': len(self.goals),
            'created_at': self.created_at.isoformat()
        }