from models.notification import Notification
from extensions import db

def create_notification(recipient_id, message, entity_type, entity_id):
    notification = Notification(
        recipient_id=recipient_id,
        message=message,
        entity_type=entity_type,
        entity_id=entity_id
    )
    db.session.add(notification)
    db.session.commit()
    return notification

def get_unread_notifications(user_id):
    return Notification.query.filter_by(recipient_id=user_id, is_read=False).all()

def mark_notification_as_read(notification_id):
    notification = Notification.query.get(notification_id)
    if notification:
        notification.is_read = True
        db.session.commit()
    return notification