from models.employee import Employee
from extensions import db
from datetime import datetime, date


def _generate_employee_id(org_id=None):
    """Auto-generate employee ID in format EMP001, EMP002, etc."""
    # Get the highest existing employee_id number
    query = Employee.query.filter(
        Employee.employee_id.like('EMP%'),
        Employee.deleted_at.is_(None)
    )
    
    if org_id:
        query = query.filter(Employee.org_id == org_id)
    
    # Get all employee_ids that match the pattern
    employees = query.all()
    max_num = 0
    
    for emp in employees:
        try:
            # Extract number from EMP001 format
            num_str = emp.employee_id.replace('EMP', '').strip()
            if num_str:  # Make sure it's not empty
                num = int(num_str)
                if num > max_num:
                    max_num = num
        except (ValueError, AttributeError):
            continue
    
    # Generate next employee ID
    next_num = max_num + 1
    new_id = f"EMP{next_num:03d}"
    
    # Double-check this ID doesn't already exist (race condition protection)
    existing = Employee.query.filter(
        Employee.employee_id == new_id,
        Employee.deleted_at.is_(None)
    ).first()
    
    if existing:
        # If it exists, try next number (shouldn't happen, but safety check)
        next_num += 1
        new_id = f"EMP{next_num:03d}"
    
    return new_id


def create_employee(employee_id=None, full_name=None, email=None, phone=None, address=None,
                   date_of_birth=None, gender=None, joining_date=None, position_id=None,
                   department_id=None, reporting_manager_id=None, org_id=None,
                   employment_status='Active', is_active=True, salary_grade=None, created_by=None):
    """Create a new employee"""
    # Validate required fields
    if not full_name:
        raise ValueError("full_name is required")
    if not email:
        raise ValueError("email is required")
    if not joining_date:
        raise ValueError("joining_date is required")
    
    # Check for duplicate email
    existing = Employee.query.filter(
        Employee.email == email,
        Employee.deleted_at.is_(None)
    ).first()
    if existing:
        raise ValueError(f"Employee with email '{email}' already exists")
    
    # Auto-generate employee_id if not provided or empty
    if not employee_id or (isinstance(employee_id, str) and employee_id.strip() == ''):
        employee_id = _generate_employee_id(org_id=org_id)
    else:
        # Check for duplicate employee_id
        existing = Employee.query.filter(
            Employee.employee_id == employee_id,
            Employee.deleted_at.is_(None)
        ).first()
        if existing:
            raise ValueError(f"Employee with employee_id '{employee_id}' already exists")
    
    # Validate reporting_manager_id (cannot be self)
    if reporting_manager_id:
        # This will be validated by the database constraint, but we can check here too
        pass
    
    # Convert joining_date string to date if needed
    if isinstance(joining_date, str):
        joining_date = datetime.strptime(joining_date, '%Y-%m-%d').date()
    
    # Convert date_of_birth string to date if needed
    if date_of_birth and isinstance(date_of_birth, str):
        date_of_birth = datetime.strptime(date_of_birth, '%Y-%m-%d').date()
    
    employee = Employee(
        employee_id=employee_id,
        full_name=full_name,
        email=email,
        phone=phone,
        address=address,
        date_of_birth=date_of_birth,
        gender=gender,
        joining_date=joining_date,
        position_id=position_id,
        department_id=department_id,
        reporting_manager_id=reporting_manager_id,
        org_id=org_id,
        employment_status=employment_status,
        is_active=is_active,
        salary_grade=salary_grade,
        created_by=created_by
    )
    db.session.add(employee)
    db.session.commit()
    return employee


def get_all_employees(org_id=None, include_inactive=False):
    """Get all employees, optionally filtered by org_id"""
    from sqlalchemy.orm import joinedload
    
    query = Employee.query.options(
        joinedload(Employee.position),
        joinedload(Employee.department),
        joinedload(Employee.reporting_manager)
    ).filter(Employee.deleted_at.is_(None))
    
    if org_id:
        query = query.filter(Employee.org_id == org_id)
    
    if not include_inactive:
        query = query.filter(Employee.is_active == True)
    
    return query.order_by(Employee.full_name).all()


def get_employee_by_id(employee_id):
    """Get employee by ID (primary key)"""
    return Employee.query.filter(
        Employee.id == employee_id,
        Employee.deleted_at.is_(None)
    ).first()


def get_employee_by_employee_id(employee_id_str, org_id=None):
    """Get employee by employee_id string (e.g., 'EMP001')"""
    query = Employee.query.filter(
        Employee.employee_id == employee_id_str,
        Employee.deleted_at.is_(None)
    )
    
    if org_id:
        query = query.filter(Employee.org_id == org_id)
    
    return query.first()


def update_employee(employee_id, employee_id_str=None, full_name=None, email=None, phone=None,
                   address=None, date_of_birth=None, gender=None, joining_date=None,
                   position_id=None, department_id=None, reporting_manager_id=None, org_id=None,
                   employment_status=None, is_active=None, salary_grade=None):
    """Update an existing employee"""
    employee = Employee.query.filter(
        Employee.id == employee_id,
        Employee.deleted_at.is_(None)
    ).first()
    
    if not employee:
        return None
    
    # Check for duplicate email if email is being updated
    if email and email != employee.email:
        existing = Employee.query.filter(
            Employee.email == email,
            Employee.id != employee_id,
            Employee.deleted_at.is_(None)
        ).first()
        if existing:
            raise ValueError(f"Employee with email '{email}' already exists")
        employee.email = email
    
    # Check for duplicate employee_id if employee_id is being updated
    if employee_id_str and employee_id_str != employee.employee_id:
        existing = Employee.query.filter(
            Employee.employee_id == employee_id_str,
            Employee.id != employee_id,
            Employee.deleted_at.is_(None)
        ).first()
        if existing:
            raise ValueError(f"Employee with employee_id '{employee_id_str}' already exists")
        employee.employee_id = employee_id_str
    
    # Update fields
    if full_name is not None:
        employee.full_name = full_name
    if phone is not None:
        employee.phone = phone
    if address is not None:
        employee.address = address
    if date_of_birth is not None:
        if isinstance(date_of_birth, str):
            date_of_birth = datetime.strptime(date_of_birth, '%Y-%m-%d').date()
        employee.date_of_birth = date_of_birth
    if gender is not None:
        employee.gender = gender
    if joining_date is not None:
        if isinstance(joining_date, str):
            joining_date = datetime.strptime(joining_date, '%Y-%m-%d').date()
        employee.joining_date = joining_date
    if position_id is not None:
        employee.position_id = position_id
    if department_id is not None:
        employee.department_id = department_id
    if reporting_manager_id is not None:
        employee.reporting_manager_id = reporting_manager_id
    if org_id is not None:
        employee.org_id = org_id
    if employment_status is not None:
        employee.employment_status = employment_status
    if is_active is not None:
        employee.is_active = is_active
    if salary_grade is not None:
        employee.salary_grade = salary_grade
    
    employee.updated_at = datetime.utcnow()
    db.session.commit()
    return employee


def delete_employee(employee_id):
    """Soft delete an employee"""
    employee = Employee.query.filter(
        Employee.id == employee_id,
        Employee.deleted_at.is_(None)
    ).first()
    
    if employee:
        employee.deleted_at = datetime.utcnow()
        employee.is_active = False
        db.session.commit()
        return True
    return False

