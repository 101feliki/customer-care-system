import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import EnhancedNotificationCard from '../components/EnhancedNotificationCard';
import ThemeSwitcher from '../components/ThemeSwitcher';
import FilterBar from '../components/FilterBar';
import { useTheme } from '../contexts/ThemeContext';
import notificationService, { Notification } from '../services/notificationService';

const NotificationsPage: React.FC = () => {
  const { theme } = useTheme();
  // Ensure we initialize with an empty array
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [starredNotifications, setStarredNotifications] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    dateRange: 'today',
    search: '',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationService.getNotifications();
        
        /**
         * FIX: Robust data check. 
         * If the backend returns { data: [] } instead of just [], 
         * this ensures we always set an array to state.
         */
        const data = Array.isArray(response) ? response : (response as any)?.data || [];
        setNotifications(data);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]); // Fallback to empty array on error
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => (Array.isArray(prev) ? prev : []).map(n => 
        n.id === id ? { ...n, readAt: new Date() } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await notificationService.cancelNotification(id);
      setNotifications(prev => (Array.isArray(prev) ? prev : []).map(n => 
        n.id === id ? { ...n, canceledAt: new Date() } : n
      ));
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  };

  const starNotification = (id: string) => {
    setStarredNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const archiveNotification = (id: string) => {
    console.log('Archiving notification:', id);
  };

  /**
   * FIX: Added safe array check before filtering to prevent 
   * "notifications.filter is not a function"
   */
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const filteredNotifications = safeNotifications.filter(notification => {
    if (filters.category !== 'all' && notification.category !== filters.category) {
      return false;
    }
    if (filters.status === 'read' && !notification.readAt) return false;
    if (filters.status === 'unread' && notification.readAt) return false;
    if (filters.search && !notification.content.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const stats = {
    total: safeNotifications.length,
    unread: safeNotifications.filter(n => !n.readAt).length,
    starred: starredNotifications.size,
    cancelled: safeNotifications.filter(n => n.canceledAt).length,
  };

  return (
    <div className="h-screen flex overflow-hidden bg-primary">
      <Sidebar />
      
      {/* FIXED SCROLLING: Changed structure for proper scrolling */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="bg-secondary border-b border-color sticky top-0 z-30 shrink-0">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">All Notifications</h1>
                
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeSwitcher />
                
                <div className="flex space-x-2">
                 
                  
                </div>
              </div>
            </div>
          </div>
          
          <FilterBar filters={filters} setFilters={setFilters} />
        </header>

        {/* FIXED SCROLLING: This main area now scrolls */}
        <main className="flex-1 overflow-y-auto min-h-0 p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl shadow-sm p-4 border border-color">
              <div className="text-sm text-secondary">Total</div>
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
            </div>
            <div className="bg-card rounded-xl shadow-sm p-4 border border-color">
              <div className="text-sm text-secondary">Unread</div>
              <div className="text-2xl font-bold text-blue-800">{stats.unread}</div>
            </div>
            <div className="bg-card rounded-xl shadow-sm p-4 border border-color">
              <div className="text-sm text-secondary">Starred</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.starred}</div>
            </div>
            <div className="bg-card rounded-xl shadow-sm p-4 border border-color">
              <div className="text-sm text-secondary">Cancelled</div>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            </div>
          </div>

          {/* Notifications Container */}
          <div className="bg-card rounded-xl shadow-sm p-6 border border-color">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-primary">
                Notifications ({filteredNotifications.length})
              </h2>
              <div className="text-sm text-secondary">
                {filteredNotifications.length === safeNotifications.length 
                  ? 'Showing all notifications' 
                  : `Filtered: ${filteredNotifications.length} of ${safeNotifications.length}`
                }
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-secondary">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-primary">No notifications found</h3>
                <p className="text-secondary">Try adjusting your filters or create a new notification</p>
              </div>
            ) : viewMode === 'grid' ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {filteredNotifications.map((notification) => (
      <div 
        key={notification.id} 
        className="bg-card rounded-lg border border-color p-4 flex flex-col min-h-[180px] break-words"
      >
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${
            notification.category === 'email' ? 'bg-blue-50 dark:bg-blue-900/20' :
            notification.category === 'sms' ? 'bg-green-50 dark:bg-green-900/20' :
            notification.category === 'urgent' ? 'bg-red-50 dark:bg-red-900/20' :
            'bg-gray-50 dark:bg-gray-800'
          }`}>
            {notification.category === 'email' && '📧'}
            {notification.category === 'sms' && '💬'}
            {notification.category === 'urgent' && '⚠️'}
            {notification.category === 'info' && 'ℹ️'}
          </div>
          <button
            onClick={() => starNotification(notification.id)}
            className="text-gray-400 hover:text-yellow-500 flex-shrink-0"
          >
            {starredNotifications.has(notification.id) ? '★' : '☆'}
          </button>
        </div>
        
        <h3 className="font-medium text-primary mb-2 truncate">
          {notification.category.toUpperCase()}
        </h3>
        
        {/* FIXED CONTENT AREA */}
        <div className="flex-1 overflow-hidden mb-3">
          <p className="text-sm text-secondary line-clamp-3 break-words">
            {notification.content}
          </p>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
          To: {notification.recipientId}
        </div>
      </div>
    ))}
  </div>
) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <EnhancedNotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onCancel={handleCancel}
                    onArchive={archiveNotification}
                    onStar={starNotification}
                    isStarred={starredNotifications.has(notification.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;