import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext'; // ADD THIS IMPORT
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
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  updatedAt: string;
  // REMOVED: notificationsReceived and lastActive if not in your backend
  // notificationsReceived: number;
  // lastActive: string;
}

const RecipientsPage: React.FC = () => {
  const { theme } = useTheme();
  const { token } = useAuth(); // ADD THIS - get token from auth context
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

  // API BASE URL - UPDATE THIS TO YOUR ACTUAL BACKEND URL
  const API_BASE_URL = 'http://localhost:3001';

  // Load recipients from REAL backend API
  useEffect(() => {
    loadRecipients();
  }, []);

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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // DEBUG: Check what's returned
    console.log('API Response:', data);
    console.log('Type of data:', typeof data);
    console.log('Is array?', Array.isArray(data));
    
    // Handle different response formats
    let recipientsArray: Recipient[] = [];
    
    if (Array.isArray(data)) {
      // Direct array response
      recipientsArray = data;
    } else if (data && Array.isArray(data.recipients)) {
      // Response with { recipients: [...] }
      recipientsArray = data.recipients;
    } else if (data && Array.isArray(data.data)) {
      // Response with { data: [...] }
      recipientsArray = data.data;
    } else if (data && typeof data === 'object') {
      // Single object response, wrap in array
      recipientsArray = [data];
    } else {
      // Empty or invalid response
      recipientsArray = [];
      console.warn('Unexpected response format:', data);
    }
    
    console.log('Processed recipients:', recipientsArray);
    setRecipients(recipientsArray);
    
  } catch (error) {
    console.error('Error loading recipients:', error);
    setMessage({ 
      type: 'error', 
      text: 'Failed to load recipients. Make sure backend is running.' 
    });
    setRecipients([]); // Set to empty array on error
  } finally {
    setLoading(false);
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
          phone: formData.phone || null, // Send null if empty
          status: formData.status
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add recipient');
      }

      await loadRecipients(); // Reload the list
      setShowAddModal(false);
      resetForm();
      setMessage({ type: 'success', text: 'Recipient added successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to add recipient' 
      });
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update recipient');
      }

      await loadRecipients(); // Reload the list
      setShowEditModal(false);
      resetForm();
      setMessage({ type: 'success', text: 'Recipient updated successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update recipient' 
      });
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete recipient');
      }

      await loadRecipients(); // Reload the list
      setShowDeleteModal(false);
      setSelectedRecipient(null);
      setMessage({ type: 'success', text: 'Recipient deleted successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to delete recipient' 
      });
    }
  };

  // Rest of your filtering and UI functions remain mostly the same...
  // Just remove the mockAPI references and notificationsReceived/lastActive fields

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

  // Update the table row to remove notificationsReceived and lastActive columns
  // Here's the updated table row structure:
  /*
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
        {recipient.phone || 'No phone'}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
      Created: {recipient.createdAt}
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
  */

  // In your table header, update to match:
  /*
  <tr>
    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Recipient</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Contact</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Created</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Status</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Actions</th>
  </tr>
  */

  return (
    <div className="h-screen flex overflow-hidden bg-primary">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="bg-card border-b border-color shrink-0 sticky top-0 z-20">
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y divide-color ${
  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
}`}>
  {filteredRecipients.map((recipient) => {
    // Add safety checks
    const safeName = recipient?.name || 'Unknown';
    const safeEmail = recipient?.email || 'No email';
    const safePhone = recipient?.phone || 'No phone';
    const safeStatus = recipient?.status || 'inactive';
    const safeId = recipient?.id || 'unknown';
    const safeCreatedAt = recipient?.createdAt ? new Date(recipient.createdAt).toLocaleDateString() : 'Unknown';
    
    return (
      <tr key={safeId} className="hover:bg-hover">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-primary">{safeName}</div>
              <div className="text-sm text-secondary">ID: {safeId.substring(0, 8)}...</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-primary">{safeEmail}</div>
          <div className="text-sm text-secondary flex items-center">
            <PhoneIcon className="h-3 w-3 mr-1" />
            {safePhone}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
          {safeCreatedAt}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(safeStatus)}`}>
            {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
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

      {/* Add/Edit modals remain similar but use the new API functions */}
      {/* ... keep your modal code as is, but they'll use handleAddRecipient, handleEditRecipient, etc. */}
    </div>
  );
};

export default RecipientsPage;