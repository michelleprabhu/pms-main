"""
Role Service - Dynamic role loading and caching
Loads roles from database at startup and provides lookups by name or ID
"""
from models.role import Role
from extensions import db
from typing import Optional, Dict

# Global cache - loaded at startup
_ROLE_CACHE: Dict[str, int] = {}  # role_name -> role_id
_ROLE_ID_CACHE: Dict[int, str] = {}  # role_id -> role_name
_ROLE_LOADED = False

def load_roles():
    """Load all active roles from database into cache"""
    global _ROLE_CACHE, _ROLE_ID_CACHE, _ROLE_LOADED
    
    if _ROLE_LOADED:
        return  # Already loaded
    
    roles = Role.query.filter(
        Role.deleted_at.is_(None),
        Role.is_active == True
    ).all()
    
    _ROLE_CACHE = {}
    _ROLE_ID_CACHE = {}
    
    for role in roles:
        _ROLE_CACHE[role.role_name] = role.id
        _ROLE_ID_CACHE[role.id] = role.role_name
    
    _ROLE_LOADED = True
    print(f"✓ Loaded {len(_ROLE_CACHE)} roles into cache")
    return _ROLE_CACHE

def get_role_id_by_name(role_name: str) -> Optional[int]:
    """Get role_id by role_name (from cache)"""
    if not _ROLE_LOADED:
        load_roles()
    return _ROLE_CACHE.get(role_name)

def get_role_name_by_id(role_id: int) -> Optional[str]:
    """Get role_name by role_id (from cache)"""
    if not _ROLE_LOADED:
        load_roles()
    return _ROLE_ID_CACHE.get(role_id)

def get_all_roles() -> Dict[str, int]:
    """Get all roles as dict (role_name -> role_id)"""
    if not _ROLE_LOADED:
        load_roles()
    return _ROLE_CACHE.copy()

def reload_roles():
    """Force reload roles from database (useful after role changes)"""
    global _ROLE_LOADED
    _ROLE_LOADED = False
    return load_roles()

def get_hr_admin_role_id() -> Optional[int]:
    """Convenience method: Get HR Admin role_id"""
    return get_role_id_by_name('HR Admin')

def get_manager_role_id() -> Optional[int]:
    """Convenience method: Get Manager role_id"""
    return get_role_id_by_name('Manager')

def get_employee_role_id() -> Optional[int]:
    """Convenience method: Get Employee role_id"""
    return get_role_id_by_name('Employee')

def get_user_admin_role_id() -> Optional[int]:
    """Convenience method: Get User Admin role_id"""
    return get_role_id_by_name('User Admin')



