#!/usr/bin/env python3
"""
Flask CLI command to seed the database
Run with: flask seed-db
"""
from flask import Flask
from app import create_app
from extensions import db
from models.role import Role
from models.department import Department
from models.position import Position
from models.employee import Employee
from models.user import User
from models.organization import Organization
from constants.roles import RoleID, ROLE_ID_TO_NAME
import bcrypt
from datetime import date, datetime

def seed_database():
    """Seed database in exact order: Organization -> Roles -> Departments -> Positions -> Employees -> Users"""
    
    app = create_app()
    with app.app_context():
        print("="*60)
        print("SEEDING DATABASE")
        print("="*60)
        
        # Step 0: Create RPC Organization
        print("\n[0/6] Seeding Organization...")
        rpc_org = Organization.query.filter(
            Organization.code == 'RPC',
            Organization.deleted_at.is_(None)
        ).first()
        
        if not rpc_org:
            rpc_org = Organization(
                name='RPC',
                code='RPC',
                description='RPC Organization',
                is_active=True
            )
            db.session.add(rpc_org)
            db.session.flush()
            print(f"  ✓ Created organization: RPC (ID: {rpc_org.id})")
        else:
            print(f"  ✓ Organization 'RPC' already exists (ID: {rpc_org.id})")
        
        org_id = rpc_org.id
        
        # Step 1: Seed 5 Roles
        print("\n[1/5] Seeding Roles...")
        # Use constants to ensure role names match
        roles_data = [
            {'role_name': ROLE_ID_TO_NAME[RoleID.USER_ADMIN], 'description': 'System administrator, creates user accounts. NOT an employee.', 'is_active': True},
            {'role_name': ROLE_ID_TO_NAME[RoleID.HR_ADMIN], 'description': 'HR management, creates review periods, evaluations. IS an employee.', 'is_active': True},
            {'role_name': ROLE_ID_TO_NAME[RoleID.MANAGER], 'description': 'Team management, evaluates direct reports. IS an employee.', 'is_active': True},
            {'role_name': ROLE_ID_TO_NAME[RoleID.EMPLOYEE], 'description': 'Self-service, self-evaluation. IS an employee.', 'is_active': True},
            {'role_name': ROLE_ID_TO_NAME[RoleID.EXTERNAL_USER], 'description': 'Limited read-only access. NOT an employee.', 'is_active': True}
        ]
        
        for role_data in roles_data:
            existing = Role.query.filter(
                Role.role_name == role_data['role_name'],
                Role.deleted_at.is_(None)
            ).first()
            if not existing:
                role = Role(**role_data)
                db.session.add(role)
                print(f"  ✓ Created role: {role_data['role_name']}")
            else:
                print(f"  ✓ Role '{role_data['role_name']}' already exists")
        
        db.session.flush()  # Get role IDs
        
        # Step 2: Seed 3 Departments
        print("\n[2/6] Seeding Departments...")
        departments_data = [
            {'name': 'HR', 'description': 'Human Resources Department', 'org_id': org_id},
            {'name': 'Management', 'description': 'Management Department', 'org_id': org_id},
            {'name': 'IT', 'description': 'Information Technology Department', 'org_id': org_id}
        ]
        
        dept_map = {}
        for dept_data in departments_data:
            existing = Department.query.filter(
                Department.name == dept_data['name'],
                Department.deleted_at.is_(None)
            ).first()
            if not existing:
                dept = Department(**dept_data)
                db.session.add(dept)
                db.session.flush()
                dept_map[dept_data['name']] = dept.id
                print(f"  ✓ Created department: {dept_data['name']} (ID: {dept.id})")
            else:
                # Update existing department with org_id if not set
                if not existing.org_id:
                    existing.org_id = org_id
                    db.session.flush()
                dept_map[dept_data['name']] = existing.id
                print(f"  ✓ Department '{dept_data['name']}' already exists")
        
        # Step 3: Seed 4 Positions
        print("\n[3/6] Seeding Positions...")
        positions_data = [
            {'title': 'HR Manager', 'department_id': dept_map.get('HR'), 'description': 'HR Department Manager', 'org_id': org_id},
            {'title': 'Team Manager', 'department_id': dept_map.get('Management'), 'description': 'Team Manager', 'org_id': org_id},
            {'title': 'Software Developer', 'department_id': dept_map.get('IT'), 'description': 'Software Developer', 'org_id': org_id},
            {'title': 'HR Specialist', 'department_id': dept_map.get('HR'), 'description': 'HR Specialist', 'org_id': org_id}
        ]
        
        pos_map = {}
        for pos_data in positions_data:
            existing = Position.query.filter(
                Position.title == pos_data['title'],
                Position.department_id == pos_data['department_id'],
                Position.deleted_at.is_(None)
            ).first()
            if not existing:
                pos = Position(**pos_data)
                db.session.add(pos)
                db.session.flush()
                pos_map[pos_data['title']] = pos.id
                print(f"  ✓ Created position: {pos_data['title']} (ID: {pos.id})")
            else:
                # Update existing position with org_id if not set
                if not existing.org_id:
                    existing.org_id = org_id
                    db.session.flush()
                pos_map[pos_data['title']] = existing.id
                print(f"  ✓ Position '{pos_data['title']}' already exists")
        
        # Step 4: Seed 3 Employees
        print("\n[4/6] Seeding Employees...")
        employees_data = [
            {
                'employee_id': 'EMP001',
                'full_name': 'HR Manager',
                'email': 'hr@pms.com',
                'joining_date': date(2021, 3, 15),
                'position_id': pos_map.get('HR Manager'),
                'department_id': dept_map.get('HR'),
                'reporting_manager_id': None,
                'org_id': org_id,
                'employment_status': 'Active',
                'is_active': True
            },
            {
                'employee_id': 'EMP002',
                'full_name': 'Team Manager',
                'email': 'manager@pms.com',
                'joining_date': date(2022, 6, 1),
                'position_id': pos_map.get('Team Manager'),
                'department_id': dept_map.get('Management'),
                'reporting_manager_id': None,  # Will set after creating
                'org_id': org_id,
                'employment_status': 'Active',
                'is_active': True
            },
            {
                'employee_id': 'EMP003',
                'full_name': 'Regular Employee',
                'email': 'employee@pms.com',
                'joining_date': date(2023, 1, 10),
                'position_id': pos_map.get('Software Developer'),
                'department_id': dept_map.get('IT'),
                'reporting_manager_id': None,  # Will set to EMP002 after creation
                'org_id': org_id,
                'employment_status': 'Active',
                'is_active': True
            }
        ]
        
        emp_map = {}
        for emp_data in employees_data:
            existing = Employee.query.filter(
                Employee.employee_id == emp_data['employee_id'],
                Employee.deleted_at.is_(None)
            ).first()
            if not existing:
                emp = Employee(**emp_data)
                db.session.add(emp)
                db.session.flush()
                emp_map[emp_data['employee_id']] = emp.id
                print(f"  ✓ Created employee: {emp_data['full_name']} ({emp_data['employee_id']})")
            else:
                # Update existing employee with org_id if not set
                if not existing.org_id:
                    existing.org_id = org_id
                    db.session.flush()
                emp_map[emp_data['employee_id']] = existing.id
                print(f"  ✓ Employee '{emp_data['employee_id']}' already exists")
        
        # Set reporting_manager_id for Employee (EMP003 reports to Manager EMP002)
        if 'EMP002' in emp_map and 'EMP003' in emp_map:
            emp003 = Employee.query.get(emp_map['EMP003'])
            if emp003:
                emp003.reporting_manager_id = emp_map['EMP002']
                print(f"  ✓ Set EMP003 reporting manager to EMP002")
        
        # Step 5: Seed 4 Users
        print("\n[5/6] Seeding Users...")
        # Use constants to get role names
        hr_admin_role = Role.query.filter(Role.role_name == ROLE_ID_TO_NAME[RoleID.HR_ADMIN], Role.deleted_at.is_(None)).first()
        user_admin_role = Role.query.filter(Role.role_name == ROLE_ID_TO_NAME[RoleID.USER_ADMIN], Role.deleted_at.is_(None)).first()
        manager_role = Role.query.filter(Role.role_name == ROLE_ID_TO_NAME[RoleID.MANAGER], Role.deleted_at.is_(None)).first()
        employee_role = Role.query.filter(Role.role_name == ROLE_ID_TO_NAME[RoleID.EMPLOYEE], Role.deleted_at.is_(None)).first()
        
        users_data = [
            {
                'username': 'admin',
                'email': 'admin@pms.com',
                'password': 'admin123',
                'role_id': user_admin_role.id if user_admin_role else None,
                'employee_id': None,  # User Admin - NOT an employee
                'org_id': org_id
            },
            {
                'username': 'hr',
                'email': 'hr@pms.com',
                'password': 'hr123',
                'role_id': hr_admin_role.id if hr_admin_role else None,
                'employee_id': emp_map.get('EMP001'),  # HR Admin - IS an employee
                'org_id': org_id
            },
            {
                'username': 'manager',
                'email': 'manager@pms.com',
                'password': 'manager123',
                'role_id': manager_role.id if manager_role else None,
                'employee_id': emp_map.get('EMP002'),  # Manager - IS an employee
                'org_id': org_id
            },
            {
                'username': 'employee',
                'email': 'employee@pms.com',
                'password': 'employee123',
                'role_id': employee_role.id if employee_role else None,
                'employee_id': emp_map.get('EMP003'),  # Employee - IS an employee
                'org_id': org_id
            }
        ]
        
        for user_data in users_data:
            existing = User.query.filter(
                User.email == user_data['email'],
                User.deleted_at.is_(None)
            ).first()
            if not existing:
                # Hash password with bcrypt (10 rounds)
                password_hash = bcrypt.hashpw(
                    user_data['password'].encode('utf-8'),
                    bcrypt.gensalt(rounds=10)
                ).decode('utf-8')
                user = User(
                    username=user_data['username'],
                    email=user_data['email'],
                    password=password_hash,
                    role_id=user_data['role_id'],
                    employee_id=user_data['employee_id'],
                    org_id=user_data['org_id'],
                    is_active=True
                )
                db.session.add(user)
                role_name = Role.query.get(user_data['role_id']).role_name if user_data['role_id'] else 'None'
                emp_info = f"Employee ID: {user_data['employee_id']}" if user_data['employee_id'] else "NOT an employee"
                print(f"  ✓ Created user: {user_data['email']} ({role_name}) - {emp_info}")
            else:
                # Update existing user with org_id if not set
                if not existing.org_id:
                    existing.org_id = org_id
                    db.session.flush()
                print(f"  ✓ User '{user_data['email']}' already exists")
        
        # Step 6: Update all existing records to have org_id
        print("\n[6/6] Updating existing records with org_id...")
        
        # Update all existing departments without org_id
        depts_updated = Department.query.filter(
            Department.org_id.is_(None),
            Department.deleted_at.is_(None)
        ).update({Department.org_id: org_id}, synchronize_session=False)
        if depts_updated > 0:
            print(f"  ✓ Updated {depts_updated} departments with org_id")
        
        # Update all existing positions without org_id
        positions_updated = Position.query.filter(
            Position.org_id.is_(None),
            Position.deleted_at.is_(None)
        ).update({Position.org_id: org_id}, synchronize_session=False)
        if positions_updated > 0:
            print(f"  ✓ Updated {positions_updated} positions with org_id")
        
        # Update all existing employees without org_id
        employees_updated = Employee.query.filter(
            Employee.org_id.is_(None),
            Employee.deleted_at.is_(None)
        ).update({Employee.org_id: org_id}, synchronize_session=False)
        if employees_updated > 0:
            print(f"  ✓ Updated {employees_updated} employees with org_id")
        
        # Update all existing users without org_id
        users_updated = User.query.filter(
            User.org_id.is_(None),
            User.deleted_at.is_(None)
        ).update({User.org_id: org_id}, synchronize_session=False)
        if users_updated > 0:
            print(f"  ✓ Updated {users_updated} users with org_id")
        
        # Commit all changes
        db.session.commit()
        
        print("\n" + "="*60)
        print("DATABASE SEEDING COMPLETE")
        print("="*60)
        print("\nTest Users:")
        print("  admin@pms.com / admin123 (User Admin, NOT employee)")
        print("  hr@pms.com / hr123 (HR Admin, IS employee - EMP001)")
        print("  manager@pms.com / manager123 (Manager, IS employee - EMP002)")
        print("  employee@pms.com / employee123 (Employee, IS employee - EMP003)")
        print("\n" + "="*60)

