from models.values_library import ValuesLibrary
from extensions import db
from datetime import datetime
from sqlalchemy import func, distinct


def create_value_template(value_name, description=None, category=None, org_id=None, created_by=None):
    """Create a new value template in the library"""
    # Check for duplicate value_name (case-insensitive, excluding soft-deleted, same org)
    query = ValuesLibrary.query.filter(
        func.lower(ValuesLibrary.value_name) == func.lower(value_name),
        ValuesLibrary.deleted_at.is_(None)
    )
    if org_id:
        query = query.filter(ValuesLibrary.org_id == org_id)
    
    existing = query.first()
    if existing:
        raise ValueError(f"Value '{value_name}' already exists in the library")
    
    value = ValuesLibrary(
        value_name=value_name,
        description=description,
        category=category,
        org_id=org_id,
        created_by=created_by
    )
    db.session.add(value)
    db.session.commit()
    return value


def get_all_values(org_id=None, category=None, include_inactive=False):
    """Get all values from library, optionally filtered by org_id, category"""
    query = ValuesLibrary.query.filter(ValuesLibrary.deleted_at.is_(None))
    
    if org_id:
        query = query.filter(ValuesLibrary.org_id == org_id)
    
    if category:
        query = query.filter(ValuesLibrary.category == category)
    
    if not include_inactive:
        query = query.filter(ValuesLibrary.is_active == True)
    
    return query.order_by(ValuesLibrary.value_name).all()


def get_value_by_id(value_id):
    """Get value template by ID"""
    return ValuesLibrary.query.filter(
        ValuesLibrary.id == value_id,
        ValuesLibrary.deleted_at.is_(None)
    ).first()


def get_categories(org_id=None):
    """Get unique categories for values library"""
    query = db.session.query(distinct(ValuesLibrary.category)).filter(
        ValuesLibrary.deleted_at.is_(None),
        ValuesLibrary.is_active == True,
        ValuesLibrary.category.isnot(None)
    )
    
    if org_id:
        query = query.filter(ValuesLibrary.org_id == org_id)
    
    return [cat[0] for cat in query.all() if cat[0]]

