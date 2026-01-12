import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BellIcon, HomeIcon, UserGroupIcon, DocumentTextIcon, 
  ArchiveBoxIcon, CogIcon, Bars3Icon, XMarkIcon, ArrowLeftOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext'; // Import your auth hook

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();
  const { user, logout } = useAuth(); // Get user and logout function
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsCollapsed(false);
      else setIsCollapsed(true);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const menuItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/notifications', icon: BellIcon, label: 'Notifications' },
    { path: '/recipients', icon: UserGroupIcon, label: 'Recipients' },
    { path: '/templates', icon: DocumentTextIcon, label: 'Templates' },
    { path: '/archive', icon: ArchiveBoxIcon, label: 'Archive' },
    { path: '/settings', icon: CogIcon, label: 'Settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile menu button code remains same... */}

      <aside className={`fixed lg:static top-0 left-0 h-screen z-40 transition-transform duration-300 ease-in-out flex-shrink-0 ${
          isCollapsed && isMobile ? '-translate-x-full' : 'translate-x-0'
        } w-64 flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white border-r border-gray-800' : 'bg-white text-gray-900 border-r border-gray-200'}`}>
        
        {/* Logo Section */}
        <div className={`p-6 border-b flex-shrink-0 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <Link to="/dashboard" className="flex items-center space-x-3 no-underline">
            <div className="p-2 bg-blue-600 rounded-lg"><BellIcon className="h-6 w-6 text-white" /></div>
            <div>
              <span className="text-xl font-bold text-primary">Customer Care</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className={`w-full flex items-center space-x-3 p-3 rounded-lg no-underline ${
                isActive(item.path) ? 'bg-blue-600 text-white' : (theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100')
              }`}>
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Updated User profile with REAL AUTH DATA */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-primary truncate text-sm">{user?.name || 'User'}</p>
                <p className="text-xs text-secondary truncate">{user?.email || 'Logged in'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;