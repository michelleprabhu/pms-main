from extensions import db
from models.base import AuditMixin
from datetime import datetime, date
from sqlalchemy import CheckConstraint


class Employee(AuditMixin, db.Model):
    __tablename__ = 'employees'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_id = db.Column(db.String(20), nullable=False)
    external_id = db.Column(db.String(50), unique=True, nullable=True)
    full_name = db.Column(db.String(200), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    address = db.Column(db.Text, nullable=True)
    joining_date = db.Column(db.Date, nullable=False)
    position_id = db.Column(db.Integer, db.ForeignKey('positions.id'), nullable=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    reporting_manager_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=True)
    employment_status = db.Column(db.String(20), nullable=False, default='Active')
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    salary_grade = db.Column(db.String(20), nullable=True)
    last_synced_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    position = db.relationship('Position', back_populates='employees', lazy=True)
    department = db.relationship('Department', foreign_keys=[department_id], back_populates='employees', lazy=True)
    reporting_manager = db.relationship('Employee', remote_side=[id], backref='direct_reports', lazy=True)
    user = db.relationship('User', back_populates='employee', foreign_keys='User.employee_id', uselist=False, lazy=True)
    created_by_user = db.relationship('User', foreign_keys='Employee.created_by', remote_side='User.id', lazy=True)
    updated_by_user = db.relationship('User', foreign_keys='Employee.updated_by', remote_side='User.id', lazy=True)

    # Check constraint: employee cannot be their own reporting manager
    __table_args__ = (
        CheckConstraint('reporting_manager_id IS NULL OR reporting_manager_id != id', name='check_self_manager'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'external_id': self.external_id,
            'full_name': self.full_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'joining_date': self.joining_date.isoformat() if self.joining_date else None,
            'position_id': self.position_id,
            'department_id': self.department_id,
            'reporting_manager_id': self.reporting_manager_id,
            'employment_status': self.employment_status,
            'is_active': self.is_active,
            'salary_grade': self.salary_grade,
            'last_synced_at': self.last_synced_at.isoformat() if self.last_synced_at else None,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }

