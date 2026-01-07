import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  EnvelopeIcon,
  ChatBubbleBottomCenterTextIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import NotificationCard from '../components/NotificationCard';
import notificationService, { Notification, CreateNotificationDto } from '../services/notificationService';
import CreateNotificationModal from '../components/CreateNotificationModal';

const Dashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleCancelNotification = async (id: string) => {
    try {
      await notificationService.cancelNotification(id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  };

  const handleCreateNotification = async (data: CreateNotificationDto) => {
    try {
      await notificationService.createNotification(data);
      setIsModalOpen(false);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.readAt).length,
    email: notifications.filter(n => n.category.toLowerCase() === 'email').length,
    sms: notifications.filter(n => n.category.toLowerCase() === 'sms').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <BellIcon className="h-8 w-8 text-blue-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Customer Care Dashboard</h1>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Notification
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <BellIcon className="h-6 w-6 text-gray-400" />
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Notifications</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <BellIcon className="h-6 w-6 text-red-400" />
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Unread</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.unread}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-6 w-6 text-blue-400" />
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Email</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.email}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-green-400" />
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">SMS</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.sms}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Notifications</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              All notifications sent through the system
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new notification.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onCancel={handleCancelNotification}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <CreateNotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateNotification}
      />
    </div>
  );
};

export default Dashboard;
