from models.goals_library import GoalsLibrary
from extensions import db
from datetime import datetime
from sqlalchemy import func, distinct


def create_goal_template(goal_name, description=None, success_criteria=None, goal_type=None, 
                        suggested_weight=None, category=None, org_id=None, created_by=None):
    """Create a new goal template in the library"""
    # Check for duplicate goal_name (case-insensitive, excluding soft-deleted, same org)
    query = GoalsLibrary.query.filter(
        func.lower(GoalsLibrary.goal_name) == func.lower(goal_name),
        GoalsLibrary.deleted_at.is_(None)
    )
    if org_id:
        query = query.filter(GoalsLibrary.org_id == org_id)
    
    existing = query.first()
    if existing:
        raise ValueError(f"Goal '{goal_name}' already exists in the library")
    
    goal = GoalsLibrary(
        goal_name=goal_name,
        description=description,
        success_criteria=success_criteria,
        goal_type=goal_type,
        suggested_weight=suggested_weight or 10.00,
        category=category,
        org_id=org_id,
        created_by=created_by
    )
    db.session.add(goal)
    db.session.commit()
    return goal


def get_all_goals(org_id=None, category=None, goal_type=None, include_inactive=False):
    """Get all goals from library, optionally filtered by org_id, category, goal_type"""
    query = GoalsLibrary.query.filter(GoalsLibrary.deleted_at.is_(None))
    
    if org_id:
        query = query.filter(GoalsLibrary.org_id == org_id)
    
    if category:
        query = query.filter(GoalsLibrary.category == category)
    
    if goal_type:
        query = query.filter(GoalsLibrary.goal_type == goal_type)
    
    if not include_inactive:
        query = query.filter(GoalsLibrary.is_active == True)
    
    return query.order_by(GoalsLibrary.goal_name).all()


def get_goal_by_id(goal_id):
    """Get goal template by ID"""
    return GoalsLibrary.query.filter(
        GoalsLibrary.id == goal_id,
        GoalsLibrary.deleted_at.is_(None)
    ).first()


def update_goal(goal_id, goal_name=None, description=None, success_criteria=None, 
                goal_type=None, suggested_weight=None, category=None, is_active=None, updated_by=None):
    """Update an existing goal template"""
    goal = GoalsLibrary.query.filter(
        GoalsLibrary.id == goal_id,
        GoalsLibrary.deleted_at.is_(None)
    ).first()
    
    if not goal:
        return None
    
    # Check for duplicate goal_name if name is being updated
    if goal_name and goal_name != goal.goal_name:
        query = GoalsLibrary.query.filter(
            func.lower(GoalsLibrary.goal_name) == func.lower(goal_name),
            GoalsLibrary.id != goal_id,
            GoalsLibrary.deleted_at.is_(None)
        )
        if goal.org_id:
            query = query.filter(GoalsLibrary.org_id == goal.org_id)
        
        existing = query.first()
        if existing:
            raise ValueError(f"Goal '{goal_name}' already exists in the library")
        goal.goal_name = goal_name
    
    if description is not None:
        goal.description = description
    if success_criteria is not None:
        goal.success_criteria = success_criteria
    if goal_type is not None:
        goal.goal_type = goal_type
    if suggested_weight is not None:
        goal.suggested_weight = suggested_weight
    if category is not None:
        goal.category = category
    if is_active is not None:
        goal.is_active = is_active
    if updated_by is not None:
        goal.updated_by = updated_by
    
    goal.updated_at = datetime.utcnow()
    db.session.commit()
    return goal


def delete_goal(goal_id):
    """Soft delete a goal template"""
    goal = GoalsLibrary.query.filter(
        GoalsLibrary.id == goal_id,
        GoalsLibrary.deleted_at.is_(None)
    ).first()
    
    if goal:
        goal.deleted_at = datetime.utcnow()
        db.session.commit()
        return True
    return False


def get_categories(org_id=None):
    """Get unique categories for goals library"""
    query = GoalsLibrary.query.filter(
        GoalsLibrary.deleted_at.is_(None),
        GoalsLibrary.is_active == True,
        GoalsLibrary.category.isnot(None)
    )
    
    if org_id:
        query = query.filter(GoalsLibrary.org_id == org_id)
    
    categories = db.session.query(distinct(GoalsLibrary.category)).filter(
        GoalsLibrary.deleted_at.is_(None),
        GoalsLibrary.is_active == True,
        GoalsLibrary.category.isnot(None)
    )
    
    if org_id:
        categories = categories.filter(GoalsLibrary.org_id == org_id)
    
    return [cat[0] for cat in categories.all() if cat[0]]

