import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useTheme } from '../contexts/ThemeContext';
import { UserIcon, EnvelopeIcon, PhoneIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone: string;
  notificationsReceived: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'blocked';
}

const RecipientsPage: React.FC = () => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock recipients data
  const recipients: Recipient[] = [
    { id: '1', name: 'John Smith', email: 'john@example.com', phone: '+1 (555) 123-4567', notificationsReceived: 24, lastActive: '2 hours ago', status: 'active' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1 (555) 987-6543', notificationsReceived: 18, lastActive: '1 day ago', status: 'active' },
    { id: '3', name: 'Mike Wilson', email: 'mike@example.com', phone: '+1 (555) 456-7890', notificationsReceived: 32, lastActive: '3 days ago', status: 'inactive' },
    { id: '4', name: 'Emma Davis', email: 'emma@example.com', phone: '+1 (555) 234-5678', notificationsReceived: 15, lastActive: '1 hour ago', status: 'active' },
    { id: '5', name: 'David Brown', email: 'david@example.com', phone: '+1 (555) 876-5432', notificationsReceived: 8, lastActive: '1 week ago', status: 'blocked' },
    { id: '6', name: 'Lisa Taylor', email: 'lisa@example.com', phone: '+1 (555) 345-6789', notificationsReceived: 27, lastActive: '5 hours ago', status: 'active' },
  ];

  const filteredRecipients = recipients.filter(recipient => {
    if (search && !recipient.name.toLowerCase().includes(search.toLowerCase()) && 
        !recipient.email.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && recipient.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const stats = {
    total: recipients.length,
    active: recipients.filter(r => r.status === 'active').length,
    inactive: recipients.filter(r => r.status === 'inactive').length,
    blocked: recipients.filter(r => r.status === 'blocked').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'inactive': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'blocked': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-primary flex">
      <Sidebar />
      
      <div className="flex-1 min-h-screen overflow-x-hidden">
        <header className="bg-secondary border-b border-color sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">Recipients</h1>
                <p className="text-secondary">Manage notification recipients and their preferences</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeSwitcher />
                
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Recipient
                </button>
              </div>
            </div>
          </div>
          
          {/* Filter Bar */}
          <div className="px-6 py-4 border-t border-color bg-secondary">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search recipients by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <UserIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl shadow-sm p-4 border border-color">
              <div className="text-sm text-secondary">Total Recipients</div>
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
            </div>
            <div className="bg-card rounded-xl shadow-sm p-4 border border-color">
              <div className="text-sm text-secondary">Active</div>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </div>
            <div className="bg-card rounded-xl shadow-sm p-4 border border-color">
              <div className="text-sm text-secondary">Inactive</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.inactive}</div>
            </div>
            <div className="bg-card rounded-xl shadow-sm p-4 border border-color">
              <div className="text-sm text-secondary">Blocked</div>
              <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
            </div>
          </div>

          {/* Recipients Table */}
          <div className="bg-card rounded-xl shadow-sm border border-color overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-color">
                <thead className={`${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Recipient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Notifications</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-color ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                  {filteredRecipients.map((recipient) => (
                    <tr key={recipient.id} className="hover:bg-hover">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-primary">{recipient.name}</div>
                            <div className="text-sm text-secondary">ID: {recipient.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary">{recipient.email}</div>
                        <div className="text-sm text-secondary flex items-center">
                          <PhoneIcon className="h-3 w-3 mr-1" />
                          {recipient.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary">{recipient.notificationsReceived}</div>
                        <div className="text-sm text-secondary">notifications</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {recipient.lastActive}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(recipient.status)}`}>
                          {recipient.status.charAt(0).toUpperCase() + recipient.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400">
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:hover:text-red-400">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredRecipients.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">👤</div>
                <h3 className="text-lg font-medium text-primary">No recipients found</h3>
                <p className="text-secondary">Try adjusting your search or add a new recipient</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RecipientsPage;