"""
Permission Service - Manages permissions and role-permission mappings
Provides caching for performance and functions to check user permissions
"""
from models.permission import Permission
from models.role import Role
from models.user import User
from extensions import db
from functools import lru_cache
from typing import List, Set, Optional

# Cache for role-permission mappings (role_id -> set of permission codes)
_role_permissions_cache = {}
_permissions_cache = {}


def load_permissions():
    """Load all active permissions into cache"""
    global _permissions_cache
    permissions = Permission.query.filter(
        Permission.is_active == True,
        Permission.deleted_at.is_(None)
    ).all()
    _permissions_cache = {p.code: p for p in permissions}
    print(f"✓ Loaded {len(_permissions_cache)} permissions into cache")
    return _permissions_cache


def load_role_permissions():
    """Load all role-permission mappings into cache"""
    global _role_permissions_cache
    _role_permissions_cache = {}
    
    roles = Role.query.filter(Role.deleted_at.is_(None)).all()
    for role in roles:
        permissions = role.permissions.filter(
            Permission.is_active == True,
            Permission.deleted_at.is_(None)
        ).all()
        _role_permissions_cache[role.id] = {p.code for p in permissions}
    
    print(f"✓ Loaded permissions for {len(_role_permissions_cache)} roles into cache")
    return _role_permissions_cache


def reload_permissions():
    """Reload permissions and role-permission mappings"""
    load_permissions()
    load_role_permissions()


def get_all_permissions(include_inactive=False):
    """Get all permissions, optionally including inactive ones"""
    query = Permission.query.filter(Permission.deleted_at.is_(None))
    if not include_inactive:
        query = query.filter(Permission.is_active == True)
    return query.all()


def get_permissions_by_role(role_id: int) -> List[Permission]:
    """Get all permissions for a specific role"""
    role = Role.query.filter_by(id=role_id, deleted_at=None).first()
    if not role:
        return []
    
    return role.permissions.filter(
        Permission.is_active == True,
        Permission.deleted_at.is_(None)
    ).all()


def get_permission_codes_by_role(role_id: int) -> Set[str]:
    """Get permission codes for a role (from cache if available)"""
    if role_id in _role_permissions_cache:
        return _role_permissions_cache[role_id]
    
    # Cache miss - load and cache
    permissions = get_permissions_by_role(role_id)
    permission_codes = {p.code for p in permissions}
    _role_permissions_cache[role_id] = permission_codes
    return permission_codes


def get_user_permissions(user_id: int) -> List[Permission]:
    """Get all permissions for a user (via their role)"""
    user = User.query.filter_by(id=user_id, deleted_at=None).first()
    if not user or not user.role_id:
        return []
    
    return get_permissions_by_role(user.role_id)


def get_user_permission_codes(user_id: int) -> Set[str]:
    """Get permission codes for a user (via their role)"""
    user = User.query.filter_by(id=user_id, deleted_at=None).first()
    if not user or not user.role_id:
        return set()
    
    return get_permission_codes_by_role(user.role_id)


def user_has_permission(user_id: int, permission_code: str) -> bool:
    """Check if a user has a specific permission"""
    user_permissions = get_user_permission_codes(user_id)
    return permission_code in user_permissions


def user_has_any_permission(user_id: int, permission_codes: List[str]) -> bool:
    """Check if a user has at least one of the specified permissions"""
    user_permissions = get_user_permission_codes(user_id)
    return bool(user_permissions & set(permission_codes))


def user_has_all_permissions(user_id: int, permission_codes: List[str]) -> bool:
    """Check if a user has all of the specified permissions"""
    user_permissions = get_user_permission_codes(user_id)
    return set(permission_codes).issubset(user_permissions)


def assign_permissions_to_role(role_id: int, permission_ids: List[int]) -> bool:
    """Assign permissions to a role. Returns True if successful."""
    role = Role.query.filter_by(id=role_id, deleted_at=None).first()
    if not role:
        return False
    
    permissions = Permission.query.filter(
        Permission.id.in_(permission_ids),
        Permission.deleted_at.is_(None)
    ).all()
    
    # Clear existing permissions and assign new ones
    role.permissions = permissions
    db.session.commit()
    
    # Invalidate cache for this role
    if role_id in _role_permissions_cache:
        del _role_permissions_cache[role_id]
    
    # Reload cache
    load_role_permissions()
    
    return True


def remove_permissions_from_role(role_id: int, permission_ids: List[int]) -> bool:
    """Remove specific permissions from a role. Returns True if successful."""
    role = Role.query.filter_by(id=role_id, deleted_at=None).first()
    if not role:
        return False
    
    permissions_to_remove = Permission.query.filter(
        Permission.id.in_(permission_ids),
        Permission.deleted_at.is_(None)
    ).all()
    
    for permission in permissions_to_remove:
        if permission in role.permissions.all():
            role.permissions.remove(permission)
    
    db.session.commit()
    
    # Invalidate cache for this role
    if role_id in _role_permissions_cache:
        del _role_permissions_cache[role_id]
    
    # Reload cache
    load_role_permissions()
    
    return True


def get_permission_by_code(permission_code: str) -> Optional[Permission]:
    """Get a permission by its code"""
    if permission_code in _permissions_cache:
        return _permissions_cache[permission_code]
    
    permission = Permission.query.filter_by(
        code=permission_code,
        deleted_at=None
    ).first()
    
    if permission and permission.is_active:
        _permissions_cache[permission_code] = permission
    
    return permission


# Initialize cache on module load
try:
    reload_permissions()
except Exception as e:
    print(f"Warning: Could not load permissions at startup: {e}")
    print("Permissions will be loaded on first use")

