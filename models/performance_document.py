from extensions import db
from datetime import datetime

class PerformanceDocument(db.Model):
    __tablename__ = 'performance_documents'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Draft')
    version = db.Column(db.Integer, default=1)
    published_date = db.Column(db.DateTime)
    
    # Audit fields
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], back_populates='owned_documents')
    evaluations = db.relationship('Evaluation', backref='document', lazy=True)

    # Approval history as a JSON column
    approval_history = db.Column(db.JSON, default=[])

    @property
    def current_approval_status(self):
        if self.approval_history:
            return self.approval_history[-1]['status']
        return 'Not Started'

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'user_id': self.user_id,
            'status': self.status,
            'version': self.version,
            'published_date': self.published_date.isoformat() if self.published_date else None,
            'approval_status': self.current_approval_status,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }