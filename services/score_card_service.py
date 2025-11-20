from extensions import db
from models.score_card import ScoreCard
from models.employee import Employee
from datetime import datetime


def create_score_card(user_id=None, title=None, period_start=None, period_end=None, status='planning', 
                      employee_id=None, review_period_id=None, created_by_user_id=None):
    """
    Create a single score card (legacy support + new score card support).
    
    Args:
        Legacy parameters: user_id, title, period_start, period_end, status
        New parameters: employee_id, review_period_id, created_by_user_id
    """
    score_card = ScoreCard(
        employee_id=employee_id,
        review_period_id=review_period_id,
        status=status,
        title=title,
        user_id=user_id,
        created_by=created_by_user_id
    )
    db.session.add(score_card)
    db.session.commit()
    return score_card


def bulk_create_score_cards(review_period_id, employee_ids, created_by_user_id):
    """
    Bulk create score cards for multiple employees.
    
    Args:
        review_period_id: ID of the review period
        employee_ids: List of employee IDs
        created_by_user_id: ID of the user creating these score cards
        
    Returns:
        List of created ScoreCard objects
    """
    created_score_cards = []
    
    for employee_id in employee_ids:
        # Check if a score card already exists for this employee and review period
        existing = ScoreCard.query.filter_by(
            employee_id=employee_id,
            review_period_id=review_period_id,
            deleted_at=None
        ).first()
        
        if existing:
            # Skip if already exists
            continue
        
        # Create new score card with status="planning"
        score_card = ScoreCard(
            employee_id=employee_id,
            review_period_id=review_period_id,
            status='planning',
            created_by=created_by_user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.session.add(score_card)
        created_score_cards.append(score_card)
    
    # Commit all at once
    if created_score_cards:
        db.session.commit()
        # Reload to get all relationships
        for score_card in created_score_cards:
            db.session.refresh(score_card)
    
    return created_score_cards


def get_user_score_cards(user_id):
    """
    Get all score cards for a user.
    
    Args:
        user_id: ID of the user
        
    Returns:
        List of ScoreCard objects
    """
    return ScoreCard.query.filter_by(
        user_id=user_id,
        deleted_at=None
    ).all()

