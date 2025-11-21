from models.employee import Employee
from models.department import Department
from models.position import Position
from models.eligibility_profile import EligibilityProfile
from extensions import db
from sqlalchemy import or_


def get_matching_employees(profile_id):
    """
    Returns list of employee IDs matching the profile criteria.
    Excludes HR Admin and User Admin employees.
    
    Args:
        profile_id: ID of the eligibility profile
        
    Returns:
        List of employee IDs (integers)
    """
    from models.user import User
    from models.role import Role
    
    profile = EligibilityProfile.query.get(profile_id)
    if not profile:
        return []
    
    # Start with all active employees
    query = Employee.query.filter_by(
        is_active=True,
        employment_status='Active',
        deleted_at=None
    )
    
    # CRITICAL: Exclude HR Admin and User Admin employees
    # Join with User table and filter out HR Admin/User Admin roles
    # Use distinct() to avoid duplicates from joins
    query = query.join(User, Employee.id == User.employee_id, isouter=True).join(
        Role, User.role_id == Role.id, isouter=True
    ).filter(
        (Role.role_name.is_(None)) |  # Employees without user accounts (shouldn't happen but safe)
        (~Role.role_name.in_(['HR Admin', 'User Admin']))  # Exclude HR Admin and User Admin
    ).distinct()
    
    # Filter by department (use LEFT JOIN to include employees without departments)
    if profile.department_filter and profile.department_filter != 'All':
        query = query.join(Department, Employee.department_id == Department.id, isouter=True).filter(
            Department.name == profile.department_filter
        )
    
    # Filter by position (use LEFT JOIN to include employees without positions)
    if profile.position_criteria and profile.position_criteria != 'All':
        keywords = profile.position_criteria.split('|')
        conditions = [Position.title.ilike(f'%{k.strip()}%') for k in keywords]
        query = query.join(Position, Employee.position_id == Position.id, isouter=True).filter(
            or_(*conditions)
        )
    
    employees = query.all()
    employee_ids = [e.id for e in employees]
    
    # Debug logging
    print(f"[get_matching_employees] Profile {profile_id} ({profile.profile_name}):")
    print(f"  Department filter: {profile.department_filter}")
    print(f"  Position criteria: {profile.position_criteria}")
    print(f"  Matching employees: {len(employee_ids)}")
    if len(employee_ids) <= 5:
        print(f"  Employee IDs: {employee_ids}")
    
    return employee_ids


def get_all_profiles_with_counts():
    """
    Returns all active profiles with employee counts.
    
    Returns:
        List of dictionaries containing profile details and matching employee counts
    """
    profiles = EligibilityProfile.query.filter_by(
        is_active=True,
        deleted_at=None
    ).all()
    
    result = []
    for p in profiles:
        employee_ids = get_matching_employees(p.id)
        result.append({
            'id': p.id,
            'profile_name': p.profile_name,
            'description': p.description,
            'department': p.department_filter,
            'position_criteria': p.position_criteria,
            'matching_employees': len(employee_ids)
        })
    
    return result


def create_eligibility_profile(profile_name, description=None, department_filter=None, position_criteria=None, is_active=True, created_by=None):
    """
    Create a new eligibility profile.
    
    Args:
        profile_name: Name of the profile (required, must be unique)
        description: Description of the profile
        department_filter: Department filter (e.g., "Engineering", "Sales", "All")
        position_criteria: Position criteria (pipe-separated, e.g., "Manager|Director|Lead")
        is_active: Whether the profile is active (default: True)
        created_by: User ID who created the profile
        
    Returns:
        Created EligibilityProfile object
        
    Raises:
        ValueError: If profile_name is empty or already exists
    """
    if not profile_name or not profile_name.strip():
        raise ValueError("Profile name is required")
    
    # Check for duplicate profile name (case-insensitive, excluding soft-deleted)
    existing = EligibilityProfile.query.filter(
        db.func.lower(EligibilityProfile.profile_name) == db.func.lower(profile_name.strip()),
        EligibilityProfile.deleted_at.is_(None)
    ).first()
    if existing:
        raise ValueError(f"Profile name '{profile_name}' already exists")
    
    profile = EligibilityProfile(
        profile_name=profile_name.strip(),
        description=description,
        department_filter=department_filter,
        position_criteria=position_criteria,
        is_active=is_active,
        created_by=created_by
    )
    
    db.session.add(profile)
    db.session.commit()
    
    return profile

