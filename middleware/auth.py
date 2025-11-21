from functools import wraps
from flask import request, jsonify
import jwt
import os
from dotenv import load_dotenv
from cryptography.hazmat.primitives import serialization

load_dotenv()

# JWT configuration - EdDSA only
JWT_PUBLIC_KEY = os.getenv('JWT_PUBLIC_KEY')

if not JWT_PUBLIC_KEY:
    raise ValueError("JWT_PUBLIC_KEY must be set in .env file for EdDSA authentication")

def authenticate_token(f):
    """Decorator to authenticate JWT token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Missing authentication token'}), 401
        
        try:
            # Decode token with EdDSA only
            # Replace escaped newlines with actual newlines
            public_key_str = JWT_PUBLIC_KEY.replace('\\n', '\n')
            public_key = serialization.load_pem_public_key(
                public_key_str.encode('utf-8')
            )
            data = jwt.decode(token, public_key, algorithms=['EdDSA'])
            
            # Normalize user_id (token may have 'id' or 'user_id')
            if 'user_id' not in data and 'id' in data:
                data['user_id'] = data['id']
            
            request.user = data  # Store user info in request
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated_function

def authorize_role(allowed_roles):
    """Decorator factory to check user role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'user'):
                return jsonify({'error': 'Authentication required'}), 401
            
            # Check role by role_name or role_id
            user_role = request.user.get('role')
            user_role_id = request.user.get('role_id')
            
            # Allow if role_name matches OR role_id matches
            role_allowed = False
            if user_role in allowed_roles:
                role_allowed = True
            elif user_role_id in allowed_roles:
                role_allowed = True
            
            if not role_allowed:
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def role_required(*allowed_role_names):
    """Decorator to check user role by role name (dynamic loading)
    Usage: @role_required('HR Admin')  # Only HR Admin
           @role_required('User Admin', 'HR Admin')  # User Admin OR HR Admin
    
    Can also accept role_ids (integers) for backward compatibility:
    Usage: @role_required(2)  # HR Admin (by ID)
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'user'):
                return jsonify({'error': 'Authentication required'}), 401
            
            user_role_id = request.user.get('role_id')
            user_role_name = request.user.get('role')
            
            # Convert role names to role_ids if needed
            from services.role_service import get_role_id_by_name, get_all_roles
            allowed_role_ids = set()
            
            for allowed in allowed_role_names:
                if isinstance(allowed, int):
                    # Already a role_id
                    allowed_role_ids.add(allowed)
                elif isinstance(allowed, str):
                    # Role name - convert to role_id
                    role_id = get_role_id_by_name(allowed)
                    if role_id:
                        allowed_role_ids.add(role_id)
                    else:
                        # Role not found in cache, try to reload
                        from services.role_service import reload_roles
                        reload_roles()
                        role_id = get_role_id_by_name(allowed)
                        if role_id:
                            allowed_role_ids.add(role_id)
            
            if user_role_id not in allowed_role_ids:
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def permission_required(*permission_codes):
    """Decorator to check user permissions (via their role)
    Usage: @permission_required('edit_employee_profile')  # Single permission
           @permission_required('edit_employee_profile', 'delete_employee')  # User needs at least one
    
    This decorator checks if the user (via their role) has at least one of the specified permissions.
    Must be used after @authenticate_token to ensure request.user is set.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'user'):
                return jsonify({'error': 'Authentication required'}), 401
            
            user_id = request.user.get('user_id') or request.user.get('id')
            if not user_id:
                return jsonify({'error': 'User ID not found in token'}), 401
            
            # Check if user has at least one of the required permissions
            from services.permission_service import user_has_any_permission
            if not user_has_any_permission(user_id, list(permission_codes)):
                return jsonify({
                    'error': 'Insufficient permissions',
                    'required_permissions': list(permission_codes)
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

