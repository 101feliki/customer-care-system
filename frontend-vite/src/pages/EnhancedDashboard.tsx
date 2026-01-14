import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import EnhancedNotificationCard from '../components/EnhancedNotificationCard';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import ThemeSwitcher from '../components/ThemeSwitcher';
import FilterBar from '../components/FilterBar';
import { useTheme } from '../contexts/ThemeContext';
import notificationService, { Notification } from '../services/notificationService';
import { 
  Bell, 
  EyeOff,
  Star,
  XCircle
} from 'lucide-react';

const Dashboard: React.FC = () => {
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
  const [showUserMenu ] = useState(false);
  const [showSearch] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data: any = await notificationService.getNotifications();
        
        if (data && data.notifications) {
          setNotifications(data.notifications);
        } else if (Array.isArray(data)) {
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]); 
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
    <div className="h-screen flex overflow-hidden bg-primary">
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Simplified Professional Header */}
        <header className="bg-card border-b border-color sticky top-0 z-30">
          <div className="px-6 py-1">
            {/* Top Row: Title and Actions */}
            <div className="flex items-center justify-between mb-4">
              {/* Left: Title */}
              <div>
                <h1 className="text-xl font-bold text-primary tracking-tight">
                  Tableau de Bord
                </h1>
                
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-3">
               
                

                {/* Theme Switcher */}
                <ThemeSwitcher />

                {/* User Profile */}
                <div className="relative">

                 
                </div>
              </div>
            </div>

            {/* Bottom Row: Quick Filters */}
            <div className="flex items-center justify-between">
              {/* Category Filters */}
              <div className="flex space-x-2 overflow-x-auto pb-1">
                
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-2">
               
              </div>
            </div>
          </div>

          {/* Filter Bar - Simplified */}
          <div className="px-6 pb-4">
            <FilterBar filters={filters} setFilters={setFilters} />
          </div>
        </header>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto min-h-0 p-6">
          {view === 'list' ? (
            <>
              {/* Simple Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-card rounded-lg p-4 border border-color">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-secondary mb-1">Total</div>
                      <div className="text-lg font-bold text-primary">{stats.total}</div>
                    </div>
                    <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                <div className="bg-card rounded-lg p-4 border border-color">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-secondary mb-1">Unread</div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.unread}</div>
                    </div>
                    <EyeOff className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                <div className="bg-card rounded-lg p-4 border border-color">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-secondary mb-1">Starred</div>
                      <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.starred}</div>
                    </div>
                    <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>

                <div className="bg-card rounded-lg p-4 border border-color">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-secondary mb-1">Cancelled</div>
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">{stats.cancelled}</div>
                    </div>
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>

              {/* Notifications list */}
              <div className="bg-card rounded-lg p-4 border border-color">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-primary">Notifications</h2>
                  <div className="text-sm text-secondary">
                    Showing {filteredNotifications.length} of {notifications.length}
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="mt-3 text-sm text-secondary">Loading notifications...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-3xl mb-3">📭</div>
                    <h3 className="text-base font-medium text-primary">No notifications found</h3>
                    <p className="text-sm text-secondary">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="space-y-3">
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

export default Dashboard;