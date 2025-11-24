from models.position import Position
from extensions import db
from datetime import datetime


def create_position(title, department_id=None, grade_level=None, description=None, org_id=None, created_by=None):
    """Create a new position"""
    # Check for duplicate title (case-insensitive, excluding soft-deleted, same org and department)
    query = Position.query.filter(
        db.func.lower(Position.title) == db.func.lower(title),
        Position.deleted_at.is_(None)
    )
    if org_id:
        query = query.filter(Position.org_id == org_id)
    if department_id:
        query = query.filter(Position.department_id == department_id)
    
    existing = query.first()
    if existing:
        raise ValueError(f"Position '{title}' already exists in this department/organization")
    
    position = Position(
        title=title,
        department_id=department_id,
        grade_level=grade_level,
        description=description,
        org_id=org_id,
        created_by=created_by
    )
    db.session.add(position)
    db.session.commit()
    return position


def get_all_positions(org_id=None, department_id=None, include_inactive=False):
    """Get all positions, optionally filtered by org_id and/or department_id"""
    query = Position.query.filter(Position.deleted_at.is_(None))
    
    if org_id:
        query = query.filter(Position.org_id == org_id)
    if department_id:
        query = query.filter(Position.department_id == department_id)
    
    return query.order_by(Position.title).all()


def get_position_by_id(position_id):
    """Get position by ID"""
    return Position.query.filter(
        Position.id == position_id,
        Position.deleted_at.is_(None)
    ).first()


def update_position(position_id, title=None, department_id=None, grade_level=None, description=None, org_id=None):
    """Update an existing position"""
    position = Position.query.filter(
        Position.id == position_id,
        Position.deleted_at.is_(None)
    ).first()
    
    if not position:
        return None
    
    # Check for duplicate title if title is being updated
    if title and title != position.title:
        query = Position.query.filter(
            db.func.lower(Position.title) == db.func.lower(title),
            Position.id != position_id,
            Position.deleted_at.is_(None)
        )
        # Check org_id if position has one
        if position.org_id:
            query = query.filter(Position.org_id == position.org_id)
        # Check department_id if provided or if position has one
        dept_id_to_check = department_id if department_id is not None else position.department_id
        if dept_id_to_check:
            query = query.filter(Position.department_id == dept_id_to_check)
        
        existing = query.first()
        if existing:
            raise ValueError(f"Position '{title}' already exists in this department/organization")
        position.title = title
    
    if department_id is not None:
        position.department_id = department_id
    if grade_level is not None:
        position.grade_level = grade_level
    if description is not None:
        position.description = description
    if org_id is not None:
        position.org_id = org_id
    
    position.updated_at = datetime.utcnow()
    db.session.commit()
    return position


def delete_position(position_id):
    """Soft delete a position"""
    position = Position.query.filter(
        Position.id == position_id,
        Position.deleted_at.is_(None)
    ).first()
    
    if position:
        position.deleted_at = datetime.utcnow()
        db.session.commit()
        return True
    return False

