import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  BellIcon, 
  UserIcon, 
  CheckCircleIcon, 
  ShieldCheckIcon, 
  ChevronRightIcon,
  UsersIcon,
  UserPlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Types
interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'superadmin';
  isVerified: boolean;
  createdAt: string;
}

// API Service
const adminService = {
  async getUsers(): Promise<AdminUser[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      return data.users || data;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      return [];
    }
  },

  async createAdmin(data: { email: string; name: string; password: string; role: 'admin' | 'superadmin' }) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to create admin');
      return await response.json();
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  },

 // In your Settings page, update the adminService.createUser method
async createUser(data: { email: string; name: string; password: string; role: 'user' }) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/users', { // Changed from '/api/users'
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
},
  async updateUserRole(userId: string, role: 'user' | 'admin' | 'superadmin') {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });
      
      if (!response.ok) throw new Error('Failed to update role');
      return await response.json();
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  },

  async deleteUser(userId: string) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete user');
      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
};

const CreateUserModal = ({ 
  isOpen, 
  onClose, 
  onCreate,
  isAdminCreation = false 
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
  isAdminCreation?: boolean;
}) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: isAdminCreation ? 'admin' : 'user'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Valid email is required';
    }
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await onCreate(formData);
      setFormData({ email: '', name: '', password: '', role: isAdminCreation ? 'admin' : 'user' });
      onClose();
      toast.success(`${isAdminCreation ? 'Admin' : 'User'} created successfully!`);
    } catch (error: any) {
      toast.error(error.message || `Failed to create ${isAdminCreation ? 'admin' : 'user'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-color rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-primary flex items-center">
            <UserPlusIcon className="h-5 w-5 mr-2" />
            {isAdminCreation ? 'Create New Admin' : 'Create New User'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-hover rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => {
                setFormData({...formData, email: e.target.value});
                if (errors.email) setErrors({...errors, email: ''});
              }}
              className={`w-full bg-primary border ${
                errors.email 
                  ? 'border-red-500' 
                  : 'border-color'
              } rounded-xl p-3 text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                setFormData({...formData, name: e.target.value});
                if (errors.name) setErrors({...errors, name: ''});
              }}
              className={`w-full bg-primary border ${
                errors.name 
                  ? 'border-red-500' 
                  : 'border-color'
              } rounded-xl p-3 text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => {
                  setFormData({...formData, password: e.target.value});
                  if (errors.password) setErrors({...errors, password: ''});
                }}
                className={`w-full bg-primary border ${
                  errors.password 
                    ? 'border-red-500' 
                    : 'border-color'
                } rounded-xl p-3 text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10`}
                placeholder="••••••••"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
            <p className="text-xs text-secondary mt-1">Minimum 8 characters</p>
          </div>

          {isAdminCreation && (
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Role *
              </label>
              <div className="flex space-x-2">
                {(['admin', 'superadmin'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({...formData, role})}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                      formData.role === role
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-color text-secondary hover:bg-hover'
                    }`}
                  >
                    {role === 'superadmin' ? 'Super Admin' : 'Admin'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-color text-primary rounded-xl font-medium hover:bg-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors"
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                `Create ${isAdminCreation ? 'Admin' : 'User'}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    notificationFrequency: 'immediate'
  });

  const handleSaveSettings = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('appSettings', JSON.stringify({ notificationSettings }));
      setSaving(false);
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    }, 800);
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon }
  ];

  // Add admin tab if user is admin
  if (user?.role === 'admin' || user?.role === 'superadmin') {
    tabs.push({ id: 'admin', label: 'Admin', icon: ShieldCheckIcon });
  }

  // Fetch users when admin tab is active
  useEffect(() => {
    if (activeTab === 'admin') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersData = await adminService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data: any) => {
    try {
      await adminService.createUser(data);
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      throw error;
    }
  };

  const handleCreateAdmin = async (data: any) => {
    try {
      await adminService.createAdmin(data);
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateRole = async (userId: string, role: 'user' | 'admin' | 'superadmin') => {
    if (user?.role !== 'superadmin') {
      toast.error('Only super admins can change roles');
      return;
    }

    try {
      await adminService.updateUserRole(userId, role);
      toast.success('User role updated!');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (user?.role !== 'superadmin') {
      toast.error('Only super admins can delete users');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="h-screen flex overflow-hidden bg-primary">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="bg-card border-b border-color shrink-0 sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center text-sm text-secondary mb-1">
                  <ChevronRightIcon className="h-3 w-3 mx-2" />
                  <span className="text-blue-600 font-medium">Settings</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto min-h-0 p-6">
          {saveMessage && (
            <div className={`mb-6 p-4 rounded-xl flex items-center ${
              saveMessage.type === 'success' 
                ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              {saveMessage.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
              <nav className="space-y-2 lg:sticky lg:top-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
                      activeTab === tab.id 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-secondary hover:bg-hover'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
                
                <div className="pt-4 mt-6 border-t border-color">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-all"
                  >
                    {saving ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </nav>
            </div>

            <div className="lg:col-span-9 space-y-6 pb-12">
              {activeTab === 'notifications' && (
                <section className="bg-card border border-color rounded-2xl p-8">
                  <h3 className="text-lg font-bold text-primary mb-6 flex items-center">
                    <BellIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Communication Preferences
                  </h3>
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Email Alerts', sub: 'Receive weekly summaries' },
                      { key: 'pushNotifications', label: 'Desktop Push', sub: 'Real-time browser notifications' },
                      { key: 'soundEnabled', label: 'Auditory Feedback', sub: 'Play sounds on new alerts' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-color hover:border-blue-500/50 transition-colors">
                        <div>
                          <p className="font-semibold text-primary">{item.label}</p>
                          <p className="text-xs text-secondary">{item.sub}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={(notificationSettings as any)[item.key]} 
                            onChange={(e) => setNotificationSettings(p => ({...p, [item.key]: e.target.checked}))} 
                          />
                          <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {activeTab === 'profile' && (
                <section className="bg-card border border-color rounded-2xl p-8">
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="h-15 w-15 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                      {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-primary">{user?.name || 'User'}</h4>
                      <p className="text-secondary text-sm">{user?.email}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          user?.role === 'superadmin' 
                            ? 'bg-purple-500/10 text-purple-500' 
                            : user?.role === 'admin'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-secondary/10 text-secondary'
                        }`}>
                          <ShieldCheckIcon className="h-3 w-3 mr-1" />
                          {user?.role === 'superadmin' ? 'Super Admin' : 
                           user?.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'admin' && (
                <div className="space-y-6">
                  {/* Admin Header */}
                  <div className="bg-linear-to-r from-blue-700 to-blue-700 text-white p-4 rounded-2xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold flex items-center">
                          <ShieldCheckIcon className="h-6 w-6 mr-2" />
                          Admin Panel
                        </h3>
                        <p className="text-blue-100 mt-1">
                          Manage users and administrators
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                          {users.length} total users
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Create User Card */}
                    <div className="bg-card border border-color rounded-2xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
                            <UserPlusIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-primary">
                              Create User
                            </h4>
                            <p className="text-sm text-secondary">
                              Add new regular users
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setShowCreateUserModal(true)}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
                          title="Create New User"
                        >
                          <PlusIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-secondary text-sm">
                        Create new user accounts with basic access permissions.
                      </p>
                    </div>

                    {/* Create Admin Card (Super Admin Only) */}
                    {user?.role === 'superadmin' && (
                      <div className="bg-card border border-color rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="p-2 bg-green-500/10 rounded-lg mr-3">
                              <ShieldCheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-bold text-primary">
                                Create Admin
                              </h4>
                              <p className="text-sm text-secondary">
                                Add new administrators
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setShowCreateAdminModal(true)}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center transition-colors"
                            title="Create New Admin"
                          >
                            <PlusIcon className="h-5 w-5" />
                          </button>
                        </div>
                        <p className="text-secondary text-sm">
                          Create new admin or super admin accounts with elevated permissions.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Search and Filter */}
                  <div className="bg-card border border-color rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <h4 className="font-bold text-lg text-primary flex items-center">
                        <UsersIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                        User Management
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">
                          {filteredUsers.length} users
                        </span>
                      </h4>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                          <input 
                            type="text" 
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-primary border border-color rounded-xl text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                          />
                        </div>
                        
                        <div className="relative">
                          <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                          <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-primary border border-color rounded-xl text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                          >
                            <option value="all">All Roles</option>
                            <option value="user">Users</option>
                            <option value="admin">Admins</option>
                            <option value="superadmin">Super Admins</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {loading ? (
                      <div className="py-12 flex flex-col items-center justify-center">
                        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-secondary">Loading users...</p>
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="text-center py-12">
                        <UsersIcon className="h-12 w-12 text-secondary mx-auto mb-4" />
                        <p className="text-secondary">
                          {searchTerm || roleFilter !== 'all' 
                            ? 'No users match your search criteria'
                            : 'No users found'
                          }
                        </p>
                        {(searchTerm || roleFilter !== 'all') && (
                          <button 
                            onClick={() => {
                              setSearchTerm('');
                              setRoleFilter('all');
                            }}
                            className="mt-2 text-blue-600 hover:underline"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-color">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-hover text-left text-secondary text-sm">
                              <th className="p-4 font-medium border-b border-color">User</th>
                              <th className="p-4 font-medium border-b border-color">Role</th>
                              <th className="p-4 font-medium border-b border-color">Status</th>
                              <th className="p-4 font-medium border-b border-color">Joined</th>
                              <th className="p-4 font-medium border-b border-color">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((userItem) => (
                              <tr key={userItem.id} className="border-b border-color hover:bg-hover/30 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                                      {userItem.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-medium text-primary">{userItem.name}</p>
                                      <p className="text-sm text-secondary">{userItem.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    userItem.role === 'superadmin' 
                                      ? 'bg-purple-500/10 text-purple-500' 
                                      : userItem.role === 'admin'
                                        ? 'bg-blue-500/10 text-blue-500'
                                        : 'bg-secondary/10 text-secondary'
                                  }`}>
                                    {userItem.role === 'superadmin' ? 'Super Admin' : 
                                     userItem.role === 'admin' ? 'Admin' : 'User'}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center">
                                    {userItem.isVerified ? (
                                      <div className="flex items-center text-green-500">
                                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                                        <span>Verified</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center text-yellow-500">
                                        <div className="h-5 w-5 rounded-full border-2 border-yellow-500 mr-2 flex items-center justify-center">
                                          <span className="text-xs">!</span>
                                        </div>
                                        <span>Pending</span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4 text-secondary text-sm">
                                  {formatDate(userItem.createdAt)}
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center space-x-2">
                                    {/* Change Role (Super Admin only, can't modify self) */}
                                    {user?.role === 'superadmin' && user?.id !== userItem.id && (
                                      <select
                                        value={userItem.role}
                                        onChange={(e) => handleUpdateRole(userItem.id, e.target.value as any)}
                                        className="bg-primary border border-color rounded-lg px-3 py-1.5 text-sm text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="superadmin">Super Admin</option>
                                      </select>
                                    )}

                                    {/* Delete User (Super Admin only, can't delete self) */}
                                    {user?.role === 'superadmin' && user?.id !== userItem.id && (
                                      <button
                                        onClick={() => handleDeleteUser(userItem.id)}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete User"
                                      >
                                        <TrashIcon className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Permissions Info */}
                  <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 p-4 rounded-xl">
                    <div className="flex items-start">
                      <ShieldCheckIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Admin Permissions Guide</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm">
                          <div>
                            <span className="font-semibold">All Admins:</span>
                            <ul className="list-disc list-inside ml-2 mt-1">
                              <li>View all users</li>
                              <li>Create new users</li>
                            </ul>
                          </div>
                          <div>
                            <span className="font-semibold">Super Admins Only:</span>
                            <ul className="list-disc list-inside ml-2 mt-1">
                              <li>Create new admins</li>
                              <li>Change user roles</li>
                              <li>Delete users</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onCreate={handleCreateUser}
        isAdminCreation={false}
      />

      <CreateUserModal
        isOpen={showCreateAdminModal}
        onClose={() => setShowCreateAdminModal(false)}
        onCreate={handleCreateAdmin}
        isAdminCreation={true}
      />
    </div>
  );
};

export default SettingsPage;