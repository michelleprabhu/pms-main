from app import create_app
from extensions import db
from models.eligibility_profile import EligibilityProfile


def seed_eligibility_profiles():
    """Seed 5 eligibility profiles for testing"""
    app = create_app()
    with app.app_context():
        profiles = [
            {
                'profile_name': 'Manager Profile',
                'description': 'All employees in managerial positions across departments',
                'department_filter': 'All',
                'position_criteria': 'Manager|Director|Lead|Head'
            },
            {
                'profile_name': 'Software Developer Profile',
                'description': 'Engineering team developers and programmers',
                'department_filter': 'IT',
                'position_criteria': 'Software Developer|Engineer|Developer|Programmer'
            },
            {
                'profile_name': 'Senior Software Engineer Profile',
                'description': 'Senior and principal engineers with leadership responsibilities',
                'department_filter': 'IT',
                'position_criteria': 'Senior|Principal|Staff Engineer|Architect'
            },
            {
                'profile_name': 'Sales Team Profile',
                'description': 'All sales department employees',
                'department_filter': 'Sales',
                'position_criteria': 'All'
            },
            {
                'profile_name': 'HR Team Profile',
                'description': 'All HR department employees',
                'department_filter': 'HR',
                'position_criteria': 'All'
            }
        ]
        
        for p in profiles:
            exists = EligibilityProfile.query.filter_by(profile_name=p['profile_name']).first()
            if not exists:
                profile = EligibilityProfile(**p)
                db.session.add(profile)
        
        db.session.commit()
        print("✅ Seeded 5 eligibility profiles")


if __name__ == '__main__':
    seed_eligibility_profiles()

