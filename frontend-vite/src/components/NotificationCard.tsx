import React from 'react';
import { BellIcon, CheckCircleIcon, XCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { Notification } from '../services/notificationService';
import { format } from 'date-fns';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onCancel: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onCancel,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'email':
        return <EnvelopeIcon className="icon-blue" />;
      case 'sms':
        return <BellIcon className="icon-green" />;
      default:
        return <BellIcon className="icon-gray" />;
    }
  };

  return (
    <div className="notification-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          {getCategoryIcon(notification.category)}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
              {notification.category.toUpperCase()} Notification
            </h3>
            <p style={{ color: '#4b5563', marginTop: '0.25rem', marginBottom: 0 }}>
              {notification.content}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              <span>Recipient: {notification.recipientId}</span>
              <span>•</span>
              <span>{format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!notification.readAt && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="btn btn-success"
              style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}
            >
              <CheckCircleIcon style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
              Mark Read
            </button>
          )}
          <button
            onClick={() => onCancel(notification.id)}
            className="btn btn-danger"
            style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}
          >
            <XCircleIcon style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
            Cancel
          </button>
        </div>
      </div>
      
      {notification.readAt && (
        <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', fontSize: '0.875rem', color: '#10b981' }}>
          <CheckCircleIcon style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
          Read on {format(new Date(notification.readAt), 'MMM dd, yyyy HH:mm')}
        </div>
      )}
    </div>
  );
};

export default NotificationCard;
