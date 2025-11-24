from extensions import db
from datetime import datetime

class ScoreCardComment(db.Model):
    __tablename__ = 'score_card_comments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    score_card_id = db.Column(db.Integer, db.ForeignKey('score_cards.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    comment_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = db.relationship('User', backref='score_card_comments')
    score_card = db.relationship('ScoreCard', backref=db.backref('comments', order_by=created_at))

    def to_dict(self):
        return {
            'id': self.id,
            'score_card_id': self.score_card_id,
            'user_id': self.user_id,
            'user_name': self.user.username if self.user else 'Unknown',
            'role': self.user.role.role_name if self.user and self.user.role else 'Unknown',
            'text': self.comment_text,
            'timestamp': self.created_at.isoformat()
        }
