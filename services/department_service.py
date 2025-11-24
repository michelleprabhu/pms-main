from models.department import Department
from extensions import db
from datetime import datetime


def create_department(name, description=None, head_of_department_id=None, org_id=None, created_by=None):
    """Create a new department"""
    # Check for duplicate name (case-insensitive, excluding soft-deleted, same org)
    query = Department.query.filter(
        db.func.lower(Department.name) == db.func.lower(name),
        Department.deleted_at.is_(None)
    )
    if org_id:
        query = query.filter(Department.org_id == org_id)
    
    existing = query.first()
    if existing:
        raise ValueError(f"Department '{name}' already exists")
    
    department = Department(
        name=name,
        description=description,
        head_of_department_id=head_of_department_id,
        org_id=org_id,
        created_by=created_by
    )
    db.session.add(department)
    db.session.commit()
    return department


def get_all_departments(org_id=None, include_inactive=False):
    """Get all departments, optionally filtered by org_id"""
    query = Department.query.filter(Department.deleted_at.is_(None))
    
    if org_id:
        query = query.filter(Department.org_id == org_id)
    
    return query.order_by(Department.name).all()


def get_department_by_id(department_id):
    """Get department by ID"""
    return Department.query.filter(
        Department.id == department_id,
        Department.deleted_at.is_(None)
    ).first()


def update_department(department_id, name=None, description=None, head_of_department_id=None, org_id=None):
    """Update an existing department"""
    department = Department.query.filter(
        Department.id == department_id,
        Department.deleted_at.is_(None)
    ).first()
    
    if not department:
        return None
    
    # Check for duplicate name if name is being updated
    if name and name != department.name:
        query = Department.query.filter(
            db.func.lower(Department.name) == db.func.lower(name),
            Department.id != department_id,
            Department.deleted_at.is_(None)
        )
        # Also check org_id if department has one
        if department.org_id:
            query = query.filter(Department.org_id == department.org_id)
        
        existing = query.first()
        if existing:
            raise ValueError(f"Department '{name}' already exists")
        department.name = name
    
    if description is not None:
        department.description = description
    if head_of_department_id is not None:
        department.head_of_department_id = head_of_department_id
    if org_id is not None:
        department.org_id = org_id
    
    department.updated_at = datetime.utcnow()
    db.session.commit()
    return department


def delete_department(department_id):
    """Soft delete a department"""
    department = Department.query.filter(
        Department.id == department_id,
        Department.deleted_at.is_(None)
    ).first()
    
    if department:
        department.deleted_at = datetime.utcnow()
        db.session.commit()
        return True
    return False

