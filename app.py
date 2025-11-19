from flask import Flask, jsonify, request
from flask_cors import CORS
from extensions import db, migrate
from constants.roles import RoleID
import os
from dotenv import load_dotenv
load_dotenv()


def create_app():
    """Flask application factory"""
    app = Flask(__name__)
    
    # Enable CORS for all routes
    CORS(app)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://localhost/performance_management')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('JWT_SECRET', 'your-secret-key-change-this-in-production')
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Load roles into cache at startup (dynamic role loading)
    # Import all models first to avoid circular import issues
    with app.app_context():
        # Import ALL models to ensure relationships are set up
        # This is necessary because SQLAlchemy needs all related models loaded
        from models.role import Role
        from models.user import User
        from models.employee import Employee
        from models.department import Department
        from models.position import Position
        from models.review_period import ReviewPeriod
        from models.goal import Goal
        from models.competency import Competency
        from models.performance_document import PerformanceDocument
        from models.evaluation import Evaluation
        from models.notification import Notification
        from models.master import Master
        
        # Now load roles
        from services.role_service import load_roles
        try:
            load_roles()
        except Exception as e:
            print(f"Warning: Could not load roles at startup: {e}")
            print("Roles will be loaded on first use")
    
    # Register routes
    register_routes(app)
    
    # Register CLI commands
    register_commands(app)
    
    return app


def register_routes(app):
    """Register all application routes"""
    # Import models after db initialization
    from models.role import Role
    from models.department import Department
    from models.position import Position
    from models.employee import Employee
    from models.user import User
    from models.review_period import ReviewPeriod
    from models.goal import Goal
    from models.competency import Competency
    from models.performance_document import PerformanceDocument
    from models.evaluation import Evaluation
    from models.notification import Notification
    from models.master import Master
    from services.auth_service import create_user, authenticate_user, generate_token, get_user_by_id
    from services.goal_service import create_goal, get_user_goals
    from services.competency_service import create_competency, get_user_competencies
    from services.performance_document_service import create_performance_document, get_user_documents
    from services.evaluation_service import create_evaluation, get_user_evaluations
    from services.notification_service import create_notification, get_unread_notifications, mark_notification_as_read
    from services.review_period_service import (
        create_review_period, get_all_review_periods, get_review_period_by_id,
        update_review_period, delete_review_period, open_review_period, close_review_period
    )
    from middleware.auth import authenticate_token, authorize_role, role_required

    # Auth Routes
    @app.route('/api/register', methods=['POST'])
    def register():
        data = request.get_json()
        try:
            # Support both role_name and role_id for backward compatibility
            role_name = data.get('role') or data.get('role_name')
            role_id = data.get('role_id')
            user = create_user(
                data['username'], 
                data['email'], 
                data['password'], 
                role_id=role_id,
                role_name=role_name
            )
            return jsonify(user.to_dict()), 201
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/api/login', methods=['POST'])
    def login():
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Request body is required'}), 400
            
            email = data.get('email')
            password = data.get('password')
            
            if not email or not password:
                return jsonify({'error': 'Email and password are required'}), 400
            
            # Debug logging
            print(f"Login attempt for email: {email}")
            
            user = authenticate_user(email, password)
            if not user:
                print(f"Authentication failed for email: {email}")
                return jsonify({'error': 'Invalid email or password'}), 401
            
            # Ensure role relationship is loaded before generating token
            from sqlalchemy.orm import joinedload
            user = User.query.options(joinedload(User.role)).filter(User.id == user.id).first()
            
            print(f"Authentication successful for user: {user.email} (role: {user.role.role_name if user.role else 'None'})")
            token = generate_token(user)
            return jsonify({'token': token, 'user': user.to_dict()})
        except Exception as e:
            print(f"Login error: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Login failed: {str(e)}'}), 500

    @app.route('/api/current-user', methods=['GET'])
    @authenticate_token
    def get_current_user():
        """Get current logged-in user details"""
        user_id = request.user.get('user_id') or request.user.get('id')
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify(user.to_dict())

    # Goal Routes
    @app.route('/api/goals', methods=['POST'])
    @authenticate_token
    def create_goal_route():
        data = request.get_json()
        goal = create_goal(data['user_id'], data['title'], data['description'], data['start_date'], data['end_date'])
        return jsonify(goal.to_dict()), 201

    @app.route('/api/users/<user_id>/goals', methods=['GET'])
    @authenticate_token
    def get_user_goals_route(user_id):
        goals = get_user_goals(user_id)
        return jsonify([goal.to_dict() for goal in goals])

    # Competency Routes
    @app.route('/api/competencies', methods=['POST'])
    @authenticate_token
    @authorize_role(['HR', 'Manager'])
    def create_competency_route():
        data = request.get_json()
        competency = create_competency(data['title'], data['description'], data['level'])
        return jsonify(competency.to_dict()), 201

    @app.route('/api/users/<user_id>/competencies', methods=['GET'])
    @authenticate_token
    def get_user_competencies_route(user_id):
        competencies = get_user_competencies(user_id)
        return jsonify([competency.to_dict() for competency in competencies])

    # Performance Document Routes
    @app.route('/api/performance-documents', methods=['POST'])
    @authenticate_token
    @authorize_role(['Manager', 'HR'])
    def create_performance_document_route():
        data = request.get_json()
        document = create_performance_document(
            data['user_id'], 
            data['title'], 
            data['period_start'], 
            data['period_end'], 
            data['status']
        )
        return jsonify(document.to_dict()), 201

    @app.route('/api/users/<user_id>/performance-documents', methods=['GET'])
    @authenticate_token
    def get_user_documents_route(user_id):
        documents = get_user_documents(user_id)
        return jsonify([doc.to_dict() for doc in documents])

    # Evaluation Routes
    @app.route('/api/evaluations', methods=['POST'])
    @authenticate_token
    def create_evaluation_route():
        data = request.get_json()
        evaluation = create_evaluation(
            data['document_id'], 
            data['evaluator_id'], 
            data['type'], 
            data['comments'], 
            data['rating']
        )
        return jsonify(evaluation.to_dict()), 201

    @app.route('/api/users/<user_id>/evaluations', methods=['GET'])
    @authenticate_token
    def get_user_evaluations_route(user_id):
        evaluations = get_user_evaluations(user_id)
        return jsonify([eval.to_dict() for eval in evaluations])

    # Notification Routes
    @app.route('/api/notifications', methods=['POST'])
    @authenticate_token
    @authorize_role(['HR', 'Manager'])
    def create_notification_route():
        data = request.get_json()
        notification = create_notification(
            data['recipient_id'], 
            data['message'], 
            data['entity_type'], 
            data['entity_id']
        )
        return jsonify(notification.to_dict()), 201

    @app.route('/api/notifications/unread', methods=['GET'])
    @authenticate_token
    def get_unread_notifications_route():
        notifications = get_unread_notifications(request.user['id'])
        return jsonify([n.to_dict() for n in notifications])

    @app.route('/api/notifications/<notification_id>/read', methods=['PATCH'])
    @authenticate_token
    def mark_notification_as_read_route(notification_id):
        notification = mark_notification_as_read(notification_id)
        return jsonify(notification.to_dict())

    # Review Period Routes
    @app.route('/api/review-periods', methods=['GET'])
    @authenticate_token
    def get_all_review_periods_route():
        """Get all review periods"""
        periods = get_all_review_periods()
        return jsonify([period.to_dict() for period in periods])

    @app.route('/api/review-periods', methods=['POST'])
    @authenticate_token
    @role_required('HR Admin')  # Only HR Admin can create review periods (dynamic lookup)
    def create_review_period_route():
        """Create a new review period (HR Admin only)"""
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['period_name', 'period_type', 'start_date', 'end_date']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        try:
            from datetime import datetime
            period = create_review_period(
                period_name=data['period_name'],
                period_type=data['period_type'],
                start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
                end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date(),
                financial_period=data.get('financial_period'),
                description=data.get('description'),
                status=data.get('status', 'Draft'),
                is_active=data.get('is_active', False),
                created_by=request.user.get('user_id') or request.user.get('id')
            )
            return jsonify(period.to_dict()), 201
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            return jsonify({'error': f'Failed to create review period: {str(e)}'}), 400

    @app.route('/api/review-periods/<period_id>', methods=['GET'])
    @authenticate_token
    def get_review_period_route(period_id):
        """Get review period by ID"""
        period = get_review_period_by_id(period_id)
        if not period:
            return jsonify({'error': 'Review period not found'}), 404
        return jsonify(period.to_dict())

    @app.route('/api/review-periods/<period_id>', methods=['PUT'])
    @authenticate_token
    @authorize_role(['HR', 'Admin'])
    def update_review_period_route(period_id):
        """Update review period (HR only)"""
        data = request.get_json()
        try:
            from datetime import datetime
            update_data = {}
            if 'period_name' in data:
                update_data['period_name'] = data['period_name']
            if 'period_type' in data:
                update_data['period_type'] = data['period_type']
            if 'start_date' in data:
                update_data['start_date'] = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            if 'end_date' in data:
                update_data['end_date'] = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
            if 'financial_period' in data:
                update_data['financial_period'] = data['financial_period']
            if 'description' in data:
                update_data['description'] = data['description']
            
            period = update_review_period(period_id, **update_data)
            if not period:
                return jsonify({'error': 'Review period not found'}), 404
            return jsonify(period.to_dict())
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/api/review-periods/<period_id>', methods=['DELETE'])
    @authenticate_token
    @authorize_role(['HR', 'Admin'])
    def delete_review_period_route(period_id):
        """Delete review period (HR only)"""
        if delete_review_period(period_id):
            return jsonify({'message': 'Review period deleted successfully'}), 200
        return jsonify({'error': 'Review period not found'}), 404

    @app.route('/api/review-periods/<period_id>/open', methods=['POST'])
    @authenticate_token
    @authorize_role(['HR', 'Admin'])
    def open_review_period_route(period_id):
        """Open a review period (HR only)"""
        period = open_review_period(period_id)
        if not period:
            return jsonify({'error': 'Review period not found'}), 404
        return jsonify(period.to_dict())

    @app.route('/api/review-periods/<period_id>/close', methods=['POST'])
    @authenticate_token
    @authorize_role(['HR', 'Admin'])
    def close_review_period_route(period_id):
        """Close a review period (HR only)"""
        period = close_review_period(period_id)
        if not period:
            return jsonify({'error': 'Review period not found'}), 404
        return jsonify(period.to_dict())


def register_commands(app):
    """Register Flask CLI commands"""
    @app.cli.command('seed-db')
    def seed_db_command():
        """Seed the database with initial data"""
        from seed_db import seed_database
        seed_database()

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5002)