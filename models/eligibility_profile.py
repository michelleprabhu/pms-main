from extensions import db
from models.base import AuditMixin


class EligibilityProfile(db.Model, AuditMixin):
    __tablename__ = 'eligibility_profiles'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    profile_name = db.Column(db.String(255), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    department_filter = db.Column(db.String(255), nullable=True)  # "Engineering", "Sales", "All", etc.
    position_criteria = db.Column(db.Text, nullable=True)  # Pipe-separated: "Manager|Director|Lead"
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'profile_name': self.profile_name,
            'description': self.description,
            'department_filter': self.department_filter,
            'position_criteria': self.position_criteria,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }

