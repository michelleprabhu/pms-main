"""
Seed script to populate permissions and default role-permission mappings.
Run this after the migration: python scripts/seed_permissions.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from extensions import db
from models.permission import Permission
from models.role import Role, role_permissions
from constants.roles import RoleID

# Define all permissions with their categories
PERMISSIONS = [
    # Page-level permissions
    {'code': 'view_planning_page', 'name': 'View Planning Page', 'category': 'pages', 'description': 'Access to planning and score card generation'},
    {'code': 'view_scorecards_page', 'name': 'View Score Cards Page', 'category': 'pages', 'description': 'Access to score cards list and management'},
    {'code': 'view_evaluation_page', 'name': 'View Evaluation Page', 'category': 'pages', 'description': 'Access to evaluation periods and evaluations'},
    {'code': 'view_hr_management_page', 'name': 'View HR Management Page', 'category': 'pages', 'description': 'Access to HR master data management hub'},
    {'code': 'view_hr_employees_page', 'name': 'View HR Employees Page', 'category': 'pages', 'description': 'Access to employee management'},
    {'code': 'view_hr_departments_page', 'name': 'View HR Departments Page', 'category': 'pages', 'description': 'Access to department management'},
    {'code': 'view_hr_positions_page', 'name': 'View HR Positions Page', 'category': 'pages', 'description': 'Access to position management'},
    {'code': 'view_hr_reports_page', 'name': 'View HR Reports Page', 'category': 'pages', 'description': 'Access to HR reports and analytics'},
    {'code': 'view_manager_dashboard', 'name': 'View Manager Dashboard', 'category': 'pages', 'description': 'Access to manager dashboard'},
    {'code': 'view_employee_dashboard', 'name': 'View Employee Dashboard', 'category': 'pages', 'description': 'Access to employee dashboard'},
    {'code': 'view_employee_scorecards', 'name': 'View Employee Score Cards', 'category': 'pages', 'description': 'Access to own score cards'},
    {'code': 'view_self_evaluation', 'name': 'View Self Evaluation', 'category': 'pages', 'description': 'Access to self evaluation'},
    {'code': 'view_employee_ratings', 'name': 'View Employee Ratings', 'category': 'pages', 'description': 'Access to employee ratings'},
    
    # Action-level permissions - Review Periods
    {'code': 'create_review_period', 'name': 'Create Review Period', 'category': 'actions', 'description': 'Create new review periods'},
    {'code': 'edit_review_period', 'name': 'Edit Review Period', 'category': 'actions', 'description': 'Edit existing review periods'},
    {'code': 'delete_review_period', 'name': 'Delete Review Period', 'category': 'actions', 'description': 'Delete review periods'},
    {'code': 'open_review_period', 'name': 'Open Review Period', 'category': 'actions', 'description': 'Open a review period'},
    {'code': 'close_review_period', 'name': 'Close Review Period', 'category': 'actions', 'description': 'Close a review period'},
    
    # Action-level permissions - Score Cards
    {'code': 'generate_score_cards', 'name': 'Generate Score Cards', 'category': 'actions', 'description': 'Bulk generate score cards from eligibility profiles'},
    {'code': 'update_score_card_weightage', 'name': 'Update Score Card Weightage', 'category': 'actions', 'description': 'Update weightage distribution for score cards'},
    {'code': 'send_score_card_acceptance', 'name': 'Send Score Card for Acceptance', 'category': 'actions', 'description': 'Send score card to employee for acceptance'},
    {'code': 'view_all_score_cards', 'name': 'View All Score Cards', 'category': 'actions', 'description': 'View score cards for all employees'},
    {'code': 'view_team_score_cards', 'name': 'View Team Score Cards', 'category': 'actions', 'description': 'View score cards for team members'},
    
    # Action-level permissions - Goals
    {'code': 'create_goal', 'name': 'Create Goal', 'category': 'actions', 'description': 'Create new goals'},
    {'code': 'edit_goal', 'name': 'Edit Goal', 'category': 'actions', 'description': 'Edit existing goals'},
    {'code': 'delete_goal', 'name': 'Delete Goal', 'category': 'actions', 'description': 'Delete goals'},
    
    # Action-level permissions - Competencies
    {'code': 'create_competency', 'name': 'Create Competency', 'category': 'actions', 'description': 'Create new competencies'},
    {'code': 'edit_competency', 'name': 'Edit Competency', 'category': 'actions', 'description': 'Edit existing competencies'},
    {'code': 'delete_competency', 'name': 'Delete Competency', 'category': 'actions', 'description': 'Delete competencies'},
    
    # Action-level permissions - Employee Management
    {'code': 'view_all_employees', 'name': 'View All Employees', 'category': 'actions', 'description': 'View all employees in the system'},
    {'code': 'view_team_employees', 'name': 'View Team Employees', 'category': 'actions', 'description': 'View employees in own team'},
    {'code': 'edit_employee_profile', 'name': 'Edit Employee Profile', 'category': 'actions', 'description': 'Edit employee profiles'},
    {'code': 'delete_employee', 'name': 'Delete Employee', 'category': 'actions', 'description': 'Delete employees'},
    {'code': 'create_employee', 'name': 'Create Employee', 'category': 'actions', 'description': 'Create new employees'},
    
    # Action-level permissions - Department Management
    {'code': 'manage_departments', 'name': 'Manage Departments', 'category': 'actions', 'description': 'Create, edit, and delete departments'},
    
    # Action-level permissions - Position Management
    {'code': 'manage_positions', 'name': 'Manage Positions', 'category': 'actions', 'description': 'Create, edit, and delete positions'},
    
    # Action-level permissions - Evaluations
    {'code': 'create_evaluation', 'name': 'Create Evaluation', 'category': 'actions', 'description': 'Create evaluations'},
    {'code': 'edit_evaluation', 'name': 'Edit Evaluation', 'category': 'actions', 'description': 'Edit evaluations'},
    {'code': 'view_evaluations', 'name': 'View Evaluations', 'category': 'actions', 'description': 'View evaluations'},
    
    # Action-level permissions - Permission Management
    {'code': 'manage_permissions', 'name': 'Manage Permissions', 'category': 'actions', 'description': 'Assign and manage permissions for roles'},
]

# Default role-permission mappings
ROLE_PERMISSIONS = {
    RoleID.HR_ADMIN: [  # HR Admin gets all permissions
        'view_planning_page', 'view_scorecards_page', 'view_evaluation_page',
        'view_hr_management_page', 'view_hr_employees_page', 'view_hr_departments_page',
        'view_hr_positions_page', 'view_hr_reports_page',
        'create_review_period', 'edit_review_period', 'delete_review_period',
        'open_review_period', 'close_review_period',
        'generate_score_cards', 'update_score_card_weightage', 'send_score_card_acceptance',
        'view_all_score_cards', 'view_all_employees',
        'create_goal', 'edit_goal', 'delete_goal',
        'create_competency', 'edit_competency', 'delete_competency',
        'create_employee', 'edit_employee_profile', 'delete_employee',
        'manage_departments', 'manage_positions',
        'create_evaluation', 'edit_evaluation', 'view_evaluations',
        'manage_permissions',
    ],
    RoleID.MANAGER: [
        'view_manager_dashboard', 'view_scorecards_page', 'view_evaluation_page',
        'view_team_score_cards', 'view_team_employees',
        'create_goal', 'edit_goal', 'delete_goal',
        'send_score_card_acceptance',
        'create_evaluation', 'edit_evaluation', 'view_evaluations',
    ],
    RoleID.EMPLOYEE: [
        'view_employee_dashboard', 'view_employee_scorecards', 'view_self_evaluation', 'view_employee_ratings',
    ],
    RoleID.USER_ADMIN: [  # User Admin gets all permissions (system admin)
        'view_planning_page', 'view_scorecards_page', 'view_evaluation_page',
        'view_hr_management_page', 'view_hr_employees_page', 'view_hr_departments_page',
        'view_hr_positions_page', 'view_hr_reports_page',
        'create_review_period', 'edit_review_period', 'delete_review_period',
        'open_review_period', 'close_review_period',
        'generate_score_cards', 'update_score_card_weightage', 'send_score_card_acceptance',
        'view_all_score_cards', 'view_all_employees',
        'create_goal', 'edit_goal', 'delete_goal',
        'create_competency', 'edit_competency', 'delete_competency',
        'create_employee', 'edit_employee_profile', 'delete_employee',
        'manage_departments', 'manage_positions',
        'create_evaluation', 'edit_evaluation', 'view_evaluations',
        'manage_permissions',
    ],
}


def seed_permissions():
    """Seed permissions table"""
    app = create_app()
    with app.app_context():
        print("Seeding permissions...")
        
        # Create permissions
        for perm_data in PERMISSIONS:
            existing = Permission.query.filter_by(code=perm_data['code'], deleted_at=None).first()
            if not existing:
                permission = Permission(**perm_data)
                db.session.add(permission)
                print(f"  Created permission: {perm_data['code']}")
            else:
                print(f"  Permission already exists: {perm_data['code']}")
        
        db.session.commit()
        print(f"✓ Seeded {len(PERMISSIONS)} permissions\n")


def seed_role_permissions():
    """Seed role-permission mappings"""
    app = create_app()
    with app.app_context():
        print("Seeding role-permission mappings...")
        
        for role_id, permission_codes in ROLE_PERMISSIONS.items():
            role = Role.query.filter_by(id=role_id, deleted_at=None).first()
            if not role:
                print(f"  Warning: Role ID {role_id} not found, skipping...")
                continue
            
            print(f"  Mapping permissions for role: {role.role_name} (ID: {role_id})")
            
            # Get permission objects
            permissions = Permission.query.filter(
                Permission.code.in_(permission_codes),
                Permission.deleted_at.is_(None)
            ).all()
            
            # Get existing permissions for this role
            existing_permission_ids = {p.id for p in role.permissions.filter(Permission.deleted_at.is_(None)).all()}
            
            # Add new permissions
            added_count = 0
            for permission in permissions:
                if permission.id not in existing_permission_ids:
                    role.permissions.append(permission)
                    added_count += 1
                    print(f"    + {permission.code}")
            
            if added_count == 0:
                print(f"    (all permissions already assigned)")
            else:
                print(f"    Added {added_count} permissions")
        
        db.session.commit()
        print("✓ Seeded role-permission mappings\n")


if __name__ == '__main__':
    seed_permissions()
    seed_role_permissions()
    print("✓ Permission seeding complete!")

