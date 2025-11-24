from extensions import db
from models.base import AuditMixin


class CompetenciesLibrary(AuditMixin, db.Model):
    __tablename__ = 'competencies_library'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=True)  # Nullable initially for backward compatibility
    competency_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    min_proficiency_level = db.Column(db.Integer, nullable=True, default=1)
    max_proficiency_level = db.Column(db.Integer, nullable=True, default=5)
    category = db.Column(db.String(100), nullable=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    # Relationships
    organization = db.relationship('Organization', backref='competencies_library', foreign_keys=[org_id], lazy=True)
    created_by_user = db.relationship('User', foreign_keys='CompetenciesLibrary.created_by', remote_side='User.id', lazy=True)
    updated_by_user = db.relationship('User', foreign_keys='CompetenciesLibrary.updated_by', remote_side='User.id', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'org_id': self.org_id,
            'competency_name': self.competency_name,
            'description': self.description,
            'min_proficiency_level': self.min_proficiency_level,
            'max_proficiency_level': self.max_proficiency_level,
            'category': self.category,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }

