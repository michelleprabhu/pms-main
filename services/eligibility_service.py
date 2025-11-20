from models.employee import Employee
from models.department import Department
from models.position import Position
from models.eligibility_profile import EligibilityProfile
from sqlalchemy import or_


def get_matching_employees(profile_id):
    """
    Returns list of employee IDs matching the profile criteria.
    
    Args:
        profile_id: ID of the eligibility profile
        
    Returns:
        List of employee IDs (integers)
    """
    profile = EligibilityProfile.query.get(profile_id)
    if not profile:
        return []
    
    # Start with all active employees
    query = Employee.query.filter_by(
        is_active=True,
        employment_status='Active',
        deleted_at=None
    )
    
    # Filter by department
    if profile.department_filter and profile.department_filter != 'All':
        query = query.join(Employee.department).filter(
            Department.name == profile.department_filter
        )
    
    # Filter by position
    if profile.position_criteria and profile.position_criteria != 'All':
        keywords = profile.position_criteria.split('|')
        conditions = [Position.title.ilike(f'%{k.strip()}%') for k in keywords]
        query = query.join(Employee.position).filter(or_(*conditions))
    
    employees = query.all()
    return [e.id for e in employees]


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

