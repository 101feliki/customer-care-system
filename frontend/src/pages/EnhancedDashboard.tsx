import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import EnhancedNotificationCard from '../components/EnhancedNotificationCard';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import ThemeSwitcher from '../components/ThemeSwitcher';
import FilterBar from '../components/FilterBar';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import notificationService, { Notification } from '../services/notificationService';

const DashboardContent: React.FC = () => {
  const { theme } = useTheme();
  const [view, setView] = useState<'list' | 'analytics'>('list');
  const [starredNotifications, setStarredNotifications] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    dateRange: 'today',
    search: '',
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await notificationService.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, readAt: new Date() } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await notificationService.cancelNotification(id);
      setNotifications(prev => prev.map(n => 
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

  const analyticsData = {
    notificationsByDay: [
      { day: 'Mon', count: 12 },
      { day: 'Tue', count: 19 },
      { day: 'Wed', count: 15 },
      { day: 'Thu', count: 25 },
      { day: 'Fri', count: 22 },
      { day: 'Sat', count: 18 },
      { day: 'Sun', count: 14 },
    ],
    notificationsByCategory: [
      { category: 'Email', count: 45 },
      { category: 'SMS', count: 30 },
      { category: 'Push', count: 15 },
      { category: 'Urgent', count: 10 },
    ],
    notificationsByStatus: [
      { status: 'Jan', sent: 100, read: 85, failed: 5 },
      { status: 'Feb', sent: 120, read: 100, failed: 8 },
      { status: 'Mar', sent: 150, read: 130, failed: 10 },
      { status: 'Apr', sent: 180, read: 160, failed: 12 },
    ],
  };

  const filteredNotifications = notifications.filter(notification => {
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
    total: notifications.length,
    unread: notifications.filter(n => !n.readAt).length,
    starred: starredNotifications.size,
    cancelled: notifications.filter(n => n.canceledAt).length,
  };

  return (
    <div className="min-h-screen bg-primary flex">
      <Sidebar />
      
      {/* Main content area - REMOVED lg:ml-64, using flex-1 to fill space */}
      <div className="flex-1 min-h-screen overflow-x-hidden">
        <header className="bg-secondary border-b border-color sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">Notifications Dashboard</h1>
                <p className="text-secondary">Manage and monitor all customer notifications</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeSwitcher />
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setView('list')}
                    className={`px-4 py-2 rounded-lg ${
                      view === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setView('analytics')}
                    className={`px-4 py-2 rounded-lg ${
                      view === 'analytics' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <FilterBar filters={filters} setFilters={setFilters} />
        </header>

        <main className="p-6">
          {view === 'list' ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-card rounded-xl shadow-sm p-4 border border-color">
                  <div className="text-sm text-secondary">Total Notifications</div>
                  <div className="text-2xl font-bold text-primary">{stats.total}</div>
                </div>
                <div className="bg-card rounded-xl shadow-sm p-4 border border-color">
                  <div className="text-sm text-secondary">Unread</div>
                  <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
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

              {/* Notifications list */}
              <div className="bg-card rounded-xl shadow-sm p-6 border border-color">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-primary">Recent Notifications</h2>
                  <div className="text-sm text-secondary">
                    Showing {filteredNotifications.length} of {notifications.length}
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
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications.slice(0, 10).map((notification) => (
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
            </>
          ) : (
            <AnalyticsDashboard data={analyticsData} />
          )}
        </main>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
};

export default Dashboard;