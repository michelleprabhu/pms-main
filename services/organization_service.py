from models.organization import Organization
from extensions import db
from datetime import datetime


def create_organization(name, code, description=None, is_active=True, created_by=None):
    """Create a new organization"""
    # Check for duplicate code (case-insensitive, excluding soft-deleted)
    existing = Organization.query.filter(
        db.func.lower(Organization.code) == db.func.lower(code),
        Organization.deleted_at.is_(None)
    ).first()
    if existing:
        raise ValueError(f"Organization code '{code}' already exists")
    
    organization = Organization(
        name=name,
        code=code,
        description=description,
        is_active=is_active,
        created_by=created_by
    )
    db.session.add(organization)
    db.session.commit()
    return organization


def get_all_organizations(include_inactive=False):
    """Get all organizations, optionally including inactive ones"""
    query = Organization.query.filter(Organization.deleted_at.is_(None))
    if not include_inactive:
        query = query.filter(Organization.is_active == True)
    return query.order_by(Organization.name).all()


def get_organization_by_id(org_id):
    """Get organization by ID"""
    return Organization.query.filter(
        Organization.id == org_id,
        Organization.deleted_at.is_(None)
    ).first()


def get_organization_by_code(code):
    """Get organization by code"""
    return Organization.query.filter(
        db.func.lower(Organization.code) == db.func.lower(code),
        Organization.deleted_at.is_(None)
    ).first()


def update_organization(org_id, name=None, code=None, description=None, is_active=None):
    """Update an existing organization"""
    organization = Organization.query.filter(
        Organization.id == org_id,
        Organization.deleted_at.is_(None)
    ).first()
    
    if not organization:
        return None
    
    # Check for duplicate code if code is being updated
    if code and code != organization.code:
        existing = Organization.query.filter(
            db.func.lower(Organization.code) == db.func.lower(code),
            Organization.id != org_id,
            Organization.deleted_at.is_(None)
        ).first()
        if existing:
            raise ValueError(f"Organization code '{code}' already exists")
        organization.code = code
    
    if name is not None:
        organization.name = name
    if description is not None:
        organization.description = description
    if is_active is not None:
        organization.is_active = is_active
    
    organization.updated_at = datetime.utcnow()
    db.session.commit()
    return organization


def delete_organization(org_id):
    """Soft delete an organization"""
    organization = Organization.query.filter(
        Organization.id == org_id,
        Organization.deleted_at.is_(None)
    ).first()
    
    if organization:
        organization.deleted_at = datetime.utcnow()
        organization.is_active = False
        db.session.commit()
        return True
    return False

