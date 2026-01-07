import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BellIcon,
  EnvelopeIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  CalendarIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useTheme();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/notifications', icon: BellIcon, label: 'Notifications' },
    { path: '/messages', icon: EnvelopeIcon, label: 'Messages' },
    { path: '/recipients', icon: UserGroupIcon, label: 'Recipients' },
    { path: '/templates', icon: DocumentTextIcon, label: 'Templates' },
    { path: '/archive', icon: ArchiveBoxIcon, label: 'Archive' },
    { path: '/analytics', icon: ChartBarIcon, label: 'Analytics' },
    { path: '/schedule', icon: CalendarIcon, label: 'Schedule' },
    { path: '/settings', icon: CogIcon, label: 'Settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg shadow-lg border ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}
      >
        {isCollapsed ? (
          <XMarkIcon className={`h-6 w-6 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`} />
        ) : (
          <Bars3Icon className={`h-6 w-6 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`} />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-screen z-40 transition-transform duration-300 ${
          isCollapsed ? '-translate-x-full' : 'translate-x-0'
        } w-64 flex-shrink-0 flex flex-col ${
          theme === 'dark' 
            ? 'bg-gray-900 text-white border-r border-gray-800' 
            : 'bg-white text-gray-900 border-r border-gray-200'
        }`}
      >
        {/* Logo */}
        <div className={`p-6 border-b ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <Link to="/dashboard" className="flex items-center space-x-3 no-underline">
            <div className="p-2 bg-blue-600 rounded-lg">
              <BellIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-primary">Customer Care</span>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Customer Care</p>
            </div>
          </Link>
        </div>

        {/* Menu items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors no-underline ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white' 
                  : `${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
              }`}
              onClick={() => window.innerWidth < 1024 && setIsCollapsed(true)}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User profile */}
        <div className={`p-4 border-t ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="font-semibold text-white">A</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-primary">Admin User</p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsCollapsed(false)}
        />
      )}
    </>
  );
};

export default Sidebar;