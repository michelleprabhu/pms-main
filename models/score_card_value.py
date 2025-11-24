from extensions import db
from datetime import datetime

class ScoreCardValue(db.Model):
    __tablename__ = 'score_card_values'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    score_card_id = db.Column(db.Integer, db.ForeignKey('score_cards.id'), nullable=False)
    
    # Link to library (optional if custom)
    library_id = db.Column(db.Integer, db.ForeignKey('values_library.id'), nullable=True)
    
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    added_by_role = db.Column(db.String(20), nullable=False, default='HR')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    score_card = db.relationship('ScoreCard', backref='values')
    library_item = db.relationship('ValuesLibrary')

    def to_dict(self):
        return {
            'id': self.id,
            'score_card_id': self.score_card_id,
            'library_id': self.library_id,
            'name': self.name,
            'description': self.description,
            'added_by_role': self.added_by_role,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
