import React, { useState, useEffect } from 'react';
import { BazaButton } from './button';
import { useAuth } from '../AuthContext';
import '../styles/notifications.css';

const Notification = () => {
  const { telegramId } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock notifications data - in real app, this would come from API
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'like',
        title: 'New Like!',
        message: 'Someone liked your profile',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false
      },
      {
        id: 2,
        type: 'match',
        title: 'It\'s a Match!',
        message: 'You and Anna are now connected',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        read: false
      },
      {
        id: 3,
        type: 'message',
        title: 'New Message',
        message: 'John sent you a message',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true
      },
      {
        id: 4,
        type: 'system',
        title: 'Welcome!',
        message: 'Welcome to GORA Dating App',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        read: true
      }
    ];

    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
  }, []);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'match':
        return '🔥';
      case 'message':
        return '💬';
      case 'system':
        return '🔔';
      default:
        return '📱';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return 'Just now';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <div className="gora-token">50,000 GORA Token</div>
        <h1 className="notifications-title">
          Notifications 
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </h1>
        {unreadCount > 0 && (
          <button className="mark-all-read" onClick={markAllAsRead}>
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="notifications-content">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <p>No notifications yet</p>
            <p>We'll notify you when something interesting happens!</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <h3 className="notification-title">{notification.title}</h3>
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">{formatTime(notification.timestamp)}</span>
              </div>
              <div className="notification-actions">
                {!notification.read && <div className="unread-dot"></div>}
                <button 
                  className="clear-notification"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearNotification(notification.id);
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <BazaButton />
    </div>
  );
};

export default Notification;