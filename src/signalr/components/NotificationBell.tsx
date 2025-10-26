// src/components/NotificationBell.tsx
import React, { useState } from 'react';
import { useNotificationHub } from '../hooks/useNotificationHub';

export const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const {
        notifications,
        unreadCount,
        markAsRead,
        deleteNotification,
        markAllAsRead,
    } = useNotificationHub({
        onNotificationReceived: (notification) => {
            // Show toast notification
            console.log('New notification:', notification);
        },
        autoMarkAsRead: false,
    });

    return (
        <div className="notification-bell">
            <button onClick={() => setIsOpen(!isOpen)}>
                🔔
                {unreadCount > 0 && (
                    <span className="badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead}>Mark all as read</button>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="no-notifications">No notifications</div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${
                                        notification.read ? 'read' : 'unread'
                                    }`}
                                >
                                    <div className="notification-content">
                                        <h4>{notification.title}</h4>
                                        <p>{notification.message}</p>
                                        <span className="timestamp">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                                    </div>
                                    <div className="notification-actions">
                                        {!notification.read && (
                                            <button onClick={() => markAsRead(notification.id)}>
                                                Mark as read
                                            </button>
                                        )}
                                        <button onClick={() => deleteNotification(notification.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};