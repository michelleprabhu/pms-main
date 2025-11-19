from extensions import db
from datetime import datetime

class Evaluation(db.Model):
    __tablename__ = 'evaluations'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    evaluation_type = db.Column(db.String(20), nullable=False)
    performance_document_id = db.Column(db.Integer, db.ForeignKey('performance_documents.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    evaluator_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    ratings = db.Column(db.JSON, nullable=False)
    comments = db.Column(db.Text)
    status = db.Column(db.String(20), nullable=False, default='Draft')
    submitted_at = db.Column(db.DateTime)
    approved_at = db.Column(db.DateTime)
    
    # Audit fields
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)

    # Relationships - overlaps parameter added to fix SQLAlchemy warning
    performance_document = db.relationship('PerformanceDocument', foreign_keys=[performance_document_id], overlaps="document,evaluations")
    user = db.relationship('User', foreign_keys=[user_id], back_populates='owned_evaluations')
    evaluator = db.relationship('User', foreign_keys=[evaluator_id])

    @property
    def summary(self):
        return {
            'type': self.evaluation_type,
            'status': self.status,
            'submitted': self.submitted_at.isoformat() if self.submitted_at else 'Not submitted',
            'approved': self.approved_at.isoformat() if self.approved_at else 'Not approved'
        }

    def to_dict(self):
        return {
            'id': self.id,
            'evaluation_type': self.evaluation_type,
            'performance_document_id': self.performance_document_id,
            'user_id': self.user_id,
            'evaluator_id': self.evaluator_id,
            'ratings': self.ratings,
            'comments': self.comments,
            'status': self.status,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }