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
  Search, 
  User, 
  Settings, 
  ChevronDown,
  Mail,
  MessageSquare,
  AlertCircle,
  Calendar,
  Filter
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

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

  // Notification categories for quick filter
  const notificationCategories = [
    { name: 'All', value: 'all', icon: Bell, count: stats.total, color: 'text-gray-600' },
    { name: 'Email', value: 'email', icon: Mail, count: notifications.filter(n => n.category === 'email').length, color: 'text-blue-600' },
    { name: 'SMS', value: 'sms', icon: MessageSquare, count: notifications.filter(n => n.category === 'sms').length, color: 'text-green-600' },
    { name: 'Urgent', value: 'urgent', icon: AlertCircle, count: notifications.filter(n => n.category === 'urgent').length, color: 'text-red-600' },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-primary">
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Enhanced Professional Header */}
        <header className="bg-card border-b border-color sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left side - Breadcrumb and Title */}
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 text-sm text-secondary">
                  <span>Dashboard</span>
                  <ChevronDown className="w-4 h-4 rotate-270" />
                  <span className="font-medium text-primary">Notifications</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
                  <div>
                    <h1 className="text-xl font-bold text-primary tracking-tight">
                      Notification Center
                    </h1>
                    <p className="text-sm text-secondary flex items-center">
                      <Bell className="w-3 h-3 mr-1" />
                      {stats.unread > 0 ? `${stats.unread} unread notifications` : 'All caught up'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side - Actions and User */}
              <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <div className={`relative transition-all duration-300 ${showSearch ? 'w-64' : 'w-10'}`}>
                  <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${showSearch ? 'opacity-100' : 'opacity-0'}`}>
                    <Search className="w-4 h-4 text-secondary" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    onFocus={() => setShowSearch(true)}
                    onBlur={() => !filters.search && setShowSearch(false)}
                    className={`w-full pl-10 pr-4 py-2 bg-secondary/50 border border-color rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${showSearch ? 'opacity-100' : 'opacity-0 absolute'}`}
                  />
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className={`absolute inset-y-0 left-0 w-10 flex items-center justify-center ${showSearch ? 'hidden' : 'block'}`}
                  >
                    <Search className="w-4 h-4 text-secondary hover:text-primary" />
                  </button>
                </div>

                {/* Quick Filters */}
                <div className="hidden lg:flex items-center space-x-2">
                  <button
                    onClick={() => setFilters({...filters, status: 'unread'})}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    Unread ({stats.unread})
                  </button>
                  <button
                    onClick={() => setView(view === 'list' ? 'analytics' : 'list')}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-secondary text-primary hover:bg-secondary/80 transition-colors flex items-center"
                  >
                    {view === 'list' ? 'Analytics View' : 'List View'}
                  </button>
                </div>

                {/* Theme Switcher */}
                <div className="hidden sm:block">
                  <ThemeSwitcher />
                </div>

                {/* User Profile */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-sm font-medium text-primary">Admin User</div>
                      <div className="text-xs text-secondary">System Administrator</div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-secondary transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-color rounded-lg shadow-lg py-1 z-50">
                      <div className="px-4 py-3 border-b border-color">
                        <div className="text-sm font-medium text-primary">Admin User</div>
                        <div className="text-xs text-secondary">admin@example.com</div>
                      </div>
                      <button className="w-full px-4 py-2 text-sm text-left text-primary hover:bg-secondary transition-colors">
                        <Settings className="w-4 h-4 inline mr-2" />
                        Settings
                      </button>
                      <button className="w-full px-4 py-2 text-sm text-left text-primary hover:bg-secondary transition-colors">
                        Profile
                      </button>
                      <div className="border-t border-color mt-1 pt-1">
                        <button className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Category Quick Filter Bar */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {notificationCategories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setFilters({...filters, category: category.value})}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      filters.category === category.value
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'text-secondary hover:text-primary hover:bg-secondary'
                    }`}
                  >
                    <category.icon className={`w-4 h-4 ${category.color}`} />
                    <span>{category.name}</span>
                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                      filters.category === category.value
                        ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                        : 'bg-secondary text-secondary'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Date Filter */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-secondary" />
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="bg-transparent text-sm text-primary focus:outline-none"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Filter Bar */}
          <div className="px-6 pb-4">
            <FilterBar filters={filters} setFilters={setFilters} />
          </div>
        </header>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto min-h-0 p-6">
          {view === 'list' ? (
            <>
              {/* Stats Cards - Enhanced */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-card rounded-xl shadow-sm p-4 border border-color hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-secondary mb-1">Total Notifications</div>
                      <div className="text-2xl font-bold text-primary">{stats.total}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-secondary">
                    <span className="text-green-600 font-medium">↑ 12%</span> from last month
                  </div>
                </div>

                <div className="bg-card rounded-xl shadow-sm p-4 border border-color hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-secondary mb-1">Unread</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.unread}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <div className="relative">
                        <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        {stats.unread > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                            {stats.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-secondary">
                    {stats.unread > 0 ? 'Requires attention' : 'All read'}
                  </div>
                </div>

                <div className="bg-card rounded-xl shadow-sm p-4 border border-color hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-secondary mb-1">Starred</div>
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.starred}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-secondary">
                    Important notifications
                  </div>
                </div>

                <div className="bg-card rounded-xl shadow-sm p-4 border border-color hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-secondary mb-1">Cancelled</div>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-secondary">
                    Failed or cancelled
                  </div>
                </div>
              </div>

              {/* Notifications list */}
              <div className="bg-card rounded-xl shadow-sm p-6 border border-color">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-primary">Recent Notifications</h2>
                    <p className="text-sm text-secondary mt-1">Manage and track all customer communications</p>
                  </div>
                  <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                    <div className="text-sm text-secondary bg-secondary/50 px-3 py-1.5 rounded-lg">
                      Showing <span className="font-semibold text-primary">{filteredNotifications.length}</span> of {notifications.length}
                    </div>
                    <button className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                      + New Notification
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-sm text-secondary">Loading notifications...</p>
                    <p className="text-xs text-secondary mt-1">Fetching from your notification service</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-secondary/30 rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 text-secondary" />
                    </div>
                    <h3 className="text-base font-medium text-primary mb-2">No notifications found</h3>
                    <p className="text-sm text-secondary mb-4">Try adjusting your filters or create a new notification</p>
                    <button className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                      Create First Notification
                    </button>
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