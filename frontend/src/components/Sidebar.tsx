import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BellIcon, HomeIcon, UserGroupIcon, DocumentTextIcon, 
  ArchiveBoxIcon, CogIcon, Bars3Icon, XMarkIcon, ArrowLeftOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile drawer state
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close sidebar automatically when navigating on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

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
      {/* 1. MOBILE HAMBURGER BUTTON - Visible only on mobile/tablet */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className={`p-2 rounded-lg shadow-lg ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border'
          }`}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* 2. MOBILE OVERLAY - Click to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 3. SIDEBAR ASIDE */}
      <aside className={`
        fixed lg:static top-0 left-0 h-screen z-50 transition-transform duration-300 ease-in-out flex-shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        w-64 flex flex-col 
        ${theme === 'dark' ? 'bg-gray-900 text-white border-r border-gray-800' : 'bg-white text-gray-900 border-r border-gray-200'}
      `}>
        
        {/* Logo Section with Close Button for Mobile */}
        <div className={`p-6 border-b flex items-center justify-between flex-shrink-0 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <Link to="/dashboard" className="flex items-center space-x-3 no-underline">
            <div className="p-2 bg-blue-600 rounded-lg"><BellIcon className="h-6 w-6 text-white" /></div>
            <span className="text-xl font-bold text-primary">CareHub</span>
          </Link>
          
          {/* Close button - Only visible on mobile */}
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-primary">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className={`w-full flex items-center space-x-3 p-3 rounded-lg no-underline transition-colors ${
                isActive(item.path) 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : (theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100')
              }`}>
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User profile section */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between p-2 rounded-xl bg-opacity-50">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-primary truncate text-sm leading-tight">{user?.name || 'User'}</p>
                <p className="text-[10px] text-secondary truncate uppercase tracking-wider font-bold">Admin Account</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
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