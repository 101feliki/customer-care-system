import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useTheme } from '../contexts/ThemeContext';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone: string;
  notificationsReceived: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

// Mock database simulation
const mockRecipientsDB: Recipient[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', phone: '+254 712 345 678', notificationsReceived: 24, lastActive: '2 hours ago', status: 'active', createdAt: '2024-01-15', updatedAt: '2024-01-20' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+254 723 456 789', notificationsReceived: 18, lastActive: '1 day ago', status: 'active', createdAt: '2024-01-16', updatedAt: '2024-01-19' },
  { id: '3', name: 'Mike Wilson', email: 'mike@example.com', phone: '+254 734 567 890', notificationsReceived: 32, lastActive: '3 days ago', status: 'inactive', createdAt: '2024-01-10', updatedAt: '2024-01-18' },
  { id: '4', name: 'Emma Davis', email: 'emma@example.com', phone: '+254 745 678 901', notificationsReceived: 15, lastActive: '1 hour ago', status: 'active', createdAt: '2024-01-17', updatedAt: '2024-01-20' },
  { id: '5', name: 'David Brown', email: 'david@example.com', phone: '+254 756 789 012', notificationsReceived: 8, lastActive: '1 week ago', status: 'blocked', createdAt: '2024-01-12', updatedAt: '2024-01-19' },
  { id: '6', name: 'Lisa Taylor', email: 'lisa@example.com', phone: '+254 767 890 123', notificationsReceived: 27, lastActive: '5 hours ago', status: 'active', createdAt: '2024-01-18', updatedAt: '2024-01-20' },
];

// Mock API calls
const mockAPI = {
  getRecipients: (): Promise<Recipient[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const recipients = JSON.parse(localStorage.getItem('recipients') || JSON.stringify(mockRecipientsDB));
        resolve(recipients);
      }, 300);
    });
  },
  
  saveRecipients: (recipients: Recipient[]): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        localStorage.setItem('recipients', JSON.stringify(recipients));
        resolve();
      }, 300);
    });
  },
  
  addRecipient: (recipient: Omit<Recipient, 'id' | 'createdAt' | 'updatedAt' | 'notificationsReceived' | 'lastActive'>): Promise<Recipient> => {
    return new Promise(resolve => {
      setTimeout(async () => {
        const recipients = await mockAPI.getRecipients();
        const newRecipient: Recipient = {
          ...recipient,
          id: String(Date.now()),
          notificationsReceived: 0,
          lastActive: 'Never',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
        recipients.push(newRecipient);
        await mockAPI.saveRecipients(recipients);
        resolve(newRecipient);
      }, 300);
    });
  },
  
  updateRecipient: (id: string, updates: Partial<Recipient>): Promise<Recipient> => {
    return new Promise(resolve => {
      setTimeout(async () => {
        const recipients = await mockAPI.getRecipients();
        const index = recipients.findIndex(r => r.id === id);
        if (index !== -1) {
          recipients[index] = {
            ...recipients[index],
            ...updates,
            updatedAt: new Date().toISOString().split('T')[0]
          };
          await mockAPI.saveRecipients(recipients);
          resolve(recipients[index]);
        }
        throw new Error('Recipient not found');
      }, 300);
    });
  },
  
  deleteRecipient: (id: string): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(async () => {
        const recipients = await mockAPI.getRecipients();
        const filtered = recipients.filter(r => r.id !== id);
        await mockAPI.saveRecipients(filtered);
        resolve();
      }, 300);
    });
  },
  
  updateLastActive: (id: string): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(async () => {
        const recipients = await mockAPI.getRecipients();
        const index = recipients.findIndex(r => r.id === id);
        if (index !== -1) {
          recipients[index].lastActive = 'Just now';
          recipients[index].notificationsReceived += 1;
          await mockAPI.saveRecipients(recipients);
        }
        resolve();
      }, 300);
    });
  }
};

const RecipientsPage: React.FC = () => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'inactive' | 'blocked'
  });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Load recipients from database
  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    setLoading(true);
    try {
      const data = await mockAPI.getRecipients();
      setRecipients(data);
    } catch (error) {
      console.error('Error loading recipients:', error);
      setMessage({ type: 'error', text: 'Failed to load recipients' });
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddRecipient = async () => {
    if (!formData.name || !formData.email) {
      setMessage({ type: 'error', text: 'Name and email are required' });
      return;
    }

    try {
      await mockAPI.addRecipient(formData);
      await loadRecipients();
      setShowAddModal(false);
      resetForm();
      setMessage({ type: 'success', text: 'Recipient added successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add recipient' });
    }
  };

  const handleEditRecipient = async () => {
    if (!selectedRecipient) return;

    try {
      await mockAPI.updateRecipient(selectedRecipient.id, formData);
      await loadRecipients();
      setShowEditModal(false);
      resetForm();
      setMessage({ type: 'success', text: 'Recipient updated successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update recipient' });
    }
  };

  const handleDeleteRecipient = async () => {
    if (!selectedRecipient) return;

    try {
      await mockAPI.deleteRecipient(selectedRecipient.id);
      await loadRecipients();
      setShowDeleteModal(false);
      setSelectedRecipient(null);
      setMessage({ type: 'success', text: 'Recipient deleted successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete recipient' });
    }
  };

  const handleEditClick = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setFormData({
      name: recipient.name,
      email: recipient.email,
      phone: recipient.phone,
      status: recipient.status
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: 'active'
    });
    setSelectedRecipient(null);
  };

  const exportRecipients = () => {
    const dataStr = JSON.stringify(recipients, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recipients.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export function for Templates page to access recipients
  const getActiveRecipients = () => {
    return recipients.filter(r => r.status === 'active');
  };

  // Expose to window for Templates page access (in real app, use context/state management)
  if (typeof window !== 'undefined') {
    (window as any).getRecipientsForTemplates = getActiveRecipients;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-primary">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="bg-card border-b border-color flex-shrink-0 sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">Recipients</h1>
                <p className="text-secondary">Manage notification recipients and their preferences</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeSwitcher />
                
                <div className="flex space-x-2">
                  <button 
                    onClick={exportRecipients}
                    className="px-4 py-2 border border-color rounded-lg hover:bg-hover text-primary flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Export
                  </button>
                  <button 
                    onClick={() => {
                      resetForm();
                      setShowAddModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Recipient
                  </button>
                </div>
              </div>
            </div>
          </div>
          
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

        <main className="flex-1 overflow-y-auto min-h-0 p-6">
          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 mr-2" />
              ) : (
                <XCircleIcon className="h-5 w-5 mr-2" />
              )}
              {message.text}
            </div>
          )}

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
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-secondary">Loading recipients...</p>
              </div>
            ) : (
              <>
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
                              <button 
                                onClick={() => handleEditClick(recipient)}
                                className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                                title="Edit recipient"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(recipient)}
                                className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                                title="Delete recipient"
                              >
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
              </>
            )}
          </div>
        </main>
      </div>

      {/* Add Recipient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">Add New Recipient</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter recipient name"
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email address"
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-color rounded-lg hover:bg-hover text-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRecipient}
                disabled={!formData.name || !formData.email}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Recipient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Recipient Modal */}
      {showEditModal && selectedRecipient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">Edit Recipient</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              
              <div className="text-sm text-secondary">
                <p>Created: {selectedRecipient.createdAt}</p>
                <p>Last Updated: {selectedRecipient.updatedAt}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-color rounded-lg hover:bg-hover text-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleEditRecipient}
                disabled={!formData.name || !formData.email}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Recipient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRecipient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Delete Recipient</h3>
              <p className="text-secondary text-center mb-4">
                Are you sure you want to delete <strong>{selectedRecipient.name}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedRecipient(null);
                  }}
                  className="px-4 py-2 border border-color rounded-lg hover:bg-hover text-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRecipient}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Recipient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the function to access recipients from Templates page
export const getActiveRecipients = (): Recipient[] => {
  const recipients = JSON.parse(localStorage.getItem('recipients') || '[]');
  return recipients.filter((r: Recipient) => r.status === 'active');
};

export default RecipientsPage;