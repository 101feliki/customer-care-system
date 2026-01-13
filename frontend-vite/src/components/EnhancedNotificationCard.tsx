import React, { useState } from 'react';
import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Notification } from '../services/notificationService';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onCancel: (id: string) => void;
  onArchive: (id: string) => void;
  onStar: (id: string) => void;
  isStarred?: boolean;
}

const EnhancedNotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onCancel,
  onArchive,
  onStar,
  isStarred = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryConfig = (category: string) => {
    const configs = {
      email: {
        icon: EnvelopeIcon,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        label: 'Email',
      },
      sms: {
        icon: ChatBubbleBottomCenterTextIcon,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'SMS',
      },
      urgent: {
        icon: ExclamationTriangleIcon,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Urgent',
      },
      info: {
        icon: InformationCircleIcon,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        label: 'Info',
      },
      default: {
        icon: BellIcon,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        label: 'Notification',
      },
    };

    return configs[category.toLowerCase() as keyof typeof configs] || configs.default;
  };

  const config = getCategoryConfig(notification.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg shadow-sm border p-4 mb-3 transition-all duration-200 ${config.bgColor} ${config.borderColor} border hover:shadow-md ${notification.readAt ? 'opacity-75' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <config.icon className={`h-5 w-5 ${config.color}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-semibold ${config.color}`}>
                  {config.label}
                </span>
                {!notification.readAt && (
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
                {notification.canceledAt && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    Cancelled
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onStar(notification.id)}
                  className="p-1 hover:bg-yellow-50 rounded"
                >
                  {isStarred ? (
                    <StarIconSolid className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <StarIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {isExpanded ? 'Less' : 'More'}
                </button>
              </div>
            </div>
            
            <p className="text-gray-800 font-medium truncate">
              {notification.content}
            </p>
            
            {isExpanded && (
              <div className="mt-2 space-y-2 text-sm text-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Recipient ID:</span>{' '}
                    <span className="font-mono bg-gray-100 px-1 rounded">
                      {notification.recipientId}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {format(new Date(notification.createdAt), 'PPpp')}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-xs">
                  <span className="flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                  {notification.readAt && (
                    <span className="flex items-center text-green-600">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Read {formatDistanceToNow(new Date(notification.readAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2">
        {!notification.readAt && !notification.canceledAt && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
          >
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Mark as Read
          </button>
        )}
        
        {!notification.canceledAt && (
          <button
            onClick={() => onCancel(notification.id)}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            <XCircleIcon className="h-4 w-4 mr-1" />
            Cancel
          </button>
        )}
        
        <button
          onClick={() => onArchive(notification.id)}
          className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <ArchiveBoxIcon className="h-4 w-4 mr-1" />
          Archive
        </button>
      </div>
    </motion.div>
  );
};

export default EnhancedNotificationCard;