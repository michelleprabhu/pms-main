from models.user import User
from models.role import Role
from extensions import db
from constants.roles import get_role_id_by_name
import bcrypt
from datetime import datetime


def create_user(username, email, password, role_id=None, role_name=None, employee_id=None, org_id=None, is_active=True, created_by=None):
    """Create a new user. Provide either role_id or role_name"""
    # Check if user already exists (where deleted_at IS NULL)
    if User.query.filter(User.email == email, User.deleted_at.is_(None)).first():
        raise ValueError("User with this email already exists")
    if User.query.filter(User.username == username, User.deleted_at.is_(None)).first():
        raise ValueError("User with this username already exists")
    
    # Get role_id if role_name provided
    if role_name and not role_id:
        role_id_from_constants = get_role_id_by_name(role_name)
        if role_id_from_constants:
            role_id = role_id_from_constants
        else:
            # Fallback to database lookup
            role = Role.query.filter(
                Role.role_name == role_name,
                Role.deleted_at.is_(None)
            ).first()
            if not role:
                raise ValueError(f"Role '{role_name}' not found")
            role_id = role.id
    elif not role_id:
        raise ValueError("Either role_id or role_name must be provided")
    
    # Hash password with bcrypt
    password_hash = bcrypt.hashpw(
        password.encode('utf-8'),
        bcrypt.gensalt(rounds=10)
    ).decode('utf-8')
    
    user = User(
        username=username,
        email=email,
        password=password_hash,
        role_id=role_id,
        employee_id=employee_id,
        org_id=org_id,
        is_active=is_active,
        created_by=created_by
    )
    db.session.add(user)
    db.session.commit()
    return user


def get_all_users(org_id=None, include_inactive=False):
    """Get all users, optionally filtered by org_id"""
    query = User.query.filter(User.deleted_at.is_(None))
    
    if org_id:
        query = query.filter(User.org_id == org_id)
    
    if not include_inactive:
        query = query.filter(User.is_active == True)
    
    return query.order_by(User.username).all()


def get_user_by_id(user_id):
    """Get user by ID"""
    return User.query.filter(
        User.id == user_id,
        User.deleted_at.is_(None)
    ).first()


def get_user_by_email(email):
    """Get user by email"""
    return User.query.filter(
        User.email == email,
        User.deleted_at.is_(None)
    ).first()


def get_user_by_username(username):
    """Get user by username"""
    return User.query.filter(
        User.username == username,
        User.deleted_at.is_(None)
    ).first()


def update_user(user_id, username=None, email=None, password=None, role_id=None, role_name=None, employee_id=None, org_id=None, is_active=None):
    """Update an existing user"""
    user = User.query.filter(
        User.id == user_id,
        User.deleted_at.is_(None)
    ).first()
    
    if not user:
        return None
    
    # Check for duplicate email if email is being updated
    if email and email != user.email:
        existing = User.query.filter(
            User.email == email,
            User.id != user_id,
            User.deleted_at.is_(None)
        ).first()
        if existing:
            raise ValueError(f"User with email '{email}' already exists")
        user.email = email
    
    # Check for duplicate username if username is being updated
    if username and username != user.username:
        existing = User.query.filter(
            User.username == username,
            User.id != user_id,
            User.deleted_at.is_(None)
        ).first()
        if existing:
            raise ValueError(f"User with username '{username}' already exists")
        user.username = username
    
    # Update password if provided
    if password:
        password_hash = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt(rounds=10)
        ).decode('utf-8')
        user.password = password_hash
    
    # Get role_id if role_name provided
    if role_name and not role_id:
        role_id_from_constants = get_role_id_by_name(role_name)
        if role_id_from_constants:
            role_id = role_id_from_constants
        else:
            role = Role.query.filter(
                Role.role_name == role_name,
                Role.deleted_at.is_(None)
            ).first()
            if not role:
                raise ValueError(f"Role '{role_name}' not found")
            role_id = role.id
    
    if role_id is not None:
        user.role_id = role_id
    if employee_id is not None:
        user.employee_id = employee_id
    if org_id is not None:
        user.org_id = org_id
    if is_active is not None:
        user.is_active = is_active
    
    user.updated_at = datetime.utcnow()
    db.session.commit()
    return user


def delete_user(user_id):
    """Soft delete a user"""
    user = User.query.filter(
        User.id == user_id,
        User.deleted_at.is_(None)
    ).first()
    
    if user:
        user.deleted_at = datetime.utcnow()
        user.is_active = False
        db.session.commit()
        return True
    return False

