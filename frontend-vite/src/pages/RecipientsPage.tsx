import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
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
  XMarkIcon,
  PlayIcon,
  UserGroupIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  
} from '@heroicons/react/24/outline';

// UPDATED INTERFACES
interface Recipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

interface BulkList {
  id: string;
  name: string;
  description?: string;
  recipientCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const RecipientsPage: React.FC = () => {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [bulkLists, setBulkLists] = useState<BulkList[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'inactive' | 'blocked'
  });
  const [bulkListForm, setBulkListForm] = useState({
    name: '',
    description: '',
    recipientIds: [] as string[]
  });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showBulkListModal, setShowBulkListModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [csvData, setCsvData] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'recipients' | 'bulk-lists'>('recipients');

  // API CONFIGURATION
  const API_BASE_URL = 'http://localhost:3001';

  // Load data from REAL API
  useEffect(() => {
    if (token) {
      loadRecipients();
      if (activeTab === 'bulk-lists') {
        loadBulkLists();
      }
    }
  }, [token, activeTab]);

  const loadRecipients = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/recipients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch recipients`);
      }
      
      const data = await response.json();
      
      let recipientsArray: Recipient[] = [];
      
      if (Array.isArray(data)) {
        recipientsArray = data;
      } else if (data && data.recipients && Array.isArray(data.recipients)) {
        recipientsArray = data.recipients;
      } else if (data && data.data && Array.isArray(data.data)) {
        recipientsArray = data.data;
      }
      
      setRecipients(recipientsArray || []);
      
    } catch (error) {
      console.error('Error loading recipients:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load recipients. Make sure backend is running.' 
      });
      setRecipients([]);
    } finally {
      setLoading(false);
    }
  };

  const loadBulkLists = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bulk-lists`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch bulk lists');
      }
      
      const data = await response.json();
      setBulkLists(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading bulk lists:', error);
      setMessage({ type: 'error', text: 'Failed to load bulk lists' });
      setBulkLists([]);
    }
  };

  // Bulk List Functions
  const handleCreateBulkList = async () => {
    if (!bulkListForm.name.trim()) {
      setMessage({ type: 'error', text: 'Bulk list name is required' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/bulk-lists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: bulkListForm.name,
          description: bulkListForm.description,
          recipientIds: bulkListForm.recipientIds
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create bulk list');
      }

      await loadBulkLists();
      setShowBulkListModal(false);
      setBulkListForm({ name: '', description: '', recipientIds: [] });
      setMessage({ type: 'success', text: 'Bulk list created successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Create bulk list error:', error);
      setMessage({ type: 'error', text: 'Failed to create bulk list' });
    }
  };

  // UPDATED CSV Upload Function
  const handleUploadCSV = async () => {
    if (!csvData.trim()) {
      setMessage({ type: 'error', text: 'Please paste CSV data' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/recipients/upload-csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ csvData })
      });

      if (!response.ok) {
        throw new Error('Failed to upload CSV');
      }

      const result = await response.json();
      setShowUploadModal(false);
      setCsvData('');
      await loadRecipients();
      setMessage({ 
        type: 'success', 
        text: `Successfully imported ${result.imported || result.count || 0} recipients` 
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('CSV upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload CSV data. You might need to implement this endpoint in your backend.' });
    }
  };

  const handleAddRecipient = async () => {
    if (!formData.name || !formData.email) {
      setMessage({ type: 'error', text: 'Name and email are required' });
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/recipients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          status: formData.status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add recipient');
      }

      await loadRecipients();
      setShowAddModal(false);
      resetForm();
      setMessage({ type: 'success', text: 'Recipient added successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Add recipient error:', error);
      setMessage({ type: 'error', text: 'Failed to add recipient' });
    }
  };

  const handleEditRecipient = async () => {
    if (!selectedRecipient) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/recipients/${selectedRecipient.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          status: formData.status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update recipient');
      }

      await loadRecipients();
      setShowEditModal(false);
      resetForm();
      setMessage({ type: 'success', text: 'Recipient updated successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Edit recipient error:', error);
      setMessage({ type: 'error', text: 'Failed to update recipient' });
    }
  };

  const handleDeleteRecipient = async () => {
    if (!selectedRecipient) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/recipients/${selectedRecipient.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipient');
      }

      await loadRecipients();
      setShowDeleteModal(false);
      setSelectedRecipient(null);
      setMessage({ type: 'success', text: 'Recipient deleted successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Delete recipient error:', error);
      setMessage({ type: 'error', text: 'Failed to delete recipient' });
    }
  };

  const handleDeleteBulkList = async (bulkListId: string) => {
    if (!confirm('Are you sure you want to delete this bulk list?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/bulk-lists/${bulkListId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete bulk list');
      }

      await loadBulkLists();
      setMessage({ type: 'success', text: 'Bulk list deleted successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Delete bulk list error:', error);
      setMessage({ type: 'error', text: 'Failed to delete bulk list' });
    }
  };

  // Filtering and stats
  const filteredRecipients = recipients.filter(recipient => {
    if (!recipient) return false;
    
    if (search && 
        !recipient.name.toLowerCase().includes(search.toLowerCase()) && 
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
    bulkLists: bulkLists.length,
    bulkListRecipients: bulkLists.reduce((sum, list) => sum + list.recipientCount, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'inactive': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'blocked': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800';
    }
  };

  const handleEditClick = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setFormData({
      name: recipient.name,
      email: recipient.email,
      phone: recipient.phone || '',
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

  const exportBulkLists = () => {
    const dataStr = JSON.stringify(bulkLists, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bulk-lists.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Check if user is authenticated
  if (!token) {
    return (
      <div className="h-screen flex overflow-hidden bg-primary">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-primary mb-2">Authentication Required</h2>
            <p className="text-secondary">Please login to access recipients</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-primary">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="bg-card border-b border-color shrink-0 sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">Recipients</h1>
                <p className="text-secondary">Manage notification recipients and bulk lists</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeSwitcher />
                
                <div className="flex space-x-2">
                  {/* ADDED CSV UPLOAD BUTTON HERE */}
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <PlayIcon className="h-5 w-5 mr-2" />
                    Upload CSV
                  </button>
                  
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
          
          {/* Tabs - UPDATED WITH ACTIVE TAB STYLING */}
          <div className="px-6 py-2 border-t border-color">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('recipients')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'recipients'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                <UserIcon className="h-4 w-4 inline mr-2" />
                Individual Recipients
              </button>
              <button
                onClick={() => setActiveTab('bulk-lists')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'bulk-lists'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                <UserGroupIcon className="h-4 w-4 inline mr-2" />
                Bulk Lists
              </button>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-color bg-secondary">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Search ${activeTab === 'recipients' ? 'recipients by name or email' : 'bulk lists by name'}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  {activeTab === 'recipients' ? (
                    <UserIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  ) : (
                    <UserGroupIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  )}
                </div>
              </div>
              
              {activeTab === 'recipients' && (
                <div className="flex flex-wrap gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
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
              )}
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-card rounded-xl shadow-sm p-4 border border-color">
              <div className="text-sm text-secondary">Total Recipients</div>
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
            </div>
            <div className="bg-card rounded-xl shadow-sm p-4 border border-color">
              <div className="text-sm text-secondary">Active</div>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </div>
            <div className="bg-card rounded-xl shadow-sm p-4 border border-color">
              <div className="text-sm text-secondary">Bulk Lists</div>
              <div className="text-2xl font-bold text-blue-600">{stats.bulkLists}</div>
            </div>
            <div className="bg-card rounded-xl shadow-sm p-4 border border-color">
              <div className="text-sm text-secondary">List Recipients</div>
              <div className="text-2xl font-bold text-purple-600">{stats.bulkListRecipients}</div>
            </div>
          </div>

          {activeTab === 'recipients' ? (
            /* Recipients Table */
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Created</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y divide-color ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                      }`}>
                        {filteredRecipients.map((recipient) => {
                          const safeRecipient = {
                            id: recipient?.id || 'unknown',
                            name: recipient?.name || 'Unknown',
                            email: recipient?.email || 'No email',
                            phone: recipient?.phone || '',
                            status: recipient?.status || 'inactive',
                            createdAt: recipient?.createdAt || new Date().toISOString()
                          };
                          
                          return (
                            <tr key={safeRecipient.id} className="hover:bg-hover">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-primary">{safeRecipient.name}</div>
                                    <div className="text-sm text-secondary">ID: {safeRecipient.id.substring(0, 8)}...</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-primary">{safeRecipient.email}</div>
                                <div className="text-sm text-secondary flex items-center">
                                  <PhoneIcon className="h-3 w-3 mr-1" />
                                  {safeRecipient.phone || 'No phone'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                {new Date(safeRecipient.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(safeRecipient.status)}`}>
                                  {safeRecipient.status.charAt(0).toUpperCase() + safeRecipient.status.slice(1)}
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredRecipients.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-4xl mb-4">👤</div>
                      <h3 className="text-lg font-medium text-primary">No recipients found</h3>
                      <p className="text-secondary">Try adding a new recipient or upload a CSV file</p>
                      <div className="mt-4 flex justify-center space-x-3">
                        <button 
                          onClick={() => {
                            resetForm();
                            setShowAddModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Add Recipient
                        </button>
                        <button 
                          onClick={() => setShowUploadModal(true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Upload CSV
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* Bulk Lists Section */
            <div className="bg-card rounded-xl shadow-sm border border-color overflow-hidden">
              <div className="p-6 border-b border-color flex justify-between items-center">
                <h2 className="text-lg font-semibold text-primary">Bulk Lists</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setShowBulkListModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Bulk List
                  </button>
                  <button 
                    onClick={exportBulkLists}
                    className="px-4 py-2 border border-color rounded-lg hover:bg-hover text-primary flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Export Lists
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-secondary">Loading bulk lists...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {bulkLists.map((list) => (
                      <div key={list.id} className="border border-color rounded-xl p-5 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div>
                              <h3 className="font-bold text-primary">{list.name}</h3>
                              <p className="text-sm text-secondary">{list.description || 'No description'}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => handleDeleteBulkList(list.id)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <TrashIcon className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-secondary">Recipients:</span>
                            <span className="font-medium text-primary">{list.recipientCount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-secondary">Status:</span>
                            <span className={`font-medium ${list.isActive ? 'text-green-600' : 'text-red-600'}`}>
                              {list.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-secondary">Created:</span>
                            <span className="text-secondary">{new Date(list.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-color">
                          <button 
                            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            onClick={() => {
                              // Navigate to send to this bulk list
                              window.location.href = `/templates?bulkList=${list.id}`;
                            }}
                          >
                            Send to This List
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {bulkLists.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-4xl mb-4">📋</div>
                      <h3 className="text-lg font-medium text-primary">No bulk lists created yet</h3>
                      <p className="text-secondary">Create your first bulk list to send notifications to multiple recipients</p>
                      <button 
                        onClick={() => setShowBulkListModal(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Create Bulk List
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add Recipient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-color flex justify-between items-center bg-blue-600 dark:bg-blue-800 text-white">
              <h2 className="text-xl font-bold">Add New Recipient</h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }} 
                className="p-2 hover:bg-blue-700 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter recipient name"
                  className={`w-full px-4 py-2 rounded-lg border ${
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
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                  className={`w-full px-4 py-2 rounded-lg border ${
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
                  className={`w-full px-4 py-2 rounded-lg border ${
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
            
            <div className="px-6 py-4 border-t border-color flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRecipient}
                disabled={!formData.name || !formData.email}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Recipient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk List Creation Modal */}
      {showBulkListModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-color flex justify-between items-center bg-blue-600 dark:bg-blue-800 text-white">
              <h2 className="text-xl font-bold">Create Bulk List</h2>
              <button 
                onClick={() => setShowBulkListModal(false)} 
                className="p-2 hover:bg-blue-700 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  List Name *
                </label>
                <input
                  type="text"
                  value={bulkListForm.name}
                  onChange={(e) => setBulkListForm({...bulkListForm, name: e.target.value})}
                  placeholder="e.g., Newsletter Subscribers, VIP Customers"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={bulkListForm.description}
                  onChange={(e) => setBulkListForm({...bulkListForm, description: e.target.value})}
                  placeholder="Describe this list..."
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Select Recipients to Add to List
                </label>
                <div className="max-h-60 overflow-y-auto border border-color rounded-lg p-3">
                  {recipients.map((recipient) => (
                    <div key={recipient.id} className="flex items-center py-2 border-b border-color last:border-0">
                      <input
                        type="checkbox"
                        checked={bulkListForm.recipientIds.includes(recipient.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkListForm(prev => ({
                              ...prev,
                              recipientIds: [...prev.recipientIds, recipient.id]
                            }));
                          } else {
                            setBulkListForm(prev => ({
                              ...prev,
                              recipientIds: prev.recipientIds.filter(id => id !== recipient.id)
                            }));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label className="ml-3 flex-1 cursor-pointer">
                        <div className="font-medium text-primary">{recipient.name}</div>
                        <div className="text-sm text-secondary">{recipient.email}</div>
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-secondary mt-2">
                  Selected: {bulkListForm.recipientIds.length} recipient(s)
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-color flex justify-end space-x-3">
              <button
                onClick={() => setShowBulkListModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBulkList}
                disabled={!bulkListForm.name.trim() || bulkListForm.recipientIds.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Bulk List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATED CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-color flex justify-between items-center bg-green-600 dark:bg-green-800 text-white">
              <h2 className="text-xl font-bold">Upload Recipients CSV</h2>
              <button 
                onClick={() => setShowUploadModal(false)} 
                className="p-2 hover:bg-green-700 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Paste CSV Data
                </label>
                <textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="Paste CSV data with columns: name,email,phone,status (optional)
Example:
John Doe,john@example.com,+1234567890,active
Jane Smith,jane@example.com,,active
Bob Johnson,bob@example.com,+442071234567,inactive"
                  rows={10}
                  className={`w-full px-4 py-2 rounded-lg border font-mono text-sm ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">CSV Format Guidelines:</h3>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                  <li>• Each line should be a recipient</li>
                  <li>• Format: name,email,phone,status</li>
                  <li>• Email addresses must be unique</li>
                  <li>• Phone numbers are optional</li>
                  <li>• Status defaults to "active" if not specified</li>
                  <li>• Maximum 1000 rows per upload</li>
                </ul>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-color flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadCSV}
                disabled={!csvData.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Upload and Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit and Delete Modals */}
      {showEditModal && selectedRecipient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-color flex justify-between items-center bg-blue-600 dark:bg-blue-800 text-white">
              <h2 className="text-xl font-bold">Edit Recipient</h2>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }} 
                className="p-2 hover:bg-blue-700 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg border ${
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
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg border ${
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
                  className={`w-full px-4 py-2 rounded-lg border ${
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
            
            <div className="px-6 py-4 border-t border-color flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditRecipient}
                disabled={!formData.name || !formData.email}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Update Recipient
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedRecipient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Delete Recipient</h3>
              <p className="text-secondary text-center mb-6">
                Are you sure you want to delete <strong>{selectedRecipient.name}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedRecipient(null);
                  }}
                  className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRecipient}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

export default RecipientsPage;