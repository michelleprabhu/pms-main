import pytest
from app import create_app, db
from models.Notification import Notification
from services.notificationService import createNotification, getUnreadNotifications, markAsRead
from datetime import datetime

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_create_notification(app):
    with app.app_context():
        notification = createNotification('user123', 'Test message', 'PerformanceDocument', 'doc456')
        assert notification.recipient == 'user123'
        assert notification.message == 'Test message'
        assert notification.entityType == 'PerformanceDocument'
        assert notification.entityId == 'doc456'
        assert notification.isRead is False

def test_get_unread_notifications(app):
    with app.app_context():
        # Create 3 unread notifications
        for i in range(3):
            createNotification('user123', f'Test {i}', 'Goal', f'goal{i}')
        
        notifications = getUnreadNotifications('user123')
        assert len(notifications) == 3
        assert all(n.isRead is False for n in notifications)

def test_mark_as_read(app):
    with app.app_context():
        notification = createNotification('user123', 'Test', 'Evaluation', 'eval789')
        updated = markAsRead(notification.id)
        assert updated.isRead is True