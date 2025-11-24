from models.competencies_library import CompetenciesLibrary
from extensions import db
from datetime import datetime
from sqlalchemy import func, distinct


def create_competency_template(competency_name, description=None, min_proficiency_level=None,
                               max_proficiency_level=None, category=None, org_id=None, created_by=None):
    """Create a new competency template in the library"""
    # Check for duplicate competency_name (case-insensitive, excluding soft-deleted, same org)
    query = CompetenciesLibrary.query.filter(
        func.lower(CompetenciesLibrary.competency_name) == func.lower(competency_name),
        CompetenciesLibrary.deleted_at.is_(None)
    )
    if org_id:
        query = query.filter(CompetenciesLibrary.org_id == org_id)
    
    existing = query.first()
    if existing:
        raise ValueError(f"Competency '{competency_name}' already exists in the library")
    
    competency = CompetenciesLibrary(
        competency_name=competency_name,
        description=description,
        min_proficiency_level=min_proficiency_level or 1,
        max_proficiency_level=max_proficiency_level or 5,
        category=category,
        org_id=org_id,
        created_by=created_by
    )
    db.session.add(competency)
    db.session.commit()
    return competency


def get_all_competencies(org_id=None, category=None, include_inactive=False):
    """Get all competencies from library, optionally filtered by org_id, category"""
    query = CompetenciesLibrary.query.filter(CompetenciesLibrary.deleted_at.is_(None))
    
    if org_id:
        query = query.filter(CompetenciesLibrary.org_id == org_id)
    
    if category:
        query = query.filter(CompetenciesLibrary.category == category)
    
    if not include_inactive:
        query = query.filter(CompetenciesLibrary.is_active == True)
    
    return query.order_by(CompetenciesLibrary.competency_name).all()


def get_competency_by_id(competency_id):
    """Get competency template by ID"""
    return CompetenciesLibrary.query.filter(
        CompetenciesLibrary.id == competency_id,
        CompetenciesLibrary.deleted_at.is_(None)
    ).first()


def get_categories(org_id=None):
    """Get unique categories for competencies library"""
    query = db.session.query(distinct(CompetenciesLibrary.category)).filter(
        CompetenciesLibrary.deleted_at.is_(None),
        CompetenciesLibrary.is_active == True,
        CompetenciesLibrary.category.isnot(None)
    )
    
    if org_id:
        query = query.filter(CompetenciesLibrary.org_id == org_id)
    
    return [cat[0] for cat in query.all() if cat[0]]

