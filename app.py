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
        from models.permission import Permission
        from models.user import User
        from models.employee import Employee
        from models.department import Department
        from models.position import Position
        from models.review_period import ReviewPeriod
        from models.goal import Goal
        from models.competency import Competency
        from models.score_card import ScoreCard
        from models.evaluation import Evaluation
        from models.notification import Notification
        from models.master import Master
        from models.eligibility_profile import EligibilityProfile
        
        # Now load roles and permissions
        from services.role_service import load_roles
        from services.permission_service import reload_permissions
        try:
            load_roles()
        except Exception as e:
            print(f"Warning: Could not load roles at startup: {e}")
            print("Roles will be loaded on first use")
        
        try:
            reload_permissions()
        except Exception as e:
            print(f"Warning: Could not load permissions at startup: {e}")
            print("Permissions will be loaded on first use")
    
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
    from models.score_card import ScoreCard
    from models.evaluation import Evaluation
    from models.notification import Notification
    from models.master import Master
    from models.eligibility_profile import EligibilityProfile
    from services.auth_service import create_user, authenticate_user, generate_token, get_user_by_id
    from services.goal_service import create_goal, get_user_goals
    from services.competency_service import create_competency, get_user_competencies
    from services.score_card_service import create_score_card, get_user_score_cards
    from services.evaluation_service import create_evaluation, get_user_evaluations
    from services.notification_service import create_notification, get_unread_notifications, mark_notification_as_read
    from services.review_period_service import (
        create_review_period, get_all_review_periods, get_review_period_by_id,
        update_review_period, delete_review_period, open_review_period, close_review_period
    )
    from middleware.auth import authenticate_token, authorize_role, role_required, permission_required

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

    # Score Card Routes
    @app.route('/api/score-cards', methods=['POST'])
    @authenticate_token
    @authorize_role(['Manager', 'HR'])
    def create_score_card_route():
        data = request.get_json()
        score_card = create_score_card(
            data['user_id'], 
            data['title'], 
            data['period_start'], 
            data['period_end'], 
            data['status']
        )
        return jsonify(score_card.to_dict()), 201

    @app.route('/api/users/<user_id>/score-cards', methods=['GET'])
    @authenticate_token
    def get_user_score_cards_route(user_id):
        score_cards = get_user_score_cards(user_id)
        return jsonify([card.to_dict() for card in score_cards])

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
    @role_required('HR Admin')  # Keep for backward compatibility
    @permission_required('create_review_period')  # New permission check
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
            # Status defaults to 'Closed', is_active is automatically synced by service
            period = create_review_period(
                period_name=data['period_name'],
                period_type=data['period_type'],
                start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
                end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date(),
                financial_period=data.get('financial_period'),
                description=data.get('description'),
                status=data.get('status', 'Closed'),  # Default to 'Closed'
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
            if 'status' in data:
                update_data['status'] = data['status']  # is_active will be synced automatically
            
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

    @app.route('/api/review-periods/active', methods=['GET'])
    @authenticate_token
    def get_active_review_periods_route():
        """Get active review periods with employee counts"""
        from models.score_card import ScoreCard
        
        # Get active review periods
        active_periods = ReviewPeriod.query.filter_by(
            is_active=True,
            deleted_at=None
        ).all()
        
        result = []
        for period in active_periods:
            # Count employees with score cards for this period
            employee_count = ScoreCard.query.filter_by(
                review_period_id=period.id,
                deleted_at=None
            ).count()
            
            result.append({
                'id': period.id,
                'name': period.period_name,
                'startDate': period.start_date.strftime('%b %d, %Y') if period.start_date else '',
                'endDate': period.end_date.strftime('%b %d, %Y') if period.end_date else '',
                'status': period.status or 'Draft',
                'employeeCount': employee_count
            })
        
        return jsonify(result), 200

    # Eligibility Profile Routes
    @app.route('/api/eligibility-profiles', methods=['GET'])
    @authenticate_token
    @role_required('HR Admin')  # Keep for backward compatibility
    @permission_required('generate_score_cards')  # New permission check
    def get_eligibility_profiles():
        """Get all eligibility profiles with counts (HR Admin only)"""
        from services.eligibility_service import get_all_profiles_with_counts, get_matching_employees
        
        # Get the logged-in user's employee_id to exclude them from counts
        current_user_id = request.user.get('user_id') or request.user.get('id')
        current_user = User.query.get(current_user_id)
        excluded_employee_id = current_user.employee_id if current_user and current_user.employee_id else None
        
        # Get profiles with counts
        profiles = get_all_profiles_with_counts()
        
        # Adjust counts to exclude the logged-in user
        if excluded_employee_id:
            for profile in profiles:
                employee_ids = get_matching_employees(profile['id'])
                if excluded_employee_id in employee_ids:
                    profile['matching_employees'] -= 1
        
        return jsonify(profiles), 200

    # Department Routes
    @app.route('/api/departments', methods=['GET'])
    @authenticate_token
    def get_departments():
        """Get all active departments"""
        from models.department import Department
        
        departments = Department.query.filter_by(
            deleted_at=None
        ).order_by(Department.name).all()
        
        return jsonify([{
            'id': d.id,
            'name': d.name,
            'description': d.description
        } for d in departments]), 200

    # Position Routes
    @app.route('/api/positions', methods=['GET'])
    @authenticate_token
    def get_positions():
        """Get all active positions"""
        from models.position import Position
        
        # Optional: filter by department_id if provided
        department_id = request.args.get('department_id', type=int)
        
        query = Position.query.filter_by(deleted_at=None)
        if department_id:
            query = query.filter_by(department_id=department_id)
        
        positions = query.order_by(Position.title).all()
        
        return jsonify([{
            'id': p.id,
            'title': p.title,
            'department_id': p.department_id,
            'department_name': p.department.name if p.department else None,
            'grade_level': p.grade_level
        } for p in positions]), 200

    @app.route('/api/eligibility-profiles', methods=['POST'])
    @authenticate_token
    @role_required('HR Admin')  # Keep for backward compatibility
    @permission_required('generate_score_cards')  # New permission check
    def create_eligibility_profile():
        """Create a new eligibility profile (HR Admin only)"""
        from services.eligibility_service import create_eligibility_profile as create_profile
        from models.eligibility_profile import EligibilityProfile
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        profile_name = data.get('profile_name')
        if not profile_name:
            return jsonify({'error': 'profile_name is required'}), 400
        
        # Check for duplicate profile name
        existing = EligibilityProfile.query.filter(
            EligibilityProfile.profile_name == profile_name,
            EligibilityProfile.deleted_at.is_(None)
        ).first()
        if existing:
            return jsonify({'error': f'Profile name "{profile_name}" already exists'}), 400
        
        try:
            current_user_id = request.user.get('user_id') or request.user.get('id')
            
            # Get and clean the data
            # Frontend sends "All" for empty selections (matching seed data format)
            department_filter = data.get('department_filter')
            if department_filter == '' or department_filter is None:
                department_filter = 'All'  # Default to "All" if empty
            else:
                department_filter = str(department_filter).strip()
            
            position_criteria = data.get('position_criteria')
            if position_criteria == '' or position_criteria is None:
                position_criteria = 'All'  # Default to "All" if empty
            else:
                position_criteria = str(position_criteria).strip()
            
            description = data.get('description')
            if description == '' or description is None:
                description = None
            else:
                description = str(description).strip()
            
            print(f"Creating profile with: department_filter='{department_filter}', position_criteria='{position_criteria}'")  # Debug
            
            profile = create_profile(
                profile_name=profile_name,
                description=description,
                department_filter=department_filter,
                position_criteria=position_criteria,
                is_active=data.get('is_active', True),
                created_by=current_user_id
            )
            
            # Get matching employees count
            from services.eligibility_service import get_matching_employees
            employee_ids = get_matching_employees(profile.id)
            
            return jsonify({
                'id': profile.id,
                'profile_name': profile.profile_name,
                'description': profile.description,
                'department': profile.department_filter,
                'position_criteria': profile.position_criteria,
                'matching_employees': len(employee_ids),
                'is_active': profile.is_active
            }), 201
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            print(f"Error creating eligibility profile: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Failed to create eligibility profile: {str(e)}'}), 500

    @app.route('/api/planning/generate-score-cards', methods=['POST'])
    @authenticate_token
    @role_required('HR Admin')  # Keep for backward compatibility
    @permission_required('generate_score_cards')  # New permission check
    def generate_score_cards():
        """
        Generate score cards for selected eligibility profiles.
        
        Request body:
        {
            "review_period_id": 1,
            "profile_ids": [1, 2, 3]
        }
        """
        from services.eligibility_service import get_matching_employees
        from services.score_card_service import bulk_create_score_cards
        
        data = request.get_json()
        review_period_id = data.get('review_period_id')
        profile_ids = data.get('profile_ids', [])
        
        if not review_period_id or not profile_ids:
            return jsonify({'error': 'Missing required fields: review_period_id and profile_ids'}), 400
        
        # Collect all unique employee IDs
        all_employee_ids = set()
        for profile_id in profile_ids:
            employee_ids = get_matching_employees(profile_id)
            all_employee_ids.update(employee_ids)
        
        # Exclude the logged-in user's employee record
        # HR Admin shouldn't create a performance review for themselves
        current_user_id = request.user.get('user_id') or request.user.get('id')
        current_user = User.query.get(current_user_id)
        if current_user and current_user.employee_id:
            all_employee_ids.discard(current_user.employee_id)
            print(f"Excluded logged-in user's employee_id {current_user.employee_id} from score card generation")
        
        # Create score cards
        created = bulk_create_score_cards(
            review_period_id=review_period_id,
            employee_ids=list(all_employee_ids),
            created_by_user_id=current_user_id
        )
        
        # Get employee details for response
        employees_data = []
        
        # If new score cards were created, return those
        if created:
            for doc in created:
                emp = doc.employee
                employees_data.append({
                    'id': emp.id,
                    'name': emp.full_name,
                    'department': emp.department.name if emp.department else 'N/A',
                    'position': emp.position.title if emp.position else 'N/A',
                    'score_card_id': doc.id
                })
        else:
            # If no new ones created (already exist), get the existing ones
            for employee_id in all_employee_ids:
                existing_card = ScoreCard.query.filter_by(
                    employee_id=employee_id,
                    review_period_id=review_period_id,
                    deleted_at=None
                ).first()
                if existing_card:
                    emp = existing_card.employee
                    employees_data.append({
                        'id': emp.id,
                        'name': emp.full_name,
                        'department': emp.department.name if emp.department else 'N/A',
                        'position': emp.position.title if emp.position else 'N/A',
                        'score_card_id': existing_card.id
                    })
        
        return jsonify({
            'message': f'Created {len(created)} new score cards' if created else f'Score cards already exist for {len(employees_data)} employees',
            'count': len(created) if created else len(employees_data),
            'employees': employees_data,
            'already_existed': len(created) == 0
        }), 201

    # ==================== GOALS API ENDPOINTS (Phase 1) ====================
    
    @app.route('/api/score-cards', methods=['GET'])
    @authenticate_token
    def get_score_cards():
        """Get all score cards, optionally filtered by review_period_id"""
        review_period_id = request.args.get('review_period_id', type=int)
        
        query = ScoreCard.query.filter_by(deleted_at=None)
        if review_period_id:
            query = query.filter_by(review_period_id=review_period_id)
        
        score_cards = query.all()
        
        result = []
        for sc in score_cards:
            result.append({
                'id': sc.id,
                'employee_id': sc.employee_id,
                'review_period_id': sc.review_period_id,
                'status': sc.status,
                'employee': {
                    'id': sc.employee.id,
                    'full_name': sc.employee.full_name,
                    'email': sc.employee.email,
                    'department': {
                        'id': sc.employee.department.id if sc.employee.department else None,
                        'name': sc.employee.department.name if sc.employee.department else None
                    },
                    'position': {
                        'id': sc.employee.position.id if sc.employee.position else None,
                        'title': sc.employee.position.title if sc.employee.position else None
                    }
                } if sc.employee else None
            })
        
        return jsonify(result), 200
    
    @app.route('/api/score-cards/<int:score_card_id>/weightage', methods=['GET'])
    @authenticate_token
    def get_score_card_weightage(score_card_id):
        """Get weightage distribution for a score card"""
        score_card = ScoreCard.query.get(score_card_id)
        if not score_card:
            return jsonify({'error': 'Score card not found'}), 404
        
        return jsonify({
            'score_card_id': score_card_id,
            'goals_weightage': score_card.goals_weightage,
            'competencies_weightage': score_card.competencies_weightage,
            'values_weightage': score_card.values_weightage,
            'total': score_card.goals_weightage + score_card.competencies_weightage + score_card.values_weightage
        }), 200

    @app.route('/api/score-cards/<int:score_card_id>/weightage', methods=['PUT'])
    @authenticate_token
    @role_required('HR Admin')  # Keep for backward compatibility
    @permission_required('update_score_card_weightage')  # New permission check
    def update_score_card_weightage(score_card_id):
        """Update weightage distribution (must total 100%)"""
        score_card = ScoreCard.query.get(score_card_id)
        if not score_card:
            return jsonify({'error': 'Score card not found'}), 404
        
        data = request.get_json()
        
        goals_weightage = data.get('goals_weightage')
        competencies_weightage = data.get('competencies_weightage')
        values_weightage = data.get('values_weightage')
        
        # Validate all three are provided
        if goals_weightage is None or competencies_weightage is None or values_weightage is None:
            return jsonify({'error': 'All three weightages (goals, competencies, values) are required'}), 400
        
        # Validate they total to 100%
        total = goals_weightage + competencies_weightage + values_weightage
        if total != 100:
            return jsonify({
                'error': f'Weightages must total 100%. Current total: {total}%'
            }), 400
        
        # Update score card
        score_card.goals_weightage = goals_weightage
        score_card.competencies_weightage = competencies_weightage
        score_card.values_weightage = values_weightage
        score_card.updated_by = request.user['user_id']
        db.session.commit()
        
        return jsonify({
            'message': 'Weightage updated successfully',
            'goals_weightage': goals_weightage,
            'competencies_weightage': competencies_weightage,
            'values_weightage': values_weightage
        }), 200
    
    @app.route('/api/score-cards/<int:score_card_id>/goals', methods=['GET'])
    @authenticate_token
    def get_score_card_goals(score_card_id):
        """Get all goals for a score card with planning progress"""
        
        score_card = ScoreCard.query.get(score_card_id)
        if not score_card:
            return jsonify({'error': 'Score card not found'}), 404
        
        # Set default weightage if null (for score cards created before migration)
        if score_card.goals_weightage is None:
            score_card.goals_weightage = 60
            score_card.competencies_weightage = 25
            score_card.values_weightage = 15
            db.session.commit()
        
        # Get all active goals for this score card
        goals = Goal.query.filter_by(
            score_card_id=score_card_id,
            deleted_at=None
        ).all()
        
        # Calculate planning progress by role
        planning_progress = {}
        for role in ['HR', 'Manager', 'Employee']:
            role_goals = [g for g in goals if g.added_by_role == role]
            planning_progress[role] = {
                'count': len(role_goals),
                'total_weight': sum(g.weight for g in role_goals)
            }
        
        planning_progress['total_weight'] = sum(g.weight for g in goals)
        
        # Format goals for response (using to_dict method which includes user details)
        goals_data = [goal.to_dict() for goal in goals]
        
        return jsonify({
            'score_card_id': score_card_id,
            'goals_weightage': score_card.goals_weightage,
            'goals': goals_data,
            'planning_progress': planning_progress
        }), 200

    @app.route('/api/score-cards/<int:score_card_id>/goals', methods=['POST'])
    @authenticate_token
    def add_goal_to_score_card(score_card_id):
        """Add a new goal to score card"""
        
        score_card = ScoreCard.query.get(score_card_id)
        if not score_card:
            return jsonify({'error': 'Score card not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('goal_name'):
            return jsonify({'error': 'goal_name is required'}), 400
        if not data.get('weight'):
            return jsonify({'error': 'weight is required'}), 400
        
        # Extract user info from JWT
        current_user = request.user
        # JWT token has 'role' field (e.g., "HR Admin", "Manager", "Employee")
        role_name = current_user.get('role') or current_user.get('role_name') or ''
        
        # Map role name to simplified role for added_by_role field
        role_mapping = {
            'HR Admin': 'HR',
            'HR': 'HR',
            'Manager': 'Manager',
            'Employee': 'Employee'
        }
        added_by_role = role_mapping.get(role_name, 'Employee')
        
        # Debug: log the role mapping
        print(f"DEBUG: JWT role={role_name}, mapped to added_by_role={added_by_role}")
        
        # Validate total weight doesn't exceed goals_weightage
        existing_goals = Goal.query.filter_by(
            score_card_id=score_card_id,
            deleted_at=None
        ).all()
        
        total_existing_weight = sum(g.weight for g in existing_goals)
        new_weight = int(data.get('weight', 0))
        
        if total_existing_weight + new_weight > score_card.goals_weightage:
            return jsonify({
                'error': f'Total goal weight would exceed {score_card.goals_weightage}%. Current total: {total_existing_weight}%, trying to add: {new_weight}%'
            }), 400
        
        # Parse dates if provided
        from datetime import datetime
        start_date = None
        end_date = None
        deadline_date = None
        
        if data.get('start_date'):
            try:
                start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
        
        if data.get('end_date'):
            try:
                end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
        
        if data.get('deadline_date'):
            try:
                deadline_date = datetime.strptime(data['deadline_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid deadline_date format. Use YYYY-MM-DD'}), 400
        
        # Create new goal
        goal = Goal(
            score_card_id=score_card_id,
            goal_name=data['goal_name'],
            description=data.get('description'),
            success_criteria=data.get('success_criteria'),
            weight=new_weight,
            added_by_role=added_by_role,
            added_by_user_id=current_user['user_id'],
            start_date=start_date,
            end_date=end_date,
            deadline_date=deadline_date,
            status=data.get('status', 'active'),
            created_by=current_user['user_id'],
            updated_by=current_user['user_id']
        )
        
        db.session.add(goal)
        db.session.commit()
        
        return jsonify({
            'message': 'Goal added successfully',
            'goal': goal.to_dict()
        }), 201

    @app.route('/api/goals/<int:goal_id>', methods=['PUT'])
    @authenticate_token
    def update_goal(goal_id):
        """Update an existing goal"""
        
        goal = Goal.query.get(goal_id)
        if not goal:
            return jsonify({'error': 'Goal not found'}), 404
        
        if goal.deleted_at:
            return jsonify({'error': 'Goal has been deleted'}), 404
        
        data = request.get_json()
        current_user = request.user
        
        # Update fields if provided
        if 'goal_name' in data:
            goal.goal_name = data['goal_name']
        if 'description' in data:
            goal.description = data['description']
        if 'success_criteria' in data:
            goal.success_criteria = data['success_criteria']
        if 'status' in data:
            goal.status = data['status']
        
        # Update weight with validation
        if 'weight' in data:
            new_weight = int(data['weight'])
            
            # Get score card to check weightage limit
            score_card = ScoreCard.query.get(goal.score_card_id)
            
            # Calculate total weight excluding current goal
            other_goals = Goal.query.filter(
                Goal.score_card_id == goal.score_card_id,
                Goal.id != goal_id,
                Goal.deleted_at.is_(None)
            ).all()
            
            total_other_weight = sum(g.weight for g in other_goals)
            
            if total_other_weight + new_weight > score_card.goals_weightage:
                return jsonify({
                    'error': f'Total goal weight would exceed {score_card.goals_weightage}%'
                }), 400
            
            goal.weight = new_weight
        
        # Update dates if provided
        if 'start_date' in data and data['start_date']:
            from datetime import datetime
            try:
                goal.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
        
        if 'end_date' in data and data['end_date']:
            from datetime import datetime
            try:
                goal.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
        
        if 'deadline_date' in data and data['deadline_date']:
            from datetime import datetime
            try:
                goal.deadline_date = datetime.strptime(data['deadline_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid deadline_date format. Use YYYY-MM-DD'}), 400
        
        goal.updated_by = current_user['user_id']
        db.session.commit()
        
        return jsonify({
            'message': 'Goal updated successfully',
            'goal': goal.to_dict()
        }), 200

    @app.route('/api/goals/<int:goal_id>', methods=['DELETE'])
    @authenticate_token
    def delete_goal(goal_id):
        """Soft delete a goal"""
        
        goal = Goal.query.get(goal_id)
        if not goal:
            return jsonify({'error': 'Goal not found'}), 404
        
        if goal.deleted_at:
            return jsonify({'error': 'Goal already deleted'}), 404
        
        # Soft delete
        from datetime import datetime
        goal.deleted_at = datetime.utcnow()
        goal.updated_by = request.user['user_id']
        db.session.commit()
        
        return jsonify({'message': 'Goal deleted successfully'}), 200

    @app.route('/api/score-cards/<int:score_card_id>/send-for-acceptance', methods=['POST'])
    @authenticate_token
    @role_required('HR Admin')  # Keep for backward compatibility
    @permission_required('send_score_card_acceptance')  # New permission check
    def send_score_card_for_acceptance(score_card_id):
        """Send score card for employee acceptance (validates goal weights)"""
        
        score_card = ScoreCard.query.get(score_card_id)
        if not score_card:
            return jsonify({'error': 'Score card not found'}), 404
        
        # Validate total goal weights = goals_weightage
        goals = Goal.query.filter_by(
            score_card_id=score_card_id,
            deleted_at=None
        ).all()
        
        total_goal_weight = sum(g.weight for g in goals)
        
        if total_goal_weight != score_card.goals_weightage:
            return jsonify({
                'error': f'Total goal weight must equal {score_card.goals_weightage}%. Current: {total_goal_weight}%',
                'required': score_card.goals_weightage,
                'current': total_goal_weight
            }), 400
        
        # Update status
        score_card.status = 'pending_acceptance'
        score_card.updated_by = request.user['user_id']
        db.session.commit()
        
        # TODO: Create notification for employee
        
        return jsonify({
            'message': 'Score card sent for employee acceptance',
            'score_card_id': score_card_id,
            'status': 'pending_acceptance'
        }), 200

    # Permission Management Routes
    @app.route('/api/permissions', methods=['GET'])
    @authenticate_token
    @permission_required('manage_permissions')  # Only users with permission management can view all permissions
    def get_all_permissions_route():
        """Get all permissions, grouped by category"""
        from services.permission_service import get_all_permissions
        
        permissions = get_all_permissions(include_inactive=False)
        
        # Group by category
        grouped = {}
        for perm in permissions:
            category = perm.category or 'other'
            if category not in grouped:
                grouped[category] = []
            grouped[category].append(perm.to_dict())
        
        return jsonify({
            'permissions': [p.to_dict() for p in permissions],
            'grouped_by_category': grouped
        }), 200

    @app.route('/api/roles/<int:role_id>/permissions', methods=['GET'])
    @authenticate_token
    @permission_required('manage_permissions')
    def get_role_permissions_route(role_id):
        """Get all permissions for a specific role"""
        from services.permission_service import get_permissions_by_role
        from models.role import Role
        
        role = Role.query.filter_by(id=role_id, deleted_at=None).first()
        if not role:
            return jsonify({'error': 'Role not found'}), 404
        
        permissions = get_permissions_by_role(role_id)
        
        return jsonify({
            'role_id': role_id,
            'role_name': role.role_name,
            'permissions': [p.to_dict() for p in permissions],
            'permission_codes': [p.code for p in permissions]
        }), 200

    @app.route('/api/roles/<int:role_id>/permissions', methods=['PUT'])
    @authenticate_token
    @permission_required('manage_permissions')
    def update_role_permissions_route(role_id):
        """Update permissions for a role"""
        from services.permission_service import assign_permissions_to_role
        from models.role import Role
        
        role = Role.query.filter_by(id=role_id, deleted_at=None).first()
        if not role:
            return jsonify({'error': 'Role not found'}), 404
        
        data = request.get_json()
        permission_ids = data.get('permission_ids', [])
        
        if not isinstance(permission_ids, list):
            return jsonify({'error': 'permission_ids must be a list'}), 400
        
        success = assign_permissions_to_role(role_id, permission_ids)
        if not success:
            return jsonify({'error': 'Failed to update role permissions'}), 500
        
        # Return updated permissions
        from services.permission_service import get_permissions_by_role
        permissions = get_permissions_by_role(role_id)
        
        return jsonify({
            'message': 'Role permissions updated successfully',
            'role_id': role_id,
            'role_name': role.role_name,
            'permissions': [p.to_dict() for p in permissions],
            'permission_codes': [p.code for p in permissions]
        }), 200

    @app.route('/api/users/<int:user_id>/permissions', methods=['GET'])
    @authenticate_token
    def get_user_permissions_route(user_id):
        """Get all permissions for a user (for debugging/admin)"""
        from services.permission_service import get_user_permissions, get_user_permission_codes
        from models.user import User
        
        # Users can only view their own permissions, unless they have manage_permissions
        current_user_id = request.user.get('user_id') or request.user.get('id')
        if user_id != current_user_id:
            # Check if current user has permission management
            from services.permission_service import user_has_permission
            if not user_has_permission(current_user_id, 'manage_permissions'):
                return jsonify({'error': 'Insufficient permissions'}), 403
        
        user = User.query.filter_by(id=user_id, deleted_at=None).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        permissions = get_user_permissions(user_id)
        permission_codes = get_user_permission_codes(user_id)
        
        return jsonify({
            'user_id': user_id,
            'username': user.username,
            'role_id': user.role_id,
            'role_name': user.role.role_name if user.role else None,
            'permissions': [p.to_dict() for p in permissions],
            'permission_codes': list(permission_codes)
        }), 200


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