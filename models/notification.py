from extensions import db
from datetime import datetime

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.String(500), nullable=False)
    entity_type = db.Column(db.String(50), nullable=False)  # 'Goal', 'PerformanceDocument', 'Evaluation'
    entity_id = db.Column(db.Integer, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    
    # Audit fields
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    recipient = db.relationship('User', foreign_keys=[recipient_id], back_populates='received_notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'recipient': self.recipient_id,
            'message': self.message,
            'entityType': self.entity_type,
            'entityId': self.entity_id,
            'isRead': self.is_read,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }