from models.user import User
from models.role import Role
from extensions import db
from constants.roles import RoleID, get_role_id_by_name
import bcrypt
from datetime import datetime, timedelta
import jwt
import os
from dotenv import load_dotenv
from cryptography.hazmat.primitives import serialization

load_dotenv()

# EdDSA keys required - no fallback
JWT_PRIVATE_KEY = os.getenv('JWT_PRIVATE_KEY')
JWT_PUBLIC_KEY = os.getenv('JWT_PUBLIC_KEY')

if not JWT_PRIVATE_KEY or not JWT_PUBLIC_KEY:
    raise ValueError("JWT_PRIVATE_KEY and JWT_PUBLIC_KEY must be set in .env file for EdDSA authentication")

def create_user(username, email, password, role_id=None, role_name=None):
    """Create a new user. Provide either role_id or role_name"""
    # Check if user already exists (where deleted_at IS NULL)
    if User.query.filter(User.email == email, User.deleted_at.is_(None)).first():
        raise ValueError("User with this email already exists")
    if User.query.filter(User.username == username, User.deleted_at.is_(None)).first():
        raise ValueError("User with this username already exists")
    
    # Get role_id if role_name provided
    if role_name and not role_id:
        # Try to get from constants first (faster)
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
    
    # Create new user with bcrypt password hashing
    password_hash = bcrypt.hashpw(
        password.encode('utf-8'),
        bcrypt.gensalt(rounds=10)
    ).decode('utf-8')
    user = User(
        username=username,
        email=email,
        password=password_hash,
        role_id=role_id,
        is_active=True
    )
    db.session.add(user)
    db.session.commit()
    return user

def authenticate_user(email, password):
    """Authenticate user and return user object if valid"""
    try:
        user = User.query.filter(
            User.email == email,
            User.deleted_at.is_(None),
            User.is_active == True
        ).first()
        
        if not user:
            print(f"User not found: {email}")
            return None
        
        # Check password with bcrypt
        try:
            # Ensure password is bytes for bcrypt
            password_bytes = password.encode('utf-8')
            stored_hash = user.password.encode('utf-8') if isinstance(user.password, str) else user.password
            
            if bcrypt.checkpw(password_bytes, stored_hash):
                # Update last_login
                user.last_login = datetime.utcnow()
                db.session.commit()
                print(f"Password check successful for: {email}")
                return user
            else:
                print(f"Password check failed for: {email}")
        except Exception as e:
            # Password check failed
            print(f"Password check error for {email}: {str(e)}")
            import traceback
            traceback.print_exc()
    except Exception as e:
        print(f"Authentication error for {email}: {str(e)}")
        import traceback
        traceback.print_exc()
    
    return None

def generate_token(user):
    """Generate JWT token for user using EdDSA (Ed25519)"""
    # Get role_name for token (role relationship should already be loaded)
    role_name = user.role.role_name if user.role else None
    
    # Token expiration: 8 hours as per knowledge transfer
    expiration = datetime.utcnow() + timedelta(hours=8)
    
    payload = {
        'user_id': user.id,  # Use user_id as per knowledge transfer
        'username': user.username,
        'role_id': user.role_id,
        'role': role_name,  # Include role_name for frontend compatibility
        'exp': expiration,
        'iat': datetime.utcnow()
    }
    
    # Use EdDSA (Ed25519) only
    # Replace escaped newlines with actual newlines
    private_key_str = JWT_PRIVATE_KEY.replace('\\n', '\n')
    private_key = serialization.load_pem_private_key(
        private_key_str.encode('utf-8'),
        password=None
    )
    token = jwt.encode(payload, private_key, algorithm='EdDSA')
    
    return token

def get_user_by_id(user_id):
    """Get user by ID (only active, non-deleted users)"""
    return User.query.filter(
        User.id == user_id,
        User.deleted_at.is_(None)
    ).first()

def get_user_by_email(email):
    """Get user by email (only active, non-deleted users)"""
    return User.query.filter(
        User.email == email,
        User.deleted_at.is_(None)
    ).first()

