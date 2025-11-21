"""
Role Constants - Centralized role definitions
Instead of hardcoding role_id values, use these constants.
If role IDs change in database, update these constants.
"""
from enum import IntEnum

class RoleID(IntEnum):
    """Role IDs as constants"""
    USER_ADMIN = 1      # IT Admin - System administrator
    HR_ADMIN = 2        # HR Admin - HR management
    MANAGER = 3         # Manager - Team management
    EMPLOYEE = 4        # Employee - Self-service
    EXTERNAL_USER = 5   # External User - Limited access

# Role name mappings (for lookup by name)
ROLE_NAMES = {
    'User Admin': RoleID.USER_ADMIN,
    'HR Admin': RoleID.HR_ADMIN,
    'Manager': RoleID.MANAGER,
    'Employee': RoleID.EMPLOYEE,
    'External User': RoleID.EXTERNAL_USER,
}

# Reverse mapping (role_id -> role_name)
ROLE_ID_TO_NAME = {
    RoleID.USER_ADMIN: 'User Admin',
    RoleID.HR_ADMIN: 'HR Admin',
    RoleID.MANAGER: 'Manager',
    RoleID.EMPLOYEE: 'Employee',
    RoleID.EXTERNAL_USER: 'External User',
}

def get_role_id_by_name(role_name: str) -> int:
    """Get role_id by role_name"""
    return ROLE_NAMES.get(role_name)

def get_role_name_by_id(role_id: int) -> str:
    """Get role_name by role_id"""
    return ROLE_ID_TO_NAME.get(role_id, 'Unknown')



